/**
 * Admin Settings
 * Platform configuration and settings
 */

import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Zap,
  Save
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Crisis Detection
    crisisDetectionEnabled: true,
    crisisEmailNotifications: true,
    crisisEmailRecipient: "admin@purposefullive.com",
    crisisSMSNotifications: false,
    crisisSMSRecipient: "",
    crisisRiskThreshold: 75,
    
    // AI Configuration
    aiModel: "gpt-4",
    aiTemperature: 0.7,
    aiMaxTokens: 500,
    aiSystemPrompt: "You are a compassionate AI life coach...",
    
    // Session Management
    sessionExpiryDays: 7,
    maxMessagesPerSession: 100,
    conversionPromptThreshold: 5,
    
    // Analytics
    analyticsEnabled: true,
    trackingEnabled: true,
    
    // Security
    requireEmailVerification: true,
    enableRateLimiting: true,
    maxRequestsPerMinute: 60,
  });

  const handleSave = () => {
    // TODO: Implement save to backend
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure platform behavior and features</p>
      </div>

      {/* Crisis Detection Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold">Crisis Detection</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="crisis-enabled">Enable Crisis Detection</Label>
              <p className="text-sm text-muted-foreground">Monitor conversations for crisis indicators</p>
            </div>
            <Switch
              id="crisis-enabled"
              checked={settings.crisisDetectionEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, crisisDetectionEnabled: checked })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crisis-threshold">Risk Score Threshold</Label>
              <Input
                id="crisis-threshold"
                type="number"
                value={settings.crisisRiskThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, crisisRiskThreshold: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Alerts triggered when risk score exceeds this value (0-100)
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Notifications</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="crisis-email">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email alerts for crisis detections</p>
                </div>
                <Switch
                  id="crisis-email"
                  checked={settings.crisisEmailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, crisisEmailNotifications: checked })
                  }
                />
              </div>

              {settings.crisisEmailNotifications && (
                <div>
                  <Label htmlFor="crisis-email-recipient">Email Recipient</Label>
                  <Input
                    id="crisis-email-recipient"
                    type="email"
                    value={settings.crisisEmailRecipient}
                    onChange={(e) =>
                      setSettings({ ...settings, crisisEmailRecipient: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="crisis-sms">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send SMS alerts for critical crises</p>
                </div>
                <Switch
                  id="crisis-sms"
                  checked={settings.crisisSMSNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, crisisSMSNotifications: checked })
                  }
                />
              </div>

              {settings.crisisSMSNotifications && (
                <div>
                  <Label htmlFor="crisis-sms-recipient">SMS Recipient</Label>
                  <Input
                    id="crisis-sms-recipient"
                    type="tel"
                    placeholder="+1234567890"
                    value={settings.crisisSMSRecipient}
                    onChange={(e) =>
                      setSettings({ ...settings, crisisSMSRecipient: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* AI Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-semibold">AI Configuration</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ai-model">Model</Label>
              <select
                id="ai-model"
                className="w-full px-3 py-2 border rounded-md"
                value={settings.aiModel}
                onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            <div>
              <Label htmlFor="ai-temperature">Temperature</Label>
              <Input
                id="ai-temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={settings.aiTemperature}
                onChange={(e) =>
                  setSettings({ ...settings, aiTemperature: parseFloat(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">0 = focused, 2 = creative</p>
            </div>

            <div>
              <Label htmlFor="ai-max-tokens">Max Tokens</Label>
              <Input
                id="ai-max-tokens"
                type="number"
                value={settings.aiMaxTokens}
                onChange={(e) =>
                  setSettings({ ...settings, aiMaxTokens: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ai-system-prompt">System Prompt</Label>
            <textarea
              id="ai-system-prompt"
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
              value={settings.aiSystemPrompt}
              onChange={(e) => setSettings({ ...settings, aiSystemPrompt: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              The system prompt defines the AI's personality and behavior
            </p>
          </div>
        </div>
      </Card>

      {/* Session Management */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Session Management</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="session-expiry">Session Expiry (days)</Label>
            <Input
              id="session-expiry"
              type="number"
              value={settings.sessionExpiryDays}
              onChange={(e) =>
                setSettings({ ...settings, sessionExpiryDays: parseInt(e.target.value) })
              }
            />
          </div>

          <div>
            <Label htmlFor="max-messages">Max Messages/Session</Label>
            <Input
              id="max-messages"
              type="number"
              value={settings.maxMessagesPerSession}
              onChange={(e) =>
                setSettings({ ...settings, maxMessagesPerSession: parseInt(e.target.value) })
              }
            />
          </div>

          <div>
            <Label htmlFor="conversion-threshold">Conversion Prompt Threshold</Label>
            <Input
              id="conversion-threshold"
              type="number"
              value={settings.conversionPromptThreshold}
              onChange={(e) =>
                setSettings({ ...settings, conversionPromptThreshold: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Messages before showing conversion prompt
            </p>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-semibold">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-verification">Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">Users must verify email before full access</p>
            </div>
            <Switch
              id="email-verification"
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, requireEmailVerification: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="rate-limiting">Enable Rate Limiting</Label>
              <p className="text-sm text-muted-foreground">Protect against abuse and spam</p>
            </div>
            <Switch
              id="rate-limiting"
              checked={settings.enableRateLimiting}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableRateLimiting: checked })
              }
            />
          </div>

          {settings.enableRateLimiting && (
            <div>
              <Label htmlFor="max-requests">Max Requests per Minute</Label>
              <Input
                id="max-requests"
                type="number"
                value={settings.maxRequestsPerMinute}
                onChange={(e) =>
                  setSettings({ ...settings, maxRequestsPerMinute: parseInt(e.target.value) })
                }
              />
            </div>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
