import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Brain, 
  TrendingUp, 
  Users,
  CheckCircle2,
  Zap,
  MessageCircle,
  AlertCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function Relationships() {
  const [relationshipType, setRelationshipType] = useState("");
  const [quality, setQuality] = useState(5);
  const [interaction, setInteraction] = useState("");
  const [notes, setNotes] = useState("");

  // Self-learning integration
  const { trackInteraction, getRecommendations, effectiveness } = useModuleLearning('relationships');

  // Habit formation integration
  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      toast.success("Relationship habit created!");
      trackInteraction('habit_created', { type: 'relationships' });
    }
  });

  const logRelationshipMutation = trpc.wellness.logRelationship.useMutation({
    onSuccess: () => {
      toast.success("Relationship interaction logged");
      trackInteraction('relationship_logged', { 
        type: relationshipType, 
        quality,
        interaction 
      });
      setRelationshipType("");
      setQuality(5);
      setInteraction("");
      setNotes("");
    }
  });

  const handleLogRelationship = () => {
    if (!relationshipType || !interaction) {
      toast.error("Please select relationship type and interaction");
      return;
    }

    logRelationshipMutation.mutate({
      type: relationshipType,
      quality,
      interaction,
      notes,
      timestamp: Date.now()
    });
  };

  const handleCreateConnectionHabit = () => {
    createHabitMutation.mutate({
      name: "Daily Meaningful Connection",
      description: "Have one meaningful conversation daily. Quality > quantity for relationships.",
      frequency: "daily",
      category: "relationships",
      evidenceLevel: "A",
      researchBasis: "Strong social connections increase longevity and happiness (Holt-Lunstad et al., 2010)"
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Relationship Health</h1>
          <p className="text-muted-foreground">Evidence-based relationship tracking & improvement</p>
        </div>
      </div>

      {/* Evidence-Based Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-blue-900">Relationships = Longevity</p>
              <p className="text-sm text-blue-800">
                Strong social connections are the #1 predictor of happiness and longevity - more than exercise, 
                diet, or not smoking. Research from Harvard's 80-year study shows: "Good relationships keep us 
                happier and healthier. Period."
              </p>
              <p className="text-sm text-blue-800">
                <strong>Key insight:</strong> Quality matters more than quantity. One deep connection beats 100 
                shallow ones.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Learning Insights */}
      {effectiveness > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Your Relationship Patterns</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              <p>Tracking effectiveness: {effectiveness}%</p>
              {getRecommendations().map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="track">Track Connections</TabsTrigger>
          <TabsTrigger value="skills">Relationship Skills</TabsTrigger>
          <TabsTrigger value="habits">Build Habits</TabsTrigger>
          <TabsTrigger value="science">The Science</TabsTrigger>
        </TabsList>

        {/* Track Relationships */}
        <TabsContent value="track" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Log Relationship Interaction
              </CardTitle>
              <CardDescription>
                Track meaningful connections to build awareness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Relationship Type</Label>
                <Select value={relationshipType} onValueChange={setRelationshipType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Who did you connect with?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="romantic_partner">Romantic Partner</SelectItem>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="close_friend">Close Friend</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="colleague">Colleague/Coworker</SelectItem>
                    <SelectItem value="acquaintance">Acquaintance</SelectItem>
                    <SelectItem value="mentor">Mentor/Coach</SelectItem>
                    <SelectItem value="community">Community/Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Interaction Quality (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant={quality > 7 ? "default" : quality > 4 ? "secondary" : "outline"}>
                    {quality}/10
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  1 = Draining/conflict, 10 = Deeply meaningful
                </p>
              </div>

              <div className="space-y-2">
                <Label>Type of Interaction</Label>
                <Select value={interaction} onValueChange={setInteraction}>
                  <SelectTrigger>
                    <SelectValue placeholder="What did you do?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deep_conversation">Deep Conversation</SelectItem>
                    <SelectItem value="quality_time">Quality Time Together</SelectItem>
                    <SelectItem value="shared_activity">Shared Activity/Hobby</SelectItem>
                    <SelectItem value="phone_call">Phone/Video Call</SelectItem>
                    <SelectItem value="text_message">Text/Message</SelectItem>
                    <SelectItem value="helped_them">Helped/Supported Them</SelectItem>
                    <SelectItem value="they_helped">They Helped/Supported Me</SelectItem>
                    <SelectItem value="expressed_appreciation">Expressed Appreciation</SelectItem>
                    <SelectItem value="resolved_conflict">Resolved Conflict</SelectItem>
                    <SelectItem value="casual_chat">Casual Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What made this meaningful? What did you learn?"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleLogRelationship} 
                className="w-full"
                disabled={logRelationshipMutation.isPending}
              >
                {logRelationshipMutation.isPending ? "Logging..." : "Log Interaction"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relationship Skills */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Evidence-Based Relationship Skills
              </CardTitle>
              <CardDescription>
                Research-backed practices for healthy relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Active Listening */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Active Listening</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The skill:</strong> Listen to understand, not to respond. Reflect back what you heard. 
                  Ask clarifying questions. Put phone away. Make eye contact.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> People want to feel heard more than they want advice. Active 
                  listening builds trust and emotional intimacy.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Active listening increases relationship satisfaction (Weger et al., 2014)
                </p>
              </div>

              {/* Gottman's 5:1 Ratio */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">The 5:1 Positivity Ratio</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The rule:</strong> For every 1 negative interaction (criticism, complaint), have at 
                  least 5 positive ones (appreciation, affection, humor, support).
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> Negative interactions have 5x more impact than positive ones. 
                  This ratio predicts relationship success with 94% accuracy.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Gottman & Levenson (1992), 40 years of couples research
                </p>
              </div>

              {/* Vulnerability */}
              <div className="p-4 border-2 border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Vulnerability & Authenticity</h3>
                  <Badge className="bg-blue-600">Level B Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The skill:</strong> Share your true feelings, fears, and needs. Drop the mask. Ask for 
                  help when you need it.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> Vulnerability creates intimacy. Connection happens when we let 
                  people see the real us, not the perfect version.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Vulnerability increases closeness and trust (Brené Brown, 2012)
                </p>
              </div>

              {/* Repair Attempts */}
              <div className="p-4 border-2 border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Repair Attempts After Conflict</h3>
                  <Badge className="bg-blue-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The skill:</strong> After an argument, make a repair attempt: apologize, use humor, 
                  show affection, or acknowledge the other's perspective.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> All couples fight. What matters is how you repair. Successful 
                  repair attempts predict relationship longevity.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Gottman Institute, repair attempts are critical for relationship success
                </p>
              </div>

              {/* Quality Time */}
              <div className="p-4 border-2 border-purple-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Undivided Attention (No Phones)</h3>
                  <Badge className="bg-purple-600">Level B Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The practice:</strong> Give 15-30 minutes of undivided attention daily. No phones, no 
                  TV, no distractions. Just presence.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> Presence is the ultimate gift. Phubbing (phone snubbing) erodes 
                  relationship satisfaction.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Phone use during interactions reduces relationship quality (Roberts & David, 2016)
                </p>
              </div>

              {/* Appreciation */}
              <div className="p-4 border-2 border-pink-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Express Appreciation Daily</h3>
                  <Badge className="bg-pink-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The practice:</strong> Notice and verbally appreciate something your partner/friend did. 
                  Be specific: "I appreciate that you..." not just "thanks."
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> Feeling appreciated is a core human need. Expressing gratitude 
                  strengthens bonds and increases relationship satisfaction.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Gratitude expressions increase relationship quality (Algoe et al., 2010)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Build Relationship Habits */}
        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Build Relationship Habits
              </CardTitle>
              <CardDescription>
                Small daily actions compound into strong bonds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <p className="text-sm text-pink-900">
                  <strong>Relationship Maintenance:</strong> Relationships are like plants - they need consistent 
                  care. Daily small actions (texts, appreciation, quality time) matter more than occasional grand gestures.
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold">Daily Meaningful Connection</h3>
                <p className="text-sm text-muted-foreground">
                  Have one meaningful conversation daily. Quality > quantity for relationships.
                </p>
                <Button onClick={handleCreateConnectionHabit} variant="outline" className="w-full">
                  Create Daily Connection Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold">Other Relationship Habits</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Morning check-in</strong> - "How are you feeling today?"</li>
                  <li>• <strong>Express appreciation</strong> - Notice one thing they did well</li>
                  <li>• <strong>Phone-free time</strong> - 30 min undivided attention</li>
                  <li>• <strong>Weekly date</strong> - Protect couple/friend time</li>
                  <li>• <strong>Ask deeper questions</strong> - Beyond "how was your day?"</li>
                  <li>• <strong>Physical affection</strong> - Hugs, touch (if appropriate)</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Research:</strong> Couples who spend 5 hours/week of quality time together have 
                  significantly higher relationship satisfaction (Gottman Institute)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* The Science */}
        <TabsContent value="science" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                The Science of Relationships
              </CardTitle>
              <CardDescription>
                Why relationships matter so much
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border-2 border-blue-200 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">Harvard's 80-Year Study</h3>
                <p className="text-sm text-muted-foreground">
                  The longest study on happiness (1938-present) followed 724 people for 80+ years. The #1 finding? 
                  <strong> "Good relationships keep us happier and healthier. Period."</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Strong relationships predicted happiness and longevity better than social class, IQ, genes, 
                  exercise, or diet. Quality matters more than quantity - one close friend beats 100 acquaintances.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Waldinger & Schulz, Harvard Study of Adult Development
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Proven Benefits (Level A Evidence)</h3>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Longevity</h4>
                  <p className="text-sm text-muted-foreground">
                    Strong social connections increase lifespan by 50%. Loneliness is as deadly as smoking 15 
                    cigarettes/day (Holt-Lunstad et al., 2010)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Mental Health</h4>
                  <p className="text-sm text-muted-foreground">
                    Social support reduces depression, anxiety, and stress. Protects against PTSD and trauma 
                    (Ozbay et al., 2007)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Physical Health</h4>
                  <p className="text-sm text-muted-foreground">
                    Reduces inflammation, boosts immune function, lowers blood pressure, improves cardiovascular 
                    health (Uchino, 2006)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Cognitive Function</h4>
                  <p className="text-sm text-muted-foreground">
                    Social engagement protects against cognitive decline and dementia. Lonely people have 64% 
                    higher dementia risk (Wilson et al., 2007)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Happiness</h4>
                  <p className="text-sm text-muted-foreground">
                    Relationship quality is the strongest predictor of life satisfaction - stronger than income, 
                    career success, or health (Diener & Seligman, 2002)
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">The Loneliness Epidemic</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Despite being more "connected" than ever (social media), loneliness is at record highs. 
                      Digital connections don't replace face-to-face intimacy. Quality > quantity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold mb-2">Key Researchers</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Dr. John Gottman</strong> - Couples research, 40+ years, 94% accuracy predicting divorce</li>
                  <li>• <strong>Dr. Robert Waldinger</strong> - Harvard happiness study director</li>
                  <li>• <strong>Dr. Brené Brown</strong> - Vulnerability, shame, connection research</li>
                  <li>• <strong>Dr. Sue Johnson</strong> - Emotionally Focused Therapy (EFT)</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">The Most Important Investment</p>
                    <p className="text-sm text-green-800 mt-1">
                      You can have all the money, success, and health in the world - but without meaningful 
                      relationships, you won't be happy. Invest in your relationships like your life depends on it. 
                      Because it does.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
