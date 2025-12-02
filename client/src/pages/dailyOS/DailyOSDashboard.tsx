import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sunrise, Sunset, Zap, Heart, Brain, TrendingUp, Flame } from "lucide-react";
import { useLocation } from "wouter";

/**
 * DAILY OPERATING SYSTEM DASHBOARD
 * 
 * Master Prompt Implementation:
 * - Morning Routine Protocol (Jocko Willink)
 * - Evening Review Protocol (Tim Ferriss)
 * - Impulse Control System (David Goggins)
 * - Recovery Tracking (Peter Attia)
 * - Dopamine Regulation (Andrew Huberman)
 * 
 * NO-DECISION MODE: System tells you exactly what to do next
 */

export default function DailyOSDashboard() {
  const [, navigate] = useLocation();

  const { data: morningStreak } = trpc.dailyOS.morning.getStreak.useQuery();
  const { data: eveningHistory } = trpc.dailyOS.evening.getHistory.useQuery({ limit: 7 });
  const { data: impulsePatterns } = trpc.dailyOS.impulse.getPatterns.useQuery();
  const { data: recoveryHistory } = trpc.dailyOS.recovery.getHistory.useQuery({ limit: 7 });
  const { data: dopaminePatterns } = trpc.dailyOS.dopamine.getPatterns.useQuery();

  const today = new Date().toISOString().split("T")[0];
  const currentHour = new Date().getHours();
  const isMorning = currentHour < 12;
  const isEvening = currentHour >= 18;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Daily Operating System</h1>
        <p className="text-muted-foreground mt-2">
          Evidence-based protocols for peak performance and discipline
        </p>
      </div>

      {/* Next Action (NO-DECISION MODE) */}
      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Next Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMorning ? (
            <div className="space-y-4">
              <p className="text-lg">Complete your morning routine to start the day strong.</p>
              <Button size="lg" onClick={() => navigate("/daily-os/morning")}>
                <Sunrise className="h-4 w-4 mr-2" />
                Start Morning Routine
              </Button>
            </div>
          ) : isEvening ? (
            <div className="space-y-4">
              <p className="text-lg">Reflect on today and plan tomorrow with your evening review.</p>
              <Button size="lg" onClick={() => navigate("/daily-os/evening")}>
                <Sunset className="h-4 w-4 mr-2" />
                Start Evening Review
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg">Track your progress and maintain discipline throughout the day.</p>
              <div className="flex gap-4">
                <Button onClick={() => navigate("/stress")}>Stress Relief</Button>
                <Button onClick={() => navigate("/health/log")}>Log Health</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Morning Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Morning Streak</CardTitle>
            <Sunrise className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{morningStreak?.streak || 0} days</div>
            <p className="text-xs text-muted-foreground">Consecutive 80%+ completion</p>
            {morningStreak && morningStreak.streak > 0 && (
              <Badge variant="secondary" className="mt-2">
                <Flame className="h-3 w-3 mr-1" />
                On fire!
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Evening Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evening Reviews</CardTitle>
            <Sunset className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eveningHistory?.length || 0}/7</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        {/* Impulse Control */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impulse Control</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {impulsePatterns && impulsePatterns.length > 0
                ? `${Math.round(((impulsePatterns[0] as any).resistedCount / (impulsePatterns[0] as any).count) * 100)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">Resistance rate</p>
          </CardContent>
        </Card>

        {/* Recovery */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recoveryHistory?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Sessions this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/daily-os/morning")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sunrise className="h-5 w-5" />
              Morning Routine
            </CardTitle>
            <CardDescription>Non-negotiable morning protocol</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Hydration (16oz water)</li>
              <li>✓ Movement (10min)</li>
              <li>✓ Meditation (5min)</li>
              <li>✓ Cold shower</li>
              <li>✓ Healthy breakfast</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/daily-os/evening")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sunset className="h-5 w-5" />
              Evening Review
            </CardTitle>
            <CardDescription>Daily reflection and planning</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Wins & losses</li>
              <li>✓ Lessons learned</li>
              <li>✓ Tomorrow's top 3</li>
              <li>✓ Gratitude</li>
              <li>✓ Identity alignment</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/daily-os/impulse")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Impulse Control
            </CardTitle>
            <CardDescription>Master urges and temptations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track triggers, delay mechanisms, and build resistance to impulsive behaviors.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/daily-os/recovery")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Recovery Tracking
            </CardTitle>
            <CardDescription>Optimize rest and restoration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Log rest days, active recovery, massage, sauna, ice baths, and naps.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Evidence-Based Principles */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Evidence-Based Foundations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex items-start gap-2">
            <Sunrise className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Morning Routine:</span> Jocko Willink (Discipline Equals Freedom)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sunset className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Evening Review:</span> Tim Ferriss (5-Minute Journal)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Impulse Control:</span> David Goggins (Mental Toughness)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Heart className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Recovery:</span> Peter Attia (Longevity Protocol)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
