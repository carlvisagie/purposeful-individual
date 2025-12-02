import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Bot, Send, User, ArrowLeft, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Streamdown } from "streamdown";

/**
 * AI COACHING ASSISTANT
 * 
 * Personalized AI coach powered by LLM with full context:
 * - Health data
 * - Stress patterns
 * - Identity evolution
 * - Active milestones
 * - Life vision
 */

export default function AICoachChat() {
  const [, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: history } = trpc.aiCoach.getHistory.useQuery({ limit: 50 });
  const { data: insights } = trpc.aiCoach.getInsights.useQuery();

  const sendMutation = trpc.aiCoach.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      utils.aiCoach.getHistory.invalidate();
      utils.aiCoach.getInsights.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });

  const utils = trpc.useUtils();

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate({ message: message.trim() });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, sendMutation.data]);

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8" />
            AI Coach
          </h1>
          <p className="text-muted-foreground">
            Personalized guidance based on your data
          </p>
        </div>
        {insights && (
          <div className="text-sm text-muted-foreground">
            {insights.totalMessages} messages
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Welcome Message */}
          {(!history || history.length === 0) && !sendMutation.data && (
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 bg-primary">
                <AvatarFallback>
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm">
                    👋 Welcome! I'm your AI coach, powered by evidence-based protocols from James Clear, David Goggins, Andrew Huberman, and Peter Attia.
                  </p>
                  <p className="text-sm mt-2">
                    I have access to your health data, stress patterns, identity evolution, and goals. Ask me anything about:
                  </p>
                  <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                    <li>Building better habits</li>
                    <li>Managing stress and anxiety</li>
                    <li>Identity-based transformation</li>
                    <li>Achieving your milestones</li>
                    <li>Optimizing health and performance</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Conversation History */}
          {history && history.map((chat: any) => (
            <div key={chat.id} className="space-y-4">
              {/* User Message */}
              <div className="flex gap-4 justify-end">
                <div className="flex-1 max-w-[80%] space-y-2">
                  <div className="bg-primary text-primary-foreground rounded-lg p-4 ml-auto">
                    <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                  </div>
                </div>
                <Avatar className="h-10 w-10 bg-secondary">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* AI Response */}
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 bg-primary">
                  <AvatarFallback>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="bg-muted rounded-lg p-4">
                    <Streamdown className="text-sm prose prose-sm dark:prose-invert max-w-none">
                      {chat.response}
                    </Streamdown>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Current Response (if sending) */}
          {sendMutation.isPending && (
            <>
              {/* User's current message */}
              <div className="flex gap-4 justify-end">
                <div className="flex-1 max-w-[80%] space-y-2">
                  <div className="bg-primary text-primary-foreground rounded-lg p-4 ml-auto">
                    <p className="text-sm whitespace-pre-wrap">{sendMutation.variables?.message}</p>
                  </div>
                </div>
                <Avatar className="h-10 w-10 bg-secondary">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* AI thinking */}
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 bg-primary">
                  <AvatarFallback>
                    <Bot className="h-5 w-5 animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Thinking...
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Input */}
      <div className="flex gap-4">
        <Textarea
          placeholder="Ask your AI coach anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={2}
          disabled={sendMutation.isPending}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sendMutation.isPending}
          size="lg"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessage("How am I doing overall?")}
          disabled={sendMutation.isPending}
        >
          Overall Progress
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessage("What should I focus on next?")}
          disabled={sendMutation.isPending}
        >
          Next Steps
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessage("Help me build a better morning routine")}
          disabled={sendMutation.isPending}
        >
          Morning Routine
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessage("I'm feeling stressed. What should I do?")}
          disabled={sendMutation.isPending}
        >
          Stress Help
        </Button>
      </div>
    </div>
  );
}
