import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X, User, Calendar, Building2, ScrollText, ArrowRight, CornerDownLeft, Sparkles, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLogs } from "@/src/logs-context";
import { useAppData } from "@/src/app-data-context";
import { MeetingItem } from "@/components/meetings-view";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface SearchResultItem {
  id: string;
  rawId?: string;
  type: "Candidate Spec" | "Client Company" | "Meeting" | "System Log";
  title: string;
  subtitle: string;
  detail?: string;
  categoryTag?: string;
  targetPage: "search-candidates" | "meetings" | "logs";
}

interface AppSearchProps {
  onNavigate?: (page: string) => void;
}

export function AppSearch({ onNavigate }: AppSearchProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Candidates" | "Meetings" | "Clients" | "Logs">("All");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { logs } = useLogs();
  const { meetingsByDay, candidateSpecs, setFocusedMeetingId, setFocusedSpecId } = useAppData();

  useLockBodyScroll(isOpen);

  // Global shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Build live search index from live app state
  const allSearchableItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // 1. Candidate Specifications
    if (Array.isArray(candidateSpecs)) {
      candidateSpecs.forEach((spec) => {
        if (spec) {
          items.push({
            id: `spec-${spec.id}`,
            rawId: spec.id,
            type: "Candidate Spec",
            title: `${spec.roleTitle} — ${spec.company}`,
            subtitle: `${spec.status === "Finded" ? "FINDED" : "SEARCHING"} • ${spec.department || "Executive"} • ${spec.locationWorkspace}`,
            detail: spec.coreChallenge || spec.trackRecord || spec.targetHuntingGrounds,
            categoryTag: spec.status === "Finded" ? "Finded" : "Active Search",
            targetPage: "search-candidates"
          });
        }
      });
    }

    // 2. Executive Meetings
    if (meetingsByDay && typeof meetingsByDay === "object") {
      (Object.values(meetingsByDay) as MeetingItem[][]).forEach((dayMeetings) => {
        if (Array.isArray(dayMeetings)) {
          dayMeetings.forEach((meeting) => {
            if (meeting) {
              items.push({
                id: `meeting-${meeting.id}`,
                rawId: meeting.id,
                type: "Meeting",
                title: `${meeting.candidate} — ${meeting.role}`,
                subtitle: `Client: ${meeting.clientCompany} • ${meeting.day} at ${meeting.time}`,
                detail: `${meeting.currentExecutiveTitle ? `${meeting.currentExecutiveTitle} | ` : ""}${meeting.coreStrengths || meeting.notes || ""}`,
                categoryTag: (meeting.status || "upcoming").toUpperCase(),
                targetPage: "meetings"
              });
            }
          });
        }
      });
    }

    // 3. Unique Client Companies
    const clientMap = new Map<string, { searches: number; meetings: number }>();
    if (Array.isArray(candidateSpecs)) {
      candidateSpecs.forEach((spec) => {
        if (spec?.company) {
          const entry = clientMap.get(spec.company) || { searches: 0, meetings: 0 };
          entry.searches += 1;
          clientMap.set(spec.company, entry);
        }
      });
    }
    if (meetingsByDay && typeof meetingsByDay === "object") {
      (Object.values(meetingsByDay) as MeetingItem[][]).forEach((dayMeetings) => {
        if (Array.isArray(dayMeetings)) {
          dayMeetings.forEach((meeting) => {
            if (meeting?.clientCompany) {
              const entry = clientMap.get(meeting.clientCompany) || { searches: 0, meetings: 0 };
              entry.meetings += 1;
              clientMap.set(meeting.clientCompany, entry);
            }
          });
        }
      });
    }

    clientMap.forEach((stats, companyName) => {
      items.push({
        id: `client-${companyName}`,
        type: "Client Company",
        title: companyName,
        subtitle: `Executive Search Mandate • ${stats.searches} active candidate spec(s), ${stats.meetings} scheduled meeting(s)`,
        detail: "Client organization in Avantty Executive Search placement pipeline",
        categoryTag: "Enterprise Client",
        targetPage: "search-candidates"
      });
    });

    // 4. System Audit Logs
    if (Array.isArray(logs)) {
      logs.slice(0, 30).forEach((log) => {
        if (log) {
          items.push({
            id: `log-${log.id}`,
            rawId: log.id,
            type: "System Log",
            title: `${log.action} [${log.category}]`,
            subtitle: `Actor: ${log.userName} (${log.userRole}) • ${new Date(log.timestamp).toLocaleTimeString()}`,
            detail: log.details || "Telemetry audit log entry",
            categoryTag: (log.level || "info").toUpperCase(),
            targetPage: "logs"
          });
        }
      });
    }

    return items;
  }, [candidateSpecs, meetingsByDay, logs]);

  // Filtered results based on search query and category filter
  const filteredResults = useMemo(() => {
    let list = allSearchableItems;

    if (activeFilter === "Candidates") {
      list = list.filter((item) => item.type === "Candidate Spec");
    } else if (activeFilter === "Meetings") {
      list = list.filter((item) => item.type === "Meeting");
    } else if (activeFilter === "Clients") {
      list = list.filter((item) => item.type === "Client Company");
    } else if (activeFilter === "Logs") {
      list = list.filter((item) => item.type === "System Log");
    }

    if (!query.trim()) {
      return list.slice(0, 8);
    }

    const q = query.toLowerCase().trim();
    return list.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.detail && item.detail.toLowerCase().includes(q)) ||
        (item.categoryTag && item.categoryTag.toLowerCase().includes(q))
      );
    });
  }, [allSearchableItems, activeFilter, query]);

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  const handleSelectItem = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery("");

    if (item.type === "Candidate Spec") {
      const realId = item.rawId || item.id.replace("spec-", "");
      setFocusedSpecId(realId);
    } else if (item.type === "Meeting") {
      const realId = item.rawId || item.id.replace("meeting-", "");
      setFocusedMeetingId(realId);
    }

    if (onNavigate) {
      onNavigate(item.targetPage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredResults.length > 0 ? (prev + 1) % filteredResults.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredResults.length > 0 ? (prev - 1 + filteredResults.length) % filteredResults.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectItem(filteredResults[selectedIndex]);
      }
    }
  };

  const getIcon = (type: SearchResultItem["type"]) => {
    switch (type) {
      case "Candidate Spec":
        return <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "Client Company":
        return <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "Meeting":
        return <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "System Log":
        return <ScrollText className="h-4 w-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <>
      {/* Search Trigger in Sidebar / Header */}
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          readOnly
          onClick={() => setIsOpen(true)}
          placeholder="Global Search (Candidates, Meetings, Logs)... ⌘K"
          className="w-full cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/80 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        />
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div
                className="fixed inset-0 z-[99999] flex items-start justify-center pt-16 sm:pt-20 bg-black/85 dark:bg-black/90 p-4 backdrop-blur-xl overscroll-contain"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setIsOpen(false);
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 max-h-[85vh] overscroll-contain transition-colors z-[100000]"
                >
                  {/* Search Header */}
                  <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950/90">
                    <Search className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search executive candidate, client company, meeting, or audit log..."
                      className="flex-1 bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">ESC</span>
                    </button>
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 p-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto text-xs">
                    {(["All", "Candidates", "Meetings", "Clients", "Logs"] as const).map((filterName) => (
                      <button
                        key={filterName}
                        type="button"
                        onClick={() => setActiveFilter(filterName)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs shrink-0 ${
                          activeFilter === filterName
                            ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-2xs font-bold"
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800"
                        }`}
                      >
                        {filterName}
                      </button>
                    ))}
                  </div>

                  {/* Results List */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/40">
                    {filteredResults.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <p className="font-bold text-slate-900 dark:text-slate-200 text-sm">No matches found for "{query}"</p>
                        <p>Try searching by executive name (Marcus Vance, Elena Rostova), client (Veloce Labs, Aura Health), or role (CEO, CTO, CRO).</p>
                      </div>
                    ) : (
                      filteredResults.map((item, index) => {
                        const isSelected = selectedIndex === index;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`p-3 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-3 group ${
                              isSelected
                                ? "bg-slate-100 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 shadow-xs"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-0.5">
                                {getIcon(item.type)}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                                    {item.title}
                                  </span>
                                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                                    {item.type}
                                  </span>
                                  {item.categoryTag && (
                                    <span className="rounded bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.2 text-[9px] font-mono text-slate-600 dark:text-slate-300">
                                      {item.categoryTag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate">
                                  {item.subtitle}
                                </p>
                                {item.detail && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {item.detail}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isSelected && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                  <span>Open</span>
                                  <CornerDownLeft className="h-3 w-3" />
                                </span>
                              )}
                              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Search Footer */}
                  <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Live index: Candidates, Clients, Meetings & Audit Logs</span>
                    <span className="hidden sm:inline">Use ↑↓ to navigate • ↵ to select</span>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

export default AppSearch;
