import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, ChevronRight, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface OpenRole {
  id: string;
  position: string;
  department: string;
  targetCount: number;
  sourcedCount: number;
  priority: "High" | "Medium" | "Urgent";
}

const ROLES_TO_FIND: OpenRole[] = [
  {
    id: "r1",
    position: "Chief Executive Officer (CEO)",
    department: "Executive Leadership",
    targetCount: 3,
    sourcedCount: 2,
    priority: "Urgent",
  },
  {
    id: "r2",
    position: "Chief Revenue Officer (CRO)",
    department: "Executive Revenue",
    targetCount: 4,
    sourcedCount: 3,
    priority: "Urgent",
  },
  {
    id: "r3",
    position: "Vice President of Engineering",
    department: "Engineering Leadership",
    targetCount: 5,
    sourcedCount: 4,
    priority: "High",
  },
  {
    id: "r4",
    position: "Chief People Officer (CPO)",
    department: "Executive Talent",
    targetCount: 2,
    sourcedCount: 1,
    priority: "Medium",
  },
];

export function CandidatesToFindCard({ onNavigate }: { onNavigate?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  useLockBodyScroll(isOpen);

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      setIsOpen(true);
    }
  };

  const totalNeeded = ROLES_TO_FIND.reduce((sum, role) => sum + role.targetCount, 0);
  const totalSourced = ROLES_TO_FIND.reduce((sum, role) => sum + role.sourcedCount, 0);
  const remainingToFind = totalNeeded - totalSourced;

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
                <Target className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Candidates to Find
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Target executive sourcing quotas for client mandates
            </CardDescription>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            View Targets
          </span>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {remainingToFind}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                executives needed
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
              {totalSourced}/{totalNeeded} sourced ({Math.round((totalSourced / totalNeeded) * 100)}%)
            </span>
          </div>

          {/* Quick Role Progress Breakdown */}
          <div className="space-y-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-200 dark:border-slate-800">
            {ROLES_TO_FIND.slice(0, 3).map((role) => {
              const progress = Math.round((role.sourcedCount / role.targetCount) * 100);
              return (
                <div key={role.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium text-slate-900 dark:text-slate-100 max-w-[170px]">
                      {role.position}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {role.sourcedCount}/{role.targetCount}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-slate-800 dark:bg-slate-200 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:translate-x-0.5 transition-transform">
            <span>View active recruitment targets ({ROLES_TO_FIND.length} roles)</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
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
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Executive Mandates by Role
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Current C-Suite & VP search quotas for client companies
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
                {ROLES_TO_FIND.map((role) => {
                  const progress = Math.round((role.sourcedCount / role.targetCount) * 100);
                  const needed = role.targetCount - role.sourcedCount;

                  return (
                    <div
                      key={role.id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {role.position}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            role.priority === "Urgent"
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              : role.priority === "High"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {role.priority} Priority
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Department: {role.department}
                      </div>

                      <div className="mt-1 space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-500 dark:text-slate-400">
                            Progress: {role.sourcedCount} of {role.targetCount} sourced
                          </span>
                          <span className="text-slate-900 dark:text-white font-bold">
                            {needed > 0 ? `${needed} remaining` : "Target Reached"}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-slate-800 dark:bg-slate-200 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
