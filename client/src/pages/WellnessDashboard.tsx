/**
 * User Wellness Dashboard
 * Unified hub for all 31 wellness modules
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Brain,
  Heart,
  Moon,
  Apple,
  Dumbbell,
  Users,
  Briefcase,
  DollarSign,
  Sparkles,
  Shield,
  Target,
  TrendingUp,
  Activity,
  Smile,
  Frown,
  Zap,
  Wind,
  Flame,
  Droplet,
  Sun,
  Star,
  BookOpen,
  MessageCircle,
  Home,
  Baby,
  Pill,
  Coffee,
  Cigarette,
  Wine,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

// Define all 31 wellness modules
const wellnessModules = [
  // Mental Health (8 modules)
  {
    id: "anxiety",
    name: "Anxiety Management",
    category: "Mental Health",
    icon: Wind,
    color: "from-blue-400 to-cyan-500",
    description: "Track anxiety levels, triggers, and coping strategies",
    route: "/wellness/anxiety",
    status: "active" as const,
  },
  {
    id: "depression",
    name: "Depression Tracking",
    category: "Mental Health",
    icon: Frown,
    color: "from-indigo-400 to-purple-500",
    description: "Monitor mood, energy, and depression symptoms",
    route: "/wellness/depression",
    status: "active" as const,
  },
  {
    id: "stress",
    name: "Stress Management",
    category: "Mental Health",
    icon: Zap,
    color: "from-orange-400 to-red-500",
    description: "Identify stressors and build resilience",
    route: "/wellness/stress",
    status: "coming-soon" as const,
  },
  {
    id: "adhd",
    name: "ADHD Support",
    category: "Mental Health",
    icon: Activity,
    color: "from-pink-400 to-rose-500",
    description: "Focus, organization, and productivity tools",
    route: "/wellness/adhd",
    status: "coming-soon" as const,
  },
  {
    id: "autism",
    name: "Autism Transformation",
    category: "Mental Health",
    icon: Brain,
    color: "from-purple-400 to-indigo-500",
    description: "Evidence-based autism intervention tracking",
    route: "/autism",
    status: "active" as const,
  },
  {
    id: "ocd",
    name: "OCD Management",
    category: "Mental Health",
    icon: Target,
    color: "from-teal-400 to-cyan-500",
    description: "Track compulsions and exposure therapy progress",
    route: "/wellness/ocd",
    status: "coming-soon" as const,
  },
  {
    id: "ptsd",
    name: "PTSD Recovery",
    category: "Mental Health",
    icon: Shield,
    color: "from-slate-400 to-gray-500",
    description: "Trauma processing and healing journey",
    route: "/wellness/ptsd",
    status: "coming-soon" as const,
  },
  {
    id: "bipolar",
    name: "Bipolar Tracking",
    category: "Mental Health",
    icon: TrendingUp,
    color: "from-amber-400 to-orange-500",
    description: "Mood cycles, triggers, and stability monitoring",
    route: "/wellness/bipolar",
    status: "coming-soon" as const,
  },

  // Physical Health (7 modules)
  {
    id: "sleep",
    name: "Sleep Optimization",
    category: "Physical Health",
    icon: Moon,
    color: "from-indigo-500 to-purple-600",
    description: "Track sleep quality, duration, and optimization",
    route: "/wellness/sleep",
    status: "active" as const,
  },
  {
    id: "nutrition",
    name: "Nutrition Tracking",
    category: "Physical Health",
    icon: Apple,
    color: "from-green-400 to-emerald-500",
    description: "Food intake, macros, and dietary goals",
    route: "/wellness/nutrition",
    status: "coming-soon" as const,
  },
  {
    id: "exercise",
    name: "Exercise & Fitness",
    category: "Physical Health",
    icon: Dumbbell,
    color: "from-red-400 to-pink-500",
    description: "Workout tracking and fitness progress",
    route: "/wellness/exercise",
    status: "coming-soon" as const,
  },
  {
    id: "supplements",
    name: "Supplements",
    category: "Physical Health",
    icon: Pill,
    color: "from-blue-400 to-indigo-500",
    description: "Track supplements, dosages, and effects",
    route: "/wellness/supplements",
    status: "coming-soon" as const,
  },
  {
    id: "pain",
    name: "Pain Management",
    category: "Physical Health",
    icon: AlertCircle,
    color: "from-red-500 to-orange-500",
    description: "Chronic pain tracking and relief strategies",
    route: "/wellness/pain",
    status: "coming-soon" as const,
  },
  {
    id: "energy",
    name: "Energy Levels",
    category: "Physical Health",
    icon: Flame,
    color: "from-yellow-400 to-orange-500",
    description: "Daily energy, fatigue, and vitality tracking",
    route: "/wellness/energy",
    status: "coming-soon" as const,
  },
  {
    id: "hydration",
    name: "Hydration",
    category: "Physical Health",
    icon: Droplet,
    color: "from-cyan-400 to-blue-500",
    description: "Water intake and hydration goals",
    route: "/wellness/hydration",
    status: "coming-soon" as const,
  },

  // Emotional & Social (6 modules)
  {
    id: "emotions",
    name: "Emotion Tracking",
    category: "Emotional & Social",
    icon: Heart,
    color: "from-pink-400 to-red-500",
    description: "Daily emotional awareness and regulation",
    route: "/emotions",
    status: "active" as const,
  },
  {
    id: "relationships",
    name: "Relationships",
    category: "Emotional & Social",
    icon: Users,
    color: "from-purple-400 to-pink-500",
    description: "Track relationship quality and communication",
    route: "/wellness/relationships",
    status: "coming-soon" as const,
  },
  {
    id: "social",
    name: "Social Connection",
    category: "Emotional & Social",
    icon: MessageCircle,
    color: "from-blue-400 to-cyan-500",
    description: "Social interactions and community engagement",
    route: "/wellness/social",
    status: "coming-soon" as const,
  },
  {
    id: "identity",
    name: "Identity & Purpose",
    category: "Emotional & Social",
    icon: Star,
    color: "from-yellow-400 to-amber-500",
    description: "Self-discovery and purpose exploration",
    route: "/wellness/identity",
    status: "coming-soon" as const,
  },
  {
    id: "confidence",
    name: "Confidence Building",
    category: "Emotional & Social",
    icon: Smile,
    color: "from-green-400 to-teal-500",
    description: "Self-esteem and confidence development",
    route: "/wellness/confidence",
    status: "coming-soon" as const,
  },
  {
    id: "boundaries",
    name: "Healthy Boundaries",
    category: "Emotional & Social",
    icon: Shield,
    color: "from-indigo-400 to-purple-500",
    description: "Setting and maintaining personal boundaries",
    route: "/wellness/boundaries",
    status: "coming-soon" as const,
  },

  // Spiritual & Mindfulness (4 modules)
  {
    id: "meditation",
    name: "Meditation Practice",
    category: "Spiritual & Mindfulness",
    icon: Sparkles,
    color: "from-purple-500 to-indigo-600",
    description: "Meditation sessions and mindfulness practice",
    route: "/wellness/meditation",
    status: "coming-soon" as const,
  },
  {
    id: "gratitude",
    name: "Gratitude Journal",
    category: "Spiritual & Mindfulness",
    icon: Sun,
    color: "from-yellow-400 to-orange-500",
    description: "Daily gratitude and positive psychology",
    route: "/wellness/gratitude",
    status: "coming-soon" as const,
  },
  {
    id: "spiritual",
    name: "Spiritual Growth",
    category: "Spiritual & Mindfulness",
    icon: Star,
    color: "from-indigo-500 to-purple-600",
    description: "Spiritual practices and growth journey",
    route: "/wellness/spiritual",
    status: "coming-soon" as const,
  },
  {
    id: "meaning",
    name: "Meaning & Purpose",
    category: "Spiritual & Mindfulness",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-600",
    description: "Life purpose and meaningful living",
    route: "/wellness/meaning",
    status: "coming-soon" as const,
  },

  // Career & Financial (3 modules)
  {
    id: "career",
    name: "Career Development",
    category: "Career & Financial",
    icon: Briefcase,
    color: "from-blue-500 to-cyan-600",
    description: "Career goals, skills, and professional growth",
    route: "/wellness/career",
    status: "coming-soon" as const,
  },
  {
    id: "financial",
    name: "Financial Wellness",
    category: "Career & Financial",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    description: "Financial goals, budgeting, and money mindset",
    route: "/wellness/financial",
    status: "coming-soon" as const,
  },
  {
    id: "productivity",
    name: "Productivity",
    category: "Career & Financial",
    icon: Target,
    color: "from-orange-500 to-red-600",
    description: "Time management and productivity optimization",
    route: "/wellness/productivity",
    status: "coming-soon" as const,
  },

  // Lifestyle & Habits (3 modules)
  {
    id: "habits",
    name: "Habit Tracking",
    category: "Lifestyle & Habits",
    icon: CheckCircle2,
    color: "from-green-400 to-teal-500",
    description: "Build and track positive habits",
    route: "/wellness/habits",
    status: "coming-soon" as const,
  },
  {
    id: "addiction",
    name: "Addiction Recovery",
    category: "Lifestyle & Habits",
    icon: Cigarette,
    color: "from-red-500 to-pink-600",
    description: "Substance use tracking and recovery support",
    route: "/wellness/addiction",
    status: "coming-soon" as const,
  },
  {
    id: "screentime",
    name: "Screen Time",
    category: "Lifestyle & Habits",
    icon: Clock,
    color: "from-blue-400 to-purple-500",
    description: "Digital wellness and screen time management",
    route: "/wellness/screentime",
    status: "coming-soon" as const,
  },
];

const categories = [
  "Mental Health",
  "Physical Health",
  "Emotional & Social",
  "Spiritual & Mindfulness",
  "Career & Financial",
  "Lifestyle & Habits",
];

export default function WellnessDashboard() {
  const activeModules = wellnessModules.filter(m => m.status === "active");
  const comingSoonModules = wellnessModules.filter(m => m.status === "coming-soon");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Your Wellness Hub
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Track all aspects of your wellbeing in one place
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/ai-coach">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Coach
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Total Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{wellnessModules.length}</div>
              <p className="text-xs opacity-75 mt-1">Comprehensive wellness tracking</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Active Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{activeModules.length}</div>
              <p className="text-xs opacity-75 mt-1">Currently tracking</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{comingSoonModules.length}</div>
              <p className="text-xs opacity-75 mt-1">More tools on the way</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{categories.length}</div>
              <p className="text-xs opacity-75 mt-1">Holistic approach</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Modules */}
        {activeModules.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Active Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Link key={module.id} href={module.route}>
                    <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-green-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Active
                          </Badge>
                        </div>
                        <CardTitle className="mt-4">{module.name}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" variant="outline">
                          Open Module →
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* All Modules by Category */}
        {categories.map((category) => {
          const categoryModules = wellnessModules.filter(m => m.category === category);
          
          return (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryModules.map((module) => {
                  const Icon = module.icon;
                  const isActive = module.status === "active";
                  
                  return (
                    <Link key={module.id} href={module.route}>
                      <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${isActive ? 'border-2 border-green-300' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            {isActive ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Soon</Badge>
                            )}
                          </div>
                          <CardTitle className="text-base">{module.name}</CardTitle>
                          <CardDescription className="text-xs">{module.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
