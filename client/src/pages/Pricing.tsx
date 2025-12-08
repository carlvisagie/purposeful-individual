/**
 * Pricing Page
 * Research-backed subscription tiers with Stripe integration
 * Based on evidence from 80+ SaaS companies (2018-2023)
 * Healthcare/MedTech freemium conversion: 15.3% signup, 4.0% free-to-paid
 */

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Check, Sparkles, Zap, Crown, TrendingUp } from "lucide-react";
import { trpc } from "../lib/trpc";
import { useLocation } from "wouter";

const tiers = [
  {
    name: "Free",
    price: 0,
    annualPrice: 0,
    period: "forever",
    description: "Experience AI coaching quality",
    icon: Sparkles,
    features: [
      "10 AI coaching messages per month",
      "Access to 3 wellness modules (Sleep, Stress, Nutrition)",
      "Basic progress tracking",
      "Community access",
      "Email support",
    ],
    limitations: [
      "Limited session history",
      "No live coaching sessions",
      "No priority support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Starter",
    price: 800,
    annualPrice: 8000, // Save $1,600/year
    period: "month",
    description: "For individuals serious about transformation",
    icon: Zap,
    features: [
      "Unlimited AI coaching messages",
      "Access to ALL 31 wellness modules",
      "Advanced progress analytics",
      "2 live coaching sessions per month",
      "Priority email support",
      "Crisis detection & alerts",
      "Session recordings & transcripts",
      "Custom goal setting",
      "Weekly insights reports",
    ],
    limitations: [],
    cta: "Start Transformation",
    popular: true,
    stripePriceIdMonthly: "price_1Sc7ocCoewQKHspl7j3lv4f3",
    stripePriceIdYearly: "price_1Sc7ocCoewQKHspl5CK1Ma6d",
  },
  {
    name: "Professional",
    price: 1200,
    annualPrice: 12000, // Save $2,400/year
    period: "month",
    description: "For executives and families",
    icon: Crown,
    features: [
      "Everything in Starter, plus:",
      "4 live coaching sessions per month",
      "Personalized wellness plan",
      "Direct phone/text access to coach",
      "Custom module creation",
      "Family member access (up to 3)",
      "Priority response times (< 2 hours)",
      "Export all your data",
      "API access",
    ],
    limitations: [],
    cta: "Go Professional",
    popular: false,
    stripePriceIdMonthly: "price_1Sc7odCoewQKHsplIS5vrLkT",
    stripePriceIdYearly: "price_1Sc7odCoewQKHsplLocuxZ8q",
  },
  {
    name: "Elite",
    price: 2000,
    annualPrice: 20000, // Save $4,000/year
    period: "month",
    description: "For ultra-high-net-worth individuals",
    icon: TrendingUp,
    features: [
      "Everything in Professional, plus:",
      "8 live coaching sessions per month",
      "24/7 priority support",
      "Quarterly in-person sessions (if local)",
      "Custom research analysis",
      "Accountability partner matching",
      "Dedicated success manager",
      "White-glove onboarding",
      "Custom integrations",
    ],
    limitations: [],
    cta: "Join Elite",
    popular: false,
    stripePriceIdMonthly: "price_1Sc7oeCoewQKHspl8FMIaJnM",
    stripePriceIdYearly: "price_1Sc7oeCoewQKHsplM9KjtVSW",
    limited: true,
    limitText: "Limited to 10 members",
  },
];

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [, setLocation] = useLocation();
  
  const createCheckoutMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleSubscribe = (tier: typeof tiers[0]) => {
    if (tier.name === "Free") {
      // Redirect to signup
      setLocation("/login");
    } else {
      // Determine which price ID to use based on billing period
      const priceId = billingPeriod === "yearly" 
        ? tier.stripePriceIdYearly 
        : tier.stripePriceIdMonthly;
      
      if (priceId) {
        // Create Stripe checkout session
        createCheckoutMutation.mutate({
          productId: priceId,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Choose Your Path to Freedom
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Evidence-based pricing backed by research from 80+ SaaS companies. Healthcare users convert at 4% (3rd highest of all industries).
          </p>
          <p className="text-lg text-purple-600 font-semibold">
            Built on research from Huberman, Attia, Walker, and 100+ leading scientists
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={billingPeriod === "monthly" ? "font-semibold" : "text-muted-foreground"}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-7 bg-purple-600 rounded-full transition-colors"
            aria-label="Toggle billing period"
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingPeriod === "yearly" ? "translate-x-7" : ""
              }`}
            />
          </button>
          <span className={billingPeriod === "yearly" ? "font-semibold" : "text-muted-foreground"}>
            Yearly
            <span className="ml-2 text-green-600 font-semibold">(Save up to $4,000)</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const displayPrice = tier.price === 0 
              ? "Free" 
              : billingPeriod === "yearly" 
              ? `$${Math.floor(tier.annualPrice / 12)}`
              : `$${tier.price}`;
            
            const savings = billingPeriod === "yearly" && tier.price > 0
              ? tier.price * 12 - tier.annualPrice
              : 0;

            return (
              <Card
                key={tier.name}
                className={`relative p-8 ${
                  tier.popular
                    ? "border-2 border-purple-600 shadow-2xl scale-105"
                    : "border shadow-lg"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                {tier.limited && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {tier.limitText}
                  </div>
                )}

                <div className="text-center space-y-4">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      tier.popular ? "bg-purple-600" : "bg-purple-100"
                    }`}>
                      <Icon className={`w-8 h-8 ${tier.popular ? "text-white" : "text-purple-600"}`} />
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-2xl font-bold">{tier.name}</h3>

                  {/* Price */}
                  <div>
                    <div className="text-4xl font-bold">
                      {displayPrice}
                    </div>
                    {tier.price > 0 && (
                      <div className="text-muted-foreground">
                        per month{billingPeriod === "yearly" ? ", billed yearly" : ""}
                      </div>
                    )}
                    {savings > 0 && (
                      <div className="text-green-600 font-semibold mt-1">
                        Save ${savings.toLocaleString()}/year
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground">{tier.description}</p>

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSubscribe(tier)}
                    disabled={createCheckoutMutation.isPending}
                  >
                    {createCheckoutMutation.isPending ? "Loading..." : tier.cta}
                  </Button>
                </div>

                {/* Features */}
                <div className="mt-8 space-y-3">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Value Proposition */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-to-r from-purple-50 to-blue-50">
            <h2 className="text-2xl font-bold text-center mb-6">Why This Pricing?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">15.3%</div>
                <p className="text-sm text-muted-foreground">
                  Healthcare has the HIGHEST freemium signup rate of all industries
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">4.0%</div>
                <p className="text-sm text-muted-foreground">
                  Free-to-paid conversion rate (3rd highest industry)
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">80+</div>
                <p className="text-sm text-muted-foreground">
                  SaaS companies studied (2018-2023) to determine optimal pricing
                </p>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              "I bow to truth and reality, whatever the research proves is what we do." — Carl Visagie
            </p>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-muted-foreground">
                Absolutely. We're HIPAA compliant and use enterprise-grade encryption. Your conversations are private and never shared.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">What's included in the free tier?</h3>
              <p className="text-muted-foreground">
                10 AI coaching messages per month, access to 3 core wellness modules (Sleep, Stress, Nutrition), and basic progress tracking. No credit card required.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                Yes! If you're not satisfied within the first 30 days, we'll refund you in full, no questions asked.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I switch plans later?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades take effect at the start of your next billing cycle.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Why is this more expensive than other coaching apps?</h3>
              <p className="text-muted-foreground">
                We're competing with traditional therapists ($150-$300/session) and executive coaches ($500-$1,000/session). Our pricing reflects the value of unlimited AI coaching + live human sessions + evidence-based protocols from leading scientists. You're not buying an app—you're investing in transformation.
              </p>
            </Card>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-24 text-center">
          <p className="text-muted-foreground mb-6">Trusted by transformation seekers worldwide</p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold">256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Evidence-Based</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold">30-Day Money Back</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
