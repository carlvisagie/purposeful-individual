// Add this section AFTER the session pricing section (after line 423)
// This provides subscription options in addition to pay-per-session

      {/* AI SUBSCRIPTION PLANS - Unlimited Coaching */}
      <section className="py-20 bg-white">
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
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              <strong>Not sure which plan?</strong> Start with AI Essential and upgrade anytime.
            </p>
          </div>
        </div>
      </section>
