import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  Moon,
  Sun,
  Zap,
  Calendar,
  Heart,
  CheckCircle2
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function BipolarTracking() {
  const [moodState, setMoodState] = useState("");
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [impulsivity, setImpulsivity] = useState(1);
  const [notes, setNotes] = useState("");

  // Self-learning integration
  const { trackInteraction, getRecommendations, effectiveness } = useModuleLearning('bipolar_tracking');

  // Habit formation integration
  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      toast.success("Stability habit created!");
      trackInteraction('habit_created', { type: 'bipolar_stability' });
    }
  });

  const logMoodMutation = trpc.wellness.logBipolarMood.useMutation({
    onSuccess: () => {
      toast.success("Mood logged - tracking your patterns");
      trackInteraction('mood_logged', { 
        state: moodState, 
        energy: energyLevel,
        sleep: sleepHours,
        impulsivity 
      });
      setMoodState("");
      setEnergyLevel(5);
      setSleepHours(7);
      setImpulsivity(1);
      setNotes("");
    }
  });

  const handleLogMood = () => {
    if (!moodState) {
      toast.error("Please select mood state");
      return;
    }

    logMoodMutation.mutate({
      moodState,
      energyLevel,
      sleepHours,
      impulsivity,
      notes,
      timestamp: Date.now()
    });
  };

  const handleCreateSleepHabit = () => {
    createHabitMutation.mutate({
      name: "Consistent Sleep Schedule",
      description: "Same bedtime & wake time every day (±30 min). Sleep disruption is #1 trigger for episodes.",
      frequency: "daily",
      category: "bipolar_stability",
      evidenceLevel: "A",
      researchBasis: "Sleep regularity prevents mood episodes in bipolar disorder (Harvey, 2008; Frank et al., 2005)"
    });
  };

  const handleCreateRoutineHabit = () => {
    createHabitMutation.mutate({
      name: "Daily Routine Anchor",
      description: "Eat meals at same times daily. Routine stabilizes circadian rhythms and mood.",
      frequency: "daily",
      category: "bipolar_stability",
      evidenceLevel: "A",
      researchBasis: "Social rhythm therapy reduces bipolar episodes (Frank et al., 2005)"
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-blue-600 rounded-lg flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Bipolar Mood Tracking</h1>
          <p className="text-muted-foreground">Evidence-based mood monitoring & episode prevention</p>
        </div>
      </div>

      {/* Critical Warning */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-red-900">Medical Monitoring Required</p>
              <p className="text-sm text-red-800">
                Bipolar disorder requires professional psychiatric care and often medication management. 
                This tool supports your treatment but does NOT replace medical supervision.
              </p>
              <p className="text-sm text-red-800 font-semibold">
                ⚠️ If experiencing severe mania, suicidal thoughts, or psychosis, contact your psychiatrist 
                or emergency services immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Learning Insights */}
      {effectiveness > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Your Mood Patterns</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              <p>Tracking effectiveness: {effectiveness}%</p>
              {getRecommendations().map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="track">Track Mood</TabsTrigger>
          <TabsTrigger value="warning">Warning Signs</TabsTrigger>
          <TabsTrigger value="habits">Stability Habits</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Track Mood */}
        <TabsContent value="track" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Daily Mood Check-In
              </CardTitle>
              <CardDescription>
                Track mood state, energy, sleep, and impulsivity to identify patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Mood State</Label>
                <Select value={moodState} onValueChange={setMoodState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mood state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="severe_depression">
                      <span className="flex items-center gap-2">
                        <Moon className="w-4 h-4" /> Severe Depression
                      </span>
                    </SelectItem>
                    <SelectItem value="moderate_depression">
                      <span className="flex items-center gap-2">
                        <Moon className="w-4 h-4" /> Moderate Depression
                      </span>
                    </SelectItem>
                    <SelectItem value="mild_depression">
                      <span className="flex items-center gap-2">
                        <Moon className="w-4 h-4" /> Mild Depression
                      </span>
                    </SelectItem>
                    <SelectItem value="euthymic">
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4" /> Stable/Balanced
                      </span>
                    </SelectItem>
                    <SelectItem value="hypomania">
                      <span className="flex items-center gap-2">
                        <Sun className="w-4 h-4" /> Hypomania (elevated but functional)
                      </span>
                    </SelectItem>
                    <SelectItem value="mania">
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Mania (significantly elevated)
                      </span>
                    </SelectItem>
                    <SelectItem value="mixed">Mixed Episode (depression + mania)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Energy Level (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant={energyLevel > 7 ? "destructive" : energyLevel < 4 ? "secondary" : "default"}>
                    {energyLevel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">1 = Exhausted, 10 = Racing/Hyperactive</p>
              </div>

              <div className="space-y-2">
                <Label>Sleep Last Night (hours)</Label>
                <Input
                  type="number"
                  min="0"
                  max="16"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                />
                {sleepHours < 6 && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Low sleep is a major trigger for mood episodes
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Impulsivity Level (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={impulsivity}
                    onChange={(e) => setImpulsivity(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant={impulsivity > 6 ? "destructive" : "default"}>
                    {impulsivity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  1 = Very controlled, 10 = Acting on every impulse
                </p>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Triggers, stressors, medication changes, life events..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleLogMood} 
                className="w-full"
                disabled={logMoodMutation.isPending}
              >
                {logMoodMutation.isPending ? "Logging..." : "Log Mood Check-In"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warning Signs */}
        <TabsContent value="warning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Early Warning Signs
              </CardTitle>
              <CardDescription>
                Recognize episode triggers before they escalate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mania Warning Signs */}
              <div className="p-4 border-2 border-yellow-300 bg-yellow-50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-900">Mania Warning Signs</h3>
                </div>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                  <li>• Sleeping less than 5 hours but feeling energized</li>
                  <li>• Racing thoughts, jumping between ideas</li>
                  <li>• Increased spending or risky decisions</li>
                  <li>• Talking much faster than usual</li>
                  <li>• Feeling invincible or grandiose</li>
                  <li>• Increased irritability or agitation</li>
                  <li>• Starting many projects, finishing none</li>
                </ul>
                <div className="pt-2 border-t border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-900">Action: Contact psychiatrist immediately</p>
                </div>
              </div>

              {/* Depression Warning Signs */}
              <div className="p-4 border-2 border-blue-300 bg-blue-50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Depression Warning Signs</h3>
                </div>
                <ul className="text-sm text-blue-800 space-y-1 ml-4">
                  <li>• Sleeping 10+ hours or insomnia</li>
                  <li>• Loss of interest in previously enjoyed activities</li>
                  <li>• Difficulty concentrating or making decisions</li>
                  <li>• Withdrawing from friends and family</li>
                  <li>• Feeling hopeless or worthless</li>
                  <li>• Changes in appetite (much more or less)</li>
                  <li>• Thoughts of death or suicide</li>
                </ul>
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-sm font-semibold text-blue-900">Action: Contact psychiatrist, increase support</p>
                </div>
              </div>

              {/* Common Triggers */}
              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold">Common Episode Triggers</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Sleep disruption</strong> (most common trigger)</li>
                  <li>• Medication non-compliance or changes</li>
                  <li>• Major life stress (positive or negative)</li>
                  <li>• Seasonal changes (especially spring/fall)</li>
                  <li>• Substance use (alcohol, drugs, caffeine)</li>
                  <li>• Relationship conflicts</li>
                  <li>• Disrupted daily routine</li>
                </ul>
                <p className="text-xs text-muted-foreground italic pt-2">
                  Research: Frank et al. (2005), Social rhythm disruption and bipolar episodes
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stability Habits */}
        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Build Mood Stability Habits
              </CardTitle>
              <CardDescription>
                Evidence-based routines to prevent episodes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Social Rhythm Therapy:</strong> Research shows that maintaining consistent daily 
                  routines (sleep, meals, activities) is one of the most effective ways to prevent bipolar 
                  episodes (Frank et al., 2005).
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Consistent Sleep Schedule</h3>
                  <Badge>Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Same bedtime & wake time every day (±30 minutes). Sleep disruption is the #1 trigger 
                  for both manic and depressive episodes.
                </p>
                <Button onClick={handleCreateSleepHabit} variant="outline" className="w-full">
                  Create Sleep Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Daily Routine Anchors</h3>
                  <Badge>Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Eat meals at the same times daily. Regular routines stabilize circadian rhythms and mood.
                </p>
                <Button onClick={handleCreateRoutineHabit} variant="outline" className="w-full">
                  Create Routine Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold">Other Key Habits</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Take medication at exact same time daily</li>
                  <li>• Avoid alcohol and recreational drugs</li>
                  <li>• Limit caffeine (especially after 2pm)</li>
                  <li>• Regular exercise (but not too close to bedtime)</li>
                  <li>• Daily mood tracking (this app!)</li>
                  <li>• Regular therapy appointments</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tracking */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Stability Progress
              </CardTitle>
              <CardDescription>
                Track your mood stability over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mood Awareness</span>
                  <span className="font-semibold">Building...</span>
                </div>
                <Progress value={40} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Routine Consistency</span>
                  <span className="font-semibold">Developing...</span>
                </div>
                <Progress value={35} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Episode Prevention</span>
                  <span className="font-semibold">Learning...</span>
                </div>
                <Progress value={25} />
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Stability is Possible</p>
                    <p className="text-sm text-green-800 mt-1">
                      With proper treatment, medication, and lifestyle management, many people with bipolar 
                      disorder achieve long-term stability. Daily tracking helps you understand your unique patterns.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
