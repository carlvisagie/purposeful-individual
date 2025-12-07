/**
 * Frictionless Landing Page
 * Instant engagement with AI coach - no barriers
 */

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { AnonymousChat } from "../components/AnonymousChat";
import { 
  Sparkles, 
  Brain, 
  Heart, 
  TrendingUp, 
  Shield,
  ArrowRight,
  Check
} from "lucide-react";

export default function Landing() {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-purple-900">
              Purposeful Live Coaching
            </h1>
            <Button
              variant="outline"
              onClick={() => setShowChat(false)}
            >
              Back to Home
            </Button>
          </div>
          
          <Card className="h-[calc(100vh-200px)]">
            <AnonymousChat />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Purposeful Live Coaching</h1>
          </div>

          {/* Headline */}
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Transform Your Life with
            <span className="text-purple-600"> AI-Powered</span>
            <br />
            Evidence-Based Coaching
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant support from an AI coach trained on cutting-edge research 
            from Huberman, Attia, Walker, and leading scientists. Start your 
            transformation journey in seconds—no signup required.
          </p>

          {/* Primary CTA */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="text-xl px-12 py-8 bg-purple-600 hover:bg-purple-700 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowChat(true)}
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Start Talking to Your AI Coach Now
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>

            <p className="text-sm text-gray-500">
              No signup. No credit card. Just start talking.
            </p>
          </div>

          {/* Secondary CTA */}
          <div className="pt-4">
            <a
              href="/pricing"
              className="text-purple-600 hover:text-purple-700 font-medium underline"
            >
              Already convinced? Get Full Access Now →
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-4 gap-6 mt-20 max-w-6xl mx-auto">
          <Card className="p-6 text-center space-y-3 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">Evidence-Based</h3>
            <p className="text-sm text-gray-600">
              Built on research from leading scientists and proven protocols
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Compassionate AI</h3>
            <p className="text-sm text-gray-600">
              Warm, supportive coaching that understands your unique journey
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">Self-Learning</h3>
            <p className="text-sm text-gray-600">
              Platform gets smarter with every interaction, personalizing to you
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900">HIPAA Compliant</h3>
            <p className="text-sm text-gray-600">
              Enterprise-grade security with AI safety guardrails
            </p>
          </Card>
        </div>

        {/* Social Proof */}
        <div className="mt-20 max-w-3xl mx-auto">
          <Card className="p-8 bg-white/80 backdrop-blur">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
              Why Purposeful Live Coaching?
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "31+ integrated wellness modules",
                "Autism intervention tracking",
                "Sleep optimization protocols",
                "Nutrition & supplement guidance",
                "Mental health support",
                "Habit formation science",
                "Identity transformation",
                "Progress analytics & insights",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center space-y-6">
          <h3 className="text-3xl font-bold text-gray-900">
            Ready to Transform Your Life?
          </h3>
          <p className="text-xl text-gray-600">
            Start your journey in the next 10 seconds.
          </p>
          <Button
            size="lg"
            className="text-xl px-12 py-8 bg-purple-600 hover:bg-purple-700 shadow-2xl"
            onClick={() => setShowChat(true)}
          >
            <Sparkles className="w-6 h-6 mr-3" />
            Start Free Now
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-sm text-gray-500 space-y-2">
          <p>
            Built on research from Andrew Huberman, Peter Attia, Matthew Walker, 
            and 100+ leading scientists
          </p>
          <p>
            © 2025 Purposeful Live Coaching. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
