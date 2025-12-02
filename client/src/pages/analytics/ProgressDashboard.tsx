import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Brain, User, Download } from "lucide-react";
import { downloadProgressReport } from "@/lib/pdfExport";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

/**
 * PROGRESS ANALYTICS DASHBOARD
 * 
 * Visual analytics for transformation tracking:
 * - Health trends (movement, sleep, nutrition)
 * - Stress reduction patterns
 * - Identity evolution
 * - Milestone progress
 */

export default function ProgressDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: healthHistory } = trpc.health.getHistory.useQuery({ limit: 30 });
  const { data: stressHistory } = trpc.stress.getHistory.useQuery({ limit: 30 });
  const { data: identityEvolution } = trpc.masterSystems.identity.getEvolution.useQuery();
  const { data: milestoneStats } = trpc.masterSystems.accountability.getStats.useQuery();

  // Transform health data for charts
  const healthChartData = healthHistory?.map((log: any) => ({
    date: new Date(log.logDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    movement: log.movementMinutes || 0,
    sleep: log.sleepHours || 0,
    water: log.waterIntake || 0,
  })) || [];

  // Transform stress data for charts
  const stressChartData = stressHistory?.map((session: any) => ({
    date: new Date(session.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    before: session.stressBefore,
    after: session.stressAfter,
    improvement: session.stressBefore - session.stressAfter,
  })) || [];

  // Transform identity data for charts
  const identityChartData = identityEvolution?.map((snap: any) => ({
    date: new Date(snap.snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    alignment: snap.alignmentScore,
  })) || [];

  // Calculate trends
  const avgHealthTrend = healthChartData.length > 0
    ? healthChartData.reduce((sum: number, d: any) => sum + d.movement, 0) / healthChartData.length
    : 0;

  const avgStressReduction = stressChartData.length > 0
    ? stressChartData.reduce((sum: number, d: any) => sum + d.improvement, 0) / stressChartData.length
    : 0;

  const avgIdentityAlignment = identityChartData.length > 0
    ? identityChartData.reduce((sum: number, d: any) => sum + d.alignment, 0) / identityChartData.length
    : 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold">Progress Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Visual insights into your transformation journey
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Movement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHealthTrend.toFixed(0)} min/day</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Stress Reduction</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {avgStressReduction > 0 ? (
                <TrendingDown className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-500" />
              )}
              {Math.abs(avgStressReduction).toFixed(1)} points
            </div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Identity Alignment</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgIdentityAlignment.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">Average score</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Trends */}
      {healthChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Health Trends</CardTitle>
            <CardDescription>Movement, sleep, and hydration over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={healthChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="movement" stroke="#8884d8" name="Movement (min)" />
                <Line type="monotone" dataKey="sleep" stroke="#82ca9d" name="Sleep (hrs)" />
                <Line type="monotone" dataKey="water" stroke="#ffc658" name="Water (oz)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Stress Reduction */}
      {stressChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stress Reduction Effectiveness</CardTitle>
            <CardDescription>Before/after stress levels and improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stressChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="before" fill="#ff6b6b" name="Stress Before" />
                <Bar dataKey="after" fill="#51cf66" name="Stress After" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Identity Evolution */}
      {identityChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Identity Evolution</CardTitle>
            <CardDescription>Alignment score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={identityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="alignment" stroke="#9b59b6" name="Alignment Score" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Milestone Progress */}
      {milestoneStats && (
        <Card>
          <CardHeader>
            <CardTitle>Milestone Progress</CardTitle>
            <CardDescription>Overall achievement tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Milestones</span>
                <span className="text-2xl font-bold">{milestoneStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-2xl font-bold text-green-500">{milestoneStats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-2xl font-bold text-blue-500">{milestoneStats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Progress</span>
                <span className="text-2xl font-bold">{milestoneStats.avgProgress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {healthChartData.length === 0 && stressChartData.length === 0 && identityChartData.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Start logging your health, stress, and identity data to see analytics here.
            </p>
            <div className="flex gap-4 justify-center mt-4">
              <Button onClick={() => navigate("/health/log")}>Log Health</Button>
              <Button onClick={() => navigate("/stress")}>Track Stress</Button>
              <Button onClick={() => navigate("/master")}>Set Identity</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
