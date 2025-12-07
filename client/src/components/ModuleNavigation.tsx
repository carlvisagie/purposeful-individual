import { Link, useLocation } from "wouter";
import { cn } from "../lib/utils";
import {
  Brain,
  Heart,
  Users,
  Briefcase,
  DollarSign,
  Baby,
  Sparkles,
  Activity,
  Smile,
  Dumbbell,
  Apple,
  HeartPulse,
  BookOpen,
  Lightbulb,
  Repeat,
  Moon,
  MessageCircle,
  Trophy,
  BarChart3,
  Wind,
  Target,
  BookMarked,
  LineChart,
  Bot,
  Plug,
  Bell,
  Settings,
  Shield,
  UserCog,
  Zap,
  User,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface Module {
  id: string;
  name: string;
  description: string;
  icon: any;
  path: string;
  category: string;
  status: "active" | "beta" | "coming_soon";
  color: string;
}

const modules: Module[] = [
  // Life Challenge Modules
  {
    id: "mental-health",
    name: "Mental Health & Recovery",
    description: "CBT, DBT, ACT therapy tools and mood tracking",
    icon: Brain,
    path: "/mental-health",
    category: "Life Challenges",
    status: "active",
    color: "text-purple-600",
  },
  {
    id: "relationships",
    name: "Relationships",
    description: "Gottman Method, Love Languages, attachment theory",
    icon: Heart,
    path: "/relationships",
    category: "Life Challenges",
    status: "active",
    color: "text-pink-600",
  },
  {
    id: "career",
    name: "Career & Purpose",
    description: "Ikigai, job search, skill development",
    icon: Briefcase,
    path: "/career",
    category: "Life Challenges",
    status: "active",
    color: "text-blue-600",
  },
  {
    id: "young-men",
    name: "Young Men Without Role Models",
    description: "40 Developmental Assets, mentorship, life skills",
    icon: Users,
    path: "/young-men",
    category: "Life Challenges",
    status: "active",
    color: "text-indigo-600",
  },
  {
    id: "financial",
    name: "Financial Challenges",
    description: "Debt management, budgeting, money mindset",
    icon: DollarSign,
    path: "/financial",
    category: "Life Challenges",
    status: "active",
    color: "text-green-600",
  },
  {
    id: "autism",
    name: "Autism Tracking",
    description: "ATEC/CARS assessments, interventions, progress",
    icon: Baby,
    path: "/autism",
    category: "Life Challenges",
    status: "active",
    color: "text-orange-600",
  },

  // Wellness Engines
  {
    id: "spiritual",
    name: "Spiritual Wellness",
    description: "MBSR, meditation, purpose discovery",
    icon: Sparkles,
    path: "/spiritual",
    category: "Wellness Engines",
    status: "active",
    color: "text-violet-600",
  },
  {
    id: "mental",
    name: "Mental Wellness",
    description: "Deep work, flow states, cognitive optimization",
    icon: Brain,
    path: "/mental",
    category: "Wellness Engines",
    status: "active",
    color: "text-cyan-600",
  },
  {
    id: "emotional",
    name: "Emotional Wellness",
    description: "DBT skills, emotional intelligence, resilience",
    icon: Smile,
    path: "/emotional",
    category: "Wellness Engines",
    status: "active",
    color: "text-yellow-600",
  },
  {
    id: "physical",
    name: "Physical/Exercise",
    description: "Strength training, cardio, mobility",
    icon: Dumbbell,
    path: "/physical",
    category: "Wellness Engines",
    status: "active",
    color: "text-red-600",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    description: "Meal tracking, macros, supplements",
    icon: Apple,
    path: "/nutrition",
    category: "Wellness Engines",
    status: "active",
    color: "text-lime-600",
  },
  {
    id: "health",
    name: "Health Optimization",
    description: "Biomarkers, longevity protocols, preventive care",
    icon: HeartPulse,
    path: "/health",
    category: "Wellness Engines",
    status: "active",
    color: "text-rose-600",
  },

  // Transformation Systems
  {
    id: "principles",
    name: "Transformative Principles",
    description: "12 identity-based principles for transformation",
    icon: BookOpen,
    path: "/principles",
    category: "Transformation",
    status: "active",
    color: "text-amber-600",
  },
  {
    id: "memory",
    name: "Memory Mastery",
    description: "13 memory techniques from Harry Lorayne",
    icon: Lightbulb,
    path: "/memory",
    category: "Transformation",
    status: "active",
    color: "text-fuchsia-600",
  },
  {
    id: "habits",
    name: "Habit Formation",
    description: "Identity-based habits with NLP patterns",
    icon: Repeat,
    path: "/habits",
    category: "Transformation",
    status: "active",
    color: "text-teal-600",
  },

  // High-Value Features
  {
    id: "sleep",
    name: "Sleep Optimization",
    description: "HRV tracking, sleep stages, recovery metrics",
    icon: Moon,
    path: "/sleep",
    category: "Features",
    status: "active",
    color: "text-slate-600",
  },
  {
    id: "community",
    name: "Community & Support",
    description: "Accountability partners, mentorship, peer support",
    icon: MessageCircle,
    path: "/community",
    category: "Features",
    status: "active",
    color: "text-sky-600",
  },
  {
    id: "gamification",
    name: "Gamification",
    description: "Achievements, challenges, motivation",
    icon: Trophy,
    path: "/gamification",
    category: "Features",
    status: "active",
    color: "text-yellow-500",
  },
  {
    id: "analytics",
    name: "Progress Analytics",
    description: "AI-powered insights and predictions",
    icon: BarChart3,
    path: "/analytics",
    category: "Features",
    status: "active",
    color: "text-blue-500",
  },
  {
    id: "stress",
    name: "Stress Tracking",
    description: "HRV, cortisol patterns, interventions",
    icon: Wind,
    path: "/stress",
    category: "Features",
    status: "active",
    color: "text-red-500",
  },
  {
    id: "goals",
    name: "Goal Setting",
    description: "SMART goals, OKRs, WOOP method",
    icon: Target,
    path: "/goals",
    category: "Features",
    status: "active",
    color: "text-green-500",
  },
  {
    id: "journal",
    name: "Journal & Reflection",
    description: "Expressive writing, AI-powered insights",
    icon: BookMarked,
    path: "/journal",
    category: "Features",
    status: "active",
    color: "text-purple-500",
  },
  {
    id: "visualization",
    name: "Progress Visualization",
    description: "Charts, dashboards, heatmaps",
    icon: LineChart,
    path: "/visualization",
    category: "Features",
    status: "active",
    color: "text-indigo-500",
  },
  {
    id: "ai-coach",
    name: "AI Coaching",
    description: "Personalized guidance and recommendations",
    icon: Bot,
    path: "/ai-coach",
    category: "Features",
    status: "active",
    color: "text-cyan-500",
  },
  {
    id: "integrations",
    name: "Integrations",
    description: "Wearables, fitness apps, productivity tools",
    icon: Plug,
    path: "/integrations",
    category: "Features",
    status: "active",
    color: "text-orange-500",
  },
];

const categories = [
  { name: "Life Challenges", description: "Targeted support for specific life situations" },
  { name: "Wellness Engines", description: "Holistic wellness across all dimensions" },
  { name: "Transformation", description: "Core systems for lasting change" },
  { name: "Features", description: "High-value tools and capabilities" },
];

export default function ModuleNavigation() {
  const [location] = useLocation();

  return (
    <div className="container mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Purposeful Live Coaching</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A comprehensive, evidence-based transformation platform with 31+ interconnected modules
        </p>
        <Badge variant="secondary" className="text-sm">
          300+ Database Tables | Self-Learning AI | Evidence-Based Only
        </Badge>
      </div>

      {categories.map((category) => (
        <div key={category.name} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <p className="text-muted-foreground">{category.description}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules
              .filter((m) => m.category === category.name)
              .map((module) => {
                const Icon = module.icon;
                const isActive = location === module.path;

                return (
                  <Link key={module.id} href={module.path}>
                    <Card
                      className={cn(
                        "hover:shadow-lg transition-all cursor-pointer h-full",
                        isActive && "ring-2 ring-primary"
                      )}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <Icon className={cn("h-8 w-8", module.color)} />
                          {module.status === "beta" && (
                            <Badge variant="secondary">Beta</Badge>
                          )}
                          {module.status === "coming_soon" && (
                            <Badge variant="outline">Coming Soon</Badge>
                          )}
                        </div>
                        <CardTitle className="mt-4">{module.name}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>
      ))}

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Research-Backed Foundation</h3>
        <p className="text-sm text-muted-foreground">
          Every module is built on peer-reviewed research from leading psychologists, neuroscientists,
          and behavioral scientists. We bow to truth and reality - no pseudoscience, only proven methods.
        </p>
      </div>
    </div>
  );
}
