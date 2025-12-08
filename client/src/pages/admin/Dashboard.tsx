/**
 * Admin Dashboard Overview
 * Real-time monitoring and key metrics
 */

import { Card } from "../../components/ui/card";
import { trpc } from "../../lib/trpc";
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Clock
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading } = trpc.admin.getDashboardMetrics.useQuery();
  const { data: activity } = trpc.admin.getRecentActivity.useQuery();
  const { data: sessionsChart } = trpc.admin.getSessionsOverTime.useQuery({ days: 7 });
  const { data: userGrowth } = trpc.admin.getUserGrowth.useQuery({ days: 30 });

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor platform activity and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="text-3xl font-bold">{metrics?.activeSessions || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Last 30 minutes</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{metrics?.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">All time</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Crisis Alerts</p>
              <p className="text-3xl font-bold">{metrics?.crisisAlerts || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Last 24 hours</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">AI Responses</p>
              <p className="text-3xl font-bold">{metrics?.aiResponses || 0}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Last 24 hours</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Over Time */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sessions (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sessionsChart?.data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#9333EA" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* User Growth */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">User Growth (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userGrowth?.data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
        <div className="space-y-4">
          {activity?.recentSessions?.map((session: any) => (
            <div key={session.id} className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Session {session.session_token.slice(0, 8)}...</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{session.message_count || 0} messages</p>
                  <p className="text-xs text-muted-foreground">
                    Score: {session.engagement_score || 0}
                  </p>
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
