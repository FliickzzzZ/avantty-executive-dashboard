import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Settings, Globe, Volume2, Check, Save } from "lucide-react";
import { useLogs } from "@/src/logs-context";
import { UserRole } from "@/src/types";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
}

const TIMEZONE_OPTIONS = [
  "GMT-8:00 (PST - Pacific Standard Time)",
  "GMT-5:00 (EST - Eastern Standard Time)",
  "GMT+0:00 (UTC - Coordinated Universal Time)",
  "GMT+1:00 (CET - Central European Time)",
  "GMT+2:00 (EET - Eastern European Time)",
  "GMT+8:00 (SGT - Singapore Time)",
  "GMT+9:00 (JST - Japan Standard Time)",
];

export function PreferencesModal({ isOpen, onClose, currentRole }: PreferencesModalProps) {
  const { addLog } = useLogs();

  const [timezone, setTimezone] = useState<string>(() => {
    return localStorage.getItem("avantty_user_timezone") || "GMT+0:00 (UTC - Coordinated Universal Time)";
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("avantty_sound_notifications") !== "false";
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  const handleSavePreferences = () => {
    localStorage.setItem("avantty_user_timezone", timezone);
    localStorage.setItem("avantty_sound_notifications", String(soundEnabled));

    addLog({
      category: "System",
      action: "Updated User Preferences",
      details: `Timezone set to ${timezone}, Sound notifications: ${soundEnabled ? "Enabled" : "Disabled"}`,
      level: "action",
      userRole: currentRole
    });

    setToastMessage("Preferences saved successfully!");
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm flex items-center justify-center min-h-screen overscroll-none"
        onWheel={(e) => {
          if (e.target === e.currentTarget) e.preventDefault();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md my-auto max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 flex flex-col overscroll-contain transition-colors"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 pr-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">System Preferences</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure your local user experience and notifications</p>
            </div>
          </div>

          {toastMessage && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Timezone Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-500" />
              <span>Timezone</span>
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Sound Notifications Toggle Switch */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Volume2 className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Sound Notifications</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Play audio cues for incoming interview notifications</span>
              </div>
            </div>

            {/* Functional Toggle Switch */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                soundEnabled ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-slate-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-900 shadow-lg ring-0 transition duration-200 ease-in-out ${
                  soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePreferences}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
