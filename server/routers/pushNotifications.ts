import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";
import webpush from "web-push";

/**
 * PUSH NOTIFICATIONS ROUTER
 * 
 * Web push notifications for routine reminders and achievements
 * Uses Web Push API with VAPID keys
 */

// Generate VAPID keys once: webpush.generateVAPIDKeys()
// Store in environment variables for production
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDJo3YY9_dZfZvJbTQgZqmMjqQlQqCl-lNRQBPCQGdVc";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "UUxI4O8-FbRouAevSmBQ6o18hgE6J2xYR1Y-QbZGYeQ";

webpush.setVapidDetails(
  'mailto:coach@purposefullive.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export const pushNotificationsRouter = router({
  getPublicKey: protectedProcedure.query(() => {
    return { publicKey: VAPID_PUBLIC_KEY };
  }),

  subscribe: protectedProcedure
    .input(z.object({
      endpoint: z.string(),
      keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if subscription already exists
      const existing = await db.execute(
        sql`SELECT id FROM push_subscriptions 
            WHERE userId = ${ctx.user.id} AND endpoint = ${input.endpoint}`
      );

      if (existing.rows.length > 0) {
        return { success: true, message: "Already subscribed" };
      }

      // Save subscription
      await db.execute(
        sql`INSERT INTO push_subscriptions (userId, endpoint, p256dh, auth) 
            VALUES (${ctx.user.id}, ${input.endpoint}, ${input.keys.p256dh}, ${input.keys.auth})`
      );

      return { success: true, message: "Subscribed to push notifications" };
    }),

  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db.execute(
        sql`DELETE FROM push_subscriptions 
            WHERE userId = ${ctx.user.id} AND endpoint = ${input.endpoint}`
      );

      return { success: true, message: "Unsubscribed from push notifications" };
    }),

  sendNotification: protectedProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
      url: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get user's subscriptions
      const subscriptions = await db.execute(
        sql`SELECT * FROM push_subscriptions WHERE userId = ${ctx.user.id}`
      );

      if (subscriptions.rows.length === 0) {
        return { success: false, message: "No push subscriptions found" };
      }

      const payload = JSON.stringify({
        title: input.title,
        body: input.body,
        url: input.url || '/',
      });

      // Send to all user's subscriptions
      const results = await Promise.allSettled(
        subscriptions.rows.map(async (sub: any) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload
            );
            return { success: true };
          } catch (error: any) {
            // If subscription is invalid, delete it
            if (error.statusCode === 410) {
              await db.execute(
                sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`
              );
            }
            throw error;
          }
        })
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;

      return {
        success: true,
        message: `Sent to ${successCount}/${subscriptions.rows.length} devices`,
      };
    }),

  // Admin: Send to all users
  broadcastNotification: protectedProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
      url: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Only admin can broadcast
      if (ctx.user.role !== 'admin') {
        throw new Error("Only admins can broadcast notifications");
      }

      const subscriptions = await db.execute(
        sql`SELECT * FROM push_subscriptions`
      );

      const payload = JSON.stringify({
        title: input.title,
        body: input.body,
        url: input.url || '/',
      });

      const results = await Promise.allSettled(
        subscriptions.rows.map(async (sub: any) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload
            );
            return { success: true };
          } catch (error: any) {
            if (error.statusCode === 410) {
              await db.execute(
                sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`
              );
            }
            throw error;
          }
        })
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;

      return {
        success: true,
        message: `Broadcast to ${successCount}/${subscriptions.rows.length} devices`,
      };
    }),
});
