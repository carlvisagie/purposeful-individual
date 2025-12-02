import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "wouter";

/**
 * COGNITIVE PROTECTION HUB
 * 
 * Master Prompt TIER 1 Features:
 * - Mental Clarity Tracker
 * - Cognitive Load Monitor
 * - Energy Level Tracking
 * - Spiral Detection
 * - Decision Fatigue Eliminator
 */

export default function CognitiveHub() {
  const { data: stats } = trpc.cognitive.getStats.useQuery();
  const { data: spiralCheck } = trpc.cognitive.detectSpiral.useQuery();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Brain className="h-10 w-10 text-blue-500" />
          Cognitive Protection
        </h1>
        <p className="text-muted-foreground mt-2">
          Protect your mind, eliminate decision fatigue, detect spirals early
        </p>
      </div>

      {/* Spiral Alert */}
      {spiralCheck?.inSpiral && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Spiral Detected
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              You're in an overthinking loop. Follow this protocol NOW.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              {spiralCheck.protocol?.map((step: string, idx: number) => (
                <li key={idx} className="font-medium">{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mental Clarity</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgClarity || 0}/10</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cognitive Load</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgLoad || 0}/10</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgEnergy || 0}/10</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spirals This Week</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.spiralCount || 0}</div>
            <p className="text-xs text-muted-foreground">Detected automatically</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation */}
      {stats?.recommendation && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{stats.recommendation}</p>
          </CardContent>
        </Card>
      )}

      {/* Tools */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/cognitive/decision-helper">
          <Card className="cursor-pointer hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle>Decision Fatigue Eliminator</CardTitle>
              <CardDescription>
                Pre-made decision trees. No thinking required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Open Decision Helper
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cognitive/tracker">
          <Card className="cursor-pointer hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle>Mental State Tracker</CardTitle>
              <CardDescription>
                Log clarity, load, and energy throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Log Mental State
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
