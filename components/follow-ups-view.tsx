import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Mail,
  Sparkles,
  Copy,
  Check,
  Clock,
  Edit3,
  Bot,
  Zap,
  CheckCircle2,
  Shield,
  RotateCcw,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLogs } from "@/src/logs-context";
import { useAppData, getCustomizedFollowUpTemplate } from "@/src/app-data-context";
import { UserRole } from "@/src/types";

interface FollowUpsViewProps {
  currentRole?: UserRole;
}

export function FollowUpsView({ currentRole = "CEO" }: FollowUpsViewProps) {
  const { addLog } = useLogs();
  const {
    whiteLabelConfig,
    followUpTemplate,
    updateFollowUpTemplate,
    restoreLastFollowUpTemplate,
    templateBuffer,
    registerDeletionAction
  } = useAppData();

  const currentCompanyTemplate = React.useMemo(() => {
    return getCustomizedFollowUpTemplate(whiteLabelConfig);
  }, [whiteLabelConfig]);

  // Editable Subject & Body
  const [subject, setSubject] = useState<string>(() => {
    if (whiteLabelConfig.isCustomized) return currentCompanyTemplate.subject;
    return followUpTemplate.subject;
  });
  const [body, setBody] = useState<string>(() => {
    if (whiteLabelConfig.isCustomized) return currentCompanyTemplate.body;
    return followUpTemplate.body;
  });

  React.useEffect(() => {
    if (whiteLabelConfig.isCustomized) {
      setSubject(currentCompanyTemplate.subject);
      setBody(currentCompanyTemplate.body);
    } else {
      setSubject(followUpTemplate.subject);
      setBody(followUpTemplate.body);
    }
  }, [followUpTemplate, whiteLabelConfig, currentCompanyTemplate]);

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Autonomous Follow Ups State
  const [autonomousFollowUps, setAutonomousFollowUps] = useState<boolean>(() => {
    return localStorage.getItem("avantty_autonomous_followups") !== "false";
  });

  const handleToggleAutonomous = () => {
    const nextValue = !autonomousFollowUps;
    setAutonomousFollowUps(nextValue);
    localStorage.setItem("avantty_autonomous_followups", String(nextValue));

    addLog({
      category: "Follow Ups",
      action: `Autonomous Follow-Ups ${nextValue ? "Enabled" : "Disabled"}`,
      details: nextValue
        ? "AI will automatically send this follow-up template to all interviewed candidates 10 minutes post-interview."
        : "Autonomous follow-up email dispatch paused.",
      level: "action"
    });
  };

  const handleSaveTemplate = () => {
    updateFollowUpTemplate({ subject, body }, currentRole);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);

    addLog({
      category: "Follow Ups",
      action: "Updated Follow-Up Template",
      details: `Customized email template for ${whiteLabelConfig.companyName} post-interview dispatches.`,
      level: "info"
    });
  };

  const handleResetDefault = () => {
    const isLockout = registerDeletionAction(currentRole);
    if (isLockout) return;

    const tpl = getCustomizedFollowUpTemplate(whiteLabelConfig);
    updateFollowUpTemplate(tpl, currentRole);
    setSubject(tpl.subject);
    setBody(tpl.body);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAIRegenerate = () => {
    setIsGenerating(true);
    const comp = whiteLabelConfig.isCustomized ? whiteLabelConfig.companyName : "Avantty";
    const web = whiteLabelConfig.isCustomized ? whiteLabelConfig.website : "avantty.com";

    setTimeout(() => {
      setSubject(`Executive Search Debrief & Next Steps — [Interview Role] with ${comp}`);
      setBody(
`Dear [Candidate Name],

Thank you for participating in our executive briefing today regarding the [Interview Role] placement with ${comp}.

Our Senior Partners thoroughly enjoyed reviewing your career trajectory and domain expertise. Following today's session with [Interviewer Name], our team is synthesizing your dossier for presentation to the Client Nomination Board.

As a next step, our executive team will coordinate directly with you regarding next evaluation stages and debrief scheduling within 24–48 hours.

If you have any questions in the meantime or additional materials to share, please feel free to reply directly to this email.

Best regards,
The ${comp} Executive Search Team
https://${web}`);
      setIsGenerating(false);

      addLog({
        category: "Follow Ups",
        action: `AI Refined Follow-Up Template for ${comp}`,
        details: "Generated optimized universal post-interview follow-up message structure.",
        level: "info"
      });
    }, 600);
  };

  // Pop-up modal state for Follow Ups explanation
  const [showDemoModal, setShowDemoModal] = useState<boolean>(true);

  return (
    <div className="relative space-y-6 pb-12 text-slate-900 dark:text-slate-100">
      {/* Follow Ups Protocol Note Pop-up with Glassmorphism Backdrop Blur */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/65 backdrop-blur-xl p-4 transition-all">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0E1016] border border-slate-200 dark:border-white/12 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 transition-colors"
            >
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Demo Environment Note</h3>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    Automated Follow-Up Control Protocol
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#08090E] p-4 space-y-2">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  This section is almost 100% a demo, as you will only be able to stop the automated sending from here, because this section will automatically run only once we have agreed on a generic template.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>Acknowledge and Continue</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Template for Follow Ups
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Universal post-interview email template automatically dispatched by AI to all candidates <span className="font-semibold text-slate-700 dark:text-slate-200">10 minutes after their interview ends</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={restoreLastFollowUpTemplate}
            disabled={templateBuffer.length === 0}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 text-slate-500" />
            <span>Restore Last Action</span>
          </button>

          <button
            type="button"
            onClick={handleToggleAutonomous}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              autonomousFollowUps
                ? "border-slate-400/80 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div
              className={`flex h-4 w-4 items-center justify-center rounded transition-colors ${
                autonomousFollowUps
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-950 text-transparent"
              }`}
            >
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
            <div className="flex flex-col items-start text-left">
              <div className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span>Autonomous Follow Ups</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {autonomousFollowUps ? "Active (Sends 10m post-interview)" : "Disabled (Manual mode)"}
              </span>
            </div>
          </button>
        </div>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Email Dispatch Template
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize variables like [Candidate Name] or [Interview Role] to personalize automated messages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSubject(followUpTemplate.subject);
                    setBody(followUpTemplate.body);
                    setIsEditing(false);
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 px-4 py-1.5 text-xs font-bold text-white dark:text-slate-900 transition-all shadow-xs cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Save Template</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Template</span>
              </button>
            )}
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Template saved successfully! AI will use this text for all future candidate follow-ups.</span>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 md:p-6 space-y-4 shadow-xs">
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-16 font-bold uppercase text-slate-500">To:</span>
              <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700">
                [Candidate Email]
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-16 font-bold uppercase text-slate-500">From:</span>
              <span className="text-slate-900 dark:text-slate-200 font-medium">
                Avantty Executive Search &lt;search@avantty.com&gt;
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="w-16 font-bold uppercase text-slate-500">Subject:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500"
                />
              ) : (
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {subject}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2">
            {isEditing ? (
              <textarea
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 leading-relaxed"
              />
            ) : (
              <div className="whitespace-pre-wrap text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                {body}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Bot className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              <span>AI Engine ready for automated dispatch 10 minutes post-interview</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefault}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 underline px-2 py-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>

        </div>

      </Card>
    </div>
  );
}
