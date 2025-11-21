import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import CorporateLanding from "./pages/CorporateLanding";
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

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={IndividualLanding} />
      <Route path="/individual-coaching" component={IndividualLanding} />
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
