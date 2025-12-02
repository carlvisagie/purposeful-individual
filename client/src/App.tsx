import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

import IndividualLanding from "./pages/IndividualLanding";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import NewClient from "./pages/NewClient";
import CoachSetup from "./pages/CoachSetup";
import ClientDetail from "./pages/ClientDetail";
import Individual from "./pages/Individual";
import BookSessionNew from "./pages/BookSessionNew";
import MySessions from "./pages/MySessions";
import CoachAvailability from "./pages/CoachAvailability";
import ManageSessionTypes from "./pages/ManageSessionTypes";
import AICoach from "./pages/AICoach";
import EmotionTracker from "./pages/EmotionTracker";
import InsightsDashboard from "./pages/InsightsDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import BookingConfirmation from "./pages/BookingConfirmation";
import AICoaching from "./pages/AICoaching";
import IntroSession from "./pages/IntroSession";
import AutismDashboard from "./pages/AutismDashboard";
import CreateAutismProfile from "./pages/CreateAutismProfile";
import PaymentSuccess from "./pages/PaymentSuccess";
import SessionRoom from "./pages/SessionRoom";
import TransformationDashboard from "./pages/transformation/TransformationDashboard";
import DailyCheckIn from "./pages/transformation/DailyCheckIn";
import HabitTracker from "./pages/transformation/HabitTracker";
import HealthDashboard from "./pages/health/HealthDashboard";
import HealthLogger from "./pages/health/HealthLogger";
import StressReliefHub from "./pages/stress/StressReliefHub";
import DailyOSDashboard from "./pages/dailyOS/DailyOSDashboard";
import MorningRoutine from "./pages/dailyOS/MorningRoutine";
import EveningReview from "./pages/dailyOS/EveningReview";
import MasterHub from "./pages/master/MasterHub";
import AICoachChat from "./pages/ai/AICoachChat";
import ProgressDashboard from "./pages/analytics/ProgressDashboard";
import GamificationHub from "./pages/gamification/GamificationHub";
import CognitiveHub from "./pages/cognitive/CognitiveHub";
import DecisionHelper from "./pages/cognitive/DecisionHelper";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={IndividualLanding} />
      <Route path="/individual-coaching" component={IndividualLanding} />
      <Route path="/intro" component={IntroSession} />
      <Route path="/ai-coaching" component={AICoaching} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/clients" component={Clients} />
      <Route path="/clients/new" component={NewClient} />
      <Route path="/clients/:id" component={ClientDetail} />
      <Route path="/coach/setup" component={CoachSetup} />
      <Route path="/book-session" component={BookSessionNew} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/my-sessions" component={MySessions} />
      <Route path="/coach/availability" component={CoachAvailability} />
      <Route path="/coach/session-types" component={ManageSessionTypes} />
      <Route path="/ai-coach" component={AICoach} />
      <Route path="/emotions" component={EmotionTracker} />
      <Route path="/insights" component={InsightsDashboard} />
      <Route path="/coach/dashboard" component={CoachDashboard} />
      <Route path="/autism" component={AutismDashboard} />
      <Route path="/autism/create-profile" component={CreateAutismProfile} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/session/:id" component={SessionRoom} />
      <Route path="/transformation/dashboard" component={TransformationDashboard} />
      <Route path="/transformation/check-in" component={DailyCheckIn} />
      <Route path="/transformation/habits" component={HabitTracker} />
      <Route path="/health/dashboard" component={HealthDashboard} />
      <Route path="/health/log" component={HealthLogger} />
      <Route path="/stress" component={StressReliefHub} />
      <Route path="/daily-os/dashboard" component={DailyOSDashboard} />
      <Route path="/daily-os/morning" component={MorningRoutine} />
      <Route path="/daily-os/evening" component={EveningReview} />
      <Route path="/master" component={MasterHub} />
      <Route path="/ai-coach" component={AICoachChat} />
      <Route path="/analytics" component={ProgressDashboard} />
      <Route path="/achievements" component={GamificationHub} />
      <Route path="/cognitive" component={CognitiveHub} />
      <Route path="/cognitive/decision-helper" component={DecisionHelper} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
