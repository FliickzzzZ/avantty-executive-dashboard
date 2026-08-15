"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  Video,
  User,
  ChevronRight,
  X,
  Bot,
  Link as LinkIcon,
  CheckCircle2,
  ChevronDown,
  Trash2,
  SquareCheck,
  Play,
  RotateCcw,
  History,
  FileText,
  Search,
  Building2,
  Sparkles,
  ShieldCheck,
  Share2,
  Download,
  Copy,
  CalendarCheck,
  Send,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLogs } from "@/src/logs-context";
import { useAppData } from "@/src/app-data-context";
import { UserRole } from "@/src/types";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

export interface MeetingItem {
  id: string;
  day: WeekDay;
  time: string;
  candidate: string;
  clientCompany: string;
  role: string;
  interviewer: string;
  status: "completed" | "in-progress" | "upcoming" | "sourced";
  type: string;
  link: string;
  notes: string;
  botStatus: "completed" | "recording" | "ready" | "launched";
  durationSeconds?: number;
  remainingSeconds?: number;

  // Executive Search Evaluation Fields
  currentExecutiveTitle?: string;
  executiveFitScore?: string;
  leadershipArchetype?: string;
  pnlScopeManaged?: string;
  coreStrengths?: string;
  riskFactors?: string;
  placementVerdict?: string;
}

export type WeekDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

