import { Router } from "express";
import Stripe from "stripe";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { subscriptions, users, sessions, clients } from "../../drizzle/schema-postgresql";
import { eq } from "drizzle-orm";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

export const webhookRouter = Router();

/**
 * Stripe Webhook Handler
 * Handles subscription lifecycle events and sends email notifications
 */
webhookRouter.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  console.log("[Webhook] Received webhook request");
  console.log("[Webhook] Has signature:", !!sig);
  console.log("[Webhook] Signature value:", typeof sig === 'string' ? sig.substring(0, 50) + '...' : sig);
  console.log("[Webhook] Webhook secret configured:", !!ENV.stripeWebhookSecret);
  console.log("[Webhook] Webhook secret length:", ENV.stripeWebhookSecret?.length || 0);

  if (!sig) {
    console.error("[Webhook] Missing Stripe signature");
    return res.status(400).send("Missing signature");
  }

  if (!ENV.stripeWebhookSecret) {
    console.error("[Webhook] Webhook secret not configured!");
    return res.status(500).send("Webhook secret not configured");
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    console.log("[Webhook] About to verify signature with secret:", ENV.stripeWebhookSecret ? `${ENV.stripeWebhookSecret.substring(0, 10)}...` : 'NOT SET');
    console.log("[Webhook] req.body type:", typeof req.body);
    console.log("[Webhook] req.body is Buffer:", Buffer.isBuffer(req.body));
    
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
    console.log("[Webhook] Signature verification successful!");
  } catch (err) {
    console.error("[Webhook] Signature verification FAILED");
    console.error("[Webhook] Error:", err);
    console.error("[Webhook] Error message:", err instanceof Error ? err.message : 'Unknown error');
    console.error("[Webhook] Secret configured:", !!ENV.stripeWebhookSecret);
    console.error("[Webhook] Secret starts with:", ENV.stripeWebhookSecret ? ENV.stripeWebhookSecret.substring(0, 10) : 'N/A');
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  console.log(`[Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] Error processing event ${event.type}:`, error);
    res.status(500).send("Webhook processing failed");
  }
});

// Helper to map Stripe status to our schema
function mapStripeStatus(status: string): "active" | "cancelled" | "past_due" | "unpaid" {
  const statusMap: Record<string, "active" | "cancelled" | "past_due" | "unpaid"> = {
    "active": "active",
    "canceled": "cancelled",
    "cancelled": "cancelled",
    "past_due": "past_due",
    "unpaid": "unpaid",
    "trialing": "active",
    "incomplete": "unpaid",
    "incomplete_expired": "cancelled",
  };
  return statusMap[status] || "active";
}

/**
 * Handle successful checkout session
 * Creates subscription record and sends welcome email
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[Webhook] Processing checkout.session.completed");
  console.log("[Webhook] Session mode:", session.mode);
  console.log("[Webhook] Metadata:", session.metadata);

  const db = await getDb();
  if (!db) {
    console.error("[Webhook] Database not available");
    return;
  }

  const userId = session.metadata?.user_id;
  const customerEmail = session.customer_email || session.metadata?.customer_email;
  const customerName = session.metadata?.customer_name;

  if (!userId) {
    console.error("[Webhook] Missing user_id in metadata");
    return;
  }

  // Check if this is a one-time payment (coaching session booking) or subscription
  if (session.mode === 'payment') {
    // ONE-TIME PAYMENT: Create coaching session booking
    await handleSessionBooking(session, db, parseInt(userId));
    return;
  }

  // SUBSCRIPTION: Handle subscription creation
  const productId = session.metadata?.product_id;
  if (!productId) {
    console.error("[Webhook] Missing product_id for subscription");
    return;
  }

  // Get subscription ID from session
  const subscriptionId = session.subscription as string;

  if (!subscriptionId) {
    console.error("[Webhook] No subscription ID in checkout session");
    return;
  }

  // Fetch full subscription details
  const stripeSubscription: any = await stripe.subscriptions.retrieve(subscriptionId);

  // Create subscription record
  await db.insert(subscriptions).values({
    userId: parseInt(userId),
    productId: productId,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: session.customer as string,
    stripePriceId: stripeSubscription.items.data[0].price.id,
    status: mapStripeStatus(stripeSubscription.status),
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
  });

  console.log(`[Webhook] Created subscription record for user ${userId}`);
}

/**
 * Handle session booking from one-time payment
 * Creates coaching session record after successful payment
 */
