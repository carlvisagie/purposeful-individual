/**
 * Admin AI Responses
 * Monitor all AI coaching responses
 */

import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { trpc } from "../../lib/trpc";
import { 
  MessageSquare, 
  Clock, 
  User,
  ThumbsUp,
  ThumbsDown,
  Eye
} from "lucide-react";

export default function AdminAIResponses() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = trpc.admin.getAIResponses.useQuery({
    page,
    pageSize: 50,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading AI responses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI Responses</h1>
        <p className="text-muted-foreground">Monitor and analyze AI coaching responses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">Total Responses</span>
          </div>
          <p className="text-3xl font-bold">{data?.responses?.length || 0}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <ThumbsUp className="w-5 h-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Positive Feedback</span>
          </div>
          <p className="text-3xl font-bold">0</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <ThumbsDown className="w-5 h-5 text-red-500" />
            <span className="text-sm text-muted-foreground">Negative Feedback</span>
          </div>
          <p className="text-3xl font-bold">0</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Avg Response Time</span>
          </div>
          <p className="text-3xl font-bold">2.3s</p>
        </Card>
      </div>

      {/* Responses List */}
      <Card>
        <div className="divide-y">
          {data?.responses?.map((response: any) => {
            const conversationData = response.conversation_data || [];
            const lastMessage = conversationData[conversationData.length - 1];

            return (
              <div key={response.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium font-mono text-sm">
                        {response.session_token.slice(0, 12)}...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(response.last_active_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                      {response.message_count || 0} messages
                    </span>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {lastMessage && (
                  <div className="space-y-2">
                    {lastMessage.role === 'user' && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium mb-1">User:</p>
                        <p className="text-sm">{lastMessage.content}</p>
                      </div>
                    )}
                    {conversationData.filter((m: any) => m.role === 'assistant').slice(-1).map((msg: any, i: number) => (
                      <div key={i} className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-600 font-medium mb-1">AI Coach:</p>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Engagement:</span>
                    <span className="text-xs font-medium">{response.engagement_score || 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Value Delivered:</span>
                    <span className="text-xs font-medium">{response.value_delivered || 0}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {data?.responses?.length || 0} responses
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(data?.responses?.length || 0) < 50}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
