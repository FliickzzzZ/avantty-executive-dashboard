import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot,
  Send,
  X,
  User,
  CheckCircle2,
  Zap,
  GripHorizontal,
  ChevronRight,
  Calendar,
  Users,
  Mail,
  ScrollText
} from "lucide-react";
import { UserRole } from "@/src/types";
import { useAppData } from "@/src/app-data-context";
import { useLogs } from "@/src/logs-context";
import { WeekDay } from "@/components/meetings-view";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  actionPayload?: {
    type: "source_candidate" | "restore_meeting" | "restore_candidate" | "switch_role_ceo";
    label: string;
    targetId?: string;
  };
  navigationTarget?: {
    page: string;
    label: string;
  };
  actionConfirmed?: boolean;
}

interface AIAssistantChatbotProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onSelectPage?: (page: string) => void;
}

// Formats **bold** and *italic* markdown tags into real React elements
const renderFormattedText = (rawText: string, isUserMessage: boolean = false) => {
  const lines = rawText.split("\n");

  return lines.map((line, lineIdx) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);

      let firstMatch: { index: number; length: number; content: string; type: "bold" | "italic" } | null = null;

      if (boldMatch && boldMatch.index !== undefined) {
        firstMatch = {
          index: boldMatch.index,
          length: boldMatch[0].length,
          content: boldMatch[1],
          type: "bold"
        };
      }

      if (italicMatch && italicMatch.index !== undefined) {
        if (!firstMatch || italicMatch.index < firstMatch.index) {
          firstMatch = {
            index: italicMatch.index,
            length: italicMatch[0].length,
            content: italicMatch[1],
            type: "italic"
          };
        }
      }

      if (firstMatch) {
        if (firstMatch.index > 0) {
          parts.push(remaining.substring(0, firstMatch.index));
        }

        if (firstMatch.type === "bold") {
          parts.push(
            <strong
              key={`b-${lineIdx}-${keyIdx++}`}
              className={isUserMessage ? "font-black text-white" : "font-black text-slate-900 dark:text-white"}
            >
              {firstMatch.content}
            </strong>
          );
        } else {
          parts.push(
            <em key={`i-${lineIdx}-${keyIdx++}`} className="italic">
              {firstMatch.content}
            </em>
          );
        }

        remaining = remaining.substring(firstMatch.index + firstMatch.length);
      } else {
        parts.push(remaining);
        break;
      }
    }

    return (
      <React.Fragment key={lineIdx}>
        {parts}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

export function AIAssistantChatbot({ currentRole, onRoleChange, onSelectPage }: AIAssistantChatbotProps) {
  const {
    meetingsByDay,
    candidateSpecs,
    followUpTemplate,
    whiteLabelConfig,
    sourceCandidateSpec,
    sourceMeeting,
    restoreMeetingById,
    restoreLastMeeting,
    restoreLastCandidateSpec
  } = useAppData();

  const { logs, addLog } = useLogs();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const ceoFullName = whiteLabelConfig?.contactName || "Naim Ramos";
  const companyName = (whiteLabelConfig?.isCustomized && whiteLabelConfig?.companyName) ? whiteLabelConfig.companyName : "Avantty";
  const ceoFirstName = ceoFullName.trim().split(/\s+/)[0] || "Naim";
  const ceoEmail = (whiteLabelConfig as any)?.contactEmail || `${ceoFirstName.toLowerCase()}@${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;

  // Draggable position state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  useEffect(() => {
    if (isOpen && position === null) {
      const defaultX = Math.max(16, window.innerWidth - 435);
      const defaultY = Math.max(16, window.innerHeight - 560);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [isOpen, position]);

  useEffect(() => {
    const handleResize = () => {
      if (position) {
        const maxX = Math.max(10, window.innerWidth - 390);
        const maxY = Math.max(10, window.innerHeight - 520);
        setPosition((prev) => prev ? {
          x: Math.min(prev.x, maxX),
          y: Math.min(prev.y, maxY)
        } : null);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    e.preventDefault();

    const currentX = position?.x ?? Math.max(16, window.innerWidth - 435);
    const currentY = position?.y ?? Math.max(16, window.innerHeight - 560);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentX,
      initialY: currentY
    };

    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaY = moveEvent.clientY - dragRef.current.startY;

      const chatWidth = 400;
      const chatHeight = 520;

      const nextX = Math.max(10, Math.min(window.innerWidth - chatWidth, dragRef.current.initialX + deltaX));
      const nextY = Math.max(10, Math.min(window.innerHeight - chatHeight, dragRef.current.initialY + deltaY));

      setPosition({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: `👋 Hello **${ceoFirstName}**! I'm your operations assistant for **${companyName}**.

Direct answers to your questions:
• **Metrics & Formulas**: Weighted Pipeline, Partner Capacity Load, or Urgency Index.
• **Active Mandates**: Top priority C-Suite searches, Board scores, and hunting grounds.
• **Interview Schedule**: Today's meetings or any weekday agenda.`,
      timestamp: new Date()
    }
  ]);

  // Update initial message if whiteLabelConfig changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "msg-welcome") {
        return [
          {
            id: "msg-welcome",
            sender: "bot",
            text: `👋 Hello **${ceoFirstName}**! I'm your operations assistant for **${companyName}**.

Direct answers to your questions:
• **Metrics & Formulas**: Weighted Pipeline, Partner Capacity Load, or Urgency Index.
• **Active Mandates**: Top priority C-Suite searches, Board scores, and hunting grounds.
• **Interview Schedule**: Today's meetings or any weekday agenda.`,
            timestamp: new Date()
          }
        ];
      }
      return prev;
    });
  }, [ceoFirstName, companyName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Helper to detect specific weekday in text
  const detectWeekday = (text: string): WeekDay | null => {
    const t = text.toLowerCase();
    if (t.includes("monday") || t.includes("lunes")) return "Monday";
    if (t.includes("tuesday") || t.includes("martes")) return "Tuesday";
    if (t.includes("wednesday") || t.includes("miercoles") || t.includes("miércoles")) return "Wednesday";
    if (t.includes("thursday") || t.includes("jueves")) return "Thursday";
    if (t.includes("friday") || t.includes("viernes")) return "Friday";
    if (t.includes("today") || t.includes("hoy")) return "Monday";
    if (t.includes("tomorrow") || t.includes("mañana") || t.includes("manana")) return "Tuesday";
    return null;
  };

  // Smart, direct, executive bot response generator in English
  const generateBotResponse = (userQuery: string): {
    responseText: string;
    actionPayload?: ChatMessage["actionPayload"];
    navigationTarget?: ChatMessage["navigationTarget"];
  } => {
    const qLower = userQuery.toLowerCase().trim();

    // 0. CEO & Leadership Query
    const isCEOQuery =
      qLower.includes("ceo") ||
      qLower.includes("chief executive") ||
      qLower.includes("quien es el jefe") ||
      qLower.includes("quién es el ceo") ||
      qLower.includes("quien es el ceo") ||
      qLower.includes("nombre del ceo") ||
      qLower.includes("ceo name") ||
      qLower.includes("who is the ceo") ||
      qLower.includes("who is ceo") ||
      qLower.includes("founder") ||
      qLower.includes("fundador") ||
      qLower.includes("director general");

    if (isCEOQuery) {
      return {
        responseText: `Hello **${ceoFirstName}**, the **CEO of ${companyName}** is **${ceoFullName}** (${ceoEmail}). Leading all executive search practice operations, partner allocations, and firm governance.`
      };
    }

    // 1. Executive Algorithms: Weighted Pipeline Value
    if (
      qLower.includes("weighted pipeline") ||
      qLower.includes("pipeline value") ||
      qLower.includes("valor de pipeline") ||
      qLower.includes("pipeline ponderado") ||
      qLower.includes("como se calcula el pipeline") ||
      qLower.includes("how is pipeline calculated") ||
      (qLower.includes("pipeline") && (qLower.includes("calcul") || qLower.includes("formula") || qLower.includes("how")))
    ) {
      return {
        responseText: `**${companyName} Weighted Pipeline Calculation:**\n\n$$\\text{Pipeline Value} = (\\text{Target Salary} \\times 30\\% \\text{ Fee}) \\times \\text{Stage Probability}$$\n\n• **Open Mandate (Sourcing)**: **20%**\n• **Shortlist Presented**: **50%**\n• **Board Interviews**: **80%**\n• **Offer Closed / Placed**: **100% Placed Revenue** (Transfers to collected billings and releases partner retainer).`,
        navigationTarget: {
          page: "search-candidates",
          label: "View Pipeline in Search Candidates"
        }
      };
    }

    // 2. Executive Algorithms: Capacity Load & Partners
    if (
      qLower.includes("capacity load") ||
      qLower.includes("carga de capacidad") ||
      qLower.includes("active retainer") ||
      qLower.includes("capacidad de socios") ||
      qLower.includes("partner capacity") ||
      (qLower.includes("capacity") && (qLower.includes("calcul") || qLower.includes("formula") || qLower.includes("how") || qLower.includes("work")))
    ) {
      return {
        responseText: `**${companyName} Partner Capacity Load:**\n\n$$\\text{Capacity Load \\%} = \\left(\\frac{\\text{Active Retainers}}{\\text{Partners} \\times 3.5}\\right) \\times 100$$\n\n• **Benchmark**: **3.5 active retainers per partner** (7 retainers max for 2 partners).\n• **Delay Warning**: Triggers automatically at **85%** capacity to protect SLA delivery speed.`,
        navigationTarget: {
          page: "dashboard",
          label: "View Capacity Load on Dashboard"
        }
      };
    }

    // 3. Executive Algorithms: Urgency Index
    if (
      qLower.includes("urgency index") ||
      qLower.includes("indice de urgencia") ||
      qLower.includes("índice de urgencia") ||
      qLower.includes("urgency score") ||
      qLower.includes("how is urgency calculated") ||
      (qLower.includes("urgency") && qLower.includes("calcul"))
    ) {
      return {
        responseText: `**Mandate Urgency Index Formula:**\n\n$$\\text{Urgency Score} = (\\text{Days Open} \\times 1.2) - (\\text{Qualified Candidates} \\times 15)$$\n\n• $\\ge 18$: 🔴 **Delay Risk** (Requires immediate sourcing acceleration)\n• $5 - 17$: 🟡 **Attention Required**\n• $< 5$: 🟢 **Low Risk / On Track**`,
        navigationTarget: {
          page: "search-candidates",
          label: "Inspect Urgency Scores"
        }
      };
    }

    // 4. Self-Presentation / Functions & Capabilities Query
    const isHelpOrCapabilitiesQuery =
      qLower.includes("que puedes hacer") ||
      qLower.includes("qué puedes hacer") ||
      qLower.includes("cuales son tus funciones") ||
      qLower.includes("cuáles son tus funciones") ||
      qLower.includes("quien eres") ||
      qLower.includes("quién eres") ||
      qLower.includes("what can you do") ||
      qLower.includes("who are you") ||
      qLower.includes("help") ||
      qLower.includes("ayuda") ||
      qLower.includes("funciones") ||
      qLower.includes("capabilities");

    if (isHelpOrCapabilitiesQuery) {
      return {
        responseText: `Hello **${ceoFirstName}**, I support **${companyName}** across 4 direct areas:\n\n1. **Metrics**: Live pipeline formulas, capacity load, and urgency indices.\n2. **Candidates**: C-Suite talent specs, Board scores, and hunting grounds.\n3. **Schedule**: Weekly interviews, bot recording status, and meeting archives.\n4. **Automation**: Instant candidate follow-up emails and audit logging.`
      };
    }

    // 5. Priority Intent: Mark meeting as finished / ended from chat
    const allActiveMeetings = (Object.entries(meetingsByDay) as [WeekDay, typeof meetingsByDay[WeekDay]][])
      .flatMap(([day, list]) => (list || []).map((m) => ({ ...m, day })));

    const matchedMeeting = allActiveMeetings.find((m) => {
      const cName = m.candidate.toLowerCase();
      const parts = cName.split(" ");
      return qLower.includes(cName) || parts.some((p) => p.length > 2 && qLower.includes(p));
    });

    const isMarkFinishedMeetingIntent =
      (qLower.includes("finish") ||
        qLower.includes("ended") ||
        qLower.includes("termin") ||
        qLower.includes("finaliz") ||
        qLower.includes("complet") ||
        qLower.includes("conclui") ||
        qLower.includes("done") ||
        qLower.includes("acabo") ||
        qLower.includes("acabó") ||
        qLower.includes("mark") ||
        qLower.includes("marcar")) &&
      (matchedMeeting !== undefined ||
        qLower.includes("meeting") ||
        qLower.includes("reunion") ||
        qLower.includes("reunión") ||
        qLower.includes("entrevista") ||
        qLower.includes("interview") ||
        qLower.includes("session") ||
        qLower.includes("sesion") ||
        qLower.includes("sesión"));

    if (isMarkFinishedMeetingIntent) {
      const targetMeeting = matchedMeeting || allActiveMeetings[0];

      if (targetMeeting) {
        sourceMeeting(targetMeeting.id, currentRole, targetMeeting.day);

        return {
          responseText: `Meeting with **${targetMeeting.candidate}** (${targetMeeting.role} at **${targetMeeting.clientCompany}**) marked as **Meeting Ended** and archived in audit ledger.`,
          navigationTarget: {
            page: "meetings",
            label: "View Meetings Schedule"
          },
          actionPayload: {
            type: "restore_meeting",
            label: `Revert: ${targetMeeting.candidate}`,
            targetId: targetMeeting.id
          }
        };
      }
    }

    // 6. Check if user asks "what candidates do I have this week?" or "candidates for this week"
    const isWeekCandidateQuery =
      (qLower.includes("candidat") || qLower.includes("perfil")) &&
      (qLower.includes("week") || qLower.includes("semana") || qLower.includes("this week") || qLower.includes("esta semana") || qLower.includes("tengo") || qLower.includes("have"));

    if (isWeekCandidateQuery) {
      const allScheduledMeetings = (Object.entries(meetingsByDay) as [WeekDay, typeof meetingsByDay[WeekDay]][])
        .flatMap(([day, list]) => (list || []).map((m) => ({ ...m, day })));

      const topPrioritySpec = [...candidateSpecs].sort((a, b) => (b.urgencyRating ?? 8) - (a.urgencyRating ?? 8))[0];
      const meetingsList = allScheduledMeetings
        .map((m) => `• **${m.day} at ${m.time}** — **${m.candidate}** (${m.role} at **${m.clientCompany}**)`)
        .join("\n");

      return {
        responseText: `**${allScheduledMeetings.length} interviews scheduled at ${companyName} this week:**\n\n${meetingsList}\n\n🔥 **Top Search Priority**: **${topPrioritySpec ? `${topPrioritySpec.roleTitle} for ${topPrioritySpec.company}` : "CEO for Veloce"}** (Urgency ${topPrioritySpec?.urgencyRating ?? 10}/10).`,
        navigationTarget: {
          page: "search-candidates",
          label: "Go to Search Candidates"
        }
      };
    }

    // 7. Specific Weekday Meetings query
    const requestedDay = detectWeekday(qLower);
    const isMeetingQuery =
      qLower.includes("meeting") ||
      qLower.includes("reunion") ||
      qLower.includes("reunión") ||
      qLower.includes("reuniones") ||
      qLower.includes("entrevista") ||
      qLower.includes("entrevistas") ||
      qLower.includes("agenda") ||
      qLower.includes("schedule") ||
      qLower.includes("sesion") ||
      qLower.includes("sesiones") ||
      qLower.includes("que tengo") ||
      qLower.includes("qué tengo") ||
      qLower.includes("what do i have");

    if (requestedDay || (isMeetingQuery && (qLower.includes("day") || qLower.includes("dia") || qLower.includes("día")))) {
      const targetDay: WeekDay = requestedDay || "Monday";
      const dayMeetings = meetingsByDay[targetDay] || [];

      if (dayMeetings.length === 0) {
        return {
          responseText: `**${targetDay}**: Schedule clear at **${companyName}**, 0 meetings scheduled.`,
          navigationTarget: {
            page: "meetings",
            label: "View Schedule"
          }
        };
      }

      const meetingsList = dayMeetings
        .map((m) => `• **${m.time}** — **${m.candidate}** (${m.role} at **${m.clientCompany}**)`)
        .join("\n");

      return {
        responseText: `**${dayMeetings.length} meetings on ${targetDay} at ${companyName}:**\n\n${meetingsList}`,
        navigationTarget: {
          page: "meetings",
          label: `Open Schedule (${targetDay})`
        }
      };
    }

    // 8. Priority Candidates / Most Important Specs query
    const isPriorityQuery =
      qLower.includes("importan") ||
      qLower.includes("urgent") ||
      qLower.includes("priorita") ||
      qLower.includes("priority") ||
      qLower.includes("sourcing") ||
      qLower.includes("candidat") ||
      qLower.includes("spec") ||
      qLower.includes("perfil");

    if (isPriorityQuery) {
      const activeSpecs = candidateSpecs.filter((s) => s.status !== "Finded");
      const sortedSpecs = [...activeSpecs].sort((a, b) => (b.urgencyRating ?? 8) - (a.urgencyRating ?? 8));
      const topSpec = sortedSpecs[0];
      const nextSpecs = sortedSpecs.slice(1, 3);

      if (topSpec) {
        return {
          responseText: `**Top Search Priorities at ${companyName}:**\n\n1. 🔴 **${topSpec.roleTitle} for ${topSpec.company}** (Urgency ${topSpec.urgencyRating ?? 10}/10: ${topSpec.coreChallenge.slice(0, 90)}...)\n${nextSpecs.map((s, i) => `${i + 2}. **${s.roleTitle}** at **${s.company}**`).join("\n")}`,
          navigationTarget: {
            page: "search-candidates",
            label: "Go to Search Candidates"
          }
        };
      }
    }

    // 9. Follow-Ups & Email Template query
    if (qLower.includes("follow up") || qLower.includes("follow-up") || qLower.includes("plantilla") || qLower.includes("correo") || qLower.includes("email") || qLower.includes("template")) {
      return {
        responseText: `**${companyName} Follow-Up Automation:**\n\n• Subject: *${followUpTemplate.subject}*\n• Automatic dispatch: **10 minutes after** meeting completion.`,
        navigationTarget: {
          page: "follow-ups",
          label: "Edit Follow-Up Template"
        }
      };
    }

    // 10. Activity Logs query
    if (qLower.includes("log") || qLower.includes("logs") || qLower.includes("audit") || qLower.includes("historial") || qLower.includes("eventos") || qLower.includes("registro")) {
      const recent = logs.slice(0, 2);
      return {
        responseText: `**${companyName} Audit Stream (${logs.length} events):**\n\n${recent.map(l => `• **${l.action}** by ${l.userName} (${l.userRole})`).join("\n")}`,
        navigationTarget: {
          page: "logs",
          label: "View Activity Logs"
        }
      };
    }

    // 11. Casual Greetings
    const isGreeting = /^(hey|hello|hi|howdy|yo|sup|good morning|good afternoon|good evening|hola|buenas|buenos dias|qué tal|que tal)\b/i.test(qLower);
    if (isGreeting) {
      return {
        responseText: `Hello **${ceoFirstName}**! Everything operational at **${companyName}**. What metric, interview, or candidate search do you need?`
      };
    }

    // 12. Direct Default
    return {
      responseText: `Hello **${ceoFirstName}**, let me know what you need for **${companyName}**: pipeline metrics, interview schedules, or candidate search priorities.`,
      navigationTarget: {
        page: "dashboard",
        label: "View Operations Dashboard"
      }
    };
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const botRes = generateBotResponse(userText);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: botRes.responseText,
        timestamp: new Date(),
        actionPayload: botRes.actionPayload,
        navigationTarget: botRes.navigationTarget
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 400);
  };

  const handleConfirmAction = (msgId: string, action: ChatMessage["actionPayload"]) => {
    if (!action) return;

    if (action.type === "source_candidate" && action.targetId) {
      sourceCandidateSpec(action.targetId, currentRole);
    } else if (action.type === "restore_meeting") {
      if (action.targetId) {
        restoreMeetingById(action.targetId, currentRole);
      } else {
        restoreLastMeeting("Monday");
      }
    } else if (action.type === "restore_candidate") {
      restoreLastCandidateSpec();
    } else if (action.type === "switch_role_ceo" && onRoleChange) {
      onRoleChange("CEO");
    }

    addLog({
      category: "System",
      action: `AI Assistant Executed Action: ${action.label}`,
      details: `User confirmed automated action execution via AI Chatbot assistant.`,
      level: "action",
      userRole: currentRole
    });

    setMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, actionConfirmed: true } : msg))
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "fixed",
              left: position ? `${position.x}px` : "auto",
              top: position ? `${position.y}px` : "auto",
              bottom: position ? "auto" : "24px",
              right: position ? "auto" : "24px",
              zIndex: 50
            }}
            className="flex h-[540px] w-[390px] flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden backdrop-blur-md"
          >
            {/* Draggable Header */}
            <div
              onMouseDown={handleMouseDown}
              className={`p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono text-xs font-bold shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>Executive AI Operations Assistant</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Role: {currentRole} • Live</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <GripHorizontal className="h-4 w-4 text-slate-400 mr-1" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-900/90 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "bot" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-[10px] mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] space-y-2 rounded-2xl p-3.5 leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium rounded-tr-none shadow-xs"
                        : "bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-2xs"
                    }`}
                  >
                    <div className="font-sans leading-relaxed text-xs">
                      {renderFormattedText(msg.text, msg.sender === "user")}
                    </div>

                    {/* Interactive Navigation Button */}
                    {msg.navigationTarget && onSelectPage && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => onSelectPage(msg.navigationTarget!.page)}
                          className="w-full inline-flex items-center justify-between rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-white dark:text-slate-900 transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {msg.navigationTarget.page === "meetings" && <Calendar className="h-3.5 w-3.5" />}
                            {msg.navigationTarget.page === "search-candidates" && <Users className="h-3.5 w-3.5" />}
                            {msg.navigationTarget.page === "follow-ups" && <Mail className="h-3.5 w-3.5" />}
                            {msg.navigationTarget.page === "logs" && <ScrollText className="h-3.5 w-3.5" />}
                            <span>{msg.navigationTarget.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Executable Action Button */}
                    {msg.actionPayload && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        {msg.actionConfirmed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Action Executed Successfully
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConfirmAction(msg.id, msg.actionPayload)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-white dark:text-slate-900 transition-all shadow-xs active:scale-95 cursor-pointer"
                          >
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            <span>Confirm Action: {msg.actionPayload.label}</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 text-right pt-0.5">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {msg.sender === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[10px] mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px] pt-1">
                  <Bot className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 animate-bounce" />
                  <span>Analyzing executive schedules...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Prompt Chips */}
            <div className="px-3 py-2 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { label: "Who is the CEO?", prompt: "Who is the CEO of the company?" },
                { label: "Weighted Pipeline?", prompt: "How is the Weighted Pipeline Value calculated?" },
                { label: "Capacity Load?", prompt: "Explain the Active Retainer Capacity Load algorithm" },
                { label: "Urgency Index?", prompt: "How is the Urgency Index calculated?" },
                { label: "Meetings this week?", prompt: "What meetings do I have this week?" }
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    const userMsg: ChatMessage = {
                      id: `usr-${Date.now()}`,
                      sender: "user",
                      text: chip.prompt,
                      timestamp: new Date()
                    };
                    setMessages((prev) => [...prev, userMsg]);
                    setIsTyping(true);
                    setTimeout(() => {
                      const botRes = generateBotResponse(chip.prompt);
                      const botMsg: ChatMessage = {
                        id: `bot-${Date.now()}`,
                        sender: "bot",
                        text: botRes.responseText,
                        timestamp: new Date(),
                        actionPayload: botRes.actionPayload,
                        navigationTarget: botRes.navigationTarget
                      };
                      setMessages((prev) => [...prev, botMsg]);
                      setIsTyping(false);
                    }, 400);
                  }}
                  className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask anything about the dashboard, CEO, algorithms..."
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-40 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-900/40 border border-emerald-400/40 ring-4 ring-emerald-500/20 transition-all cursor-pointer"
            aria-label="Open AI Operations Assistant"
          >
            <Bot className="h-7 w-7 text-white" />
            {/* Online pulsing green dot */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-[#0C0E12]"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
