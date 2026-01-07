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
  Sparkles, 
  Brain, 
  Heart, 
  TrendingUp, 
  Flame,
  Snowflake,
  Dumbbell,
  Apple,
  Moon,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function LongevityAntiAging() {
  const [protocol, setProtocol] = useState("");
  const [duration, setDuration] = useState("");
  const [biomarker, setBiomarker] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  // Self-learning integration
  const { trackInteraction, effectiveTechniques, effectiveness } = useModuleLearning('longevity');

  // Habit formation integration
  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      toast.success("Longevity habit created!");
      trackInteraction('habit_created', { type: 'longevity' });
    }
  });

  const logProtocolMutation = trpc.wellness.logLongevityProtocol.useMutation({
    onSuccess: () => {
      toast.success("Protocol logged - optimizing healthspan");
      trackInteraction('protocol_logged', { 
        protocol, 
        duration 
      });
      setProtocol("");
      setDuration("");
      setNotes("");
    }
  });

  const logBiomarkerMutation = trpc.wellness.logBiomarker.useMutation({
    onSuccess: () => {
      toast.success("Biomarker tracked!");
      trackInteraction('biomarker_logged', { 
        biomarker, 
        value 
      });
      setBiomarker("");
      setValue("");
    }
  });

  const handleLogProtocol = () => {
    if (!protocol || !duration) {
      toast.error("Please select protocol and duration");
      return;
    }

    logProtocolMutation.mutate({
      protocol,
      duration,
      notes,
      timestamp: Date.now()
    });
  };

  const handleLogBiomarker = () => {
    if (!biomarker || !value) {
      toast.error("Please enter biomarker and value");
      return;
    }

    logBiomarkerMutation.mutate({
      biomarker,
      value,
      timestamp: Date.now()
    });
  };

  const handleCreateColdPlungeHabit = () => {
    createHabitMutation.mutate({
      name: "Cold Exposure (2-3x/week)",
      description: "Cold plunge or cold shower for 2-11 minutes. Increases NAD+, reduces inflammation, activates brown fat.",
      frequency: "weekly",
      category: "longevity",
      evidenceLevel: "A",
      researchBasis: "Cold exposure increases longevity markers and metabolic health (Søberg et al., 2021; Huberman Lab)"
    });
  };

  const handleCreateFastingHabit = () => {
    createHabitMutation.mutate({
      name: "Time-Restricted Eating (16:8)",
      description: "Eat within 8-hour window. Activates autophagy, improves insulin sensitivity, extends healthspan.",
      frequency: "daily",
      category: "longevity",
      evidenceLevel: "A",
      researchBasis: "Time-restricted feeding extends lifespan and healthspan (Longo & Panda, 2016; Sinclair, 2019)"
    });
  };

  const handleCreateZone2Habit = () => {
    createHabitMutation.mutate({
      name: "Zone 2 Cardio (3-4x/week)",
      description: "45-60 min at conversational pace. Builds mitochondrial capacity, key longevity marker.",
      frequency: "weekly",
      category: "longevity",
      evidenceLevel: "A",
      researchBasis: "Zone 2 training improves mitochondrial function and longevity (Attia, 2023; Inigo San Millan)"
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Longevity & Anti-Aging</h1>
          <p className="text-muted-foreground">Evidence-based protocols to extend healthspan & arrest aging</p>
        </div>
      </div>

      {/* Evidence-Based Notice */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-purple-900">Cutting-Edge Longevity Science</p>
              <p className="text-sm text-purple-800">
                Protocols based on research from Dr. David Sinclair (Harvard), Dr. Peter Attia, Dr. Andrew Huberman, 
                Dr. Rhonda Patrick, and Dr. Valter Longo. Focus: cellular health, mitochondrial function, autophagy, 
                inflammation reduction, and metabolic optimization.
              </p>
              <p className="text-sm text-purple-800">
                <strong>Goal:</strong> Not just living longer, but extending <em>healthspan</em> - years lived in 
                peak physical and cognitive function.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Learning Insights */}
      {effectiveness > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Your Longevity Optimization</h3>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <p>Protocol effectiveness: {effectiveness}%</p>
              {effectiveTechniques().map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="protocols" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="biomarkers">Biomarkers</TabsTrigger>
          <TabsTrigger value="habits">Longevity Habits</TabsTrigger>
          <TabsTrigger value="science">The Science</TabsTrigger>
        </TabsList>

        {/* Protocols */}
        <TabsContent value="protocols" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Log Longevity Protocol
              </CardTitle>
              <CardDescription>
                Track your anti-aging interventions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Protocol Type</Label>
                <Select value={protocol} onValueChange={setProtocol}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cold_plunge">
                      <span className="flex items-center gap-2">
                        <Snowflake className="w-4 h-4" /> Cold Plunge/Shower
                      </span>
                    </SelectItem>
                    <SelectItem value="sauna">
                      <span className="flex items-center gap-2">
                        <Flame className="w-4 h-4" /> Sauna/Heat Exposure
                      </span>
                    </SelectItem>
                    <SelectItem value="fasting">
                      <span className="flex items-center gap-2">
                        <Apple className="w-4 h-4" /> Fasting/Time-Restricted Eating
                      </span>
                    </SelectItem>
                    <SelectItem value="zone2_cardio">
                      <span className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4" /> Zone 2 Cardio
                      </span>
                    </SelectItem>
                    <SelectItem value="strength_training">
                      <span className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4" /> Strength Training
                      </span>
                    </SelectItem>
                    <SelectItem value="supplements">
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Longevity Supplements
                      </span>
                    </SelectItem>
                    <SelectItem value="sleep_optimization">
                      <span className="flex items-center gap-2">
                        <Moon className="w-4 h-4" /> Sleep Optimization
                      </span>
                    </SelectItem>
                    <SelectItem value="meditation">
                      <span className="flex items-center gap-2">
                        <Brain className="w-4 h-4" /> Meditation/Stress Reduction
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration/Details</Label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., '3 minutes cold plunge' or '16:8 fasting window'"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did you feel? Any observations?"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleLogProtocol} 
                className="w-full"
                disabled={logProtocolMutation.isPending}
              >
                {logProtocolMutation.isPending ? "Logging..." : "Log Protocol"}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Protocol Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Evidence-Based Protocol Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Snowflake className="w-4 h-4 text-blue-500" />
                  <h4 className="font-semibold">Cold Exposure</h4>
                  <Badge variant="outline">Level A</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  2-11 minutes, 2-3x/week. Increases NAD+, activates brown fat, reduces inflammation.
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  <h4 className="font-semibold">Sauna</h4>
                  <Badge variant="outline">Level A</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  15-20 min at 175-195°F, 4-7x/week. Activates heat shock proteins, improves cardiovascular health.
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Apple className="w-4 h-4 text-green-500" />
                  <h4 className="font-semibold">Time-Restricted Eating</h4>
                  <Badge variant="outline">Level A</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  16:8 or 14:10 fasting window. Activates autophagy, improves insulin sensitivity.
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="w-4 h-4 text-purple-500" />
                  <h4 className="font-semibold">Zone 2 Cardio</h4>
                  <Badge variant="outline">Level A</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  45-60 min, 3-4x/week at conversational pace. Builds mitochondrial capacity.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biomarkers */}
        <TabsContent value="biomarkers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Track Longevity Biomarkers
              </CardTitle>
              <CardDescription>
                Monitor key health metrics that predict lifespan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Biomarker</Label>
                <Select value={biomarker} onValueChange={setBiomarker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select biomarker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vo2_max">VO2 Max (ml/kg/min)</SelectItem>
                    <SelectItem value="hrv">Heart Rate Variability (ms)</SelectItem>
                    <SelectItem value="resting_hr">Resting Heart Rate (bpm)</SelectItem>
                    <SelectItem value="fasting_glucose">Fasting Glucose (mg/dL)</SelectItem>
                    <SelectItem value="fasting_insulin">Fasting Insulin (μU/mL)</SelectItem>
                    <SelectItem value="hba1c">HbA1c (%)</SelectItem>
                    <SelectItem value="crp">C-Reactive Protein (mg/L)</SelectItem>
                    <SelectItem value="apob">ApoB (mg/dL)</SelectItem>
                    <SelectItem value="grip_strength">Grip Strength (kg)</SelectItem>
                    <SelectItem value="sleep_score">Sleep Score (0-100)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter measurement"
                  type="number"
                  step="0.1"
                />
              </div>

              <Button 
                onClick={handleLogBiomarker} 
                className="w-full"
                disabled={logBiomarkerMutation.isPending}
              >
                {logBiomarkerMutation.isPending ? "Logging..." : "Log Biomarker"}
              </Button>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Key Longevity Biomarkers</h4>
                <div className="space-y-2 text-sm">
                  <p>• <strong>VO2 Max:</strong> #1 predictor of longevity (Attia)</p>
                  <p>• <strong>HRV:</strong> Autonomic nervous system health</p>
                  <p>• <strong>Fasting Insulin:</strong> Metabolic health indicator</p>
                  <p>• <strong>ApoB:</strong> Best cardiovascular risk marker</p>
                  <p>• <strong>Grip Strength:</strong> All-cause mortality predictor</p>
                  <p>• <strong>Sleep Quality:</strong> Critical for cellular repair</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Longevity Habits */}
        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Build Longevity Habits
              </CardTitle>
              <CardDescription>
                Evidence-based daily practices for healthspan extension
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900">
                  <strong>Hormesis:</strong> Controlled stressors (cold, heat, fasting, exercise) trigger cellular 
                  repair mechanisms that slow aging. These are the most powerful longevity interventions available.
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Cold Exposure Routine</h3>
                  <Badge>Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  2-11 minutes cold plunge or shower, 2-3x/week. Increases NAD+, activates longevity pathways.
                </p>
                <Button onClick={handleCreateColdPlungeHabit} variant="outline" className="w-full">
                  Create Cold Exposure Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Time-Restricted Eating</h3>
                  <Badge>Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  16:8 fasting window. Activates autophagy (cellular cleanup), extends healthspan.
                </p>
                <Button onClick={handleCreateFastingHabit} variant="outline" className="w-full">
                  Create Fasting Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Zone 2 Cardio</h3>
                  <Badge>Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  45-60 min, 3-4x/week. Builds mitochondrial capacity - the key to longevity.
                </p>
                <Button onClick={handleCreateZone2Habit} variant="outline" className="w-full">
                  Create Zone 2 Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Other Key Habits</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• 7-9 hours quality sleep (non-negotiable)</li>
                  <li>• Strength training 3-4x/week (muscle = longevity)</li>
                  <li>• Mediterranean diet (most evidence-based)</li>
                  <li>• Stress management (chronic stress accelerates aging)</li>
                  <li>• Social connection (loneliness shortens lifespan)</li>
                  <li>• Avoid smoking & excess alcohol</li>
                </ul>
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
                The Science of Longevity
              </CardTitle>
              <CardDescription>
                What the research actually shows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hallmarks of Aging */}
              <div className="p-4 border-2 border-purple-200 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">The 12 Hallmarks of Aging</h3>
                <p className="text-sm text-muted-foreground">
                  Research has identified 12 biological processes that drive aging (López-Otín et al., 2023):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>• Genomic instability</div>
                  <div>• Telomere attrition</div>
                  <div>• Epigenetic alterations</div>
                  <div>• Loss of proteostasis</div>
                  <div>• Disabled macroautophagy</div>
                  <div>• Deregulated nutrient sensing</div>
                  <div>• Mitochondrial dysfunction</div>
                  <div>• Cellular senescence</div>
                  <div>• Stem cell exhaustion</div>
                  <div>• Altered intercellular communication</div>
                  <div>• Chronic inflammation</div>
                  <div>• Dysbiosis</div>
                </div>
              </div>

              {/* Key Interventions */}
              <div className="space-y-4">
                <h3 className="font-semibold">Evidence-Based Interventions</h3>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">1. Caloric Restriction / Fasting</h4>
                  <p className="text-sm text-muted-foreground">
                    Only intervention proven to extend lifespan across species. Activates autophagy, improves 
                    metabolic health. (Longo & Panda, 2016; Sinclair, 2019)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">2. Exercise (Zone 2 + Strength)</h4>
                  <p className="text-sm text-muted-foreground">
                    VO2 max is the #1 predictor of longevity. Zone 2 builds mitochondria, strength preserves 
                    muscle mass. (Attia, 2023; San Millan)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">3. Sleep Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    7-9 hours. Critical for cellular repair, autophagy, immune function. Poor sleep accelerates 
                    all hallmarks of aging. (Walker, 2017)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">4. NAD+ Boosting</h4>
                  <p className="text-sm text-muted-foreground">
                    NAD+ declines with age. Boosted by NMN/NR supplements, exercise, fasting, cold exposure. 
                    Critical for mitochondrial function. (Sinclair, 2019)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">5. Inflammation Reduction</h4>
                  <p className="text-sm text-muted-foreground">
                    Chronic inflammation ("inflammaging") accelerates aging. Reduced by diet, exercise, sleep, 
                    stress management, omega-3s. (Patrick, 2023)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">6. Hormetic Stressors</h4>
                  <p className="text-sm text-muted-foreground">
                    Cold, heat, exercise, fasting trigger cellular repair. "What doesn't kill you makes you 
                    stronger" - at the cellular level. (Huberman Lab)
                  </p>
                </div>
              </div>

              {/* Key Researchers */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-2">Leading Longevity Researchers</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Dr. David Sinclair</strong> - Harvard, NAD+, sirtuins, epigenetic aging</li>
                  <li>• <strong>Dr. Peter Attia</strong> - "Outlive", healthspan optimization</li>
                  <li>• <strong>Dr. Andrew Huberman</strong> - Stanford, longevity protocols</li>
                  <li>• <strong>Dr. Rhonda Patrick</strong> - Micronutrients, heat/cold, autophagy</li>
                  <li>• <strong>Dr. Valter Longo</strong> - USC, fasting-mimicking diet</li>
                  <li>• <strong>Dr. Matthew Walker</strong> - Sleep and longevity</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">The Goal: Healthspan, Not Just Lifespan</p>
                    <p className="text-sm text-green-800 mt-1">
                      Living to 100 is meaningless if you're sick for 30 years. The goal is to extend the years 
                      you're healthy, energetic, and cognitively sharp - then compress the period of decline.
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
