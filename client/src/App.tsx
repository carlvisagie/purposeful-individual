import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
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
// import AutismProgress from "./pages/AutismProgress"; // Moved to backup
// import AutismDailyLog from "./pages/AutismDailyLog"; // Moved to backup
import Login from "./pages/Login";
import CoachView from "./pages/CoachView";
import Pricing from "./pages/Pricing";
import AIChat from "./pages/AIChat";
import WellnessDashboard from "./pages/WellnessDashboard";
// FOUNDATIONAL SYSTEMS (Required for AI and all modules)
// import ResearchDashboard from "./pages/ResearchDashboard"; // Truth Seekers 2.0 - temporarily disabled for MVP
// import HabitTracking from "./pages/wellness/HabitTracking"; // Moved to backup - Habit Formation Engine
// Truth Keepers already integrated in server/routers/truthKeepers.ts
// Crisis Detection already integrated in server/routers/aiChat.ts

// Wellness modules temporarily removed for MVP - will add back incrementally
// (31 modules backed up in .backup/wellness-modules/)

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path="/login" component={Login} />
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
      <Route path="/ai-chat" component={AIChat} />
      <Route path="/emotions" component={EmotionTracker} />
      <Route path="/insights" component={InsightsDashboard} />
      <Route path="/coach/dashboard" component={CoachDashboard} />
      <Route path="/autism" component={AutismDashboard} />
      <Route path="/autism/create-profile" component={CreateAutismProfile} />
      {/* <Route path="/autism/progress/:id" component={AutismProgress} /> */}
      {/* <Route path="/autism/daily-log/:id" component={AutismDailyLog} /> */}
      <Route path="/coach-view" component={CoachView} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/wellness" component={WellnessDashboard} />
      
      {/* FOUNDATIONAL ROUTES - Required for AI and all modules */}
      {/* <Route path="/research" component={ResearchDashboard} /> */} {/* Truth Seekers 2.0 - temporarily disabled */}
      {/* <Route path="/wellness/habits" component={HabitTracking} /> */} {/* Habit Formation - moved to backup */}
      
      {/* Other wellness module routes temporarily removed for MVP */}
      {/* Will add back incrementally after MVP is working */}
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
