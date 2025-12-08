/**
 * Admin Analytics
 * Comprehensive platform analytics and insights
 */

import { Card } from "../../components/ui/card";
import { trpc } from "../../lib/trpc";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  DollarSign,
  Clock,
  Target
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ['#9333EA', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminAnalytics() {
  const { data: sessionsChart } = trpc.admin.getSessionsOverTime.useQuery({ days: 30 });
  const { data: userGrowth } = trpc.admin.getUserGrowth.useQuery({ days: 30 });

  // Mock data for additional charts
  const conversionData = [
    { name: 'Visitors', value: 1000 },
    { name: 'Sessions Started', value: 450 },
    { name: 'Engaged Users', value: 180 },
    { name: 'Converted', value: 45 },
  ];

  const moduleUsageData = [
    { name: 'Autism', sessions: 120 },
    { name: 'Anxiety', sessions: 95 },
    { name: 'Depression', sessions: 87 },
    { name: 'Sleep', sessions: 76 },
    { name: 'Nutrition', sessions: 54 },
  ];

  const timeOfDayData = [
    { hour: '00:00', sessions: 12 },
    { hour: '04:00', sessions: 8 },
    { hour: '08:00', sessions: 45 },
    { hour: '12:00', sessions: 78 },
    { hour: '16:00', sessions: 92 },
    { hour: '20:00', sessions: 65 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold">$12,450</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">+23.5%</span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-3xl font-bold">4.5%</p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">+1.2%</span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Avg Session Duration</p>
              <p className="text-3xl font-bold">8.5m</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Messages/Session</p>
              <p className="text-3xl font-bold">12.3</p>
            </div>
            <MessageSquare className="w-8 h-8 text-orange-500" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">+8%</span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Over Time */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sessions (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
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
          <ResponsiveContainer width="100%" height={300}>
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill="#9333EA" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Module Usage */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Modules</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moduleUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time of Day */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sessions by Time of Day</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeOfDayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sessions" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Engagement Metrics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Engagement Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">High Engagement (8+ messages)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '65%' }} />
                </div>
                <span className="text-sm font-medium">65%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Medium Engagement (4-7 messages)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '25%' }} />
                </div>
                <span className="text-sm font-medium">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Low Engagement (1-3 messages)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: '10%' }} />
                </div>
                <span className="text-sm font-medium">10%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Insights */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900 mb-1">Peak Hours</p>
            <p className="text-xs text-green-700">Most activity between 4-8 PM. Consider scheduling promotions during these hours.</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Conversion Opportunity</p>
            <p className="text-xs text-blue-700">45% of engaged users don't convert. Add more conversion prompts after 5+ messages.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-900 mb-1">Module Demand</p>
            <p className="text-xs text-purple-700">Autism and anxiety modules most popular. Consider expanding these areas.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
