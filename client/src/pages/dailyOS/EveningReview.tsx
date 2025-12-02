import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Sunset, ArrowLeft, Check } from "lucide-react";

export default function EveningReview() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const today = new Date().toISOString().split("T")[0];

  const [wins, setWins] = useState("");
  const [losses, setLosses] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [tomorrowTop3, setTomorrowTop3] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [identityAlignment, setIdentityAlignment] = useState([5]);

  const createMutation = trpc.dailyOS.evening.createReview.useMutation({
    onSuccess: () => {
      toast.success("Evening review saved!");
      utils.dailyOS.evening.getHistory.invalidate();
      navigate("/daily-os/dashboard");
    },
  });

  const handleSubmit = () => {
    createMutation.mutate({
      reviewDate: today,
      wins,
      losses: losses || undefined,
      lessonsLearned: lessonsLearned || undefined,
      tomorrowTop3,
      gratitude: gratitude || undefined,
      identityAlignment: identityAlignment[0],
    });
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/daily-os/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sunset className="h-8 w-8" />
            Evening Review
          </h1>
          <p className="text-muted-foreground">Daily reflection and planning</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="wins">Wins (What went well today?)</Label>
            <Textarea
              id="wins"
              placeholder="Completed project ahead of schedule, great workout, connected with family..."
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="losses">Losses (What didn't go well?)</Label>
            <Textarea
              id="losses"
              placeholder="Skipped meditation, ate junk food, procrastinated on email..."
              value={losses}
              onChange={(e) => setLosses(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessons">Lessons Learned</Label>
            <Textarea
              id="lessons"
              placeholder="Need to prep meals in advance, morning routine sets the tone for the day..."
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tomorrow">Tomorrow's Top 3 Priorities</Label>
            <Textarea
              id="tomorrow"
              placeholder="1. Morning routine by 7am&#10;2. Finish presentation&#10;3. Gym at 5pm"
              value={tomorrowTop3}
              onChange={(e) => setTomorrowTop3(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gratitude">Gratitude (3 things you're grateful for)</Label>
            <Textarea
              id="gratitude"
              placeholder="Health, family, opportunity to grow..."
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Identity Alignment: {identityAlignment[0]}/10</Label>
            <Slider
              value={identityAlignment}
              onValueChange={setIdentityAlignment}
              min={1}
              max={10}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              How aligned were your actions with your ideal identity today?
            </p>
          </div>

          <Button onClick={handleSubmit} size="lg" className="w-full" disabled={createMutation.isPending || !wins || !tomorrowTop3}>
            <Check className="h-4 w-4 mr-2" />
            {createMutation.isPending ? "Saving..." : "Complete Review"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
