/**
 * Depression Tracking Module
 * Monitor mood, energy, and depression symptoms
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import {
  Frown,
  Home,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Sun,
  Moon,
  Heart,
  Battery,
  Smile,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data
const mockMoodData = [
  { date: "Mon", mood: 4, energy: 3, sleep: 5 },
  { date: "Tue", mood: 5, energy: 4, sleep: 6 },
  { date: "Wed", mood: 3, energy: 2, sleep: 4 },
  { date: "Thu", mood: 6, energy: 5, sleep: 7 },
  { date: "Fri", mood: 5, energy: 4, sleep: 6 },
  { date: "Sat", mood: 7, energy: 6, sleep: 8 },
  { date: "Sun", mood: 6, energy: 5, sleep: 7 },
];

const phq9Questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling/staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you're a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly, or being fidgety/restless",
  "Thoughts that you would be better off dead or hurting yourself",
];

export default function DepressionTracking() {
  const [showLogForm, setShowLogForm] = useState(false);
  const [moodLevel, setMoodLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);

  const getMoodColor = (level: number) => {
    if (level >= 7) return "text-green-600 bg-green-100";
    if (level >= 4) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getMoodLabel = (level: number) => {
    if (level >= 8) return "Great";
    if (level >= 6) return "Good";
    if (level >= 4) return "Okay";
    if (level >= 2) return "Low";
    return "Very Low";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <Frown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Depression Tracking</h1>
                <p className="text-sm text-gray-600">Monitor mood, energy, and depression symptoms</p>
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
                Log Mood
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Log Form */}
        {showLogForm && (
          <Card className="mb-8 border-2 border-purple-300">
            <CardHeader>
              <CardTitle>Daily Mood Check-In</CardTitle>
              <CardDescription>Track your mood and energy levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Mood Level (1-10)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      type="range"
                      min="1"
                      max="10"
                      value={moodLevel}
                      onChange={(e) => setMoodLevel(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <Badge className={`${getMoodColor(moodLevel)} text-lg px-4 py-2`}>
                      {moodLevel} - {getMoodLabel(moodLevel)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Energy Level (1-10)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      type="range"
                      min="1"
                      max="10"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <Badge className="bg-blue-100 text-blue-700 text-lg px-4 py-2">
                      {energyLevel}/10
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Sleep Quality (last night)</Label>
                  <Input type="number" placeholder="Hours slept" className="mt-2" />
                </div>

                <div>
                  <Label>Activities Today</Label>
                  <Textarea
                    placeholder="What did you do today? (work, exercise, social, etc.)"
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Thoughts & Feelings</Label>
                  <Textarea
                    placeholder="How are you feeling? Any notable thoughts?"
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
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
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Current Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Smile className="w-8 h-8" />
                <div className="text-4xl font-bold">6/10</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Good mood</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Energy Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Battery className="w-8 h-8" />
                <div className="text-4xl font-bold">5/10</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Moderate energy</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">7-Day Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8" />
                <div className="text-4xl font-bold">+12%</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Improving</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Sleep Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Moon className="w-8 h-8" />
                <div className="text-4xl font-bold">7/10</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Good sleep</p>
            </CardContent>
          </Card>
        </div>

        {/* Mood & Energy Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                7-Day Mood Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockMoodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-blue-600" />
                Energy & Sleep Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockMoodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="energy" fill="#3b82f6" />
                  <Bar dataKey="sleep" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* PHQ-9 Assessment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              PHQ-9 Depression Screening
            </CardTitle>
            <CardDescription>
              Over the last 2 weeks, how often have you been bothered by the following?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {phq9Questions.map((question, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-3">{index + 1}. {question}</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`q${index}`} value="0" />
                      <span className="text-sm">Not at all</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`q${index}`} value="1" />
                      <span className="text-sm">Several days</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`q${index}`} value="2" />
                      <span className="text-sm">More than half</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`q${index}`} value="3" />
                      <span className="text-sm">Nearly every day</span>
                    </label>
                  </div>
                </div>
              ))}
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Calculate PHQ-9 Score
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Evidence-Based Resources */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-600" />
              Evidence-Based Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Behavioral Activation</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Increase engagement in positive activities to improve mood
                </p>
                <Button size="sm" variant="outline">Start Activity Plan</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Cognitive Therapy</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Challenge negative thought patterns and beliefs
                </p>
                <Button size="sm" variant="outline">Learn Techniques</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Sleep Hygiene</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Improve sleep quality to boost mood and energy
                </p>
                <Button size="sm" variant="outline">Sleep Guide</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Exercise Protocol</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Evidence shows exercise is as effective as medication
                </p>
                <Button size="sm" variant="outline">Start Program</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
