import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { CheckCircle2, Brain, Heart, Zap, Target } from "lucide-react";

/**
 * DAILY CHECK-IN PAGE
 * 
 * Part of the PurposefulLive Transformation Protocol
 * Tracks daily progress, emotions, identity alignment, and habit completion
 * 
 * Based on:
 * - BJ Fogg's Behavior Model (B=MAP)
 * - James Clear's Identity-Based Habits
 * - Andrew Huberman's Neurochemical Optimization
 */
export default function DailyCheckIn() {
  const [, navigate] = useLocation();
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [moodLevel, setMoodLevel] = useState([5]);
  const [focusLevel, setFocusLevel] = useState([5]);
  const [identityAlignment, setIdentityAlignment] = useState([5]);
  const [reflection, setReflection] = useState("");
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");

  const createCheckIn = trpc.identity.createDailyCheckIn.useMutation({
    onSuccess: () => {
      navigate("/transformation/dashboard");
    },
  });

  const handleSubmit = () => {
    createCheckIn.mutate({
      energyLevel: energyLevel[0],
      moodLevel: moodLevel[0],
      focusLevel: focusLevel[0],
      identityAlignment: identityAlignment[0],
      reflection,
      wins,
      challenges,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Daily Check-In</h1>
          <p className="text-gray-400 text-lg">
            Track your transformation journey • Build identity-based habits
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Energy & State Assessment */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Your Current State
            </h2>

            <div className="space-y-6">
              {/* Energy Level */}
              <div>
                <Label className="text-white mb-2 block">
                  Energy Level: {energyLevel[0]}/10
                </Label>
                <Slider
                  value={energyLevel}
                  onValueChange={setEnergyLevel}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-gray-400 mt-1">
                  How energized do you feel right now?
                </p>
              </div>

              {/* Mood Level */}
              <div>
                <Label className="text-white mb-2 block">
                  Mood Level: {moodLevel[0]}/10
                </Label>
                <Slider
                  value={moodLevel}
                  onValueChange={setMoodLevel}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-gray-400 mt-1">
                  How positive is your emotional state?
                </p>
              </div>

              {/* Focus Level */}
              <div>
                <Label className="text-white mb-2 block">
                  Focus Level: {focusLevel[0]}/10
                </Label>
                <Slider
                  value={focusLevel}
                  onValueChange={setFocusLevel}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-gray-400 mt-1">
                  How clear and focused is your mind?
                </p>
              </div>
            </div>
          </Card>

          {/* Identity Alignment */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Identity Alignment
            </h2>

            <div>
              <Label className="text-white mb-2 block">
                How aligned are you with your desired identity today? {identityAlignment[0]}/10
              </Label>
              <Slider
                value={identityAlignment}
                onValueChange={setIdentityAlignment}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-gray-400 mt-1">
                Are you showing up as the person you want to become?
              </p>
            </div>
          </Card>

          {/* Reflection */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-500" />
              Daily Reflection
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">
                  Today's Wins (What went well?)
                </Label>
                <Textarea
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  placeholder="Celebrate your progress, no matter how small..."
                  className="bg-gray-900/50 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">
                  Today's Challenges (What was difficult?)
                </Label>
                <Textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="What obstacles did you face?"
                  className="bg-gray-900/50 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">
                  Overall Reflection
                </Label>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What did you learn today? How are you growing?"
                  className="bg-gray-900/50 border-gray-600 text-white min-h-[120px]"
                />
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/transformation/dashboard")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCheckIn.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {createCheckIn.isPending ? (
                "Saving..."
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Complete Check-In
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
