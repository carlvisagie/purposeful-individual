/**
 * Session payments router - Stripe integration for one-time session bookings
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { ENV } from "../_core/env";

// Lazy initialization - only create Stripe instance when needed
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!ENV.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    stripeInstance = new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2025-10-29.clover",
    });
  }
  return stripeInstance;
}

export const sessionPaymentsRouter = router({
  /**
   * Create Stripe checkout session for session booking
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        sessionTypeId: z.number(),
        sessionTypeName: z.string(),
        price: z.number(), // in cents
        duration: z.number(),
        scheduledDate: z.string(),
        notes: z.string().optional(),
        coachId: z.number(),
        clientId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Create Stripe checkout session
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: input.sessionTypeName,
                  description: `${input.duration}-minute coaching session on ${new Date(
                    input.scheduledDate
                  ).toLocaleDateString()}`,
                },
                unit_amount: input.price,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/book-session`,
          metadata: {
            type: "session_booking",
            sessionTypeId: input.sessionTypeId.toString(),
            coachId: input.coachId.toString(),
            clientId: input.clientId.toString(),
            scheduledDate: input.scheduledDate,
            duration: input.duration.toString(),
            notes: input.notes || "",
          },
        });

        return {
          checkoutUrl: session.url,
          sessionId: session.id,
        };
      } catch (error) {
        console.error("Stripe checkout session creation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment session",
        });
      }
    }),

  /**
   * Verify payment and create session booking
   */
  verifyPayment: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);

        if (session.payment_status !== "paid") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Payment not completed",
          });
        }

        // Payment verified - session booking will be created via webhook
        return {
          success: true,
          paymentIntentId: session.payment_intent as string,
        };
      } catch (error) {
        console.error("Payment verification failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify payment",
        });
      }
    }),
});
