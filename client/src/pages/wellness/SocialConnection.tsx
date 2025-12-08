import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function SocialConnection() {
  const [connectionType, setConnectionType] = useState("");
  const [quality, setQuality] = useState(5);
  const [notes, setNotes] = useState("");

  const { trackInteraction, effectiveness } = useModuleLearning('social_connection');

  const logConnectionMutation = trpc.wellness.logSocialConnection.useMutation({
    onSuccess: () => {
      toast.success("Social connection logged");
      trackInteraction('connection_logged', { type: connectionType, quality });
      setConnectionType("");
      setQuality(5);
      setNotes("");
    }
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Social Connection</h1>
          <p className="text-muted-foreground">Track meaningful social interactions</p>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Social connection is vital for health.</strong> Loneliness is as deadly as smoking 15 cigarettes/day. 
            Quality > quantity - one deep friendship beats 100 acquaintances.
          </p>
        </CardContent>
      </Card>

      {effectiveness > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Connection Patterns: {effectiveness}%</h3>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="track">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="track">Track Connection</TabsTrigger>
          <TabsTrigger value="tips">Connection Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="track" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Log Social Interaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={connectionType} onValueChange={setConnectionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type of connection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deep_conversation">Deep Conversation</SelectItem>
                  <SelectItem value="quality_time">Quality Time</SelectItem>
                  <SelectItem value="group_activity">Group Activity</SelectItem>
                  <SelectItem value="helped_someone">Helped Someone</SelectItem>
                  <SelectItem value="received_support">Received Support</SelectItem>
                  <SelectItem value="made_new_friend">Made New Friend</SelectItem>
                </SelectContent>
              </Select>

              <div>
                <label className="text-sm font-medium">Quality (1-10): {quality}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What made this meaningful?"
                rows={3}
              />

              <Button onClick={() => logConnectionMutation.mutate({ type: connectionType, quality, notes, timestamp: Date.now() })} className="w-full">
                Log Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Connection Strategies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-1">Weekly Social Ritual</h4>
                <p className="text-sm text-muted-foreground">
                  Schedule recurring hangouts. Consistency builds deep bonds.
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-1">Reach Out First</h4>
                <p className="text-sm text-muted-foreground">
                  Don't wait for invites. Initiate plans. Most people want connection but wait for others.
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-1">Ask Deeper Questions</h4>
                <p className="text-sm text-muted-foreground">
                  Skip small talk. Ask: "What are you excited about?" "What's challenging you?"
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
