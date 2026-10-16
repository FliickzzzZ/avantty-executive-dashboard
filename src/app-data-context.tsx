import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, FollowUpDispatch, CriticalSecurityIncident, SystemSnapshot, MOCK_USERS } from "@/src/types";
import { MeetingItem, WeekDay, INITIAL_MEETINGS_BY_DAY } from "@/components/meetings-view";
import { CandidateSearchSpec, INITIAL_CANDIDATE_SPECS } from "@/components/search-candidates-view";
import { useLogs } from "@/src/logs-context";

export const DEFAULT_FOLLOWUP_SUBJECT = "Executive Search Debrief & Next Placement Stages — [Interview Role] at [Client Company]";
export const DEFAULT_FOLLOWUP_BODY = `Dear [Candidate Name],

Thank you for participating in our executive search briefing today regarding the [Interview Role] placement at [Client Company].

Our Executive Search Partners thoroughly enjoyed reviewing your track record in enterprise scaling, P&L management, and strategic leadership. Following today's session with [Interviewer Name], we are compiling your executive dossier for presentation to the Client's Nomination and Governance Board.

As a next step, our Senior Partner team will coordinate directly with you regarding board-level interview debriefs and scheduling within 24–48 hours.

Should you require any additional materials or have questions regarding the target client organization, please feel free to reach out directly.

Best regards,
The Avantty Executive Search Partner Practice
https://avantty.com`;

export interface TeamAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  title: string;
}

const FEMALE_FIRST_NAMES = new Set([
  "elena", "sofia", "amanda", "michelle", "caity", "erin", "kathy", "lisa", 
  "maggie", "emily", "victoria", "allison", "dana", "barbara", "shabnam", 
  "fiona", "kristen", "danielle", "savannah", "tanya", "tricia", "mary", 
  "heva", "dora", "dawn", "alice", "sara", "tina", "patty", "manon", 
  "morgan", "jacqueline", "marian", "jessica", "shannon", "margie", "pam", 
  "cherie", "marie", "lucy", "zuleika", "myra", "susanna", "nancy", "pamela", 
  "natalie", "christina", "kate", "ina", "louise", "dale", "eleni", "angela", 
  "karolina", "gina", "maria", "laura", "ana", "carmen", "lucia", "paula", 
  "marta", "andrea", "claudia", "beatriz", "patricia", "nuria", "raquel", 
  "eva", "silvia", "rosa", "alba", "julia", "emma", "sarah", "rachel", 
  "jennifer", "jess", "samantha", "hannah", "ashley", "olivia", "chloe", 
  "nicole", "claire", "megan", "stephanie", "vanessa", "carolina", "valeria",
  "lauren", "courtney", "heather", "kelly", "rebecca", "melissa", "amy",
  "steph", "katie", "jenny", "beth", "meg", "clara", "isabel", "isabella",
  "olga", "irene", "sonia", "monica", "alicia", "teresa", "mercedes", "gemma"
]);

const MALE_FIRST_NAMES = new Set([
  "naim", "adam", "jared", "charles", "carlos", "javier", "graydon", "nolan", 
  "jeff", "lewis", "tom", "joshua", "todd", "jonathan", "mike", "jean", 
  "ronald", "christopher", "casey", "bert", "andre", "kris", "stewart", 
  "jordan", "steven", "sebastian", "robert", "gerald", "david", "lonny", 
  "friedrich", "randy", "larry", "amit", "ed", "hayes", "matthew", "marko", 
  "calvin", "luciano", "ken", "john", "jim", "ari", "aaron", "gordon", 
  "ian", "kevin", "lee", "jack", "christian", "adriaan", "bill", "henry-paul", 
  "josh", "eric", "kingsley", "brian", "brendan", "chris", "thomas", "maurice", 
  "ryan", "oliver", "sumit", "jake", "jamie", "jerome", "justin", "gene", 
  "corey", "alan", "leo", "ron", "jacob", "steve", "edward", "art", 
  "kenneth", "rich", "tyler", "russell", "jon", "fraser", "james", "daniel", 
  "caleb", "gustavo", "lane", "cliff", "jason", "raj", "howard", "ben", 
  "dan", "greg", "arthur", "brett", "dominic", "mikal", "jimmy", "bruce", 
  "paul", "mark", "gregory", "joe", "scott", "sam", "alex", "nathan",
  "pedro", "alejandro", "manuel", "jose", "antonio", "francisco", "david",
  "juan", "miguel", "angel", "fernando", "pablo", "sergio", "jorge", "alberto",
  "alvaro", "adrian", "diego", "raul", "ivan", "ruben", "oscar", "victor"
]);

export const MALE_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";
export const FEMALE_AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80";

export function detectIsMale(fullName: string): boolean {
  if (!fullName) return false;
  const first = fullName.trim().toLowerCase().split(/[\s-]+/)[0];
  if (MALE_FIRST_NAMES.has(first)) return true;
  if (FEMALE_FIRST_NAMES.has(first)) return false;
  if (first.endsWith("a") || first.endsWith("ette") || first.endsWith("ina") || first.endsWith("elle")) {
    return false;
  }
  return true;
}

