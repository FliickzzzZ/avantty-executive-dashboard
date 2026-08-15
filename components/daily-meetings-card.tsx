import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, Video, User, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface Meeting {
  id: string;
  time: string;
  candidate: string;
  role: string;
  interviewer: string;
  status: "completed" | "upcoming" | "in-progress";
  type: string;
}

const MEETINGS_TODAY: Meeting[] = [
  {
    id: "m1",
    time: "09:30 AM",
    candidate: "Marcus Vance",
    role: "Chief Technology Officer (CTO)",
    interviewer: "Sarah Jenkins (Partner)",
    status: "completed",
    type: "Executive Placement Vetting",
  },
  {
    id: "m2",
    time: "11:00 AM",
    candidate: "Elena Rostova",
    role: "VP of Engineering",
    interviewer: "David Kim (Director)",
    status: "completed",
    type: "Executive Leadership Sync",
  },
  {
    id: "m3",
    time: "01:15 PM",
    candidate: "Liam Chen",
    role: "Chief Information Security Officer",
    interviewer: "Alex Rivera (Partner)",
    status: "completed",
    type: "C-Suite Security Vetting",
  },
  {
    id: "m4",
    time: "02:30 PM",
    candidate: "Sophia Martinez",
    role: "Chief Product Officer (CPO)",
    interviewer: "Rachel Adams (Director)",
    status: "in-progress",
    type: "Product Portfolio & Strategy Review",
  },
  {
    id: "m5",
    time: "04:00 PM",
    candidate: "James O'Connor",
    role: "Managing Director, Global Infra",
    interviewer: "Michael Scott (Partner)",
    status: "upcoming",
    type: "P&L & Board Readiness Sync",
  },
  {
    id: "m6",
    time: "05:15 PM",
    candidate: "Aria Takahashi",
    role: "Chief AI Officer (CAIO)",
    interviewer: "Naim Ramos (Managing Partner)",
    status: "upcoming",
    type: "Final Executive Placement Sync",
  },
];

export function DailyMeetingsCard({ onNavigate }: { onNavigate?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  useLockBodyScroll(isOpen);

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      setIsOpen(true);
    }
  };

  const completedCount = MEETINGS_TODAY.filter((m) => m.status === "completed").length;
  const totalMeetings = MEETINGS_TODAY.length;

  return (
    <>
      <Card
        onClick={handleClick}
        className="group relative cursor-pointer overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md"
      >
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                <CalendarDays className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Daily Meetings
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Scheduled interviews & screening sessions today
            </CardDescription>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            View Schedule
          </span>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {totalMeetings}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                meetings today
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
              {completedCount} completed
            </span>
          </div>

          {/* Quick Schedule Preview List */}
          <div className="space-y-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-200 dark:border-slate-800">
            {MEETINGS_TODAY.slice(0, 3).map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between text-xs py-1 px-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100 shrink-0">
                    {meeting.time}
                  </span>
                  <span className="truncate font-medium text-slate-600 dark:text-slate-300">
                    {meeting.candidate}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                    meeting.status === "completed"
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                      : meeting.status === "in-progress"
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {meeting.status}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:translate-x-0.5 transition-transform">
            <span>View full daily schedule ({totalMeetings})</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      {/* Modal Detail View */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none"
            onWheel={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-900 dark:text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Daily Meetings Schedule
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Today&apos;s candidate interviews and screening calls
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {MEETINGS_TODAY.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                        <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                        <span>{meeting.time}</span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          meeting.status === "completed"
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                            : meeting.status === "in-progress"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {meeting.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {meeting.candidate}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {meeting.role} • {meeting.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> Interviewer: {meeting.interviewer}
                      </span>
                      <span className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-medium cursor-pointer hover:underline">
                        <Video className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Join Call
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 text-xs font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
