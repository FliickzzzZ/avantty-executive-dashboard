import * as React from "react";
import { useState } from "react";
import { LogoIcon } from "@/components/logo";
import { UserRole } from "@/src/types";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Mail, Lock, ArrowRight, UserCheck } from "lucide-react";
import { useAppData, getDynamicTeamAccounts } from "@/src/app-data-context";

interface AuthFlowProps {
  onAuthenticated: (role: UserRole) => void;
}

interface SandboxProfile {
  role: UserRole;
  title: string;
  name: string;
  email: string;
  badge: string;
  scope: string;
}

export function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const { whiteLabelConfig } = useAppData();
  const dynamicAccounts = getDynamicTeamAccounts(whiteLabelConfig);
  const compName = whiteLabelConfig.isCustomized ? whiteLabelConfig.companyName : "Avantty";

  const SANDBOX_PROFILES: SandboxProfile[] = [
    {
      role: "CEO",
      title: "Chief Executive Officer & Managing Partner",
      name: dynamicAccounts[0]?.name || "Naim Ramos",
      email: dynamicAccounts[0]?.email || "naim@avanttyops.com",
      badge: "Full Governance",
      scope: "Unrestricted access to Executive Pipeline metrics, Security & Disaster Recovery, and Audit Ledgers."
    },
    {
      role: "Recruiter",
      title: "Executive Search Partner",
      name: dynamicAccounts[1]?.name || "Carlos Mendez",
      email: dynamicAccounts[1]?.email || "recruiter@avanttyops.com",
      badge: "Partner Access",
      scope: "Active Retained Mandates, Candidate Dossiers, Scheduled Debriefs, and Post-Interview Follow-Ups."
    },
    {
      role: "Sourcer",
      title: "Senior Talent Consultant",
      name: dynamicAccounts[2]?.name || "Sofia Chen",
      email: dynamicAccounts[2]?.email || "sourcer@avanttyops.com",
      badge: "Consultant Access",
      scope: "Boolean Sourcing Targeting, Target Hunting Grounds, and Candidate Specification Reviews."
    }
  ];

  const [selectedRole, setSelectedRole] = useState<UserRole>("CEO");
  const [email, setEmail] = useState(SANDBOX_PROFILES[0].email);
  const [password, setPassword] = useState("••••••••••••");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectProfile = (profile: SandboxProfile) => {
    setSelectedRole(profile.role);
    setEmail(profile.email);
    setPassword("••••••••••••");
  };

  const handleDirectLogin = (role: UserRole) => {
    setIsSubmitting(true);
    localStorage.setItem("avantty_remembered_role", role);
    setTimeout(() => {
      setIsSubmitting(false);
      onAuthenticated(role);
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let roleToAuth: UserRole = selectedRole;
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail.includes("recruiter")) {
      roleToAuth = "Recruiter";
    } else if (cleanEmail.includes("sourcer") || cleanEmail.includes("sofia")) {
      roleToAuth = "Sourcer";
    } else {
      roleToAuth = "CEO";
    }

    localStorage.setItem("avantty_remembered_role", roleToAuth);
    setTimeout(() => {
      setIsSubmitting(false);
      onAuthenticated(roleToAuth);
    }, 200);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-[#080B0A] p-4 md:p-8 text-slate-900 dark:text-slate-100 transition-colors font-sans">
      {/* Top Bar with Theme Switcher */}
      <div className="w-full max-w-5xl flex justify-end pb-4">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: Clean Executive Sign-In Form */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-white dark:bg-[#080B0A] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1 mb-2">
              <LogoIcon className="h-4 w-4 text-[#00875A]" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {compName} Executive Portal
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Enterprise Sign In
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your credentials to access your retained search operations workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@firm.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-[#00875A] dark:focus:border-[#00875A] focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-[#00875A] dark:focus:border-[#00875A] focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#080B0A] hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#080B0A] py-3 text-xs font-semibold shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#00875A] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to {compName} Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
            <span>256-bit TLS encrypted session</span>
            <span>SOC-2 Type II Certified</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Demo Sandbox Profile Switcher */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-white dark:bg-[#080B0A] p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-sm">
              <UserCheck className="h-4 w-4 text-[#00875A]" />
              <span>Demo Sandbox Profile Switcher</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Select an executive profile to preview role-based permissions and governance.
            </p>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {SANDBOX_PROFILES.map((profile) => {
              const isSelected = selectedRole === profile.role;

              return (
                <div
                  key={profile.role}
                  onClick={() => handleSelectProfile(profile)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? "border-[#00875A] bg-[#00875A]/5 dark:bg-[#00875A]/10 text-slate-900 dark:text-slate-100 ring-1 ring-[#00875A]/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {profile.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {profile.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {profile.title}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectLogin(profile.role);
                      }}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
                        isSelected
                          ? "bg-[#00875A] text-white hover:bg-[#00704a]"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {isSelected ? "Sign In Now" : "Switch Profile"}
                    </button>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {profile.scope}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 text-center">
            Role changes apply immediately without exposing mock secrets.
          </div>
        </div>
      </div>
    </div>
  );
}
