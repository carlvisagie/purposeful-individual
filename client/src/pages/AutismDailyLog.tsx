import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { Smile, Meh, Frown, Moon, Sun, Zap, Heart, Star, Calendar } from "lucide-react";

export default function AutismDailyLog() {
  const [, params] = useRoute("/autism/daily-log/:id");
  const profileId = parseInt(params?.id || "0");

  const { data: profile } = trpc.autism.getProfile.useQuery({ id: profileId });
  const { data: recentLogs } = trpc.autism.getDailyLogs.useQuery({ profileId, limit: 7 });

  // Form state
  const [mood, setMood] = useState<number>(5);
  const [sleepQuality, setSleepQuality] = useState<number>(5);
  const [sleepHours, setSleepHours] = useState<string>("");
  const [meltdownCount, setMeltdownCount] = useState<number>(0);
  const [communicationAttempts, setCommunicationAttempts] = useState<number>(0);
  const [wins, setWins] = useState<string>("");
  const [challenges, setChallenges] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const saveDailyLog = trpc.autism.saveDailyLog.useMutation({
    onSuccess: () => {
      toast.success("Daily log saved! 🎉");
      // Reset form
      setMood(5);
      setSleepQuality(5);
      setSleepHours("");
      setMeltdownCount(0);
      setCommunicationAttempts(0);
      setWins("");
      setChallenges("");
      setNotes("");
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyLog.mutate({
      profileId,
      date: new Date(),
      mood,
      sleepQuality,
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      meltdownCount,
      communicationAttempts,
      wins,
      challenges,
      notes,
    });
  };

  if (!profile) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const MoodButton = ({ value, icon: Icon, label }: { value: number; icon: any; label: string }) => (
    <button
      type="button"
      onClick={() => setMood(value)}
      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
        mood === value
          ? "border-blue-600 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <Icon className={`h-8 w-8 ${mood === value ? "text-blue-600" : "text-gray-400"}`} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const ScaleButton = ({ value, current, onChange }: { value: number; current: number; onChange: (v: number) => void }) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex-1 py-2 px-3 rounded border-2 transition-all ${
        current === value
          ? "border-blue-600 bg-blue-50 text-blue-600 font-medium"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {value}
    </button>
  );

  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Daily Log - {profile.childName}</h1>
        <p className="text-muted-foreground mt-2">
          Quick daily tracking to identify patterns and celebrate progress
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-red-600" />
                  How was {profile.childName}'s mood today?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <MoodButton value={3} icon={Frown} label="Difficult" />
                  <MoodButton value={5} icon={Meh} label="Okay" />
                  <MoodButton value={8} icon={Smile} label="Great" />
                </div>
              </CardContent>
            </Card>

            {/* Sleep */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Moon className="mr-2 h-5 w-5 text-indigo-600" />
                  Sleep Last Night
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Sleep Quality (1-10)</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <ScaleButton
                        key={value}
                        value={value}
                        current={sleepQuality}
                        onChange={setSleepQuality}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="sleepHours">Hours Slept (optional)</Label>
                  <input
                    id="sleepHours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border rounded-md"
                    placeholder="e.g., 8.5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Behaviors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-yellow-600" />
                  Behaviors Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meltdowns">Meltdowns/Tantrums</Label>
                  <input
                    id="meltdowns"
                    type="number"
                    min="0"
                    value={meltdownCount}
                    onChange={(e) => setMeltdownCount(parseInt(e.target.value) || 0)}
                    className="w-full mt-2 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <Label htmlFor="communication">Communication Attempts</Label>
                  <input
                    id="communication"
                    type="number"
                    min="0"
                    value={communicationAttempts}
                    onChange={(e) => setCommunicationAttempts(parseInt(e.target.value) || 0)}
                    className="w-full mt-2 px-3 py-2 border rounded-md"
                    placeholder="Words, gestures, pointing, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Wins & Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Today's Wins & Challenges
                </CardTitle>
                <CardDescription>
                  Celebrate the small victories - they're actually huge!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="wins">Wins Today 🎉</Label>
                  <Textarea
                    id="wins"
                    value={wins}
                    onChange={(e) => setWins(e.target.value)}
                    placeholder="e.g., Made eye contact when I called his name, tried a new food, played with sibling for 5 minutes..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="challenges">Challenges Today</Label>
                  <Textarea
                    id="challenges"
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    placeholder="e.g., Refused to wear shoes, had meltdown at grocery store..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any other observations, patterns noticed, questions for therapist..."
                  rows={4}
                />
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={saveDailyLog.isLoading}>
              {saveDailyLog.isLoading ? "Saving..." : "Save Daily Log"}
            </Button>
          </form>
        </div>

        {/* Recent Logs Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Recent Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentLogs && recentLogs.length > 0 ? (
                <div className="space-y-4">
                  {recentLogs.map((log: any) => (
                    <div key={log.id} className="pb-4 border-b last:border-0">
                      <div className="text-sm font-medium">
                        {new Date(log.date).toLocaleDateString()}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Mood: </span>
                          <span className="font-medium">{log.mood}/10</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sleep: </span>
                          <span className="font-medium">{log.sleepQuality}/10</span>
                        </div>
                      </div>
                      {log.wins && (
                        <div className="mt-2 text-xs">
                          <div className="text-green-600 font-medium">Win:</div>
                          <div className="text-muted-foreground line-clamp-2">{log.wins}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No logs yet. Start tracking today!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
