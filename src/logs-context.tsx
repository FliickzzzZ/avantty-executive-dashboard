import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, MOCK_USERS, CriticalSecurityIncident } from "@/src/types";

export type LogCategory = "Navigation" | "Meetings" | "Search Mandates" | "Follow Ups" | "Role & Auth" | "Security & Audit" | "System";
export type LogLevel = "info" | "success" | "warning" | "action" | "critical";

export interface LogEntry {
  id: string;
  timestamp: Date;
  category: LogCategory;
  action: string;
  details?: string;
  userRole: UserRole;
  userName: string;
  level: LogLevel;
}

export function formatLogAsJSON(log: LogEntry): string {
  return JSON.stringify({
    timestamp: log.timestamp.toISOString(),
    userRole: log.userRole,
    action: log.action,
    category: log.category,
    details: log.details || "",
    userName: log.userName,
    level: log.level
  }, null, 2);
}

interface LogsContextType {
  logs: LogEntry[];
  criticalIncidents: CriticalSecurityIncident[];
  addLog: (entry: {
    category: LogCategory;
    action: string;
    details?: string;
    level?: LogLevel;
    userRole?: UserRole;
    userName?: string;
  }) => void;
  addCriticalIncident: (incident: Omit<CriticalSecurityIncident, "id" | "timestamp" | "status">) => CriticalSecurityIncident;
  resolveCriticalIncident: (incidentId: string, resolvedBy: string, status?: CriticalSecurityIncident["status"]) => void;
  clearLogs: (requestingRole?: UserRole) => boolean;
  getFormattedJSONLogs: () => string;
}

const INITIAL_LOGS: LogEntry[] = [
  {
    id: "log-init-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    category: "System",
    action: "Platform Security & Runtime Initialized",
    details: "Avantty Executive Command platform initialized with Inter typography and immutable audit ledger active.",
    userRole: "CEO",
    userName: MOCK_USERS.CEO.name,
    level: "info"
  },
  {
    id: "log-init-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 18),
    category: "Role & Auth",
    action: "Enterprise Session Authenticated",
    details: "Verified managing partner credentials. Full governance permissions granted.",
    userRole: "CEO",
    userName: MOCK_USERS.CEO.name,
    level: "success"
  },
  {
    id: "log-init-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    category: "Meetings",
    action: "Executive Interview Calendar Synchronized",
    details: "Synchronized weekly client briefing schedule across partner calendars.",
    userRole: "CEO",
    userName: MOCK_USERS.CEO.name,
    level: "info"
  },
  {
    id: "log-init-4",
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    category: "Search Mandates",
    action: "Target Mandates Loaded",
    details: "Active retained search mandates synchronized for Veloce Labs and Nexus AI Labs.",
    userRole: "CEO",
    userName: MOCK_USERS.CEO.name,
    level: "action"
  },
  {
    id: "log-init-5",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    category: "Navigation",
    action: "Viewed Executive Dashboard",
    details: "Partner reviewed real-time weighted pipeline valuation and capacity loads.",
    userRole: "CEO",
    userName: MOCK_USERS.CEO.name,
    level: "info"
  }
];

const INITIAL_CRITICAL_INCIDENTS: CriticalSecurityIncident[] = [];

const LogsContext = createContext<LogsContextType>({
  logs: [],
  criticalIncidents: [],
  addLog: () => {},
  addCriticalIncident: () => ({} as CriticalSecurityIncident),
  resolveCriticalIncident: () => {},
  clearLogs: () => false,
  getFormattedJSONLogs: () => ""
});

export const LogsProvider: React.FC<{ children: React.ReactNode; currentRole: UserRole }> = ({
  children,
  currentRole
}) => {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [criticalIncidents, setCriticalIncidents] = useState<CriticalSecurityIncident[]>(INITIAL_CRITICAL_INCIDENTS);

  const addLog = (entry: {
    category: LogCategory;
    action: string;
    details?: string;
    level?: LogLevel;
    userRole?: UserRole;
    userName?: string;
  }) => {
    const role = entry.userRole || currentRole;
    const name = entry.userName || MOCK_USERS[role]?.name || "System User";
    
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
      category: entry.category,
      action: entry.action,
      details: entry.details,
      userRole: role,
      userName: name,
      level: entry.level || "info"
    };

    setLogs((prev) => [newEntry, ...prev]);
  };

  const addCriticalIncident = (incident: Omit<CriticalSecurityIncident, "id" | "timestamp" | "status">): CriticalSecurityIncident => {
    const newIncident: CriticalSecurityIncident = {
      ...incident,
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      status: "ACTIVE_ALERT"
    };

    setCriticalIncidents((prev) => [newIncident, ...prev]);

    // Also inject into main logs with critical level
    addLog({
      category: "Security & Audit",
      action: `CRITICAL SECURITY INCIDENT: ${newIncident.eventType}`,
      details: `Initiated by ${newIncident.initiatedBy.name} (${newIncident.initiatedBy.role}). Affected: ${newIncident.affectedResources.count} items. ${newIncident.description}`,
      level: "critical",
      userRole: newIncident.initiatedBy.role,
      userName: newIncident.initiatedBy.name
    });

    return newIncident;
  };

  const resolveCriticalIncident = (incidentId: string, resolvedBy: string, status: CriticalSecurityIncident["status"] = "RESTORED") => {
    setCriticalIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? { ...inc, status, restoredAt: new Date().toISOString(), restoredBy: resolvedBy }
          : inc
      )
    );

    addLog({
      category: "Security & Audit",
      action: `Security Incident Resolved: ${status}`,
      details: `Incident ${incidentId} resolved by ${resolvedBy}. State restoration verified.`,
      level: "success",
      userRole: "CEO"
    });
  };

  const clearLogs = (requestingRole: UserRole = currentRole): boolean => {
    if (requestingRole !== "CEO") {
      addLog({
        category: "Security & Audit",
        action: "Unauthorized Log Purge Attempt Blocked",
        details: `Role ${requestingRole} attempted to delete system audit logs without authorization.`,
        level: "warning",
        userRole: requestingRole
      });
      return false;
    }
    // Only clear standard informational logs, never delete critical incidents
    setLogs((prev) => prev.filter((l) => l.level === "critical"));
    return true;
  };

  const getFormattedJSONLogs = () => {
    return JSON.stringify(
      logs.map((log) => ({
        timestamp: log.timestamp.toISOString(),
        userRole: log.userRole,
        action: log.action,
        category: log.category,
        details: log.details || "",
        userName: log.userName,
        level: log.level
      })),
      null,
      2
    );
  };

  return (
    <LogsContext.Provider
      value={{
        logs,
        criticalIncidents,
        addLog,
        addCriticalIncident,
        resolveCriticalIncident,
        clearLogs,
        getFormattedJSONLogs
      }}
    >
      {children}
    </LogsContext.Provider>
  );
};

export const useLogs = () => useContext(LogsContext);
