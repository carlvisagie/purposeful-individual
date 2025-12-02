import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ZoomVideoComponent } from "@/components/ZoomVideo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * SESSION DELIVERY ROOM
 * 
 * Live coaching session interface with Zoom Video SDK integration
 * Provides video call, session notes, and real-time coaching tools
 */
export default function SessionRoom() {
  const [location, navigate] = useLocation();
  // Extract query params from hash location
  const hash = window.location.hash;
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const searchParams = new URLSearchParams(queryString);
  const sessionId = searchParams.get("sessionId");
  const [zoomConfig, setZoomConfig] = useState<{
    token: string;
    sessionName: string;
    userName: string;
  } | null>(null);

  // Get Zoom token for session
  const { data: zoomData, isLoading } = trpc.zoom.getSessionToken.useQuery(
    { sessionId: parseInt(sessionId || "0") },
    { enabled: !!sessionId }
  );

  useEffect(() => {
    if (zoomData) {
      setZoomConfig({
        token: zoomData.token,
        sessionName: zoomData.sessionName,
        userName: zoomData.userName,
      });
    }
  }, [zoomData]);

  const handleLeaveSession = () => {
    navigate("/coach-dashboard");
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="p-8 bg-gray-800 border-gray-700">
          <h2 className="text-white text-2xl font-bold mb-4">Invalid Session</h2>
          <p className="text-gray-400 mb-6">No session ID provided</p>
          <Button onClick={() => navigate("/coach-dashboard")}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Connecting to session...</p>
        </div>
      </div>
    );
  }

  if (!zoomConfig) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="p-8 bg-gray-800 border-gray-700">
          <h2 className="text-white text-2xl font-bold mb-4">Connection Error</h2>
          <p className="text-gray-400 mb-6">Unable to connect to session</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <ZoomVideoComponent
      sessionName={zoomConfig.sessionName}
      token={zoomConfig.token}
      userName={zoomConfig.userName}
      onLeave={handleLeaveSession}
    />
  );
}
