"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ScrollText,
  Search,
  Filter,
  Download,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap,
  User,
  X,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLogs, LogCategory, LogLevel, LogEntry } from "@/src/logs-context";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

export function LogsView() {
  const { logs, addLog } = useLogs();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  // Selected Log Modal state
  const [selectedLogItem, setSelectedLogItem] = useState<LogEntry | null>(null);

  // Lock body scroll when modal is open
  useLockBodyScroll(isAddLogModalOpen || !!selectedLogItem);

  // New log form state
  const [newCategory, setNewCategory] = useState<LogCategory>("System");
  const [newAction, setNewAction] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newLevel, setNewLevel] = useState<LogLevel>("info");

  const categories = ["All", "Navigation", "Meeting Bot", "Candidate Spec", "Role & Auth", "System", "Search"];

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesCategory = selectedCategory === "All" || log.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || log.level === selectedLevel;
    const queryLower = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      log.action.toLowerCase().includes(queryLower) ||
      (log.details && log.details.toLowerCase().includes(queryLower)) ||
      log.category.toLowerCase().includes(queryLower) ||
      log.userName.toLowerCase().includes(queryLower) ||
      log.userRole.toLowerCase().includes(queryLower);

    return matchesCategory && matchesLevel && matchesQuery;
  });

  const handleCreateCustomLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction.trim()) return;

    addLog({
      category: newCategory,
      action: newAction.trim(),
      details: newDetails.trim() || undefined,
      level: newLevel
    });

    setNewAction("");
    setNewDetails("");
    setIsAddLogModalOpen(false);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `avantty-activity-logs-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Determines if a log contains deletion, clear, or drastic mutation keywords
  const isCriticalLogAction = (log: LogEntry): boolean => {
    const textToAnalyze = `${log.action} ${log.details || ""} ${log.category}`.toLowerCase();
    const criticalKeywords = ["delete", "clear", "purge", "mutation", "remove", "removed", "critical", "suspended", "locked", "threshold"];
    return criticalKeywords.some((kw) => textToAnalyze.includes(kw));
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </span>
        );
      case "action":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <Zap className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            Action
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </span>
        );
      case "info":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <Info className="h-3 w-3" />
            Info
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm rounded-2xl">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-xs">
                <ScrollText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  System & Activity Audit Logs
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time recording of all page interactions, role changes, meeting bot activities, and candidate sourcing specs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAddLogModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Manual Event</span>
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Logged Events</div>
              <div className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-slate-100">{logs.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">User Actions</div>
              <div className="mt-1 font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {logs.filter((l) => l.level === "action").length}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Success Events</div>
              <div className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-slate-100">
                {logs.filter((l) => l.level === "success").length}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">System Info</div>
              <div className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-slate-100">
                {logs.filter((l) => l.level === "info").length}
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs by action, details, category, user, or role..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2 pl-10 pr-10 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all focus:border-emerald-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mr-1 shrink-0 flex items-center gap-1">
                <Filter className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white font-bold shadow-xs border border-transparent"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Logs Stream Container */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              {filteredLogs.length} Entries
            </span>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Audit Stream & Interactive Log Telemetry
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <ScrollText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  No log entries match your filter
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try clearing your search query or selecting &quot;All&quot; categories to view system activities.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedLevel("All");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                onClick={() => setSelectedLogItem(log)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 group cursor-pointer border-b border-slate-100 dark:border-slate-800/60"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-xs font-bold mt-0.5 border border-slate-200 dark:border-slate-700 group-hover:border-slate-400">
                    <Clock className="h-4 w-4 text-slate-500" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                        {log.action}
                      </span>
                      {getLevelBadge(log.level)}
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {log.category}
                      </span>
                    </div>

                    {log.details && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans line-clamp-1">
                        {log.details}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">
                        [{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                      </span>
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <User className="h-3 w-3 text-slate-400" />
                        {log.userName}
                      </span>
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {log.userRole}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 self-center sm:self-auto">
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal Centered: Event Metadata & Telemetry (White theme) */}
      <AnimatePresence>
        {selectedLogItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 p-4 backdrop-blur-sm min-h-screen overflow-y-auto overscroll-none"
            onWheel={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg my-auto max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Event Metadata & Telemetry</h2>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">Structured Log Inspection</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLogItem(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body Content - Structured Metadata */}
              <div className="space-y-3.5">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Event Title & Action Type</span>
                  <div className="text-base font-black text-slate-900 dark:text-white">{selectedLogItem.action}</div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-mono font-bold">
                      Category: {selectedLogItem.category}
                    </span>
                    {getLevelBadge(selectedLogItem.level)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Timestamp</span>
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                      {selectedLogItem.timestamp.toISOString()}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {selectedLogItem.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Executed By (Role)</span>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {selectedLogItem.userName}
                    </div>
                    <div className="inline-block rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold">
                      Role: {selectedLogItem.userRole}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Event Details / Payload</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                    {selectedLogItem.details || "No secondary payload attached to event."}
                  </p>
                </div>

                {/* AI Security Diagnostic Section */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      AI Security Diagnostic
                    </span>
                  </div>

                  {isCriticalLogAction(selectedLogItem) ? (
                    <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/70 p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                        <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        <span>Security Alert: High-Impact Infrastructure Action</span>
                      </div>
                      <p className="text-xs font-mono font-medium text-rose-800 dark:text-rose-200/90 leading-relaxed">
                        Critical Action Detected: High-impact modification to infrastructure. Monitor source IP.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
                        <ShieldCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        <span>System Status: Verified Workflow</span>
                      </div>
                      <p className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                        Normal Operation: Standard corporate workflow active.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedLogItem(null)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Close Metadata Dialog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Add Log Modal (Centered White Theme) */}
      <AnimatePresence>
        {isAddLogModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 p-4 backdrop-blur-sm min-h-screen overflow-y-auto overscroll-none"
            onWheel={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg my-auto max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-slate-900 dark:text-slate-100 overscroll-contain"
            >
              <button
                type="button"
                onClick={() => setIsAddLogModalOpen(false)}
                className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 pr-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Log Custom Event</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manually push an audit event to the system activity log</p>
                </div>
              </div>

              <form onSubmit={handleCreateCustomLog} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as LogCategory)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="System">System</option>
                      <option value="Navigation">Navigation</option>
                      <option value="Meeting Bot">Meeting Bot</option>
                      <option value="Candidate Spec">Candidate Spec</option>
                      <option value="Role & Auth">Role & Auth</option>
                      <option value="Search">Search</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Severity Level</label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value as LogLevel)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="info">Info</option>
                      <option value="action">Action</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Action Title *</label>
                  <input
                    type="text"
                    required
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    placeholder="e.g. Exported Candidate Data, Verified API Webhook..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Details / Context</label>
                  <textarea
                    rows={3}
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    placeholder="Additional details regarding the event execution..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddLogModalOpen(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Log Entry</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
