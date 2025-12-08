/**
 * FeedbackWidget Component
 * Collects user feedback on interventions and recommendations
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Meh, Star, X } from "lucide-react";

interface FeedbackWidgetProps {
  interventionName: string;
  onSubmit: (feedback: {
    wasHelpful: "yes" | "no" | "somewhat";
    rating?: number;
    notes?: string;
  }) => void;
  onClose: () => void;
}

export function FeedbackWidget({ interventionName, onSubmit, onClose }: FeedbackWidgetProps) {
  const [wasHelpful, setWasHelpful] = useState<"yes" | "no" | "somewhat" | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!wasHelpful) return;

    onSubmit({
      wasHelpful,
      rating: rating > 0 ? rating : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Card className="border-2 border-purple-300 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">How did this help?</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Your feedback helps the platform learn and improve
        </CardDescription>
        <Badge variant="secondary" className="w-fit mt-2">{interventionName}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Helpful Rating */}
        <div>
          <Label className="mb-3 block">Was this helpful?</Label>
          <div className="flex gap-3">
            <Button
              variant={wasHelpful === "yes" ? "default" : "outline"}
              className={wasHelpful === "yes" ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => setWasHelpful("yes")}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Yes
            </Button>
            <Button
              variant={wasHelpful === "somewhat" ? "default" : "outline"}
              className={wasHelpful === "somewhat" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
              onClick={() => setWasHelpful("somewhat")}
            >
              <Meh className="w-4 h-4 mr-2" />
              Somewhat
            </Button>
            <Button
              variant={wasHelpful === "no" ? "default" : "outline"}
              className={wasHelpful === "no" ? "bg-red-600 hover:bg-red-700" : ""}
              onClick={() => setWasHelpful("no")}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              No
            </Button>
          </div>
        </div>

        {/* Star Rating */}
        {wasHelpful && (
          <div>
            <Label className="mb-3 block">Rate your experience (optional)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {wasHelpful && (
          <div>
            <Label className="mb-2 block">Additional feedback (optional)</Label>
            <Textarea
              placeholder="What worked well? What could be improved?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!wasHelpful}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Submit Feedback
          </Button>
          <Button variant="outline" onClick={onClose}>
            Skip
          </Button>
        </div>

        {/* Learning Message */}
        <p className="text-xs text-gray-500 text-center">
          🧠 This feedback helps the platform learn what works best for you and others
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * CrossModuleInsight Component
 * Shows insights from other modules
 */
interface CrossModuleInsightProps {
  insights: Array<{
    module: string;
    technique: string;
    effectiveness: number;
    relevance: string;
  }>;
}

export function CrossModuleInsights({ insights }: CrossModuleInsightProps) {
  if (insights.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-lg">🔗 Insights from Other Modules</CardTitle>
        <CardDescription>
          The platform learned these connections from other users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-purple-600 capitalize">{insight.module}</Badge>
                <Badge variant="secondary">{Math.round(insight.effectiveness)}% effective</Badge>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{insight.technique}</h4>
              <p className="text-sm text-gray-600">{insight.relevance}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
