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

  const ceoName = whiteLabelConfig?.contactName || "Naim Ramos";
  const companyName = whiteLabelConfig?.companyName || "Avantty";
  const ceoEmail = whiteLabelConfig?.contactEmail || "naim@avantty.com";

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
      text: `👋 **Hello! I am your AI Operations & Executive Intelligence Assistant for ${companyName}.**

I am built directly into this executive search platform to support your team. Here is what I can do for you:

• **Platform Q&A & Support**: Ask me any question about how this dashboard works, metrics, or candidate tracking.
• **Company Leadership & Team**: I know our company leadership (**CEO: ${ceoName}**), partner capacities, and team roles.
• **Executive Algorithms**: Ask me how the **Weighted Pipeline Value**, **Partner Capacity Load**, or **Urgency Index** are calculated.
• **Live Sourcing & Candidates**: Query active C-Suite specs, Board scores, hunting grounds, or boolean strings.
• **Interview Agendas & Bots**: Check upcoming interviews, launch meeting recording bots, and manage automated follow-ups.

💬 *Ask me any question or try one of the quick suggestions below!*`,
      timestamp: new Date()
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Helper to detect specific weekday in text (Spanish & English)
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

  // Smart, conversational common-sense bot response generator
  const generateBotResponse = (userQuery: string): {
    responseText: string;
    actionPayload?: ChatMessage["actionPayload"];
    navigationTarget?: ChatMessage["navigationTarget"];
  } => {
    const qLower = userQuery.toLowerCase().trim();

    // Check language
    const isSpanish = /[áéíóúñ¿¡]|\b(hola|que|qué|quién|quien|como|cómo|tengo|tienes|cuáles|cuales|semana|lunes|martes|miercoles|miércoles|jueves|viernes|hoy|mañana|manana|reuniones|entrevistas|gracias|dime|candidatos|perfiles|plantilla|algoritmo|capacidad|ponderado)\b/i.test(userQuery);

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
      if (isSpanish) {
        return {
          responseText: `El **Chief Executive Officer (CEO)** de **${companyName}** es **${ceoName}** (${ceoEmail}).\n\nComo CEO, ${ceoName} lidera las operaciones de Executive Search, la supervisión de mandatos de nivel C-Suite y VP, la carga de capacidad entre socios y la gobernanza estratégica de la firma.`
        };
      } else {
        return {
          responseText: `The **Chief Executive Officer (CEO)** of **${companyName}** is **${ceoName}** (${ceoEmail}).\n\nAs CEO, ${ceoName} oversees executive search mandate allocations, C-Suite & Board client relationships, partner capacity bandwidth, and enterprise firm governance.`
        };
      }
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
      if (isSpanish) {
        return {
          responseText: `**Algoritmo de Valor de Pipeline Ponderado (Weighted Pipeline):**\n\n$$\\text{Pipeline} = (\\text{Salario Target} \\times \\text{Fee 30\\%}) \\times \\text{Probabilidad de Cierre}$$\n\n• **Fase 1: Mandato Abierto (Sourcing / Longlist)**: Probabilidad = **20%**\n• **Fase 2: Shortlist Presentada al Cliente**: Probabilidad = **50%**\n• **Fase 3: Entrevistas Finales con el Consejo (Board Round)**: Probabilidad = **80%**\n• **Fase 4: Oferta Aceptada / Placed**: **100% Facturación Cobrada** (Pasa de Pipeline a Placed Revenue y libera el Active Retainer).\n\n*Cada vez que mueves la fase de un candidato en Search Candidates, el valor superior del Dashboard se recalcula al instante.*`,
          navigationTarget: {
            page: "search-candidates",
            label: "View Pipeline in Search Candidates"
          }
        };
      } else {
        return {
          responseText: `**Weighted Pipeline Value Algorithm:**\n\n$$\\text{Pipeline Value} = (\\text{Target Salary} \\times \\text{Fee 30\\%}) \\times \\text{Stage Probability}$$\n\n• **Phase 1: Open Mandate (Sourcing / Longlist)**: Probability = **20%**\n• **Phase 2: Shortlist Presented to Client**: Probability = **50%**\n• **Phase 3: Final Board Round (Board Interviews)**: Probability = **80%**\n• **Phase 4: Offer Accepted / Placed**: **100% Placed Revenue** (Moves from Pipeline to Collected Fees and automatically releases partner retainer capacity).\n\n*Selecting any candidate phase immediately recalculates your live top dashboard metrics.*`,
          navigationTarget: {
            page: "search-candidates",
            label: "View Pipeline in Search Candidates"
          }
        };
      }
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
      if (isSpanish) {
        return {
          responseText: `**Algoritmo de Carga de Capacidad de Socios (Capacity Load):**\n\n$$\\text{Carga \\%} = \\left(\\frac{\\text{Mandatos Activos}}{\\text{Socios} \\times 3.5}\\right) \\times 100$$\n\n• En Executive Search de alto nivel, un socio puede gestionar con máxima excelencia hasta **3.5 mandatos activos**.\n• Con 2 socios, la capacidad óptima es de **7 mandatos** (100%).\n• Si la carga supera el **85%**, el sistema activa una alerta preventiva de *"High Workload Friction"* para evitar retrasos en las entregas a clientes.`,
          navigationTarget: {
            page: "dashboard",
            label: "View Capacity Load on Dashboard"
          }
        };
      } else {
        return {
          responseText: `**Active Retainer Capacity Load Algorithm:**\n\n$$\\text{Capacity Load \\%} = \\left(\\frac{\\text{Active Retainers}}{\\text{Partners} \\times 3.5}\\right) \\times 100$$\n\n• In retained executive headhunting, a senior partner can manage up to **3.5 active mandates** simultaneously with elite tier delivery.\n• For 2 partners, the standard maximum bandwidth is **7 active mandates** (100%).\n• When capacity exceeds **85%**, the dashboard triggers a *"High Workload Friction — Delay Risk"* alert to protect client SLAs.`,
          navigationTarget: {
            page: "dashboard",
            label: "View Capacity Load on Dashboard"
          }
        };
      }
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
      if (isSpanish) {
        return {
          responseText: `**Algoritmo de Índice de Riesgo y Urgencia (Urgency Index):**\n\n$$\\text{Urgency Score} = (\\text{Días Abierto} \\times 1.2) - (\\text{Candidatos Cualificados} \\times 15)$$\n\n• **Score $\\ge 18$**: **Delay Risk** (Rojo — requiere atención urgente).\n• **Score $5 - 17$**: **Attention Required** (Ámbar).\n• **Score $< 5$**: **Low Risk / On Track** (Verde — proceso dentro de los plazos ideales).\n\nPuedes ajustar los candidatos cualificados directamente en las tarjetas de perfil con los botones \`+\` y \`-\`.`,
          navigationTarget: {
            page: "search-candidates",
            label: "Inspect Urgency Scores"
          }
        };
      } else {
        return {
          responseText: `**Search Mandate Urgency Index Algorithm:**\n\n$$\\text{Urgency Score} = (\\text{Days Open} \\times 1.2) - (\\text{Qualified Candidates} \\times 15)$$\n\n• **Score $\\ge 18$**: **Delay Risk** (High friction mandate requiring immediate sourcing acceleration).\n• **Score $5 - 17$**: **Attention Required** (Moderate priority).\n• **Score $< 5$**: **Low Risk / On Track** (Healthy pipeline progression).\n\nYou can adjust qualified candidate tallies directly on each profile card using the \`+\` and \`-\` controls.`,
          navigationTarget: {
            page: "search-candidates",
            label: "Inspect Urgency Scores"
          }
        };
      }
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
      if (isSpanish) {
        return {
          responseText: `Soy el **Asistente de IA para Operaciones de Executive Search** de **${companyName}**.\n\n**Mis principales capacidades para todo el equipo:**\n1. **Resolver dudas de la plataforma**: Explico cómo funciona cualquier sección del dashboard, permisos o configuraciones.\n2. **Conocimiento de Liderazgo**: Conozco a nuestro **CEO (${ceoName})**, los socios asignados y la capacidad disponible.\n3. **Cálculo de Algoritmos**: Te explico y audito el **Weighted Pipeline Value**, **Partner Capacity Load** y el **Urgency Index**.\n4. **Consultas de Candidatos**: Busca candidatos por rol, empresa cliente, Board Readiness Score, hunting grounds y cadenas Booleanas.\n5. **Gestión de Entrevistas**: Revisa la agenda semanal, consulta resúmenes de reuniones y gestiona correos de seguimiento automáticos.`
        };
      } else {
        return {
          responseText: `I am the **Executive Search AI Operations Assistant** for **${companyName}**.\n\n**My core capabilities for your entire organization:**\n1. **Platform Guidance & Q&A**: I can answer any question about dashboard modules, white-label settings, and role switching.\n2. **Company Leadership**: I have direct context on our **CEO (${ceoName})**, active partner headcount, and firm governance.\n3. **Algorithm Intelligence**: I calculate and explain **Weighted Pipeline Value**, **Capacity Load**, and **Urgency Indices**.\n4. **Executive Candidate Sourcing**: Search C-Suite profiles, board readiness scores, talent hunting grounds, and boolean query strings.\n5. **Schedule & Follow-Up Automation**: Check weekly interview sessions, meeting bot transcripts, and automated candidate debriefs.`
        };
      }
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

        if (isSpanish) {
          return {
            responseText: `¡Listo! He marcado la reunión con **${targetMeeting.candidate}** (${targetMeeting.role} en **${targetMeeting.clientCompany}**) como **Meeting Ended** y la he archivado en el Ledger de auditoría.\n\nPuedes navegar a la sección de Reuniones para ver el calendario actualizado.`,
            navigationTarget: {
              page: "meetings",
              label: "Go to Meetings Schedule"
            },
            actionPayload: {
              type: "restore_meeting",
              label: `Revert Meeting: ${targetMeeting.candidate}`,
              targetId: targetMeeting.id
            }
          };
        } else {
          return {
            responseText: `Done! I have marked the meeting with **${targetMeeting.candidate}** (${targetMeeting.role} at **${targetMeeting.clientCompany}**) as **Meeting Ended** and archived it to your audit ledger.\n\nYou can navigate directly to the Meetings section to view your updated schedule.`,
            navigationTarget: {
              page: "meetings",
              label: "Go to Meetings Schedule"
            },
            actionPayload: {
              type: "restore_meeting",
              label: `Revert Meeting: ${targetMeeting.candidate}`,
              targetId: targetMeeting.id
            }
          };
        }
      }
    }

    // 1. Check if user asks "what candidates do I have this week?" or "candidates for this week"
    const isWeekCandidateQuery =
      (qLower.includes("candidat") || qLower.includes("perfil")) &&
      (qLower.includes("week") || qLower.includes("semana") || qLower.includes("this week") || qLower.includes("esta semana") || qLower.includes("tengo") || qLower.includes("have"));

    if (isWeekCandidateQuery) {
      const allScheduledMeetings = (Object.entries(meetingsByDay) as [WeekDay, typeof meetingsByDay[WeekDay]][])
        .flatMap(([day, list]) => (list || []).map((m) => ({ ...m, day })));

      const topPrioritySpec = [...candidateSpecs].sort((a, b) => (b.urgencyRating ?? 8) - (a.urgencyRating ?? 8))[0];
      const otherSpecs = candidateSpecs.filter((s) => s.id !== topPrioritySpec?.id && s.status !== "Finded");

      if (isSpanish) {
        const meetingsList = allScheduledMeetings
          .map((m) => `• **${m.day} (${m.time})** — **${m.candidate}** (${m.role} en **${m.clientCompany}**)`)
          .join("\n");

        return {
          responseText: `Esta semana tienes **${allScheduledMeetings.length} entrevistas** programadas:\n\n${meetingsList}\n\nEn cuanto a perfiles de búsqueda de candidatos, tu prioridad máxima es el **${topPrioritySpec ? `${topPrioritySpec.roleTitle} para ${topPrioritySpec.company}` : "CEO para Veloce Health & Bio"}** (urgencia 10/10), seguido de: ${otherSpecs.map(s => `**${s.roleTitle}** (${s.company})`).join(", ")}.\n\nIf you would like, you can navigate directly to the Search Candidates section to view all candidate specifications.`,
          navigationTarget: {
            page: "search-candidates",
            label: "Go to Search Candidates"
          }
        };
      } else {
        const meetingsList = allScheduledMeetings
          .map((m) => `• **${m.day} at ${m.time}** — **${m.candidate}** (${m.role} at **${m.clientCompany}**)`)
          .join("\n");

        return {
          responseText: `This week you have **${allScheduledMeetings.length} interviews** scheduled:\n\n${meetingsList}\n\nOn the executive candidate search front, your top priority is the **${topPrioritySpec ? `${topPrioritySpec.roleTitle} for ${topPrioritySpec.company}` : "CEO for Veloce Health & Bio"}** (10/10 urgency), followed by: ${otherSpecs.map(s => `**${s.roleTitle}** (${s.company})`).join(", ")}.\n\nIf you would like, you can navigate directly to the Search Candidates section to view all candidate specifications.`,
          navigationTarget: {
            page: "search-candidates",
            label: "Go to Search Candidates"
          }
        };
      }
    }

    // 2. Specific Weekday Meetings query (e.g. "What meetings do I have on Monday / Wednesday / Martes?")
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
        if (isSpanish) {
          return {
            responseText: `Para el **${targetDay}** tienes la agenda **completamente libre**; no hay ninguna reunión agendada por ahora.\n\nIf you would like, you can navigate directly to the Meetings section to manage your schedule.`,
            navigationTarget: {
              page: "meetings",
              label: "Go to Meetings Schedule"
            }
          };
        } else {
          return {
            responseText: `For **${targetDay}**, your agenda is **completely clear**; you have no meetings scheduled at the moment.\n\nIf you would like, you can navigate directly to the Meetings section to manage your schedule.`,
            navigationTarget: {
              page: "meetings",
              label: "Go to Meetings Schedule"
            }
          };
        }
      }

      if (isSpanish) {
        const meetingsList = dayMeetings
          .map((m) => `• **${m.time}** — **${m.candidate}** (${m.role} en **${m.clientCompany}**)`)
          .join("\n");

        return {
          responseText: `Para el **${targetDay}**, tienes **${dayMeetings.length} reuniones programadas**:\n\n${meetingsList}\n\nIf you would like, you can navigate directly to the Meetings section to manage your schedule.`,
          navigationTarget: {
            page: "meetings",
            label: `Go to Meetings (${targetDay})`
          }
        };
      } else {
        const meetingsList = dayMeetings
          .map((m) => `• **${m.time}** — **${m.candidate}** (${m.role} at **${m.clientCompany}**)`)
          .join("\n");

        return {
          responseText: `For **${targetDay}**, you have **${dayMeetings.length} meetings scheduled**:\n\n${meetingsList}\n\nIf you would like, you can navigate directly to the Meetings section to manage your schedule.`,
          navigationTarget: {
            page: "meetings",
            label: `Go to Meetings (${targetDay})`
          }
        };
      }
    }

    // 3. Priority Candidates / Most Important Specs query
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
      const nextSpecs = sortedSpecs.slice(1);

      if (topSpec) {
        if (isSpanish) {
          return {
            responseText: `Según lo que veo en el sistema, tu perfil más importante y urgente con diferencia es el de **${topSpec.roleTitle} para ${topSpec.company}** (urgencia ${topSpec.urgencyRating ?? 10}/10: ${topSpec.coreChallenge.slice(0, 110)}...).\n\nAparte de ese, los otros perfiles activos que tienes que atender son: **${nextSpecs.map(s => `${s.roleTitle} en ${s.company} (${s.urgencyScore || s.priority})`).join(", ")}**.\n\nIf you would like, you can navigate directly to the Search Candidates section to view all candidate specifications.`,
            navigationTarget: {
              page: "search-candidates",
              label: "Go to Search Candidates"
            }
          };
        } else {
          return {
            responseText: `Looking at your talent pipeline, your absolute top priority is the **${topSpec.roleTitle} for ${topSpec.company}** (marked ${topSpec.urgencyRating ?? 10}/10 urgency: ${topSpec.coreChallenge.slice(0, 110)}...).\n\nBeyond that, your other active key searches are: **${nextSpecs.map(s => `${s.roleTitle} at ${s.company} (${s.urgencyScore || s.priority})`).join(", ")}**.\n\nIf you would like, you can navigate directly to the Search Candidates section to view all candidate specifications.`,
            navigationTarget: {
              page: "search-candidates",
              label: "Go to Search Candidates"
            }
          };
        }
      }
    }

    // 4. Follow-Ups & Email Template query
    if (qLower.includes("follow up") || qLower.includes("follow-up") || qLower.includes("plantilla") || qLower.includes("correo") || qLower.includes("email") || qLower.includes("template")) {
      if (isSpanish) {
        return {
          responseText: `Tenemos configurada la plantilla universal de seguimiento ("*${followUpTemplate.subject}*"). El bot de IA se encarga de enviarla automáticamente a cada candidato **10 minutos después** de finalizar su entrevista.\n\nIf you would like, you can navigate directly to the Follow Ups section to customize your template.`,
          navigationTarget: {
            page: "follow-ups",
            label: "Go to Follow Ups"
          }
        };
      } else {
        return {
          responseText: `We have the universal follow-up email template active ("*${followUpTemplate.subject}*"). The AI automatically dispatches it to each candidate **10 minutes after** their interview finishes.\n\nIf you would like, you can navigate directly to the Follow Ups section to customize your template.`,
          navigationTarget: {
            page: "follow-ups",
            label: "Go to Follow Ups"
          }
        };
      }
    }

    // 5. Activity Logs & Telemetry query
    if (qLower.includes("log") || qLower.includes("logs") || qLower.includes("audit") || qLower.includes("historial") || qLower.includes("eventos") || qLower.includes("registro")) {
      const recent = logs.slice(0, 2);
      if (isSpanish) {
        return {
          responseText: `El sistema está registrando toda la actividad con normalidad (${logs.length} eventos en total). Los últimos movimientos incluyen: ${recent.map(l => `*${l.action}*`).join(" y ")}.\n\nIf you would like, you can navigate directly to the Activity Logs section.`,
          navigationTarget: {
            page: "logs",
            label: "Go to Activity Logs"
          }
        };
      } else {
        return {
          responseText: `All operational streams are running cleanly (${logs.length} total audit events). Recent logged actions include: ${recent.map(l => `*${l.action}*`).join(" and ")}.\n\nIf you would like, you can navigate directly to the Activity Logs section.`,
          navigationTarget: {
            page: "logs",
            label: "Go to Activity Logs"
          }
        };
      }
    }

    // 6. Casual Greetings / Small talk
    const isGreeting = /^(hey|hello|hi|howdy|yo|sup|good morning|good afternoon|good evening|hola|buenas|buenos dias|qué tal|que tal)\b/i.test(qLower);
    if (isGreeting) {
      if (isSpanish) {
        return {
          responseText: `¡Hola! Todo funcionando al 100%. Puedes preguntarme qué reuniones tienes cualquier día, cuáles son los candidatos más urgentes o cómo van los correos de seguimiento. ¿En qué te ayudo?`
        };
      } else {
        return {
          responseText: `Hey! All systems are operating smoothly. You can ask me what interviews you have on any day, which candidate searches are most urgent, or check follow-up templates. What would you like to know?`
        };
      }
    }

    // 7. General Default Resolution with common sense
    if (isSpanish) {
      return {
        responseText: `Estoy aquí para ayudarte. Puedes pedirme que te diga qué reuniones tienes hoy o cualquier día de la semana, o qué perfiles de candidatos deberías priorizar ahora mismo.\n\nIf you would like, you can navigate directly to the Meetings section to manage your schedule.`,
        navigationTarget: {
          page: "meetings",
          label: "Go to Meetings Schedule"
        }
      };
    } else {
      return {
        responseText: `I'm here to assist your executive workflow! You can ask me what meetings you have on any day of the week, or which candidate searches are currently most urgent.\n\nIf you would like, you can navigate directly to the Meetings section to manage your schedule.`,
        navigationTarget: {
          page: "meetings",
          label: "Go to Meetings Schedule"
        }
      };
    }
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
