/**
 * Admin Control Center
 * Marvel of perception and control - real-time platform monitoring
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Settings,
  Bell,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock real-time data (will be replaced with actual API calls)
const generateMockData = () => ({
  // System Health
  systemHealth: {
    status: "healthy" as const,
    uptime: "99.98%",
    responseTime: "45ms",
    errorRate: "0.02%",
    activeConnections: 1247,
    requestsPerMinute: 3421,
  },

  // Live Activity
  liveActivity: {
    activeSessions: 34,
    activeUsers: 127,
    aiResponses: 89,
    crisisAlerts: 2,
    newSignups: 8,
    conversionsToday: 5,
  },

  // Revenue Metrics
  revenue: {
    today: 1245.50,
    thisWeek: 8934.20,
    thisMonth: 34567.80,
    mrr: 45000,
    growth: "+23.5%",
  },

  // User Engagement
  engagement: {
    avgSessionDuration: "12m 34s",
    messagesPerSession: 8.4,
    moduleUsage: 67,
    returnRate: "78%",
    nps: 72,
  },

  // Crisis Monitoring
  crisis: {
    activeAlerts: 2,
    resolvedToday: 5,
    avgResponseTime: "3m 12s",
    escalations: 1,
    riskDistribution: [
      { name: "Low", value: 45, color: "#10b981" },
      { name: "Medium", value: 32, color: "#f59e0b" },
      { name: "High", value: 18, color: "#ef4444" },
      { name: "Critical", value: 5, color: "#dc2626" },
    ],
  },

  // Module Usage
  moduleUsage: [
    { name: "Autism", users: 45, sessions: 234 },
    { name: "Anxiety", users: 89, sessions: 456 },
    { name: "Sleep", users: 67, sessions: 321 },
    { name: "Nutrition", users: 54, sessions: 287 },
    { name: "Exercise", users: 43, sessions: 198 },
  ],

  // Activity Timeline (last 24 hours)
  timeline: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    sessions: Math.floor(Math.random() * 50) + 10,
    messages: Math.floor(Math.random() * 200) + 50,
    alerts: Math.floor(Math.random() * 5),
  })),

  // Recent Events
  recentEvents: [
    { id: 1, type: "crisis", severity: "high", message: "Crisis alert: Suicide keywords detected", time: "2m ago", user: "User #1247" },
    { id: 2, type: "conversion", severity: "success", message: "New Pro subscription", time: "5m ago", user: "John D." },
    { id: 3, type: "alert", severity: "warning", message: "High API response time detected", time: "8m ago", user: "System" },
    { id: 4, type: "user", severity: "info", message: "New user signup", time: "12m ago", user: "Sarah M." },
    { id: 5, type: "crisis", severity: "medium", message: "Crisis alert resolved", time: "15m ago", user: "User #1198" },
  ],
});

export default function ControlCenter() {
  const [data, setData] = useState(generateMockData());
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setData(generateMockData());
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-600 text-white";
      case "high": return "bg-red-500 text-white";
      case "warning": return "bg-yellow-500 text-white";
      case "medium": return "bg-orange-500 text-white";
      case "success": return "bg-green-500 text-white";
      case "info": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "crisis": return AlertTriangle;
      case "conversion": return DollarSign;
      case "alert": return Bell;
      case "user": return Users;
      default: return Activity;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Control Center</h1>
                <p className="text-xs text-gray-400">Real-time platform monitoring & control</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Live Indicator */}
              <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-lg border border-white/10">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-sm text-white font-medium">{isLive ? 'LIVE' : 'PAUSED'}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => setIsLive(!isLive)}
                >
                  {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>

              {/* Last Update */}
              <div className="text-xs text-gray-400">
                Updated: {lastUpdate.toLocaleTimeString()}
              </div>

              {/* Quick Actions */}
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card className="bg-black/40 backdrop-blur-md border-green-500/30 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-green-400">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-lg font-bold">Healthy</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border-blue-500/30 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-blue-400">Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.systemHealth.uptime}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-purple-400">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.systemHealth.responseTime}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border-yellow-500/30 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-yellow-400">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.systemHealth.errorRate}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border-cyan-500/30 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-cyan-400">Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.systemHealth.activeConnections.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border-pink-500/30 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-pink-400">Requests/min</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.systemHealth.requestsPerMinute.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Live Activity & Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Live Activity */}
          <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Live Activity
              </CardTitle>
              <CardDescription className="text-gray-400">Real-time platform metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <div className="text-xs text-purple-300 mb-1">Active Sessions</div>
                  <div className="text-3xl font-bold">{data.liveActivity.activeSessions}</div>
                </div>
                <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <div className="text-xs text-blue-300 mb-1">Active Users</div>
                  <div className="text-3xl font-bold">{data.liveActivity.activeUsers}</div>
                </div>
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="text-xs text-green-300 mb-1">AI Responses</div>
                  <div className="text-3xl font-bold">{data.liveActivity.aiResponses}</div>
                </div>
                <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                  <div className="text-xs text-red-300 mb-1">Crisis Alerts</div>
                  <div className="text-3xl font-bold">{data.liveActivity.crisisAlerts}</div>
                </div>
                <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <div className="text-xs text-yellow-300 mb-1">New Signups</div>
                  <div className="text-3xl font-bold">{data.liveActivity.newSignups}</div>
                </div>
                <div className="p-4 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                  <div className="text-xs text-emerald-300 mb-1">Conversions Today</div>
                  <div className="text-3xl font-bold">{data.liveActivity.conversionsToday}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Revenue Metrics
              </CardTitle>
              <CardDescription className="text-gray-400">Financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="text-xs text-green-300 mb-1">Today</div>
                  <div className="text-3xl font-bold">${data.revenue.today.toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                    <div className="text-xs text-emerald-300 mb-1">This Week</div>
                    <div className="text-2xl font-bold">${data.revenue.thisWeek.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-teal-500/20 rounded-lg border border-teal-500/30">
                    <div className="text-xs text-teal-300 mb-1">This Month</div>
                    <div className="text-2xl font-bold">${data.revenue.thisMonth.toLocaleString()}</div>
                  </div>
                </div>
                <div className="p-4 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-cyan-300 mb-1">MRR</div>
                      <div className="text-3xl font-bold">${data.revenue.mrr.toLocaleString()}</div>
                    </div>
                    <Badge className="bg-green-500 text-white text-lg px-3 py-1">
                      {data.revenue.growth}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Activity Timeline (24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.timeline}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="hour" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Area type="monotone" dataKey="sessions" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSessions)" />
                <Area type="monotone" dataKey="messages" stroke="#06b6d4" fillOpacity={1} fill="url(#colorMessages)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Crisis Monitoring & Module Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Crisis Risk Distribution */}
          <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                Crisis Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.crisis.riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.crisis.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                  <div className="text-xs text-red-300">Active Alerts</div>
                  <div className="text-2xl font-bold">{data.crisis.activeAlerts}</div>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="text-xs text-green-300">Resolved Today</div>
                  <div className="text-2xl font-bold">{data.crisis.resolvedToday}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Usage */}
          <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Top Module Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.moduleUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Bar dataKey="users" fill="#8b5cf6" />
                  <Bar dataKey="sessions" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events Feed */}
        <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Live Event Feed
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentEvents.map((event) => {
                const Icon = getEventIcon(event.type);
                return (
                  <div key={event.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div className={`w-10 h-10 rounded-lg ${getSeverityColor(event.severity)} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.message}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">{event.user}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{event.time}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