export function getDynamicTeamAccounts(config: WhiteLabelConfig): TeamAccount[] {
  const companyName = (config.isCustomized && config.companyName && config.companyName.trim())
    ? config.companyName.trim()
    : "Avantty";
  
  const rawWeb = (config.website && config.website.trim() && config.website !== "avantty.com" && !config.website.includes("avantty"))
    ? config.website.trim()
    : `${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
    
  const website = rawWeb.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const ceoName = (config.isCustomized && config.contactName && config.contactName.trim())
    ? config.contactName.trim()
    : "Naim Ramos";
    
  const isMale = detectIsMale(ceoName);
  const ceoAvatar = isMale ? MALE_AVATAR : FEMALE_AVATAR;
  const firstPart = ceoName.trim().toLowerCase().split(/\s+/)[0];
  const ceoEmail = `${firstPart}@${website}`;

  return [
    {
      id: "acc-1",
      name: ceoName,
      email: ceoEmail,
      avatar: ceoAvatar,
      role: "CEO",
      title: "Managing Partner & CEO"
    },
    {
      id: "acc-2",
      name: "Carlos Mendez",
      email: `carlos@${website}`,
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      role: "Recruiter",
      title: "Senior Headhunting Consultant"
    },
    {
      id: "acc-3",
      name: "Sofia Chen",
      email: `sofia@${website}`,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      role: "Sourcer",
      title: "Executive Talent Sourcer"
    }
  ];
}

export function getDynamicUser(role: UserRole, config: WhiteLabelConfig) {
  const accounts = getDynamicTeamAccounts(config);
  const acc = accounts.find((a) => a.role === role) || accounts[0];
  return {
    name: `${acc.name} (${role})`,
    rawName: acc.name,
    email: acc.email,
    avatar: acc.avatar,
  };
}

export const INITIAL_TEAM_ACCOUNTS: TeamAccount[] = [
  {
    id: "acc-1",
    name: "Naim Ramos",
    email: "naim@avanttyops.com",
    avatar: MALE_AVATAR,
    role: "CEO",
    title: "Managing Partner & CEO"
  },
  {
    id: "acc-2",
    name: "Carlos Mendez",
    email: "recruiter@avanttyops.com",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    role: "Recruiter",
    title: "Senior Headhunting Consultant"
  },
  {
    id: "acc-3",
    name: "Sofia Chen",
    email: "sourcer@avanttyops.com",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "Sourcer",
    title: "Executive Talent Sourcer"
  }
];

export const INITIAL_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  CEO: ["dashboard", "meetings", "search-candidates", "follow-ups", "logs"],
  Recruiter: ["meetings", "search-candidates", "follow-ups"],
  Sourcer: ["meetings", "search-candidates", "follow-ups"]
};

export interface WhiteLabelConfig {
  companyName: string;
  contactName: string;
  industry: string;
  tagline: string;
  pipelineMetric: string;
  themeColor: "emerald" | "blue" | "indigo" | "amber" | "rose" | "purple";
  website: string;
  customWelcome: string;
  isCustomized: boolean;
  isClientView: boolean;
}

export const DEFAULT_WHITE_LABEL: WhiteLabelConfig = {
  companyName: "Avantty",
  contactName: "Naim Ramos",
  industry: "Executive Search & Retained Mandates",
  tagline: "Enterprise Headhunting & Retainer Platform",
  pipelineMetric: "$2.4M Pipeline • 12 Active Retainers",
  themeColor: "emerald",
  website: "avanttyops.com",
  customWelcome: "Executive Search Command Center",
  isCustomized: false,
  isClientView: false
};

export function slugifyCompanyName(name: string): string {
  if (!name) return "client";
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function unslugifyCompanyName(slug: string): string {
  if (!slug) return "Client Partner";
  return slug
    .split(/[-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export interface SubdomainValidation {
  isValid: boolean;
  subdomain: string;
  error?: string;
  dnsRequirements: string;
}

export function validateSubdomain(name: string): SubdomainValidation {
  const clean = slugifyCompanyName(name);
  const dnsReq = "Requires external Wildcard DNS (*.avanttyops.com) or CNAME record on Cloudflare/DNS provider.";
  
  if (!clean || clean.length < 3) {
    return {
      isValid: false,
      subdomain: clean,
      error: "Subdomain must contain at least 3 characters.",
      dnsRequirements: dnsReq
    };
  }
  if (clean.length > 63) {
    return {
      isValid: false,
      subdomain: clean.slice(0, 63),
      error: "Subdomain exceeds maximum length of 63 characters.",
      dnsRequirements: dnsReq
    };
  }
  const reserved = ["admin", "api", "auth", "mail", "dev", "staging", "app", "dashboard", "root", "dns", "login", "ssl"];
  if (reserved.includes(clean)) {
    return {
      isValid: false,
      subdomain: clean,
      error: `'${clean}' is a reserved infrastructure prefix and cannot be used.`,
      dnsRequirements: dnsReq
    };
  }
  return {
    isValid: true,
    subdomain: clean,
    dnsRequirements: dnsReq
  };
}

export function parseWhiteLabelFromUrl(): WhiteLabelConfig | null {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname.toLowerCase();
  const search = window.location.search;
  const hash = window.location.hash;
  const pathname = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(search || (hash.startsWith("#?") ? hash.slice(1) : ""));
  
  let company = params.get("company") || params.get("c");
  let contact = params.get("contact") || params.get("p") || params.get("name");
  let isFromSlug = false;
  
  // 1. Detect subdomain format: demodashboard-empresa.avanttyops.com or empresa.avanttyops.com
  if (!company && (hostname.includes("demodashboard-") || (hostname.endsWith(".avanttyops.com") && !hostname.startsWith("demodashboard.") && !hostname.startsWith("www.")))) {
    const subPart = hostname.split(".")[0];
    const extracted = subPart.replace("demodashboard-", "").trim();
    if (extracted) {
      company = unslugifyCompanyName(extracted);
      isFromSlug = true;
    }
  }
  
  // 2. Detect clean pathname format: /artificially or /buckingham or /worth
  if (!company && pathname && pathname !== "/" && !pathname.includes(".")) {
    const cleanPath = pathname.replace(/^\/(p\/)?/, "").replace(/\/$/, "").trim();
    const systemRoutes = ["dashboard", "candidates", "meetings", "logs", "login", "admin", "index", "follow-ups", "search-candidates"];
    if (cleanPath && !systemRoutes.includes(cleanPath)) {
      isFromSlug = true;
      if (cleanPath === "artificially" || cleanPath === "fernando") {
        company = "Artificially";
        contact = "Fernando Tomé";
      } else if (cleanPath === "buckingham" || cleanPath === "buckinghamsearch" || cleanPath === "marcus") {
        company = "Buckingham Search";
        contact = "Marcus Vance";
      } else if (cleanPath === "worth" || cleanPath === "worthsearch" || cleanPath === "victoria") {
        company = "Worth Search";
        contact = "Victoria Sterling";
      } else {
        company = unslugifyCompanyName(cleanPath);
      }
    }
  }

  if (!company) return null;
  
  const isClient = isFromSlug || params.get("client") === "true" || params.get("view") === "client" || params.get("v") === "c" || params.get("cl") === "1" || hostname.includes("demodashboard-");
  
  const config: WhiteLabelConfig = {
    companyName: company,
    contactName: contact || "Managing Partner",
    industry: params.get("industry") || params.get("ind") || "Executive Search & Retained Mandates",
    tagline: params.get("tagline") || params.get("tag") || "Enterprise Headhunting & Retainer Platform",
    pipelineMetric: params.get("pipeline") || params.get("pipe") || "$3.2M Pipeline • 12 Active Retainers",
    themeColor: "emerald",
    website: params.get("website") || params.get("web") || `${company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    customWelcome: params.get("welcome") || params.get("w") || `Custom Portal for ${company}`,
    isCustomized: true,
    isClientView: isClient
  };

  return config;
}

