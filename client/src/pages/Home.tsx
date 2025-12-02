import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Target, 
  Brain, 
  TrendingUp, 
  Shield, 
  Zap, 
  Heart,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Activity,
  Award
} from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="container max-w-6xl mx-auto text-center space-y-8">
          <Badge className="mx-auto" variant="outline">
            <Sparkles className="mr-2 h-3 w-3" />
            Identity-Based Transformation
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Transform Who You Are,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Not Just What You Do
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Evidence-based coaching for men ready to eliminate contradictions, 
            build unshakeable discipline, and create lasting transformation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/book-session")} className="text-lg">
              Book Your First Session
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built on Evidence, Not Hype</h2>
            <p className="text-xl text-muted-foreground">
              Principles from James Clear, David Goggins, Andrew Huberman, Peter Attia, and Tim Ferriss
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Target className="h-12 w-12 text-purple-500 mb-4" />
                <CardTitle>Identity Over Goals</CardTitle>
                <CardDescription>
                  "You don't rise to the level of your goals. You fall to the level of your systems." - James Clear
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Build identity-based habits that make transformation inevitable, not just possible.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-12 w-12 text-blue-500 mb-4" />
                <CardTitle>Neuroscience-Backed</CardTitle>
                <CardDescription>
                  Stress management, dopamine regulation, and cognitive optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Protocols based on Andrew Huberman's neuroscience research for lasting behavioral change.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle>Discipline Systems</CardTitle>
                <CardDescription>
                  Mental toughness and accountability structures that work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Daily operating systems inspired by David Goggins and Tim Ferriss for unshakeable consistency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Complete Transformation System</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to eliminate contradictions and build your ideal identity
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                  <CardTitle>AI Coaching Assistant</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Personalized AI coach with full context of your health, stress, identity, and goals. 
                  Available 24/7 for guidance and accountability.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-red-500" />
                  <CardTitle>Health & Stress Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Daily logging of movement, nutrition, sleep, and stress levels. 
                  Evidence-based insights for optimization.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-blue-500" />
                  <CardTitle>Identity Statement Builder</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Build your identity foundation through guided questions. 
                  Use as decision filter: "Would someone who [identity] do this?"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  <CardTitle>Daily Operating System</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Morning routines, evening reviews, impulse control tracking, and recovery protocols. 
                  NO-DECISION MODE: system tells you exactly what to do.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  <CardTitle>Progress Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visual charts showing health trends, stress reduction, identity evolution, and milestone progress.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-purple-500" />
                  <CardTitle>Gamification & Achievements</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Points, badges, and leaderboards for completing routines, sessions, and milestones. 
                  Make transformation engaging.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Session Pricing */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Start Your Transformation</h2>
            <p className="text-xl text-muted-foreground">
              Choose the session that fits where you are right now
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Intro Session</CardTitle>
                <CardDescription>Test the waters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">$1</div>
                <p className="text-sm text-muted-foreground mb-4">
                  30-minute intro call to see if we're a fit
                </p>
                <Button onClick={() => navigate("/book-session")} className="w-full">
                  Book Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discovery</CardTitle>
                <CardDescription>Find your path</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">$49</div>
                <p className="text-sm text-muted-foreground mb-4">
                  60-minute deep dive into your current state
                </p>
                <Button onClick={() => navigate("/book-session")} className="w-full">
                  Book Now
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <Badge className="mb-2">Most Popular</Badge>
                <CardTitle>Breakthrough</CardTitle>
                <CardDescription>Break through blocks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">$99</div>
                <p className="text-sm text-muted-foreground mb-4">
                  90-minute intensive to eliminate contradictions
                </p>
                <Button onClick={() => navigate("/book-session")} className="w-full">
                  Book Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transformation</CardTitle>
                <CardDescription>Complete rebuild</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">$149</div>
                <p className="text-sm text-muted-foreground mb-4">
                  2-hour identity architecture session
                </p>
                <Button onClick={() => navigate("/book-session")} className="w-full">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Transform Who You Are?
          </h2>
          <p className="text-xl opacity-90">
            Stop trying to change what you do. Start changing who you are.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/book-session")} className="text-lg">
            Book Your First Session
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
