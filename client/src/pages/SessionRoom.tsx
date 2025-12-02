import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, ArrowLeft } from "lucide-react";

/**
 * SESSION DELIVERY ROOM
 * 
 * Placeholder for live coaching session interface
 * Use Calendly for session booking and Zoom for video calls
 */
export default function SessionRoom() {
  const [, navigate] = useLocation();
  const hash = window.location.hash;
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const searchParams = new URLSearchParams(queryString);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <CardHeader>
            <CardTitle>No Session ID</CardTitle>
            <CardDescription>Please provide a valid session ID</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            Session #{sessionId}
          </CardTitle>
          <CardDescription>
            Video calls are handled through Calendly + Zoom integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To conduct live coaching sessions:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Client books session via Calendly (configured in BookSession page)</li>
            <li>Calendly automatically creates Zoom meeting</li>
            <li>Both coach and client receive Zoom link via email</li>
            <li>Join the call at scheduled time using the Zoom link</li>
          </ol>
          <div className="flex gap-4 mt-6">
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/book-session")}>
              Book New Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