export function generateWhiteLabelUrl(
  config: WhiteLabelConfig, 
  customBaseUrl?: string,
  mode: "slug" | "subdomain" | "query" = "slug"
): string {
  if (typeof window === "undefined") return "";
  
  const companySlug = slugifyCompanyName(config.companyName || "client");
  
  // Resolve base URL from current environment if available
  let baseOrigin = "https://demodashboard.avanttyops.com";
  if (customBaseUrl && customBaseUrl !== "null" && customBaseUrl.trim() !== "") {
    baseOrigin = customBaseUrl.replace(/\/+$/, "");
  } else if (typeof window !== "undefined" && window.location.origin && window.location.origin !== "null") {
    baseOrigin = window.location.origin;
  }
  
  if (mode === "subdomain") {
    const isLocalhost = baseOrigin.includes("localhost") || baseOrigin.includes("127.0.0.1");
    if (isLocalhost) {
      return `${baseOrigin}/?company=${encodeURIComponent(config.companyName || "Client")}&subdomain=${companySlug}&client=true`;
    }
    return `https://${companySlug}.avanttyops.com`;
  }

  if (mode === "slug") {
    return `${baseOrigin}/${companySlug}`;
  }
  
  const params = new URLSearchParams();
  params.set("company", config.companyName || "Avantty");
  if (config.contactName) {
    params.set("contact", config.contactName);
  }
  params.set("client", "true");
  
  return `${baseOrigin}/?${params.toString()}`;
}

export function getCustomizedFollowUpTemplate(config: WhiteLabelConfig): FollowUpTemplateState {
  const company = (config.isCustomized && config.companyName && config.companyName.trim())
    ? config.companyName.trim()
    : "Avantty";
  const rawWeb = (config.website && config.website.trim() && config.website !== "avantty.com" && !config.website.includes("avantty"))
    ? config.website.trim()
    : `${company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  const web = rawWeb.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  return {
    subject: `Executive Search Debrief & Next Placement Stages — [Interview Role] at ${company}`,
    body: `Dear [Candidate Name],

Thank you for participating in our executive search briefing today regarding the [Interview Role] placement at ${company}.

Our Senior Partners thoroughly enjoyed reviewing your track record in enterprise scaling, P&L management, and strategic leadership. Following today's session with [Interviewer Name], our team is synthesizing your dossier for presentation to the Client Nomination and Governance Board.

As a next step, our executive team will coordinate directly with you regarding board-level interview debriefs and scheduling within 24–48 hours.

Should you require any additional materials or have questions regarding the target client organization, please feel free to reach out directly.

Best regards,
The ${company} Executive Search Team
https://${web}`
  };
}

export interface FollowUpTemplateState {
  subject: string;
  body: string;
}

const INITIAL_FOLLOWUP_DISPATCHES: FollowUpDispatch[] = [
  {
    id: "fup-1",
    candidateName: "Marcus Vance",
    candidateEmail: "marcus.vance@stripe-alum.com",
    role: "Chief Technology Officer (CTO)",
    clientCompany: "Veloce Labs",
    meetingId: "m-mon-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: "sent",
    subject: "Executive Search Debrief & Next Placement Stages — Chief Technology Officer (CTO) at Veloce Labs",
    body: "Dear Marcus,\n\nThank you for participating in our executive search briefing today regarding the CTO placement at Veloce Labs.\n\nOur Senior Partners thoroughly enjoyed reviewing your track record in scaling global core payment rails and your $48M engineering P&L leadership. We are finalizing your executive dossier for Veloce Labs Board of Directors.\n\nAs authorized by the lead partner, please access the confidential board calendar scheduling link below to coordinate your final interview round:\nhttps://avantty.com/schedule/veloce-cto-board\n\nBest regards,\nThe Avantty Executive Search Partner Practice",
    hasNextStageAuthorization: true,
    schedulingLink: "https://avantty.com/schedule/veloce-cto-board",
    dispatchLatencyMs: 420
  },
  {
    id: "fup-2",
    candidateName: "Elena Rostova",
    candidateEmail: "elena.rostova@snowflake-lead.io",
    role: "VP of Engineering",
    clientCompany: "Nexus AI Labs",
    meetingId: "m-mon-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: "sent",
    subject: "Executive Search Debrief & Next Placement Stages — VP of Engineering at Nexus AI Labs",
    body: "Dear Elena,\n\nThank you for joining our executive briefing today regarding the VP of Engineering placement at Nexus AI Labs.\n\nYour achievements managing 130+ distributed engineers and real-time inference pipelines strongly align with the client mandate. Our executive team is presenting your dossier to the client technical committee.\n\nPlease use the link below to select your debrief window with Executive Director David Kim:\nhttps://avantty.com/schedule/nexus-vpe-debrief\n\nBest regards,\nThe Avantty Executive Search Partner Practice",
    hasNextStageAuthorization: true,
    schedulingLink: "https://avantty.com/schedule/nexus-vpe-debrief",
    dispatchLatencyMs: 380
  },
  {
    id: "fup-3",
    candidateName: "Liam Chen",
    candidateEmail: "liam.chen@aura-ciso-candidate.com",
    role: "Chief Information Security Officer (CISO)",
    clientCompany: "Aura Health",
    meetingId: "m-mon-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    status: "sent",
    subject: "Executive Search Briefing Debrief — Chief Information Security Officer (CISO) at Aura Health",
    body: "Dear Liam,\n\nThank you for participating in our briefing today regarding the CISO retained mandate at Aura Health.\n\nOur team is currently synthesizing your security governance framework and compliance track record alongside the client's board committee specifications. We will revert with debrief feedback within 24–48 hours.\n\nBest regards,\nThe Avantty Executive Search Partner Practice",
    hasNextStageAuthorization: false,
    dispatchLatencyMs: 460
  }
];

