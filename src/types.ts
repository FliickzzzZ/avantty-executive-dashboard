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
    label: "CEO / Managing Partner",
    badgeBg: "bg-[#00875A] text-white border-[#00875A]",
    badgeText: "Managing Partner (Full Authorization)",
    description: "Complete visibility and governance across Executive Command, Mandates, Interviews, Instant Follow-Ups, and Critical Security Logs.",
    allowedPages: ["dashboard", "meetings", "search-candidates", "follow-ups", "logs"]
  },
  Recruiter: {
    id: "Recruiter",
    label: "Senior Consultant",
    badgeBg: "bg-[#0A0E0D] text-white dark:bg-white dark:text-[#0A0E0D] border-transparent",
    badgeText: "Search Consultant Access",
    description: "Operational focus on Active Mandates, Scheduled Client Debriefs, and Candidate Evaluation.",
    allowedPages: ["meetings", "search-candidates", "follow-ups"]
  },
  Sourcer: {
    id: "Sourcer",
    label: "Talent Sourcer",
    badgeBg: "bg-muted text-foreground border-border",
    badgeText: "Talent Research Access",
    description: "Executive market mapping, hunting ground Boolean generation, and candidate specification review.",
    allowedPages: ["meetings", "search-candidates", "follow-ups"]
  }
};

export interface FollowUpDispatch {
  id: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  clientCompany: string;
  meetingId: string;
  timestamp: string; // ISO date
  status: "sent" | "pending" | "failed" | "cancelled";
  subject: string;
  body: string;
  hasNextStageAuthorization: boolean;
  schedulingLink?: string;
  errorDetails?: string;
  dispatchLatencyMs?: number;
}

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

export interface CriticalSecurityIncident {
  id: string;
  timestamp: string; // ISO
  initiatedBy: {
    name: string;
    email: string;
    role: UserRole;
  };
  severity: "CRITICAL" | "HIGH";
  eventType: "MASS_DELETION_ATTEMPT" | "UNAUTHORIZED_PURGE" | "SUSPICIOUS_MUTATION";
  description: string;
  affectedResources: {
    resourceType: "candidate_specs" | "meetings" | "followups" | "system";
    count: number;
    resourceIds: string[];
    resourceNames: string[];
  };
  technicalMetadata: {
    ipSubnetMasked: string; // e.g. "192.168.1.xxx"
    userAgent: string;
    requestPath: string;
    actionVelocity: string;
  };
  snapshotAvailable: boolean;
  snapshotId?: string;
  status: "ACTIVE_ALERT" | "INVESTIGATED" | "RESTORED" | "DISMISSED";
  restoredAt?: string;
  restoredBy?: string;
}

export interface SystemSnapshot {
  id: string;
  timestamp: string;
  description: string;
  itemCount: {
    meetings: number;
    specs: number;
    dispatches: number;
  };
  data: {
    meetingsByDay: any;
    candidateSpecs: any[];
    followUpDispatches: FollowUpDispatch[];
  };
}

export const MOCK_USERS: Record<UserRole, { name: string; email: string; avatar: string }> = {
  CEO: {
    name: "Naim Ramos",
    email: "naim@avanttyops.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  Recruiter: {
    name: "Carlos Mendez",
    email: "recruiter@avanttyops.com",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
  },
  Sourcer: {
    name: "Sofia Chen",
    email: "sourcer@avanttyops.com",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
  }
};
