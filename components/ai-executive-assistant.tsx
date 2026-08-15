"use client";

import React, { useState } from "react";
import { UserRole, ROLE_CONFIGS } from "@/src/types";
import { useLogs } from "@/src/logs-context";
import { Sparkles, Bot, Shield, CheckCircle2, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";

interface AIExecutiveAssistantProps {
  currentRole: UserRole;
  onNavigate?: (page: string) => void;
}

export function AIExecutiveAssistant({ currentRole, onNavigate }: AIExecutiveAssistantProps) {
  const { logs } = useLogs();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");

  const generateRolePriority = (role: UserRole) => {
    switch (role) {
      case "CEO":
        return {
          headline: "Executive Search Partner Focus — C-Suite Placement Mandates & Board Nominations",
          summary: "As Senior Partner / CEO, your immediate focus centers on high-stakes executive placements:",
          items: [
            {
              title: "Approve CEO Placement Dossier — Veloce Health & Bio ($450k Base)",
              desc: "Final board dossier ready for submission. 98% board alignment score. Action needed in Search Candidates.",
              actionPage: "search-candidates",
              actionLabel: "Review Executive Spec & Dossier",
              badge: "Critical Mandate"
            },
            {
              title: "Review 3 C-Suite Candidate Placement Interviews",
              desc: "1 CPO review in progress (Sophia Martinez), 2 upcoming C-level partner syncs scheduled for 04:00 PM and 05:15 PM.",
              actionPage: "meetings",
              actionLabel: "View Meetings Schedule",
              badge: "High Priority"
            },
            {
              title: "Audit Headhunting Placement Ledger & Telemetry",
              desc: "Executive candidate audit trail operating cleanly with encrypted cloud backup.",
              actionPage: "logs",
              actionLabel: "Inspect Audit Ledger",
              badge: "Governance"
            }
          ]
        };
      case "Recruiter":
        return {
          headline: "Executive Search Action Plan — Candidate Vetting & Client Debriefs",
          summary: "As Executive Search Director, your immediate focus centers on board vetting:",
          items: [
            {
              title: "Conduct Managing Director Placement Sync — James O'Connor",
              desc: "Scheduled for 04:00 PM today (Global Infrastructure MD @ Veloce Labs). Assess $75M P&L track record.",
              actionPage: "meetings",
              actionLabel: "Open Meeting Details",
              badge: "Immediate Vetting"
            },
            {
              title: "Deliver VP of Engineering Shortlist to Nexus AI Labs",
              desc: "VP of Engineering search mandate requires 2 additional vetted finalists in client pipeline.",
              actionPage: "search-candidates",
              actionLabel: "View VP Eng Mandate",
              badge: "Client SLA"
            },
            {
              title: "Dispatch Executive Follow-Up & Debrief Dossier",
              desc: "Follow up with client board on Marcus Vance's 09:30 AM CTO placement screening.",
              actionPage: "follow-ups",
              actionLabel: "Go to Follow Ups",
              badge: "Debrief Dispatch"
            }
          ]
        };
      case "Sourcer":
      default:
        return {
          headline: "Executive Sourcing Priority — C-Level Headhunting & Frontier Talent",
          summary: "As Executive Talent Headhunter, your mission is mapping top-tier C-Suite & VP talent:",
          items: [
            {
              title: "Source Chief Revenue Officer for Nexus Enterprise Cloud",
              desc: "Enterprise Cloud CRO search mandate ($600k OTE) requires proven $100M+ ARR enterprise scaling experience.",
              actionPage: "search-candidates",
              actionLabel: "Open CRO Mandate",
              badge: "Urgent Search"
            },
            {
              title: "Map VP of Engineering Talent for Acme FinTech Global",
              desc: "Targeting enterprise fintech leaders with multi-region compliance & distributed systems scale.",
              actionPage: "search-candidates",
              actionLabel: "View Talent Pipeline",
              badge: "High Match"
            },
            {
              title: "Log Candidate Dossiers into Placement Audit Stream",
              desc: "Update executive candidate database and sync vetting transcripts with search ledger.",
              actionPage: "logs",
              actionLabel: "View Activity Logs",
              badge: "Data Stream"
            }
          ]
        };
    }
  };

  const priorityData = generateRolePriority(currentRole);

  const handleRefresh = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  return (
    <Card className="border border-slate-800 bg-slate-900 p-6 shadow-md rounded-2xl text-slate-100 ease-executive">
      <div className="flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-slate-100">
                  AI Strategic Advisor
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Analytical recommendation based on live logs, daily meetings, and candidate specs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isAnalyzing}
            className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin text-slate-400" : ""}`} />
            <span>{isAnalyzing ? "Analyzing..." : "Refresh Insights"}</span>
          </button>
        </div>

        {/* Core Question & Answer Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Bot className="h-4 w-4" />
            <span>Question Analyzed: &quot;¿En qué es lo primero que me tengo que centrar hoy siendo {currentRole}?&quot;</span>
          </div>

          <h3 className="text-sm font-bold text-slate-100 leading-snug">
            {priorityData.headline}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {priorityData.summary}
          </p>

          <div className="space-y-2.5 pt-1">
            {priorityData.items.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-900/90 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">
                      {index + 1}. {item.title}
                    </span>
                    <span className="rounded-md bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.2 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate(item.actionPage)}
                    className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all shadow-xs cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" />
            Real-Time Backend Audit Synchronization Active
          </span>
          <span>Last sync: {lastUpdated}</span>
        </div>
      </div>
    </Card>
  );
}
