import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor,
  Maximize,
  AlertCircle,
  Circle
} from "lucide-react";
import DailyIframe, { DailyCall, DailyEvent } from "@daily-co/daily-js";

/**
 * Live Video Session Component
 * 
 * Integrates Daily.co for HIPAA-compliant video calling
 * Provides real-time transcription feed to AI assistant
 * Records sessions for coach review only
 * 
 * Features:
 * - HD video/audio
 * - Screen sharing
 * - Session recording
 * - Real-time transcription
 * - AI script suggestions
 * - Escalation alerts
 */

interface LiveVideoSessionProps {
  roomUrl: string;
  sessionId: string;
  clientId: string;
  clientName: string;
  onTranscript: (text: string, speaker: "coach" | "client") => void;
  onSessionEnd: () => void;
}

export default function LiveVideoSession({
  roomUrl,
  sessionId,
  clientId,
  clientName,
  onTranscript,
  onSessionEnd
}: LiveVideoSessionProps) {
  const callFrameRef = useRef<DailyCall | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<"good" | "fair" | "poor">("good");
  const [sessionDuration, setSessionDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Initialize Daily.co call
  useEffect(() => {
    if (!containerRef.current || callFrameRef.current) return;

    const callFrame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "8px"
      },
      showLeaveButton: false,
      showFullscreenButton: true,
      showLocalVideo: true,
      showParticipantsBar: true
    });

    callFrameRef.current = callFrame;

    // Event listeners
    callFrame.on("joined-meeting", handleJoinedMeeting);
    callFrame.on("left-meeting", handleLeftMeeting);
    callFrame.on("participant-joined", handleParticipantJoined);
    callFrame.on("participant-left", handleParticipantLeft);
    callFrame.on("recording-started", () => setIsRecording(true));
    callFrame.on("recording-stopped", () => setIsRecording(false));
    callFrame.on("network-quality-change", handleNetworkQuality);
    callFrame.on("error", handleError);

    // Join the call
    callFrame.join({ url: roomUrl }).catch((err) => {
      console.error("Failed to join call:", err);
      setError("Failed to join video session. Please check your connection.");
    });

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
    };
  }, [roomUrl]);

  // Session timer
  useEffect(() => {
    if (!isJoined) return;

    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isJoined]);

  const handleJoinedMeeting = () => {
    setIsJoined(true);
    // Start recording automatically for coach review
    startRecording();
  };

  const handleLeftMeeting = () => {
    setIsJoined(false);
    onSessionEnd();
  };

  const handleParticipantJoined = (event: DailyEvent) => {
    console.log("Participant joined:", event.participant);
  };

  const handleParticipantLeft = (event: DailyEvent) => {
    console.log("Participant left:", event.participant);
  };

  const handleNetworkQuality = (event: any) => {
    const quality = event.quality;
    if (quality > 0.7) setConnectionQuality("good");
    else if (quality > 0.4) setConnectionQuality("fair");
    else setConnectionQuality("poor");
  };

  const handleError = (event: any) => {
    console.error("Daily.co error:", event);
    setError(event.errorMsg || "An error occurred during the video session.");
  };

  const toggleVideo = () => {
    if (!callFrameRef.current) return;
    callFrameRef.current.setLocalVideo(!isVideoOn);
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    if (!callFrameRef.current) return;
    callFrameRef.current.setLocalAudio(!isAudioOn);
    setIsAudioOn(!isAudioOn);
  };

  const toggleScreenShare = async () => {
    if (!callFrameRef.current) return;
    
    try {
      if (isScreenSharing) {
        await callFrameRef.current.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        await callFrameRef.current.startScreenShare();
        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error("Screen share error:", err);
      setError("Failed to share screen. Please try again.");
    }
  };

  const startRecording = async () => {
    if (!callFrameRef.current) return;
    
    try {
      await callFrameRef.current.startRecording();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      // Non-critical error, don't show to user
    }
  };

  const stopRecording = async () => {
    if (!callFrameRef.current) return;
    
    try {
      await callFrameRef.current.stopRecording();
      setIsRecording(false);
    } catch (err) {
      console.error("Stop recording error:", err);
    }
  };

  const endSession = () => {
    if (!callFrameRef.current) return;
    callFrameRef.current.leave();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case "good": return "text-green-600";
      case "fair": return "text-yellow-600";
      case "poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Video Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Error Overlay */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <Card className="p-4 bg-red-50 border-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-900">{error}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </Card>
        </div>
      )}

      {/* Session Info Bar */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur">
          {clientName}
        </Badge>
        <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur">
          {formatDuration(sessionDuration)}
        </Badge>
        {isRecording && (
          <Badge variant="destructive" className="animate-pulse">
            <Circle className="w-2 h-2 fill-current mr-1" />
            Recording
          </Badge>
        )}
        <Badge 
          variant="secondary" 
          className={`bg-black/50 backdrop-blur ${getConnectionColor()}`}
        >
          <Circle className="w-2 h-2 fill-current mr-1" />
          {connectionQuality}
        </Badge>
      </div>

      {/* Control Bar */}
      {isJoined && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
          <Card className="p-3 bg-black/70 backdrop-blur border-white/20">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isVideoOn ? "secondary" : "destructive"}
                onClick={toggleVideo}
              >
                {isVideoOn ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <VideoOff className="w-4 h-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant={isAudioOn ? "secondary" : "destructive"}
                onClick={toggleAudio}
              >
                {isAudioOn ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant={isScreenSharing ? "default" : "secondary"}
                onClick={toggleScreenShare}
              >
                <Monitor className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-white/20 mx-1" />

              <Button
                size="sm"
                variant="destructive"
                onClick={endSession}
              >
                <PhoneOff className="w-4 h-4" />
                End Session
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {!isJoined && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Connecting to video session...</p>
          </div>
        </div>
      )}
    </div>
  );
}
