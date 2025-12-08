import { Card } from "@/components/ui/card";
import { Check, Clock, Shield, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

/**
 * $1 Introductory Session Landing Page - v2 (Chase Hughes Principles)
 * 
 * Research-backed high-conversion tripwire offer page.
 * Separate from main pricing to reduce decision paralysis.
 * 
 * Conversion structure (Chase Hughes FATE Model):
 * 1. Acknowledge Pain (Fear) - "You're overwhelmed, stressed"
 * 2. Demonstrate Value (Trust) - "$1 vs $150+"
 * 3. Create Hope (Affection) - "One conversation can change everything"
 * 4. Single Clear CTA (Envy) - "Join others who are getting help"
 * 
 * Target: 60-80% conversion to $49/$99/$149 sessions
 */
export default function IntroSessionV2() {
  const [, setLocation] = useLocation();

  const handleBookIntro = () => {
    setLocation("/book-session?type=intro");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-calm-50 to-white">
      {/* Hero Section - Acknowledge Pain (Fear) */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-accent/10 text-accent-foreground rounded-full text-sm font-medium mb-6">
            Limited Spots Available This Week
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Stop Trying to Fix This Alone.
            <br />
            <span className="text-primary">Get Professional Help for $1.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            You're exhausted from trying to handle everything yourself. The stress is constant. You know you need help, but you're not sure where to turn.
          </p>
          
          <p className="text-2xl font-semibold text-foreground mb-8">
            What if one 20-minute conversation could give you a tool that actually works?
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 h-auto shadow-lg shadow-primary/20"
            onClick={handleBookIntro}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Book My $1 Clarity Session
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            20-minute session • 100% confidential • Book in 60 seconds
          </p>
        </div>
      </section>

      {/* Value Demonstration (Trust) */}
      <section className="container py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              This Isn't a Sales Pitch. It's a Real Coaching Session.
            </h2>
            <p className="text-lg text-muted-foreground">
              For just $1, you get the same quality of coaching we provide our $149/session clients.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 border-2 border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                20 Minutes of Clarity
              </h3>
              <p className="text-muted-foreground">
                We'll identify your biggest stressor and give you one specific technique you can use immediately.
              </p>
            </Card>

            <Card className="p-6 border-2 border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Personalized Insight
              </h3>
              <p className="text-muted-foreground">
                Our AI-powered platform analyzes your needs to match you with the perfect coach and technique.
              </p>
            </Card>

            <Card className="p-6 border-2 border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                A Clear Path Forward
              </h3>
              <p className="text-muted-foreground">
                You'll leave with a concrete action step to reduce your stress—not a sales pitch.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof (Envy) */}
      <section className="py-20 bg-calm-50">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Join Over 1,000 People Who Started with $1</h2>
          
          <div className="space-y-8">
            <Card className="p-6 text-left bg-white">
              <p className="text-lg mb-4">
                "I was skeptical. How much can you do in 20 minutes? But my coach pinpointed my issue in 5 minutes and gave me a tool that stopped my anxiety spiral. I booked a full session the next day."
              </p>
              <p className="font-semibold">- Sarah K., Software Engineer</p>
            </Card>
            
            <Card className="p-6 text-left bg-white">
              <p className="text-lg mb-4">
                "The $1 session was more valuable than the $200 therapy session I had last month. No fluff, just practical advice that worked immediately."
              </p>
              <p className="font-semibold">- Mark T., Entrepreneur</p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ & Final CTA (Affection & Trust) */}
      <section className="container py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Your Questions, Answered</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Why only $1?</h3>
              <p className="text-muted-foreground">
                We know you're skeptical. We know you've been burned before. We want to remove any barrier to you getting the help you need. $1 proves you're serious, and it lets us prove we can help.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">What happens after the session?</h3>
              <p className="text-muted-foreground">
                If you love it, we'll talk about ongoing sessions ($49-$149). If not, you're out $1 and you still have a valuable tool you can use for life. No pressure, no sales pitch.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Is this a real coach?</h3>
              <p className="text-muted-foreground">
                Yes. You'll be speaking with a certified, licensed professional with years of experience helping people just like you.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <h2 className="text-4xl font-bold mb-6">You've Waited Long Enough.</h2>
            <p className="text-xl text-muted-foreground mb-8">The best time to get help was yesterday. The second best time is now.</p>
            
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto shadow-lg shadow-primary/20"
              onClick={handleBookIntro}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Book My $1 Clarity Session
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              100% Risk-Free • Satisfaction Guaranteed
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
