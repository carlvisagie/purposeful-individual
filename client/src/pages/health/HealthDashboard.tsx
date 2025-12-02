import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Activity, Droplet, Moon, TrendingUp, Flame, Heart, Brain } from "lucide-react";
import { useLocation } from "wouter";

/**
 * PHYSICAL HEALTH DASHBOARD
 * 
 * Evidence-based health tracking following:
 * - Matthew Walker (sleep optimization)
 * - Peter Attia (longevity, health optimization)
 * - Andrew Huberman (neuroscience, performance)
 * 
 * Tracks: Movement, nutrition, sleep, hydration, energy
 */

export default function HealthDashboard() {
  const [, navigate] = useLocation();
  const [days, setDays] = useState(30);

  const { data: stats, isLoading: statsLoading } = trpc.health.getStats.useQuery({ days });
  const { data: history, isLoading: historyLoading } = trpc.health.getHistory.useQuery({ days });
  const { data: today } = trpc.health.getToday.useQuery();

  if (statsLoading || historyLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading health data...</div>
        </div>
      </div>
    );
  }

  const hasDataToday = today !== null;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Physical Health</h1>
          <p className="text-muted-foreground mt-2">
            Evidence-based health optimization for peak performance
          </p>
        </div>
        <Button onClick={() => navigate("/health/log")} size="lg">
          {hasDataToday ? "Update Today's Log" : "Log Today"}
        </Button>
      </div>

      {/* Insights */}
      {stats && stats.insights.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Time Range Selector */}
      <Tabs value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
        <TabsList>
          <TabsTrigger value="7">7 Days</TabsTrigger>
          <TabsTrigger value="30">30 Days</TabsTrigger>
          <TabsTrigger value="90">90 Days</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Movement */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averages.steps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">avg steps/day</p>
            <div className="mt-2">
              <div className="text-sm font-medium">{stats?.averages.workoutMinutes} min</div>
              <p className="text-xs text-muted-foreground">avg workout/day</p>
            </div>
            {stats && stats.streaks.workout > 0 && (
              <Badge variant="secondary" className="mt-2">
                <Flame className="h-3 w-3 mr-1" />
                {stats.streaks.workout} day streak
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Hydration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hydration</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averages.waterIntakeOz} oz</div>
            <p className="text-xs text-muted-foreground">avg water/day</p>
            <div className="mt-2">
              <div className="text-sm">
                Target: <span className="font-medium">64+ oz</span>
              </div>
            </div>
            {stats && stats.streaks.hydration > 0 && (
              <Badge variant="secondary" className="mt-2">
                <Flame className="h-3 w-3 mr-1" />
                {stats.streaks.hydration} day streak
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sleep</CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? (stats.averages.sleepHours / 60).toFixed(1) : 0}h
            </div>
            <p className="text-xs text-muted-foreground">avg sleep/night</p>
            <div className="mt-2">
              <div className="text-sm font-medium">Quality: {stats?.averages.sleepQuality}/10</div>
            </div>
            {stats && stats.streaks.sleep > 0 && (
              <Badge variant="secondary" className="mt-2">
                <Flame className="h-3 w-3 mr-1" />
                {stats.streaks.sleep} day streak
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Energy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averages.energyLevel}/10</div>
            <p className="text-xs text-muted-foreground">avg energy level</p>
            <div className="mt-2">
              <div className="text-sm font-medium">
                Nutrition: {stats?.averages.nutritionQuality}/10
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <CardDescription>Your last {days} days of health tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <div className="space-y-4">
              {history.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(log.logDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 space-x-4">
                      {log.steps && <span>{log.steps.toLocaleString()} steps</span>}
                      {log.workoutMinutes && <span>{log.workoutMinutes}min workout</span>}
                      {log.waterIntakeOz && <span>{log.waterIntakeOz}oz water</span>}
                      {log.sleepHours && (
                        <span>{(log.sleepHours / 60).toFixed(1)}h sleep</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.energyLevel && (
                      <Badge variant="outline">Energy: {log.energyLevel}/10</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No health logs yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your health to see insights and progress
              </p>
              <Button onClick={() => navigate("/health/log")}>Log Your First Day</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence-Based Principles */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Evidence-Based Principles</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex items-start gap-2">
            <Moon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Sleep:</span> 7-9 hours per night (Matthew Walker)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Droplet className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Hydration:</span> 64+ oz daily (Andrew Huberman)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Movement:</span> 30+ minutes daily (Peter Attia)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
