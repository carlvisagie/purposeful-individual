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
  Brain, 
  Heart, 
  TrendingUp, 
  Sparkles,
  CheckCircle2,
  Zap,
  Clock,
  Target
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function MeditationPractice() {
  const [meditationType, setMeditationType] = useState("");
  const [duration, setDuration] = useState(10);
  const [quality, setQuality] = useState(5);
  const [notes, setNotes] = useState("");

  // Self-learning integration
  const { trackInteraction, getRecommendations, effectiveness } = useModuleLearning('meditation');

  // Habit formation integration
  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      toast.success("Meditation habit created!");
      trackInteraction('habit_created', { type: 'meditation' });
    }
  });

  const logMeditationMutation = trpc.wellness.logMeditation.useMutation({
    onSuccess: () => {
      toast.success("Meditation logged - building your practice");
      trackInteraction('meditation_logged', { 
        type: meditationType, 
        duration,
        quality 
      });
      setMeditationType("");
      setDuration(10);
      setQuality(5);
      setNotes("");
    }
  });

  const handleLogMeditation = () => {
    if (!meditationType) {
      toast.error("Please select meditation type");
      return;
    }

    logMeditationMutation.mutate({
      type: meditationType,
      duration,
      quality,
      notes,
      timestamp: Date.now()
    });
  };

  const handleCreateDailyHabit = () => {
    createHabitMutation.mutate({
      name: "Daily Meditation Practice",
      description: "10 minutes of meditation every morning. Start small, build consistency.",
      frequency: "daily",
      category: "meditation",
      evidenceLevel: "A",
      researchBasis: "Daily meditation reduces stress, anxiety, and improves focus (Goyal et al., 2014, JAMA)"
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Meditation Practice</h1>
          <p className="text-muted-foreground">Evidence-based mindfulness & meditation tracking</p>
        </div>
      </div>

      {/* Evidence-Based Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-blue-900">Evidence-Based Meditation Science</p>
              <p className="text-sm text-blue-800">
                Meditation is one of the most researched mental health interventions. Protocols based on research 
                from Dr. Jon Kabat-Zinn (MBSR), Dr. Richard Davidson, Dr. Sam Harris, and thousands of peer-reviewed studies.
              </p>
              <p className="text-sm text-blue-800">
                <strong>Proven benefits:</strong> Reduces stress, anxiety, depression; improves focus, emotional 
                regulation, immune function, and brain structure (literally grows gray matter).
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
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Your Meditation Progress</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              <p>Practice effectiveness: {effectiveness}%</p>
              {getRecommendations().map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="track">Track Practice</TabsTrigger>
          <TabsTrigger value="techniques">Techniques</TabsTrigger>
          <TabsTrigger value="habits">Build Habit</TabsTrigger>
          <TabsTrigger value="science">The Science</TabsTrigger>
        </TabsList>

        {/* Track Practice */}
        <TabsContent value="track" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Log Meditation Session
              </CardTitle>
              <CardDescription>
                Track your practice to build consistency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meditation Type</Label>
                <Select value={meditationType} onValueChange={setMeditationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="What did you practice?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breath_focus">Breath Focus (Anapanasati)</SelectItem>
                    <SelectItem value="body_scan">Body Scan</SelectItem>
                    <SelectItem value="loving_kindness">Loving-Kindness (Metta)</SelectItem>
                    <SelectItem value="mindfulness">Open Monitoring Mindfulness</SelectItem>
                    <SelectItem value="mantra">Mantra/Transcendental</SelectItem>
                    <SelectItem value="visualization">Visualization</SelectItem>
                    <SelectItem value="walking">Walking Meditation</SelectItem>
                    <SelectItem value="guided">Guided Meditation (App)</SelectItem>
                    <SelectItem value="vipassana">Vipassana (Insight)</SelectItem>
                    <SelectItem value="zen">Zen (Zazen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge>{duration} min</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Session Quality (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant={quality > 7 ? "default" : quality > 4 ? "secondary" : "outline"}>
                    {quality}/10
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  1 = Very distracted, 10 = Deep focus/peace
                </p>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Insights, challenges, experiences..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleLogMeditation} 
                className="w-full"
                disabled={logMeditationMutation.isPending}
              >
                {logMeditationMutation.isPending ? "Logging..." : "Log Meditation"}
              </Button>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  💡 <strong>Tip:</strong> "Bad" meditation sessions are still beneficial. The practice is noticing 
                  when your mind wanders and bringing it back - that's the workout.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meditation Techniques */}
        <TabsContent value="techniques" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Evidence-Based Meditation Techniques
              </CardTitle>
              <CardDescription>
                Proven practices for beginners and advanced
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Breath Focus */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Breath Focus (Best for Beginners)</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">How to practice:</p>
                  <ol className="ml-4 space-y-1">
                    <li>1. Sit comfortably, close eyes</li>
                    <li>2. Focus attention on the sensation of breathing</li>
                    <li>3. When mind wanders (it will), gently return to breath</li>
                    <li>4. That's it - repeat for 10-20 minutes</li>
                  </ol>
                  <p className="text-muted-foreground italic">
                    Research: Improves attention, reduces mind-wandering (Lutz et al., 2008)
                  </p>
                </div>
              </div>

              {/* Body Scan */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Body Scan (MBSR Protocol)</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">How to practice:</p>
                  <ol className="ml-4 space-y-1">
                    <li>1. Lie down or sit comfortably</li>
                    <li>2. Systematically move attention through body parts</li>
                    <li>3. Start at toes, slowly scan up to head</li>
                    <li>4. Notice sensations without judgment</li>
                  </ol>
                  <p className="text-muted-foreground italic">
                    Research: Reduces stress, pain, improves body awareness (Kabat-Zinn, 1990)
                  </p>
                </div>
              </div>

              {/* Loving-Kindness */}
              <div className="p-4 border-2 border-pink-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Loving-Kindness (Metta)</h3>
                  <Badge className="bg-pink-600">Level A Evidence</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">How to practice:</p>
                  <ol className="ml-4 space-y-1">
                    <li>1. Sit comfortably, close eyes</li>
                    <li>2. Silently repeat: "May I be happy, may I be healthy, may I be safe"</li>
                    <li>3. Extend to loved ones, neutral people, difficult people, all beings</li>
                    <li>4. Feel the warmth and compassion</li>
                  </ol>
                  <p className="text-muted-foreground italic">
                    Research: Increases positive emotions, social connection, reduces depression (Fredrickson et al., 2008)
                  </p>
                </div>
              </div>

              {/* Open Monitoring */}
              <div className="p-4 border-2 border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Open Monitoring Mindfulness</h3>
                  <Badge className="bg-blue-600">Level B Evidence</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">How to practice:</p>
                  <ol className="ml-4 space-y-1">
                    <li>1. Sit comfortably, eyes open or closed</li>
                    <li>2. Don't focus on anything specific</li>
                    <li>3. Notice whatever arises (thoughts, sounds, sensations)</li>
                    <li>4. Observe without judgment or attachment</li>
                  </ol>
                  <p className="text-muted-foreground italic">
                    Research: Increases meta-awareness, reduces reactivity (Lutz et al., 2008)
                  </p>
                </div>
              </div>

              {/* Walking Meditation */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Walking Meditation</h3>
                  <Badge className="bg-green-600">Level B Evidence</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">How to practice:</p>
                  <ol className="ml-4 space-y-1">
                    <li>1. Walk slowly, deliberately</li>
                    <li>2. Focus on sensations of each step</li>
                    <li>3. Feel feet lifting, moving, touching ground</li>
                    <li>4. When mind wanders, return to walking</li>
                  </ol>
                  <p className="text-muted-foreground italic">
                    Research: Combines benefits of meditation + movement (Prakhinkit et al., 2014)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Build Meditation Habit */}
        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Build a Meditation Habit
              </CardTitle>
              <CardDescription">
                Consistency beats duration - start small
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900">
                  <strong>Habit Formation Science:</strong> Start with just 5-10 minutes daily. Same time, same place. 
                  Habit stacking works best - meditate right after coffee or brushing teeth. Consistency builds the 
                  neural pathways, not duration.
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold">Daily Morning Meditation</h3>
                <p className="text-sm text-muted-foreground">
                  10 minutes every morning. Start your day with clarity and calm.
                </p>
                <Button onClick={handleCreateDailyHabit} variant="outline" className="w-full">
                  Create Daily Meditation Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold">Tips for Building the Habit</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Same time, same place</strong> (reduces decision fatigue)</li>
                  <li>• <strong>Start small</strong> - 5 min is better than 0 min</li>
                  <li>• <strong>Habit stack</strong> - after coffee, before work, etc.</li>
                  <li>• <strong>Don't judge sessions</strong> - "bad" meditation is still beneficial</li>
                  <li>• <strong>Track streaks</strong> - builds motivation</li>
                  <li>• <strong>Use apps if helpful</strong> - Headspace, Calm, Waking Up</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Research:</strong> 8 weeks of daily meditation (20 min) physically changes brain structure 
                  - increases gray matter in areas for learning, memory, emotional regulation (Hölzel et al., 2011, Harvard)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* The Science */}
        <TabsContent value="science" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                The Science of Meditation
              </CardTitle>
              <CardDescription>
                What happens in your brain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border-2 border-purple-200 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">Brain Changes from Meditation</h3>
                <div className="space-y-2 text-sm">
                  <p>• <strong>Prefrontal Cortex:</strong> Thickens (executive function, focus)</p>
                  <p>• <strong>Amygdala:</strong> Shrinks (fear/stress response)</p>
                  <p>• <strong>Hippocampus:</strong> Grows (memory, learning)</p>
                  <p>• <strong>Insula:</strong> Thickens (body awareness, empathy)</p>
                  <p>• <strong>Default Mode Network:</strong> Quiets (reduces mind-wandering, rumination)</p>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Research: Hölzel et al. (2011), Harvard; Davidson & Lutz (2008), Wisconsin
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Proven Benefits (Level A Evidence)</h3>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Mental Health</h4>
                  <p className="text-sm text-muted-foreground">
                    Reduces anxiety, depression, stress. Effect size comparable to antidepressants for mild-moderate 
                    depression (Goyal et al., 2014, JAMA meta-analysis)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Attention & Focus</h4>
                  <p className="text-sm text-muted-foreground">
                    Improves sustained attention, reduces mind-wandering, increases working memory capacity 
                    (Jha et al., 2007; Mrazek et al., 2013)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Emotional Regulation</h4>
                  <p className="text-sm text-muted-foreground">
                    Increases ability to observe emotions without reacting. Reduces emotional reactivity and 
                    improves resilience (Davidson et al., 2003)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Physical Health</h4>
                  <p className="text-sm text-muted-foreground">
                    Reduces blood pressure, improves immune function, reduces inflammation, slows cellular aging 
                    (telomere length) (Epel et al., 2009; Black & Slavich, 2016)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Pain Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Reduces pain intensity and pain-related distress. Changes brain's response to pain signals 
                    (Zeidan et al., 2011)
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-2">Key Researchers</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Dr. Jon Kabat-Zinn</strong> - MBSR, brought meditation to medicine</li>
                  <li>• <strong>Dr. Richard Davidson</strong> - Neuroscience of meditation, brain changes</li>
                  <li>• <strong>Dr. Sam Harris</strong> - Secular meditation, Waking Up app</li>
                  <li>• <strong>Dr. Judson Brewer</strong> - Addiction, craving, mindfulness</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">The Most Researched Mental Health Intervention</p>
                    <p className="text-sm text-green-800 mt-1">
                      Meditation has over 6,000 peer-reviewed studies. It's free, has no side effects, and you 
                      can practice anywhere. The benefits compound over time - start today.
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
