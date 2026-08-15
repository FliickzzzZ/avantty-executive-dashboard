import * as React from "react";
import { useState } from "react";
import { LogoIcon } from "@/components/logo";
import { UserRole } from "@/src/types";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Key, Mail, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAppData, getDynamicTeamAccounts } from "@/src/app-data-context";

interface AuthFlowProps {
  onAuthenticated: (role: UserRole) => void;
}

export function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const { whiteLabelConfig } = useAppData();
  const dynamicAccounts = getDynamicTeamAccounts(whiteLabelConfig);
  const compName = whiteLabelConfig.isCustomized ? whiteLabelConfig.companyName : "Avantty";

  const ACCOUNTS_BY_RANK: { role: UserRole; rankTitle: string; email: string; pass: string; description: string }[] = [
    {
      role: "CEO",
      rankTitle: `Role: CEO / Executive Management (${dynamicAccounts[0].name})`,
      email: dynamicAccounts[0].email,
      pass: `${compName}CEO2026!`,
      description: `Full access to executive metrics, candidate search, and ${compName} command center.`,
    },
    {
      role: "Recruiter",
      rankTitle: "Role: Recruiter / Talent Acquisition",
      email: dynamicAccounts[1].email,
      pass: `${compName}Recruiter2026!`,
      description: "Direct candidate pipeline, interview scheduling, and offer management.",
    },
    {
      role: "Sourcer",
      rankTitle: "Role: Sourcer / Talent Sourcing",
      email: dynamicAccounts[2].email,
      pass: `${compName}Sourcer2026!`,
      description: "Advanced candidate search module and match score analytics.",
    },
  ];

  const [email, setEmail] = useState(dynamicAccounts[0].email);
  const [password, setPassword] = useState(`${compName}CEO2026!`);
  const [code, setCode] = useState("654321");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick fill helper
  const handleQuickFill = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setCode("654321");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Determine role based on email input
    let authenticatedRole: UserRole = "CEO";
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail.includes("recruiter")) {
      authenticatedRole = "Recruiter";
    } else if (cleanEmail.includes("sourcer") || cleanEmail.includes("searcher") || cleanEmail.includes("sofia")) {
      authenticatedRole = "Sourcer";
    } else {
      authenticatedRole = "CEO";
    }

    localStorage.setItem("avantty_remembered_role", authenticatedRole);

    setTimeout(() => {
      setIsSubmitting(false);
      onAuthenticated(authenticatedRole);
    }, 250);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white dark:selection:bg-slate-100 dark:selection:text-slate-900 transition-colors">
      
      {/* Top Bar with Theme Switcher */}
      <div className="w-full max-w-5xl flex justify-end pb-4">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: Login Card */}
        <div className="md:col-span-7 space-y-4">
          {/* Main Login Form Box */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1 mb-2">
                <LogoIcon className="h-4 w-4 text-slate-900 dark:text-slate-100" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {compName} Platform
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Sign In
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your credentials to access your designated {compName} workspace
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`e.g. ${dynamicAccounts[0].email}`}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-10 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-slate-900 dark:focus:border-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-10 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-slate-900 dark:focus:border-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Verification Code (2FA)
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="654321"
                  maxLength={6}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-slate-900 dark:focus:border-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="text-white font-bold">Signing in...</span>
                ) : (
                  <>
                    <span className="text-white font-bold">Sign In to {compName}</span>
                    <ArrowRight className="h-4 w-4 text-white" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Account Credentials Explanation Table */}
        <div className="md:col-span-5 rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div>
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
              <Shield className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <span>Role Access Credentials</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Use these credentials to log in as each specific account role.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {ACCOUNTS_BY_RANK.map((acc) => {
              const isFilled = email === acc.email;

              return (
                <div
                  key={acc.role}
                  onClick={() => handleQuickFill(acc.email, acc.pass)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-2 ease-executive ${
                    isFilled
                      ? "border-emerald-500/80 dark:border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {/* Header: Clean Role Title + Active Profile Indicator */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${isFilled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                      <span>{acc.rankTitle}</span>
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all flex items-center gap-1 shrink-0 ${
                        isFilled
                          ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {isFilled ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Active Profile</span>
                        </>
                      ) : (
                        <span>Select & Fill</span>
                      )}
                    </span>
                  </div>

                  <p className={`text-[11px] leading-tight ${isFilled ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                    {acc.description}
                  </p>

                  {/* Credentials block */}
                  <div className={`font-mono text-[11px] p-2 rounded-lg space-y-1 ${
                    isFilled 
                      ? "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200" 
                      : "bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Email:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{acc.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Pass:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{acc.pass}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
