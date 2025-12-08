/**
 * Anxiety Management Module
 * Track anxiety levels, triggers, and coping strategies
 */

import { useState } from "react";
import { useModuleLearning, useCrossModuleInsights } from "@/hooks/useModuleLearning";
import { FeedbackWidget, CrossModuleInsights } from "@/components/FeedbackWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Wind,
  Home,
  Plus,
  TrendingDown,
  TrendingUp,
  Activity,
  Brain,
  Heart,
  AlertCircle,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for demonstration
const mockAnxietyData = [
  { date: "Mon", level: 6, triggers: 2 },
  { date: "Tue", level: 7, triggers: 3 },
  { date: "Wed", level: 5, triggers: 1 },
  { date: "Thu", level: 8, triggers: 4 },
  { date: "Fri", level: 4, triggers: 1 },
  { date: "Sat", level: 3, triggers: 0 },
  { date: "Sun", level: 5, triggers: 2 },
];

const mockTriggers = [
  { id: 1, name: "Work deadline", frequency: 12, lastOccurred: "2 days ago" },
  { id: 2, name: "Social situations", frequency: 8, lastOccurred: "1 week ago" },
  { id: 3, name: "Financial stress", frequency: 6, lastOccurred: "3 days ago" },
];

const copingStrategies = [
  { id: 1, name: "Deep breathing", effectiveness: 8, timesUsed: 24 },
  { id: 2, name: "Progressive muscle relaxation", effectiveness: 7, timesUsed: 15 },
  { id: 3, name: "Mindful meditation", effectiveness: 9, timesUsed: 31 },
  { id: 4, name: "Physical exercise", effectiveness: 8, timesUsed: 18 },
];

export default function AnxietyManagement() {
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [showLogForm, setShowLogForm] = useState(false);
  
  // Self-learning system
  const learning = useModuleLearning("anxiety");
  const { relatedInsights } = useCrossModuleInsights("anxiety");
  const [currentIntervention, setCurrentIntervention] = useState<string | null>(null);

  const getAnxietyColor = (level: number) => {
    if (level <= 3) return "text-green-600 bg-green-100";
    if (level <= 6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getAnxietyLabel = (level: number) => {
    if (level <= 3) return "Low";
    if (level <= 6) return "Moderate";
    return "High";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <Wind className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Anxiety Management</h1>
                <p className="text-sm text-gray-600">Track anxiety levels, triggers, and coping strategies</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/wellness">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Wellness Hub
                </Button>
              </Link>
              <Button onClick={() => setShowLogForm(!showLogForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Log Anxiety
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Log Form */}
        {showLogForm && (
          <Card className="mb-8 border-2 border-blue-300">
            <CardHeader>
              <CardTitle>Log Anxiety Episode</CardTitle>
              <CardDescription>Record your current anxiety level and details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Anxiety Level (1-10)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      type="range"
                      min="1"
                      max="10"
                      value={anxietyLevel}
                      onChange={(e) => setAnxietyLevel(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <Badge className={`${getAnxietyColor(anxietyLevel)} text-lg px-4 py-2`}>
                      {anxietyLevel} - {getAnxietyLabel(anxietyLevel)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Triggers (if known)</Label>
                  <Input placeholder="What triggered this anxiety?" className="mt-2" />
                </div>

                <div>
                  <Label>Physical Symptoms</Label>
                  <Textarea
                    placeholder="Describe physical symptoms (racing heart, sweating, etc.)"
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Thoughts/Feelings</Label>
                  <Textarea
                    placeholder="What thoughts or feelings are you experiencing?"
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Coping Strategy Used</Label>
                  <Input placeholder="What did you do to cope?" className="mt-2" />
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Save Entry
                  </Button>
                  <Button variant="outline" onClick={() => setShowLogForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Current Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">5/10</div>
              <p className="text-xs opacity-75 mt-1">Moderate anxiety</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">7-Day Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-4xl font-bold">5.4</div>
                <TrendingDown className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Improving trend</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Active Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{mockTriggers.length}</div>
              <p className="text-xs opacity-75 mt-1">Identified patterns</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Coping Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{copingStrategies.length}</div>
              <p className="text-xs opacity-75 mt-1">Strategies learned</p>
            </CardContent>
          </Card>
        </div>

        {/* Anxiety Trend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              7-Day Anxiety Trend
            </CardTitle>
            <CardDescription>Track your anxiety levels over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockAnxietyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Triggers & Coping Strategies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Triggers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Common Triggers
              </CardTitle>
              <CardDescription>Patterns that increase anxiety</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTriggers.map((trigger) => (
                  <div key={trigger.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{trigger.name}</h4>
                      <Badge variant="secondary">{trigger.frequency}x</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Last occurred: {trigger.lastOccurred}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trigger
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Coping Strategies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-green-600" />
                Coping Strategies
              </CardTitle>
              <CardDescription>Tools that help manage anxiety</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {copingStrategies.map((strategy) => (
                  <div key={strategy.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{strategy.name}</h4>
                      <Badge className="bg-green-600">{strategy.effectiveness}/10</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Used {strategy.timesUsed} times</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Strategy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cross-Module Insights */}
        {relatedInsights.length > 0 && (
          <div className="mb-8">
            <CrossModuleInsights insights={relatedInsights} />
          </div>
        )}

        {/* Feedback Widget */}
        {learning.showFeedback && currentIntervention && (
          <div className="mb-8">
            <FeedbackWidget
              interventionName={currentIntervention}
              onSubmit={(feedback) => {
                learning.submitFeedback({
                  recommendationType: "coping-strategy",
                  recommendationContent: currentIntervention,
                  feedback,
                  clientId: 1, // TODO: Get from auth context
                });
              }}
              onClose={() => learning.setShowFeedback(false)}
            />
          </div>
        )}

        {/* Evidence-Based Resources */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" />
              Evidence-Based Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Cognitive Behavioral Therapy (CBT)</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Learn to identify and challenge anxious thoughts
                </p>
                <Button size="sm" variant="outline">Learn More</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Mindfulness-Based Stress Reduction</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Practice present-moment awareness to reduce anxiety
                </p>
                <Button size="sm" variant="outline">Learn More</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Progressive Muscle Relaxation</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Release physical tension through systematic relaxation
                </p>
                <Button size="sm" variant="outline">Start Exercise</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Breathing Techniques</h4>
                <p className="text-sm text-gray-600 mb-3">
                  4-7-8 breathing and box breathing for immediate relief
                </p>
                <Button size="sm" variant="outline">Practice Now</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
