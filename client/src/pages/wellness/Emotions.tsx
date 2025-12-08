import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function EmotionsTracking() {
  const [emotion, setEmotion] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [trigger, setTrigger] = useState("");
  const { trackInteraction, effectiveness } = useModuleLearning('emotions');

  const logEmotionMutation = trpc.wellness.logEmotion.useMutation({
    onSuccess: () => {
      toast.success("Emotion logged");
      trackInteraction('logged', { emotion, intensity });
      setEmotion("");
      setIntensity(5);
      setTrigger("");
    }
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Emotions Tracking</h1>
          <p className="text-muted-foreground">Build emotional awareness & regulation</p>
        </div>
      </div>

      <Card className="border-pink-200 bg-pink-50">
        <CardContent className="pt-6">
          <p className="text-sm text-pink-900">
            <strong>Name it to tame it.</strong> Research shows: labeling emotions reduces their intensity 
            and improves emotional regulation (Lieberman et al., 2007)
          </p>
        </CardContent>
      </Card>

      {effectiveness > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Emotional Awareness: {effectiveness}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Log Current Emotion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={emotion} onValueChange={setEmotion}>
            <SelectTrigger>
              <SelectValue placeholder="What are you feeling?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="joy">Joy/Happiness</SelectItem>
              <SelectItem value="sadness">Sadness</SelectItem>
              <SelectItem value="anger">Anger/Frustration</SelectItem>
              <SelectItem value="fear">Fear/Anxiety</SelectItem>
              <SelectItem value="disgust">Disgust</SelectItem>
              <SelectItem value="surprise">Surprise</SelectItem>
              <SelectItem value="shame">Shame/Guilt</SelectItem>
              <SelectItem value="excitement">Excitement</SelectItem>
              <SelectItem value="contentment">Contentment/Peace</SelectItem>
              <SelectItem value="overwhelm">Overwhelm</SelectItem>
            </SelectContent>
          </Select>

          <div>
            <label className="text-sm font-medium">Intensity (1-10): {intensity}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <Textarea
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="What triggered this emotion?"
            rows={3}
          />

          <Button onClick={() => logEmotionMutation.mutate({ emotion, intensity, trigger, timestamp: Date.now() })} className="w-full">
            Log Emotion
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emotional Regulation Strategies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Name It to Tame It</h4>
            <p className="text-sm text-muted-foreground">
              Labeling emotions reduces amygdala activity. Just naming feelings helps regulate them.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Feel, Don't Fix</h4>
            <p className="text-sm text-muted-foreground">
              Emotions aren't problems to solve. Allow yourself to feel them fully.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Box Breathing</h4>
            <p className="text-sm text-muted-foreground">
              Inhale 4, hold 4, exhale 4, hold 4. Calms nervous system instantly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