const WEEKDAYS: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const INITIAL_MEETINGS_BY_DAY: Record<WeekDay, MeetingItem[]> = {
  Monday: [
    {
      id: "m-mon-1",
      day: "Monday",
      time: "09:30 AM",
      candidate: "Marcus Vance",
      clientCompany: "Veloce Labs",
      role: "Chief Technology Officer (CTO)",
      currentExecutiveTitle: "VP of Global Architecture @ Stripe",
      executiveFitScore: "96/100 - Exceptional Board Readiness",
      leadershipArchetype: "Scale-Up Operator & Distributed Systems Architect",
      pnlScopeManaged: "$48M Engineering Budget / Scaled team from 45 to 210 FTEs",
      coreStrengths: "Led global core payment rails scaling through 99.999% SLA; deep board-level communication credibility; proven track record of hiring VP/Director-level talent.",
      riskFactors: "Expects $420k base + 2.0% equity; needs clear board confirmation on AI infrastructure autonomy.",
      placementVerdict: "STRONG RECOMMENDATION: Advance immediately to Veloce Labs Board of Directors & Lead Partner final interview stage.",
      interviewer: "Sarah Jenkins (Partner)",
      status: "completed",
      type: "Executive Placement Vetting & Architecture Sync",
      link: "https://meet.google.com/mrv-tech-scr",
      notes: "Vetted for CTO placement at Veloce Labs. Demonstrated exceptional board readiness, $48M infrastructure P&L management, and scale from 45 to 210 engineers.",
      botStatus: "completed",
    },
    {
      id: "m-mon-2",
      day: "Monday",
      time: "11:00 AM",
      candidate: "Elena Rostova",
      clientCompany: "Nexus AI Labs",
      role: "VP of Engineering",
      currentExecutiveTitle: "Senior Director of Core Engineering @ Snowflake",
      executiveFitScore: "94/100 - High Board Readiness",
      leadershipArchetype: "Turnaround Specialist & High-Throughput Platform Builder",
      pnlScopeManaged: "$32M R&D P&L / 130 Engineers across US & EU",
      coreStrengths: "Transformed legacy monolithic ingestion pipelines into real-time distributed clusters; reduced cloud operational spend by 38% while scaling to 10M daily queries.",
      riskFactors: "Requires full EU-remote flexibility with quarterly on-site travel to SF headquarters.",
      placementVerdict: "RECOMMENDED FOR PLACEMENT: Highly compatible with Nexus AI Labs' aggressive Q4 scale-up timeline.",
      interviewer: "David Kim (Executive Director)",
      status: "completed",
      type: "Executive Technical Leadership Sync",
      link: "https://meet.google.com/elr-code-int",
      notes: "Evaluated for VP of Engineering placement at Nexus AI Labs. Managed 130+ engineers, high-throughput distributed AI infrastructure, and $32M budget.",
      botStatus: "completed",
    },
    {
      id: "m-mon-3",
      day: "Monday",
      time: "01:15 PM",
      candidate: "Liam Chen",
      clientCompany: "Aura Health",
      role: "Chief Information Security Officer (CISO)",
      currentExecutiveTitle: "Head of Enterprise Security & Cloud Compliance @ Palantir",
      executiveFitScore: "92/100 - Board-Level Security Leader",
      leadershipArchetype: "Enterprise Governance & Zero-Trust Security Strategist",
      pnlScopeManaged: "$25M InfoSec Budget / 55 Security Specialists",
      coreStrengths: "Architected zero-trust security architecture across HIPAA/FDA regulated healthcare pipelines; led 3 clean SOC2 Type II and ISO 27001 audit certifications.",
      riskFactors: "Current retention grant vesting in 6 months; requires $90k sign-on bonus offset.",
      placementVerdict: "ADVANCE TO CLIENT FINAL ROUND: Outstanding strategic security operator ready for executive committee presentation.",
      interviewer: "Alex Rivera (Senior Partner)",
      status: "completed",
      type: "C-Suite Security & Governance Vetting",
      link: "https://meet.google.com/lmc-sys-arch",
      notes: "Vetted for CISO placement at Aura Health. Extensive experience in FDA HIPAA enterprise compliance, zero-trust cloud infrastructure, and M&A diligence.",
      botStatus: "completed",
    },
    {
      id: "m-mon-4",
      day: "Monday",
      time: "02:30 PM",
      candidate: "Sophia Martinez",
      clientCompany: "Krypton Systems",
      role: "Chief Product Officer (CPO)",
      currentExecutiveTitle: "VP of Product Strategy @ Figma",
      executiveFitScore: "95/100 - Product Growth Visionary",
      leadershipArchetype: "Product-Led Growth (PLG) & Enterprise Monetization Architect",
      pnlScopeManaged: "$110M Product Line ARR / 70 Product Managers & Designers",
      coreStrengths: "Scaled flagship B2B enterprise tier from $20M to $110M ARR; spearheaded multi-product monetization strategy; master of enterprise UX and AI-assisted workflows.",
      riskFactors: "Relocation from Austin to NYC required if hybrid mandate exceeds 2 days per week.",
      placementVerdict: "EXCEPTIONAL CANDIDATE: Prioritize immediate partner debrief and present candidate dossier to Krypton Systems CEO.",
      interviewer: "Rachel Adams (Managing Director)",
      status: "in-progress",
      durationSeconds: 1695,
      remainingSeconds: 45,
      type: "Executive Product Strategy & Portfolio Review",
      link: "https://meet.google.com/spm-des-rev",
      notes: "Vetted for CPO placement at Krypton Systems. Led product portfolio generating $110M ARR, managed 70 PMs/designers, and drove post-merger integration.",
      botStatus: "recording",
    },
    {
      id: "m-mon-5",
      day: "Monday",
      time: "04:00 PM",
      candidate: "James O'Connor",
      clientCompany: "Veloce Labs",
      role: "Managing Director, Global Infrastructure",
      currentExecutiveTitle: "Senior Director of Global Cloud Operations @ Cloudflare",
      executiveFitScore: "91/100 - Proven Operational Executive",
      leadershipArchetype: "Global Infrastructure Operator & P&L Manager",
      pnlScopeManaged: "$75M Operational P&L / 120 Site Reliability & Infra Engineers",
      coreStrengths: "Maintained 99.999% uptime across 18 tier-4 data centers worldwide; led $40M hybrid-cloud procurement renegotiation; excellent executive presence.",
      riskFactors: "Demands performance bonus pegged directly to infrastructure margin improvements.",
      placementVerdict: "RECOMMEND ADVANCING: Strong candidate for Veloce Labs managing director placement.",
      interviewer: "Michael Scott (Senior Partner)",
      status: "upcoming",
      type: "Executive Leadership & P&L Alignment Sync",
      link: "https://meet.google.com/joc-cult-fit",
      notes: "Evaluated for Managing Director placement at Veloce Labs. Track record: $75M P&L managed, 24/7 global uptime across 18 data centers, led 120-person org.",
      botStatus: "ready",
    },
    {
      id: "m-mon-6",
      day: "Monday",
      time: "05:15 PM",
      candidate: "Aria Takahashi",
      clientCompany: "Nexus AI Labs",
      role: "Chief AI Officer (CAIO)",
      currentExecutiveTitle: "Research Director & Foundation Models Lead @ Anthropic",
      executiveFitScore: "98/100 - Top Tier AI Pioneer",
      leadershipArchetype: "Frontier AI Researcher & Applied Science Executive",
      pnlScopeManaged: "$60M Supercomputing Compute Budget / 45 Ph.D. Research Scientists",
      coreStrengths: "Published 15+ peer-reviewed papers at NeurIPS/ICLR on LLM reasoning and inference latency reduction; transitioned 4 foundational models to commercial production.",
      riskFactors: "High market demand; receiving competing offers from global AI labs; requires fast decision turnaround from client board.",
      placementVerdict: "TIER-1 PRIORITY CANDIDATE: Execute rapid offer alignment and schedule immediate dinner meeting with Nexus AI Labs Founder & CEO.",
      interviewer: "Naim Ramos (Managing Partner)",
      status: "upcoming",
      type: "Final Executive Partner Placement Sync",
      link: "https://meet.google.com/atk-ai-final",
      notes: "Vetted for Chief AI Officer placement at Nexus AI Labs. Led $60M compute budget, published 15 frontier AI papers, and managed 45 AI research scientists.",
      botStatus: "ready",
    },
  ],
  Tuesday: [
    {
      id: "m-tue-1",
      day: "Tuesday",
      time: "10:00 AM",
      candidate: "Carlos Mendez",
      clientCompany: "Veloce Labs",
      role: "VP of Mobile & Platform Engineering",
      currentExecutiveTitle: "Head of Mobile Platform Engineering @ Uber",
      executiveFitScore: "93/100 - High Board Readiness",
      leadershipArchetype: "High-Scale Consumer Platform Executive",
      pnlScopeManaged: "$28M Mobile R&D Budget / 85 Engineers",
      coreStrengths: "Engineered core mobile platform serving 90M monthly active users with sub-second response times; built global mobile CI/CD automated release pipeline.",
      riskFactors: "Requires board clarity on long-term equity refresh schedule.",
      placementVerdict: "RECOMMENDED FOR PLACEMENT: Advance to client technical committee.",
      interviewer: "David Kim (Executive Director)",
      status: "upcoming",
      type: "Executive Mobile Platform Placement Sync",
      link: "https://meet.google.com/cm-mob-dev",
      notes: "Vetted for VP of Mobile placement at Veloce Labs. Architected mobile platform with 90M MAU, led 85 mobile engineers.",
      botStatus: "ready",
    },
  ],
  Wednesday: [],
  Thursday: [],
  Friday: [],
};

