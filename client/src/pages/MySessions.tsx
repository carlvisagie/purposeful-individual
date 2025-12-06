import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, Clock, Video, XCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function MySessions() {
  const { user } = useAuth();
  const clientId = user?.id || 0; // Get from authenticated user
  const [cancellingSession, setCancellingSession] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  // Verify payment and create booking on success page load
  const verifyPayment = trpc.stripe.verifyAndCreateBooking.useMutation({
    onSuccess: (data) => {
      if (!data.alreadyExists) {
        toast.success("Booking confirmed! Your session has been scheduled.");
      }
      refetchUpcoming();
      refetchAll();
      // Remove payment param from URL
      window.history.replaceState({}, '', '/my-sessions');
    },
    onError: (error) => {
      toast.error(`Failed to confirm booking: ${error.message}`);
    },
  });

  // Check for payment success and session_id in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      // Verify payment and create booking
      verifyPayment.mutate({ sessionId });
    }
  }, []);

  // Fetch sessions
  const { data: upcomingData, refetch: refetchUpcoming } = trpc.scheduling.getUpcomingClientSessions.useQuery({
    clientId,
  });

  const { data: allSessionsData, refetch: refetchAll } = trpc.scheduling.getClientSessions.useQuery({
    clientId,
  });

  // Cancel mutation
  const cancelSession = trpc.scheduling.cancelSession.useMutation({
    onSuccess: () => {
      toast.success("Session cancelled successfully");
      setCancellingSession(null);
      refetchUpcoming();
      refetchAll();
    },
    onError: (error) => {
      toast.error(`Failed to cancel session: ${error.message}`);
    },
  });

  const handleCancelSession = () => {
    if (cancellingSession) {
      cancelSession.mutate({
        sessionId: cancellingSession,
        cancelledBy: "client",
        reason: "Cancelled by client",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      scheduled: { variant: "default", label: "Scheduled" },
      completed: { variant: "secondary", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      "no-show": { variant: "outline", label: "No-show" },
    };

    const config = variants[status] || variants.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const SessionCard = ({ session, coach }: any) => {
    const sessionDate = new Date(session.scheduledDate);
    const isUpcoming = sessionDate > new Date() && session.status === "scheduled";

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{session.sessionType || "Coaching Session"}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {sessionDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </CardDescription>
            </div>
            {getStatusBadge(session.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {sessionDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Duration:</span>
              <span>{session.duration} minutes</span>
            </div>
          </div>

          {coach && (
            <div className="text-sm">
              <span className="text-muted-foreground">Coach:</span>{" "}
              <span className="font-medium">{coach.userId}</span>
            </div>
          )}

          {session.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes:</span>{" "}
              <p className="mt-1 text-muted-foreground">{session.notes}</p>
            </div>
          )}

          {isUpcoming && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => window.open("https://zoom.us/j/8201808284", "_blank")}
              >
                <Video className="h-4 w-4 mr-2" />
                Join Zoom
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingSession(session.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Sessions</h1>
          <p className="text-muted-foreground">
            View and manage your coaching sessions
          </p>
        </div>
        <Button onClick={() => setLocation("/book-session")}>
          <Calendar className="h-4 w-4 mr-2" />
          Book New Session
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingData?.sessions.length || 0})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingData?.sessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No upcoming sessions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Book a session to get started
                </p>
                <Button onClick={() => setLocation("/book-session")}>
                  Book Your First Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcomingData?.sessions.map(({ session, coach }) => (
              <SessionCard key={session.id} session={session} coach={coach} />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {allSessionsData?.sessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No sessions yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Book your first session to begin your journey
                </p>
                <Button onClick={() => setLocation("/book-session")}>
                  Book a Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            allSessionsData?.sessions.map(({ session, coach }) => (
              <SessionCard key={session.id} session={session} coach={coach} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancellingSession !== null} onOpenChange={() => setCancellingSession(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-amber-500" />
            </div>
            <DialogTitle className="text-center">Cancel Session?</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to cancel this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setCancellingSession(null)}>
              Keep Session
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSession}
              disabled={cancelSession.isPending}
            >
              Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
