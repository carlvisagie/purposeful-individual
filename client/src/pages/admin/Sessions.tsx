/**
 * Admin Live Sessions
 * Real-time session monitoring
 */

import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { trpc } from "../../lib/trpc";
import { 
  Clock, 
  User, 
  MessageSquare, 
  AlertCircle,
  Eye,
  XCircle
} from "lucide-react";
import { Link } from "wouter";

export default function AdminSessions() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "idle" | "ended">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.admin.getActiveSessions.useQuery({
    status: statusFilter,
    page,
    pageSize: 50,
  });

  const endSessionMutation = trpc.admin.endSession.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const getStatusBadge = (lastActive: string) => {
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActiveDate.getTime()) / 1000 / 60;

    if (diffMinutes < 5) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Active</span>;
    } else if (diffMinutes < 30) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">Idle</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">Ended</span>;
    }
  };

  const getRiskBadge = (score: number) => {
    if (score >= 75) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">Critical</span>;
    } else if (score >= 50) {
      return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">High</span>;
    } else if (score >= 25) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">Medium</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Low</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Sessions</h1>
          <p className="text-muted-foreground">Monitor active and recent sessions</p>
        </div>
        <Button onClick={() => refetch()}>Refresh</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Status:</span>
          <div className="flex gap-2">
            {(["all", "active", "idle", "ended"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Sessions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.sessions?.map((session: any) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-sm">{session.session_token.slice(0, 12)}...</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(session.last_active_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(session.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(session.last_active_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{session.message_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRiskBadge(session.engagement_score || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/sessions/${session.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => endSessionMutation.mutate({ sessionId: session.id })}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {data?.sessions?.length || 0} of {data?.total || 0} sessions
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
              disabled={(data?.sessions?.length || 0) < 50}
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
