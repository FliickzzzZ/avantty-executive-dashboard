import { useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";
import { MeetingsView } from "@/components/meetings-view";
import { SearchCandidatesView } from "@/components/search-candidates-view";
import { FollowUpsView } from "@/components/follow-ups-view";
import { LogsView } from "@/components/logs-view";
import { AuthFlow } from "@/components/auth-flow";
import { AIAssistantChatbot } from "@/components/ai-assistant-chatbot";
import { ClientPitchDemoModal } from "@/components/client-pitch-demo-modal";
import { UserRole, ROLE_CONFIGS } from "@/src/types";
import { LogsProvider, useLogs } from "@/src/logs-context";
import { AppDataProvider, useAppData } from "@/src/app-data-context";

import { ShieldAlert, Lock, KeyRound } from "lucide-react";

function AppContent() {
  useEffect(() => {
    const saved = localStorage.getItem("avantty_theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("company") || params.get("client") === "true") {
        return true;
      }
    }
    return false;
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("avantty_remembered_role");
    if (saved && (saved === "CEO" || saved === "Recruiter" || saved === "Sourcer")) {
      return saved as UserRole;
    }
    return "CEO";
  });
  const [activePage, setActivePage] = useState<string>("dashboard");

  const { addLog } = useLogs();
  const { isSystemCritical, unlockSystemCritical, rolePermissions } = useAppData();

  const safeRole: UserRole = (userRole === "CEO" || userRole === "Recruiter" || userRole === "Sourcer") ? userRole : "CEO";
  const allowedPages = (rolePermissions && Array.isArray(rolePermissions[safeRole]))
    ? rolePermissions[safeRole]
    : (ROLE_CONFIGS[safeRole]?.allowedPages || ["dashboard", "meetings", "search-candidates", "follow-ups", "logs"]);

  useEffect(() => {
    if (Array.isArray(allowedPages) && allowedPages.length > 0 && !allowedPages.includes(activePage)) {
      setActivePage(allowedPages[0] || "meetings");
    }
  }, [allowedPages, activePage]);

  const handleRoleChange = (newRole: UserRole) => {
    const validRole: UserRole = (newRole === "CEO" || newRole === "Recruiter" || newRole === "Sourcer") ? newRole : "CEO";
    localStorage.setItem("avantty_remembered_role", validRole);
    addLog({
      category: "Role & Auth",
      action: `Role Switched to ${validRole}`,
      details: `Permissions updated to ${ROLE_CONFIGS[validRole]?.badgeText || validRole}`,
      level: "action",
      userRole: validRole
    });

    setUserRole(validRole);
    const allowed = (rolePermissions && Array.isArray(rolePermissions[validRole]))
      ? rolePermissions[validRole]
      : (ROLE_CONFIGS[validRole]?.allowedPages || ["meetings", "search-candidates", "follow-ups"]);
    if (Array.isArray(allowed) && allowed.length > 0 && !allowed.includes(activePage)) {
      setActivePage(allowed[0] || "meetings");
    }
  };

  const handleSelectPage = (page: string) => {
    if (page !== activePage) {
      addLog({
        category: "Navigation",
        action: `Navigated to ${page.replace("-", " ").toUpperCase()}`,
        details: `User viewed ${page} section`,
        level: "info",
        userRole: userRole
      });
      setActivePage(page);
    }
  };

  const handleLogin = (role: UserRole) => {
    const validRole: UserRole = (role === "CEO" || role === "Recruiter" || role === "Sourcer") ? role : "CEO";
    localStorage.setItem("avantty_remembered_role", validRole);
    setUserRole(validRole);
    setIsAuthenticated(true);

    addLog({
      category: "Role & Auth",
      action: `User Authenticated`,
      details: `Logged into session as ${validRole}`,
      level: "success",
      userRole: validRole
    });

    const allowed = (rolePermissions && Array.isArray(rolePermissions[validRole]))
      ? rolePermissions[validRole]
      : (ROLE_CONFIGS[validRole]?.allowedPages || ["dashboard", "meetings", "search-candidates", "follow-ups", "logs"]);
    setActivePage(allowed.includes("dashboard") ? "dashboard" : (allowed[0] || "meetings"));
  };

  const handleLogout = () => {
    addLog({
      category: "Role & Auth",
      action: `User Logged Out`,
      details: `Session ended for ${userRole}`,
      level: "info",
      userRole: userRole
    });

    setIsAuthenticated(false);
    setActivePage("dashboard");
  };

  return (
    <TooltipProvider>
      {/* Global Critical Lockout Screen */}
      {isSystemCritical && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl p-6 text-center text-slate-100 space-y-6 overscroll-contain">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-950 text-rose-400 border border-rose-800/80 shadow-2xl animate-pulse">
            <ShieldAlert className="h-10 w-10" />
          </div>

          <div className="max-w-lg space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Access Temporarily Suspended - Awaiting CEO Authorization
            </h1>
            <p className="text-sm text-slate-300 font-mono leading-relaxed bg-slate-900/90 p-4 rounded-2xl border border-rose-900/60">
              Security Threshold Exceeded: Non-CEO role ({userRole}) attempted more than 3 data deletions in under 10 seconds. All mutation rights have been frozen.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => {
                handleRoleChange("CEO");
                unlockSystemCritical("CEO");
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 px-6 py-3 text-xs font-bold text-white transition-all shadow-xl active:scale-95"
            >
              <KeyRound className="h-4 w-4 text-white" />
              <span>Authorize & Unlock System (Switch to CEO Role)</span>
            </button>
          </div>
        </div>
      )}

      {isAuthenticated ? (
        <>
          <AppShell
            activePage={activePage}
            currentRole={userRole}
            onSelectPage={handleSelectPage}
            onRoleChange={handleRoleChange}
            onLogout={handleLogout}
          >
            {activePage === "meetings" && allowedPages.includes("meetings") ? (
              <MeetingsView currentRole={userRole} />
            ) : activePage === "search-candidates" && allowedPages.includes("search-candidates") ? (
              <SearchCandidatesView currentRole={userRole} />
            ) : activePage === "follow-ups" && allowedPages.includes("follow-ups") ? (
              <FollowUpsView currentRole={userRole} />
            ) : activePage === "logs" && allowedPages.includes("logs") ? (
              <LogsView />
            ) : activePage === "dashboard" && allowedPages.includes("dashboard") ? (
              <Dashboard onNavigate={handleSelectPage} />
            ) : (
              /* Restricted Page Fallback if accessed unexpectedly */
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-100 font-bold">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="max-w-md space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Access Restricted for {userRole} Role
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    The Executive Dashboard and System Activity Logs are reserved exclusively for the CEO role. As a {userRole}, you have access to Meetings, Search Candidates, and Follow Ups.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleSelectPage("meetings")}
                    className="rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 text-xs font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                  >
                    Go to Meetings
                  </button>
                  <button
                    onClick={() => handleRoleChange("CEO")}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Switch to CEO Role
                  </button>
                </div>
              </div>
            )}
          </AppShell>

          {/* Centralized AI Operations Assistant Floating Chatbot */}
          <AIAssistantChatbot
            currentRole={userRole}
            onRoleChange={handleRoleChange}
            onSelectPage={handleSelectPage}
          />

          {/* Instant 10-Second White-Label Client Pitch & Shareable Link Modal */}
          <ClientPitchDemoModal />
        </>
      ) : (
        <AuthFlow onAuthenticated={handleLogin} />
      )}
    </TooltipProvider>
  );
}

export default function App() {
  const [role] = useState<UserRole>("CEO");
  return (
    <LogsProvider currentRole={role}>
      <AppDataProvider>
        <AppContent />
      </AppDataProvider>
    </LogsProvider>
  );
}