interface AppDataContextType {
  // White-Label Pitch / Demo Customization
  whiteLabelConfig: WhiteLabelConfig;
  updateWhiteLabelConfig: (newConfig: Partial<WhiteLabelConfig>) => void;
  resetWhiteLabelConfig: () => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;

  // Team Accounts & Dynamic Permissions
  teamAccounts: TeamAccount[];
  updateAccountRole: (accountId: string, newRole: UserRole, requestingRole?: UserRole) => void;
  rolePermissions: Record<UserRole, string[]>;
  updateRolePermissions: (role: UserRole, allowedPages: string[], requestingRole?: UserRole) => void;

  // Meetings state & recovery
  meetingsByDay: Record<WeekDay, MeetingItem[]>;
  setMeetingsByDay: React.Dispatch<React.SetStateAction<Record<WeekDay, MeetingItem[]>>>;
  endedMeetingsLedger: MeetingItem[];
  deletedMeetingsBuffer: MeetingItem[]; // aliased for backward compatibility
  endMeeting: (meetingId: string, currentRole?: UserRole, selectedDay?: WeekDay, reason?: string) => void;
  sourceMeeting: (meetingId: string, currentRole?: UserRole, selectedDay?: WeekDay) => void; // aliased
  reopenMeeting: (meetingId: string, currentRole?: UserRole) => boolean;
  restoreLastMeeting: (selectedDay: WeekDay) => boolean;
  restoreMeetingById: (meetingId: string, currentRole?: UserRole) => boolean;
  deleteMeetingPermanently: (meetingId: string, currentRole?: UserRole) => void;
  revertAllMeetings: (currentRole?: UserRole) => void;

  // Candidates / Mandates state & recovery
  candidateSpecs: CandidateSearchSpec[];
  setCandidateSpecs: React.Dispatch<React.SetStateAction<CandidateSearchSpec[]>>;
  deletedSpecsBuffer: CandidateSearchSpec[];
  sourceCandidateSpec: (specId: string, currentRole: UserRole) => void;
  markMandatePlaced: (specId: string, currentRole?: UserRole) => void;
  restoreLastCandidateSpec: () => boolean;
  deleteCandidateSpecPermanently: (specId: string, currentRole?: UserRole) => void;
  revertAllCandidateSpecs: (currentRole?: UserRole) => void;
  addCandidateSpec: (spec: CandidateSearchSpec) => void;

  // Follow Up Templates & Automation
  followUpTemplate: FollowUpTemplateState;
  setFollowUpTemplate: (tpl: FollowUpTemplateState) => void;
  templateBuffer: FollowUpTemplateState[];
  updateFollowUpTemplate: (newTpl: FollowUpTemplateState, currentRole: UserRole) => void;
  restoreLastFollowUpTemplate: () => boolean;
  followUpDispatches: FollowUpDispatch[];
  triggerInstantFollowUp: (meeting: MeetingItem) => FollowUpDispatch;

  // Focused Target Selection
  focusedMeetingId: string | null;
  setFocusedMeetingId: (id: string | null) => void;
  focusedSpecId: string | null;
  setFocusedSpecId: (id: string | null) => void;

