import { InlineWidget } from 'react-calendly';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, DollarSign, Phone } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';

/**
 * Session Booking Page
 * 
 * Calendly integration for booking sessions with coaches.
 * Research-backed: Embedded calendar reduces friction vs external redirect.
 * 
 * Session Tiers:
 * - $1 Intro (20 min) - Tripwire conversion offer
 * - $49 Foundation (45 min) - Entry-level coaching
 * - $99 Growth (60 min) - Most popular tier
 * - $149 Transformation (90 min) - Premium tier
 * 
 * TODO: Replace placeholder Calendly URLs with actual coach calendars
 */

const SESSION_TYPES = [
  {
    id: 'intro',
    name: '$1 Intro Session',
    price: 1,
    duration: 20,
    description: 'Get clarity on your biggest challenge. Zero pressure, maximum insight.',
    calendlyUrl: 'https://calendly.com/purposefullive/intro-session', // TODO: Replace with actual URL
    features: ['20-minute clarity session', 'Personalized insight', 'No commitment required']
  },
  {
    id: 'foundation',
    name: 'Foundation Session',
    price: 49,
    duration: 45,
    description: 'Perfect for getting started with professional coaching and building momentum.',
    calendlyUrl: 'https://calendly.com/purposefullive/foundation-session', // TODO: Replace with actual URL
    features: ['45-minute 1-on-1 session', 'Personalized action plan', 'Email follow-up support', 'Session recording access']
  },
  {
    id: 'growth',
    name: 'Growth Session',
    price: 99,
    duration: 60,
    description: 'Deep-dive sessions with comprehensive support and accountability.',
    calendlyUrl: 'https://calendly.com/purposefullive/growth-session', // TODO: Replace with actual URL
    popular: true,
    features: ['60-minute intensive session', 'Personalized 30-day roadmap', '2 weeks of text support', 'Progress tracking tools', 'Session recording + transcript']
  },
  {
    id: 'transformation',
    name: 'Transformation Session',
    price: 149,
    duration: 90,
    description: 'Premium coaching experience with extended support and rapid breakthrough results.',
    calendlyUrl: 'https://calendly.com/purposefullive/transformation-session', // TODO: Replace with actual URL
    features: ['90-minute breakthrough session', 'Custom transformation plan', '30 days of direct coach access', 'Weekly check-in calls', 'Priority scheduling', 'Lifetime session access']
  }
];

export default function BookSession() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const selectedType = SESSION_TYPES.find(t => t.id === selectedSession);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/individual-coaching">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {!selectedSession ? (
          <>
            {/* Session Selection */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Choose Your Session
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Select the coaching session that best fits your needs. All sessions include personalized guidance and actionable insights.
              </p>
            </div>

            {/* Quick Support Banner */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 max-w-3xl mx-auto mb-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  Need Immediate Support?
                </h3>
                <p className="text-purple-700 mb-4">
                  Talk to our AI coach right now - available 24/7
                </p>
                <a href="tel:+15645296454">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now: +1 (564) 529-6454
                  </Button>
                </a>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {SESSION_TYPES.map((session) => (
                <Card 
                  key={session.id}
                  className={`relative cursor-pointer transition-all hover:shadow-xl ${
                    session.popular ? 'border-2 border-rose-500 scale-105' : 'border border-gray-200'
                  }`}
                  onClick={() => setSelectedSession(session.id)}
                >
                  {session.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      MOST POPULAR
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{session.name}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-bold text-gray-900">${session.price}</span>
                      <span className="text-gray-600">/session</span>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{session.duration} minutes</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">{session.description}</p>

                    <Button 
                      className={`w-full ${session.popular ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gray-900 hover:bg-gray-800'}`}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Calendly Booking Widget */}
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedSession(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Change Session Type
                </Button>
                
                <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedType?.name}
                      </h2>
                      <p className="text-gray-600 mb-4">{selectedType?.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{selectedType?.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>${selectedType?.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Calendly Widget */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <InlineWidget
                  url={selectedType?.calendlyUrl || ''}
                  styles={{
                    height: '700px',
                    minWidth: '320px'
                  }}
                  pageSettings={{
                    backgroundColor: 'ffffff',
                    hideEventTypeDetails: false,
                    hideLandingPageDetails: false,
                    primaryColor: 'f43f5e',
                    textColor: '111827'
                  }}
                />
              </div>

              {/* Trust Elements */}
              <div className="mt-8 text-center text-sm text-gray-600">
                <p>🔒 Secure booking • 90-day money-back guarantee • Licensed professionals</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
