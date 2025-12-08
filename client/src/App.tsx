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
import AutismProgress from "./pages/AutismProgress";
import AutismDailyLog from "./pages/AutismDailyLog";
import Login from "./pages/Login";
import CoachingSession from "./pages/CoachingSession";
import CoachView from "./pages/CoachView";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSessions from "./pages/admin/Sessions";
import AdminSessionDetail from "./pages/admin/SessionDetail";
import AdminCrisisAlerts from "./pages/admin/CrisisAlerts";
import AdminAIResponses from "./pages/admin/AIResponses";
import AdminUsers from "./pages/admin/Users";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";
import { AdminLayout } from "./components/AdminLayout";
import Pricing from "./pages/Pricing";
import WellnessDashboard from "./pages/WellnessDashboard";
import ControlCenter from "./pages/admin/ControlCenter";
import Anxiety from "./pages/wellness/Anxiety";
import Depression from "./pages/wellness/Depression";
import SleepOptimization from "./pages/wellness/Sleep";
import Nutrition from "./pages/wellness/Nutrition";
import Exercise from "./pages/wellness/Exercise";
import Stress from "./pages/wellness/Stress";
import ADHD from "./pages/wellness/ADHD";
import OCD from "./pages/wellness/OCD";
import PTSD from "./pages/wellness/PTSD";
import Bipolar from "./pages/wellness/Bipolar";
import Longevity from "./pages/wellness/Longevity";
import Supplements from "./pages/wellness/Supplements";
import PainManagement from "./pages/wellness/PainManagement";
import Meditation from "./pages/wellness/Meditation";
import Gratitude from "./pages/wellness/Gratitude";
import Relationships from "./pages/wellness/Relationships";
import Career from "./pages/wellness/Career";
import Financial from "./pages/wellness/Financial";
import SocialConnection from "./pages/wellness/SocialConnection";
import Identity from "./pages/wellness/Identity";
import Confidence from "./pages/wellness/Confidence";
import Boundaries from "./pages/wellness/Boundaries";
import Spiritual from "./pages/wellness/Spiritual";
import Meaning from "./pages/wellness/Meaning";
import HabitTracking from "./pages/wellness/HabitTracking";
import Addiction from "./pages/wellness/Addiction";
import ScreenTime from "./pages/wellness/ScreenTime";
import Energy from "./pages/wellness/Energy";
import Hydration from "./pages/wellness/Hydration";
import Autism from "./pages/wellness/Autism";
import Emotions from "./pages/wellness/Emotions";
import Mindfulness from "./pages/wellness/Mindfulness";

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
      <Route path="/emotions" component={EmotionTracker} />
      <Route path="/insights" component={InsightsDashboard} />
      <Route path="/coach/dashboard" component={CoachDashboard} />
      <Route path="/autism" component={AutismDashboard} />
      <Route path="/autism/create-profile" component={CreateAutismProfile} />
      <Route path="/autism/progress/:id" component={AutismProgress} />
      <Route path="/autism/daily-log/:id" component={AutismDailyLog} />
      <Route path="/coaching-session" component={CoachingSession} />
      <Route path="/coach-view" component={CoachView} />
      <Route path="/admin/dashboard">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin/sessions">
        <AdminLayout><AdminSessions /></AdminLayout>
      </Route>
      <Route path="/admin/sessions/:id">
        <AdminLayout><AdminSessionDetail /></AdminLayout>
      </Route>
      <Route path="/admin/crisis">
        <AdminLayout><AdminCrisisAlerts /></AdminLayout>
      </Route>
      <Route path="/admin/ai-responses">
        <AdminLayout><AdminAIResponses /></AdminLayout>
      </Route>
      <Route path="/admin/users">
        <AdminLayout><AdminUsers /></AdminLayout>
      </Route>
      <Route path="/admin/analytics">
        <AdminLayout><AdminAnalytics /></AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout><AdminSettings /></AdminLayout>
      </Route>
      <Route path="/pricing" component={Pricing} />
      <Route path="/wellness" component={WellnessDashboard} />
      <Route path="/wellness/anxiety" component={Anxiety} />
      <Route path="/wellness/depression" component={Depression} />
      <Route path="/wellness/sleep" component={SleepOptimization} />
      <Route path="/wellness/nutrition" component={Nutrition} />
      <Route path="/wellness/exercise" component={Exercise} />
      <Route path="/wellness/stress" component={Stress} />
      <Route path="/wellness/adhd" component={ADHD} />
      <Route path="/wellness/ocd" component={OCD} />
      <Route path="/wellness/ptsd" component={PTSD} />
      <Route path="/wellness/bipolar" component={Bipolar} />
      <Route path="/wellness/longevity" component={Longevity} />
      <Route path="/wellness/supplements" component={Supplements} />
      <Route path="/wellness/pain" component={PainManagement} />
      <Route path="/wellness/meditation" component={Meditation} />
      <Route path="/wellness/gratitude" component={Gratitude} />
      <Route path="/wellness/relationships" component={Relationships} />
      <Route path="/wellness/career" component={Career} />
      <Route path="/wellness/financial" component={Financial} />
      <Route path="/wellness/social" component={SocialConnection} />
      <Route path="/wellness/identity" component={Identity} />
      <Route path="/wellness/confidence" component={Confidence} />
      <Route path="/wellness/boundaries" component={Boundaries} />
      <Route path="/wellness/spiritual" component={Spiritual} />
      <Route path="/wellness/meaning" component={Meaning} />
      <Route path="/wellness/habits" component={HabitTracking} />
      <Route path="/wellness/addiction" component={Addiction} />
      <Route path="/wellness/screen-time" component={ScreenTime} />
      <Route path="/wellness/energy" component={Energy} />
      <Route path="/wellness/hydration" component={Hydration} />
      <Route path="/wellness/autism" component={Autism} />
      <Route path="/wellness/emotions" component={Emotions} />
      <Route path="/wellness/mindfulness" component={Mindfulness} />
      <Route path="/admin/control-center">
        <AdminLayout><ControlCenter /></AdminLayout>
      </Route>
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
