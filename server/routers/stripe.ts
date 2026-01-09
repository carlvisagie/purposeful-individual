import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import Stripe from "stripe";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { subscriptions, sessionTypes } from "../../drizzle/schema-postgresql";
import { eq } from "drizzle-orm";
import { PRODUCTS, type ProductId } from "../products";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

export const stripeRouter = router({
  /**
   * Create Stripe checkout session for coaching session booking
   */
  createSessionCheckout: protectedProcedure
    .input(
      z.object({
        sessionTypeId: z.number(),
        scheduledDate: z.string(),
        notes: z.string().optional(),
        pricingModel: z.enum(['one-time', 'subscription']).default('one-time'), // Master Prompt: Primary = one-time
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get session type details
      const [sessionType] = await db
        .select()
        .from(sessionTypes)
        .where(eq(sessionTypes.id, input.sessionTypeId))
        .limit(1);

      if (!sessionType) {
        throw new Error("Session type not found");
      }

      // Determine which Stripe Price ID to use based on pricing model
      const priceId = input.pricingModel === 'one-time' 
        ? sessionType.oneTimePriceId 
        : sessionType.stripePriceId;

      if (!priceId) {
        throw new Error(`This session type is not available for ${input.pricingModel} purchase. Please contact support.`);
      }

      const origin = ctx.req.headers.origin || "http://localhost:3000";

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: input.pricingModel === 'one-time' ? 'payment' : 'subscription',
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
          session_type_id: sessionType.id.toString(),
          session_type_name: sessionType.name,
          scheduled_date: input.scheduledDate,
          notes: input.notes || "",
        },
        success_url: `${origin}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/book-session?payment=cancelled`,
        allow_promotion_codes: true,
      });

      return {
        url: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Create Stripe checkout session for subscription purchase
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        billingPeriod: z.enum(['monthly', 'yearly']).optional().default('monthly'),
        splitPayment: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = PRODUCTS[input.productId as ProductId];
      
      if (!product) {
        throw new Error("Product not found");
      }
      
      // Determine which price ID to use based on billing period and split payment option
      let priceId: string | undefined;
      
      if ('stripePriceIdMonthly' in product && 'stripePriceIdYearly' in product) {
        // AI products with monthly/yearly options
        if (input.billingPeriod === 'yearly') {
          priceId = input.splitPayment ? product.stripePriceIdYearlySplit : product.stripePriceIdYearly;
        } else {
          priceId = product.stripePriceIdMonthly;
        }
      }
      
      if (!priceId) {
        throw new Error("Product not available for purchase. Please contact sales.");
      }

      const origin = ctx.req.headers.origin || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
          product_id: product.id,
        },
        success_url: `${origin}/dashboard?payment=success`,
        cancel_url: `${origin}/dashboard?payment=cancelled`,
        allow_promotion_codes: true,
      });

      return {
        url: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Get user's active subscriptions
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const userSubs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id));

    return userSubs;
  }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify subscription belongs to user
      const sub = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, parseInt(input.subscriptionId)))
        .limit(1);

      if (sub.length === 0 || sub[0].userId !== ctx.user.id) {
        throw new Error("Subscription not found");
      }

      // Cancel in Stripe
      if (sub[0].stripeSubscriptionId) {
        await stripe.subscriptions.cancel(sub[0].stripeSubscriptionId);
      }

      // Update local record
      await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
        })
        .where(eq(subscriptions.id, parseInt(input.subscriptionId)));

      return { success: true };
    }),

  /**
   * Verify payment and create booking (fallback for webhook failures)
   * Called from success page to ensure booking is created even if webhook fails
   * PUBLIC: No auth required - session_id from Stripe is the authentication proof
   */
  verifyAndCreateBooking: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Retrieve the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      // Verify payment was successful
      if (session.payment_status !== 'paid') {
        throw new Error("Payment not completed");
      }

      // No user verification needed - session_id from Stripe is proof of payment
      // The customer might not be logged in after completing Stripe checkout

      // Extract metadata
      const metadata = session.metadata;
      if (!metadata) {
        throw new Error("Missing session metadata");
      }

      // Check if booking already exists (prevent duplicates)
      const { sessions: sessionsTable, clients: clientsTable } = await import('../../drizzle/schema');
      const existingBooking = await db
        .select()
        .from(sessionsTable)
        .where(eq(sessionsTable.stripeSessionId, input.sessionId))
        .limit(1);

      if (existingBooking.length > 0) {
        // Booking already exists, return it
        return {
          success: true,
          bookingId: existingBooking[0].id,
          alreadyExists: true,
        };
      }

      // Create or get client record
      // Note: Clients are linked to coaches, not users directly
      // We'll search by email to find existing client
      let clientId: number;
      const clientEmail = session.customer_email || metadata.customer_email;
      
      if (clientEmail) {
        const existingClient = await db
          .select()
          .from(clientsTable)
          .where(eq(clientsTable.email, clientEmail))
          .limit(1);

        if (existingClient.length > 0) {
          clientId = existingClient[0].id;
        } else {
          // Create new client
          const [newClient] = await db
            .insert(clientsTable)
            .values({
              coachId: 1, // Default coach ID (you)
              name: session.customer_details?.name || metadata.customer_name || 'Unknown',
              email: clientEmail,
              phone: null,
              status: 'active',
            });
          clientId = newClient.insertId;
        }
      } else {
        throw new Error("Client email is required");
      }

      // Get session type to determine duration
      const [sessionType] = await db
        .select()
        .from(sessionTypes)
        .where(eq(sessionTypes.id, parseInt(metadata.session_type_id)))
        .limit(1);

      // Create booking
      const [newSession] = await db
        .insert(sessionsTable)
        .values({
          clientId,
          coachId: 1, // Default coach ID (you)
          sessionTypeId: parseInt(metadata.session_type_id),
          scheduledDate: new Date(metadata.scheduled_date),
          duration: sessionType?.duration || 60, // Default to 60 minutes
          price: session.amount_total || 0, // in cents
          status: 'scheduled',
          notes: metadata.notes || null,
          paymentStatus: 'paid',
          stripePaymentIntentId: session.payment_intent as string || null,
          stripeSessionId: input.sessionId,
        });

      return {
        success: true,
        bookingId: newSession.insertId,
        alreadyExists: false,
      };
    }),

  /**
   * Get available products
   */
  getProducts: publicProcedure.query(() => {
    return Object.values(PRODUCTS);
  }),

  /**
   * Get AI coaching products only
   */
  getAIProducts: publicProcedure.query(() => {
    const { getAIProducts } = require('../products');
    return getAIProducts();
  }),

  /**
   * Get enterprise products only
   */
  getEnterpriseProducts: publicProcedure.query(() => {
    const { getEnterpriseProducts } = require('../products');
    return getEnterpriseProducts();
  }),
});
