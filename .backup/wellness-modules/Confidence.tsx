import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function ConfidenceBuilding() {
  const [winType, setWinType] = useState("");
  const [description, setDescription] = useState("");
  const { trackInteraction, effectiveness } = useModuleLearning('confidence');

  const logWinMutation = trpc.wellness.logConfidenceWin.useMutation({
    onSuccess: () => {
      toast.success("Win logged - building confidence!");
      trackInteraction('win_logged', { type: winType });
      setWinType("");
      setDescription("");
    }
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Confidence Building</h1>
          <p className="text-muted-foreground">Track wins & build self-efficacy</p>
        </div>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-900">
            <strong>Confidence = evidence.</strong> Track small wins daily. Your brain learns: "I can do hard things."
          </p>
        </CardContent>
      </Card>

      {effectiveness > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Confidence Level: {effectiveness}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Log Today's Win</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={winType} onValueChange={setWinType}>
            <SelectTrigger>
              <SelectValue placeholder="Type of win" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="faced_fear">Faced a Fear</SelectItem>
              <SelectItem value="spoke_up">Spoke Up/Set Boundary</SelectItem>
              <SelectItem value="tried_new">Tried Something New</SelectItem>
              <SelectItem value="completed_goal">Completed a Goal</SelectItem>
              <SelectItem value="helped_someone">Helped Someone</SelectItem>
              <SelectItem value="received_compliment">Received Compliment</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your win..."
            rows={3}
          />

          <Button onClick={() => logWinMutation.mutate({ type: winType, description, timestamp: Date.now() })} className="w-full">
            Log Win
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confidence Strategies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Small Wins Daily</h4>
            <p className="text-sm text-muted-foreground">Track every win. Evidence builds confidence.</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Face Fears Gradually</h4>
            <p className="text-sm text-muted-foreground">Exposure therapy works. Start small, build up.</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">Power Posing</h4>
            <p className="text-sm text-muted-foreground">2 min power pose before challenges increases confidence (Cuddy, 2012)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
