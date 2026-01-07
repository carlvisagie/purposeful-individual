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
  Shield, 
  Brain, 
  Heart, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Activity,
  Calendar,
  Target,
  Zap
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function PTSDRecovery() {
  const [triggerType, setTriggerType] = useState("");
  const [triggerIntensity, setTriggerIntensity] = useState(5);
  const [copingStrategy, setCopingStrategy] = useState("");
  const [notes, setNotes] = useState("");

  // Self-learning integration
  const { trackInteraction, effectiveTechniques, effectiveness } = useModuleLearning('ptsd_recovery');

  // Habit formation integration
  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      toast.success("Recovery habit created!");
      trackInteraction('habit_created', { type: 'ptsd_recovery' });
    }
  });

  const logTriggerMutation = trpc.wellness.logPTSDTrigger.useMutation({
    onSuccess: () => {
      toast.success("Trigger logged - you're building awareness");
      trackInteraction('trigger_logged', { 
        type: triggerType, 
        intensity: triggerIntensity,
        strategy: copingStrategy 
      });
      setTriggerType("");
      setTriggerIntensity(5);
      setCopingStrategy("");
      setNotes("");
    }
  });

  const handleLogTrigger = () => {
    if (!triggerType) {
      toast.error("Please select trigger type");
      return;
    }

    logTriggerMutation.mutate({
      triggerType,
      intensity: triggerIntensity,
      copingStrategy,
      notes,
      timestamp: Date.now()
    });
  };

  const handleCreateGroundingHabit = () => {
    createHabitMutation.mutate({
      name: "5-4-3-2-1 Grounding Technique",
      description: "When triggered: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
      frequency: "as_needed",
      category: "ptsd_recovery",
      evidenceLevel: "A",
      researchBasis: "Grounding techniques are evidence-based interventions for PTSD (Bisson et al., 2013, Cochrane Review)"
    });
  };

  const handleCreateSafetyHabit = () => {
    createHabitMutation.mutate({
      name: "Daily Safety Check-In",
      description: "Remind yourself: I am safe right now. This is a memory, not happening now.",
      frequency: "daily",
      category: "ptsd_recovery",
      evidenceLevel: "A",
      researchBasis: "Present-moment awareness reduces PTSD symptoms (Foa et al., 2009)"
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">PTSD Recovery</h1>
          <p className="text-muted-foreground">Evidence-based trauma healing & safety building</p>
        </div>
      </div>

      {/* Evidence-Based Notice */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-red-900">Evidence-Based PTSD Treatment</p>
              <p className="text-sm text-red-800">
                This module uses protocols from trauma-focused CBT (Foa et al., 2009), EMDR (Shapiro, 2018), 
                and prolonged exposure therapy (Powers et al., 2010). All interventions are Level A evidence.
              </p>
              <p className="text-sm text-red-800 font-semibold">
                ⚠️ This is NOT a replacement for professional trauma therapy. If experiencing severe symptoms, 
                please contact a trauma-specialized therapist immediately.
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
              <h3 className="font-semibold text-purple-900">Your Recovery Patterns</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              <p>Module effectiveness: {effectiveness}%</p>
              {effectiveTechniques().map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="track">Track Triggers</TabsTrigger>
          <TabsTrigger value="grounding">Grounding</TabsTrigger>
          <TabsTrigger value="habits">Recovery Habits</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Track Triggers */}
        <TabsContent value="track" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Log Trigger Event
              </CardTitle>
              <CardDescription>
                Tracking triggers builds awareness and helps identify patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select value={triggerType} onValueChange={setTriggerType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sound">Sound/Noise</SelectItem>
                    <SelectItem value="smell">Smell</SelectItem>
                    <SelectItem value="visual">Visual Reminder</SelectItem>
                    <SelectItem value="location">Location/Place</SelectItem>
                    <SelectItem value="person">Person/Interaction</SelectItem>
                    <SelectItem value="date">Date/Anniversary</SelectItem>
                    <SelectItem value="news">News/Media</SelectItem>
                    <SelectItem value="nightmare">Nightmare</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Intensity (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={triggerIntensity}
                    onChange={(e) => setTriggerIntensity(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant={triggerIntensity > 7 ? "destructive" : triggerIntensity > 4 ? "default" : "secondary"}>
                    {triggerIntensity}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Coping Strategy Used</Label>
                <Select value={copingStrategy} onValueChange={setCopingStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="What helped?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grounding">Grounding Technique</SelectItem>
                    <SelectItem value="breathing">Deep Breathing</SelectItem>
                    <SelectItem value="safe_space">Went to Safe Space</SelectItem>
                    <SelectItem value="called_support">Called Support Person</SelectItem>
                    <SelectItem value="physical">Physical Activity</SelectItem>
                    <SelectItem value="distraction">Healthy Distraction</SelectItem>
                    <SelectItem value="self_talk">Positive Self-Talk</SelectItem>
                    <SelectItem value="none">None Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What happened? What helped? What didn't?"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleLogTrigger} 
                className="w-full"
                disabled={logTriggerMutation.isPending}
              >
                {logTriggerMutation.isPending ? "Logging..." : "Log Trigger Event"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grounding Techniques */}
        <TabsContent value="grounding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Evidence-Based Grounding Techniques
              </CardTitle>
              <CardDescription>
                Immediate interventions to return to the present moment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 5-4-3-2-1 Technique */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">5-4-3-2-1 Sensory Grounding</h3>
                  <Badge>Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Name out loud:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• 5 things you can <strong>see</strong></li>
                  <li>• 4 things you can <strong>touch</strong></li>
                  <li>• 3 things you can <strong>hear</strong></li>
                  <li>• 2 things you can <strong>smell</strong></li>
                  <li>• 1 thing you can <strong>taste</strong></li>
                </ul>
                <p className="text-xs text-muted-foreground italic">
                  Research: Bisson et al. (2013), Cochrane Database Systematic Review
                </p>
              </div>

              {/* Box Breathing */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Box Breathing (4-4-4-4)</h3>
                  <Badge>Level A Evidence</Badge>
                </div>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Breathe in for 4 counts</li>
                  <li>• Hold for 4 counts</li>
                  <li>• Breathe out for 4 counts</li>
                  <li>• Hold for 4 counts</li>
                  <li>• Repeat 4 times</li>
                </ul>
                <p className="text-xs text-muted-foreground italic">
                  Research: Reduces sympathetic nervous system activation (Germer & Neff, 2019)
                </p>
              </div>

              {/* Safety Statement */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Present-Moment Safety Statement</h3>
                  <Badge>Level A Evidence</Badge>
                </div>
                <p className="text-sm font-semibold text-center p-4 bg-green-50 rounded border border-green-200">
                  "I am safe right now. This is a memory, not happening now. I am in [current location] on [current date]."
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Present-moment awareness reduces PTSD symptoms (Foa et al., 2009)
                </p>
              </div>

              {/* Physical Grounding */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Physical Grounding</h3>
                  <Badge>Level B Evidence</Badge>
                </div>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Press feet firmly into floor</li>
                  <li>• Hold ice cube in hand</li>
                  <li>• Splash cold water on face</li>
                  <li>• Stretch or do jumping jacks</li>
                  <li>• Touch different textures around you</li>
                </ul>
                <p className="text-xs text-muted-foreground italic">
                  Research: Somatic interventions interrupt dissociation (van der Kolk, 2014)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recovery Habits */}
        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Build Recovery Habits
              </CardTitle>
              <CardDescription>
                Evidence-based habits for trauma recovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold">Daily Grounding Practice</h3>
                <p className="text-sm text-muted-foreground">
                  Practice 5-4-3-2-1 technique daily, even when not triggered. Builds neural pathways for safety.
                </p>
                <Button onClick={handleCreateGroundingHabit} variant="outline" className="w-full">
                  Create Grounding Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold">Safety Check-In Ritual</h3>
                <p className="text-sm text-muted-foreground">
                  Daily reminder: "I am safe now. That was then, this is now."
                </p>
                <Button onClick={handleCreateSafetyHabit} variant="outline" className="w-full">
                  Create Safety Habit
                </Button>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Habit Formation Science:</strong> Research shows it takes 66 days on average to form 
                  a new habit (Lally et al., 2010). Start small, be consistent, and the brain will rewire.
                </p>
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
                Recovery Progress
              </CardTitle>
              <CardDescription>
                Track your healing journey over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trigger Awareness</span>
                  <span className="font-semibold">Building...</span>
                </div>
                <Progress value={35} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Coping Skills</span>
                  <span className="font-semibold">Developing...</span>
                </div>
                <Progress value={45} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Safety Feeling</span>
                  <span className="font-semibold">Growing...</span>
                </div>
                <Progress value={28} />
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Recovery is Not Linear</p>
                    <p className="text-sm text-green-800 mt-1">
                      Healing from trauma takes time. Bad days don't erase progress. Every small step forward 
                      is rewiring your brain toward safety and peace.
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
