/**
 * Pricing Page
 * Subscription tiers with Stripe integration
 */

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { trpc } from "../lib/trpc";
import { useLocation } from "wouter";

const tiers = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Get started with AI coaching",
    icon: Sparkles,
    features: [
      "3 AI coaching sessions per month",
      "Basic wellness modules access",
      "Progress tracking",
      "Email support",
      "Community access",
    ],
    limitations: [
      "Limited session history",
      "No phone support",
      "No priority responses",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Starter",
    price: 29,
    period: "month",
    description: "For individuals committed to growth",
    icon: Zap,
    features: [
      "Unlimited AI coaching sessions",
      "All 31 wellness modules",
      "Advanced progress analytics",
      "Priority email support",
      "Session recordings & transcripts",
      "Custom goal setting",
      "Weekly insights reports",
    ],
    limitations: [],
    cta: "Start 7-Day Free Trial",
    popular: true,
    stripePriceId: "price_starter_monthly", // TODO: Replace with actual Stripe price ID
  },
  {
    name: "Pro",
    price: 79,
    period: "month",
    description: "For serious transformation seekers",
    icon: Crown,
    features: [
      "Everything in Starter, plus:",
      "Phone coaching (24/7 AI)",
      "Human coach check-ins (2x/month)",
      "Crisis detection & support",
      "Secret Keepers private journal",
      "Advanced AI personalization",
      "Priority response times",
      "Export all your data",
      "API access",
    ],
    limitations: [],
    cta: "Start 14-Day Free Trial",
    popular: false,
    stripePriceId: "price_pro_monthly", // TODO: Replace with actual Stripe price ID
  },
  {
    name: "Enterprise",
    price: null,
    period: "custom",
    description: "For organizations and teams",
    icon: Crown,
    features: [
      "Everything in Pro, plus:",
      "Dedicated account manager",
      "Custom integrations",
      "Team management dashboard",
      "Bulk user management",
      "Custom branding",
      "SLA guarantees",
      "On-premise deployment option",
      "HIPAA compliance certification",
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
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
    } else if (tier.name === "Enterprise") {
      // Open contact form or email
      window.location.href = "mailto:sales@purposefullive.com?subject=Enterprise Inquiry";
    } else if (tier.stripePriceId) {
      // Create Stripe checkout session
      createCheckoutMutation.mutate({
        priceId: tier.stripePriceId,
        successUrl: window.location.origin + "/dashboard",
        cancelUrl: window.location.origin + "/pricing",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-bold">Choose Your Path to Transformation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Evidence-based AI coaching backed by research from Huberman, Attia, Walker, and 100+ leading scientists
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
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingPeriod === "yearly" ? "translate-x-7" : ""
              }`}
            />
          </button>
          <span className={billingPeriod === "yearly" ? "font-semibold" : "text-muted-foreground"}>
            Yearly
            <span className="ml-2 text-green-600 font-semibold">(Save 20%)</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const displayPrice = tier.price === null 
              ? "Custom" 
              : tier.price === 0 
              ? "Free" 
              : billingPeriod === "yearly" 
              ? `$${Math.floor(tier.price * 0.8)}`
              : `$${tier.price}`;

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

                <div className="text-center space-y-4">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-2xl font-bold">{tier.name}</h3>

                  {/* Price */}
                  <div>
                    <div className="text-4xl font-bold">
                      {displayPrice}
                    </div>
                    {tier.price !== null && tier.price > 0 && (
                      <div className="text-muted-foreground">
                        per {billingPeriod === "yearly" ? "month, billed yearly" : "month"}
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
                    disabled={createCheckoutMutation.isLoading}
                  >
                    {createCheckoutMutation.isLoading ? "Loading..." : tier.cta}
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
              <h3 className="font-semibold mb-2">What's included in the free trial?</h3>
              <p className="text-muted-foreground">
                Full access to all features in your chosen tier. No credit card required for the Free plan. Cancel anytime during the trial.
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
                Yes! You can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </Card>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-24 text-center">
          <p className="text-muted-foreground mb-6">Trusted by thousands of transformation seekers</p>
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
              <span className="font-semibold">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
