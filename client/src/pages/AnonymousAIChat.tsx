/**
 * Anonymous AI Chat - No Signup Required
 * Free first 10 messages, then upsell to paid tiers
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { useLocation } from "wouter";
import { toast } from "sonner";

const FREE_MESSAGE_LIMIT = 10;

export default function AnonymousAIChat() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Welcome! I'm your Chief Life Strategist. I'll help you build discipline, clarity, and unstoppable momentum. What's on your mind?",
    },
  ]);
  const [messageCount, setMessageCount] = useState(0);

  // Load message count from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("anonymousChatCount");
    if (saved) {
      setMessageCount(parseInt(saved, 10));
    }
  }, []);

  // tRPC mutation for anonymous chat
  const anonymousChatMutation = trpc.aiChat.anonymousChat.useMutation({
    onSuccess: (data) => {
      const aiResponse: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      // Increment and save message count
      const newCount = messageCount + 1;
      setMessageCount(newCount);
      localStorage.setItem("anonymousChatCount", newCount.toString());

      // Show upgrade prompt at 8 messages
      if (newCount === 8) {
        toast.info("2 free messages left! Upgrade for unlimited AI coaching.", {
          action: {
            label: "View Pricing",
            onClick: () => setLocation("/pricing"),
          },
        });
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Failed to get AI response. Please try again.");
    },
  });

  const handleSendMessage = (content: string) => {
    // Check message limit
    if (messageCount >= FREE_MESSAGE_LIMIT) {
      toast.error("Free message limit reached! Upgrade to continue.", {
        action: {
          label: "View Pricing",
          onClick: () => setLocation("/pricing"),
        },
      });
      return;
    }

    // Add user message optimistically
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);

    // Call the anonymous chat API via tRPC mutation
    anonymousChatMutation.mutate({
      message: content,
      conversationHistory: messages,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Free AI Life Coach</h1>
            <p className="text-muted-foreground mt-1">
              {FREE_MESSAGE_LIMIT - messageCount} free messages remaining
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation("/pricing")}
            className="flex items-center gap-2"
          >
            <span className="text-lg">🔓</span>
            Upgrade for Unlimited
          </Button>
        </div>

        <AIChatBox
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={anonymousChatMutation.isPending}
          placeholder="Type your message to your AI coach..."
          height="600px"
          suggestedPrompts={[
            "I'm feeling overwhelmed and don't know where to start",
            "Help me build a morning routine that actually works",
            "I keep procrastinating on important tasks",
            "I want to quit my day job but I'm scared",
          ]}
        />

        <div className="mt-4 text-sm text-muted-foreground text-center">
          <p>
            <strong>Your AI Coach operates under the PurposefulLive Master Prompt:</strong>{" "}
            No-decision mode, cognitive protection, truth and reality principle. Every
            response follows PLAN → OUTPUT → RUN/USE → TEST/VALIDATE → NEXT structure.
          </p>
        </div>
      </Card>

      <div className="flex justify-center mt-6">
        <Button variant="ghost" onClick={() => setLocation("/")}>
          ← Back to Home
        </Button>
      </div>
    </div>
  );
}
