import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Users, BookOpen, Brain, Calendar, TrendingUp, AlertCircle, Video, DollarSign, Clock, CheckCircle2 } from "lucide-react";
// Zoom integration removed - use Calendly for session booking
import { Badge } from "@/components/ui/badge";
import AITierToggle from "@/components/AITierToggle";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: coach } = trpc.coaches.getProfile.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: allSessionsData } = trpc.scheduling.getCoachSessions.useQuery(
    { 
      coachId: 1, // Default coach ID
      startDate: new Date(2020, 0, 1), // Far past date to get all sessions
      endDate: new Date(2030, 11, 31), // Far future date
    },
    { enabled: !!coach }
  );
  const allSessions = allSessionsData?.sessions.map(s => s.session) || [];
  // Filter upcoming sessions from all sessions
  const upcomingSessions = allSessions.filter(s => 
    s.status === 'scheduled' && new Date(s.scheduledDate) > new Date()
  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalSessions: 0,
    upcomingSessions: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    completedSessions: 0,
  });

  useEffect(() => {
    if (clients) {
      setStats(prev => ({
        ...prev,
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === "active").length,
      }));
    }
  }, [clients]);

  useEffect(() => {
    if (allSessions) {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalRevenue = allSessions
        .filter(s => s.paymentStatus === 'paid')
        .reduce((sum, s) => sum + (s.price || 0), 0) / 100; // Convert cents to dollars
      
      const thisMonthRevenue = allSessions
        .filter(s => s.paymentStatus === 'paid' && new Date(s.createdAt) >= thisMonthStart)
        .reduce((sum, s) => sum + (s.price || 0), 0) / 100;
      
      const completedSessions = allSessions.filter(s => s.status === 'completed').length;
      
      setStats(prev => ({
        ...prev,
        totalSessions: allSessions.length,
        totalRevenue,
        thisMonthRevenue,
        completedSessions,
      }));
    }
  }, [allSessions]);

  useEffect(() => {
    if (upcomingSessions) {
      setStats(prev => ({
        ...prev,
        upcomingSessions: upcomingSessions.length,
      }));
    }
  }, [upcomingSessions]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = getLoginUrl()}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Purposeful Live Coaching</h1>
              <p className="text-sm text-gray-600 mt-1">Empowering emotional resilience through data-driven insights</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="default" 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/book-session'}
              >
                <Video className="h-4 w-4 mr-2" />
                Start Video Session
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                <p className="text-xs text-gray-500">Coach</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/api/oauth/logout"}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!coach ? (
          <Card className="mb-8 border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Complete Your Coach Profile
              </CardTitle>
              <CardDescription>
                Set up your coaching profile to start managing clients and tracking their emotional resilience journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/coach/setup">
                <Button>Create Coach Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Revenue & Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ${stats.thisMonthRevenue.toFixed(2)} this month
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Clients</CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalClients}</div>
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    {stats.activeClients} active
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Sessions</CardTitle>
                  <Calendar className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalSessions}</div>
                  <p className="text-xs text-purple-600 mt-1 font-medium">
                    {stats.upcomingSessions} upcoming
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.completedSessions}</div>
                  <p className="text-xs text-orange-600 mt-1 font-medium">
                    {stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}% completion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Sessions */}
            {upcomingSessions && upcomingSessions.length > 0 && (
              <Card className="mb-8 border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Upcoming Sessions
                      </CardTitle>
                      <CardDescription>Your next scheduled coaching sessions</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {upcomingSessions.length} scheduled
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.slice(0, 5).map((session) => {
                      const client = clients?.find(c => c.id === session.clientId);
                      const sessionDate = new Date(session.scheduledDate);
                      const isToday = sessionDate.toDateString() === new Date().toDateString();
                      
                      return (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
                              {client?.name.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{client?.name || "Unknown Client"}</p>
                              <p className="text-sm text-gray-500">
                                {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-xs text-gray-400">{session.duration} minutes • ${(session.price || 0) / 100}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {isToday && (
                              <Badge variant="default" className="bg-green-500">Today</Badge>
                            )}
                            <Button 
                              size="sm" 
                              onClick={() => window.location.href = '/book-session'}
                              disabled={!isToday}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join Call
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Tier Control - Admin Only */}
            {user.role === 'admin' && (
              <AITierToggle />
            )}

            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to manage your coaching practice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link to="/ai-coach">
                    <Button className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:from-rose-600 hover:to-purple-700">
                      <Brain className="mr-2 h-4 w-4" />
                      AI Coach Chat
                    </Button>
                  </Link>
                  <Link to="/emotions">
                    <Button className="w-full" variant="outline">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Track Emotions
                    </Button>
                  </Link>
                  <Link to="/insights">
                    <Button className="w-full" variant="outline">
                      <Brain className="mr-2 h-4 w-4" />
                      View Insights
                    </Button>
                  </Link>
                  <Link to="/clients">
                    <Button className="w-full" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Clients
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Clients */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Clients</CardTitle>
                    <CardDescription>Your most recently added or updated clients</CardDescription>
                  </div>
                  <Link to="/clients">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {clients && clients.length > 0 ? (
                  <div className="space-y-4">
                    {clients.slice(0, 5).map((client) => (
                      <Link key={client.id} to={`/clients/${client.id}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{client.name}</p>
                              <p className="text-sm text-gray-500">{client.email || "No email"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              client.status === "active" ? "bg-green-100 text-green-800" :
                              client.status === "inactive" ? "bg-gray-100 text-gray-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {client.status}
                            </span>
                            <TrendingUp className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No clients yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Clients will appear here after their first booking.</p>
                    <div className="mt-6">
                      <Link to="/book-session">
                        <Button>
                          <Calendar className="mr-2 h-4 w-4" />
                          View Booking Page
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
