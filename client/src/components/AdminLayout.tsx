/**
 * Admin Layout
 * Sidebar navigation for admin dashboard
 */

import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  BarChart3, 
  Settings,
  Activity,
  LogOut
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/sessions", label: "Live Sessions", icon: Activity },
  { href: "/admin/ai-responses", label: "AI Responses", icon: MessageSquare },
  { href: "/admin/crisis", label: "Crisis Alerts", icon: AlertTriangle },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-purple-600">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">Purposeful Live Coaching</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start gap-3">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
