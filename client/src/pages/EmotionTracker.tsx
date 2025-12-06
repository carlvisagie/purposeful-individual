import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Heart,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

/**
 * Emotion Tracker - Daily emotional check-ins
 * Features:
 * - Mood scale (1-10) with emoji selector
 * - Emotion type selection
 * - Trigger identification
 * - Physical sensations tracking
 * - Thought patterns
 * - Behavior tracking
 * - History timeline view
 */
export default function EmotionTracker() {
  const { user, loading: authLoading } = useAuth();
  const clientId = user?.id || 0; // Get from authenticated user
  
  // Form state
  const [emotionType, setEmotionType] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [trigger, setTrigger] = useState("");
  const [physicalSensations, setPhysicalSensations] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [behaviors, setBehaviors] = useState("");

  // Fetch recent emotion logs
  const { data: logsData, refetch } = trpc.emotionLogs.list.useQuery(
    { clientId },
    { enabled: !!user }
  );

  // Create emotion log mutation
  const createLogMutation = trpc.emotionLogs.create.useMutation({
    onSuccess: () => {
      toast.success("Emotion logged successfully!");
      // Reset form
      setEmotionType("");
      setIntensity(5);
      setTrigger("");
      setPhysicalSensations("");
      setThoughts("");
      setBehaviors("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to log emotion");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emotionType) {
      toast.error("Please select an emotion type");
      return;
    }

    createLogMutation.mutate({
      clientId,
      emotionType,
      intensity,
      trigger: trigger || undefined,
      physicalSensations: physicalSensations || undefined,
      thoughts: thoughts || undefined,
      behaviors: behaviors || undefined,
    });
  };

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  const emotionLogs = logsData || [];

  // Emotion type options
  const emotionTypes = [
    { value: "joy", label: "Joy", emoji: "😊", color: "bg-yellow-100 text-yellow-800" },
    { value: "sadness", label: "Sadness", emoji: "😢", color: "bg-blue-100 text-blue-800" },
    { value: "anger", label: "Anger", emoji: "😠", color: "bg-red-100 text-red-800" },
    { value: "fear", label: "Fear", emoji: "😨", color: "bg-purple-100 text-purple-800" },
    { value: "anxiety", label: "Anxiety", emoji: "😰", color: "bg-orange-100 text-orange-800" },
    { value: "disgust", label: "Disgust", emoji: "🤢", color: "bg-green-100 text-green-800" },
    { value: "surprise", label: "Surprise", emoji: "😲", color: "bg-pink-100 text-pink-800" },
    { value: "contentment", label: "Contentment", emoji: "😌", color: "bg-teal-100 text-teal-800" },
  ];

  // Get intensity emoji
  const getIntensityEmoji = (level: number) => {
    if (level <= 2) return <Smile className="h-6 w-6 text-green-500" />;
    if (level <= 4) return <Meh className="h-6 w-6 text-yellow-500" />;
    if (level <= 7) return <Frown className="h-6 w-6 text-orange-500" />;
    return <AlertCircle className="h-6 w-6 text-red-500" />;
  };

  const getIntensityColor = (level: number) => {
    if (level <= 2) return "bg-green-500";
    if (level <= 4) return "bg-yellow-500";
    if (level <= 7) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-rose-500" />
              <span className="text-xl font-bold text-gray-900">Emotion Tracker</span>
            </div>
            <Button variant="ghost" onClick={() => (window.location.href = "/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Check-In Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Emotional Check-In
              </CardTitle>
              <CardDescription>
                Take a moment to acknowledge and track how you're feeling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Emotion Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What emotion are you experiencing?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {emotionTypes.map((emotion) => (
                      <button
                        key={emotion.value}
                        type="button"
                        onClick={() => setEmotionType(emotion.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          emotionType === emotion.value
                            ? `${emotion.color} border-gray-400`
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{emotion.emoji}</span>
                          <span className="text-sm font-medium">{emotion.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How intense is this feeling? ({intensity}/10)
                  </label>
                  <div className="flex items-center gap-4">
                    {getIntensityEmoji(intensity)}
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${
                          intensity <= 2
                            ? "#10b981"
                            : intensity <= 4
                            ? "#f59e0b"
                            : intensity <= 7
                            ? "#f97316"
                            : "#ef4444"
                        } 0%, ${
                          intensity <= 2
                            ? "#10b981"
                            : intensity <= 4
                            ? "#f59e0b"
                            : intensity <= 7
                            ? "#f97316"
                            : "#ef4444"
                        } ${intensity * 10}%, #e5e7eb ${intensity * 10}%, #e5e7eb 100%)`,
                      }}
                    />
                    <span className="text-2xl font-bold text-gray-700">{intensity}</span>
                  </div>
                </div>

                {/* Trigger */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What triggered this emotion? (Optional)
                  </label>
                  <Textarea
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    placeholder="E.g., Work deadline, conversation with friend, news article..."
                    className="min-h-[80px]"
                  />
                </div>

                {/* Physical Sensations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Physical sensations? (Optional)
                  </label>
                  <Textarea
                    value={physicalSensations}
                    onChange={(e) => setPhysicalSensations(e.target.value)}
                    placeholder="E.g., Tight chest, racing heart, tension in shoulders..."
                    className="min-h-[60px]"
                  />
                </div>

                {/* Thoughts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What thoughts are you having? (Optional)
                  </label>
                  <Textarea
                    value={thoughts}
                    onChange={(e) => setThoughts(e.target.value)}
                    placeholder="E.g., I can't handle this, I'm not good enough, What if..."
                    className="min-h-[60px]"
                  />
                </div>

                {/* Behaviors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How are you responding? (Optional)
                  </label>
                  <Textarea
                    value={behaviors}
                    onChange={(e) => setBehaviors(e.target.value)}
                    placeholder="E.g., Avoiding people, pacing, deep breathing, journaling..."
                    className="min-h-[60px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600"
                  disabled={createLogMutation.isPending || !emotionType}
                >
                  {createLogMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Log This Emotion
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Emotion History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Emotional History
              </CardTitle>
              <CardDescription>Your emotional journey over time</CardDescription>
            </CardHeader>
            <CardContent>
              {emotionLogs.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No emotions logged yet</p>
                  <p className="text-xs mt-1">Start tracking to see patterns</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {emotionLogs.map((log: any) => {
                    const emotion = emotionTypes.find((e) => e.value === log.emotionType);
                    return (
                      <div
                        key={log.id}
                        className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {emotion && (
                              <Badge className={emotion.color}>
                                {emotion.emoji} {emotion.label}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              {getIntensityEmoji(log.intensity)}
                              <span className="text-sm font-semibold">{log.intensity}/10</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(log.logDate).toLocaleDateString()}
                          </span>
                        </div>
                        {log.trigger && (
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Trigger:</strong> {log.trigger}
                          </p>
                        )}
                        {log.thoughts && (
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Thoughts:</strong> {log.thoughts}
                          </p>
                        )}
                        {log.behaviors && (
                          <p className="text-sm text-gray-700">
                            <strong>Response:</strong> {log.behaviors}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
