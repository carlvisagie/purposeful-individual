/**
 * Debug Router
 * Temporary debugging endpoints
 */

import { router, publicProcedure } from "../_core/trpc";
import { db } from "../db-standalone";
import { sql } from "drizzle-orm";
import pg from "pg";

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

  testRawPg: publicProcedure
    .query(async () => {
      try {
        const client = new pg.Client({
          connectionString: process.env.DATABASE_URL,
        });
        
        await client.connect();
        
        const sessionToken = "test-raw-" + Date.now();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        console.log("Testing raw pg insert:", { sessionToken, expiresAt: expiresAt.toISOString() });

        const result = await client.query(`
          INSERT INTO anonymous_sessions (
            session_token, expires_at, ip_address, user_agent, referrer,
            conversation_data, extracted_data, media_files
          )
          VALUES (
            $1, $2, $3, $4, $5,
            '[]'::jsonb, '{}'::jsonb, '[]'::jsonb
          )
          RETURNING *
        `, [sessionToken, expiresAt.toISOString(), '127.0.0.1', 'Raw PG Test', 'https://test.com']);

        await client.end();

        return {
          success: true,
          session: result.rows[0],
        };
      } catch (error: any) {
        console.error("Full raw pg error:", error);
        return {
          success: false,
          error: error.message,
          stack: error.stack,
          detail: error.detail,
          hint: error.hint,
          code: error.code,
          position: error.position,
          where: error.where,
        };
      }
    }),
});
