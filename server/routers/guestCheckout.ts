/**
 * Guest Checkout Router
 * 
 * Allows users to book sessions without creating an account
 * Creates temporary guest records that can be upgraded to full accounts later
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { withErrorHandling, logError } from "../services/errorHandler";
import { validateEmail, validatePhoneNumber } from "../services/validation";
import { getDb } from "../db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const guestCheckoutSchema = z.object({
  sessionTypeId: z.number().positive(),
  scheduledDate: z.date(),
  clientName: z.string().min(1).max(255),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;

export const guestCheckoutRouter = router({
  /**
   * Create a guest checkout session
   * Returns a Stripe checkout URL
   */
  createCheckoutSession: publicProcedure
    .input(guestCheckoutSchema)
    .mutation(async ({ input }) => {
      // Validate email
      if (!validateEmail(input.clientEmail)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid email address",
        });
      }

      // Validate phone if provided
      if (input.clientPhone && !validatePhoneNumber(input.clientPhone)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid phone number",
        });
      }

      // Get session type details
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const sessionType = await withErrorHandling(
        "getSessionType",
        async () => {
          const { sessionTypes } = require("../drizzle/schema");
          const { eq } = require("drizzle-orm");
          const result = await db.select().from(sessionTypes).where(eq(sessionTypes.id, input.sessionTypeId)).limit(1);
          return result[0] || null;
        },
        null
      );

      if (!sessionType || !sessionType.stripePriceId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session type not found or not available for purchase",
        });
      }

      // Create Stripe checkout session
      const checkoutSession = await withErrorHandling(
        "stripe.checkout.sessions.create",
        async () => {
          return await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
              {
                price: sessionType.stripePriceId,
                quantity: 1,
              },
            ],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/checkout/success?sessionId={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
            customer_email: input.clientEmail,
            metadata: {
              sessionTypeId: input.sessionTypeId.toString(),
              clientName: input.clientName,
              clientEmail: input.clientEmail,
              clientPhone: input.clientPhone || "",
              scheduledDate: input.scheduledDate.toISOString(),
              notes: input.notes || "",
              isGuest: "true",
            },
          });
        },
        null
      );

      if (!checkoutSession || !checkoutSession.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }

      return {
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
      };
    }),

  /**
   * Verify guest checkout and create booking
   * Called from success page to ensure booking is created
   */
  verifyCheckout: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Retrieve Stripe session
      const session = await withErrorHandling(
        "stripe.checkout.sessions.retrieve",
        async () => {
          return await stripe.checkout.sessions.retrieve(input.sessionId);
        },
        null
      );

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Checkout session not found",
        });
      }

      if (session.payment_status !== "paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment not completed",
        });
      }

      // Extract metadata
      const metadata = session.metadata || {};
      const sessionTypeId = parseInt(metadata.sessionTypeId || "0");
      const clientName = metadata.clientName || "";
      const clientEmail = metadata.clientEmail || "";
      const scheduledDate = new Date(metadata.scheduledDate || "");

      if (!sessionTypeId || !clientName || !clientEmail) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid checkout session metadata",
        });
      }

      return {
        success: true,
        sessionTypeId,
        clientName,
        clientEmail,
        scheduledDate,
        paymentId: session.payment_intent,
      };
    }),

  /**
   * Get guest checkout status
   */
  getCheckoutStatus: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const session = await withErrorHandling(
        "stripe.checkout.sessions.retrieve",
        async () => {
          return await stripe.checkout.sessions.retrieve(input.sessionId);
        },
        null
      );

      if (!session) {
        return { status: "not_found" };
      }

      return {
        status: session.payment_status,
        customerId: session.customer,
        paymentIntent: session.payment_intent,
      };
    }),
});
