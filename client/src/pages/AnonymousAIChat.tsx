/**
 * Anonymous AI Chat - No Signup Required
 * Free first 10 messages, then upsell to paid tiers
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { useLocation } from "wouter";
import { ArrowLeft, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";

const FREE_MESSAGE_LIMIT = 10;

export default function AnonymousAIChat() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load message count from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("anonymousChatCount");
    if (saved) {
      setMessageCount(parseInt(saved, 10));
    }
  }, []);

  const handleSendMessage = async (content: string) => {
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
    setIsLoading(true);

    try {
      // Call the anonymous chat API
      const response = await fetch("/api/trpc/aiChat.anonymousChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const aiResponse: Message = {
        role: "assistant",
        content: data.result.data.response,
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
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get AI response. Please try again.");
      // Remove optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const messagesRemaining = FREE_MESSAGE_LIMIT - messageCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-purple-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              Free AI Life Coach
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {messageCount < FREE_MESSAGE_LIMIT && (
              <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full border-2 border-purple-200">
                {messagesRemaining} free messages remaining
              </div>
            )}
            <Button
              onClick={() => setLocation("/pricing")}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <Lock className="w-4 h-4 mr-2" />
              Upgrade for Unlimited
            </Button>
          </div>
        </div>

        {/* Main Chat Area */}
        <Card className="p-6">
          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder={
              messageCount >= FREE_MESSAGE_LIMIT
                ? "Free limit reached. Upgrade to continue..."
                : "Type your message to your AI coach..."
            }
            height="calc(100vh - 250px)"
            emptyStateMessage="👋 Welcome! I'm your Chief Life Strategist. I'll help you build discipline, clarity, and unstoppable momentum. What's on your mind?"
            suggestedPrompts={[
              "I'm feeling overwhelmed and don't know where to start",
              "Help me build a morning routine that actually works",
              "I keep procrastinating on important tasks",
              "I want to quit my day job but I'm scared",
            ]}
          />
        </Card>

        {/* Info Banner */}
        <div className="mt-6 space-y-4">
          <Card className="p-4 bg-purple-50 border-purple-200">
            <p className="text-sm text-purple-900">
              <strong>Your AI Coach operates under the PurposefulLive Master Prompt:</strong> No-decision mode, cognitive protection, truth and reality principle. 
              Every response follows PLAN → OUTPUT → RUN/USE → TEST/VALIDATE → NEXT structure.
            </p>
          </Card>

          {messageCount >= FREE_MESSAGE_LIMIT && (
            <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">
                Ready to Continue Your Transformation?
              </h3>
              <p className="mb-4">
                Upgrade to get unlimited AI coaching + 31 wellness modules + live sessions
              </p>
              <Button
                size="lg"
                onClick={() => setLocation("/pricing")}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                View Pricing Plans
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
