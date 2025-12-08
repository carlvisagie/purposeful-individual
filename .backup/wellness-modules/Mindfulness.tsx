import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function MindfulnessPractice() {
  const [practice, setPractice] = useState("");
  const { trackInteraction, effectiveness } = useModuleLearning('mindfulness');

  const logPracticeMutation = trpc.wellness.logMindfulness.useMutation({
    onSuccess: () => {
      toast.success("Mindfulness practice logged");
      trackInteraction('logged', {});
      setPractice("");
    }
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <Eye className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Mindfulness Practice</h1>
          <p className="text-muted-foreground">Present moment awareness in daily life</p>
        </div>
      </div>

      <Card className="border-teal-200 bg-teal-50">
        <CardContent className="pt-6">
          <p className="text-sm text-teal-900">
            <strong>Mindfulness = paying attention, on purpose, without judgment.</strong> Bring meditation 
            into daily life - eating, walking, listening, working mindfully.
          </p>
        </CardContent>
      </Card>

      {effectiveness > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Mindfulness: {effectiveness}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Log Mindful Moment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={practice}
            onChange={(e) => setPractice(e.target.value)}
            placeholder="When were you fully present today? What did you notice?"
            rows={4}
          />

          <Button onClick={() => logPracticeMutation.mutate({ practice, timestamp: Date.now() })} className="w-full">
            Log Mindful Moment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mindfulness in Daily Life</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Mindful Eating</h4>
            <p className="text-sm text-muted-foreground">
              Eat one meal without screens. Notice taste, texture, smell. Chew slowly.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Mindful Walking</h4>
            <p className="text-sm text-muted-foreground">
              Feel each step. Notice surroundings. No phone, no podcast - just walking.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Mindful Listening</h4>
            <p className="text-sm text-muted-foreground">
              Listen to understand, not respond. Notice when your mind wanders from the conversation.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">STOP Practice</h4>
            <p className="text-sm text-muted-foreground">
              Stop. Take a breath. Observe (body, thoughts, emotions). Proceed mindfully.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
