import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/src/types";
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
    .replace(/[^a-z0-9]/g, "");
}

export function unslugifyCompanyName(slug: string): string {
  if (!slug) return "Client Partner";
  return slug
    .split(/[-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function parseWhiteLabelFromUrl(): WhiteLabelConfig | null {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname.toLowerCase();
  const search = window.location.search;
  const hash = window.location.hash;
  const pathname = window.location.pathname;
  const params = new URLSearchParams(search || (hash.startsWith("#?") ? hash.slice(1) : ""));
  
  let company = params.get("company") || params.get("c");
  
  // 1. Detect subdomain format: demodashboard-empresa.avanttyops.com
  if (!company && hostname.includes("demodashboard-")) {
    const subPart = hostname.split(".")[0];
    const extracted = subPart.replace("demodashboard-", "").trim();
    if (extracted) {
      company = unslugifyCompanyName(extracted);
    }
  }
  
  // 2. Detect clean pathname format: /artificially or /p/artificially
  if (!company && pathname && pathname !== "/" && !pathname.includes(".")) {
    const cleanPath = pathname.replace(/^\/(p\/)?/, "").replace(/\/$/, "").trim();
    if (cleanPath && !["dashboard", "candidates", "meetings", "logs", "login", "admin", "index"].includes(cleanPath)) {
      company = unslugifyCompanyName(cleanPath);
    }
  }

  if (!company) return null;
  
  const isClient = params.get("client") === "true" || params.get("view") === "client" || params.get("v") === "c" || params.get("cl") === "1" || hostname.includes("demodashboard-");
  
  const config: WhiteLabelConfig = {
    companyName: company,
    contactName: params.get("contact") || params.get("p") || params.get("name") || "Managing Partner",
    industry: params.get("industry") || params.get("ind") || "Executive Search & Retained Mandates",
    tagline: params.get("tagline") || params.get("tag") || "Enterprise Headhunting & Retainer Platform",
    pipelineMetric: params.get("pipeline") || params.get("pipe") || "$3.2M Pipeline • 12 Active Retainers",
    themeColor: (params.get("color") || params.get("clr") || "emerald") as any,
    website: params.get("website") || params.get("web") || `${company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    customWelcome: params.get("welcome") || params.get("w") || `Custom Portal for ${company}`,
    isCustomized: true,
    isClientView: isClient
  };

  // Automatically clean and scrub the browser address bar immediately
  // So the user and client ONLY see: https://demodashboard.avanttyops.com/ or the clean subdomain
  try {
    if (window.location.search) {
      const cleanUrl = window.location.pathname || "/";
      window.history.replaceState({}, document.title, cleanUrl);
    }
  } catch (e) {
    // Ignore in non-browser environments
  }

  return config;
}

export function generateWhiteLabelUrl(
  config: WhiteLabelConfig, 
  customBaseUrl?: string,
  mode: "subdomain" | "query" = "subdomain"
): string {
  if (typeof window === "undefined") return "";
  
  const companySlug = slugifyCompanyName(config.companyName || "client");
  
  if (mode === "subdomain") {
    // Generates: https://demodashboard-empresa.avanttyops.com
    return `https://demodashboard-${companySlug}.avanttyops.com`;
  }
  
  let base = customBaseUrl?.trim() || `${window.location.origin}${window.location.pathname}`;
  if (base.endsWith("/")) base = base.slice(0, -1);
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    base = `https://${base}`;
  }
  
  const params = new URLSearchParams();
  params.set("c", config.companyName || "Avantty");
  if (config.contactName && config.contactName !== "Naim Ramos" && config.contactName !== "Managing Partner") {
    params.set("p", config.contactName);
  }
  if (config.themeColor && config.themeColor !== "emerald") {
    params.set("clr", config.themeColor);
  }
  params.set("cl", "1");
  
  return `${base}/?${params.toString()}`;
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
    subject: `Post-Interview Thank You & Next Placement Stages — [Interview Role] at ${company}`,
    body: `Dear [Candidate Name],

Thank you for participating in our executive briefing today regarding the [Interview Role] placement with ${company}.

Our Senior Partners thoroughly enjoyed reviewing your career trajectory, leadership achievements, and domain expertise. Following today's session with [Interviewer Name], our team is synthesizing your dossier for presentation to the Client Nomination Board.

As a next step, our executive team will coordinate directly with you regarding next evaluation stages and debrief scheduling within 24–48 hours.

If you have any questions in the meantime or additional materials to share, please feel free to reply directly to this email.

Best regards,
The ${company} Executive Search Team
https://${web}`
  };
}

export interface FollowUpTemplateState {
  subject: string;
  body: string;
}

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
  deletedMeetingsBuffer: MeetingItem[];
  sourceMeeting: (meetingId: string, currentRole?: UserRole, selectedDay?: WeekDay) => void;
  restoreLastMeeting: (selectedDay: WeekDay) => boolean;
  restoreMeetingById: (meetingId: string, currentRole?: UserRole) => boolean;
  deleteMeetingPermanently: (meetingId: string, currentRole?: UserRole) => void;
  revertAllMeetings: (currentRole?: UserRole) => void;

  // Candidates state & recovery
  candidateSpecs: CandidateSearchSpec[];
  setCandidateSpecs: React.Dispatch<React.SetStateAction<CandidateSearchSpec[]>>;
  deletedSpecsBuffer: CandidateSearchSpec[];
  sourceCandidateSpec: (specId: string, currentRole: UserRole) => void;
  restoreLastCandidateSpec: () => boolean;
  deleteCandidateSpecPermanently: (specId: string, currentRole?: UserRole) => void;
  revertAllCandidateSpecs: (currentRole?: UserRole) => void;
  addCandidateSpec: (spec: CandidateSearchSpec) => void;

  // Templates state & recovery
  followUpTemplate: FollowUpTemplateState;
  setFollowUpTemplate: (tpl: FollowUpTemplateState) => void;
  templateBuffer: FollowUpTemplateState[];
  updateFollowUpTemplate: (newTpl: FollowUpTemplateState, currentRole: UserRole) => void;
  restoreLastFollowUpTemplate: () => boolean;

  // Focused Target Selection (for Global Search direct modal opening)
  focusedMeetingId: string | null;
  setFocusedMeetingId: (id: string | null) => void;
  focusedSpecId: string | null;
  setFocusedSpecId: (id: string | null) => void;

  // Security Lockout
  isSystemCritical: boolean;
  setIsSystemCritical: React.Dispatch<React.SetStateAction<boolean>>;
  registerDeletionAction: (currentRole: UserRole) => boolean;
  unlockSystemCritical: (authorizingRole: UserRole) => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addLog } = useLogs();

  // White-label pitch customization state
  const [whiteLabelConfig, setWhiteLabelConfig] = useState<WhiteLabelConfig>(() => {
    const urlConfig = parseWhiteLabelFromUrl();
    if (urlConfig) {
      try {
        localStorage.setItem("avantty_white_label", JSON.stringify(urlConfig));
      } catch (e) {}
      return urlConfig;
    }
    const saved = localStorage.getItem("avantty_white_label");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.companyName) {
          return { ...DEFAULT_WHITE_LABEL, ...parsed };
        }
      } catch (e) {
        // fallback
      }
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
      category: "White-Label",
      action: `Demo Customized for ${newConfig.companyName || whiteLabelConfig.companyName}`,
      details: `Live white-label configuration applied. Headline: "${newConfig.tagline || whiteLabelConfig.tagline}".`,
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
      category: "White-Label",
      action: "Reset Demo Branding to Avantty Enterprise",
      details: "Default agency branding and retainers restored.",
      level: "info",
      userRole: "CEO"
    });
  };

  // 0. Team Accounts & Dynamic Role Permissions State
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
      } catch (e) {
        // fallback
      }
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
      action: `Updated User Rank: ${targetAccount?.name || accountId} → ${newRole}`,
      details: `Rank adjusted by ${requestingRole}. User now operates under ${newRole} permission profile.`,
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
      action: `Updated Real-Time Permissions for Rank: ${role}`,
      details: `Visible sections modified to: [${allowedPages.join(", ")}] by ${requestingRole}`,
      level: "action",
      userRole: requestingRole
    });
  };

  // 1. Meetings State
  const [meetingsByDay, setMeetingsByDay] = useState<Record<WeekDay, MeetingItem[]>>(INITIAL_MEETINGS_BY_DAY);
  const [deletedMeetingsBuffer, setDeletedMeetingsBuffer] = useState<MeetingItem[]>([]);

  // 2. Candidates State
  const [candidateSpecs, setCandidateSpecs] = useState<CandidateSearchSpec[]>(INITIAL_CANDIDATE_SPECS);
  const [deletedSpecsBuffer, setDeletedSpecsBuffer] = useState<CandidateSearchSpec[]>([]);

  // 3. Follow Up Template State
  const [followUpTemplate, setFollowUpTemplate] = useState<FollowUpTemplateState>(() => ({
    subject: localStorage.getItem("avantty_followup_template_subject") || DEFAULT_FOLLOWUP_SUBJECT,
    body: localStorage.getItem("avantty_followup_template_body") || DEFAULT_FOLLOWUP_BODY,
  }));
  const [templateBuffer, setTemplateBuffer] = useState<FollowUpTemplateState[]>([]);

  // 4. Focused Target from Global Search
  const [focusedMeetingId, setFocusedMeetingId] = useState<string | null>(null);
  const [focusedSpecId, setFocusedSpecId] = useState<string | null>(null);

  // 5. Security Lockout State
  const [isSystemCritical, setIsSystemCritical] = useState<boolean>(false);
  const [deletionTimestamps, setDeletionTimestamps] = useState<number[]>([]);

  // Register deletion for non-CEO role (3 deletions in < 10 sec limit)
  const registerDeletionAction = (currentRole: UserRole): boolean => {
    if (currentRole === "CEO") {
      return false; // CEO is exempt from limits
    }

    const now = Date.now();
    const recent = deletionTimestamps.filter((t) => now - t < 10000);
    const updated = [...recent, now];
    setDeletionTimestamps(updated);

    if (updated.length > 3) {
      setIsSystemCritical(true);
      addLog({
        category: "System",
        action: "CRITICAL LOCKOUT: Deletion Threshold Exceeded",
        details: `Role ${currentRole} executed ${updated.length} deletions in <10 seconds. Access temporarily suspended awaiting CEO authorization.`,
        level: "warning",
        userRole: currentRole,
      });
      return true;
    }
    return false;
  };

  const unlockSystemCritical = (authorizingRole: UserRole) => {
    setIsSystemCritical(false);
    setDeletionTimestamps([]);
    addLog({
      category: "System",
      action: "System Critical Lockout Authorized & Lifted",
      details: `CEO authorization granted by ${authorizingRole}. Operational dashboard resumed.`,
      level: "success",
      userRole: authorizingRole,
    });
  };

  // Meeting actions & restore
  const sourceMeeting = (meetingId: string, currentRole: UserRole = "CEO", selectedDay?: WeekDay) => {
    const isLockout = registerDeletionAction(currentRole);
    if (isLockout) return;

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

    const sourcedItem: MeetingItem = {
      ...target,
      day: foundDay,
      status: "sourced"
    };

    setDeletedMeetingsBuffer((prev) => [sourcedItem, ...prev.filter((m) => m.id !== meetingId)]);
    setMeetingsByDay((prev) => ({
      ...prev,
      [foundDay!]: (prev[foundDay!] || []).filter((m) => m.id !== meetingId),
    }));

    addLog({
      category: "Meeting Bot",
      action: `Meeting Candidate Marked as Finded: ${target.candidate}`,
      details: JSON.stringify({
        timestamp: new Date().toISOString(),
        action: "MARK_AS_FINDED",
        meetingId: target.id,
        candidate: target.candidate,
        role: target.role,
        company: target.clientCompany,
        day: foundDay
      }, null, 2),
      level: "action",
      userRole: currentRole,
    });
  };

  const restoreLastMeeting = (selectedDay: WeekDay): boolean => {
    if (deletedMeetingsBuffer.length === 0) return false;
    const [lastItem, ...remainingBuffer] = deletedMeetingsBuffer;
    setDeletedMeetingsBuffer(remainingBuffer);

    const targetDay = lastItem.day || selectedDay;
    const restoredMeeting: MeetingItem = {
      ...lastItem,
      status: lastItem.status === "sourced" ? "completed" : lastItem.status
    };

    setMeetingsByDay((prev) => ({
      ...prev,
      [targetDay]: [restoredMeeting, ...(prev[targetDay] || [])],
    }));

    addLog({
      category: "Meeting Bot",
      action: `Restored Last Meeting Action: ${lastItem.candidate}`,
      details: `Recovered ${lastItem.candidate} (${lastItem.role}) back to ${targetDay} meeting queue.`,
      level: "success",
    });

    return true;
  };

  const restoreMeetingById = (meetingId: string, currentRole: UserRole = "CEO"): boolean => {
    const target = deletedMeetingsBuffer.find((m) => m.id === meetingId);
    if (!target) return false;

    setDeletedMeetingsBuffer((prev) => prev.filter((m) => m.id !== meetingId));
    const targetDay = target.day || "Monday";
    const restoredMeeting: MeetingItem = {
      ...target,
      status: "completed"
    };

    setMeetingsByDay((prev) => ({
      ...prev,
      [targetDay]: [restoredMeeting, ...(prev[targetDay] || [])],
    }));

    addLog({
      category: "Meeting Bot",
      action: `Reverted Meeting Finded Action: ${target.candidate}`,
      details: `Reverted ${target.candidate} (${target.role}) back to active ${targetDay} schedule.`,
      level: "success",
      userRole: currentRole,
    });

    return true;
  };

  const deleteMeetingPermanently = (meetingId: string, currentRole: UserRole = "CEO") => {
    const target = deletedMeetingsBuffer.find((m) => m.id === meetingId);
    setDeletedMeetingsBuffer((prev) => prev.filter((m) => m.id !== meetingId));
    addLog({
      category: "Meeting Bot",
      action: `Permanently Deleted Meeting Log: ${target?.candidate || meetingId}`,
      details: `Meeting record for ${target?.candidate || meetingId} permanently removed from ledger archive.`,
      level: "warning",
      userRole: currentRole,
    });
  };

  // Candidate Specs actions & restore
  const sourceCandidateSpec = (specId: string, currentRole: UserRole) => {
    const isLockout = registerDeletionAction(currentRole);
    if (isLockout) return;

    const targetSpec = candidateSpecs.find((s) => s.id === specId);
    if (!targetSpec) return;

    setDeletedSpecsBuffer((prev) => [targetSpec, ...prev]);
    setCandidateSpecs((prev) => prev.filter((s) => s.id !== specId));

    addLog({
      category: "Candidate Spec",
      action: `Candidate Spec Marked as Finded: ${targetSpec.code}`,
      details: JSON.stringify({
        timestamp: new Date().toISOString(),
        action: "MARK_AS_FINDED",
        candidateSpecId: targetSpec.id,
        code: targetSpec.code,
        roleTitle: targetSpec.roleTitle,
        company: targetSpec.company,
      }, null, 2),
      level: "action",
      userRole: currentRole,
    });
  };

  const restoreLastCandidateSpec = (): boolean => {
    if (deletedSpecsBuffer.length === 0) return false;
    const [lastSpec, ...remainingBuffer] = deletedSpecsBuffer;
    setDeletedSpecsBuffer(remainingBuffer);

    setCandidateSpecs((prev) => [lastSpec, ...prev]);

    addLog({
      category: "Candidate Spec",
      action: `Restored Candidate Spec: ${lastSpec.code}`,
      details: `Restored ${lastSpec.code} (${lastSpec.roleTitle} at ${lastSpec.company}) to active candidates.`,
      level: "success",
    });

    return true;
  };

  const deleteCandidateSpecPermanently = (specId: string, currentRole: UserRole = "CEO") => {
    const target = deletedSpecsBuffer.find((s) => s.id === specId);
    setDeletedSpecsBuffer((prev) => prev.filter((s) => s.id !== specId));
    addLog({
      category: "Candidate Spec",
      action: `Permanently Deleted Candidate Spec: ${target?.code || specId}`,
      details: `Candidate specification for ${target?.code || specId} permanently removed from archive.`,
      level: "warning",
      userRole: currentRole,
    });
  };

  const revertAllMeetings = (currentRole: UserRole = "CEO") => {
    if (deletedMeetingsBuffer.length === 0) return;
    const count = deletedMeetingsBuffer.length;

    setMeetingsByDay((prev) => {
      const updated = { ...prev };
      deletedMeetingsBuffer.forEach((item) => {
        const targetDay = item.day || "Monday";
        const restored: MeetingItem = {
          ...item,
          status: "completed"
        };
        updated[targetDay] = [restored, ...(updated[targetDay] || [])];
      });
      return updated;
    });

    setDeletedMeetingsBuffer([]);

    addLog({
      category: "Meeting Bot",
      action: `Reverted All Archived Meetings (${count} Items)`,
      details: `Restored all ${count} archived meeting records back to their active weekday interview schedules.`,
      level: "success",
      userRole: currentRole
    });
  };

  const revertAllCandidateSpecs = (currentRole: UserRole = "CEO") => {
    const countBuffer = deletedSpecsBuffer.length;

    setCandidateSpecs((prev) => {
      const restoredFromFinded = prev.map((spec) => {
        if (spec.status === "Finded") {
          return {
            ...spec,
            status: "Searching" as const,
            profileLogs: [
              {
                id: `log-${Date.now()}-${Math.random()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                action: "Batch Revert: Restored to Searching",
                details: "Restored to active candidate sourcing queue via Revert All action.",
                type: "status_change" as const
              },
              ...(spec.profileLogs || [])
            ]
          };
        }
        return spec;
      });

      const restoredFromBuffer: CandidateSearchSpec[] = deletedSpecsBuffer.map((spec) => ({
        ...spec,
        status: "Searching" as const
      }));

      return [...restoredFromBuffer, ...restoredFromFinded];
    });

    setDeletedSpecsBuffer([]);

    addLog({
      category: "Candidate Spec",
      action: "Reverted All Candidate Profiles to Searching",
      details: `Batch restored all sourced/finded candidate specifications back to active hunting status.`,
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
      // Fallback reset to default template
      const defaultTpl = { subject: DEFAULT_FOLLOWUP_SUBJECT, body: DEFAULT_FOLLOWUP_BODY };
      setFollowUpTemplate(defaultTpl);
      localStorage.setItem("avantty_followup_template_subject", DEFAULT_FOLLOWUP_SUBJECT);
      localStorage.setItem("avantty_followup_template_body", DEFAULT_FOLLOWUP_BODY);
      addLog({
        category: "Follow Ups",
        action: "Restored Default Follow-Up Template",
        details: "Reset follow-up template to initial corporate standard.",
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
      details: "Recovered prior follow-up template version from buffer.",
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
        deletedMeetingsBuffer,
        sourceMeeting,
        restoreLastMeeting,
        restoreMeetingById,
        deleteMeetingPermanently,
        revertAllMeetings,
        candidateSpecs,
        setCandidateSpecs,
        deletedSpecsBuffer,
        sourceCandidateSpec,
        restoreLastCandidateSpec,
        deleteCandidateSpecPermanently,
        revertAllCandidateSpecs,
        addCandidateSpec,
        followUpTemplate,
        setFollowUpTemplate,
        templateBuffer,
        updateFollowUpTemplate,
        restoreLastFollowUpTemplate,
        focusedMeetingId,
        setFocusedMeetingId,
        focusedSpecId,
        setFocusedSpecId,
        isSystemCritical,
        setIsSystemCritical,
        registerDeletionAction,
        unlockSystemCritical,
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
