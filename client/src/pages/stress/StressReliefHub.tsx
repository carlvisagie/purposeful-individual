import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Wind, Hand, Brain, TrendingDown, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import BoxBreathing from "./BoxBreathing";
import GroundingExercise from "./GroundingExercise";

/**
 * STRESS RELIEF HUB
 * 
 * Evidence-based stress management tools
 * - Box Breathing (Navy SEALs, Huberman)
 * - 5-4-3-2-1 Grounding (MBSR, CBT)
 * - Wim Hof Breathing (coming soon)
 */

type Technique = "box_breathing" | "grounding" | null;

export default function StressReliefHub() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [selectedTechnique, setSelectedTechnique] = useState<Technique>(null);
  const [stressBefore, setStressBefore] = useState([5]);
  const [stressAfter, setStressAfter] = useState([5]);
  const [notes, setNotes] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const { data: stats } = trpc.stress.getStats.useQuery();
  const { data: history } = trpc.stress.getHistory.useQuery({ limit: 10 });

  const completeMutation = trpc.stress.completeSession.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.stress.getStats.invalidate();
      utils.stress.getHistory.invalidate();
      setSelectedTechnique(null);
      setShowFeedback(false);
      setStressBefore([5]);
      setStressAfter([5]);
      setNotes("");
    },
    onError: (error) => {
      toast.error("Failed to save session: " + error.message);
    },
  });

  const handleTechniqueComplete = (durationSeconds: number) => {
    setShowFeedback(true);
  };

  const handleSubmitFeedback = () => {
    if (!selectedTechnique) return;

    completeMutation.mutate({
      technique: selectedTechnique,
      durationSeconds: 300, // Placeholder, actual duration tracked in components
      stressBefore: stressBefore[0],
      stressAfter: stressAfter[0],
      notes: notes || undefined,
    });
  };

  // Technique selection view
  if (!selectedTechnique) {
    return (
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Stress Relief</h1>
            <p className="text-muted-foreground mt-2">
              Evidence-based techniques to reduce stress and anxiety
            </p>
          </div>
        </div>

        {/* Stats */}
        {stats && stats.overall.totalSessions > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall.totalSessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                  {stats.overall.avgImprovement} points
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall.totalMinutes} min</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Techniques */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedTechnique("box_breathing")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5" />
                Box Breathing
              </CardTitle>
              <CardDescription>4-4-4-4 breathing pattern used by Navy SEALs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Activates parasympathetic nervous system, reduces cortisol, improves focus.
              </p>
              <Button className="w-full">Start Exercise</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedTechnique("grounding")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="h-5 w-5" />
                5-4-3-2-1 Grounding
              </CardTitle>
              <CardDescription>Sensory awareness technique for anxiety</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Interrupts anxiety spirals by engaging all five senses to anchor to present moment.
              </p>
              <Button className="w-full">Start Exercise</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent History */}
        {history && history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <div className="font-medium capitalize">
                        {session.technique.replace("_", " ")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.sessionDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {session.stressBefore} → {session.stressAfter}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.stressBefore - session.stressAfter > 0 ? "Improved" : "Maintained"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Feedback view
  if (showFeedback) {
    return (
      <div className="container max-w-2xl mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowFeedback(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">How do you feel?</h1>
            <p className="text-muted-foreground">Rate your stress before and after</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label>Stress Before: {stressBefore[0]}/10</Label>
              <Slider value={stressBefore} onValueChange={setStressBefore} min={1} max={10} step={1} />
            </div>

            <div className="space-y-2">
              <Label>Stress After: {stressAfter[0]}/10</Label>
              <Slider value={stressAfter} onValueChange={setStressAfter} min={1} max={10} step={1} />
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="How did this session help you?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSubmitFeedback} size="lg" className="flex-1" disabled={completeMutation.isPending}>
                {completeMutation.isPending ? "Saving..." : "Save Session"}
              </Button>
              <Button onClick={() => setShowFeedback(false)} size="lg" variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exercise view
  return (
    <div className="container max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setSelectedTechnique(null)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {selectedTechnique === "box_breathing" ? "Box Breathing" : "5-4-3-2-1 Grounding"}
          </h1>
          <p className="text-muted-foreground">Follow the guided exercise</p>
        </div>
      </div>

      {selectedTechnique === "box_breathing" && (
        <BoxBreathing onComplete={handleTechniqueComplete} />
      )}
      {selectedTechnique === "grounding" && (
        <GroundingExercise onComplete={handleTechniqueComplete} />
      )}
    </div>
  );
}
