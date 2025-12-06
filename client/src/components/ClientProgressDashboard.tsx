import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Brain,
  Users,
  Dumbbell,
  Apple,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";

/**
 * Client Progress Dashboard
 * 
 * Tracks client progress across 6 life disciplines:
 * 1. Spiritual - Purpose, meaning, values alignment
 * 2. Mental/Emotional - Anxiety, depression, emotional regulation
 * 3. Relationship - Family, friends, romantic, professional
 * 4. Exercise - Physical activity, fitness goals
 * 5. Nutritional - Diet, eating habits, health
 * 6. Financial - Money management, debt, savings
 * 
 * Features:
 * - Real-time progress tracking
 * - Habit development monitoring
 * - Goal setting and achievement
 * - Trend analysis
 * - Intervention triggers
 */

interface DisciplineProgress {
  name: string;
  icon: React.ReactNode;
  score: number; // 0-100
  trend: "up" | "down" | "stable";
  lastUpdated: Date;
  goals: Goal[];
  habits: Habit[];
  notes: string;
}

interface Goal {
  id: string;
  description: string;
  targetDate: Date;
  progress: number; // 0-100
  status: "active" | "completed" | "abandoned";
}

interface Habit {
  id: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  streak: number;
  lastCompleted: Date | null;
  completionRate: number; // 0-100
}

interface ClientProgressDashboardProps {
  clientId: string;
  clientName: string;
}

