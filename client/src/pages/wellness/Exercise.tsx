/**
 * Exercise & Fitness Module
 * Track workouts, progress, and fitness goals
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Dumbbell,
  Home,
  Plus,
  TrendingUp,
  Flame,
  Clock,
  Target,
  Award,
  Heart,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockWorkoutData = [
  { date: "Mon", duration: 45, calories: 350, exercises: 6 },
  { date: "Tue", duration: 60, calories: 480, exercises: 8 },
  { date: "Wed", duration: 0, calories: 0, exercises: 0 },
  { date: "Thu", duration: 50, calories: 400, exercises: 7 },
  { date: "Fri", duration: 55, calories: 440, exercises: 7 },
  { date: "Sat", duration: 70, calories: 560, exercises: 9 },
  { date: "Sun", duration: 30, calories: 240, exercises: 4 },
];

const recentWorkouts = [
  { name: "Upper Body Strength", date: "Today", duration: "55 min", exercises: 7, calories: 440 },
  { name: "Cardio HIIT", date: "Yesterday", duration: "30 min", exercises: 4, calories: 380 },
  { name: "Lower Body", date: "2 days ago", duration: "60 min", exercises: 8, calories: 480 },
];

export default function ExerciseFitness() {
  const [showLogForm, setShowLogForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Exercise & Fitness</h1>
                <p className="text-sm text-gray-600">Track workouts, progress, and fitness goals</p>
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
                Log Workout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Log Form */}
        {showLogForm && (
          <Card className="mb-8 border-2 border-orange-300">
            <CardHeader>
              <CardTitle>Log Workout</CardTitle>
              <CardDescription>Track your exercise session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Workout Type</Label>
                  <select className="w-full mt-2 p-2 border rounded-md">
                    <option>Strength Training</option>
                    <option>Cardio</option>
                    <option>HIIT</option>
                    <option>Yoga</option>
                    <option>Sports</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <Label>Workout Name</Label>
                  <Input placeholder="e.g., Upper Body Strength" className="mt-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input type="number" placeholder="45" className="mt-2" />
                  </div>
                  <div>
                    <Label>Calories Burned</Label>
                    <Input type="number" placeholder="350" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label>Exercises Performed</Label>
                  <Input placeholder="Bench press, squats, deadlifts..." className="mt-2" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Sets</Label>
                    <Input type="number" placeholder="12" className="mt-2" />
                  </div>
                  <div>
                    <Label>Reps</Label>
                    <Input type="number" placeholder="120" className="mt-2" />
                  </div>
                  <div>
                    <Label>Weight (lbs)</Label>
                    <Input type="number" placeholder="1500" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label>How do you feel?</Label>
                  <select className="w-full mt-2 p-2 border rounded-md">
                    <option>Energized</option>
                    <option>Good</option>
                    <option>Tired</option>
                    <option>Exhausted</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                    Save Workout
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
          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-8 h-8" />
                <div className="text-4xl font-bold">5</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Workouts completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Total Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-8 h-8" />
                <div className="text-4xl font-bold">310</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Minutes this week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Flame className="w-8 h-8" />
                <div className="text-4xl font-bold">2,470</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Burned this week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="w-8 h-8" />
                <div className="text-4xl font-bold">12</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Days in a row</p>
            </CardContent>
          </Card>
        </div>

        {/* Workout Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                7-Day Workout Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockWorkoutData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="duration" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600" />
                Calories Burned Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockWorkoutData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="calories" stroke="#ef4444" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Workouts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentWorkouts.map((workout, index) => (
                <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{workout.name}</h4>
                      <p className="text-sm text-gray-600">{workout.date}</p>
                    </div>
                    <Badge className="bg-orange-600">{workout.duration}</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{workout.exercises} exercises</span>
                    <span>•</span>
                    <span>{workout.calories} calories</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fitness Goals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Fitness Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { goal: "Workout 5x per week", current: 5, target: 5, unit: "workouts" },
                { goal: "Burn 2,500 calories/week", current: 2470, target: 2500, unit: "calories" },
                { goal: "Lift 50,000 lbs/week", current: 48200, target: 50000, unit: "lbs" },
              ].map((item, index) => {
                const progress = (item.current / item.target) * 100;
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{item.goal}</h4>
                      <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-orange-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.current.toLocaleString()} / {item.target.toLocaleString()} {item.unit}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Exercise Guidelines */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Evidence-Based Exercise Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Strength Training</h4>
                <p className="text-sm text-gray-600 mb-3">
                  2-3x per week, targeting all major muscle groups. 8-12 reps per set.
                </p>
                <Button size="sm" variant="outline">Workout Plans</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Cardiovascular Exercise</h4>
                <p className="text-sm text-gray-600 mb-3">
                  150 min moderate or 75 min vigorous per week. Zone 2 cardio optimal.
                </p>
                <Button size="sm" variant="outline">Cardio Guide</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Recovery & Rest</h4>
                <p className="text-sm text-gray-600 mb-3">
                  48 hours between training same muscle group. Sleep 7-9 hours.
                </p>
                <Button size="sm" variant="outline">Recovery Tips</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Progressive Overload</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Gradually increase weight, reps, or sets to continue progress.
                </p>
                <Button size="sm" variant="outline">Progress Tracking</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
