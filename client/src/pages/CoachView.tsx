/**
 * Coach View - Direct Access Coaching Dashboard
 * No authentication required - for coach/owner use
 */

import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Search,
  Phone,
  MessageSquare,
  Calendar,
  AlertCircle,
  TrendingUp,
  Heart,
  Clock,
} from "lucide-react";

export default function CoachView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [quickNote, setQuickNote] = useState("");

  // Mock client data for demonstration
  const mockClients = [
    {
      id: 1,
      name: "Your Son",
      email: "family@example.com",
      phone: "+1 (564) 529-6454",
      lastSession: "2025-12-06",
      sessionCount: 0,
      goals: "Autism intervention, sleep optimization, family wellness",
      status: "New Client",
    },
  ];

  const filteredClients = mockClients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
  };

  const handleAddNote = () => {
    if (!quickNote.trim()) return;
    alert(`Note saved: ${quickNote}`);
    setQuickNote("");
  };

  if (selectedClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedClient(null)}>
              ← Back to Client List
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-600">
                COACHING SESSION READY
              </span>
            </div>
          </div>

          {/* Client Header */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedClient.name}
                </h1>
                <p className="text-gray-600">{selectedClient.email}</p>
                <p className="text-gray-600">{selectedClient.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Sessions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {selectedClient.sessionCount}
                </p>
              </div>
            </div>
          </Card>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Goals & Status */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold">🎯 GOALS & FOCUS</h3>
              </div>
              <p className="text-gray-700">{selectedClient.goals}</p>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-semibold text-green-800">
                  Status: {selectedClient.status}
                </p>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold">📊 QUICK STATS</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Session:</span>
                  <span className="font-semibold">
                    {selectedClient.lastSession}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions:</span>
                  <span className="font-semibold">
                    {selectedClient.sessionCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Engagement:</span>
                  <span className="font-semibold text-green-600">Active</span>
                </div>
              </div>
            </Card>

            {/* Last Conversation */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold">💬 LAST CONVERSATION</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {selectedClient.sessionCount === 0
                    ? "No previous sessions"
                    : "Last session details will appear here"}
                </p>
                {selectedClient.sessionCount === 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 This is a new client. Start by discussing their goals
                      and current challenges.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Important Dates */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-pink-600" />
                <h3 className="text-lg font-bold">📅 IMPORTANT DATES</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Important dates will be tracked here:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Family birthdays</li>
                  <li>Therapy start dates</li>
                  <li>School events</li>
                  <li>Anniversaries</li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Quick Notes */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold">📝 QUICK NOTES</h3>
            </div>
            <div className="space-y-3">
              <Textarea
                placeholder="Type notes during your session... (e.g., 'Sleep improved to 6hrs. Started magnesium. Feeling optimistic.')"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                rows={4}
                className="w-full"
              />
              <Button onClick={handleAddNote} className="w-full">
                💾 Save Note
              </Button>
            </div>
          </Card>

          {/* Action Items */}
          <Card className="p-6 bg-purple-50 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold">✅ SESSION CHECKLIST</h3>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">Review last session notes</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">Check important dates</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">Review current goals</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">Take session notes</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">Set follow-up actions</span>
              </label>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            🎯 Coaching Dashboard
          </h1>
          <p className="text-gray-600">
            Search for a client to view their complete context
          </p>
        </div>

        {/* Search Box */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search clients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>

            {/* Client List */}
            {filteredClients.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">
                  {searchQuery ? "Search Results" : "Your Clients"}
                </h3>
                {filteredClients.map((client) => (
                  <Card
                    key={client.id}
                    className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300"
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{client.name}</h4>
                        <p className="text-sm text-gray-600">{client.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {client.goals}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {client.sessionCount} sessions
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Last: {client.lastSession}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchQuery
                    ? "No clients found"
                    : "Your clients will appear here"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Clients are added automatically when they chat with your AI or
                  call your hotline
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Phone className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">24/7 Hotline</h3>
            <p className="text-sm text-gray-600 mb-3">
              +1 (564) 529-6454
            </p>
            <p className="text-xs text-gray-500">
              Clients can call anytime
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">AI Chat</h3>
            <p className="text-sm text-gray-600 mb-3">
              24/7 text support
            </p>
            <p className="text-xs text-gray-500">
              Instant engagement
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Heart className="w-8 h-8 text-pink-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Your Sessions</h3>
            <p className="text-sm text-gray-600 mb-3">
              Video coaching
            </p>
            <p className="text-xs text-gray-500">
              Scheduled via Zoom
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