export default function ClientProgressDashboard({
  clientId,
  clientName
}: ClientProgressDashboardProps) {
  const [disciplines, setDisciplines] = useState<DisciplineProgress[]>([
    {
      name: "Spiritual",
      icon: <Heart className="w-5 h-5" />,
      score: 65,
      trend: "up",
      lastUpdated: new Date(),
      goals: [
        {
          id: "sp1",
          description: "Define personal values and life purpose",
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          progress: 70,
          status: "active"
        }
      ],
      habits: [
        {
          id: "sh1",
          description: "Morning meditation (10 min)",
          frequency: "daily",
          streak: 12,
          lastCompleted: new Date(),
          completionRate: 85
        }
      ],
      notes: "Client showing increased clarity about life direction. Meditation practice is consistent."
    },
    {
      name: "Mental/Emotional",
      icon: <Brain className="w-5 h-5" />,
      score: 58,
      trend: "up",
      lastUpdated: new Date(),
      goals: [
        {
          id: "me1",
          description: "Reduce anxiety attacks to <1 per week",
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          progress: 45,
          status: "active"
        }
      ],
      habits: [
        {
          id: "mh1",
          description: "Journal emotions daily",
          frequency: "daily",
          streak: 8,
          lastCompleted: new Date(),
          completionRate: 75
        },
        {
          id: "mh2",
          description: "Practice breathing exercises when anxious",
          frequency: "daily",
          streak: 5,
          lastCompleted: new Date(),
          completionRate: 60
        }
      ],
      notes: "Anxiety frequency decreasing. Client using coping strategies more effectively."
    },
    {
      name: "Relationship",
      icon: <Users className="w-5 h-5" />,
      score: 72,
      trend: "stable",
      lastUpdated: new Date(),
      goals: [
        {
          id: "re1",
          description: "Improve communication with spouse",
          targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          progress: 60,
          status: "active"
        }
      ],
      habits: [
        {
          id: "rh1",
          description: "Weekly date night with spouse",
          frequency: "weekly",
          streak: 3,
          lastCompleted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          completionRate: 90
        }
      ],
      notes: "Relationship with spouse improving. Client reports better conflict resolution."
    },
    {
      name: "Exercise",
      icon: <Dumbbell className="w-5 h-5" />,
      score: 42,
      trend: "down",
      lastUpdated: new Date(),
      goals: [
        {
          id: "ex1",
          description: "Exercise 3x per week for 30 minutes",
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          progress: 30,
          status: "active"
        }
      ],
      habits: [
        {
          id: "eh1",
          description: "Morning walk (20 min)",
          frequency: "daily",
          streak: 0,
          lastCompleted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          completionRate: 35
        }
      ],
      notes: "CONCERN: Exercise routine has lapsed. Client cites lack of motivation. Need intervention."
    },
    {
      name: "Nutritional",
      icon: <Apple className="w-5 h-5" />,
      score: 55,
      trend: "stable",
      lastUpdated: new Date(),
      goals: [
        {
          id: "nu1",
          description: "Reduce sugar intake to <25g per day",
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          progress: 40,
          status: "active"
        }
      ],
      habits: [
        {
          id: "nh1",
          description: "Eat vegetables with every meal",
          frequency: "daily",
          streak: 6,
          lastCompleted: new Date(),
          completionRate: 70
        }
      ],
      notes: "Diet improving slowly. Client still struggles with emotional eating."
    },
    {
      name: "Financial",
      icon: <DollarSign className="w-5 h-5" />,
      score: 48,
      trend: "up",
      lastUpdated: new Date(),
      goals: [
        {
          id: "fi1",
          description: "Build $1000 emergency fund",
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          progress: 25,
          status: "active"
        }
      ],
      habits: [
        {
          id: "fh1",
          description: "Track all expenses daily",
          frequency: "daily",
          streak: 14,
          lastCompleted: new Date(),
          completionRate: 80
        }
      ],
      notes: "Financial awareness increasing. Client starting to save consistently."
    }
  ]);

  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineProgress | null>(null);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-green-600";
    if (score >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  const overallScore = Math.round(
    disciplines.reduce((sum, d) => sum + d.score, 0) / disciplines.length
  );

  const concernAreas = disciplines.filter(d => d.score < 50 || d.trend === "down");

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{clientName}</h2>
            <p className="text-sm text-muted-foreground">Overall Progress</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <p className="text-sm text-muted-foreground">out of 100</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Health</span>
            <span className={getScoreColor(overallScore)}>{overallScore}%</span>
          </div>
          <Progress value={overallScore} className={getProgressColor(overallScore)} />
        </div>

        {concernAreas.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-red-900 dark:text-red-100">
                Areas Needing Attention ({concernAreas.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {concernAreas.map((d, i) => (
                <Badge key={i} variant="destructive">{d.name}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 6 Disciplines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {disciplines.map((discipline, i) => (
          <Card
            key={i}
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setSelectedDiscipline(discipline)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {discipline.icon}
                <span className="font-semibold">{discipline.name}</span>
              </div>
              {getTrendIcon(discipline.trend)}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className={getScoreColor(discipline.score)}>{discipline.score}%</span>
              </div>
              <Progress value={discipline.score} className={getProgressColor(discipline.score)} />
            </div>

            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Goals:</span>
                <span>{discipline.goals.filter(g => g.status === "active").length} active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Habits:</span>
                <span>{discipline.habits.length} tracked</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed View Modal/Panel */}
      {selectedDiscipline && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {selectedDiscipline.icon}
              <div>
                <h3 className="text-xl font-bold">{selectedDiscipline.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Last updated: {selectedDiscipline.lastUpdated.toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setSelectedDiscipline(null)}>
              Close
            </Button>
          </div>

          <Tabs defaultValue="goals">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="habits">Habits</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="goals" className="space-y-3 mt-4">
              {selectedDiscipline.goals.map((goal) => (
                <Card key={goal.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{goal.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Target: {goal.targetDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant={goal.status === "completed" ? "default" : "secondary"}>
                      {goal.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} />
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="habits" className="space-y-3 mt-4">
              {selectedDiscipline.habits.map((habit) => (
                <Card key={habit.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{habit.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <Badge variant="outline">{habit.frequency}</Badge>
                        <span>🔥 {habit.streak} day streak</span>
                      </div>
                    </div>
                    {habit.lastCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Completion Rate</span>
                      <span>{habit.completionRate}%</span>
                    </div>
                    <Progress value={habit.completionRate} />
                  </div>
                  {habit.lastCompleted && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last completed: {habit.lastCompleted.toLocaleDateString()}
                    </p>
                  )}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card className="p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedDiscipline.notes}
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
