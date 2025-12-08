/**
 * Admin Crisis Alerts
 * Real-time crisis detection and monitoring
 */

import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { 
  AlertTriangle, 
  Clock, 
  User, 
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";

// Mock data - will be replaced with real TRPC query
const mockAlerts = [
  {
    id: "1",
    sessionId: "abc123",
    userId: null,
    timestamp: new Date().toISOString(),
    alertType: "suicide",
    riskScore: 95,
    status: "new",
    keywords: ["end it all", "no point living"],
    context: "I just can't take it anymore. There's no point in living...",
    assignedTo: null,
  },
  {
    id: "2",
    sessionId: "def456",
    userId: null,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    alertType: "self-harm",
    riskScore: 75,
    status: "reviewing",
    keywords: ["hurt myself", "cutting"],
    context: "I've been hurting myself again. The cutting helps...",
    assignedTo: "Admin",
  },
];

export default function AdminCrisisAlerts() {
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "reviewing" | "resolved">("all");
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const filteredAlerts = mockAlerts.filter(
    alert => statusFilter === "all" || alert.status === statusFilter
  );

  const getAlertTypeBadge = (type: string) => {
    const colors = {
      suicide: "bg-red-100 text-red-700",
      "self-harm": "bg-orange-100 text-orange-700",
      abuse: "bg-purple-100 text-purple-700",
      violence: "bg-yellow-100 text-yellow-700",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[type as keyof typeof colors]}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  const getRiskBadge = (score: number) => {
    if (score >= 75) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">CRITICAL</span>;
    } else if (score >= 50) {
      return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">HIGH</span>;
    } else if (score >= 25) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">MEDIUM</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-700",
      reviewing: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status as keyof typeof colors]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-red-600">Crisis Alerts</h1>
          <p className="text-muted-foreground">Real-time crisis detection and intervention</p>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
          <span className="text-2xl font-bold">{filteredAlerts.length}</span>
          <span className="text-muted-foreground">Active Alerts</span>
        </div>
      </div>

      {/* Emergency Resources Card */}
      <Card className="p-6 bg-red-50 border-red-200">
        <h2 className="text-lg font-semibold text-red-900 mb-3">Emergency Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-red-900">National Suicide Prevention Lifeline</p>
            <p className="text-red-700">988 (24/7)</p>
          </div>
          <div>
            <p className="font-medium text-red-900">Crisis Text Line</p>
            <p className="text-red-700">Text HOME to 741741</p>
          </div>
          <div>
            <p className="font-medium text-red-900">Emergency Services</p>
            <p className="text-red-700">911</p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Status:</span>
          <div className="flex gap-2">
            {(["all", "new", "reviewing", "resolved"] as const).map((status) => (
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

      {/* Alerts Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Context</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getAlertTypeBadge(alert.alertType)}
                  </td>
                  <td className="px-6 py-4">
                    {getRiskBadge(alert.riskScore)}
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-sm truncate">{alert.context}</p>
                    <div className="flex gap-1 mt-1">
                      {alert.keywords.map((keyword, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(alert.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {alert.status !== "resolved" && (
                        <>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Crisis Alert Detail</h2>
              <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Alert Type</p>
                  {getAlertTypeBadge(selectedAlert.alertType)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  {getRiskBadge(selectedAlert.riskScore)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedAlert.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Context</p>
                <Card className="p-4 bg-gray-50">
                  <p className="text-sm">{selectedAlert.context}</p>
                </Card>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Detected Keywords</p>
                <div className="flex gap-2">
                  {selectedAlert.keywords.map((keyword: string, i: number) => (
                    <span key={i} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Assign to Coach</Button>
                <Button variant="outline" className="flex-1">Mark as Resolved</Button>
                <Button variant="destructive" className="flex-1">Escalate to Emergency</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
