import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as authDb from "../db-auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Use standalone session-based authentication instead of Manus OAuth
    const sessionToken = opts.req.cookies?.session;
    
    if (sessionToken) {
      const session = await authDb.getSessionByToken(sessionToken);
      
      if (session && session.expiresAt > new Date()) {
        user = await authDb.getUserById(session.userId);
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    console.error("[Auth] Error authenticating request:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
