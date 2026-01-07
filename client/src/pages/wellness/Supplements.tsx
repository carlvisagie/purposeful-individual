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
  Pill, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Heart,
  Zap,
  Shield,
  Activity
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function Supplements() {
  const [supplementName, setSupplementName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timing, setTiming] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");

  // Self-learning integration
  const { trackInteraction, effectiveTechniques, effectiveness } = useModuleLearning('supplements');

  // Habit formation integration
  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      toast.success("Supplement habit created!");
      trackInteraction('habit_created', { type: 'supplement_routine' });
    }
  });

  const logSupplementMutation = trpc.wellness.logSupplement.useMutation({
    onSuccess: () => {
      toast.success("Supplement logged");
      trackInteraction('supplement_logged', { 
        name: supplementName, 
        dosage,
        timing,
        purpose 
      });
      setSupplementName("");
      setDosage("");
      setTiming("");
      setPurpose("");
      setNotes("");
    }
  });

  const handleLogSupplement = () => {
    if (!supplementName || !dosage) {
      toast.error("Please enter supplement name and dosage");
      return;
    }

    logSupplementMutation.mutate({
      name: supplementName,
      dosage,
      timing,
      purpose,
      notes,
      timestamp: Date.now()
    });
  };

  const handleCreateSupplementHabit = () => {
    createHabitMutation.mutate({
      name: "Morning Supplement Stack",
      description: "Take core supplements with breakfast for optimal absorption",
      frequency: "daily",
      category: "supplements",
      evidenceLevel: "A",
      researchBasis: "Consistent supplement timing improves compliance and effectiveness (Patrick, 2023)"
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
          <Pill className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Supplement Tracking</h1>
          <p className="text-muted-foreground">Evidence-based supplementation for optimal health</p>
        </div>
      </div>

      {/* Critical Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-amber-900">Medical Consultation Required</p>
              <p className="text-sm text-amber-800">
                Supplements can interact with medications and medical conditions. Always consult your doctor 
                before starting new supplements, especially if you have health conditions or take medications.
              </p>
              <p className="text-sm text-amber-800">
                <strong>This module tracks supplements - it does NOT provide medical advice or prescriptions.</strong>
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
              <h3 className="font-semibold text-purple-900">Your Supplement Patterns</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              <p>Tracking effectiveness: {effectiveness}%</p>
              {effectiveTechniques().map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="track">Track Supplements</TabsTrigger>
          <TabsTrigger value="evidence">Evidence-Based</TabsTrigger>
          <TabsTrigger value="habits">Supplement Habits</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
        </TabsList>

        {/* Track Supplements */}
        <TabsContent value="track" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Log Daily Supplements
              </CardTitle>
              <CardDescription>
                Track what you're taking and when
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Supplement Name</Label>
                <Input
                  value={supplementName}
                  onChange={(e) => setSupplementName(e.target.value)}
                  placeholder="e.g., Vitamin D3, Magnesium, Omega-3"
                />
              </div>

              <div className="space-y-2">
                <Label>Dosage</Label>
                <Input
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g., 5000 IU, 400mg, 2 capsules"
                />
              </div>

              <div className="space-y-2">
                <Label>Timing</Label>
                <Select value={timing} onValueChange={setTiming}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you take it?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning_empty">Morning (empty stomach)</SelectItem>
                    <SelectItem value="morning_food">Morning (with food)</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening_food">Evening (with food)</SelectItem>
                    <SelectItem value="before_bed">Before bed</SelectItem>
                    <SelectItem value="pre_workout">Pre-workout</SelectItem>
                    <SelectItem value="post_workout">Post-workout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Purpose/Goal</Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger>
                    <SelectValue placeholder="Why are you taking this?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_health">General Health</SelectItem>
                    <SelectItem value="energy">Energy/Fatigue</SelectItem>
                    <SelectItem value="sleep">Sleep Quality</SelectItem>
                    <SelectItem value="mood">Mood/Mental Health</SelectItem>
                    <SelectItem value="cognitive">Cognitive Function</SelectItem>
                    <SelectItem value="immune">Immune Support</SelectItem>
                    <SelectItem value="inflammation">Inflammation</SelectItem>
                    <SelectItem value="recovery">Exercise Recovery</SelectItem>
                    <SelectItem value="longevity">Longevity/Anti-Aging</SelectItem>
                    <SelectItem value="deficiency">Known Deficiency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Brand, effects noticed, side effects, etc."
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleLogSupplement} 
                className="w-full"
                disabled={logSupplementMutation.isPending}
              >
                {logSupplementMutation.isPending ? "Logging..." : "Log Supplement"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence-Based Supplements */}
        <TabsContent value="evidence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Evidence-Based Supplements
              </CardTitle>
              <CardDescription>
                Supplements with strong research backing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Evidence Hierarchy:</strong> Level A = Multiple RCTs, Level B = Some RCTs, 
                  Level C = Observational studies, Level D = Expert opinion only
                </p>
              </div>

              {/* Vitamin D */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Vitamin D3</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Dosage:</strong> 2000-5000 IU daily (test blood levels first)
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Benefits:</strong> Bone health, immune function, mood, reduces all-cause mortality
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Deficiency linked to depression, immune dysfunction, bone disease (Holick, 2007)
                </p>
              </div>

              {/* Omega-3 */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Omega-3 (EPA/DHA)</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Dosage:</strong> 1-2g EPA+DHA daily (from fish oil or algae)
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Benefits:</strong> Heart health, brain function, reduces inflammation, mood support
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Reduces cardiovascular events, improves depression (Mozaffarian & Wu, 2011)
                </p>
              </div>

              {/* Magnesium */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Magnesium</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Dosage:</strong> 300-400mg daily (glycinate or threonate for best absorption)
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Benefits:</strong> Sleep, anxiety, muscle function, blood pressure, bone health
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: 50% of Americans deficient, improves sleep and anxiety (Abbasi et al., 2012)
                </p>
              </div>

              {/* Creatine */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Creatine Monohydrate</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Dosage:</strong> 5g daily (most researched supplement in sports science)
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Benefits:</strong> Muscle strength, cognitive function, neuroprotection, mood
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: 1000+ studies, improves strength and cognition (Kreider et al., 2017)
                </p>
              </div>

              {/* Longevity Stack */}
              <div className="p-4 border-2 border-yellow-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Longevity Stack (Sinclair Protocol)</h3>
                  <Badge className="bg-yellow-600">Level B Evidence</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>NMN/NR:</strong> 500-1000mg (NAD+ precursor)</li>
                  <li>• <strong>Resveratrol:</strong> 500mg-1g (sirtuin activator)</li>
                  <li>• <strong>Metformin:</strong> 500mg (Rx only, longevity drug)</li>
                </ul>
                <p className="text-xs text-muted-foreground italic">
                  Research: Animal studies strong, human RCTs ongoing (Sinclair, 2019)
                </p>
              </div>

              {/* Probiotics */}
              <div className="p-4 border-2 border-blue-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Probiotics</h3>
                  <Badge className="bg-blue-600">Level B Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Dosage:</strong> 10-50 billion CFU, multi-strain formula
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Benefits:</strong> Gut health, immune function, mood (gut-brain axis)
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Strain-specific effects, improves IBS and mood (Dinan et al., 2013)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplement Habits */}
        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Build Supplement Habits
              </CardTitle>
              <CardDescription>
                Consistency is key for supplement effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900">
                  <strong>Compliance Research:</strong> Taking supplements at the same time daily (habit stacking) 
                  improves adherence by 40% (Clear, 2018). Pair with existing habits like breakfast or brushing teeth.
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold">Morning Supplement Stack</h3>
                <p className="text-sm text-muted-foreground">
                  Take core supplements with breakfast for optimal absorption and consistency.
                </p>
                <Button onClick={handleCreateSupplementHabit} variant="outline" className="w-full">
                  Create Morning Stack Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold">Supplement Timing Tips</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Fat-soluble vitamins</strong> (D, E, K, A): Take with fatty meal</li>
                  <li>• <strong>Magnesium:</strong> Evening (promotes relaxation/sleep)</li>
                  <li>• <strong>Iron:</strong> Morning, empty stomach (don't mix with calcium)</li>
                  <li>• <strong>B-vitamins:</strong> Morning (can be energizing)</li>
                  <li>• <strong>Probiotics:</strong> Empty stomach or with light meal</li>
                  <li>• <strong>Creatine:</strong> Anytime (timing doesn't matter)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interactions & Safety */}
        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Supplement Interactions & Safety
              </CardTitle>
              <CardDescription>
                Critical warnings and drug interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">⚠️ Always Consult Your Doctor First</h4>
                <p className="text-sm text-red-800">
                  Supplements can interact with medications, worsen medical conditions, or be dangerous 
                  during pregnancy. This is especially true for blood thinners, diabetes medications, 
                  antidepressants, and immunosuppressants.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Common Dangerous Interactions</h4>
                
                <div className="p-3 border-l-4 border-red-500 bg-red-50">
                  <p className="text-sm font-semibold">St. John's Wort</p>
                  <p className="text-sm text-muted-foreground">
                    Interacts with birth control, antidepressants, blood thinners, cancer drugs. Can be life-threatening.
                  </p>
                </div>

                <div className="p-3 border-l-4 border-red-500 bg-red-50">
                  <p className="text-sm font-semibold">Vitamin K</p>
                  <p className="text-sm text-muted-foreground">
                    Interferes with blood thinners (warfarin). Can cause dangerous clotting.
                  </p>
                </div>

                <div className="p-3 border-l-4 border-amber-500 bg-amber-50">
                  <p className="text-sm font-semibold">Calcium + Iron</p>
                  <p className="text-sm text-muted-foreground">
                    Calcium blocks iron absorption. Take separately (4+ hours apart).
                  </p>
                </div>

                <div className="p-3 border-l-4 border-amber-500 bg-amber-50">
                  <p className="text-sm font-semibold">High-Dose Vitamin E</p>
                  <p className="text-sm text-muted-foreground">
                    Increases bleeding risk, especially with blood thinners or before surgery.
                  </p>
                </div>

                <div className="p-3 border-l-4 border-amber-500 bg-amber-50">
                  <p className="text-sm font-semibold">Ginkgo Biloba</p>
                  <p className="text-sm text-muted-foreground">
                    Increases bleeding risk. Avoid before surgery or with blood thinners.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Testing Before Supplementing</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Get blood work before mega-dosing:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4">
                  <li>• <strong>Vitamin D:</strong> Test 25-OH vitamin D levels first</li>
                  <li>• <strong>Iron:</strong> Check ferritin (can cause overload)</li>
                  <li>• <strong>B12:</strong> Test before supplementing</li>
                  <li>• <strong>Magnesium:</strong> RBC magnesium more accurate than serum</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Food First, Supplements Second</p>
                    <p className="text-sm text-green-800 mt-1">
                      Whole foods contain thousands of compounds that work synergistically. Supplements fill gaps, 
                      but can't replace a nutrient-dense diet. Focus on: vegetables, fruits, fish, nuts, whole grains.
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