  // Security Lockout & Enterprise Restoration
  isSystemCritical: boolean;
  setIsSystemCritical: React.Dispatch<React.SetStateAction<boolean>>;
  registerDeletionAction: (
    currentRole: UserRole,
    context?: { resourceType: "candidate_specs" | "meetings" | "followups"; resourceId: string; resourceName: string }
  ) => boolean;
  unlockSystemCritical: (authorizingRole: UserRole) => void;
  systemSnapshots: SystemSnapshot[];
  restoreFromSnapshot: (snapshotId?: string, authorizingRole?: UserRole) => boolean;
  activeSecurityIncident: CriticalSecurityIncident | null;
  setActiveSecurityIncident: (incident: CriticalSecurityIncident | null) => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addLog, addCriticalIncident, resolveCriticalIncident } = useLogs();

  // White-label pitch customization state
  const [whiteLabelConfig, setWhiteLabelConfig] = useState<WhiteLabelConfig>(() => {
    const urlConfig = parseWhiteLabelFromUrl();
    if (urlConfig) {
      try {
        localStorage.setItem("avantty_white_label", JSON.stringify(urlConfig));
      } catch (e) {}
      return urlConfig;
    }
    return DEFAULT_WHITE_LABEL;
  });

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const updateWhiteLabelConfig = (newConfig: Partial<WhiteLabelConfig>) => {
    setWhiteLabelConfig((prev) => {
      const updated: WhiteLabelConfig = { ...prev, ...newConfig, isCustomized: true };
      localStorage.setItem("avantty_white_label", JSON.stringify(updated));
      return updated;
    });

    addLog({
      category: "System",
      action: `White-Label Branding Applied: ${newConfig.companyName || whiteLabelConfig.companyName}`,
      details: `Applied customized client portal branding. Headline: "${newConfig.tagline || whiteLabelConfig.tagline}".`,
      level: "action",
      userRole: "CEO"
    });
  };

  const resetWhiteLabelConfig = () => {
    setWhiteLabelConfig(DEFAULT_WHITE_LABEL);
    localStorage.removeItem("avantty_white_label");
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    addLog({
      category: "System",
      action: "Reset Portal Branding to Avantty Enterprise",
      details: "Default firm branding restored.",
      level: "info",
      userRole: "CEO"
    });
  };

  // Team Accounts & Dynamic Role Permissions State
  const [teamAccounts, setTeamAccounts] = useState<TeamAccount[]>(() => {
    return getDynamicTeamAccounts(whiteLabelConfig);
  });

  useEffect(() => {
    setTeamAccounts(getDynamicTeamAccounts(whiteLabelConfig));
  }, [whiteLabelConfig]);

  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>(() => {
    const saved = localStorage.getItem("avantty_role_permissions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            CEO: Array.isArray(parsed.CEO) && parsed.CEO.length > 0 ? parsed.CEO : INITIAL_ROLE_PERMISSIONS.CEO,
            Recruiter: Array.isArray(parsed.Recruiter) && parsed.Recruiter.length > 0 ? parsed.Recruiter : INITIAL_ROLE_PERMISSIONS.Recruiter,
            Sourcer: Array.isArray(parsed.Sourcer) && parsed.Sourcer.length > 0 ? parsed.Sourcer : INITIAL_ROLE_PERMISSIONS.Sourcer,
          };
        }
      } catch (e) {}
    }
    return INITIAL_ROLE_PERMISSIONS;
  });

  const updateAccountRole = (accountId: string, newRole: UserRole, requestingRole: UserRole = "CEO") => {
    setTeamAccounts((prev) => {
      const next = prev.map((acc) => (acc.id === accountId ? { ...acc, role: newRole } : acc));
      localStorage.setItem("avantty_team_accounts", JSON.stringify(next));
      return next;
    });

    const targetAccount = teamAccounts.find((a) => a.id === accountId);
    addLog({
      category: "Role & Auth",
      action: `Updated User Role: ${targetAccount?.name || accountId} → ${newRole}`,
      details: `Permissions modified by ${requestingRole}. User now operates under ${newRole} role profile.`,
      level: "action",
      userRole: requestingRole
    });
  };

  const updateRolePermissions = (role: UserRole, allowedPages: string[], requestingRole: UserRole = "CEO") => {
    setRolePermissions((prev) => {
      const next = { ...prev, [role]: allowedPages };
      localStorage.setItem("avantty_role_permissions", JSON.stringify(next));
      return next;
    });

    addLog({
      category: "Role & Auth",
      action: `Updated Module Permissions for ${role}`,
      details: `Visible sections modified to: [${allowedPages.join(", ")}] by ${requestingRole}`,
      level: "action",
      userRole: requestingRole
    });
  };

  // 1. Meetings State
  const [meetingsByDay, setMeetingsByDay] = useState<Record<WeekDay, MeetingItem[]>>(INITIAL_MEETINGS_BY_DAY);
  const [endedMeetingsLedger, setEndedMeetingsLedger] = useState<MeetingItem[]>([]);

  // 2. Candidate Mandates State
  const [candidateSpecs, setCandidateSpecs] = useState<CandidateSearchSpec[]>(INITIAL_CANDIDATE_SPECS);
  const [deletedSpecsBuffer, setDeletedSpecsBuffer] = useState<CandidateSearchSpec[]>([]);

  // 3. Follow Up Template State & Instant Dispatches
  const [followUpTemplate, setFollowUpTemplate] = useState<FollowUpTemplateState>(() => ({
    subject: localStorage.getItem("avantty_followup_template_subject") || DEFAULT_FOLLOWUP_SUBJECT,
    body: localStorage.getItem("avantty_followup_template_body") || DEFAULT_FOLLOWUP_BODY,
  }));
  const [templateBuffer, setTemplateBuffer] = useState<FollowUpTemplateState[]>([]);
  const [followUpDispatches, setFollowUpDispatches] = useState<FollowUpDispatch[]>(INITIAL_FOLLOWUP_DISPATCHES);

  // 4. Focused Target from Global Search
  const [focusedMeetingId, setFocusedMeetingId] = useState<string | null>(null);
  const [focusedSpecId, setFocusedSpecId] = useState<string | null>(null);

  // 5. Security Lockout & Enterprise Restoration State
  const [isSystemCritical, setIsSystemCritical] = useState<boolean>(false);
  const [deletionTimestamps, setDeletionTimestamps] = useState<number[]>([]);
  const [systemSnapshots, setSystemSnapshots] = useState<SystemSnapshot[]>([]);
  const [activeSecurityIncident, setActiveSecurityIncident] = useState<CriticalSecurityIncident | null>(null);

  // Instant Post-Interview Follow-Up Trigger (Dispatched upon Meeting Ended)
  const triggerInstantFollowUp = (meeting: MeetingItem): FollowUpDispatch => {
    // Check if dispatch already exists for idempotency
    const existing = followUpDispatches.find((d) => d.meetingId === meeting.id);
    if (existing) return existing;

    const hasNextStageAuth = Boolean(
      meeting.placementVerdict?.toLowerCase().includes("recommend") ||
      meeting.executiveFitScore?.includes("9")
    );

    const comp = whiteLabelConfig.isCustomized ? whiteLabelConfig.companyName : "Avantty";
    const candidateSlug = meeting.candidate.toLowerCase().replace(/[^a-z0-9]/g, "");
    const candidateEmail = `${candidateSlug}@executive-network.com`;

    let emailSubject = `Executive Search Debrief & Next Placement Stages — ${meeting.role} at ${meeting.clientCompany}`;
    let emailBody = `Dear ${meeting.candidate},

Thank you for participating in our executive search briefing today regarding the ${meeting.role} placement at ${meeting.clientCompany}.

Our Senior Partners thoroughly enjoyed reviewing your track record in enterprise scaling, executive leadership, and strategic execution. Following today's session with ${meeting.interviewer}, our team is synthesizing your dossier for presentation to the Client Nomination and Governance Board.`;

    if (hasNextStageAuth) {
      emailBody += `\n\nAs authorized by the lead partner, please access your confidential scheduling link below to book your final board evaluation round:\nhttps://avantty.com/schedule/${meeting.id}\n\nWe look forward to advancing your candidacy.`;
    } else {
      emailBody += `\n\nOur Senior Partner team will coordinate directly with you regarding evaluation milestones and next steps within 24–48 hours.\n\nShould you have any questions in the meantime, please feel free to reply directly to this communication.`;
    }

    emailBody += `\n\nBest regards,\nThe ${comp} Executive Search Partner Practice\nhttps://avantty.com`;

    const newDispatch: FollowUpDispatch = {
      id: `disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      candidateName: meeting.candidate,
      candidateEmail,
      role: meeting.role,
      clientCompany: meeting.clientCompany,
      meetingId: meeting.id,
      timestamp: new Date().toISOString(),
      status: "sent",
      subject: emailSubject,
      body: emailBody,
      hasNextStageAuthorization: hasNextStageAuth,
      schedulingLink: hasNextStageAuth ? `https://avantty.com/schedule/${meeting.id}` : undefined,
      dispatchLatencyMs: 340
    };

    setFollowUpDispatches((prev) => [newDispatch, ...prev]);

    addLog({
      category: "Follow Ups",
      action: `Instant Follow-Up Sent: ${meeting.candidate}`,
      details: `Automated post-interview dispatch executed for ${meeting.candidate} (${meeting.role} at ${meeting.clientCompany}). Authorization: ${hasNextStageAuth ? "Next Stage Approved" : "Pending Governance Review"}.`,
      level: "success",
      userRole: "CEO"
    });

    return newDispatch;
  };

  // Register deletion & evaluate mass-deletion security threshold
  const registerDeletionAction = (
    currentRole: UserRole,
    context?: { resourceType: "candidate_specs" | "meetings" | "followups"; resourceId: string; resourceName: string }
  ): boolean => {
    const now = Date.now();
    const recent = deletionTimestamps.filter((t) => now - t < 10000);
    const updated = [...recent, now];
    setDeletionTimestamps(updated);

    // If 3 or more deletions occur within 10 seconds, trigger Mass Deletion Alert
    if (updated.length >= 3) {
      // Capture immutable snapshot prior to data loss
      const snapshot: SystemSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toISOString(),
        description: `Pre-Incident Snapshot before Mass Deletion by ${currentRole}`,
        itemCount: {
          meetings: Object.values(meetingsByDay).flat().length,
          specs: candidateSpecs.length,
          dispatches: followUpDispatches.length
        },
        data: {
          meetingsByDay: JSON.parse(JSON.stringify(meetingsByDay)),
          candidateSpecs: JSON.parse(JSON.stringify(candidateSpecs)),
          followUpDispatches: JSON.parse(JSON.stringify(followUpDispatches))
        }
      };

      setSystemSnapshots((prev) => [snapshot, ...prev]);

      const incident = addCriticalIncident({
        initiatedBy: {
          name: MOCK_USERS[currentRole]?.name || currentRole,
          email: MOCK_USERS[currentRole]?.email || `${currentRole.toLowerCase()}@avanttyops.com`,
          role: currentRole
        },
        severity: "CRITICAL",
        eventType: "MASS_DELETION_ATTEMPT",
        description: `High-velocity deletion threshold exceeded: ${updated.length} resources targeted in < 10.0 seconds. Mutation rights suspended awaiting CEO authorization.`,
        affectedResources: {
          resourceType: context?.resourceType || "candidate_specs",
          count: updated.length,
          resourceIds: context?.resourceId ? [context.resourceId] : [],
          resourceNames: context?.resourceName ? [context.resourceName] : []
        },
        technicalMetadata: {
          ipSubnetMasked: "192.168.1.xxx (Masked)",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Enterprise Browser",
          requestPath: typeof window !== "undefined" ? window.location.pathname : "/app",
          actionVelocity: `${updated.length} actions in < 10.0s`
        },
        snapshotAvailable: true,
        snapshotId: snapshot.id
      });

      setActiveSecurityIncident(incident);
      setIsSystemCritical(true);
      return true;
    }
    return false;
  };

  const unlockSystemCritical = (authorizingRole: UserRole) => {
    setIsSystemCritical(false);
    setDeletionTimestamps([]);
    addLog({
      category: "Security & Audit",
      action: "System Critical Lockout Lifted",
      details: `CEO authorization granted by ${authorizingRole}. System unlocked.`,
      level: "success",
      userRole: authorizingRole,
    });
  };

  const restoreFromSnapshot = (snapshotId?: string, authorizingRole: UserRole = "CEO"): boolean => {
    if (authorizingRole !== "CEO") {
      addLog({
        category: "Security & Audit",
        action: "Unauthorized System Restore Blocked",
        details: `Non-CEO rank (${authorizingRole}) attempted snapshot rollback.`,
        level: "warning",
        userRole: authorizingRole
      });
      return false;
    }

    const targetSnapshot = snapshotId
      ? systemSnapshots.find((s) => s.id === snapshotId)
      : systemSnapshots[0];

    if (!targetSnapshot) return false;

    setMeetingsByDay(targetSnapshot.data.meetingsByDay);
    setCandidateSpecs(targetSnapshot.data.candidateSpecs);
    setFollowUpDispatches(targetSnapshot.data.followUpDispatches);
    setIsSystemCritical(false);
    setDeletionTimestamps([]);

    if (activeSecurityIncident) {
      resolveCriticalIncident(activeSecurityIncident.id, authorizingRole, "RESTORED");
      setActiveSecurityIncident(null);
    }

    addLog({
      category: "Security & Audit",
      action: "CEO Authorized System Snapshot Rollback",
      details: `Restored ${targetSnapshot.itemCount.specs} Mandates, ${targetSnapshot.itemCount.meetings} Scheduled Meetings from snapshot ${targetSnapshot.id}.`,
      level: "success",
      userRole: "CEO"
    });

    return true;
  };

  // Meeting ending & lifecycle management (Ended status, NO "Finded")
  const endMeeting = (
    meetingId: string, 
    currentRole: UserRole = "CEO", 
    selectedDay?: WeekDay,
    reason: string = "manual"
  ) => {
    const isLockout = registerDeletionAction(currentRole, {
      resourceType: "meetings",
      resourceId: meetingId,
      resourceName: "Meeting Session"
    });
    if (isLockout) return;

    // Idempotency check: verify meeting is not already ended
    if (endedMeetingsLedger.some((m) => m.id === meetingId)) {
      return;
    }

    let foundDay: WeekDay | null = selectedDay || null;
    let target: MeetingItem | undefined;

    if (foundDay && meetingsByDay[foundDay]) {
      target = meetingsByDay[foundDay].find((m) => m.id === meetingId);
    } else {
      const days: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      for (const day of days) {
        const item = (meetingsByDay[day] || []).find((m) => m.id === meetingId);
        if (item) {
          target = item;
          foundDay = day;
          break;
        }
      }
    }

    if (!target || !foundDay) return;

    const endedItem: MeetingItem = {
      ...target,
      day: foundDay,
      status: "completed",
      botStatus: "completed"
    };

    setEndedMeetingsLedger((prev) => [endedItem, ...prev.filter((m) => m.id !== meetingId)]);
    setMeetingsByDay((prev) => ({
      ...prev,
      [foundDay!]: (prev[foundDay!] || []).filter((m) => m.id !== meetingId),
    }));

    addLog({
      category: "Meetings",
      action: `Meeting Ended: ${target.candidate}`,
      details: JSON.stringify({
        timestamp: new Date().toISOString(),
        status: "Ended",
        candidate: target.candidate,
        role: target.role,
        company: target.clientCompany,
        day: foundDay,
        reason
      }, null, 2),
      level: "action",
      userRole: currentRole,
    });

    // Trigger Instant Post-Interview Follow-Up
    triggerInstantFollowUp(endedItem);
  };

  const reopenMeeting = (meetingId: string, currentRole: UserRole = "CEO"): boolean => {
    const target = endedMeetingsLedger.find((m) => m.id === meetingId);
    if (!target) return false;

    setEndedMeetingsLedger((prev) => prev.filter((m) => m.id !== meetingId));
    const targetDay = target.day || "Monday";
    const reopened: MeetingItem = {
      ...target,
      status: "upcoming",
      botStatus: "ready"
    };

    setMeetingsByDay((prev) => ({
      ...prev,
      [targetDay]: [reopened, ...(prev[targetDay] || [])],
    }));

    addLog({
      category: "Meetings",
      action: `Meeting Reopened to Schedule: ${target.candidate}`,
      details: `Returned interview session with ${target.candidate} (${target.role}) to active ${targetDay} schedule.`,
      level: "info",
      userRole: currentRole,
    });

    return true;
  };

  const restoreLastMeeting = (selectedDay: WeekDay): boolean => {
    if (endedMeetingsLedger.length === 0) return false;
    const [lastItem] = endedMeetingsLedger;
    return reopenMeeting(lastItem.id, "CEO");
  };

  const deleteMeetingPermanently = (meetingId: string, currentRole: UserRole = "CEO") => {
    const target = endedMeetingsLedger.find((m) => m.id === meetingId);
    setEndedMeetingsLedger((prev) => prev.filter((m) => m.id !== meetingId));
    addLog({
      category: "Meetings",
      action: `Permanently Archived Meeting: ${target?.candidate || meetingId}`,
      details: `Meeting record permanently archived from active review.`,
      level: "warning",
      userRole: currentRole,
    });
  };

  const revertAllMeetings = (currentRole: UserRole = "CEO") => {
    if (endedMeetingsLedger.length === 0) return;
    const count = endedMeetingsLedger.length;
    endedMeetingsLedger.forEach((m) => {
      const d = m.day || "Monday";
      setMeetingsByDay((prev) => ({
        ...prev,
        [d]: [{ ...m, status: "upcoming", botStatus: "ready" }, ...(prev[d] || [])]
      }));
    });
    setEndedMeetingsLedger([]);
    addLog({
      category: "Meetings",
      action: `Restored All Ended Meetings to Schedule (${count})`,
      details: `Restored ${count} meetings back to active schedule.`,
      level: "success",
      userRole: currentRole
    });
  };

  // Candidate Mandates actions (Placed / Filled, NO "Finded")
  const sourceCandidateSpec = (specId: string, currentRole: UserRole) => {
    const isLockout = registerDeletionAction(currentRole, {
      resourceType: "candidate_specs",
      resourceId: specId,
      resourceName: "Candidate Spec"
    });
    if (isLockout) return;

    const targetSpec = candidateSpecs.find((s) => s.id === specId);
    if (!targetSpec) return;

    setDeletedSpecsBuffer((prev) => [targetSpec, ...prev]);
    setCandidateSpecs((prev) => prev.filter((s) => s.id !== specId));

    addLog({
      category: "Search Mandates",
      action: `Search Mandate Archived: ${targetSpec.code}`,
      details: `Archived search specification for ${targetSpec.roleTitle} at ${targetSpec.company}.`,
      level: "action",
      userRole: currentRole,
    });
  };

  const markMandatePlaced = (specId: string, currentRole: UserRole = "CEO") => {
    setCandidateSpecs((prev) =>
      prev.map((s) =>
        s.id === specId
          ? { ...s, stage: "placed", status: "Searching" as any }
          : s
      )
    );

    const target = candidateSpecs.find((s) => s.id === specId);
    addLog({
      category: "Search Mandates",
      action: `Mandate Successfully Placed: ${target?.roleTitle || specId}`,
      details: `Placement closed for ${target?.company}. Placement fee recognized in Placed Revenue.`,
      level: "success",
      userRole: currentRole
    });
  };

  const restoreLastCandidateSpec = (): boolean => {
    if (deletedSpecsBuffer.length === 0) return false;
    const [lastSpec, ...remainingBuffer] = deletedSpecsBuffer;
    setDeletedSpecsBuffer(remainingBuffer);
    setCandidateSpecs((prev) => [lastSpec, ...prev]);

    addLog({
      category: "Search Mandates",
      action: `Restored Mandate: ${lastSpec.code}`,
      details: `Returned ${lastSpec.roleTitle} (${lastSpec.company}) to active search portfolio.`,
      level: "success",
    });

    return true;
  };

  const deleteCandidateSpecPermanently = (specId: string, currentRole: UserRole = "CEO") => {
    const isLockout = registerDeletionAction(currentRole, {
      resourceType: "candidate_specs",
      resourceId: specId,
      resourceName: "Candidate Spec"
    });
    if (isLockout) return;

    const target = candidateSpecs.find((s) => s.id === specId) || deletedSpecsBuffer.find((s) => s.id === specId);
    setCandidateSpecs((prev) => prev.filter((s) => s.id !== specId));
    setDeletedSpecsBuffer((prev) => prev.filter((s) => s.id !== specId));

    addLog({
      category: "Search Mandates",
      action: `Permanently Removed Mandate Spec: ${target?.code || specId}`,
      details: `Specification for ${target?.roleTitle || specId} removed by ${currentRole}.`,
      level: "warning",
      userRole: currentRole,
    });
  };

  const revertAllCandidateSpecs = (currentRole: UserRole = "CEO") => {
    if (deletedSpecsBuffer.length === 0) return;
    const count = deletedSpecsBuffer.length;
    setCandidateSpecs((prev) => [...deletedSpecsBuffer, ...prev]);
    setDeletedSpecsBuffer([]);

    addLog({
      category: "Search Mandates",
      action: `Restored All Archived Mandates (${count})`,
      details: `Batch restored ${count} search specifications back to active status.`,
      level: "success",
      userRole: currentRole
    });
  };

  const addCandidateSpec = (spec: CandidateSearchSpec) => {
    setCandidateSpecs((prev) => [spec, ...prev]);
  };

  // Follow-Up template actions & restore
  const updateFollowUpTemplate = (newTpl: FollowUpTemplateState, currentRole: UserRole) => {
    setTemplateBuffer((prev) => [followUpTemplate, ...prev]);
    setFollowUpTemplate(newTpl);
    localStorage.setItem("avantty_followup_template_subject", newTpl.subject);
    localStorage.setItem("avantty_followup_template_body", newTpl.body);
  };

  const restoreLastFollowUpTemplate = (): boolean => {
    if (templateBuffer.length === 0) {
      const defaultTpl = { subject: DEFAULT_FOLLOWUP_SUBJECT, body: DEFAULT_FOLLOWUP_BODY };
      setFollowUpTemplate(defaultTpl);
      localStorage.setItem("avantty_followup_template_subject", DEFAULT_FOLLOWUP_SUBJECT);
      localStorage.setItem("avantty_followup_template_body", DEFAULT_FOLLOWUP_BODY);
      addLog({
        category: "Follow Ups",
        action: "Restored Default Follow-Up Template",
        details: "Reset template to standard Avantty practice wording.",
        level: "info",
      });
      return true;
    }

    const [lastTpl, ...remainingBuffer] = templateBuffer;
    setTemplateBuffer(remainingBuffer);
    setFollowUpTemplate(lastTpl);
    localStorage.setItem("avantty_followup_template_subject", lastTpl.subject);
    localStorage.setItem("avantty_followup_template_body", lastTpl.body);

    addLog({
      category: "Follow Ups",
      action: "Restored Previous Follow-Up Template",
      details: "Recovered prior follow-up template version.",
      level: "success",
    });

    return true;
  };

  return (
    <AppDataContext.Provider
      value={{
        whiteLabelConfig,
        updateWhiteLabelConfig,
        resetWhiteLabelConfig,
        isDemoModalOpen,
        setIsDemoModalOpen,
        teamAccounts,
        updateAccountRole,
        rolePermissions,
        updateRolePermissions,
        meetingsByDay,
        setMeetingsByDay,
        endedMeetingsLedger,
        deletedMeetingsBuffer: endedMeetingsLedger, // backward-compat alias
        endMeeting,
        sourceMeeting: endMeeting, // backward-compat alias
        reopenMeeting,
        restoreLastMeeting,
        restoreMeetingById: reopenMeeting, // backward-compat alias
        deleteMeetingPermanently,
        revertAllMeetings,
        candidateSpecs,
        setCandidateSpecs,
        deletedSpecsBuffer,
        sourceCandidateSpec,
        markMandatePlaced,
        restoreLastCandidateSpec,
        deleteCandidateSpecPermanently,
        revertAllCandidateSpecs,
        addCandidateSpec,
        followUpTemplate,
        setFollowUpTemplate,
        templateBuffer,
        updateFollowUpTemplate,
        restoreLastFollowUpTemplate,
        followUpDispatches,
        triggerInstantFollowUp,
        focusedMeetingId,
        setFocusedMeetingId,
        focusedSpecId,
        setFocusedSpecId,
        isSystemCritical,
        setIsSystemCritical,
        registerDeletionAction,
        unlockSystemCritical,
        systemSnapshots,
        restoreFromSnapshot,
        activeSecurityIncident,
        setActiveSecurityIncident
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
};
