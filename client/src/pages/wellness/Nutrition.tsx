/**
 * Nutrition Tracking Module
 * Track meals, macros, and nutritional goals
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Apple,
  Home,
  Plus,
  TrendingUp,
  Flame,
  Droplet,
  Beef,
  Wheat,
  Activity,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const mockMacroData = [
  { name: "Protein", value: 150, color: "#ef4444" },
  { name: "Carbs", value: 200, color: "#3b82f6" },
  { name: "Fat", value: 70, color: "#f59e0b" },
];

const mockWeeklyData = [
  { date: "Mon", calories: 2100, protein: 145, carbs: 195, fat: 68 },
  { date: "Tue", calories: 2300, protein: 160, carbs: 210, fat: 75 },
  { date: "Wed", calories: 1950, protein: 140, carbs: 180, fat: 65 },
  { date: "Thu", calories: 2200, protein: 155, carbs: 205, fat: 72 },
  { date: "Fri", calories: 2400, protein: 165, carbs: 220, fat: 78 },
  { date: "Sat", calories: 2500, protein: 170, carbs: 230, fat: 80 },
  { date: "Sun", calories: 2150, protein: 150, carbs: 200, fat: 70 },
];

export default function NutritionTracking() {
  const [showLogForm, setShowLogForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nutrition Tracking</h1>
                <p className="text-sm text-gray-600">Track meals, macros, and nutritional goals</p>
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
                Log Meal
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Log Form */}
        {showLogForm && (
          <Card className="mb-8 border-2 border-green-300">
            <CardHeader>
              <CardTitle>Log Meal</CardTitle>
              <CardDescription>Track what you ate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Meal Type</Label>
                  <select className="w-full mt-2 p-2 border rounded-md">
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snack</option>
                  </select>
                </div>

                <div>
                  <Label>Food Description</Label>
                  <Input placeholder="e.g., Grilled chicken breast, brown rice, broccoli" className="mt-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Calories</Label>
                    <Input type="number" placeholder="500" className="mt-2" />
                  </div>
                  <div>
                    <Label>Serving Size</Label>
                    <Input placeholder="1 cup" className="mt-2" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Protein (g)</Label>
                    <Input type="number" placeholder="30" className="mt-2" />
                  </div>
                  <div>
                    <Label>Carbs (g)</Label>
                    <Input type="number" placeholder="45" className="mt-2" />
                  </div>
                  <div>
                    <Label>Fat (g)</Label>
                    <Input type="number" placeholder="15" className="mt-2" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    Save Meal
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
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Today's Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Flame className="w-8 h-8" />
                <div className="text-4xl font-bold">2,150</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Goal: 2,200 (98%)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Protein</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Beef className="w-8 h-8" />
                <div className="text-4xl font-bold">150g</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Goal: 160g (94%)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Carbs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wheat className="w-8 h-8" />
                <div className="text-4xl font-bold">200g</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Goal: 220g (91%)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Water</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Droplet className="w-8 h-8" />
                <div className="text-4xl font-bold">2.1L</div>
              </div>
              <p className="text-xs opacity-75 mt-1">Goal: 2.5L (84%)</p>
            </CardContent>
          </Card>
        </div>

        {/* Macro Distribution & Weekly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Today's Macro Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockMacroData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}g`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockMacroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                7-Day Calorie Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockWeeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calories" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Meal Log */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today's Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { meal: "Breakfast", food: "Oatmeal with berries, protein shake", calories: 450, time: "7:30 AM" },
                { meal: "Lunch", food: "Grilled chicken salad, quinoa", calories: 650, time: "12:30 PM" },
                { meal: "Snack", food: "Greek yogurt, almonds", calories: 250, time: "3:00 PM" },
                { meal: "Dinner", food: "Salmon, sweet potato, asparagus", calories: 800, time: "6:30 PM" },
              ].map((entry, index) => (
                <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Badge className="bg-green-600 mb-2">{entry.meal}</Badge>
                      <h4 className="font-semibold text-gray-900">{entry.food}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{entry.calories}</div>
                      <div className="text-xs text-gray-500">calories</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{entry.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Guidelines */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle>Evidence-Based Nutrition Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Protein Intake</h4>
                <p className="text-sm text-gray-600 mb-3">
                  0.8-1.2g per lb of body weight for muscle maintenance and growth
                </p>
                <Button size="sm" variant="outline">Calculate Goal</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Meal Timing</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Eat within 1-2 hours after waking and every 3-4 hours
                </p>
                <Button size="sm" variant="outline">Set Schedule</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Hydration</h4>
                <p className="text-sm text-gray-600 mb-3">
                  0.5-1 oz per lb of body weight daily, more if exercising
                </p>
                <Button size="sm" variant="outline">Track Water</Button>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold mb-2">Micronutrients</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Eat variety of colorful vegetables and fruits daily
                </p>
                <Button size="sm" variant="outline">Food Guide</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
