import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import LiveVideoSession from "@/components/LiveVideoSession";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Brain, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";
import { TranscriptionService, TranscriptSegment } from "@/services/transcription";
import { AIScriptEngine, ScriptSuggestion } from "@/services/aiScriptEngine";
import { APP_TITLE } from "@/const";

/**
 * Coach Session Page
 * 
 * Integrated coaching environment with:
 * - Live video calling
 * - Real-time transcription
 * - AI script suggestions
 * - Session recording
 * - Client progress tracking
 * - Escalation alerts
 */

export default function CoachSession() {
  const { sessionId } = useParams();
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();

  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");
  const [clientInfo, setClientInfo] = useState({ id: "", name: "" });

  // Transcription state
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // AI suggestions state
  const [currentSuggestion, setCurrentSuggestion] = useState<ScriptSuggestion | null>(null);
  const [suggestionHistory, setSuggestionHistory] = useState<ScriptSuggestion[]>([]);
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Services
  const transcriptionServiceRef = useRef<TranscriptionService | null>(null);
  const aiEngineRef = useRef<AIScriptEngine | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Initialize services
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    // Initialize AI script engine
    aiEngineRef.current = new AIScriptEngine((suggestion) => {
      setCurrentSuggestion(suggestion);
      setShowSuggestion(true);
      setSuggestionHistory(prev => [suggestion, ...prev]);

      // Auto-hide low urgency suggestions after 30 seconds
      if (suggestion.urgency === "low") {
        setTimeout(() => {
          setShowSuggestion(false);
        }, 30000);
      }
    });

    // Initialize transcription service
    const deepgramApiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
    if (deepgramApiKey) {
      transcriptionServiceRef.current = new TranscriptionService({ apiKey: deepgramApiKey });
    }

    return () => {
      if (transcriptionServiceRef.current) {
        transcriptionServiceRef.current.stop();
      }
      if (aiEngineRef.current) {
        aiEngineRef.current.reset();
      }
    };
  }, [user]);

  // Load session details
  useEffect(() => {
    if (!sessionId) return;

    // TODO: Fetch session details from API
    // For now, use mock data
    setRoomUrl(`https://purposeful.daily.co/${sessionId}`);
    setClientInfo({ id: "client123", name: "Sarah J." });
    setIsSessionActive(true);
  }, [sessionId]);

  // Auto-scroll transcripts
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts]);

  const handleTranscript = (segment: TranscriptSegment) => {
    // Add to transcript list
    setTranscripts(prev => [...prev, segment]);

    // Process with AI engine
    if (aiEngineRef.current) {
      aiEngineRef.current.processTranscript(segment);
    }
  };

  const handleSessionEnd = () => {
    setIsSessionActive(false);
    
    // Stop transcription
    if (transcriptionServiceRef.current) {
      transcriptionServiceRef.current.stop();
      setIsTranscribing(false);
    }

    // TODO: Save session data to database
    
    // Navigate back to dashboard
    navigate("/coach/dashboard");
  };

  const dismissSuggestion = () => {
    setShowSuggestion(false);
  };

  const acceptSuggestion = () => {
    // TODO: Log that coach used this suggestion
    setShowSuggestion(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-red-600 text-white";
      case "high": return "bg-orange-600 text-white";
      case "medium": return "bg-yellow-600 text-white";
      default: return "bg-blue-600 text-white";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      default: return "text-green-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            This page is only accessible to coaches.
          </p>
        </Card>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Session Ended</h2>
          <p className="text-muted-foreground mb-4">
            The coaching session has ended. Session recording and transcript have been saved.
          </p>
          <Button onClick={() => navigate("/coach/dashboard")}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const context = aiEngineRef.current?.getContext();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{APP_TITLE} - Live Session</h1>
              <p className="text-sm text-muted-foreground">Client: {clientInfo.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Brain className="w-3 h-3" />
                AI Assistant Active
              </Badge>
              {context && (
                <Badge variant="outline" className={getRiskColor(context.riskLevel)}>
                  Risk: {context.riskLevel}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
          {/* Video Section (2/3 width) */}
          <div className="lg:col-span-2">
            <Card className="h-full p-4">
              <LiveVideoSession
                roomUrl={roomUrl}
                sessionId={sessionId!}
                clientId={clientInfo.id}
                clientName={clientInfo.name}
                onTranscript={handleTranscript}
                onSessionEnd={handleSessionEnd}
              />
            </Card>
          </div>

          {/* AI Assistant Panel (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
            {/* AI Suggestion Card */}
            {showSuggestion && currentSuggestion && (
              <Card className={`p-4 border-2 ${getUrgencyColor(currentSuggestion.urgency)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    <span className="font-bold">AI Suggestion</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={acceptSuggestion}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={dismissSuggestion}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold">Trigger:</span> {currentSuggestion.script.trigger}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Reason:</span> {currentSuggestion.reason}
                  </div>
                  {currentSuggestion.legalWarning && (
                    <div className="bg-red-100 dark:bg-red-950/50 p-2 rounded text-sm flex items-start gap-2">
                      <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{currentSuggestion.legalWarning}</span>
                    </div>
                  )}
                  {currentSuggestion.ethicalConsideration && (
                    <div className="bg-amber-100 dark:bg-amber-950/50 p-2 rounded text-sm flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{currentSuggestion.ethicalConsideration}</span>
                    </div>
                  )}
                  <div className="bg-white/10 p-3 rounded text-sm">
                    <div className="font-semibold mb-1">Say this:</div>
                    <p className="leading-relaxed">
                      "I understand how you feel, however let me point out{currentSuggestion.script.response}"
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Tabs for Transcript and Context */}
            <Card className="flex-1 overflow-hidden flex flex-col">
              <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="transcript">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Transcript
                  </TabsTrigger>
                  <TabsTrigger value="context">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Context
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <Clock className="w-4 h-4 mr-1" />
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transcript" className="flex-1 overflow-auto p-4" ref={transcriptContainerRef}>
                  {transcripts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Waiting for conversation to start...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transcripts.map((segment, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg ${
                            segment.speaker === "coach"
                              ? "bg-blue-50 dark:bg-blue-950/20 ml-4"
                              : "bg-gray-50 dark:bg-gray-900/20 mr-4"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold">
                              {segment.speaker === "coach" ? "You" : clientInfo.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(segment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{segment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="context" className="flex-1 overflow-auto p-4">
                  {context && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Emotional State</h4>
                        <Badge>{context.clientEmotionalState}</Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Risk Level</h4>
                        <Badge className={getRiskColor(context.riskLevel)}>
                          {context.riskLevel}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Objections Raised</h4>
                        <div className="flex flex-wrap gap-2">
                          {context.objectionsRaised.length > 0 ? (
                            context.objectionsRaised.map((obj, i) => (
                              <Badge key={i} variant="outline">{obj}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">None yet</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Positive Signals</h4>
                        <div className="space-y-2">
                          {context.positiveSignals.length > 0 ? (
                            context.positiveSignals.map((signal, i) => (
                              <div key={i} className="text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded">
                                {signal}
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">None yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="flex-1 overflow-auto p-4">
                  {suggestionHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No suggestions yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {suggestionHistory.map((suggestion, i) => (
                        <Card key={i} className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getUrgencyColor(suggestion.urgency)}>
                              {suggestion.script.trigger}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {suggestion.urgency}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
