import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Settings,
  Users,
  ShieldCheck,
  Check,
  Lock,
  Save,
  CheckCircle2,
  Eye,
  Sliders
} from "lucide-react";
import { useLogs } from "@/src/logs-context";
import { useAppData } from "@/src/app-data-context";
import { UserRole } from "@/src/types";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface EnterpriseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onRoleChange?: (newRole: UserRole) => void;
}

export function EnterpriseSettingsModal({
  isOpen,
  onClose,
  currentRole,
  onRoleChange
}: EnterpriseSettingsModalProps) {
  const { addLog } = useLogs();
  const { teamAccounts, updateAccountRole, rolePermissions, updateRolePermissions } = useAppData();
  const [saveToast, setSaveToast] = useState(false);

  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  // Restrict settings to CEO
  if (currentRole !== "CEO") {
    return (
      <AnimatePresence>
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 dark:bg-slate-950/80 p-4 backdrop-blur-md flex items-center justify-center min-h-screen"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center space-y-4 text-slate-900 dark:text-slate-100"
          >
            <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold">Access Restricted to CEO</h2>
            <p className="text-xs text-slate-500">
              Enterprise settings and role permissions can only be modified by the Managing Partner / CEO.
            </p>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold"
            >
              Close
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  const handleToggleModuleForRole = (role: UserRole, moduleId: string) => {
    const currentAllowed = rolePermissions?.[role] || [];
    const isCurrentlyAllowed = currentAllowed.includes(moduleId);
    const newAllowed = isCurrentlyAllowed
      ? currentAllowed.filter((p) => p !== moduleId)
      : [...currentAllowed, moduleId];

    // Ensure at least 1 page remains
    if (newAllowed.length === 0) return;

    updateRolePermissions(role, newAllowed, currentRole);
  };

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 1200);

    addLog({
      category: "Role & Auth",
      action: "Updated Team Ranks & Real-Time Permissions",
      details: `Permissions successfully synchronized across all active roles by ${currentRole}`,
      level: "success",
      userRole: currentRole
    });
  };

  const allPlatformModules = [
    { id: "dashboard", label: "Executive Dashboard", description: "High-level overview & KPIs" },
    { id: "meetings", label: "Candidate Meetings", description: "Interviews & calendar" },
    { id: "search-candidates", label: "Search Candidates", description: "Candidate specifications" },
    { id: "follow-ups", label: "Follow Ups", description: "Automated candidate outreach" },
    { id: "logs", label: "System Activity Logs", description: "Real-time audit ledger" }
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 dark:bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md flex items-center justify-center min-h-screen overscroll-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl my-auto max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col transition-colors overflow-hidden"
        >
          {/* Header */}
          <div className="shrink-0 p-5 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs shrink-0">
                <Settings className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                    Team Accounts & Live Rank Permissions
                  </h2>
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">
                    CEO Real-Time Control
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Click any account to change their rank and toggle in real-time what each role can see
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {saveToast && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-emerald-50 dark:bg-emerald-950/80 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Rank assignments and real-time visibility permissions successfully saved.</span>
              </div>
            )}

            {/* 1. Team Accounts Manager */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span>Firm Team Accounts & Live Rank Assignment</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Instant Update
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Change any team member's rank in real time. Their accessible modules will immediately adapt.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {teamAccounts.map((acc) => {
                  const isCurrentActive = acc.role === currentRole;
                  return (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="h-9 w-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{acc.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate">{acc.email}</p>
                          <span className="text-[9px] font-mono text-slate-400 truncate block">{acc.title}</span>
                        </div>
                      </div>

                      {/* Role / Rank Selector */}
                      <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Rank</label>
                        <select
                          value={acc.role}
                          onChange={(e) => updateAccountRole(acc.id, e.target.value as UserRole, currentRole)}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-1.5 text-xs font-bold text-slate-900 dark:text-slate-100"
                        >
                          <option value="CEO">CEO / Managing Partner</option>
                          <option value="Recruiter">Senior Headhunter / Recruiter</option>
                          <option value="Sourcer">Executive Sourcer</option>
                        </select>
                      </div>

                      {/* Quick Session Switcher */}
                      {onRoleChange && (
                        <button
                          type="button"
                          onClick={() => onRoleChange(acc.role)}
                          className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isCurrentActive
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          <Eye className="h-3 w-3" />
                          <span>{isCurrentActive ? "Active Session" : `Preview ${acc.role}`}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Real-Time Module Visibility Matrix */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span>Real-Time Visibility Matrix by Rank</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Click any module button to show or hide that page for each rank in real-time.
              </p>

              <div className="space-y-3 pt-2">
                {(["CEO", "Recruiter", "Sourcer"] as UserRole[]).map((rank) => {
                  const allowed = rolePermissions?.[rank] || [];
                  return (
                    <div
                      key={rank}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">{rank} Rank Permissions</span>
                          <span className="text-[10px] text-slate-400 font-mono">({allowed.length} visible modules)</span>
                        </div>
                        {currentRole === rank && (
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            Your Current Role
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                        {allPlatformModules.map((mod) => {
                          const isChecked = allowed.includes(mod.id);
                          return (
                            <button
                              key={mod.id}
                              type="button"
                              onClick={() => handleToggleModuleForRole(rank, mod.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                                isChecked
                                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs"
                                  : "bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold leading-tight truncate">{mod.label}</span>
                                {isChecked ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                  <div className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                                )}
                              </div>
                              <span className="text-[9px] opacity-75 font-mono">
                                {isChecked ? "Visible" : "Hidden"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 p-4 px-5 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Avantty Practice Governance v4.2
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 px-4 py-2 text-xs font-bold text-white dark:text-slate-900 transition-all shadow-xs cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Permissions</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default EnterpriseSettingsModal;
