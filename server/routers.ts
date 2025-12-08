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
import { habitsRouter } from "./routers/habits";
import { autismRouter } from "./routers/autism";
import { authRouter } from "./routers/auth-standalone";
import { migrateRouter } from "./routers/migrate";
import { frictionlessRouter } from "./routers/frictionless";
import { clientContextRouter } from "./routers/clientContext";
import { vapiRouter } from "./routers/vapi";
import { adminRouter } from "./routers/admin";
import { debugRouter } from "./routers/debug";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,

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
  habits: habitsRouter,
  autism: autismRouter,
  migrate: migrateRouter,
  frictionless: frictionlessRouter,
  clientContext: clientContextRouter,
  vapi: vapiRouter,
  admin: adminRouter,
  debug: debugRouter,
});

export type AppRouter = typeof appRouter;
