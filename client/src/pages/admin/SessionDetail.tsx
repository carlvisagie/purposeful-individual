/**
 * Admin Session Detail
 * View full conversation and session analytics
 */

import { useRoute } from "wouter";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { trpc } from "../../lib/trpc";
import { 
  ArrowLeft, 
  User, 
  Clock, 
  MessageSquare, 
  AlertTriangle,
  Download,
  XCircle
} from "lucide-react";
import { Link } from "wouter";

export default function AdminSessionDetail() {
  const [, params] = useRoute("/admin/sessions/:id");
  const sessionId = params?.id;

  const { data, isLoading, refetch } = trpc.admin.getSessionDetail.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );

  const endSessionMutation = trpc.admin.endSession.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading session...</div>
      </div>
    );
  }

  if (!data?.session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Session not found</div>
      </div>
    );
  }

  const session = data.session as any;
  const conversationData = session.conversation_data || [];

  const getStatusBadge = (lastActive: string) => {
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActiveDate.getTime()) / 1000 / 60;

    if (diffMinutes < 5) {
      return <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">Active</span>;
    } else if (diffMinutes < 30) {
      return <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-full">Idle</span>;
    } else {
      return <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">Ended</span>;
    }
  };

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}h ${mins}m`;
    }
  };

  const handleExport = () => {
    const transcript = conversationData
      .map((msg: any) => `[${msg.timestamp}] ${msg.role}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.session_token}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/sessions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sessions
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Session Details</h1>
            <p className="text-muted-foreground font-mono text-sm">
              {session.session_token}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="destructive"
            onClick={() => endSessionMutation.mutate({ sessionId: session.id })}
          >
            <XCircle className="w-4 h-4 mr-2" />
            End Session
          </Button>
        </div>
      </div>

      {/* Session Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status</span>
          </div>
          {getStatusBadge(session.last_active_at)}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Duration</span>
          </div>
          <p className="text-2xl font-bold">
            {formatDuration(session.created_at, session.last_active_at)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Messages</span>
          </div>
          <p className="text-2xl font-bold">{session.message_count || 0}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Risk Score</span>
          </div>
          <p className="text-2xl font-bold">{session.engagement_score || 0}</p>
        </Card>
      </div>

      {/* Session Metadata */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Session Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">IP Address</p>
            <p className="font-medium">{session.ip_address || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">User Agent</p>
            <p className="font-medium text-sm">{session.user_agent || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Referrer</p>
            <p className="font-medium">{session.referrer || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">{new Date(session.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Active</p>
            <p className="font-medium">{new Date(session.last_active_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expires At</p>
            <p className="font-medium">{new Date(session.expires_at).toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Conversation */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Conversation</h2>
        {conversationData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No messages yet</p>
        ) : (
          <div className="space-y-4">
            {conversationData.map((message: any, index: number) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-purple-100 text-purple-900'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {message.role === 'user' ? 'User' : 'AI Coach'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Extracted Data */}
      {session.extracted_data && Object.keys(session.extracted_data).length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Extracted Profile Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(session.extracted_data).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="font-medium">{String(value)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
