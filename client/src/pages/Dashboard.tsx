import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  Target, 
  Brain, 
  TrendingUp, 
  Zap, 
  Heart,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Activity,
  Calendar,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: identityStatement } = trpc.masterSystems.identity.getCurrent.useQuery(undefined, { enabled: !!user });
  const { data: healthToday } = trpc.health.getToday.useQuery(undefined, { enabled: !!user });
  const { data: healthStats } = trpc.health.getStats.useQuery({ days: 7 }, { enabled: !!user });
  const { data: morningStreak } = trpc.dailyOS.morning.getStreak.useQuery(undefined, { enabled: !!user });
  const { data: stressStats } = trpc.stress.getStats.useQuery({ days: 7 }, { enabled: !!user });
  const { data: gamificationData } = trpc.gamification.getPoints.useQuery(undefined, { enabled: !!user });
  const { data: activeMilestones } = trpc.masterSystems.milestones.getActive.useQuery(undefined, { enabled: !!user });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = getLoginUrl()}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate identity alignment score (0-100)
  const identityAlignment = identityStatement ? 100 : 0; // Simplified - would be more complex in production
  
  // Determine next action based on current state
  const getNextAction = () => {
    if (!identityStatement) {
      return {
        title: "Build Your Identity Statement",
        description: "Foundation for all transformation. Takes 10 minutes.",
        link: "/identity/builder",
        icon: Target,
        priority: "critical"
      };
    }
    if (!healthToday) {
      return {
        title: "Log Today's Health",
        description: "Track movement, nutrition, sleep, and hydration.",
        link: "/health",
        icon: Heart,
        priority: "high"
      };
    }
    if (!morningStreak || morningStreak.current === 0) {
      return {
        title: "Complete Morning Routine",
        description: "5 non-negotiable items to start your day right.",
        link: "/daily-os/morning",
        icon: Zap,
        priority: "high"
      };
    }
    return {
      title: "Talk to AI Coach",
      description: "Get personalized guidance based on your current state.",
      link: "/ai-coach",
      icon: Brain,
      priority: "medium"
    };
  };

  const nextAction = getNextAction();
  const NextActionIcon = nextAction.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Welcome back, {user.name?.split(' ')[0] || 'Champion'}</h1>
            <p className="text-muted-foreground mt-2">
              {identityStatement 
                ? `You are ${identityStatement.statement}` 
                : "Let's build your identity foundation"}
            </p>
          </div>
          <Badge variant={nextAction.priority === "critical" ? "destructive" : "default"} className="text-lg px-4 py-2">
            <Sparkles className="mr-2 h-4 w-4" />
            Level {gamificationData?.level || 1}
          </Badge>
        </div>

        {/* NO-DECISION MODE: Next Action Card */}
        <Card className={`border-2 ${
          nextAction.priority === "critical" ? "border-red-500 bg-red-50 dark:bg-red-950" :
          nextAction.priority === "high" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950" :
          "border-blue-500 bg-blue-50 dark:bg-blue-950"
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <NextActionIcon className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl">Your Next Action</CardTitle>
                  <CardDescription className="text-base">
                    {nextAction.priority === "critical" && "⚠️ Critical - Do this first"}
                    {nextAction.priority === "high" && "🔥 High priority"}
                    {nextAction.priority === "medium" && "✨ Recommended"}
                  </CardDescription>
                </div>
              </div>
              <Link to={nextAction.link}>
                <Button size="lg" className="text-lg">
                  {nextAction.title}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{nextAction.description}</p>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Identity Alignment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Identity Alignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{identityAlignment}%</div>
              <Progress value={identityAlignment} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {identityAlignment === 100 ? "Strong foundation" : "Build your identity first"}
              </p>
            </CardContent>
          </Card>

          {/* Morning Routine Streak */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Morning Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{morningStreak?.current || 0}</div>
              <p className="text-xs text-muted-foreground">
                Best: {morningStreak?.longest || 0} days
              </p>
            </CardContent>
          </Card>

          {/* Health Score */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {healthStats?.averageScore || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                7-day average
              </p>
            </CardContent>
          </Card>

          {/* Total Points */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{gamificationData?.totalPoints || 0}</div>
              <p className="text-xs text-muted-foreground">
                {gamificationData?.badges || 0} badges earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Priority Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Today's Priorities
            </CardTitle>
            <CardDescription>
              Based on your identity and goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${healthToday ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Log health metrics</span>
              </div>
              {healthToday ? (
                <Badge variant="outline" className="text-green-600">Complete</Badge>
              ) : (
                <Link to="/health">
                  <Button size="sm" variant="outline">Do Now</Button>
                </Link>
              )}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${morningStreak?.current ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Complete morning routine</span>
              </div>
              {morningStreak?.current ? (
                <Badge variant="outline" className="text-green-600">Complete</Badge>
              ) : (
                <Link to="/daily-os/morning">
                  <Button size="sm" variant="outline">Do Now</Button>
                </Link>
              )}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span>Evening review (complete tonight)</span>
              </div>
              <Link to="/daily-os/evening">
                <Button size="sm" variant="outline">Preview</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/health">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-red-500" />
                  <CardTitle>Health Tracker</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Log movement, nutrition, sleep, hydration
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/stress-relief">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-blue-500" />
                  <CardTitle>Stress Relief</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Box breathing, grounding exercises
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/ai-coach">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                  <CardTitle>AI Coach</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get personalized guidance 24/7
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Active Milestones */}
        {activeMilestones && activeMilestones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Active Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeMilestones.map((milestone) => (
                <div key={milestone.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{milestone.title}</span>
                    <Badge>{milestone.category}</Badge>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Contradiction Alerts */}
        {identityStatement && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Identity Contradiction Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Before making any decision today, ask: <strong>"Would someone who {identityStatement.statement} do this?"</strong>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Book Session CTA */}
        <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Ready for Your Next Breakthrough?</CardTitle>
            <CardDescription className="text-white/80">
              Book a live coaching session to accelerate your transformation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/book-session">
              <Button size="lg" variant="secondary" className="text-lg">
                <Calendar className="mr-2 h-5 w-5" />
                Book Live Session
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
