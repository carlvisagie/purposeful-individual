/**
 * Sleep Optimization Module
 * Track sleep quality, duration, and optimization based on Huberman/Walker protocols
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Moon,
  Home,
  Plus,
  Sun,
  Coffee,
  Dumbbell,
  Thermometer,
  Eye,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data
const mockSleepData = [
  { date: "Mon", hours: 7.5, quality: 7, deep: 1.8, rem: 1.5 },
  { date: "Tue", hours: 8.2, quality: 8, deep: 2.1, rem: 1.7 },
  { date: "Wed", hours: 6.8, quality: 6, deep: 1.5, rem: 1.2 },
  { date: "Thu", hours: 7.8, quality: 7, deep: 1.9, rem: 1.6 },
  { date: "Fri", hours: 8.5, quality: 9, deep: 2.3, rem: 1.9 },
  { date: "Sat", hours: 9.0, quality: 8, deep: 2.4, rem: 2.0 },
  { date: "Sun", hours: 8.0, quality: 8, deep: 2.0, rem: 1.7 },
];

const hubermanProtocols = [
  {
    id: 1,
    title: "Morning Sunlight Exposure",
    description: "Get 10-30 minutes of sunlight within 1 hour of waking",
    time: "6:00 AM - 8:00 AM",
    completed: true,
    icon: Sun,
    color: "yellow",
  },
  {
    id: 2,
    title: "Caffeine Delay",
    description: "Wait 90-120 minutes after waking before first caffeine",
    time: "8:00 AM - 9:00 AM",
    completed: true,
    icon: Coffee,
    color: "orange",
  },
  {
    id: 3,
    title: "Exercise Timing",
    description: "Exercise in morning or early afternoon (not within 4 hours of bed)",
    time: "Before 6:00 PM",
    completed: false,
    icon: Dumbbell,
    color: "red",
  },
  {
    id: 4,
    title: "Afternoon Light",
    description: "Get 10-20 minutes of afternoon sun (2-4 PM)",
    time: "2:00 PM - 4:00 PM",
    completed: true,
    icon: Sun,
    color: "amber",
  },
  {
    id: 5,
    title: "Temperature Drop",
    description: "Cool bedroom to 65-68°F (18-20°C)",
    time: "8:00 PM onwards",
    completed: true,
    icon: Thermometer,
    color: "blue",
  },
  {
    id: 6,
    title: "Dim Lights",
    description: "Reduce light exposure 2-3 hours before bed",
    time: "8:00 PM - 10:00 PM",
    completed: false,
    icon: Eye,
    color: "indigo",
  },
];

export default function SleepOptimization() {
  const [showLogForm, setShowLogForm] = useState(false);
  const [sleepQuality, setSleepQuality] = useState(7);

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return "text-green-600 bg-green-100";
    if (quality >= 6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 9) return "Excellent";
    if (quality >= 7) return "Good";
    if (quality >= 5) return "Fair";
    return "Poor";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sleep Optimization</h1>
                <p className="text-sm text-gray-300">Based on Huberman & Walker protocols</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/wellness">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Home className="w-4 h-4 mr-2" />
                  Wellness Hub
                </Button>
              </Link>
              <Button onClick={() => setShowLogForm(!showLogForm)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Log Sleep
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Log Form */}
        {showLogForm && (
          <Card className="mb-8 border-2 border-purple-400 bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle>Log Last Night's Sleep</CardTitle>
              <CardDescription>Track your sleep quality and duration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bedtime</Label>
                    <Input type="time" className="mt-2" defaultValue="22:00" />
                  </div>
                  <div>
                    <Label>Wake Time</Label>
                    <Input type="time" className="mt-2" defaultValue="06:30" />
                  </div>
                </div>

                <div>
                  <Label>Sleep Quality (1-10)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      type="range"
                      min="1"
                      max="10"
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <Badge className={`${getQualityColor(sleepQuality)} text-lg px-4 py-2`}>
                      {sleepQuality} - {getQualityLabel(sleepQuality)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Time to Fall Asleep (minutes)</Label>
                  <Input type="number" placeholder="15" className="mt-2" />
                </div>

                <div>
                  <Label>Times Woken Up</Label>
                  <Input type="number" placeholder="2" className="mt-2" />
                </div>

                <div>
                  <Label>How do you feel this morning?</Label>
                  <Textarea
                    placeholder="Refreshed, groggy, energized, etc."
                    className="mt-2"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Notes (caffeine, exercise, stress, etc.)</Label>
                  <Textarea
                    placeholder="Anything that might have affected your sleep?"
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Save Sleep Log
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
              <CardTitle className="text-sm font-medium opacity-90">Last Night</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Moon className="w-8 h-8" />
                <div className="text-4xl font-bold">8.0h</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Quality: 8/10</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">7-Day Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-8 h-8" />
                <div className="text-4xl font-bold">7.8h</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Quality: 7.6/10</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Deep Sleep</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8" />
                <div className="text-4xl font-bold">2.0h</div>
              </div>
              <p className="text-xs opacity-75 mt-1">25% of total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">REM Sleep</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Eye className="w-8 h-8" />
                <div className="text-4xl font-bold">1.7h</div>
              </div>
              <p className="text-xs opacity-75 mt-1">21% of total</p>
            </CardContent>
          </Card>
        </div>

        {/* Sleep Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-600" />
                7-Day Sleep Duration & Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockSleepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" domain={[0, 10]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={3} name="Hours" />
                  <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#06b6d4" strokeWidth={3} name="Quality" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Sleep Stages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockSleepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 3]} />
                  <Tooltip />
                  <Bar dataKey="deep" fill="#10b981" name="Deep Sleep" />
                  <Bar dataKey="rem" fill="#f59e0b" name="REM Sleep" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Huberman Protocols */}
        <Card className="mb-8 bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-600" />
              Daily Sleep Optimization Protocols
            </CardTitle>
            <CardDescription>
              Evidence-based protocols from Dr. Andrew Huberman and Dr. Matthew Walker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hubermanProtocols.map((protocol) => {
                const Icon = protocol.icon;
                const colorClasses = {
                  yellow: "from-yellow-400 to-orange-500",
                  orange: "from-orange-400 to-red-500",
                  red: "from-red-400 to-pink-500",
                  amber: "from-amber-400 to-yellow-500",
                  blue: "from-blue-400 to-cyan-500",
                  indigo: "from-indigo-400 to-purple-500",
                };

                return (
                  <div
                    key={protocol.id}
                    className={`p-4 rounded-lg border-2 ${
                      protocol.completed ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[protocol.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {protocol.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{protocol.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{protocol.description}</p>
                    <Badge variant="secondary" className="text-xs">{protocol.time}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Evidence-Based Tips */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              Evidence-Based Sleep Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Temperature Regulation</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Keep bedroom cool (65-68°F). Take hot shower 1-2 hours before bed to trigger temperature drop.
                </p>
                <Button size="sm" variant="outline">Learn More</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Light Exposure Timing</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Morning sunlight sets circadian rhythm. Avoid bright lights 2-3 hours before bed.
                </p>
                <Button size="sm" variant="outline">Protocol Guide</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Caffeine Management</h4>
                <p className="text-sm text-gray-600 mb-3">
                  No caffeine 8-10 hours before bed. Delay first coffee 90-120 min after waking.
                </p>
                <Button size="sm" variant="outline">Timing Calculator</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Sleep Pressure</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Build adenosine through wakefulness. Avoid naps after 3 PM if you have sleep issues.
                </p>
                <Button size="sm" variant="outline">Optimization Plan</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