interface MeetingsViewProps {
  currentRole?: UserRole;
}

export function MeetingsView({ currentRole = "CEO" }: MeetingsViewProps) {
  const { addLog } = useLogs();
  const {
    meetingsByDay,
    setMeetingsByDay,
    deletedMeetingsBuffer,
    sourceMeeting,
    restoreLastMeeting,
    restoreMeetingById,
    deleteMeetingPermanently,
    revertAllMeetings,
    focusedMeetingId,
    setFocusedMeetingId
  } = useAppData();

  const [selectedDay, setSelectedDay] = useState<WeekDay>("Monday");

  // Modal Master-Detail Ledger state
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
  const [ledgerTab, setLedgerTab] = useState<"active" | "logs">("active");

  // Meeting Follow-Up Actions Modals state
  const [isBoardSynthesisModalOpen, setIsBoardSynthesisModalOpen] = useState(false);
  const [isSchedulePresentationOpen, setIsSchedulePresentationOpen] = useState(false);
  const [synthesisCopiedToast, setSynthesisCopiedToast] = useState(false);
  const [scheduleSentToast, setScheduleSentToast] = useState(false);

  // Lock background scroll when modal is open
  useLockBodyScroll(isLedgerModalOpen || isBoardSynthesisModalOpen || isSchedulePresentationOpen);

  // Handle direct opening from Global Search
  useEffect(() => {
    if (!focusedMeetingId) return;

    let foundMeeting: MeetingItem | null = null;
    let foundDay: WeekDay = "Monday";
    for (const [dayKey, dayMeetings] of Object.entries(meetingsByDay) as [WeekDay, MeetingItem[]][]) {
      const m = dayMeetings.find((item) => item.id === focusedMeetingId);
      if (m) {
        foundMeeting = m;
        foundDay = dayKey;
        break;
      }
    }

    if (foundMeeting) {
      setSelectedDay(foundDay);
      setSelectedMeeting(foundMeeting);
      setLedgerTab(foundMeeting.status === "completed" || deletedMeetingsBuffer.some(d => d.id === foundMeeting?.id) ? "logs" : "active");
      setIsLedgerModalOpen(true);
    }

    setFocusedMeetingId(null);
  }, [focusedMeetingId, meetingsByDay, deletedMeetingsBuffer, setFocusedMeetingId]);

  const [meetingUrl, setMeetingUrl] = useState("");
  const [botNotification, setBotNotification] = useState<string | null>(null);

  // Animation states
  const [fadingCountdownIds, setFadingCountdownIds] = useState<string[]>([]);
  const [slidingSourcedIds, setSlidingSourcedIds] = useState<string[]>([]);

  // Live Timer ticker
  const [liveSeconds, setLiveSeconds] = useState(1695);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSeconds((prev) => prev + 1);

      setMeetingsByDay((prevRecord) => {
        let hasChanges = false;
        const nextRecord: Record<WeekDay, MeetingItem[]> = { ...prevRecord };

        Object.keys(nextRecord).forEach((dayKey) => {
          const day = dayKey as WeekDay;
          const updatedList = nextRecord[day].map((item) => {
            if (item.status === "in-progress" && typeof item.remainingSeconds === "number" && item.remainingSeconds > 0) {
              hasChanges = true;
              return { ...item, remainingSeconds: item.remainingSeconds - 1 };
            }
            return item;
          });
          if (hasChanges) {
            nextRecord[day] = updatedList;
          }
        });

        return hasChanges ? nextRecord : prevRecord;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setMeetingsByDay]);

  // Handle meeting auto-completion when countdown reaches 00:00
  useEffect(() => {
    Object.keys(meetingsByDay).forEach((dayKey) => {
      const day = dayKey as WeekDay;
      const dayList = meetingsByDay[day] || [];
      dayList.forEach((item) => {
        if (
          item.status === "in-progress" &&
          item.remainingSeconds === 0 &&
          !fadingCountdownIds.includes(item.id)
        ) {
          setFadingCountdownIds((fading) => [...fading, item.id]);

          setTimeout(() => {
            setMeetingsByDay((curr) => ({
              ...curr,
              [day]: curr[day].filter((m) => m.id !== item.id),
            }));
            setFadingCountdownIds((fading) => fading.filter((id) => id !== item.id));

            addLog({
              category: "Meeting Bot",
              action: "Meeting Session Auto-Completed (00:00 Countdown)",
              details: `Meeting session with candidate ${item.candidate} (${item.clientCompany}) reached 00:00 countdown and was automatically archived.`,
              level: "info",
            });
          }, 500);
        }
      });
    });
  }, [meetingsByDay, fadingCountdownIds, addLog, setMeetingsByDay]);

  const formatCountdown = (totalSec?: number) => {
    if (typeof totalSec !== "number") return "00:00";
    if (totalSec <= 0) return "00:00";
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeDayMeetings = meetingsByDay[selectedDay] || [];
  const allActiveMeetings: MeetingItem[] = (Object.values(meetingsByDay) as MeetingItem[][]).flat();
  const totalActiveMeetingsCount = allActiveMeetings.length;

  const handleLaunchBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingUrl.trim()) return;

    const newMeeting: MeetingItem = {
      id: `m-bot-${Date.now()}`,
      day: selectedDay,
      time: "Just Now",
      candidate: "Ad-hoc Meeting Candidate",
      clientCompany: "Avantty Internal",
      role: "Custom Meeting Session",
      interviewer: "AI Bot Agent",
      status: "in-progress",
      durationSeconds: 60,
      type: "Bot Recording Session",
      link: meetingUrl.trim(),
      notes: `Bot launched via custom link on ${selectedDay}. Currently capturing live audio and transcript.`,
      botStatus: "launched",
    };

    setMeetingsByDay((prev) => ({
      ...prev,
      [selectedDay]: [newMeeting, ...prev[selectedDay]],
    }));

    addLog({
      category: "Meeting Bot",
      action: `Launched Meeting Bot Agent`,
      details: `Recording link: ${meetingUrl.trim()} scheduled for ${selectedDay}`,
      level: "action"
    });

    setBotNotification(`Bot launched for ${selectedDay}: ${meetingUrl.trim()}`);
    setMeetingUrl("");

    setTimeout(() => {
      setBotNotification(null);
    }, 4000);
  };

  const handleEndSessionAndArchive = (meetingId: string) => {
    const target = activeDayMeetings.find((m) => m.id === meetingId);
    if (!target) return;

    setMeetingsByDay((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map((m) =>
        m.id === meetingId ? { ...m, status: "completed", botStatus: "completed" } : m
      ),
    }));

    if (selectedMeeting?.id === meetingId) {
      setSelectedMeeting((prev) => (prev ? { ...prev, status: "completed", botStatus: "completed" } : null));
    }

    addLog({
      category: "Meeting Bot",
      action: `Ended Session & Archived Meeting`,
      details: `Meeting with ${target.candidate} marked as completed and archived to audit logs.`,
      level: "success"
    });
  };

  // Mark as ended / sourced: updates state
  const handleMarkAsMeetingEnded = (meetingId: string, fromModal: boolean = false) => {
    if (!fromModal) {
      setSlidingSourcedIds((prev) => [...prev, meetingId]);
    }

    sourceMeeting(meetingId, currentRole, selectedDay);

    if (fromModal) {
      // In modal Active Profiles: reset detail view selection
      setSelectedMeeting(null);
    } else {
      if (selectedMeeting?.id === meetingId) {
        setSelectedMeeting(null);
      }
      setTimeout(() => {
        setSlidingSourcedIds((prev) => prev.filter((id) => id !== meetingId));
      }, 300);
    }
  };

  // Revert meeting action: restores meeting from logs to active and auto-selects next log
  const handleRevertMeeting = (meetingId: string) => {
    const currentIdx = deletedMeetingsBuffer.findIndex((m) => m.id === meetingId);
    const remainingBuffer = deletedMeetingsBuffer.filter((m) => m.id !== meetingId);
    let nextMeeting: MeetingItem | null = null;
    if (remainingBuffer.length > 0) {
      nextMeeting = remainingBuffer[currentIdx] || remainingBuffer[remainingBuffer.length - 1] || remainingBuffer[0];
    }
    restoreMeetingById(meetingId, currentRole);
    setSelectedMeeting(nextMeeting);
  };

  // Permanently delete meeting from logs and auto-select next log
  const handlePermanentDeleteMeeting = (meetingId: string) => {
    const currentIdx = deletedMeetingsBuffer.findIndex((m) => m.id === meetingId);
    const remainingBuffer = deletedMeetingsBuffer.filter((m) => m.id !== meetingId);
    let nextMeeting: MeetingItem | null = null;
    if (remainingBuffer.length > 0) {
      nextMeeting = remainingBuffer[currentIdx] || remainingBuffer[remainingBuffer.length - 1] || remainingBuffer[0];
    }
    deleteMeetingPermanently(meetingId, currentRole);
    setSelectedMeeting(nextMeeting);
  };

  const handleRecoverLastMeeting = () => {
    restoreLastMeeting(selectedDay);
  };

  // Check if a meeting is in the finded/logs buffer
  const isFindedMeeting = (meetingId: string) => {
    return deletedMeetingsBuffer.some((m) => m.id === meetingId);
  };

  const isSelectedMeetingFinded = selectedMeeting
    ? isFindedMeeting(selectedMeeting.id) || selectedMeeting.status === "sourced"
    : false;

  // Sidebar list for modal Master-Detail view
  const modalSidebarList = ledgerTab === "active" ? allActiveMeetings : deletedMeetingsBuffer;

  return (
    <div className="relative flex flex-col gap-6 text-slate-900 dark:text-slate-100">
      {/* Top Header Card (Without the removed active schedules/logs pill tabs) */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm rounded-2xl">
        <div className="flex flex-col gap-5">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs">
                <CalendarDays className="h-5 w-5 text-white dark:text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                  SCHEDULED INTERVIEW SESSIONS
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time interview tracking, dynamic session recording, and automated candidate sourcing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {deletedMeetingsBuffer.length > 0 && (
                <button
                  type="button"
                  onClick={() => revertAllMeetings(currentRole)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Revert All ({deletedMeetingsBuffer.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleRecoverLastMeeting}
                disabled={deletedMeetingsBuffer.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Restore Last Action</span>
              </button>
            </div>
          </div>

          {/* Weekday Selector */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5">
              {WEEKDAYS.map((day) => {
                const count = (meetingsByDay[day] || []).length;
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs font-bold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700"
                    }`}
                  >
                    <span>{day}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                      isSelected ? "bg-white/20 dark:bg-black/20 text-white font-bold" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Launch Bot Card */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl p-5">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-slate-700">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Launch Meeting Bot ({selectedDay})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deploy an automated recording & transcription agent for {selectedDay}
              </p>
            </div>
          </div>

          <form onSubmit={handleLaunchBot} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <LinkIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij or Zoom link..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-500 cursor-pointer"
            >
              <Bot className="h-4 w-4" />
              <span>Launch Bot</span>
            </button>
          </form>

          {botNotification && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 p-3 text-xs font-medium text-emerald-800 dark:text-emerald-200"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{botNotification}</span>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Active Meetings Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeDayMeetings.length === 0 ? (
          <div className="col-span-full">
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center rounded-2xl space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <CalendarDays className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  No hay reuniones programadas para el {selectedDay}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  La agenda para {selectedDay} está libre. Puedes desplegar un bot con un enlace de reunión arriba.
                </p>
              </div>
            </Card>
          </div>
        ) : (
          activeDayMeetings.map((meeting) => {
            const isFading = fadingCountdownIds.includes(meeting.id);
            const isSliding = slidingSourcedIds.includes(meeting.id);
            const isFinded = isFindedMeeting(meeting.id);

            return (
              <motion.div
                key={meeting.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`${
                  isFading
                    ? "opacity-0 transition-opacity duration-500 pointer-events-none"
                    : isSliding
                    ? "translate-x-full opacity-0 transition-all duration-300 pointer-events-none"
                    : ""
                }`}
              >
                <Card
                  onClick={() => {
                    setLedgerTab("active");
                    setSelectedMeeting(meeting);
                    setIsLedgerModalOpen(true);
                  }}
                  className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer rounded-2xl shadow-xs hover:shadow-md flex flex-col justify-between group overflow-hidden"
                >
                  <div className="p-5 space-y-3">
                    {/* Top Metadata Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {meeting.clientCompany}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {meeting.time}
                      </span>
                    </div>

                    {/* Candidate Name & Role */}
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                        {meeting.candidate}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {meeting.role}
                      </p>
                    </div>

                    {/* Current Executive Title & Placement */}
                    {meeting.currentExecutiveTitle && (
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                        Current: <span className="text-slate-700 dark:text-slate-300 font-semibold">{meeting.currentExecutiveTitle}</span>
                      </div>
                    )}

                    {/* Session Type / Purpose */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 line-clamp-2 leading-relaxed">
                      <strong>Focus:</strong> {meeting.notes || meeting.type}
                    </div>
                  </div>

                  {/* Card Footer: Action Button & View Full Spec */}
                  <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isFinded) {
                          handleRevertMeeting(meeting.id);
                        } else {
                          handleMarkAsMeetingEnded(meeting.id, false);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        isFinded
                          ? "bg-rose-600 hover:bg-rose-500 text-white"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {isFinded ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Revert</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Meeting Ended</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                      <span className="text-[11px] font-semibold">View Full Spec</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Master-Detail Modal: MEETINGS LEDGER & RECOVERY HUB */}
      <AnimatePresence>
        {isLedgerModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 p-2 sm:p-6 backdrop-blur-sm min-h-screen overflow-hidden overscroll-none select-none"
            onWheel={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-5xl h-[88vh] rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-colors"
            >
              {/* Modal Top Header Bar */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                        Executive Placement & Candidate Evaluation
                      </h2>
                      <span className="text-[10px] font-mono font-black text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase border border-slate-300/60 dark:border-slate-700">
                        Executive Search Dossier
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Executive Search Candidate Vetting, Board Readiness & Placement Synthesis
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsLedgerModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body: 2 Columns Split Layout */}
              <div className="flex-1 flex overflow-hidden">
                {/* LEFT COLUMN: MEETINGS AUDIT LEDGER SIDEBAR */}
                <div className="w-72 sm:w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex flex-col shrink-0 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        EXECUTIVE SEARCH SESSIONS
                      </span>
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>

                    {/* Pill Tabs: Active Profiles vs Logs in Left Sidebar */}
                    <div className="inline-flex w-full p-1 bg-slate-200/70 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setLedgerTab("active");
                          const firstActive = allActiveMeetings[0] || null;
                          setSelectedMeeting(firstActive);
                        }}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          ledgerTab === "active"
                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <span>Active Profiles</span>
                        <span className={`font-mono text-[10px] font-black px-1.5 py-0.2 rounded ${
                          ledgerTab === "active" ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                          {totalActiveMeetingsCount}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLedgerTab("logs");
                          const firstLog = deletedMeetingsBuffer[0] || null;
                          setSelectedMeeting(firstLog);
                        }}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          ledgerTab === "logs"
                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <span>Logs</span>
                        <span className={`font-mono text-[10px] font-black px-1.5 py-0.2 rounded ${
                          deletedMeetingsBuffer.length > 0 ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                          {deletedMeetingsBuffer.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Left Sidebar List of Meetings */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {ledgerTab === "logs" && deletedMeetingsBuffer.length > 0 && (
                      <div className="pb-1">
                        <button
                          type="button"
                          onClick={() => {
                            revertAllMeetings(currentRole);
                            setSelectedMeeting(null);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Revert All Logs ({deletedMeetingsBuffer.length})</span>
                        </button>
                      </div>
                    )}
                    {modalSidebarList.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 italic">
                        {ledgerTab === "logs"
                          ? "No hay registros en los logs todavía. Marca una reunión como 'Meeting Ended' para verla aquí."
                          : "No hay reuniones activas."}
                      </div>
                    ) : (
                      modalSidebarList.map((m) => {
                        const isSelected = selectedMeeting?.id === m.id;
                        const isFinded = isFindedMeeting(m.id);

                        return (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMeeting(m)}
                            className={`w-full text-left p-3 rounded-xl transition-all border cursor-pointer ${
                              isSelected
                                ? "bg-white dark:bg-slate-800 border-slate-400/80 dark:border-slate-500 shadow-sm ring-1 ring-slate-400/20 text-slate-900 dark:text-white"
                                : "bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/60 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className={`h-2 w-2 rounded-full shrink-0 ${
                                  isFinded ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
                                }`} />
                                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                  {m.clientCompany}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] font-extrabold text-slate-500 dark:text-slate-400 shrink-0">
                                {m.day}
                              </span>
                            </div>

                            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1 truncate">
                              {m.candidate} — {m.role}
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px]">
                              <span className="text-slate-500 dark:text-slate-400 font-mono">
                                {m.time}
                              </span>
                              {isFinded ? (
                                <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 font-black px-1.5 py-0.2 rounded uppercase text-[9px]">
                                  FINDED
                                </span>
                              ) : (
                                <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 font-black px-1.5 py-0.2 rounded uppercase text-[9px]">
                                  {m.status.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: FULL DETAILED SECTIONS OR BLANK/EMPTY STATE */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                  {!selectedMeeting ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <FileText className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        No candidate evaluation selected
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                        Select an executive meeting from the ledger sidebar on the left to view the candidate placement analysis.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Header of Detail Panel */}
                      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 shrink-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                              TARGET CLIENT COMPANY
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                              {selectedMeeting.clientCompany}
                            </h1>
                          </div>
                          <span className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                            {selectedMeeting.day} • {selectedMeeting.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-extrabold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                            {selectedMeeting.role}
                          </span>

                          {isSelectedMeetingFinded ? (
                            <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-black border border-emerald-200 dark:border-emerald-800 uppercase tracking-wide">
                              FINDED
                            </span>
                          ) : (
                            <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-black border border-emerald-200 dark:border-emerald-800 uppercase tracking-wide">
                              {selectedMeeting.status.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scrollable Structured Sections: CANDIDATE EVALUATION & PLACEMENT */}
                      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                        
                        {/* 1. CANDIDATE & TARGET PLACEMENT */}
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider">
                            <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            <span>1. CANDIDATE & TARGET PLACEMENT</span>
                          </div>
                          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            <p><strong>Candidate Name:</strong> <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedMeeting.candidate}</span></p>
                            <p><strong>Target Role & Client Company:</strong> <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedMeeting.role} @ {selectedMeeting.clientCompany}</span></p>
                            <p><strong>Current Executive Title:</strong> <span className="font-mono text-slate-800 dark:text-slate-200">{selectedMeeting.currentExecutiveTitle || "Senior Executive / VP Level"}</span></p>
                            <p><strong>Lead Executive Partner:</strong> {selectedMeeting.interviewer}</p>
                          </div>
                        </div>

                        {/* 2. EXECUTIVE COMPETENCY & IMPACT */}
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider">
                            <ShieldCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            <span>2. EXECUTIVE COMPETENCY & IMPACT</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Executive Fit Score</span>
                              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                                {selectedMeeting.executiveFitScore || "94/100 - High Board Readiness"}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Leadership Archetype</span>
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {selectedMeeting.leadershipArchetype || "Scale-Up Operator & Platform Architect"}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">P&L / Scope Managed</span>
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {selectedMeeting.pnlScopeManaged || "$35M+ P&L / 100+ Team"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 3. AI MEETING SYNTHESIS & ACTIONS */}
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shadow-xs space-y-3">
                          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider">
                            <Sparkles className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            <span>3. AI MEETING SYNTHESIS & PLACEMENT VERDICT</span>
                          </div>
                          
                          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                            <div>
                              <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">Core Strengths:</strong>
                              <p className="leading-relaxed">
                                {selectedMeeting.coreStrengths || "Demonstrated exceptional enterprise scaling capability, board-level technical communication, and strategic revenue impact."}
                              </p>
                            </div>

                            <div>
                              <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">Risk Factors:</strong>
                              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                                {selectedMeeting.riskFactors || "Compensation & equity expectations require final alignment with client compensation committee."}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                              <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">Placement Verdict:</strong>
                              <p className="font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                {selectedMeeting.placementVerdict || "RECOMMENDED: Advance candidate to client board evaluation round."}
                              </p>
                            </div>

                            {/* Action Buttons: Meeting Follow-up Options */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => setIsBoardSynthesisModalOpen(true)}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-3.5 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <FileText className="h-4 w-4" />
                                <span>Export Board-Ready Synthesis</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsSchedulePresentationOpen(true)}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 px-3.5 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <CalendarCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Schedule Client Presentation Round</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 4. SESSION LOGISTICS & VIDEO RECORDING */}
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider">
                            <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            <span>4. SESSION LOGISTICS & RECORDING</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Scheduled Day & Time</span>
                              <span className="font-bold text-slate-900 dark:text-white">{selectedMeeting.day} at {selectedMeeting.time}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Session Type</span>
                              <span className="font-semibold text-slate-900 dark:text-white">{selectedMeeting.type}</span>
                            </div>
                            <div className="col-span-full">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Meeting Video Link</span>
                              <a
                                href={selectedMeeting.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-slate-800 dark:text-slate-200 underline hover:text-slate-950 dark:hover:text-white"
                              >
                                {selectedMeeting.link}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* 5. BOT RECORDING & TELEMETRY */}
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider">
                            <Bot className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            <span>5. BOT RECORDING & AI TRANSCRIPT STATUS</span>
                          </div>
                          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                            <p><strong>Bot Status:</strong> <span className="font-mono text-slate-900 dark:text-white font-bold uppercase">{selectedMeeting.botStatus}</span></p>
                            <p><strong>Audio Capture:</strong> High-Fidelity 48kHz WAV audio stream synced with encrypted cloud backup.</p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Footer Action Bar */}
                      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">
                            {isSelectedMeetingFinded
                              ? "Executive placement candidate recorded in firm audit ledger."
                              : "Transmits executive evaluation telemetry to search placement pipeline."}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setIsLedgerModalOpen(false)}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            Close
                          </button>

                          {ledgerTab === "logs" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handlePermanentDeleteMeeting(selectedMeeting.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRevertMeeting(selectedMeeting.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
                              >
                                <RotateCcw className="h-4 w-4" />
                                <span>Revert Action</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkAsMeetingEnded(selectedMeeting.id, true)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Meeting Ended</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 1: EXPORT BOARD-READY SYNTHESIS BRIEF */}
      <AnimatePresence>
        {isBoardSynthesisModalOpen && selectedMeeting && (
          <div
            className="fixed inset-0 z-[120] overflow-y-auto bg-black/60 dark:bg-slate-950/80 p-4 backdrop-blur-md flex items-center justify-center min-h-screen overscroll-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsBoardSynthesisModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl my-auto max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Board-Ready Executive Synthesis</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Structured dossier for {selectedMeeting.clientCompany} Search Committee</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBoardSynthesisModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {synthesisCopiedToast && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Board synthesis copied to clipboard in executive briefing markdown format.</span>
                </div>
              )}

              {/* Dossier Body */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex justify-between">
                  <span className="font-bold text-slate-500">MANDATE SPECIFICATION</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedMeeting.role} @ {selectedMeeting.clientCompany}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">EXECUTIVE CANDIDATE</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedMeeting.candidate}</span>
                  <span className="text-slate-500 block text-[11px]">{selectedMeeting.currentExecutiveTitle}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-500 text-[10px] block">BOARD READINESS SCORE</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedMeeting.executiveFitScore || "94/100 (Certified)"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">P&L SCALE MANAGED</span>
                    <span className="font-bold">{selectedMeeting.pnlScopeManaged || "$35M+ Budget"}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-500 block mb-1">CORE BOARD VALUE PROPOSITION</span>
                  <p className="text-slate-700 dark:text-slate-300 font-sans leading-relaxed text-xs">
                    {selectedMeeting.coreStrengths}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-500 block mb-1">SEARCH COMMITTEE NOMINATION VERDICT</span>
                  <p className="text-slate-900 dark:text-white font-sans font-semibold text-xs bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    {selectedMeeting.placementVerdict}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Avantty Executive Dossier Standard</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `# Executive Search Committee Synthesis\n**Client**: ${selectedMeeting.clientCompany}\n**Role**: ${selectedMeeting.role}\n**Candidate**: ${selectedMeeting.candidate}\n**Fit Score**: ${selectedMeeting.executiveFitScore || "94/100"}\n**Verdict**: ${selectedMeeting.placementVerdict}\n**Strengths**: ${selectedMeeting.coreStrengths}`;
                      navigator.clipboard.writeText(text);
                      setSynthesisCopiedToast(true);
                      setTimeout(() => setSynthesisCopiedToast(false), 2500);
                      addLog({
                        category: "Meetings",
                        action: `Exported Board Synthesis: ${selectedMeeting.candidate}`,
                        details: `Generated Board Search Committee brief for ${selectedMeeting.clientCompany}`,
                        level: "action",
                        userRole: currentRole
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Board Brief</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSynthesisCopiedToast(true);
                      setTimeout(() => setSynthesisCopiedToast(false), 2500);
                      addLog({
                        category: "Meetings",
                        action: `Downloaded Board PDF Dossier: ${selectedMeeting.candidate}`,
                        details: `Exported white-labeled PDF package for client Search Committee`,
                        level: "action",
                        userRole: currentRole
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Dossier PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: SCHEDULE CLIENT PRESENTATION ROUND */}
      <AnimatePresence>
        {isSchedulePresentationOpen && selectedMeeting && (
          <div
            className="fixed inset-0 z-[120] overflow-y-auto bg-black/60 dark:bg-slate-950/80 p-4 backdrop-blur-md flex items-center justify-center min-h-screen overscroll-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsSchedulePresentationOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl my-auto max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CalendarCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Schedule Client Presentation Round</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Board / CEO Calendar Coordination</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSchedulePresentationOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {scheduleSentToast ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Presentation Round Dispatched!
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Calendar invitations sent to {selectedMeeting.candidate} and {selectedMeeting.clientCompany} Search Committee board members.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">CLIENT HIRING COMMITTEE</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedMeeting.clientCompany} (Board & CEO)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">CANDIDATE</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedMeeting.candidate} ({selectedMeeting.role})</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Proposed Presentation Date & Time Slot</label>
                    <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-semibold">
                      <option>Thursday, Next Week @ 02:00 PM EST (Board Preferred)</option>
                      <option>Friday, Next Week @ 10:00 AM EST</option>
                      <option>Monday, Following Week @ 04:00 PM EST</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Presentation Round Format</label>
                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs">
                      60-Minute Executive Session: 20 min Vision & P&L Pitch, 30 min Board Q&A, 10 min Closed Search Committee Deliberation.
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSchedulePresentationOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Close
                </button>
                {!scheduleSentToast && (
                  <button
                    type="button"
                    onClick={() => {
                      setScheduleSentToast(true);
                      addLog({
                        category: "Meetings",
                        action: `Scheduled Client Presentation: ${selectedMeeting.candidate}`,
                        details: `Dispatched Search Committee calendar invitation for ${selectedMeeting.role} @ ${selectedMeeting.clientCompany}`,
                        level: "action",
                        userRole: currentRole
                      });
                      setTimeout(() => {
                        setIsSchedulePresentationOpen(false);
                        setScheduleSentToast(false);
                      }, 2000);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Dispatch Board Calendar Invites</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
