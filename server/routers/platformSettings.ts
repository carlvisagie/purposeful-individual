import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { platformSettings } from "../../drizzle/schema-postgresql";

export const platformSettingsRouter = router({
  /**
   * Check if AI tier is enabled
   */
  isAITierEnabled: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return false;

    const [setting] = await db
      .select()
      .from(platformSettings)
      .limit(1);

    return setting?.aiCoachingEnabled === "true";
  }),

  /**
   * Toggle AI tier on/off
   */
  toggleAITier: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can toggle AI tier
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get or create the single platform settings record
      const [existing] = await db
        .select()
        .from(platformSettings)
        .limit(1);

      if (existing) {
        // Update existing setting
        await db
          .update(platformSettings)
          .set({
            aiCoachingEnabled: input.enabled ? "true" : "false",
          })
          .where(eq(platformSettings.id, existing.id));
      } else {
        // Create new setting (should only happen once)
        await db.insert(platformSettings).values({
          aiCoachingEnabled: input.enabled ? "true" : "false",
        } as any);
      }

      return { success: true, enabled: input.enabled };
    }),

  /**
   * Get all platform settings (admin only)
   */
  getAllSettings: protectedProcedure.query(async ({ ctx }) => {
    // Only admins can view all settings
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    if (!db) return null;

    const [settings] = await db
      .select()
      .from(platformSettings)
      .limit(1);

    return settings || null;
  }),
});
