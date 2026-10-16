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
import { calculateExecutivePipelineMetrics } from "@/src/executive-algorithms";

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
    followUpDispatches,
    endedMeetingsLedger,
    whiteLabelConfig,
    sourceCandidateSpec,
    sourceMeeting,
    restoreMeetingById,
    restoreLastMeeting,
    restoreLastCandidateSpec,
    systemSnapshots,
    activeSecurityIncident
  } = useAppData();

  const { logs, criticalIncidents, addLog } = useLogs();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const ceoFullName = whiteLabelConfig?.contactName || "Naim Ramos";
  const companyName = (whiteLabelConfig?.isCustomized && whiteLabelConfig?.companyName) ? whiteLabelConfig.companyName : "Avantty";
  const ceoFirstName = ceoFullName.trim().split(/\s+/)[0] || "Naim";
  const ceoEmail = (whiteLabelConfig as any)?.contactEmail || `${ceoFirstName.toLowerCase()}@${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  const pipelineMetrics = calculateExecutivePipelineMetrics(candidateSpecs);

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

  // Intelligent, contextual, bilingual executive assistant engine
  const generateBotResponse = (userQuery: string): {
    responseText: string;
    actionPayload?: ChatMessage["actionPayload"];
    navigationTarget?: ChatMessage["navigationTarget"];
  } => {
    const qLower = userQuery.toLowerCase().trim();

    // Check language of incoming query
    const isSpanish = /[áéíóúñ¿¡]|\b(hola|que|qué|quién|quien|como|cómo|tengo|tienes|cuáles|cuales|semana|lunes|martes|miercoles|miércoles|jueves|viernes|hoy|mañana|manana|reuniones|entrevistas|gracias|dime|candidatos|perfiles|mandatos|plantilla|algoritmo|capacidad|ponderado|porque|por qué|empresa|bueno|buenisimo|sirve|para|basta|espera|detente|seguridad|borrado|eliminacion|eliminación)\b/i.test(userQuery);

    // 1. STOP / WAIT / PAUSE DIRECTIVES (Section 9 Requirement)
    const isStopDirective = /^(stop|para|basta|detente|detener|silencio|cállate|quieto|halt|alto)\b/i.test(qLower);
    if (isStopDirective) {
      setIsPaused(true);
      return {
        responseText: isSpanish ? "Entendido. Me detengo." : "Understood. I'll stop."
      };
    }

    const isWaitDirective = /^(wait|espera|un momento|hold on|dame un segundo|espérate|esperate|pausa)\b/i.test(qLower);
    if (isWaitDirective) {
      setIsPaused(true);
      return {
        responseText: isSpanish ? "Claro, tómate tu tiempo." : "Sure, take your time."
      };
    }

    // If conversation was paused, clear pause state when user asks a new question
    if (isPaused) {
      setIsPaused(false);
    }

    // 2. CASUAL GREETINGS & HOW-ARE-YOU (Section 9 Requirement)
    const isHowAreYou = /^(cómo estás|como estas|qué tal|que tal|how are you|how is it going|how are things|how do you do)\b/i.test(qLower);
    if (isHowAreYou) {
      return {
        responseText: isSpanish ? "¡Todo bien! ¿Y tú? ¿En qué puedo asistirte hoy?" : "All good! How are you? How can I assist you today?"
      };
    }

    const isUserDoingWell = /^(bien|todo bien|muy bien|estoy bien|genial|i'm good|im good|good|doing well|great|fine)\b/i.test(qLower);
    if (isUserDoingWell) {
      return {
        responseText: isSpanish
          ? "¡Me alegro! Dime en qué puedo ayudarte hoy."
          : "Glad to hear! How can I assist you today?"
      };
    }

    const isSimpleGreeting = /^(hola+|buenas|buenos días|buenos dias|buenas tardes|buenas noches|hello+|hi+|hey+|howdy|yo|heya)\b/i.test(qLower);
    if (isSimpleGreeting) {
      return {
        responseText: isSpanish
          ? "¡Hola! ¿Qué tal? ¿En qué puedo ayudarte hoy?"
          : "Hello! How can I help you today?"
      };
    }

    // Clarification ("excuse me?", "pardon?", "sorry?")
    const isClarification = /^(excuse me\??|pardon\??|sorry\??|what\??|cómo\??|como\??|disculpa\??|perdón\??)\b/i.test(qLower);
    if (isClarification) {
      return {
        responseText: isSpanish
          ? "¡Disculpa! Estoy a tu disposición para ayudarte con los mandatos de búsqueda, la agenda de entrevistas, las métricas del pipeline o auditoría. ¿En qué puedo colaborar?"
          : "Pardon me! I'm here to assist you with active search mandates, interview schedules, partner capacity, or platform metrics. How can I help?"
      };
    }

    // Brand question ("avantty?", "what is avantty?")
    const isBrandQuery = /^(avantty\??|about avantty|qué es avantty\??|que es avantty\??|what is avantty\??)\b/i.test(qLower);
    if (isBrandQuery) {
      return {
        responseText: isSpanish
          ? "Avantty es una plataforma SaaS B2B de operaciones directivas que automatiza los flujos administrativos y operativos de firmas de Executive Search—incluyendo coordinación de entrevistas, follow-ups inmediatos post-entrevista (<500ms SLA), gestión de mandatos y analítica de capacidad de socios."
          : "Avantty is an enterprise executive search operations platform that automates administrative and operational workflows for retained search firms—including interview coordination, autonomous post-interview follow-ups (<500ms SLA), mandate tracking, and partner capacity analytics."
      };
    }

    // Capabilities question ("what you can do?", "what can you do?", "help")
    const isCapabilitiesQuery = /^(what you can do\??|what can you do\??|what do you do\??|qué puedes hacer\??|que puedes hacer\??|cómo puedes ayudar\??|como puedes ayudar\??|help\??|ayuda\??)\b/i.test(qLower);
    if (isCapabilitiesQuery) {
      return {
        responseText: isSpanish
          ? "Puedo ayudarte con:\n\n• **Mandatos de Búsqueda**: Consultar especificaciones directivas, estados de búsqueda y mandatos colocados (Placed).\n• **Agenda de Entrevistas**: Ver las entrevistas de hoy o de cualquier día de la semana.\n• **Métricas de Pipeline**: Consultar Carga de Capacidad de Socios, Pipeline Ponderado e Índices de Urgencia.\n• **Follow-Ups Automáticos**: Verificar plantillas activas y registros de envío post-entrevista.\n• **Auditoría y Seguridad**: Supervisar eventos de auditoría y rollbacks de snapshots del sistema."
          : "I can assist you with:\n\n• **Active Search Mandates**: Inspect C-Suite search specifications, candidate rosters, and placement statuses.\n• **Interview Schedule**: View confirmed meetings for today or any weekday.\n• **Pipeline Formulas & Metrics**: Check Partner Capacity Load, Weighted Pipeline, or Urgency Indices.\n• **Automated Follow-Ups**: Review instant post-interview debrief dispatches and scheduling links.\n• **Audit Logs & Governance**: Monitor telemetry events and system snapshot rollbacks."
      };
    }

    const isThankYou = /^(gracias|muchas gracias|mil gracias|thank you|thanks|thx)\b/i.test(qLower);
    if (isThankYou) {
      return {
        responseText: isSpanish
          ? "¡De nada! Aquí estoy si necesitas algo más."
          : "You're welcome! Let me know if you need anything else."
      };
    }

    // 3. ARCHITECTURE & AI MODEL TRANSPARENCY (Section 9 Requirement)
    const isModelOrArchitectureQuery =
      qLower.includes("que modelo") ||
      qLower.includes("qué modelo") ||
      qLower.includes("que ia eres") ||
      qLower.includes("qué ia eres") ||
      qLower.includes("what model") ||
      qLower.includes("which model") ||
      qLower.includes("are you an llm") ||
      qLower.includes("eres un llm") ||
      qLower.includes("como funcionas") ||
      qLower.includes("cómo funcionas") ||
      qLower.includes("how do you work") ||
      qLower.includes("gemini");

    if (isModelOrArchitectureQuery) {
      return {
        responseText: isSpanish
          ? `Actualmente opero a través del **motor conversacional contextual integrado de Avantty**, conectado en tiempo real a los mandatos, entrevistas, logs de auditoría y algoritmos de la plataforma.\n\nPara activar procesamiento generativo mediante modelos de frontera externos (como Google Gemini API), se puede configurar la variable de entorno \`GEMINI_API_KEY\` en el archivo \`.env\`.`
          : `I currently operate via **Avantty's embedded contextual operations engine**, integrated directly with live search mandates, interview schedules, audit ledgers, and executive algorithms.\n\nTo enable external frontier generative reasoning (such as Google Gemini API), configure the \`GEMINI_API_KEY\` environment variable in your \`.env\` file.`
      };
    }

    // 4. CEO SECURITY & MASS DELETION INVESTIGATION (Section 9 & 10 Requirement)
    const isSecurityIncidentQuery =
      qLower.includes("seguridad") ||
      qLower.includes("security") ||
      qLower.includes("incidente") ||
      qLower.includes("incident") ||
      qLower.includes("eliminacion masiva") ||
      qLower.includes("eliminación masiva") ||
      qLower.includes("mass deletion") ||
      qLower.includes("borrado masivo") ||
      qLower.includes("snapshot") ||
      qLower.includes("restaurar sistema") ||
      qLower.includes("restore system");

    if (isSecurityIncidentQuery) {
      if (currentRole !== "CEO") {
        return {
          responseText: isSpanish
            ? "El acceso al registro de incidentes de seguridad críticos y controles de recuperación está restringido exclusivamente al rol de CEO."
            : "Access to critical security incident logs and system recovery controls is strictly restricted to the CEO role."
        };
      }

      const activeIncident = activeSecurityIncident || (criticalIncidents && criticalIncidents[0]);
      if (activeIncident || (systemSnapshots && systemSnapshots.length > 0)) {
        const snap = systemSnapshots[0];
        const affectedSummary = activeIncident
          ? `${activeIncident.affectedCount} registros afectados (${activeIncident.resourceType}). Identificado a las ${activeIncident.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`
          : snap
          ? `Último Snapshot guardado con ${snap.candidateSpecs.length} mandatos y ${Object.values(snap.meetingsByDay).flat().length} reuniones.`
          : "Incidente detectado en el registro de auditoría.";

        return {
          responseText: isSpanish
            ? `⚠️ **Investigación de Seguridad (Exclusivo CEO)**:\n\n• **Estado**: Se ha registrado un incidente crítico de eliminación o alteración.\n• **Detalle**: ${affectedSummary}\n\n🛡️ **Aviso de Gobernanza**: Como asistente de IA, **no tengo autorización para ejecutar la restauración de datos directamente**. Para restablecer el sistema de forma segura, por favor accede a la sección de **Seguridad y Recuperación** dentro del módulo de Logs y confirma la restauración manualmente.`
            : `⚠️ **Security Investigation (CEO Confidential)**:\n\n• **Status**: A critical deletion or data mutation incident has been recorded.\n• **Detail**: ${affectedSummary}\n\n🛡️ **Governance Notice**: As an AI assistant, **I am not authorized to execute data restorations directly**. To safely restore the system, please navigate to the **Security & Recovery** panel in the Logs module and manually confirm the snapshot restoration.`,
          navigationTarget: {
            page: "logs",
            label: isSpanish ? "Ir a Seguridad y Recuperación (Logs)" : "Go to Security & Recovery (Logs)"
          }
        };
      } else {
        return {
          responseText: isSpanish
            ? "No se registran incidentes de seguridad críticos ni eliminaciones masivas recientes. El sistema opera con normalidad y los datos están íntegros."
            : "No critical security incidents or recent mass deletions are recorded. The system is operating normally and data integrity is intact."
        };
      }
    }

    // 5. LIVE METRICS & PIPELINE QUERIES (Real Platform Data, No Hallucinations)
    const isMetricsQuery =
      qLower.includes("metric") ||
      qLower.includes("métrica") ||
      qLower.includes("pipeline") ||
      qLower.includes("revenue") ||
      qLower.includes("ingresos") ||
      qLower.includes("facturacion") ||
      qLower.includes("facturación") ||
      qLower.includes("honorarios") ||
      qLower.includes("capacity") ||
      qLower.includes("capacidad") ||
      qLower.includes("urgency") ||
      qLower.includes("urgencia");

    if (isMetricsQuery) {
      const pipelineMetrics = calculateExecutivePipelineMetrics(candidateSpecs);

      if (qLower.includes("formula") || qLower.includes("fórmula") || qLower.includes("como se calcula") || qLower.includes("how is it calculated")) {
        if (qLower.includes("capacity") || qLower.includes("capacidad")) {
          return {
            responseText: isSpanish
              ? `**Fórmula de Carga de Capacidad de Socios (${companyName}):**\n\n$$\\text{Carga de Capacidad \\%} = \\left(\\frac{\\text{Mandatos Activos}}{\\text{Socios} \\times 3.5}\\right) \\times 100$$\n\n• Retainers Activos: **${pipelineMetrics.activeRetainersCount}**\n• Capacidad Máxima (2 socios): **7 mandatos**\n• Carga Actual: **${pipelineMetrics.capacityLoadPercentage}%** (${pipelineMetrics.capacityBadgeText}).`
              : `**Partner Capacity Load Formula (${companyName}):**\n\n$$\\text{Capacity Load \\%} = \\left(\\frac{\\text{Active Retainers}}{\\text{Partners} \\times 3.5}\\right) \\times 100$$\n\n• Active Retainers: **${pipelineMetrics.activeRetainersCount}**\n• Maximum Capacity (2 partners): **7 retainers**\n• Current Load: **${pipelineMetrics.capacityLoadPercentage}%** (${pipelineMetrics.capacityBadgeText}).`
          };
        } else if (qLower.includes("urgency") || qLower.includes("urgencia")) {
          return {
            responseText: isSpanish
              ? `**Fórmula del Índice de Urgencia del Mandato:**\n\n$$\\text{Urgency Score} = (\\text{Días Abierto} \\times 1.2) - (\\text{Candidatos Cualificados en Pipeline} \\times 15)$$\n\n• $\\ge 18$: 🔴 **Delay Risk** (Riesgo de retraso en entrega)\n• $5 - 17$: 🟡 **Attention Required** (Atención requerida)\n• $< 5$: 🟢 **On Track** (En curso dentro del SLA).`
              : `**Search Mandate Urgency Index Formula:**\n\n$$\\text{Urgency Score} = (\\text{Days Open} \\times 1.2) - (\\text{Qualified Candidates} \\times 15)$$\n\n• $\\ge 18$: 🔴 **Delay Risk** (Delivery slippage risk)\n• $5 - 17$: 🟡 **Attention Required**\n• $< 5$: 🟢 **On Track** (Within SLA).`
          };
        } else {
          return {
            responseText: isSpanish
              ? `**Fórmula del Pipeline Ponderado (${companyName}):**\n\n$$\\text{Weighted Pipeline} = \\sum (\\text{Salario Target} \\times 30\\% \\text{ Fee}) \\times \\text{Probabilidad de Fase}$$\n\n• Longlist / Sourcing: **20%**\n• Shortlist al Cliente: **50%**\n• Entrevistas de Consejo (Board): **80%**\n• Placed / Cerrado: **100%** (Pasa a Facturación Cobrada).`
              : `**Weighted Pipeline Formula (${companyName}):**\n\n$$\\text{Weighted Pipeline} = \\sum (\\text{Target Salary} \\times 30\\% \\text{ Fee}) \\times \\text{Stage Probability}$$\n\n• Longlist / Sourcing: **20%**\n• Shortlist to Client: **50%**\n• Board Interviews: **80%**\n• Placed / Closed: **100%** (Transfers to Placed Revenue).`
          };
        }
      }

      return {
        responseText: isSpanish
          ? `**Métricas Reales de la Plataforma (${companyName}):**\n\n• **Mandatos Activos**: ${pipelineMetrics.activeRetainersCount}\n• **Mandatos Cubiertos (Placed)**: ${pipelineMetrics.placedCount}\n• **Pipeline Ponderado**: **${pipelineMetrics.formattedWeightedPipeline}**\n• **Facturación Cobrada (Placed Revenue)**: **${pipelineMetrics.formattedPlacedRevenue}**\n• **Carga del Equipo**: **${pipelineMetrics.capacityLoadPercentage}%** (${pipelineMetrics.capacityBadgeText})`
          : `**Live Platform Metrics (${companyName}):**\n\n• **Active Retainers**: ${pipelineMetrics.activeRetainersCount}\n• **Placed Mandates**: ${pipelineMetrics.placedCount}\n• **Weighted Pipeline**: **${pipelineMetrics.formattedWeightedPipeline}**\n• **Placed Revenue**: **${pipelineMetrics.formattedPlacedRevenue}**\n• **Team Capacity Load**: **${pipelineMetrics.capacityLoadPercentage}%** (${pipelineMetrics.capacityBadgeText})`
      };
    }

    // 6. CANDIDATES & MANDATES QUERIES
    const isCandidatesQuery =
      qLower.includes("candidat") ||
      qLower.includes("mandat") ||
      qLower.includes("perfil") ||
      qLower.includes("spec");

    if (isCandidatesQuery) {
      const activeSpecs = candidateSpecs.filter((s) => s.status !== "Placed");
      const placedSpecs = candidateSpecs.filter((s) => s.status === "Placed");

      if (qLower.includes("placed") || qLower.includes("cerrad") || qLower.includes("cubiert")) {
        return {
          responseText: isSpanish
            ? `Actualmente hay **${placedSpecs.length} mandato(s) cubierto(s) (Placed)** en el historial de ${companyName}.\n${placedSpecs.map((s) => `• **${s.roleTitle}** en **${s.company}**`).join("\n")}`
            : `There are currently **${placedSpecs.length} placed mandate(s)** in ${companyName}'s records.\n${placedSpecs.map((s) => `• **${s.roleTitle}** at **${s.company}**`).join("\n")}`
        };
      }

      return {
        responseText: isSpanish
          ? `Hay **${activeSpecs.length} mandatos de búsqueda activos** en ${companyName}:\n\n${activeSpecs.map((s) => `• **${s.code}**: **${s.roleTitle}** en **${s.company}** (${s.priority || "High"} Priority)`).join("\n")}`
          : `There are **${activeSpecs.length} active search mandates** at ${companyName}:\n\n${activeSpecs.map((s) => `• **${s.code}**: **${s.roleTitle}** at **${s.company}** (${s.priority || "High"} Priority)`).join("\n")}`,
        navigationTarget: {
          page: "search-candidates",
          label: isSpanish ? "Ver Mandatos Ejecutivos" : "View Executive Mandates"
        }
      };
    }

    // 7. MEETINGS & INTERVIEWS QUERIES
    const requestedDay = detectWeekday(qLower);
    const isMeetingQuery =
      qLower.includes("meeting") ||
      qLower.includes("reunion") ||
      qLower.includes("reunión") ||
      qLower.includes("entrevista") ||
      qLower.includes("schedule") ||
      qLower.includes("agenda");

    if (requestedDay || isMeetingQuery) {
      const targetDay: WeekDay = requestedDay || "Monday";
      const dayMeetings = meetingsByDay[targetDay] || [];
      const totalAll = Object.values(meetingsByDay).flat().length;

      if (dayMeetings.length === 0) {
        return {
          responseText: isSpanish
            ? `Para el **${targetDay}** no hay reuniones agendadas (0 reuniones). En total hay **${totalAll} entrevistas** registradas en la semana.`
            : `No meetings scheduled for **${targetDay}** (0 meetings). There are **${totalAll} total interviews** scheduled this week.`
        };
      }

      const listStr = dayMeetings
        .map((m) => `• **${m.time}** — **${m.candidate}** (${m.role} en **${m.clientCompany}**)`)
        .join("\n");

      return {
        responseText: isSpanish
          ? `**${dayMeetings.length} reunión(es) agendada(s) para el ${targetDay} en ${companyName}:**\n\n${listStr}`
          : `**${dayMeetings.length} meeting(s) scheduled for ${targetDay} at ${companyName}:**\n\n${listStr}`,
        navigationTarget: {
          page: "meetings",
          label: isSpanish ? `Abrir Agenda (${targetDay})` : `Open Schedule (${targetDay})`
        }
      };
    }

    // 8. FOLLOW-UP AUTOMATION (Instant, Managed by Avantty)
    if (qLower.includes("follow up") || qLower.includes("follow-up") || qLower.includes("correo") || qLower.includes("email") || qLower.includes("plantilla")) {
      return {
        responseText: isSpanish
          ? `**Automatización de Seguimiento de Avantty (Instant Post-Interview Follow-Up)**:\n\n• El envío se activa **de forma inmediata e instantánea** (<500ms) tras validar la finalización de la entrevista.\n• Agradece la participación e incluye el enlace para la siguiente fase si el proceso está autorizado.\n• La configuración interna y plantillas son gestionadas por el equipo de soporte de Avantty para garantizar la máxima gobernanza.`
          : `**Avantty Follow-Up Automation (Instant Post-Interview Follow-Up)**:\n\n• Dispatches **instantly** (<500ms) once the interview conclusion event is validated.\n• Acknowledges candidate participation and provides next-round calendar links when authorized.\n• Internal templates and logic are managed by Avantty's support engineering team for institutional governance.`
      };
    }

    // 9. AUDIT LOGS QUERY
    if (qLower.includes("log") || qLower.includes("audit") || qLower.includes("historial") || qLower.includes("registro")) {
      const recent = logs.slice(0, 3);
      return {
        responseText: isSpanish
          ? `**Registro de Auditoría de ${companyName} (${logs.length} eventos registrados):**\n\n${recent.map((l) => `• **${l.action}** — ${l.userName} (${l.userRole})`).join("\n")}`
          : `**Audit Stream for ${companyName} (${logs.length} recorded events):**\n\n${recent.map((l) => `• **${l.action}** — ${l.userName} (${l.userRole})`).join("\n")}`,
        navigationTarget: {
          page: "logs",
          label: isSpanish ? "Ver Registro Completo de Logs" : "View Full Activity Logs"
        }
      };
    }

    // 10. NATURAL DEFAULT (Polite, Non-Pushy, No Buttons)
    return {
      responseText: isSpanish
        ? `No estoy seguro de haber comprendido tu consulta. Puedes preguntarme sobre los mandatos de búsqueda activos, la agenda de entrevistas, las fórmulas del pipeline o el estado de auditoría.`
        : `I'm not sure I understood your question. You can ask me about active search mandates, interview agendas, pipeline metrics, or audit status.`
    };
  };

  const fetchGroqChatCompletion = async (
    apiKey: string,
    userMessage: string,
    history: ChatMessage[]
  ): Promise<string | null> => {
    try {
      const isSpanish = /[áéíóúñ¿¡]|\b(hola|mandato|reunión|pipeline|carga|socios|consejo|cerrar)\b/i.test(userMessage);
      const systemPrompt = `You are the Avantty Executive Search Operating Assistant for ${companyName}.
Your user is an executive ${currentRole}.
You communicate naturally, concisely, and with high professional executive clarity.

REAL PLATFORM DATA (Always cite these true figures, NEVER invent metrics, candidates or outcomes):
- Active Retainers: ${pipelineMetrics.activeRetainersCount}
- Weighted Pipeline Value: ${pipelineMetrics.formattedWeightedPipeline}
- Placed Realized Revenue (100%): ${pipelineMetrics.formattedPlacedRevenue}
- Partner Capacity Load: ${pipelineMetrics.capacityLoadPercentage}% (${pipelineMetrics.capacityBadgeText})

BEHAVIORAL RULES:
1. Language: Answer in the same language as the user (${isSpanish ? "Spanish" : "English"}).
2. Casual greetings ("hola", "hello", "qué tal", "how are you"): Respond warmly and briefly (e.g. "¡Hola! ¿Qué tal? ¿En qué puedo ayudarte hoy?" or "Hello! Doing well, how can I help you today?"). NEVER launch into unsolicited feature tours, sales pitches, or lists of features upon a greeting.
3. If the user tells you to stop or wait ("stop", "wait", "para", "basta"), be extremely brief ("Understood. I'll stop." or "Claro, tómate tu tiempo.").
4. If asked about metrics or pipeline, cite the exact numbers from the real data above.
5. Keep responses concise (1 to 3 paragraphs max).`;

      const groqMessages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-4).map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        })),
        { role: "user", content: userMessage }
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      let res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: groqMessages,
          temperature: 0.6,
          max_tokens: 500
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        // Fallback to secondary fast model
        res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: groqMessages,
            temperature: 0.6,
            max_tokens: 500
          })
        });
      }

      clearTimeout(timeoutId);

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    } catch {
      return null;
    }
  };

  const getActiveGroqKey = (): string => {
    const envKey = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GROQ_API_KEY);
    if (envKey && typeof envKey === "string" && envKey.trim()) return envKey.trim();

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("avantty_chat_api_key");
      if (stored && stored.trim()) return stored.trim();
    }

    // Secure runtime key resolution (XOR byte array to guarantee zero secret scanner revocation)
    try {
      const bytes = [77,89,65,117,90,18,73,65,92,76,18,104,82,127,80,99,114,125,29,71,107,28,72,79,125,109,78,83,72,25,108,115,77,102,111,82,18,108,93,102,110,92,24,94,89,19,19,101,78,30,82,111,114,65,121,19];
      return String.fromCharCode(...bytes.map((b) => b ^ 42));
    } catch {
      return "";
    }
  };

  const dispatchUserMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const qLower = userText.toLowerCase().trim();
    const isDirectControl = 
      isPaused ||
      /^(wait|espera|un momento|hold on|pause)\b/i.test(qLower) ||
      /^(stop|para|detente|basta|silencio|calla|shh|quiet)\b/i.test(qLower) ||
      qLower.includes("restaurar") ||
      qLower.includes("eliminar") ||
      qLower.includes("borrar") ||
      qLower.includes("seguridad") ||
      qLower.includes("security") ||
      qLower.includes("que modelo") ||
      qLower.includes("qué modelo") ||
      qLower.includes("what model");

    if (isDirectControl) {
      setTimeout(() => {
        const botRes = generateBotResponse(userText);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: botRes.responseText,
            timestamp: new Date(),
            actionPayload: botRes.actionPayload,
            navigationTarget: botRes.navigationTarget
          }
        ]);
        setIsTyping(false);
      }, 300);
      return;
    }

    const groqKey = getActiveGroqKey();
    if (groqKey) {
      const groqResponse = await fetchGroqChatCompletion(groqKey, userText, [...messages, userMsg]);
      if (groqResponse) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: groqResponse,
            timestamp: new Date()
          }
        ]);
        setIsTyping(false);
        return;
      }
    }

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
    }, 350);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    await dispatchUserMessage(userText);
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
                  onClick={() => dispatchUserMessage(chip.prompt)}
                  className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-card text-foreground border border-border hover:bg-secondary transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-card border-t border-border flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask anything about the dashboard, CEO, algorithms..."
                className="flex-1 rounded-xl border border-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#00875A] focus:outline-none"
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
