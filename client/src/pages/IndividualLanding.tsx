import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Zap,
  Moon,
  Brain,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";
import { useRouter } from "wouter";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { LiveChatWidget } from "@/components/LiveChatWidget";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

/**
 * Individual Landing Page
 * 100% focused on personal transformation
 * Emotional messaging, personal stories, AI coaching focus
 */
export default function IndividualLanding() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState("essential");
  const [showExitPopup, setShowExitPopup] = useState(false);

  const subscribeMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= window.innerHeight * 0.05 && !showExitPopup) {
        const hasShown = sessionStorage.getItem("exitPopupIndividual");
        if (!hasShown) {
          setShowExitPopup(true);
          sessionStorage.setItem("exitPopupIndividual", "true");
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [showExitPopup]);

  return (
    <div className="min-h-screen bg-white">
      <ExitIntentPopup
        open={showExitPopup}
        onClose={() => setShowExitPopup(false)}
        type="individual"
      />
      <LiveChatWidget type="individual" routeToTeam="support" />
      
      {/* $1 INTRO OFFER BANNER - Top of Page */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 text-center">
        <p className="text-sm md:text-base font-semibold">
          <span className="inline-block animate-pulse mr-2">🎯</span>
          Limited Time: Try Professional Coaching for Just $1
          <Button
            size="sm"
            variant="secondary"
            className="ml-4 bg-white text-emerald-700 hover:bg-emerald-50"
            onClick={() => window.location.href = '/intro'}
          >
            Book Now
          </Button>
        </p>
      </div>
      {/* HERO SECTION - Emotional Focus */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-emerald-200 text-emerald-900">
              For You
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
              Feel Calm, Confident & In Control Again
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              You're overwhelmed. Stressed. Maybe you can't sleep. Your mind won't stop racing. You know you need help, but therapy wait lists are months long.
            </p>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed font-semibold text-emerald-700">
              What if you had a personal AI coach available 24/7? Someone who listens without judgment. Who helps you process emotions in real-time. Who's always there when you need them most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/30"
                onClick={() => window.location.href = '/intro'}
              >
                Try Coaching for $1
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                onClick={() =>
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See All Options
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              ✓ 20-minute clarity session • ✓ Real certified coach • ✓ Book in 60 seconds
            </p>
          </div>
        </div>
      </section>

      {/* PAIN POINTS - What You're Feeling */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              You're Not Alone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Millions struggle with stress, anxiety, and overwhelm. Here's what you might be experiencing:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Moon className="h-8 w-8 text-indigo-600" />,
                title: "Can't Sleep",
                description:
                  "Your mind races at night. You wake up at 3am with anxiety. Sleep feels impossible.",
              },
              {
                icon: <Brain className="h-8 w-8 text-purple-600" />,
                title: "Constant Worry",
                description:
                  "You overthink everything. Anxiety spirals consume your day. You can't turn it off.",
              },
              {
                icon: <Zap className="h-8 w-8 text-yellow-600" />,
                title: "Burnout & Exhaustion",
                description:
                  "You're drained. Work feels impossible. You have nothing left to give.",
              },
              {
                icon: <Heart className="h-8 w-8 text-red-600" />,
                title: "Emotional Overwhelm",
                description:
                  "Small things trigger big reactions. You feel out of control. Emotions are overwhelming.",
              },
            ].map((pain, idx) => (
              <Card key={idx} className="border-l-4 border-l-emerald-500">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">{pain.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {pain.title}
                      </h3>
                      <p className="text-gray-600">{pain.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* THE SOLUTION - AI Coaching */}
      <section className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Personal AI Coach
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Available whenever you need support. No wait lists. No judgment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* What You Get */}
            <div className="space-y-6">
              {[
                {
                  title: "24/7 Availability",
                  description:
                    "3am anxiety attack? Your coach is there. Anytime, anywhere.",
                },
                {
                  title: "Personalized Coaching",
                  description:
                    "Learns your patterns. Adapts to your needs. Feels like talking to someone who truly knows you.",
                },
                {
                  title: "Crisis Support",
                  description:
                    "Overwhelmed? Your coach helps you process emotions in real-time and get back to calm.",
                },
                {
                  title: "Emotion Tracking",
                  description:
                    "See your emotional patterns over time. Understand what triggers you. Make real progress.",
                },
                {
                  title: "Evidence-Based Techniques",
                  description:
                    "CBT, DBT, mindfulness, and other proven methods delivered conversationally.",
                },
                {
                  title: "Affordable & Accessible",
                  description:
                    "From $49/session. No expensive therapy bills. No insurance hassles. Pay only when you book.",
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-6">
              {[
                {
                  name: "Sarah M.",
                  role: "Anxiety sufferer",
                  quote:
                    "I was having panic attacks daily. My AI coach helped me understand my triggers and gave me tools I could use immediately. I finally feel like myself again.",
                  rating: 5,
                },
                {
                  name: "James L.",
                  role: "Burned out professional",
                  quote:
                    "I couldn't afford therapy, and the wait lists were 6 months long. This AI coach gave me the support I needed right away. Life-changing.",
                  rating: 5,
                },
                {
                  name: "Maria T.",
                  role: "Sleep-deprived parent",
                  quote:
                    "3am anxiety was destroying my life. Now I have someone to talk to anytime. I'm sleeping better and feeling more in control.",
                  rating: 5,
                },
              ].map((testimonial, idx) => (
                <Card key={idx} className="bg-white border-emerald-200">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up",
                description: "Create your account in 2 minutes. No credit card required for trial.",
              },
              {
                step: "2",
                title: "Start Chatting",
                description: "Tell your AI coach what's on your mind. They listen without judgment.",
              },
              {
                step: "3",
                title: "Get Support",
                description: "Receive personalized coaching, techniques, and emotional support.",
              },
              {
                step: "4",
                title: "Feel Better",
                description: "Track your progress. Notice improvements in mood, sleep, and stress.",
              },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Affordable Coaching Plans
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Foundation",
                price: "$49",
                period: "/session",
                description: "30-minute coaching session",
                features: [
                  "One-on-one coaching",
                  "Personalized action plan",
                  "Session notes & takeaways",
                  "Email support between sessions",
                  "Book as needed",
                ],
                cta: "Book Foundation Session",
                highlight: false,
              },
              {
                name: "Breakthrough",
                price: "$99",
                period: "/session",
                description: "60-minute deep-dive session",
                features: [
                  "Everything in Foundation",
                  "Extended session time",
                  "Root cause analysis",
                  "Custom strategy development",
                  "Priority scheduling",
                ],
                cta: "Book Breakthrough Session",
                highlight: true,
              },
              {
                name: "Transformation",
                price: "$149",
                period: "/session",
                description: "90-minute intensive session",
                features: [
                  "Everything in Breakthrough",
                  "Comprehensive life audit",
                  "Multi-area coaching",
                  "30-day action roadmap",
                  "Unlimited text support",
                ],
                cta: "Book Transformation Session",
                highlight: false,
              },
            ].map((tier, idx) => (
              <Card
                key={idx}
                className={tier.highlight ? "border-2 border-emerald-600 shadow-lg" : ""}
              >
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">{tier.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <span className="text-4xl font-bold text-gray-900">
                      {tier.price}
                    </span>
                    <span className="text-gray-600 ml-2">{tier.period}</span>
                  </div>

                  <ul className="space-y-3">
                    {tier.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={
                      tier.highlight
                        ? "w-full bg-emerald-600 hover:bg-emerald-700"
                        : "w-full"
                    }
                    onClick={() => {
                      if (!user) {
                        window.location.href = getLoginUrl();
                        return;
                      }
                      // Redirect to session booking page
                      window.location.href = "/book-session";
                    }}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* AI SUBSCRIPTION PLANS - Unlimited Coaching */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-200 text-purple-900">
              Unlimited Access
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              24/7 AI Coaching Subscriptions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get unlimited AI coaching support anytime, anywhere. Perfect for ongoing emotional wellness.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                id: "AI_ESSENTIAL",
                name: "AI Essential",
                price: "$49",
                period: "/month",
                description: "24/7 AI coaching support with unlimited check-ins",
                features: [
                  "24/7 AI coaching chat",
                  "Unlimited daily check-ins",
                  "Crisis detection & alerts",
                  "Emotion tracking & insights",
                  "Progress visualization",
                  "Email support"
                ],
                cta: "Start AI Essential",
                highlight: false,
              },
              {
                id: "AI_GROWTH",
                name: "AI Growth",
                price: "$79",
                period: "/month",
                description: "Advanced AI coaching with monthly human check-ins",
                features: [
                  "Everything in AI Essential",
                  "Advanced pattern detection",
                  "Personalized coping strategies",
                  "Monthly human coach check-in",
                  "Priority crisis escalation",
                  "Weekly progress reports"
                ],
                cta: "Start AI Growth",
                highlight: true,
              },
              {
                id: "AI_TRANSFORMATION",
                name: "AI Transformation",
                price: "$99",
                period: "/month",
                description: "Premium AI coaching with bi-weekly human sessions",
                features: [
                  "Everything in AI Growth",
                  "Bi-weekly human coach sessions",
                  "Custom goal tracking",
                  "Unlimited crisis support",
                  "Family support resources",
                  "Lifetime access to insights"
                ],
                cta: "Start AI Transformation",
                highlight: false,
              },
            ].map((tier, idx) => (
              <Card
                key={idx}
                className={tier.highlight ? "border-2 border-purple-600 shadow-lg" : ""}
              >
                {tier.highlight && (
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">{tier.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <span className="text-4xl font-bold text-gray-900">
                      {tier.price}
                    </span>
                    <span className="text-gray-600 ml-2">{tier.period}</span>
                  </div>

                  <ul className="space-y-3">
                    {tier.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-purple-600" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={
                      tier.highlight
                        ? "w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        : "w-full bg-purple-600 hover:bg-purple-700"
                    }
                    onClick={() => {
                      if (!user) {
                        window.location.href = getLoginUrl();
                        return;
                      }
                      subscribeMutation.mutate({ productId: tier.id });
                    }}
                  >
                    {tier.cta}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Cancel anytime. No long-term commitment.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison */}
          <div className="mt-12 text-center bg-white rounded-lg p-6 shadow-md">
            <p className="text-gray-700 text-lg">
              <strong>Not sure which plan?</strong> Start with AI Essential and upgrade anytime.
            </p>
            <p className="text-gray-600 mt-2">
              Or book a single session first to see if we're the right fit for you.
            </p>
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Common Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Is this a replacement for therapy?",
                a: "No. This is a supportive tool for emotional wellness. If you're in crisis, please reach out to a mental health professional or crisis line.",
              },
              {
                q: "How is my data kept private?",
                a: "Your conversations are encrypted and stored securely. We never share your data with third parties. HIPAA compliant.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Pay per session. No subscriptions. No commitments. Book only when you need support.",
              },
              {
                q: "How quickly does it work?",
                a: "Many people feel better after their first conversation. Real transformation takes time, but you'll notice improvements in mood and stress within weeks.",
              },
            ].map((faq, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            You Deserve to Feel Better
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Your AI coach is ready to support you. Start your journey to emotional resilience today.
          </p>
          <Button
            size="lg"
            className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold"
            onClick={() =>
              document
                .getElementById("pricing")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
