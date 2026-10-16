import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/card";
import {
  Mail,
  Copy,
  Check,
  Bot,
  Zap,
  CheckCircle2,
  Shield,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Building2,
  CalendarCheck,
  X,
  Info
} from "lucide-react";
import { useLogs } from "@/src/logs-context";
import { useAppData, getCustomizedFollowUpTemplate } from "@/src/app-data-context";
import { UserRole, FollowUpDispatch } from "@/src/types";

interface FollowUpsViewProps {
  currentRole?: UserRole;
}

export function FollowUpsView({ currentRole = "CEO" }: FollowUpsViewProps) {
  const { addLog } = useLogs();
  const {
    whiteLabelConfig,
    followUpTemplate,
    followUpDispatches
  } = useAppData();

  const currentCompanyTemplate = React.useMemo(() => {
    return getCustomizedFollowUpTemplate(whiteLabelConfig);
  }, [whiteLabelConfig]);

  const subject = whiteLabelConfig.isCustomized ? currentCompanyTemplate.subject : followUpTemplate.subject;
  const body = whiteLabelConfig.isCustomized ? currentCompanyTemplate.body : followUpTemplate.body;

  const [copied, setCopied] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<FollowUpDispatch | null>(null);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(true);

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const compName = whiteLabelConfig.isCustomized ? whiteLabelConfig.companyName : "Avantty";

  return (
    <div className="relative space-y-6 pb-12 text-foreground font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00875A]/10 px-2.5 py-0.5 text-xs font-semibold text-[#00875A] border border-[#00875A]/25">
              <Zap className="h-3.5 w-3.5" />
              <span>Instant Automation Active</span>
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Managed SLA: &lt; 500ms Post-Interview
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Instant Post-Interview Follow-Up
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
            Automated executive debrief and next-stage briefing coordination triggered instantly upon interview completion and governance validation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowDemoModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#00875A]/30 bg-[#00875A]/10 px-3.5 py-2 text-xs font-semibold text-[#00875A] hover:bg-[#00875A]/20 transition-colors cursor-pointer shadow-xs"
          >
            <Info className="h-3.5 w-3.5" />
            <span>Demo Notice</span>
          </button>
          <button
            type="button"
            onClick={handleCopyTemplate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer shadow-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#00875A]" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
            <span>{copied ? "Copied" : "Copy Active Copy"}</span>
          </button>
        </div>
      </div>

      {/* Elegant, Non-Intrusive Managed Automation Governance Note */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00875A]/10 text-[#00875A] border border-[#00875A]/20">
            <Shield className="h-4 w-4" />
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-foreground text-sm tracking-tight">
                Avantty Managed Automation Architecture
              </h2>
              <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border">
                Supervised Enterprise Service
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Candidate post-interview communications and agenda follow-ups are fully managed and validated by Avantty. Standard platform users cannot modify live dispatch templates directly; if your firm requires adjustments to copy, variables, or evaluation rules, please contact your designated Avantty Support Partner.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00875A] shrink-0" />
                <span>AI responds dynamically to candidate replies and reschedules within authorized rules.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#080B0A] dark:bg-white shrink-0" />
                <span>Significant commitments, ambiguous candidate queries, or unauthorized stages automatically escalate for human recruiter approval.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Active Template Preview (Read-Only) & Live Dispatch Activity Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Active Template (Read-Only Corporate Standard) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-border bg-card p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#00875A]" />
                <h2 className="text-sm font-semibold text-foreground">
                  Active Dispatch Template
                </h2>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                Read-Only
              </span>
            </div>

            <div className="rounded-xl border border-border bg-secondary/50 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <span className="w-16 font-medium text-muted-foreground">From:</span>
                <span className="font-medium text-foreground">
                  {compName} Executive Search &lt;search@{whiteLabelConfig.website || "avantty.com"}&gt;
                </span>
              </div>

              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <span className="w-16 font-medium text-muted-foreground">To:</span>
                <span className="font-mono text-[11px] text-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                  [Candidate Verified Email]
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-16 font-medium text-muted-foreground shrink-0">Subject:</span>
                <span className="font-semibold text-foreground">
                  {subject}
                </span>
              </div>
            </div>

            <div className="whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed bg-background p-4 rounded-xl border border-border">
              {body}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Managed by Avantty Operations</span>
              <a
                href="mailto:support@avantty.com"
                className="hover:text-[#00875A] transition-colors underline cursor-pointer"
              >
                Contact Support to Modify
              </a>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Dispatch Activity Ledger */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border border-border bg-card p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#00875A]" />
                <h2 className="text-sm font-semibold text-foreground">
                  Live Dispatch Activity Ledger
                </h2>
                <span className="text-[10px] font-mono font-semibold bg-[#00875A]/10 text-[#00875A] px-2 py-0.5 rounded border border-[#00875A]/20">
                  {followUpDispatches.length} Total
                </span>
              </div>

              <span className="text-[11px] text-muted-foreground">
                Automatic trigger upon Meeting Ended
              </span>
            </div>

            {/* Dispatch List */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {followUpDispatches.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No automated follow-up dispatches recorded yet. End an interview in the Meetings module to trigger an instant follow-up.
                </div>
              ) : (
                followUpDispatches.map((dispatch) => {
                  const isSelected = selectedDispatch?.id === dispatch.id;
                  const dateFormatted = new Date(dispatch.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div
                      key={dispatch.id}
                      onClick={() => setSelectedDispatch(isSelected ? null : dispatch)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? "border-[#00875A] bg-[#00875A]/5 ring-1 ring-[#00875A]/20"
                          : "border-border bg-card hover:bg-secondary/60 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#00875A]" />
                          <h3 className="font-semibold text-xs text-foreground">
                            {dispatch.candidateName}
                          </h3>
                          <span className="text-[11px] text-muted-foreground">
                            — {dispatch.role}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {dateFormatted}
                          </span>
                          <span className="rounded bg-[#00875A]/15 text-[#00875A] border border-[#00875A]/30 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                            {dispatch.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">Client: <strong className="text-foreground font-medium">{dispatch.clientCompany}</strong></span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-medium shrink-0">
                          {dispatch.hasNextStageAuthorization ? (
                            <span className="text-[#00875A] flex items-center gap-1">
                              <CalendarCheck className="h-3 w-3" />
                              Next Round Authorized
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Board Governance Review
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expanded View of Dispatched Email */}
                      {isSelected && (
                        <div className="pt-2 mt-2 border-t border-border space-y-2 text-xs">
                          <div className="bg-background p-3 rounded-lg border border-border space-y-1.5">
                            <p className="font-semibold text-foreground text-[11px]">
                              {dispatch.subject}
                            </p>
                            <p className="text-muted-foreground whitespace-pre-wrap text-[11px] leading-relaxed">
                              {dispatch.body}
                            </p>
                          </div>
                          {dispatch.schedulingLink && (
                            <div className="flex items-center justify-between text-[11px] bg-[#00875A]/10 text-[#00875A] p-2 rounded-lg border border-[#00875A]/25">
                              <span>Confidential Scheduling Link:</span>
                              <span className="font-mono underline">{dispatch.schedulingLink}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Demo Notice Pop-Up Dialog */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border space-y-5 text-foreground"
            >
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-border pb-4 pr-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00875A]/10 border border-[#00875A]/25 text-[#00875A]">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      Follow-Ups Service Demo
                    </h2>
                    <span className="rounded bg-[#00875A]/10 text-[#00875A] border border-[#00875A]/25 px-2 py-0.5 text-[10px] font-semibold">
                      Live Simulation
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avantty Managed Post-Interview Follow-Up Service
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                <p>
                  You are viewing the <strong className="text-foreground">Follow-Ups module in Demonstration Mode</strong>. In Avantty's managed enterprise production service, follow-up messages are dispatched autonomously by our server infrastructure within <strong className="text-foreground">&lt; 500ms</strong> of an interview concluding.
                </p>

                <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-2 text-foreground">
                  <div className="flex items-center gap-2 font-semibold text-xs">
                    <Shield className="h-4 w-4 text-[#00875A]" />
                    <span>Avantty Managed Architecture Highlights:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-[11px]">
                    <li><strong className="text-foreground">Autonomous Execution:</strong> No manual email authoring needed. When an interview ends, our system formats and validates the briefing debrief.</li>
                    <li><strong className="text-foreground">Confidential Next-Stage Links:</strong> For qualified candidates, encrypted scheduling tokens for board rounds are inserted automatically.</li>
                    <li><strong className="text-foreground">Demo Safeguard:</strong> In this evaluation environment, outbound emails are captured and recorded in the telemetry ledger below to safeguard external candidate inboxes.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(false)}
                  className="rounded-xl bg-[#00875A] hover:bg-[#00704A] px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
                >
                  Understood & Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
