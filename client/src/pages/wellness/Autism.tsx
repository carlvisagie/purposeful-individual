import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function AutismSupport() {
  const [supportType, setSupportType] = useState("");
  const [notes, setNotes] = useState("");
  const { trackInteraction, effectiveness } = useModuleLearning('autism');

  const logSupportMutation = trpc.wellness.logAutismSupport.useMutation({
    onSuccess: () => {
      toast.success("Support logged");
      trackInteraction('logged', { type: supportType });
      setSupportType("");
      setNotes("");
    }
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Autism Support</h1>
          <p className="text-muted-foreground">Evidence-based autism interventions</p>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Neurodiversity-affirming approach.</strong> Autism is a difference, not a deficit. 
            Focus on strengths, accommodate needs, celebrate uniqueness.
          </p>
        </CardContent>
      </Card>

      {effectiveness > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Progress: {effectiveness}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Log Support Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={supportType} onValueChange={setSupportType}>
            <SelectTrigger>
              <SelectValue placeholder="What helped today?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sensory">Sensory Accommodation</SelectItem>
              <SelectItem value="routine">Routine/Structure</SelectItem>
              <SelectItem value="social">Social Skills Practice</SelectItem>
              <SelectItem value="communication">Communication Support</SelectItem>
              <SelectItem value="special_interest">Special Interest Time</SelectItem>
              <SelectItem value="self_regulation">Self-Regulation Strategy</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What worked? What didn't?"
            rows={4}
          />

          <Button onClick={() => logSupportMutation.mutate({ type: supportType, notes, timestamp: Date.now() })} className="w-full">
            Log Support
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidence-Based Strategies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Sensory Accommodations</h4>
            <p className="text-sm text-muted-foreground">
              Noise-canceling headphones, weighted blankets, fidget tools. Respect sensory needs.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Predictable Routines</h4>
            <p className="text-sm text-muted-foreground">
              Visual schedules, advance warnings for changes. Predictability reduces anxiety.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Special Interests as Strengths</h4>
            <p className="text-sm text-muted-foreground">
              Leverage deep interests for learning, career, connection. Not "obsessions" - passions!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
