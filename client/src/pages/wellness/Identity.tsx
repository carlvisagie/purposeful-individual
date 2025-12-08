import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Compass, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function IdentityPurpose() {
  const [reflection, setReflection] = useState("");
  const { trackInteraction, effectiveness } = useModuleLearning('identity');

  const logReflectionMutation = trpc.wellness.logIdentityReflection.useMutation({
    onSuccess: () => {
      toast.success("Reflection logged");
      trackInteraction('reflection_logged', {});
      setReflection("");
    }
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Identity & Purpose</h1>
          <p className="text-muted-foreground">Discover who you are and why you're here</p>
        </div>
      </div>

      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <p className="text-sm text-purple-900">
            <strong>Purpose = fulfillment.</strong> People with strong sense of purpose live 7+ years longer and 
            have lower rates of depression, anxiety, and chronic disease.
          </p>
        </CardContent>
      </Card>

      {effectiveness > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Clarity: {effectiveness}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Purpose Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Reflect on:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• What activities make you lose track of time?</li>
              <li>• What would you do if money wasn't a concern?</li>
              <li>• What problems do you want to solve in the world?</li>
              <li>• What do people thank you for?</li>
            </ul>
          </div>

          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write your thoughts..."
            rows={6}
          />

          <Button onClick={() => logReflectionMutation.mutate({ reflection, timestamp: Date.now() })} className="w-full">
            Save Reflection
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Finding Purpose Framework</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">1. Ikigai (Japanese Purpose)</h4>
            <p className="text-sm text-muted-foreground">
              Intersection of: What you love + What you're good at + What the world needs + What you can be paid for
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">2. Values Alignment</h4>
            <p className="text-sm text-muted-foreground">
              Identify your core values. Live according to them. Misalignment = suffering.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-1">3. Contribution Over Achievement</h4>
            <p className="text-sm text-muted-foreground">
              Purpose isn't about success - it's about service. How do you help others?
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
