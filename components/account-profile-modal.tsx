import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Shield, Key, CheckCircle2, Save, Mail, Check } from "lucide-react";
import { UserRole, ROLE_CONFIGS } from "@/src/types";
import { useLogs } from "@/src/logs-context";
import { useAppData, getDynamicUser } from "@/src/app-data-context";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function AccountProfileModal({ isOpen, onClose, currentRole, onRoleChange }: AccountProfileModalProps) {
  const { addLog } = useLogs();
  const { whiteLabelConfig } = useAppData();
  const user = getDynamicUser(currentRole, whiteLabelConfig);

  const [fullName, setFullName] = useState(user.rawName);
  const [emailAddress, setEmailAddress] = useState(user.email);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (user) {
      setFullName(user.rawName);
      setEmailAddress(user.email);
    }
  }, [user, currentRole, whiteLabelConfig]);

  if (!isOpen) return null;

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    user.name = fullName;
    user.email = emailAddress;

    addLog({
      category: "Role & Auth",
      action: "Updated Account Profile Info",
      details: `Full Name: ${fullName}, Email: ${emailAddress} for role [${currentRole}]`,
      level: "success",
      userRole: currentRole
    });

    setToastMessage("Account profile changes saved!");
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 dark:bg-slate-950/80 p-4 backdrop-blur-md flex items-center justify-center min-h-screen overscroll-none"
        onWheel={(e) => {
          if (e.target === e.currentTarget) e.preventDefault();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg my-auto max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 transition-colors"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Circular Avatar + Header Identity */}
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 pr-6">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover border-2 border-slate-300 dark:border-slate-700 shadow-md shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{fullName}</h2>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 font-mono text-[11px] font-bold">
                  {currentRole}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{emailAddress}</p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> Verified Executive Profile
              </span>
            </div>
          </div>

          {toastMessage && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveChanges} className="space-y-4">
            {/* Editable Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none"
              />
            </div>

            {/* Editable Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none font-mono"
              />
            </div>

            {/* Role Switcher */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-slate-500" />
                <span>Active Role Designation</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["CEO", "Recruiter", "Searcher"] as UserRole[]).map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => onRoleChange(role)}
                    className={`rounded-xl border p-2.5 text-left transition-all flex flex-col justify-between cursor-pointer ${
                      currentRole === role
                        ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span className="text-xs font-bold">{role}</span>
                    <span className={`text-[10px] font-normal ${currentRole === role ? "text-slate-300 dark:text-slate-600" : "text-slate-500"}`}>
                      {role === "CEO" ? "Full Access" : role === "Recruiter" ? "Recruiter" : "Searcher"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Action: Save Changes Button in bottom right */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

