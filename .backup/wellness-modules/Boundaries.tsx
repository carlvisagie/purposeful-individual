import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shield, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function Boundaries() {
  const [entry, setEntry] = useState("");
  const { trackInteraction, effectiveness } = useModuleLearning('boundaries');

  const logEntryMutation = trpc.wellness.logBoundaries.useMutation({
    onSuccess: () => {
      toast.success("Entry logged");
      trackInteraction('logged', {});
      setEntry("");
    }
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Boundaries</h1>
          <p className="text-muted-foreground">Track and improve</p>
        </div>
      </div>

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
          <CardTitle>Log Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write your entry..."
            rows={4}
          />
          <Button onClick={() => logEntryMutation.mutate({ entry, timestamp: Date.now() })} className="w-full">
            Save Entry
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidence-Based Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Track Consistently</h4>
            <p className="text-sm text-muted-foreground">Daily tracking builds awareness and drives improvement.</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Small Changes Compound</h4>
            <p className="text-sm text-muted-foreground">1% better every day = 37x better in a year.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
