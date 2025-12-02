import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  coachesRouter,
  clientsRouter,
  journalRouter,
  emotionLogsRouter,
  copingStrategiesRouter,
  sessionsRouter,
} from "./routers/coaching";
import { aiInsightsRouter } from "./routers/aiInsights";
import { stripeRouter } from "./routers/stripe";
import { schedulingRouter } from "./routers/scheduling";
import { sessionTypesRouter } from "./routers/sessionTypes";
import { sessionPaymentsRouter } from "./routers/sessionPayments";
import { aiChatRouter } from "./routers/aiChat";
import { platformSettingsRouter } from "./routers/platformSettings";
import { socialProofRouter } from "./routers/socialProof";
import { aiFeedbackRouter } from "./routers/aiFeedback";
import { emailCaptureRouter } from "./routers/emailCapture";
import { abTestingRouter } from "./routers/abTesting";
import { chatRouter } from "./routers/chat";
import { analyticsRouter } from "./routers/analytics";
import { videoTestimonialsRouter } from "./routers/videoTestimonials";
import { identityRouter } from "./routers/identity";
import { adaptiveLearningRouter } from "./routers/adaptiveLearning";
import { autismRouter } from "./routers/autism";
import { paymentsRouter } from "./routers/payments";
import { healthRouter } from "./routers/health";
import { stressRouter } from "./routers/stress";
import { dailyOSRouter } from "./routers/dailyOS";
import { masterSystemsRouter } from "./routers/masterSystems";
import { aiCoachRouter } from "./routers/aiCoach";
import { gamificationRouter } from "./routers/gamification";
import { pushNotificationsRouter } from "./routers/pushNotifications";
import { cognitiveRouter } from "./routers/cognitive";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Coaching platform routers
  coaches: coachesRouter,
  clients: clientsRouter,
  journal: journalRouter,
  emotionLogs: emotionLogsRouter,
  copingStrategies: copingStrategiesRouter,
  aiInsights: aiInsightsRouter,
  sessions: sessionsRouter,
  stripe: stripeRouter,
  scheduling: schedulingRouter,
  sessionTypes: sessionTypesRouter,
  sessionPayments: sessionPaymentsRouter,
  aiChat: aiChatRouter,
  platformSettings: platformSettingsRouter,
  socialProof: socialProofRouter,
  aiFeedback: aiFeedbackRouter,
  emailCapture: emailCaptureRouter,
  abTesting: abTestingRouter,
  chat: chatRouter,
  analytics: analyticsRouter,
  videoTestimonials: videoTestimonialsRouter,
  identity: identityRouter,
  adaptiveLearning: adaptiveLearningRouter,
  autism: autismRouter,
  payments: paymentsRouter,
  health: healthRouter,
  stress: stressRouter,
  dailyOS: dailyOSRouter,
  masterSystems: masterSystemsRouter,
  aiCoach: aiCoachRouter,
  gamification: gamificationRouter,
  pushNotifications: pushNotificationsRouter,
  cognitive: cognitiveRouter,
});

export type AppRouter = typeof appRouter;
