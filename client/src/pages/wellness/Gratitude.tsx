import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Brain, 
  TrendingUp, 
  Sparkles,
  CheckCircle2,
  Zap,
  Sun
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function GratitudeJournal() {
  const [gratitude1, setGratitude1] = useState("");
  const [gratitude2, setGratitude2] = useState("");
  const [gratitude3, setGratitude3] = useState("");
  const [reflection, setReflection] = useState("");

  // Self-learning integration
  const { trackInteraction, effectiveTechniques, effectiveness } = useModuleLearning('gratitude');

  // Habit formation integration
  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      toast.success("Gratitude habit created!");
      trackInteraction('habit_created', { type: 'gratitude' });
    }
  });

  const logGratitudeMutation = trpc.wellness.logGratitude.useMutation({
    onSuccess: () => {
      toast.success("Gratitude logged - building positive mindset");
      trackInteraction('gratitude_logged', { 
        items: [gratitude1, gratitude2, gratitude3].filter(Boolean).length 
      });
      setGratitude1("");
      setGratitude2("");
      setGratitude3("");
      setReflection("");
    }
  });

  const handleLogGratitude = () => {
    if (!gratitude1 && !gratitude2 && !gratitude3) {
      toast.error("Please write at least one thing you're grateful for");
      return;
    }

    logGratitudeMutation.mutate({
      items: [gratitude1, gratitude2, gratitude3].filter(Boolean),
      reflection,
      timestamp: Date.now()
    });
  };

  const handleCreateDailyHabit = () => {
    createHabitMutation.mutate({
      name: "Daily Gratitude Practice",
      description: "Write 3 things you're grateful for every morning. Rewires brain for positivity.",
      frequency: "daily",
      category: "gratitude",
      evidenceLevel: "A",
      researchBasis: "Daily gratitude practice increases happiness and reduces depression (Emmons & McCullough, 2003)"
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Gratitude Journal</h1>
          <p className="text-muted-foreground">Evidence-based gratitude practice for happiness & resilience</p>
        </div>
      </div>

      {/* Evidence-Based Notice */}
      <Card className="border-pink-200 bg-pink-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-pink-900">The Science of Gratitude</p>
              <p className="text-sm text-pink-800">
                Gratitude is one of the most researched positive psychology interventions. Studies show daily 
                gratitude practice increases happiness by 25%, reduces depression, improves sleep, strengthens 
                relationships, and even boosts immune function.
              </p>
              <p className="text-sm text-pink-800">
                <strong>Key insight:</strong> What you focus on grows. Gratitude rewires your brain to notice 
                the good, creating an upward spiral of positivity.
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
              <h3 className="font-semibold text-purple-900">Your Gratitude Progress</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              <p>Practice effectiveness: {effectiveness}%</p>
              {effectiveTechniques().map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="journal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="journal">Today's Gratitude</TabsTrigger>
          <TabsTrigger value="habits">Build Habit</TabsTrigger>
          <TabsTrigger value="science">The Science</TabsTrigger>
        </TabsList>

        {/* Gratitude Journal */}
        <TabsContent value="journal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5" />
                What Are You Grateful For Today?
              </CardTitle>
              <CardDescription>
                Write 3 things - big or small, simple or profound
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-pink-100">1</Badge>
                  <span className="text-sm font-medium">First gratitude</span>
                </div>
                <Textarea
                  value={gratitude1}
                  onChange={(e) => setGratitude1(e.target.value)}
                  placeholder="I'm grateful for..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-pink-100">2</Badge>
                  <span className="text-sm font-medium">Second gratitude</span>
                </div>
                <Textarea
                  value={gratitude2}
                  onChange={(e) => setGratitude2(e.target.value)}
                  placeholder="I'm grateful for..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-pink-100">3</Badge>
                  <span className="text-sm font-medium">Third gratitude</span>
                </div>
                <Textarea
                  value={gratitude3}
                  onChange={(e) => setGratitude3(e.target.value)}
                  placeholder="I'm grateful for..."
                  rows={2}
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Optional: Deeper Reflection</span>
                </div>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Why are these meaningful to you? How do they make you feel?"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleLogGratitude} 
                className="w-full"
                disabled={logGratitudeMutation.isPending}
              >
                {logGratitudeMutation.isPending ? "Saving..." : "Save Today's Gratitude"}
              </Button>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">💡 Gratitude Prompts</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• A person who made your day better</li>
                  <li>• Something in nature that brought you peace</li>
                  <li>• A challenge that helped you grow</li>
                  <li>• A simple pleasure (coffee, music, sunshine)</li>
                  <li>• Your health or a body part that works well</li>
                  <li>• A lesson you learned recently</li>
                  <li>• Something you have that others don't</li>
                  <li>• A memory that makes you smile</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Build Gratitude Habit */}
        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Build a Gratitude Habit
              </CardTitle>
              <CardDescription>
                Daily practice rewires your brain for happiness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <p className="text-sm text-pink-900">
                  <strong>Habit Formation Science:</strong> Gratitude works best when practiced daily at the 
                  same time. Morning is ideal - it sets a positive tone for the day. Takes only 5 minutes but 
                  the benefits compound over time.
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold">Daily Morning Gratitude</h3>
                <p className="text-sm text-muted-foreground">
                  Write 3 things you're grateful for every morning. Rewires brain for positivity.
                </p>
                <Button onClick={handleCreateDailyHabit} variant="outline" className="w-full">
                  Create Daily Gratitude Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold">Tips for Building the Habit</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Same time daily</strong> - Right after waking up or with morning coffee</li>
                  <li>• <strong>Be specific</strong> - "My partner made me laugh" beats "my partner"</li>
                  <li>• <strong>Feel it</strong> - Don't just list, actually feel the gratitude</li>
                  <li>• <strong>Vary your focus</strong> - People, experiences, nature, body, possessions</li>
                  <li>• <strong>Include challenges</strong> - What did hardship teach you?</li>
                  <li>• <strong>Track streaks</strong> - Builds motivation and accountability</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Research:</strong> People who practice gratitude daily for 3 weeks show lasting 
                  increases in happiness and decreases in depression (Emmons & McCullough, 2003). The effects 
                  persist even after stopping the practice.
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
                The Science of Gratitude
              </CardTitle>
              <CardDescription>
                Why gratitude is so powerful
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border-2 border-pink-200 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">Gratitude Rewires Your Brain</h3>
                <p className="text-sm text-muted-foreground">
                  Gratitude practice activates the brain's reward system (ventral tegmental area and ventral 
                  striatum) and increases activity in the prefrontal cortex. Over time, this creates lasting 
                  changes in neural pathways, making it easier to notice positive things automatically.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Result:</strong> Your brain literally becomes wired to see the good, creating an 
                  upward spiral of positivity.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Proven Benefits (Level A Evidence)</h3>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Mental Health</h4>
                  <p className="text-sm text-muted-foreground">
                    Increases happiness by 25%, reduces depression and anxiety, improves self-esteem. Effect 
                    size comparable to therapy for mild depression (Emmons & McCullough, 2003; Seligman et al., 2005)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Sleep Quality</h4>
                  <p className="text-sm text-muted-foreground">
                    Writing gratitude before bed improves sleep quality and duration. Reduces pre-sleep worry 
                    and rumination (Wood et al., 2009)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Relationships</h4>
                  <p className="text-sm text-muted-foreground">
                    Expressing gratitude to others strengthens relationships, increases relationship satisfaction, 
                    and makes people more likely to help you (Algoe et al., 2010)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Physical Health</h4>
                  <p className="text-sm text-muted-foreground">
                    Boosts immune function, reduces inflammation, lowers blood pressure, reduces pain. Grateful 
                    people exercise more and take better care of their health (Mills et al., 2015)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Resilience</h4>
                  <p className="text-sm text-muted-foreground">
                    Increases ability to cope with stress and trauma. Grateful people recover faster from 
                    adversity and find meaning in challenges (Fredrickson et al., 2003)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Work & Productivity</h4>
                  <p className="text-sm text-muted-foreground">
                    Increases energy, motivation, and productivity. Grateful employees are more engaged and 
                    perform better (Grant & Gino, 2010)
                  </p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold mb-2">Key Researchers</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Dr. Robert Emmons</strong> - Leading gratitude researcher, UC Davis</li>
                  <li>• <strong>Dr. Martin Seligman</strong> - Positive psychology founder, Penn</li>
                  <li>• <strong>Dr. Sonja Lyubomirsky</strong> - Happiness research, UC Riverside</li>
                  <li>• <strong>Dr. Barbara Fredrickson</strong> - Positive emotions, UNC</li>
                </ul>
              </div>

              <div className="p-4 border-2 border-green-200 rounded-lg space-y-2">
                <h4 className="font-semibold text-green-900">The Gratitude Paradox</h4>
                <p className="text-sm text-green-800">
                  Gratitude doesn't deny difficulty or toxic positivity. In fact, research shows grateful people 
                  are MORE aware of challenges - they just also notice what's working. It's not about pretending 
                  everything is perfect; it's about training your brain to see the full picture, not just the negative.
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">The Most Powerful Happiness Intervention</p>
                    <p className="text-sm text-green-800 mt-1">
                      Of all positive psychology interventions studied, gratitude practice has the strongest and 
                      most lasting effects on happiness. It's free, takes 5 minutes, and the benefits compound 
                      over time. Start today.
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
