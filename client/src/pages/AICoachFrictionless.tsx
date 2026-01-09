import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Loader2, Bot, User } from "lucide-react";
import { Streamdown } from "streamdown";
import { v4 as uuidv4 } from "uuid";

/**
 * Frictionless AI Coach - No signup required
 * Anonymous sessions stored in localStorage
 */
export default function AICoachFrictionless() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or retrieve sessionId from localStorage
  useEffect(() => {
    let storedSessionId = localStorage.getItem("anonymousSessionId");
    
    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem("anonymousSessionId", storedSessionId);
    }
    
    setSessionId(storedSessionId);
  }, []);

  // Get or create conversation when sessionId is available
  const createConversationMutation = trpc.frictionlessChat.getOrCreateConversation.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId);
    },
    onError: (error) => {
      console.error("Failed to create conversation:", error);
      toast.error("Failed to start conversation");
    },
  });

  // Create conversation when sessionId is ready
  useEffect(() => {
    if (sessionId && !conversationId && !createConversationMutation.isPending) {
      createConversationMutation.mutate({ sessionId });
    }
  }, [sessionId, conversationId]);

  // Fetch messages
  const { data: messagesData, refetch: refetchMessages } =
    trpc.frictionlessChat.getMessages.useQuery(
      { conversationId: conversationId!, sessionId: sessionId! },
      { enabled: !!conversationId && !!sessionId }
    );

  // Send message mutation
  const sendMessageMutation = trpc.frictionlessChat.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessage("");
      refetchMessages();
      
      // Show crisis alert if detected
      if (data.crisisFlag === "critical" || data.crisisFlag === "high") {
        toast.error("Crisis detected - Help is available at 988", {
          duration: 10000,
        });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
    onSettled: () => {
      setIsSending(false);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId || !sessionId || isSending) return;

    setIsSending(true);
    sendMessageMutation.mutate({
      conversationId,
      sessionId,
      message: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state
  if (!sessionId || !conversationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Starting your coaching session...</p>
        </div>
      </div>
    );
  }

  const messages = messagesData?.messages || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your AI Coach
          </h1>
          <p className="text-gray-600">
            24/7 support • No signup required • Completely private
          </p>
        </div>

        {/* Chat Container */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-[600px] overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="h-16 w-16 text-purple-600 mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Welcome to Your AI Coach
                  </h2>
                  <p className="text-gray-600 max-w-md">
                    I'm here to help you with stress, anxiety, life challenges, and personal growth.
                    Just start talking - no signup required.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                          <Bot className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isSending && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="resize-none min-h-[60px]"
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Crisis Resources */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            In crisis? Call <strong>988</strong> (Suicide & Crisis Lifeline) or <strong>911</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
