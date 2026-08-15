import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, MOCK_USERS } from "@/src/types";

export type LogCategory = "Navigation" | "Meeting Bot" | "Candidate Spec" | "Role & Auth" | "System" | "Search";
export type LogLevel = "info" | "success" | "warning" | "action";

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
  addLog: (entry: {
    category: LogCategory;
    action: string;
    details?: string;
    level?: LogLevel;
    userRole?: UserRole;
    userName?: string;
  }) => void;
  clearLogs: () => void;
  getFormattedJSONLogs: () => string;
}

const INITIAL_LOGS: LogEntry[] = [
  {
    id: "log-init-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 18),
    category: "System",
    action: "System Initialization",
    details: "Avantty Demo platform initialized with daily auto-reset schedule active.",
    userRole: "CEO",
    userName: MOCK_USERS.CEO.name,
    level: "info"
  },
  {
    id: "log-init-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 14),
    category: "Role & Auth",
    action: "Session Authenticated",
    details: "Authenticated user as CEO role with full access permissions.",
    userRole: "CEO",
    userName: MOCK_USERS.CEO.name,
    level: "success"
  },
  {
    id: "log-init-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    category: "Meeting Bot",
    action: "Daily Schedule Auto-reset",
    details: "Cleared expired daily meeting logs and loaded schedule for Tuesday.",
    userRole: "CEO",
    userName: MOCK_USERS.CEO.name,
    level: "info"
  },
  {
    id: "log-init-4",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    category: "Candidate Spec",
    action: "Target Spec Loaded",
    details: "Active recruitment specs loaded for Senior Frontend Engineer & Tech Lead roles.",
    userRole: "CEO",
    userName: MOCK_USERS.CEO.name,
    level: "action"
  },
  {
    id: "log-init-5",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    category: "Navigation",
    action: "Navigated to Executive Dashboard",
    details: "User viewed KPIs, recruitment pipeline stats, and active daily meetings.",
    userRole: "CEO",
    userName: MOCK_USERS.CEO.name,
    level: "info"
  }
];

const LogsContext = createContext<LogsContextType>({
  logs: [],
  addLog: () => {},
  clearLogs: () => {}
});

export const LogsProvider: React.FC<{ children: React.ReactNode; currentRole: UserRole }> = ({
  children,
  currentRole
}) => {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

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

  const clearLogs = () => {
    setLogs([]);
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
    <LogsContext.Provider value={{ logs, addLog, clearLogs, getFormattedJSONLogs }}>
      {children}
    </LogsContext.Provider>
  );
};

export const useLogs = () => useContext(LogsContext);
