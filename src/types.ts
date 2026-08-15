export type UserRole = "CEO" | "Recruiter" | "Sourcer";

export interface RoleConfig {
  id: UserRole;
  label: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  allowedPages: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  CEO: {
    id: "CEO",
    label: "CEO",
    badgeBg: "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900",
    badgeText: "Full Access (CEO)",
    description: "Full visibility across Executive Dashboard, Meetings, Candidate Search, Follow Ups, and Activity Logs.",
    allowedPages: ["dashboard", "meetings", "search-candidates", "follow-ups", "logs"]
  },
  Recruiter: {
    id: "Recruiter",
    label: "Recruiter",
    badgeBg: "bg-slate-800 dark:bg-slate-200 border-slate-800 dark:border-slate-200 text-white dark:text-slate-900",
    badgeText: "Recruiter Access",
    description: "Access to Candidate Meetings, Search Candidates, and Follow Ups.",
    allowedPages: ["meetings", "search-candidates", "follow-ups"]
  },
  Sourcer: {
    id: "Sourcer",
    label: "Sourcer",
    badgeBg: "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100",
    badgeText: "Sourcer Access",
    description: "Access to Candidate Meetings, Search Candidates, and Follow Ups.",
    allowedPages: ["meetings", "search-candidates", "follow-ups"]
  }
};

export interface CandidateFollowUp {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone?: string;
  location: string;
  avatar: string;
  lastContactDate: string;
  stage: "First Interview" | "Technical Assessment" | "Offer Sent" | "Portfolio Review" | "Sourcing";
  matchScore: number;
  status: "Pending Follow Up" | "Sent" | "Replied" | "Scheduled";
  aiGeneratedEmail: {
    subject: string;
    body: string;
    keyHighlights: string[];
    recommendedSendTime: string;
  };
  notes?: string;
}

export const MOCK_USERS: Record<UserRole, { name: string; email: string; avatar: string }> = {
  CEO: {
    name: "Elena Vance (CEO)",
    email: "ceo@avantty.com",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  Recruiter: {
    name: "Carlos Mendez (Recruiter)",
    email: "recruiter@avantty.com",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
  },
  Sourcer: {
    name: "Sofia Chen (Sourcer)",
    email: "sourcer@avantty.com",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
  }
};
