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
  AlertCircle,
  CheckCircle2,
  Zap,
  Heart,
  Target
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function PainManagement() {
  const [painLocation, setPainLocation] = useState("");
  const [painIntensity, setPainIntensity] = useState(5);
  const [painType, setPainType] = useState("");
  const [intervention, setIntervention] = useState("");
  const [effectiveness, setEffectiveness] = useState(5);
  const [notes, setNotes] = useState("");

  // Self-learning integration
  const { trackInteraction, effectiveTechniques, effectiveness: moduleEffectiveness } = useModuleLearning('pain_management');

  // Habit formation integration
  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      toast.success("Pain management habit created!");
      trackInteraction('habit_created', { type: 'pain_management' });
    }
  });

  const logPainMutation = trpc.wellness.logPain.useMutation({
    onSuccess: () => {
      toast.success("Pain logged - tracking patterns");
      trackInteraction('pain_logged', { 
        location: painLocation, 
        intensity: painIntensity,
        type: painType,
        intervention,
        effectiveness 
      });
      setPainLocation("");
      setPainIntensity(5);
      setPainType("");
      setIntervention("");
      setEffectiveness(5);
      setNotes("");
    }
  });

  const handleLogPain = () => {
    if (!painLocation || !painType) {
      toast.error("Please select pain location and type");
      return;
    }

    logPainMutation.mutate({
      location: painLocation,
      intensity: painIntensity,
      type: painType,
      intervention,
      effectiveness,
      notes,
      timestamp: Date.now()
    });
  };

  const handleCreateMovementHabit = () => {
    createHabitMutation.mutate({
      name: "Daily Movement Practice",
      description: "Gentle movement/stretching for 10-15 minutes. Motion is lotion for joints.",
      frequency: "daily",
      category: "pain_management",
      evidenceLevel: "A",
      researchBasis: "Regular movement reduces chronic pain and improves function (Geneen et al., 2017, Cochrane Review)"
    });
  };

  const handleCreateHeatColdHabit = () => {
    createHabitMutation.mutate({
      name: "Heat/Cold Therapy Routine",
      description: "Apply heat or cold to painful areas as needed. Heat for chronic pain, cold for acute inflammation.",
      frequency: "as_needed",
      category: "pain_management",
      evidenceLevel: "B",
      researchBasis: "Thermal therapy reduces pain and improves function (Malanga et al., 2015)"
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Pain Management</h1>
          <p className="text-muted-foreground">Evidence-based chronic pain tracking & relief strategies</p>
        </div>
      </div>

      {/* Evidence-Based Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-blue-900">Evidence-Based Pain Science</p>
              <p className="text-sm text-blue-800">
                Modern pain science shows chronic pain is not just tissue damage - it's a complex interaction 
                between nerves, brain, emotions, and beliefs. Protocols based on research from Dr. Lorimer Moseley, 
                Dr. David Butler, and the International Association for the Study of Pain (IASP).
              </p>
              <p className="text-sm text-blue-800">
                <strong>Key insight:</strong> Pain does not equal harm. The brain produces pain to protect you, 
                but sometimes the alarm system becomes oversensitive.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Learning Insights */}
      {moduleEffectiveness > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Your Pain Patterns</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              <p>Module effectiveness: {moduleEffectiveness}%</p>
              {effectiveTechniques().map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="track">Track Pain</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="habits">Pain Habits</TabsTrigger>
          <TabsTrigger value="science">Pain Science</TabsTrigger>
        </TabsList>

        {/* Track Pain */}
        <TabsContent value="track" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Log Pain Episode
              </CardTitle>
              <CardDescription>
                Track pain to identify patterns and effective interventions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pain Location</Label>
                <Select value={painLocation} onValueChange={setPainLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Where is the pain?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="head">Head/Headache</SelectItem>
                    <SelectItem value="neck">Neck</SelectItem>
                    <SelectItem value="shoulder">Shoulder</SelectItem>
                    <SelectItem value="upper_back">Upper Back</SelectItem>
                    <SelectItem value="lower_back">Lower Back</SelectItem>
                    <SelectItem value="hip">Hip</SelectItem>
                    <SelectItem value="knee">Knee</SelectItem>
                    <SelectItem value="ankle">Ankle/Foot</SelectItem>
                    <SelectItem value="wrist">Wrist/Hand</SelectItem>
                    <SelectItem value="elbow">Elbow</SelectItem>
                    <SelectItem value="jaw">Jaw (TMJ)</SelectItem>
                    <SelectItem value="abdomen">Abdomen</SelectItem>
                    <SelectItem value="widespread">Widespread/Multiple Areas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pain Intensity (0-10)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min="0"
                    max="10"
                    value={painIntensity}
                    onChange={(e) => setPainIntensity(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant={painIntensity > 7 ? "destructive" : painIntensity > 4 ? "default" : "secondary"}>
                    {painIntensity}/10
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  0 = No pain, 10 = Worst pain imaginable
                </p>
              </div>

              <div className="space-y-2">
                <Label>Pain Type</Label>
                <Select value={painType} onValueChange={setPainType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Describe the pain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sharp">Sharp/Stabbing</SelectItem>
                    <SelectItem value="dull">Dull/Aching</SelectItem>
                    <SelectItem value="burning">Burning</SelectItem>
                    <SelectItem value="throbbing">Throbbing</SelectItem>
                    <SelectItem value="shooting">Shooting/Electric</SelectItem>
                    <SelectItem value="cramping">Cramping</SelectItem>
                    <SelectItem value="stiff">Stiffness</SelectItem>
                    <SelectItem value="tingling">Tingling/Numbness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Intervention Tried (Optional)</Label>
                <Select value={intervention} onValueChange={setIntervention}>
                  <SelectTrigger>
                    <SelectValue placeholder="What did you try?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rest">Rest</SelectItem>
                    <SelectItem value="movement">Gentle Movement/Stretching</SelectItem>
                    <SelectItem value="heat">Heat Therapy</SelectItem>
                    <SelectItem value="cold">Cold/Ice</SelectItem>
                    <SelectItem value="medication">Pain Medication</SelectItem>
                    <SelectItem value="massage">Massage/Self-Massage</SelectItem>
                    <SelectItem value="breathing">Breathing Exercises</SelectItem>
                    <SelectItem value="distraction">Distraction/Activity</SelectItem>
                    <SelectItem value="position">Position Change</SelectItem>
                    <SelectItem value="none">Nothing Yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {intervention && intervention !== "none" && (
                <div className="space-y-2">
                  <Label>Intervention Effectiveness (0-10)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="range"
                      min="0"
                      max="10"
                      value={effectiveness}
                      onChange={(e) => setEffectiveness(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Badge variant={effectiveness > 6 ? "default" : "secondary"}>
                      {effectiveness}/10
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    0 = No help, 10 = Completely resolved
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Triggers, activities before pain, other observations..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleLogPain} 
                className="w-full"
                disabled={logPainMutation.isPending}
              >
                {logPainMutation.isPending ? "Logging..." : "Log Pain Episode"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interventions */}
        <TabsContent value="interventions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Evidence-Based Pain Interventions
              </CardTitle>
              <CardDescription>
                Non-pharmacological strategies that work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Movement */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Graded Movement/Exercise</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Start with gentle movement, gradually increase. "Motion is lotion" for joints and muscles. 
                  Even small movements help desensitize the nervous system.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Exercise reduces chronic pain across all conditions (Geneen et al., 2017, Cochrane Review)
                </p>
              </div>

              {/* Pacing */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Activity Pacing</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Break activities into smaller chunks. Avoid boom-bust cycles (overdo it → crash → rest too much). 
                  Consistent moderate activity beats sporadic intense activity.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Pacing improves function and reduces pain flares (Andrews et al., 2012)
                </p>
              </div>

              {/* Cognitive Strategies */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Pain Neuroscience Education</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Understanding that pain ≠ damage reduces fear and improves outcomes. The brain produces pain 
                  based on perceived threat, not just tissue state.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Education reduces pain and disability (Moseley & Butler, 2015)
                </p>
              </div>

              {/* Heat/Cold */}
              <div className="p-4 border-2 border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Heat & Cold Therapy</h3>
                  <Badge className="bg-blue-600">Level B Evidence</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>Heat:</strong> Chronic pain, muscle tension, stiffness (15-20 min)</li>
                  <li>• <strong>Cold:</strong> Acute injury, inflammation, swelling (10-15 min)</li>
                  <li>• Both work by modulating pain signals to the brain</li>
                </ul>
                <p className="text-xs text-muted-foreground italic">
                  Research: Thermal therapy reduces pain short-term (Malanga et al., 2015)
                </p>
              </div>

              {/* Mindfulness */}
              <div className="p-4 border-2 border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Mindfulness & Meditation</h3>
                  <Badge className="bg-blue-600">Level B Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mindfulness changes the brain's response to pain. Not about eliminating pain, but changing 
                  your relationship with it. Reduces suffering even when pain persists.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Mindfulness reduces pain intensity and improves quality of life (Hilton et al., 2017)
                </p>
              </div>

              {/* Sleep */}
              <div className="p-4 border-2 border-purple-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Sleep Optimization</h3>
                  <Badge className="bg-purple-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Poor sleep amplifies pain signals. Even one night of bad sleep increases pain sensitivity. 
                  Prioritize 7-9 hours of quality sleep.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Sleep deprivation increases pain sensitivity (Finan et al., 2013)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pain Management Habits */}
        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Build Pain Management Habits
              </CardTitle>
              <CardDescription>
                Daily practices to reduce chronic pain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Habit Formation for Pain:</strong> Consistency beats intensity. Small daily movements 
                  are better than sporadic intense exercise. Build habits that desensitize your nervous system.
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold">Daily Movement Practice</h3>
                <p className="text-sm text-muted-foreground">
                  10-15 minutes of gentle movement/stretching. Motion is lotion for joints and nervous system.
                </p>
                <Button onClick={handleCreateMovementHabit} variant="outline" className="w-full">
                  Create Movement Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold">Heat/Cold Therapy Routine</h3>
                <p className="text-sm text-muted-foreground">
                  Apply thermal therapy as needed. Heat for chronic pain, cold for acute flares.
                </p>
                <Button onClick={handleCreateHeatColdHabit} variant="outline" className="w-full">
                  Create Thermal Therapy Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Other Key Habits</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Prioritize 7-9 hours sleep (pain amplifier when poor)</li>
                  <li>• Practice pacing (avoid boom-bust cycles)</li>
                  <li>• Regular low-intensity cardio (walking, swimming)</li>
                  <li>• Stress management (stress increases pain sensitivity)</li>
                  <li>• Anti-inflammatory diet (reduce systemic inflammation)</li>
                  <li>• Stay hydrated (dehydration worsens pain)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pain Science */}
        <TabsContent value="science" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Modern Pain Science
              </CardTitle>
              <CardDescription>
                Understanding pain changes how you experience it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border-2 border-blue-200 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">Pain ≠ Tissue Damage</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Old model:</strong> Pain is a direct signal of tissue damage (like a car alarm).
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>New model:</strong> Pain is the brain's <em>interpretation</em> of threat. The brain 
                  produces pain to protect you, but sometimes the alarm system becomes oversensitive.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Key insight:</strong> You can have tissue damage without pain, and pain without tissue 
                  damage. MRI findings (bulging discs, arthritis) often don't correlate with pain levels.
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">Central Sensitization</h4>
                <p className="text-sm text-muted-foreground">
                  In chronic pain, the nervous system becomes hypersensitive - like a car alarm that goes off 
                  when a leaf touches it. Normal sensations are interpreted as dangerous. This is why chronic 
                  pain persists even after tissue heals.
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">The Pain Matrix</h4>
                <p className="text-sm text-muted-foreground">
                  Pain involves multiple brain regions: sensory (location/intensity), emotional (suffering), 
                  cognitive (meaning/attention), and motor (protection). This is why stress, fear, and beliefs 
                  affect pain intensity.
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">Neuroplasticity & Recovery</h4>
                <p className="text-sm text-muted-foreground">
                  Good news: The nervous system can be retrained. Graded exposure to safe movement, education, 
                  and reducing fear can "turn down" the alarm system. Recovery is possible even for chronic pain.
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold mb-2">Key Researchers</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Dr. Lorimer Moseley</strong> - Pain neuroscience, central sensitization</li>
                  <li>• <strong>Dr. David Butler</strong> - Explain Pain, pain education</li>
                  <li>• <strong>Dr. Howard Schubiner</strong> - Mind-body pain, neuroplastic pain</li>
                  <li>• <strong>Dr. John Sarno</strong> - Tension myositis syndrome (TMS)</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Hope for Chronic Pain</p>
                    <p className="text-sm text-green-800 mt-1">
                      Understanding pain science is therapeutic in itself. Studies show that education about 
                      pain neuroscience reduces pain intensity and improves function. You're not broken - your 
                      alarm system just needs recalibration.
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
