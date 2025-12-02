import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Sunrise, ArrowLeft, Check } from "lucide-react";

export default function MorningRoutine() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const today = new Date().toISOString().split("T")[0];

  const [hydrated, setHydrated] = useState(false);
  const [movement, setMovement] = useState(false);
  const [meditation, setMeditation] = useState(false);
  const [coldShower, setColdShower] = useState(false);
  const [healthyBreakfast, setHealthyBreakfast] = useState(false);
  const [top3Priorities, setTop3Priorities] = useState("");

  const completeMutation = trpc.dailyOS.morning.complete.useMutation({
    onSuccess: (data) => {
      toast.success(`Morning routine ${data.completionRate}% complete!`);
      utils.dailyOS.morning.getStreak.invalidate();
      navigate("/daily-os/dashboard");
    },
  });

  const handleSubmit = () => {
    completeMutation.mutate({
      routineDate: today,
      hydrated,
      movement,
      meditation,
      coldShower,
      healthyBreakfast,
      top3Priorities: top3Priorities || undefined,
    });
  };

  const completionRate = [hydrated, movement, meditation, coldShower, healthyBreakfast].filter(Boolean).length * 20;

  return (
    <div className="container max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/daily-os/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sunrise className="h-8 w-8" />
            Morning Routine
          </h1>
          <p className="text-muted-foreground">Non-negotiable morning protocol</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion: {completionRate}%</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="hydrated" checked={hydrated} onCheckedChange={(checked) => setHydrated(checked as boolean)} />
            <Label htmlFor="hydrated" className="cursor-pointer">Hydration (16oz water)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="movement" checked={movement} onCheckedChange={(checked) => setMovement(checked as boolean)} />
            <Label htmlFor="movement" className="cursor-pointer">Movement (10min)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="meditation" checked={meditation} onCheckedChange={(checked) => setMeditation(checked as boolean)} />
            <Label htmlFor="meditation" className="cursor-pointer">Meditation (5min)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="coldShower" checked={coldShower} onCheckedChange={(checked) => setColdShower(checked as boolean)} />
            <Label htmlFor="coldShower" className="cursor-pointer">Cold shower</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="healthyBreakfast" checked={healthyBreakfast} onCheckedChange={(checked) => setHealthyBreakfast(checked as boolean)} />
            <Label htmlFor="healthyBreakfast" className="cursor-pointer">Healthy breakfast</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="top3">Top 3 Priorities Today</Label>
            <Textarea
              id="top3"
              placeholder="1. Complete project proposal&#10;2. Workout at 5pm&#10;3. Call mom"
              value={top3Priorities}
              onChange={(e) => setTop3Priorities(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleSubmit} size="lg" className="w-full" disabled={completeMutation.isPending}>
            <Check className="h-4 w-4 mr-2" />
            {completeMutation.isPending ? "Saving..." : "Complete Routine"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
