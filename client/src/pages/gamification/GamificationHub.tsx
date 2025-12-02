import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Award, Star, Target, Medal, Crown } from "lucide-react";
import { useLocation } from "wouter";

/**
 * GAMIFICATION HUB
 * 
 * Motivation through game mechanics:
 * - Achievements and badges
 * - Points and levels
 * - Leaderboard
 * - Streaks and milestones
 */

export default function GamificationHub() {
  const [, navigate] = useLocation();

  const { data: achievements } = trpc.gamification.getAchievements.useQuery();
  const { data: stats } = trpc.gamification.getStats.useQuery();
  const { data: leaderboard } = trpc.gamification.getLeaderboard.useQuery({ limit: 10 });

  // Calculate level based on points
  const level = stats ? Math.floor(stats.totalPoints / 100) + 1 : 1;
  const pointsToNextLevel = stats ? ((level * 100) - stats.totalPoints) : 100;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Trophy className="h-10 w-10 text-yellow-500" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and compete with others
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{level}</div>
            <p className="text-xs text-muted-foreground">
              {pointsToNextLevel} pts to next level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalPoints || 0}</div>
            <p className="text-xs text-muted-foreground">
              Earned through achievements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.totalAchievements || 0}/{stats?.availableAchievements || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? Math.round((stats.totalAchievements / stats.availableAchievements) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rank</CardTitle>
            <Medal className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              #{leaderboard?.findIndex((u: any) => u.userId === stats?.totalPoints) + 1 || "?"}
            </div>
            <p className="text-xs text-muted-foreground">
              On the leaderboard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>Badges earned through your transformation journey</CardDescription>
        </CardHeader>
        <CardContent>
          {achievements && achievements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(achievements as any[]).map((achievement: any) => (
                <Card key={achievement.id} className="border-2 border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <CardTitle className="text-base">{achievement.title}</CardTitle>
                      </div>
                      <Badge variant="secondary">+{achievement.points}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Start completing actions to earn achievements!
              </p>
              <div className="flex gap-4 justify-center mt-4">
                <Button onClick={() => navigate("/health/log")}>Log Health</Button>
                <Button onClick={() => navigate("/stress")}>Try Stress Relief</Button>
                <Button onClick={() => navigate("/daily-os/morning")}>Morning Routine</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <CardDescription>Top performers in the community</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-3">
              {(leaderboard as any[]).map((user: any) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold ${
                      user.rank === 1 ? "text-yellow-500" :
                      user.rank === 2 ? "text-gray-400" :
                      user.rank === 3 ? "text-orange-600" :
                      "text-muted-foreground"
                    }`}>
                      #{user.rank}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.achievementCount} achievements
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{user.totalPoints}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No leaderboard data yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Health Logging:</span> 10 pts first log, 50 pts for 7-day streak, 200 pts for 30-day streak
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Stress Relief:</span> 10 pts first session, 50 pts for 10 sessions
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Daily Routines:</span> 10 pts first routine, 50 pts for 7-day streak
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Identity Work:</span> 20 pts first snapshot, 100 pts for 5 snapshots
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Milestones:</span> 10 pts to create, 50 pts to complete first, 250 pts for 5 completed
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
