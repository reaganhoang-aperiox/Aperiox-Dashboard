import {
  ChevronLeft,
  Gauge,
  LineChart,
  LogOut,
  NotebookText,
  User,
  Settings,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type View = "Control Center" | "Live Positions" | "Trading Log" | "Admin Panel";

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  userAccountId?: string;
  onLogout?: () => void;
  currentView?: View;
  onViewChange?: (view: View) => void;
  isAdmin?: boolean;
}

export const Sidebar = ({
  userName = "@tommy",
  userEmail = "tommy@gmail.com",
  userAccountId,
  onLogout,
  currentView = "Control Center",
  onViewChange,
  isAdmin = false,
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const navigationItems = [
    {
      icon: Gauge,
      label: "Control Center",
      badge: null,
    },
    {
      icon: LineChart,
      label: "Live Positions",
      badge: { color: "bg-brand-light", text: "" },
    },
    {
      icon: NotebookText,
      label: "Trading Log",
      badge: null,
    },
    ...(isAdmin
      ? [
          {
            icon: Settings,
            label: "Admin Panel",
            badge: null,
          },
        ]
      : []),
  ];

  return (
    <div
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 overflow-hidden",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <img src="/images/logo.svg" alt="Logo" className="h-8 w-auto" />
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 bg-brand-light/20 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-brand-light rounded-sm" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onViewChange?.(item.label as View)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              currentView === item.label
                ? "bg-brand-light/10 text-brand-light"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full animate-pulse",
                      item.badge.color
                    )}
                  />
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Collapse Button */}
      <div className="px-4 pt-4 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 shrink-0 transition-transform",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>

      {/* User Section */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                collapsed && "justify-center"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-brand-light/20 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-brand-light" />
              </div>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-brand-light">
                    {userName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {userEmail}
                  </div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 p-4">
            <div className="flex flex-col space-y-3">
              {/* Member/Admin Badge */}
              <div className="inline-flex">
                <span className="px-2 py-0.5 text-xs font-semibold rounded border border-brand-light text-brand-light">
                  {isAdmin ? "ADMIN" : "MEMBER"}
                </span>
              </div>

              {/* User Info */}
              <div className="space-y-1">
                <div className="text-base font-bold">{userName}</div>
                <div className="text-sm text-muted-foreground">{userEmail}</div>
                {userAccountId && (
                  <div className="text-xs text-brand-gray font-mono mt-1">
                    Account: {userAccountId}
                  </div>
                )}
              </div>

              {/* Separator */}
              <DropdownMenuSeparator />

              {/* Logout */}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 p-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
