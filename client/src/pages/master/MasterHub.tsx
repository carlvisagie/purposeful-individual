import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Target, Compass, TrendingUp, Award, Calendar } from "lucide-react";
import { useLocation } from "wouter";

/**
 * MASTER HUB
 * 
 * Central dashboard for advanced transformation systems:
 * - Identity Architecture (who you're becoming)
 * - Accountability & Milestones (what you're achieving)
 * - Long-term Trajectory (where you're going)
 */

export default function MasterHub() {
  const [, navigate] = useLocation();

  const { data: identityHistory } = trpc.masterSystems.identity.getHistory.useQuery({ limit: 5 });
  const { data: identityEvolution } = trpc.masterSystems.identity.getEvolution.useQuery();
  const { data: milestoneStats } = trpc.masterSystems.accountability.getStats.useQuery();
  const { data: milestones } = trpc.masterSystems.accountability.getMilestones.useQuery({ status: "in_progress" });
  const { data: vision } = trpc.masterSystems.trajectory.getVision.useQuery();
  const { data: alignment } = trpc.masterSystems.trajectory.getAlignment.useQuery();

  const latestIdentity = identityHistory?.[0] as any;
  const avgAlignment = identityEvolution && identityEvolution.length > 0
    ? (identityEvolution as any[]).reduce((sum, snap: any) => sum + snap.alignmentScore, 0) / identityEvolution.length
    : 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Master Systems</h1>
        <p className="text-muted-foreground mt-2">
          Advanced transformation architecture for long-term success
        </p>
      </div>

      {/* Overall Alignment Score */}
      {alignment && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Alignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-2">{alignment.overallAlignment}%</div>
            <div className="grid gap-2 md:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Identity Alignment:</span>{" "}
                <span className="font-medium">{alignment.identityAlignment}/10</span>
              </div>
              <div>
                <span className="text-muted-foreground">Milestone Completion:</span>{" "}
                <span className="font-medium">{alignment.milestoneCompletion}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Identity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Identity Snapshots</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{identityHistory?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg alignment: {avgAlignment.toFixed(1)}/10
            </p>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Milestones</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{milestoneStats?.inProgress || 0}</div>
            <p className="text-xs text-muted-foreground">
              {milestoneStats?.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        {/* Vision */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Life Vision</CardTitle>
            <Compass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vision ? "Set" : "Not Set"}</div>
            <p className="text-xs text-muted-foreground">
              {vision ? "Mission defined" : "Define your mission"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Systems Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Identity Architecture */}
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/master/identity")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Identity Architecture
            </CardTitle>
            <CardDescription>Who you're becoming</CardDescription>
          </CardHeader>
          <CardContent>
            {latestIdentity ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Current:</span>{" "}
                  <span className="font-medium">{latestIdentity.currentIdentity.substring(0, 50)}...</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Target:</span>{" "}
                  <span className="font-medium">{latestIdentity.targetIdentity.substring(0, 50)}...</span>
                </div>
                <Badge variant="secondary">
                  Alignment: {latestIdentity.alignmentScore}/10
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Track your identity evolution and detect contradictions between who you are and who you want to be.
              </p>
            )}
            <Button className="w-full mt-4">
              {latestIdentity ? "View Identity Map" : "Create First Snapshot"}
            </Button>
          </CardContent>
        </Card>

        {/* Accountability & Milestones */}
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/master/accountability")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Accountability & Milestones
            </CardTitle>
            <CardDescription>What you're achieving</CardDescription>
          </CardHeader>
          <CardContent>
            {milestones && milestones.length > 0 ? (
              <div className="space-y-3">
                {(milestones as any[]).slice(0, 2).map((milestone: any) => (
                  <div key={milestone.id} className="space-y-1">
                    <div className="text-sm font-medium">{milestone.title}</div>
                    <Progress value={milestone.progress} />
                    <div className="text-xs text-muted-foreground">
                      {milestone.progress}% complete
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Set milestones, track progress, and maintain accountability for your goals.
              </p>
            )}
            <Button className="w-full mt-4">
              {milestones && milestones.length > 0 ? "View All Milestones" : "Create First Milestone"}
            </Button>
          </CardContent>
        </Card>

        {/* Long-term Trajectory */}
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/master/trajectory")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5" />
              Long-term Trajectory
            </CardTitle>
            <CardDescription>Where you're going</CardDescription>
          </CardHeader>
          <CardContent>
            {vision ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Mission:</span>{" "}
                  <span className="font-medium">{(vision as any).mission.substring(0, 80)}...</span>
                </div>
                {(vision as any).oneYearVision && (
                  <Badge variant="secondary">1-Year Vision Set</Badge>
                )}
                {(vision as any).fiveYearVision && (
                  <Badge variant="secondary">5-Year Vision Set</Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Define your mission, core values, and long-term vision for 1, 5, and 10 years.
              </p>
            )}
            <Button className="w-full mt-4">
              {vision ? "View Vision Board" : "Define Your Mission"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Evidence-Based Principles */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Master Systems Principles</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Identity Architecture:</span> James Clear (Atomic Habits), Charles Duhigg (The Power of Habit)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Accountability:</span> Peter Drucker (Management by Objectives), Cal Newport (Deep Work)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Compass className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Long-term Trajectory:</span> Simon Sinek (Start With Why), Stephen Covey (7 Habits)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
