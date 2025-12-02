import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Activity, Droplet, Moon, Utensils, Save, ArrowLeft } from "lucide-react";

/**
 * HEALTH LOGGER
 * 
 * Daily health metrics input form
 * Evidence-based tracking for peak performance
 */

export default function HealthLogger() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Fetch today's existing log
  const { data: existingLog } = trpc.health.getToday.useQuery();

  // Form state
  const [steps, setSteps] = useState<number | undefined>();
  const [workoutMinutes, setWorkoutMinutes] = useState<number | undefined>();
  const [workoutType, setWorkoutType] = useState("");
  const [mealsLogged, setMealsLogged] = useState<number | undefined>();
  const [waterIntakeOz, setWaterIntakeOz] = useState<number | undefined>();
  const [nutritionQuality, setNutritionQuality] = useState([5]);
  const [sleepHours, setSleepHours] = useState<number | undefined>();
  const [sleepQuality, setSleepQuality] = useState([5]);
  const [wakeTime, setWakeTime] = useState("");
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [notes, setNotes] = useState("");

  // Populate form with existing log data
  useEffect(() => {
    if (existingLog) {
      setSteps(existingLog.steps || undefined);
      setWorkoutMinutes(existingLog.workoutMinutes || undefined);
      setWorkoutType(existingLog.workoutType || "");
      setMealsLogged(existingLog.mealsLogged || undefined);
      setWaterIntakeOz(existingLog.waterIntakeOz || undefined);
      setNutritionQuality([existingLog.nutritionQuality || 5]);
      setSleepHours(existingLog.sleepHours || undefined);
      setSleepQuality([existingLog.sleepQuality || 5]);
      setWakeTime(existingLog.wakeTime || "");
      setEnergyLevel([existingLog.energyLevel || 5]);
      setNotes(existingLog.notes || "");
    }
  }, [existingLog]);

  const logMutation = trpc.health.logDaily.useMutation({
    onSuccess: (data) => {
      toast.success(data.updated ? "Health log updated!" : "Health log saved!");
      utils.health.getToday.invalidate();
      utils.health.getHistory.invalidate();
      utils.health.getStats.invalidate();
      navigate("/health/dashboard");
    },
    onError: (error) => {
      toast.error("Failed to save health log: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    logMutation.mutate({
      logDate: today,
      steps,
      workoutMinutes,
      workoutType: workoutType || undefined,
      mealsLogged,
      waterIntakeOz,
      nutritionQuality: nutritionQuality[0],
      sleepHours,
      sleepQuality: sleepQuality[0],
      wakeTime: wakeTime || undefined,
      energyLevel: energyLevel[0],
      notes: notes || undefined,
    });
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/health/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Log Today's Health</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Movement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Movement
            </CardTitle>
            <CardDescription>Track your physical activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="steps">Steps</Label>
                <Input
                  id="steps"
                  type="number"
                  min="0"
                  max="100000"
                  placeholder="10000"
                  value={steps || ""}
                  onChange={(e) => setSteps(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workoutMinutes">Workout (minutes)</Label>
                <Input
                  id="workoutMinutes"
                  type="number"
                  min="0"
                  max="1440"
                  placeholder="30"
                  value={workoutMinutes || ""}
                  onChange={(e) =>
                    setWorkoutMinutes(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workoutType">Workout Type</Label>
              <Input
                id="workoutType"
                placeholder="Running, weightlifting, yoga..."
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Nutrition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Nutrition
            </CardTitle>
            <CardDescription>Track your food and water intake</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mealsLogged">Meals Logged</Label>
                <Input
                  id="mealsLogged"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="3"
                  value={mealsLogged || ""}
                  onChange={(e) =>
                    setMealsLogged(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waterIntakeOz">Water Intake (oz)</Label>
                <Input
                  id="waterIntakeOz"
                  type="number"
                  min="0"
                  max="500"
                  placeholder="64"
                  value={waterIntakeOz || ""}
                  onChange={(e) =>
                    setWaterIntakeOz(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nutrition Quality: {nutritionQuality[0]}/10</Label>
              <Slider
                value={nutritionQuality}
                onValueChange={setNutritionQuality}
                min={1}
                max={10}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                1 = Poor (junk food), 10 = Excellent (whole foods)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hydration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5" />
              Hydration
            </CardTitle>
            <CardDescription>Target: 64+ oz daily (Andrew Huberman)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Water Intake</Label>
                <span className="text-2xl font-bold">{waterIntakeOz || 0} oz</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min((waterIntakeOz || 0) / 64, 1) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {waterIntakeOz && waterIntakeOz >= 64
                  ? "✓ Hydration goal met!"
                  : `${64 - (waterIntakeOz || 0)} oz to go`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Sleep
            </CardTitle>
            <CardDescription>Track your sleep quality and duration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sleepHours">Sleep Duration (minutes)</Label>
                <Input
                  id="sleepHours"
                  type="number"
                  min="0"
                  max="1440"
                  placeholder="480 (8 hours)"
                  value={sleepHours || ""}
                  onChange={(e) =>
                    setSleepHours(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {sleepHours ? `${(sleepHours / 60).toFixed(1)} hours` : "Enter minutes"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wakeTime">Wake Time</Label>
                <Input
                  id="wakeTime"
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value + ":00")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sleep Quality: {sleepQuality[0]}/10</Label>
              <Slider
                value={sleepQuality}
                onValueChange={setSleepQuality}
                min={1}
                max={10}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                1 = Terrible, 10 = Perfect (Matthew Walker)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Energy Level */}
        <Card>
          <CardHeader>
            <CardTitle>Energy Level</CardTitle>
            <CardDescription>How energized do you feel today?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label>Energy: {energyLevel[0]}/10</Label>
            <Slider value={energyLevel} onValueChange={setEnergyLevel} min={1} max={10} step={1} />
            <p className="text-xs text-muted-foreground">
              1 = Exhausted, 10 = Peak energy
            </p>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Any observations or reflections?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Felt great after morning workout. Need to improve sleep consistency..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" size="lg" className="flex-1" disabled={logMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {logMutation.isPending ? "Saving..." : existingLog ? "Update Log" : "Save Log"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/health/dashboard")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
