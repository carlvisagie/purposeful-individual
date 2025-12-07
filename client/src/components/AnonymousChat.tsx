/**
 * Anonymous Chat Component
 * Enables instant AI coaching without login
 */

import { useState, useEffect, useRef } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Loader2, Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ConversionModalProps {
  onSubmit: (email: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

function ConversionModal({ onSubmit, onClose, isLoading }: ConversionModalProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      onSubmit(email);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-2 text-purple-600">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Save Your Progress</h2>
        </div>
        
        <p className="text-gray-600">
          I can see we're making real progress here! Want to save everything we've discussed 
          and unlock unlimited sessions? Just enter your email to create your free account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Save & Continue Free"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Not Now
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Free forever. No credit card required. Cancel anytime.
        </p>
      </Card>
    </div>
  );
}

export function AnonymousChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createSessionMutation = trpc.frictionless.createSession.useMutation();
  const sendMessageMutation = trpc.frictionless.sendMessage.useMutation();
  const convertToAccountMutation = trpc.frictionless.convertToAccount.useMutation();

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      // Check if we have a session token in localStorage
      const storedToken = localStorage.getItem("anonymousSessionToken");
      
      if (storedToken) {
        setSessionToken(storedToken);
        // TODO: Validate token and load conversation history
      } else {
        // Create new session
        try {
          const result = await createSessionMutation.mutateAsync({
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          });
          
          setSessionToken(result.sessionToken);
          localStorage.setItem("anonymousSessionToken", result.sessionToken);
          
          // Add initial greeting
          setMessages([
            {
              role: "assistant",
              content: "Hi! I'm your Purposeful AI Coach. I'm here to help you transform your life through evidence-based strategies.\n\nWhat brings you here today?",
              timestamp: new Date(),
            },
          ]);
        } catch (error) {
          console.error("Failed to create session:", error);
        }
      }
    };

    initSession();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !sessionToken) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      const result = await sendMessageMutation.mutateAsync({
        sessionToken,
        message: inputValue,
      });

      const aiMessage: Message = {
        role: "assistant",
        content: result.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Show conversion modal if AI suggests it
      if (result.shouldShowConversionPrompt) {
        setTimeout(() => {
          setShowConversionModal(true);
        }, 2000); // Show after 2 seconds so user can read the message
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleConvertToAccount = async (email: string) => {
    if (!sessionToken) return;

    setIsConverting(true);

    try {
      const result = await convertToAccountMutation.mutateAsync({
        sessionToken,
        email,
      });

      // Show success message
      const successMessage: Message = {
        role: "assistant",
        content: `Perfect! I've created your free account. Check your email (${email}) for a magic link to log in. All our conversation has been saved!`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, successMessage]);
      setShowConversionModal(false);

      // Clear session token (they'll use their account now)
      localStorage.removeItem("anonymousSessionToken");
    } catch (error) {
      console.error("Failed to convert to account:", error);
      alert("Sorry, something went wrong. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        
        {sendMessageMutation.isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={sendMessageMutation.isLoading || !sessionToken}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || sendMessageMutation.isLoading || !sessionToken}
          >
            {sendMessageMutation.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>

      {/* Conversion Modal */}
      {showConversionModal && (
        <ConversionModal
          onSubmit={handleConvertToAccount}
          onClose={() => setShowConversionModal(false)}
          isLoading={isConverting}
        />
      )}
    </div>
  );
}
