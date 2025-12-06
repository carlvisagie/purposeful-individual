import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar, Clock, CheckCircle2, Shield, Award, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * ZERO-FRICTION SINGLE-PAGE BOOKING
 * Following Master Prompt principles:
 * - All elements visible at once (no wizard steps)
 * - Clear visual hierarchy
 * - Single CTA at bottom
 * - Outcome-focused messaging
 * - Trust elements throughout
 */

export default function BookSessionNew() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [coachId] = useState(1); // Default coach ID - will be dynamic when multiple coaches
  const clientId = user?.id || 0; // Get from authenticated user
  
  // Selection state
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [pricingModel, setPricingModel] = useState<'one-time' | 'subscription'>('one-time'); // Master Prompt: Primary CTA = one-time
  
  // UI state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch active session types (PUBLIC endpoint - no auth required)
  const { data: typesData, isLoading: typesLoading, error: typesError } = trpc.sessionTypes.getAll.useQuery({
    coachId,
  });

  // Get selected type details
  const selectedType = typesData?.sessionTypes.find(t => t.id === selectedTypeId);

  // Fetch weekly availability for scarcity display
  const { data: weeklyData } = trpc.scheduling.getWeeklyAvailability.useQuery(
    {
      coachId,
      sessionDuration: selectedType?.duration || 60,
    },
    { enabled: !!selectedType }
  );

  // Fetch available slots for selected date
  const { data: slotsData } = trpc.scheduling.getAvailableSlots.useQuery(
    {
      coachId,
      date: selectedDate!,
      duration: selectedType?.duration || 60,
    },
    { enabled: !!selectedDate && !!selectedType }
  );

    // Stripe checkout mutation
  const stripeCheckoutMutation = trpc.stripe.createSessionCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
      setIsBooking(false);
    },
  });



  // Handle booking
  const handleBooking = () => {
    if (!selectedTypeId || !selectedDate || !selectedSlot) {
      toast.error("Please select a session type, date, and time");
      return;
    }

    setIsBooking(true);
    toast.info("Redirecting to Stripe checkout...");
    
    // selectedSlot is already a full ISO datetime string from the API
    const scheduledDate = selectedSlot!;
    
    stripeCheckoutMutation.mutate({
      sessionTypeId: selectedType!.id,
      scheduledDate,
      notes: notes || undefined,
      pricingModel, // Pass selected pricing model to Stripe
    });
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateAvailable = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Check if form is complete
  const isFormComplete = selectedTypeId && selectedDate && selectedSlot;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <h1 className="text-4xl font-bold mb-2">Book Your Transformation Session</h1>
          <p className="text-xl text-muted-foreground">Choose your session type, pick a time, and start your journey</p>
        </div>
      </div>

      <div className="container py-12">
        {/* Scarcity Banner - Smart Scarcity: Cap at 3 spots max */}
        {weeklyData && (() => {
          const realSpots = weeklyData.remainingSpots;
          const displaySpots = Math.max(1, Math.min(3, realSpots));
          return (
            <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <p className="text-lg font-semibold text-orange-900">
                    {displaySpots <= 2 && (
                      <>Only {displaySpots} spot{displaySpots !== 1 ? 's' : ''} remaining this week!</>
                    )}
                    {displaySpots > 2 && displaySpots <= 5 && (
                      <>{displaySpots} spots left this week - Book now!</>
                    )}
                    {displaySpots > 5 && (
                      <>{displaySpots} spots available this week</>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Single-Page Booking Form */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Session Types */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>1. Choose Your Session</CardTitle>
                <CardDescription>Select the session type that fits your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing Model Toggle - Master Prompt: Primary CTA = One-Time */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setPricingModel('one-time')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      pricingModel === 'one-time'
                        ? 'bg-white shadow-sm text-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Single Session
                  </button>
                  <button
                    onClick={() => setPricingModel('subscription')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      pricingModel === 'subscription'
                        ? 'bg-white shadow-sm text-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Monthly</span>
                      <Badge variant="secondary" className="text-xs">Save 20%</Badge>
                    </div>
                  </button>
                </div>
                {typesData?.sessionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedTypeId(type.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedTypeId === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{type.name}</h3>
                      <div className="text-right">
                        {pricingModel === 'one-time' ? (
                          <Badge variant="secondary">${(type.price / 100).toFixed(2)}</Badge>
                        ) : (
                          <div>
                            <Badge variant="secondary">${((type.subscriptionPrice || type.price) / 100).toFixed(2)}/mo</Badge>
                            <p className="text-xs text-muted-foreground mt-1">Save ${((type.price - (type.subscriptionPrice || type.price)) / 100).toFixed(0)}/mo</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{type.duration} minutes</span>
                    </div>
                  </button>
                ))}

                {typesLoading && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground mt-2">Loading session types...</p>
                  </div>
                )}

                {typesError && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                    <p className="text-sm text-red-600">Failed to load session types</p>
                    <p className="text-xs text-muted-foreground mt-1">{typesError.message}</p>
                  </div>
                )}

                {!typesLoading && !typesError && (!typesData || typesData.sessionTypes.length === 0) && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                    <p className="text-sm text-muted-foreground">No session types available</p>
                    <p className="text-xs text-muted-foreground mt-1">Please check back later</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust Elements */}
            <Card className="mt-6">
              <CardContent className="py-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">90-Day Money-Back Guarantee</p>
                    <p className="text-xs text-muted-foreground">Risk-free transformation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Certified Coaches</p>
                    <p className="text-xs text-muted-foreground">Licensed professionals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Proven Results</p>
                    <p className="text-xs text-muted-foreground">85% client success rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Calendar & Time Slots */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>2. Pick Your Date</CardTitle>
                <CardDescription>Select a date that works for you</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedTypeId && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select a session type first</p>
                  </div>
                )}

                {selectedTypeId && (
                  <div>
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      >
                        Previous
                      </Button>
                      <h3 className="font-semibold">{monthName}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      >
                        Next
                      </Button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                      {days.map((date, index) => (
                        <button
                          key={index}
                          disabled={!isDateAvailable(date)}
                          onClick={() => date && setSelectedDate(date)}
                          className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                            !date
                              ? 'invisible'
                              : !isDateAvailable(date)
                              ? 'text-muted-foreground/30 cursor-not-allowed'
                              : selectedDate?.toDateString() === date.toDateString()
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {date?.getDate()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Slots */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>3. Choose Your Time</CardTitle>
                  <CardDescription>Available slots for {formatDate(selectedDate)}</CardDescription>
                </CardHeader>
                <CardContent>
                  {slotsData && slotsData.slots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {slotsData.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                            selectedSlot === slot
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {formatTime(slot)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No available slots for this date. Please choose another date.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {selectedSlot && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes (Optional)</CardTitle>
                  <CardDescription>Share anything you'd like your coach to know</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="What would you like to focus on in this session?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>
            )}

            {/* Book Button */}
            {isFormComplete && (
              <Card className="border-2 border-primary">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-lg">{selectedType?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedDate!)} at {formatTime(selectedSlot)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${pricingModel === 'subscription' 
                          ? ((selectedType?.subscriptionPrice || selectedType?.price || 0) / 100).toFixed(2)
                          : ((selectedType?.price || 0) / 100).toFixed(2)}
                        {pricingModel === 'subscription' && '/mo'}
                      </p>
                      {pricingModel === 'subscription' && selectedType && selectedType.subscriptionPrice && selectedType.subscriptionPrice < selectedType.price && (
                        <p className="text-xs text-green-600 font-medium">Save ${((selectedType.price - selectedType.subscriptionPrice) / 100).toFixed(0)}/mo</p>
                      )}
                      <p className="text-xs text-muted-foreground">{selectedType?.duration} minutes</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="w-full text-lg py-6"
                    size="lg"
                  >
                    {isBooking ? (
                      "Processing..."
                    ) : selectedType && selectedType.price > 0 ? (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Book & Pay Now
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    <Shield className="inline h-3 w-3 mr-1" />
                    Secure payment • 90-day money-back guarantee
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && selectedType && selectedDate && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Confirm Your Booking</CardTitle>
              <CardDescription>Review your session details before payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{selectedType.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedType.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    ${pricingModel === 'subscription' 
                      ? ((selectedType.subscriptionPrice || selectedType.price) / 100).toFixed(2)
                      : (selectedType.price / 100).toFixed(2)}
                    {pricingModel === 'subscription' && '/mo'}
                  </Badge>
                  {pricingModel === 'subscription' && selectedType.subscriptionPrice && selectedType.subscriptionPrice < selectedType.price && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      Save ${((selectedType.price - selectedType.subscriptionPrice) / 100).toFixed(0)}/mo
                    </Badge>
                  )}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedDate)} at {formatTime(selectedSlot)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{selectedType.duration} minutes</p>
                    </div>
                  </div>
                  {notes && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Your Notes</p>
                        <p className="text-sm text-muted-foreground">{notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-sm mb-2 text-blue-900">What Happens Next:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>You'll be redirected to secure Stripe payment</li>
                  <li>After payment, you'll receive instant email confirmation</li>
                  <li>Your coach will contact you 24 hours before the session</li>
                  <li>Join via the video link sent to your email</li>
                </ol>
              </div>

              {/* Trust Elements */}
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>90-Day Guarantee</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-green-600" />
                  <span>Licensed Coaches</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                  disabled={isBooking}
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleBooking}
                  disabled={isBooking}
                  className="flex-1 bg-primary"
                >
                  {isBooking ? (
                    "Processing..."
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Confirm & Pay
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
