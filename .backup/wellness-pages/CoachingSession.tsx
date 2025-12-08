/**
 * Coaching Session Page
 * Displays complete client context for coaching sessions
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  AlertCircle,
  Calendar,
  Heart,
  TrendingUp,
  MessageSquare,
  Clock,
  Star,
  CheckCircle,
  AlertTriangle,
  Search,
  ArrowLeft,
} from "lucide-react";

interface ClientSearchProps {
  onSelectClient: (clientId: number) => void;
}

function ClientSearch({ onSelectClient }: ClientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  
  const { data: searchResults, isLoading: searchLoading } = trpc.clientContext.searchClients.useQuery(
    { query: searchQuery, limit: 10 },
    { enabled: searchQuery.length > 0 }
  );
  
  const { data: recentClients } = trpc.clientContext.getRecentClients.useQuery({ limit: 10 });

  const clientsToShow = searchQuery ? searchResults : recentClients;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => setLocation("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Start Coaching Session</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchLoading && (
            <p className="text-center text-gray-500">Searching...</p>
          )}

          {clientsToShow && clientsToShow.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">
                {searchQuery ? "Search Results" : "Recent Clients"}
              </h3>
              {clientsToShow.map((client: any) => (
                <Card
                  key={client.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectClient(client.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{client.name}</h4>
                      <p className="text-sm text-gray-600">{client.email}</p>
                      {client.goals && (
                        <p className="text-sm text-gray-500 mt-1">Goals: {client.goals}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{client.session_count} sessions</p>
                      {client.last_session && (
                        <p>Last: {new Date(client.last_session).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              {searchQuery ? "No clients found" : "No recent clients"}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

interface ClientContextDisplayProps {
  clientId: number;
  onBack: () => void;
}

function ClientContextDisplay({ clientId, onBack }: ClientContextDisplayProps) {
  const { data: context, isLoading, refetch } = trpc.clientContext.getClientContext.useQuery({ clientId });
  const { data: alerts } = trpc.clientContext.getActiveAlerts.useQuery({ clientId });
  const { data: personalDetails } = trpc.clientContext.getPersonalDetails.useQuery({ clientId });
  const { data: importantDates } = trpc.clientContext.getImportantDates.useQuery({ clientId });
  const { data: sessionHistory } = trpc.clientContext.getSessionHistory.useQuery({ clientId, limit: 5 });

  const [quickNote, setQuickNote] = useState("");
  const addQuickNoteMutation = trpc.clientContext.addQuickNote.useMutation();

  const handleAddQuickNote = async () => {
    if (!quickNote.trim()) return;
    
    await addQuickNoteMutation.mutateAsync({
      clientId,
      note: quickNote,
      createAlert: false,
    });
    
    setQuickNote("");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading client context...</p>
      </div>
    );
  }

  const lastSession = context?.last_session_summary;
  const daysSinceLastSession = context?.days_since_last_session || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Client
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-600">LIVE SESSION</span>
          </div>
        </div>

        {/* Critical Alerts */}
        {alerts && alerts.length > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-3">🚨 CRITICAL ALERTS</h3>
                <div className="space-y-2">
                  {alerts.map((alert: any) => (
                    <div key={alert.id} className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-red-800">{alert.title}</h4>
                      <p className="text-sm text-gray-700">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Main Context Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Last Conversation */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold">💬 LAST CONVERSATION</h3>
            </div>
            
            {lastSession ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {daysSinceLastSession === 0 ? "Today" : `${daysSinceLastSession} days ago`}
                </p>
                
                {lastSession.summary && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Summary:</p>
                    <p className="text-gray-600">{lastSession.summary}</p>
                  </div>
                )}
                
                {lastSession.key_topics && lastSession.key_topics.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Topics Discussed:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {lastSession.key_topics.map((topic: string, i: number) => (
                        <li key={i} className="text-gray-600">{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {lastSession.emotional_state && (
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="text-gray-600">
                      Emotional state: <span className="font-semibold">{lastSession.emotional_state}</span>
                    </span>
                  </div>
                )}
                
                {lastSession.action_items && lastSession.action_items.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Action Items:</p>
                    <ul className="space-y-1">
                      {lastSession.action_items.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No previous sessions recorded</p>
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold">📊 QUICK STATS</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Sessions:</span>
                <span className="font-bold text-2xl text-purple-600">{context?.total_sessions || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Session:</span>
                <span className="font-semibold">
                  {daysSinceLastSession === 0 ? "Today" : `${daysSinceLastSession} days ago`}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Engagement:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor((context?.engagement_score || 0) / 20)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Important Dates */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold">🎂 IMPORTANT DATES</h3>
            </div>
            
            {importantDates && importantDates.length > 0 ? (
              <div className="space-y-2">
                {importantDates.map((date: any) => {
                  const dateObj = new Date(date.date_value);
                  const today = new Date();
                  const daysUntil = Math.ceil((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={date.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {date.person_name ? `${date.person_name}'s ` : ""}{date.date_type}
                        </p>
                        <p className="text-sm text-gray-600">{dateObj.toLocaleDateString()}</p>
                      </div>
                      {daysUntil <= 7 && daysUntil >= 0 && (
                        <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
                          {daysUntil === 0 ? "TODAY!" : daysUntil === 1 ? "TOMORROW!" : `${daysUntil} days`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No important dates recorded</p>
            )}
          </Card>

          {/* Personal Details */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-bold">💡 PERSONAL DETAILS</h3>
            </div>
            
            {personalDetails && personalDetails.length > 0 ? (
              <div className="space-y-2">
                {personalDetails.slice(0, 5).map((detail: any) => (
                  <div key={detail.id} className="p-2 bg-gray-50 rounded">
                    <p className="text-sm font-semibold text-gray-700">{detail.detail_key}:</p>
                    <p className="text-sm text-gray-600">{detail.detail_value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No personal details recorded</p>
            )}
          </Card>
        </div>

        {/* Quick Notes */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">📝 Quick Notes</h3>
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a quick note about this session..."
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button onClick={handleAddQuickNote} disabled={!quickNote.trim()}>
              Save Note
            </Button>
          </div>
        </Card>

        {/* Session History */}
        {sessionHistory && sessionHistory.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">📜 Recent Session History</h3>
            <div className="space-y-3">
              {sessionHistory.map((session: any) => (
                <div key={session.id} className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-800">
                      {new Date(session.session_date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {session.duration_minutes} min
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{session.summary}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function CoachingSession() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  if (selectedClientId) {
    return (
      <ClientContextDisplay
        clientId={selectedClientId}
        onBack={() => setSelectedClientId(null)}
      />
    );
  }

  return <ClientSearch onSelectClient={setSelectedClientId} />;
}
