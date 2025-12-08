/**
 * AI Chat Page - Live AI Coaching
 * Connects to aiChat tRPC router for real-time AI conversations
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, Plus, MessageSquare, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AIChat() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch conversations list
  const conversationsQuery = trpc.aiChat.listConversations.useQuery(undefined, {
    enabled: !!user,
  });

  // Fetch current conversation messages
  const conversationQuery = trpc.aiChat.getConversation.useQuery(
    { conversationId: currentConversationId! },
    { enabled: !!currentConversationId }
  );

  // Create new conversation
  const createConversationMutation = trpc.aiChat.createConversation.useMutation({
    onSuccess: (data) => {
      setCurrentConversationId(data.conversationId);
      setMessages([]);
      conversationsQuery.refetch();
      toast.success("New conversation started");
    },
    onError: (error) => {
      toast.error(`Failed to create conversation: ${error.message}`);
    },
  });

  // Send message
  const sendMessageMutation = trpc.aiChat.sendMessage.useMutation({
    onSuccess: (data) => {
      // Add AI response to messages
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.aiResponse,
        },
      ]);
      conversationsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  // Load conversation messages when conversation changes
  useEffect(() => {
    if (conversationQuery.data) {
      const msgs: Message[] = conversationQuery.data.messages.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      }));
      setMessages(msgs);
    }
  }, [conversationQuery.data]);

  // Auto-create first conversation if none exist
  useEffect(() => {
    if (user && conversationsQuery.data?.conversations.length === 0 && !currentConversationId) {
      createConversationMutation.mutate({ title: "My First Coaching Session" });
    }
  }, [user, conversationsQuery.data, currentConversationId]);

  // Auto-select first conversation
  useEffect(() => {
    if (
      conversationsQuery.data?.conversations.length &&
      !currentConversationId
    ) {
      setCurrentConversationId(conversationsQuery.data.conversations[0].id);
    }
  }, [conversationsQuery.data, currentConversationId]);

  const handleSendMessage = (content: string) => {
    if (!currentConversationId) {
      toast.error("No active conversation");
      return;
    }

    // Optimistically add user message
    setMessages((prev) => [...prev, { role: "user", content }]);

    // Send to server
    sendMessageMutation.mutate({
      conversationId: currentConversationId,
      message: content,
    });
  };

  const handleNewConversation = () => {
    createConversationMutation.mutate({
      title: `Coaching Session ${(conversationsQuery.data?.conversations.length || 0) + 1}`,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access AI coaching
          </p>
          <Button onClick={() => setLocation("/login")}>Sign In</Button>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-purple-900">
              AI Life Coach
            </h1>
          </div>
          <Button
            onClick={handleNewConversation}
            disabled={createConversationMutation.isPending}
          >
            {createConversationMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            New Conversation
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Conversations List */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Your Conversations
              </h2>
              {conversationsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : conversationsQuery.data?.conversations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No conversations yet
                </p>
              ) : (
                <div className="space-y-2">
                  {conversationsQuery.data?.conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setCurrentConversationId(conv.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentConversationId === conv.id
                          ? "bg-purple-100 border-2 border-purple-600"
                          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      <div className="font-medium text-sm truncate">
                        {conv.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="col-span-12 lg:col-span-9">
            <Card className="p-6">
              {currentConversationId ? (
                <AIChatBox
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={sendMessageMutation.isPending}
                  placeholder="Type your message to your AI coach..."
                  height="calc(100vh - 250px)"
                  emptyStateMessage="👋 Welcome! I'm your Chief Life Strategist. I'll help you build discipline, clarity, and unstoppable momentum. What's on your mind?"
                  suggestedPrompts={[
                    "I'm feeling overwhelmed and don't know where to start",
                    "Help me build a morning routine that actually works",
                    "I keep procrastinating on important tasks",
                    "I want to quit my day job but I'm scared",
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-[calc(100vh-250px)]">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Select a conversation or create a new one to start
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6">
          <Card className="p-4 bg-purple-50 border-purple-200">
            <p className="text-sm text-purple-900">
              <strong>Your AI Coach operates under the PurposefulLive Master Prompt:</strong> No-decision mode, cognitive protection, truth and reality principle, transformation engine. 
              Every response follows PLAN → OUTPUT → RUN/USE → TEST/VALIDATE → NEXT structure.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