async function handleSessionBooking(session: Stripe.Checkout.Session, db: any, userId: number) {
  console.log("[Webhook] Creating session booking for one-time payment");

  const sessionTypeId = session.metadata?.session_type_id;
  const scheduledDate = session.metadata?.scheduled_date;
  const notes = session.metadata?.notes;
  const sessionTypeName = session.metadata?.session_type_name;

  if (!sessionTypeId || !scheduledDate) {
    console.error("[Webhook] Missing session booking metadata");
    return;
  }

  const customerEmail = session.customer_email || session.metadata?.customer_email;
  
  // Get or create client record for this user (lookup by email)
  let clientRecord = customerEmail ? await db
    .select()
    .from(clients)
    .where(eq(clients.email, customerEmail))
    .limit(1) : [];

  let clientId: number;

  if (clientRecord.length === 0) {
    // Create client record
    const [newClient] = await db
      .insert(clients)
      .values({
        coachId: 1, // Default coach ID - adjust if needed
        name: session.metadata?.customer_name || "New Client",
        email: customerEmail || "",
        phone: "",
        status: "active",
      })
      .$returningId();
    clientId = newClient.id;
    console.log("[Webhook] Created new client record:", clientId);
  } else {
    clientId = clientRecord[0].id;
    console.log("[Webhook] Using existing client record:", clientId);
  }

  // Get session type details for duration and price
  const sessionTypeDetails = await db.query.sessionTypes.findFirst({
    where: (sessionTypes: any, { eq }: any) => eq(sessionTypes.id, parseInt(sessionTypeId)),
  });

  // Create session booking
  await db.insert(sessions).values({
    coachId: 1, // Default coach ID - adjust if needed
    clientId: clientId,
    sessionTypeId: parseInt(sessionTypeId),
    scheduledDate: new Date(scheduledDate),
    duration: sessionTypeDetails?.duration || 15,
    price: session.amount_total || 0,
    sessionType: sessionTypeName || "Breakthrough Discovery Session",
    notes: notes || "",
    status: "scheduled",
    paymentStatus: "paid",
    stripePaymentIntentId: session.payment_intent as string,
  });

  console.log("[Webhook] Session booking created successfully");
  console.log("[Webhook] Client ID:", clientId, "Session Type:", sessionTypeName, "Date:", scheduledDate);
}

/**
 * Handle successful payment
 * Updates subscription status
 */
async function handlePaymentSucceeded(invoice: any) {
  console.log("[Webhook] Processing invoice.payment_succeeded");

  const db = await getDb();
  if (!db) return;

  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // Update subscription status
  await db
    .update(subscriptions)
    .set({ status: "active" })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  console.log(`[Webhook] Payment confirmed for subscription ${subscriptionId}`);
}

/**
 * Handle failed payment
 * Updates subscription status to past_due
 */
async function handlePaymentFailed(invoice: any) {
  console.log("[Webhook] Processing invoice.payment_failed");

  const db = await getDb();
  if (!db) return;

  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // Update subscription status
  await db
    .update(subscriptions)
    .set({ status: "past_due" })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  console.log(`[Webhook] Payment failed for subscription ${subscriptionId}`);
}

/**
 * Handle subscription cancellation
 * Updates subscription status to cancelled
 */
async function handleSubscriptionCancelled(subscription: any) {
  console.log("[Webhook] Processing customer.subscription.deleted");

  const db = await getDb();
  if (!db) return;

  // Update subscription status
  await db
    .update(subscriptions)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Webhook] Subscription cancelled: ${subscription.id}`);
}

/**
 * Handle subscription updates
 * Updates local subscription record
 */
async function handleSubscriptionUpdated(subscription: any) {
  console.log("[Webhook] Processing customer.subscription.updated");

  const db = await getDb();
  if (!db) return;

  await db
    .update(subscriptions)
    .set({
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}
