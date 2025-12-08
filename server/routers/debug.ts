/**
 * Debug Router
 * Temporary debugging endpoints
 */

import { router, publicProcedure } from "../_core/trpc";
import { db } from "../db-standalone";
import { sql } from "drizzle-orm";

export const debugRouter = router({
  testInsert: publicProcedure
    .query(async () => {
      try {
        const sessionToken = "test-" + Date.now();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        console.log("Testing insert with:", { sessionToken, expiresAt: expiresAt.toISOString() });

        const result = await db.execute(sql`
          INSERT INTO anonymous_sessions (
            session_token, expires_at, ip_address, user_agent, referrer,
            conversation_data, extracted_data, media_files
          )
          VALUES (
            ${sessionToken}::varchar, 
            ${expiresAt.toISOString()}::timestamp, 
            ${'127.0.0.1'}::varchar, 
            ${'Debug Test'}::text, 
            ${'https://debug.com'}::text,
            '[]'::jsonb, 
            '{}'::jsonb, 
            '[]'::jsonb
          )
          RETURNING *
        `);

        return {
          success: true,
          session: result.rows[0],
        };
      } catch (error: any) {
        console.error("Full error:", error);
        return {
          success: false,
          error: error.message,
          stack: error.stack,
          detail: error.detail,
          hint: error.hint,
          code: error.code,
        };
      }
    }),
});
