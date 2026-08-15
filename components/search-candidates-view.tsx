import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Search,
  Target,
  MapPin,
  Briefcase,
  DollarSign,
  Sparkles,
  X,
  Layers,
  CheckCircle2,
  PlusCircle,
  Check,
  Building2,
  Award,
  Zap,
  Clock,
  ChevronRight,
  RotateCcw,
  UserCheck,
  ShieldCheck,
  BrainCircuit,
  MessageSquareText,
  Compass,
  FileText,
  History,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle,
  Users,
  Repeat,
  Download,
  Copy,
  Send,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLogs } from "@/src/logs-context";
import { useAppData } from "@/src/app-data-context";
import { UserRole } from "@/src/types";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { calculateMandateUrgencyScore } from "@/src/executive-algorithms";

export interface ProfileLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details?: string;
  type?: "status_change" | "system" | "note";
}

export type MandateStage = "sourcing" | "shortlist" | "board" | "placed";

export const STAGE_CONFIG: Record<
  MandateStage,
  { label: string; shortLabel: string; probability: number; phaseNumber: number; color: string }
> = {
  sourcing: {
    label: "Fase 1: Mandato Abierto (Sourcing / Longlist)",
    shortLabel: "Longlist (20%)",
    probability: 0.20,
    phaseNumber: 1,
    color: "slate"
  },
  shortlist: {
    label: "Fase 2: Shortlist Presentada al Cliente",
    shortLabel: "Shortlist (50%)",
    probability: 0.50,
    phaseNumber: 2,
    color: "blue"
  },
  board: {
    label: "Fase 3: Entrevistas Finales Consejo (Board Round)",
    shortLabel: "Board (80%)",
    probability: 0.80,
    phaseNumber: 3,
    color: "indigo"
  },
  placed: {
    label: "Fase 4: Oferta Aceptada / Candidato Cerrado",
    shortLabel: "Placed (100%)",
    probability: 1.00,
    phaseNumber: 4,
    color: "emerald"
  }
};

export interface CandidateSearchSpec {
  id: string;
  code: string; // e.g. "TARGET-001"
  department?: string;
  priority?: "Urgent" | "High" | "Medium";
  createdAt?: number; // timestamp in ms

  status?: "Searching" | "Finded";
  profileLogs?: ProfileLogEntry[];

  // Executive Search Algorithm Properties
  stage?: MandateStage; // "sourcing" (20%) | "shortlist" (50%) | "board" (80%) | "placed" (100%)
  targetSalaryNumber?: number; // e.g. 415000, 310000, 320000, 290000
  feePercentage?: number; // default 0.30 (30% retained fee)
  daysOpen?: number; // e.g. 18, 32, 14, 26
  qualifiedCandidatesCount?: number; // e.g. 1, 2, 3, 4

  // Executive Metric Properties
  boardReadinessScore?: number; // 1-100 score (e.g. 98, 91, 86, 89)
  pnlScaleManaged?: string; // e.g. "$100M+ P&L", "$60M ARR", "$48M Engineering Budget", "$25M Global HR Budget"
  urgencyClassification?: "Critical" | "High" | "Pipeline";
  frictionRisk?: {
    hasRisk: boolean;
    type?: string;
    details?: string;
  };
  backchannelStatus?: "uninitiated" | "in_progress" | "verified";
  secondaryMandates?: Array<{
    roleTitle: string;
    company: string;
    matchScore: number;
    rationale: string;
  }>;

  // 1. CLIENT CONTEXT & MANDATE OVERVIEW
  company: string; // Client Company
  industryVertical?: string; // Industry / Vertical (e.g. Enterprise B2B SaaS, FinTech, DeepTech)
  stageRevenueScale?: string; // Stage & Revenue Scale (e.g. Series B ($30M raised) / $100M+ Annual Revenue / 350 FTEs)
  strategicDriver?: string; // The Strategic Driver (Why this role exists)
  clientProfile?: string; // Fallback / alias
  coreChallenge?: string; // Fallback / alias

  // 2. ROLE DEFINITION & TOTAL COMPENSATION
  roleTitle: string; // Target Title
  reportingTo: string; // Reporting Line
  locationWorkspace: string; // Location & Model (Hybrid, Remote, On-site)
  compensationPackage: string; // Compensation Package (Base, Bonus, Equity)

  // 3. TARGET HUNTING GROUNDS & OFF-LIMITS
  targetHuntingGrounds: string; // Target Companies (Primary Poaching List)
  adjacentIndustryFit?: string; // Adjacent Industry Fit
  offLimitsOrganizations?: string; // Off-Limits Organizations (Hands-Off)

  // 4. MANDATORY TRACK RECORD (MUST-HAVES)
  pnlBudgetScale?: string; // P&L & Budget Scale
  keyExecutionMilestones?: string; // Key Execution Milestones
  tenureRequirement?: string; // Tenure Requirement
  trackRecord?: string; // Fallback
  industryExperience?: string; // Fallback

  // 5. SOURCING PARAMETERS & BOOLEAN TARGETING
  comparableCurrentTitles?: string; // Comparable Current Titles
  booleanSearchString?: string; // Boolean Search String
  geographicBoundaries?: string; // Geographic Boundaries

  // 6. THE HOOK (EXECUTIVE VALUE PROPOSITION)
  theHook?: string; // Why would a high-performing C-level executive move?

  // Additional AI Directives & Context
  leadershipStyle?: string;
  culturalTraits?: string;
  urgencyRating?: number;
  urgencyScore?: "URGENT" | "HIGH" | "PASSIVE/PIPELINING";
  urgencyDirective?: string;
  aiReasoning?: string;

  coreTechStack?: string[];
  mustHaves?: string[];
  niceToHaves?: string[];
  keyDeliverables?: string[];
  experienceLevel?: string;
  targetSalaryRange?: string;
}

const NOW = Date.now();

export const INITIAL_CANDIDATE_SPECS: CandidateSearchSpec[] = [
  {
    id: "spec-1",
    code: "TARGET-001",
    company: "Veloce Health & Bio",
    department: "Executive Leadership",
    priority: "Urgent",
    createdAt: NOW - 1000 * 60 * 2, // 2 minutes ago -> NEW
    status: "Searching",
    stage: "shortlist", // 50% probability
    targetSalaryNumber: 415000,
    feePercentage: 0.30,
    daysOpen: 18,
    qualifiedCandidatesCount: 2,
    boardReadinessScore: 98,
    pnlScaleManaged: "$100M+ P&L",
    urgencyClassification: "Critical",
    frictionRisk: {
      hasRisk: true,
      type: "12-Month Non-Compete",
      details: "Active 12-month post-employment covenant in BioTech sector."
    },
    backchannelStatus: "verified",
    secondaryMandates: [
      {
        roleTitle: "Executive Chairman",
        company: "Aura Life Sciences",
        matchScore: 95,
        rationale: "Previous FDA Phase III clinical governance directly transfers to Aura."
      }
    ],
    profileLogs: [
      {
        id: "log-101",
        timestamp: "10:15 AM",
        action: "Profile Initialized",
        details: "AI generated target specification from board transcript analysis.",
        type: "system"
      },
      {
        id: "log-102",
        timestamp: "10:16 AM",
        action: "Active Candidate Search",
        details: "Scanning Veeva Systems & Flatiron Health for CEO matches.",
        type: "status_change"
      }
    ],

    // 1. CLIENT CONTEXT & MANDATE OVERVIEW
    industryVertical: "Digital Health, BioTech & Enterprise Life Sciences",
    stageRevenueScale: "Series C ($85M total funding) / $110M+ Annual Revenue / 420 FTEs",
    strategicDriver: "CEO succession in Q4 ahead of FDA Phase III clinical readout and planned $300M+ M&A / IPO liquidity event within 24 months.",
    clientProfile: "Series C Digital Health scale-up ($85M total funding), preparing for global enterprise expansion across US & EU markets.",
    coreChallenge: "Retiring Founding CEO after 12 years of leadership; board requires a seasoned healthcare CEO to navigate upcoming FDA Phase III clinical trials and lead a $300M+ M&A exit or IPO within 24 months.",

    // 2. ROLE DEFINITION & TOTAL COMPENSATION
    roleTitle: "Chief Executive Officer (CEO)",
    reportingTo: "Board of Directors & Lead Institutional Investors",
    locationWorkspace: "Hybrid — Boston, MA HQ (2–3 days on-site) / US East Coast",
    compensationPackage: "Base: $380,000–$450,000 | Bonus: 40% MBO | Equity: 2.0%–2.5% Options/RSUs",

    // 3. TARGET HUNTING GROUNDS & OFF-LIMITS
    targetHuntingGrounds: "Veeva Systems, Flatiron Health, One Medical, GE Healthcare, Tempus AI, IQVIA",
    adjacentIndustryFit: "HealthTech Enterprise SaaS, Clinical Intelligence Platforms, Regulated Medical Devices",
    offLimitsOrganizations: "Tier-1 active portfolio companies (Aura Life Sciences, BioCore) under contractual non-solicitation.",

    // 4. MANDATORY TRACK RECORD (MUST-HAVES)
    pnlBudgetScale: "Proven ownership of $100M+ P&L and leadership over 200+ cross-functional executives and personnel",
    keyExecutionMilestones: "Has successfully guided a digital health or biotech organization through FDA approvals and an IPO or $300M+ strategic exit.",
    tenureRequirement: "Minimum 10 years in C-Suite (CEO / President / General Manager) capacity",
    trackRecord: "Must have managed a P&L of over $100M+ and successfully guided a digital health or biotech organization through an IPO or $300M+ strategic exit.",
    industryExperience: "Digital Health, Medical Devices, HealthTech Enterprise SaaS, Biotech.",

    // 5. SOURCING PARAMETERS & BOOLEAN TARGETING
    comparableCurrentTitles: "CEO, President & Chief Executive Officer, Managing Director, Global Division President",
    booleanSearchString: '("CEO" OR "Chief Executive Officer" OR "President") AND ("Digital Health" OR "BioTech" OR "Life Sciences") AND ("FDA" OR "Phase III" OR "IPO" OR "M&A") AND ("P&L")',
    geographicBoundaries: "Greater Boston Area / New York Metro / US East Coast",

    // 6. THE HOOK (EXECUTIVE VALUE PROPOSITION)
    theHook: "High-leverage equity package with Tier-1 institutional backing, 36 months of balance sheet runway, and unanimous board mandate to lead a multi-hundred-million-dollar liquidity event.",

    leadershipStyle: "Strategic visionary & disciplined executor with strong investor relations experience and board credibility.",
    culturalTraits: "High integrity, decisive under regulatory pressure, compassionate team builder with zero tolerance for compliance compromises.",
    urgencyRating: 10,
    urgencyScore: "URGENT",
    urgencyDirective: "CRITICAL CEO REPLACEMENT: Current founding CEO retires at the end of next month. Submit 3 battle-tested CEO candidate shortlists for immediate board screening.",
    aiReasoning: "The board transcript reveals maximum urgency (10/10). Lead investor stated: 'We cannot afford an empty CEO seat entering Q4 filing season; board alignment is unanimous to secure a candidate this month.' High operational and governance risk if unfulfilled."
  },
  {
    id: "spec-2",
    code: "TARGET-002",
    company: "Nexus Enterprise Cloud",
    department: "Executive Sales",
    priority: "Urgent",
    createdAt: NOW - 1000 * 60 * 18, // 18 minutes ago
    status: "Searching",
    stage: "board", // 80% probability
    targetSalaryNumber: 310000,
    feePercentage: 0.30,
    daysOpen: 32,
    qualifiedCandidatesCount: 1,
    boardReadinessScore: 91,
    pnlScaleManaged: "$60M ARR",
    urgencyClassification: "Critical",
    frictionRisk: {
      hasRisk: false,
      type: "Clean",
      details: "No active non-compete clauses detected; equity unvested cliff manageable."
    },
    backchannelStatus: "in_progress",
    secondaryMandates: [
      {
        roleTitle: "VP Global Enterprise Sales",
        company: "Krypton Systems",
        matchScore: 92,
        rationale: "Proven MEDDPICC enterprise sales playbook aligns with cybersecurity expansion."
      }
    ],
    profileLogs: [
      {
        id: "log-201",
        timestamp: "09:40 AM",
        action: "Profile Initialized",
        details: "AI generated spec from CEO call transcript analysis.",
        type: "system"
      },
      {
        id: "log-202",
        timestamp: "09:42 AM",
        action: "Active Candidate Search",
        details: "Mapping enterprise CRO talent at CrowdStrike and Okta.",
        type: "status_change"
      }
    ],

    // 1. CLIENT CONTEXT & MANDATE OVERVIEW
    industryVertical: "Enterprise B2B SaaS, Cloud Security & Identity Governance",
    stageRevenueScale: "Series D ($120M raised) / $60M ARR / 310 FTEs",
    strategicDriver: "Transitioning from Founder-led sales to scale enterprise ARR from $60M to $100M+ and rebuild North American sales pods.",
    clientProfile: "Enterprise B2B SaaS platform ($60M ARR) providing cloud security & identity management solutions to Fortune 500 companies.",
    coreChallenge: "Sudden departure of former CRO following a regional restructuring; company urgently requires an aggressive sales leader to rebuild the North American enterprise sales org and scale ARR from $60M to $100M+.",

    // 2. ROLE DEFINITION & TOTAL COMPENSATION
    roleTitle: "Chief Revenue Officer (CRO)",
    reportingTo: "Chief Executive Officer (CEO) & Board of Directors",
    locationWorkspace: "Hybrid — New York, NY (2 days on-site) / US Remote Flexible",
    compensationPackage: "Base: $280,000–$340,000 | Bonus: 100% Commission OTE ($600k+ Total) | Equity: 1.2%–1.5% RSUs",

    // 3. TARGET HUNTING GROUNDS & OFF-LIMITS
    targetHuntingGrounds: "CrowdStrike, Okta, Palo Alto Networks, Zscaler, Datadog, Snowflake, MongoDB",
    adjacentIndustryFit: "High-velocity enterprise infrastructure software, cybersecurity, or consumption-based SaaS",
    offLimitsOrganizations: "Current institutional client accounts and direct vendor partners under NDA.",

    // 4. MANDATORY TRACK RECORD (MUST-HAVES)
    pnlBudgetScale: "Proven ownership of $50M+ revenue quota and leadership over 40+ enterprise quota-carrying account executives",
    keyExecutionMilestones: "Has scaled enterprise revenue from $30M to $100M+ ARR with consistent $500k+ ACV contract closes.",
    tenureRequirement: "Minimum 5 years in CRO or SVP Sales executive capacity in enterprise SaaS",
    trackRecord: "Must have scaled a SaaS revenue organization from $30M to $100M+ ARR and closed enterprise contract ACVs exceeding $500k.",
    industryExperience: "Cybersecurity, Cloud Governance, Enterprise B2B SaaS, Identity Management.",

    // 5. SOURCING PARAMETERS & BOOLEAN TARGETING
    comparableCurrentTitles: "CRO, Chief Revenue Officer, SVP Global Sales, Head of Revenue, VP Commercial Strategy",
    booleanSearchString: '("CRO" OR "Chief Revenue Officer" OR "SVP Sales") AND ("B2B" OR "SaaS" OR "Cloud Security") AND ("Hypergrowth" OR "MEDDPICC") AND ("ARR")',
    geographicBoundaries: "Greater New York Area / US East & Central Coast",

    // 6. THE HOOK (EXECUTIVE VALUE PROPOSITION)
    theHook: "Aggressive equity grant ahead of secondary tender offer, uncapped OTE structure, and full autonomy to restructure the global go-to-market organization.",

    leadershipStyle: "Aggressive closer & pipeline architect who enforces rigorous MEDDPICC sales methodologies across global pods.",
    culturalTraits: "High agency, goal-obsessed, metrics-driven coach who builds transparent, high-accountability sales cultures.",
    urgencyRating: 9,
    urgencyScore: "URGENT",
    urgencyDirective: "HIGH-PRIORITY REPLACEMENT: Enterprise sales quota attainment dropped 22% last quarter. Place an enterprise CRO within 45 days to secure FY27 revenue targets.",
    aiReasoning: "CEO expressed acute concern during intake call: 'Our Q3 pipeline is stalling without senior enterprise leadership; we need someone who can command executive boardroom sales immediately.' Severe revenue impact if position remains vacant."
  },
  {
    id: "spec-3",
    code: "TARGET-003",
    company: "Acme FinTech Global",
    department: "Executive Engineering",
    priority: "High",
    createdAt: NOW - 1000 * 60 * 60, // 1 hour ago
    status: "Searching",
    stage: "sourcing", // 20% probability
    targetSalaryNumber: 320000,
    feePercentage: 0.30,
    daysOpen: 14,
    qualifiedCandidatesCount: 1,
    boardReadinessScore: 86,
    pnlScaleManaged: "$48M Engineering Budget",
    urgencyClassification: "High",
    frictionRisk: {
      hasRisk: true,
      type: "$1.8M Equity Cliff",
      details: "Significant unvested stock options requiring buyout package from hiring board."
    },
    backchannelStatus: "verified",
    secondaryMandates: [
      {
        roleTitle: "Chief Technology Officer",
        company: "Veloce Labs",
        matchScore: 89,
        rationale: "High-scale distributed systems architecture matches high-throughput financial core."
      }
    ],
    profileLogs: [
      {
        id: "log-301",
        timestamp: "08:15 AM",
        action: "Profile Initialized",
        details: "AI generated spec from CTO & Founder meeting notes.",
        type: "system"
      },
      {
        id: "log-302",
        timestamp: "08:20 AM",
        action: "Active Candidate Search",
        details: "Headhunting VP Engineering talent at Stripe and Adyen.",
        type: "status_change"
      }
    ],

    // 1. CLIENT CONTEXT & MANDATE OVERVIEW
    industryVertical: "FinTech, Cross-Border Payment Infrastructure & Real-Time Settlement",
    stageRevenueScale: "Series C ($95M raised) / $14B Annual Processing Volume / 220 FTEs",
    strategicDriver: "Technical modernization to handle 50,000 TPS with 99.999% SLA uptime ahead of APAC and European market expansion.",
    clientProfile: "Cross-border payment infrastructure provider processing $14B annually across 42 countries, backed by Tier-1 institutional venture firms.",
    coreChallenge: "Engineering team grew rapidly to 160 engineers with fragmented microservices; requires a VP of Engineering to overhaul technical architecture, implement SOC-2 Type II controls, and scale transaction throughput to 50,000 TPS.",

    // 2. ROLE DEFINITION & TOTAL COMPENSATION
    roleTitle: "VP of Engineering (Payments Core)",
    reportingTo: "Chief Technology Officer (CTO)",
    locationWorkspace: "Hybrid — San Francisco, CA / London, UK (Flexible Remote)",
    compensationPackage: "Base: $290,000–$350,000 | Bonus: 25% MBO | Equity: 0.8%–1.0% Options",

    // 3. TARGET HUNTING GROUNDS & OFF-LIMITS
    targetHuntingGrounds: "Stripe, Adyen, Plaid, Brex, Block (Square), Checkout.com, Marqeta",
    adjacentIndustryFit: "High-frequency distributed financial systems, banking core SaaS, or latency-critical processing",
    offLimitsOrganizations: "Tier-1 banking partners and co-clearing networks with strict non-solicitation terms.",

    // 4. MANDATORY TRACK RECORD (MUST-HAVES)
    pnlBudgetScale: "Proven management of $48M+ engineering & infrastructure budget with leadership over 100+ software engineers",
    keyExecutionMilestones: "Has architected and scaled a financial core processing engine to 50k+ TPS with SOC-2 Type II and PCI-DSS Level 1 compliance.",
    tenureRequirement: "Minimum 5 years in VP Engineering or Head of Engineering executive capacity",
    trackRecord: "Led engineering organizations of 100+ engineers in high-throughput, low-latency financial systems with 99.999% uptime SLAs.",
    industryExperience: "FinTech, Payments Infrastructure, High-Frequency Systems, Banking SaaS.",

    // 5. SOURCING PARAMETERS & BOOLEAN TARGETING
    comparableCurrentTitles: "VP of Engineering, Head of Core Infrastructure, Engineering Director (FinTech), VP Platform Engineering",
    booleanSearchString: '("VP Engineering" OR "Head of Engineering" OR "VP Platform") AND ("FinTech" OR "Payments") AND ("High-Throughput" OR "Distributed Systems") AND ("SLA")',
    geographicBoundaries: "San Francisco Bay Area / US West Coast / London UK",

    // 6. THE HOOK (EXECUTIVE VALUE PROPOSITION)
    theHook: "Direct leadership over the company's core technology stack, substantial option pool allocation, and opportunity to build the next-generation global payment rails.",

    leadershipStyle: "Engineering rigor advocate & servant leader who bridges deep distributed systems engineering with executive board reporting.",
    culturalTraits: "Zero ego, relentless focus on operational excellence, developer velocity champion with high emotional intelligence.",
    urgencyRating: 8,
    urgencyScore: "HIGH",
    urgencyDirective: "STRATEGIC EXPANSION: Core processing platform experiencing latency spikes during peak Asian market hours. Secure a battle-tested engineering leader before Q4 global launch.",
    aiReasoning: "Intake meeting transcript highlighted technical debt risk: 'Current engineering directors are overwhelmed by scaling demands; we need an executive who has managed 100+ engineers and 99.999% SLA platforms.' High urgency driven by product roadmap milestones."
  },
  {
    id: "spec-4",
    code: "TARGET-004",
    company: "Krypton Cloud Solutions",
    department: "Executive HR & Talent",
    priority: "High",
    createdAt: NOW - 1000 * 60 * 180, // 3 hours ago -> OLDEST
    status: "Searching",
    stage: "sourcing", // 20% probability
    targetSalaryNumber: 290000,
    feePercentage: 0.30,
    daysOpen: 26,
    qualifiedCandidatesCount: 2,
    boardReadinessScore: 89,
    pnlScaleManaged: "$25M Global HR Budget",
    urgencyClassification: "Pipeline",
    frictionRisk: {
      hasRisk: false,
      type: "Clean",
      details: "Relocation flexible and no restrictive covenants."
    },
    backchannelStatus: "verified",
    secondaryMandates: [
      {
        roleTitle: "Head of Executive Talent & People",
        company: "Nexus AI Labs",
        matchScore: 88,
        rationale: "Exceptional public company compensation committee track record."
      }
    ],
    profileLogs: [
      {
        id: "log-401",
        timestamp: "07:30 AM",
        action: "Profile Initialized",
        details: "AI generated spec from board committee briefing transcript.",
        type: "system"
      },
      {
        id: "log-402",
        timestamp: "07:35 AM",
        action: "Active Candidate Search",
        details: "Evaluating CPO talent at ServiceNow, Workday, and Twilio.",
        type: "status_change"
      }
    ],

    // 1. CLIENT CONTEXT & MANDATE OVERVIEW
    industryVertical: "Enterprise Cloud Governance, Identity Management (Public Technology Company)",
    stageRevenueScale: "Post-IPO ($180M ARR) / 1,400 Global FTEs across US, EMEA & APAC",
    strategicDriver: "Global workforce integration following two major European acquisitions; requires a modern Chief People Officer to harmonize executive compensation, culture, and talent retention.",
    clientProfile: "Post-IPO enterprise cloud governance company (1,400 employees across North America, EMEA, and APAC).",
    coreChallenge: "Global workforce integration following two major European acquisitions; requires a modern Chief People Officer to harmonize compensation bands, executive succession planning, and global employer brand.",

    // 2. ROLE DEFINITION & TOTAL COMPENSATION
    roleTitle: "Chief People Officer (CPO)",
    reportingTo: "Chief Executive Officer & Board Compensation Committee",
    locationWorkspace: "Hybrid — Austin, TX HQ / US Remote Flexible",
    compensationPackage: "Base: $260,000–$320,000 | Bonus: 30% MBO | Equity: $200k/yr Public RSU Grant",

    // 3. TARGET HUNTING GROUNDS & OFF-LIMITS
    targetHuntingGrounds: "ServiceNow, Workday, Twilio, GitLab, Atlassian, Box, HubSpot",
    adjacentIndustryFit: "Public enterprise software, global IT services, and multi-entity SaaS organizations",
    offLimitsOrganizations: "Current institutional board affiliations and reciprocal search partners.",

    // 4. MANDATORY TRACK RECORD (MUST-HAVES)
    pnlBudgetScale: "Proven oversight of $25M+ global people operations budget across 1,000+ employees in multi-country entities",
    keyExecutionMilestones: "Has led human capital integration through public M&A transactions and reported directly to Board Compensation Committees.",
    tenureRequirement: "Minimum 8 years in CPO, VP People, or Head of Global Talent executive leadership",
    trackRecord: "Must have served as CPO or VP People for a public technology company of 1,000+ employees with international entities.",
    industryExperience: "Enterprise Cloud, B2B Software, Global IT Services, Public Tech Companies.",

    // 5. SOURCING PARAMETERS & BOOLEAN TARGETING
    comparableCurrentTitles: "CPO, Chief People Officer, VP Global People Operations, Head of Human Capital, Chief HR Officer",
    booleanSearchString: '("CPO" OR "Chief People Officer" OR "VP People" OR "CHRO") AND ("Enterprise" OR "Public Company") AND ("M&A" OR "Compensation Committee")',
    geographicBoundaries: "Austin, TX / US National Remote",

    // 6. THE HOOK (EXECUTIVE VALUE PROPOSITION)
    theHook: "Direct board-level influence, stable public company balance sheet with generous annual liquid RSU grants, and a culture centered on executive empowerment.",

    leadershipStyle: "Empathetic, data-backed human capital strategist with deep board compensation committee governance experience.",
    culturalTraits: "Inspirational communicator, pragmatic diplomat, champion of high-performance and inclusive executive cultures.",
    urgencyRating: 7,
    urgencyScore: "PASSIVE/PIPELINING",
    urgencyDirective: "SUCCESSION PLANNING: Current interim HR director stepping down in 60 days. Identify Tier-1 CPO candidates with public company M&A integration expertise.",
    aiReasoning: "Board transcript indicates strategic transition rather than emergency crisis: 'We have strong HR operations, but we lack board-level people leadership for post-merger integration.' High priority but deliberate timeline."
  }
];

export const RANDOM_MANDATE_TEMPLATES = [
  {
    roleTitle: "Chief Product Officer (CPO)",
    company: "Aether AI Robotics",
    industryVertical: "Generative AI, Autonomous Robotics & Edge Compute",
    stageRevenueScale: "Series C ($110M raised) / $75M ARR / 380 FTEs",
    strategicDriver: "Transition from research prototypes to enterprise AI hardware-software ecosystem.",
    clientProfile: "Series C Enterprise Robotics scale-up building embodied AI platforms.",
    coreChallenge: "Scale product management discipline across 4 global R&D centers and launch enterprise SDK.",
    reportingTo: "Chief Executive Officer & Board of Directors",
    locationWorkspace: "Hybrid — San Francisco, CA (3 days on-site) / US Remote",
    compensationPackage: "Base: $340,000–$400,000 | Bonus: 35% MBO | Equity: 1.5%–2.0% Options",
    targetSalaryNumber: 370000,
    feePercentage: 0.30,
    targetHuntingGrounds: "OpenAI, Scale AI, Figure AI, Boston Dynamics, Tesla Autopilot, Apple",
    adjacentIndustryFit: "Autonomous Systems, Computer Vision SaaS, Edge Machine Learning",
    offLimitsOrganizations: "Direct VC co-investments and active client accounts under NDA",
    pnlBudgetScale: "$40M Product & Engineering Budget",
    keyExecutionMilestones: "Shipped enterprise AI hardware product from $10M to $100M+ ARR scale",
    tenureRequirement: "Minimum 8 years in VP Product / CPO capacity in high-growth tech",
    comparableCurrentTitles: "Chief Product Officer, VP Product Management, Head of Enterprise AI Products",
    booleanSearchString: '("CPO" OR "Chief Product Officer" OR "VP Product") AND ("Robotics" OR "Generative AI" OR "Autonomous") AND ("Enterprise")',
    geographicBoundaries: "San Francisco Bay Area / US West Coast",
    theHook: "Lead product for the fastest-growing embodied AI scale-up with Tier-1 lead VC backing and 40 months runway.",
    boardReadinessScore: 94,
  },
  {
    roleTitle: "VP Global Sales & Partnerships",
    company: "Veritas Cyber Defense",
    industryVertical: "Cybersecurity, Zero-Trust Architecture & Threat Intel",
    stageRevenueScale: "Series D ($140M raised) / $90M ARR / 460 FTEs",
    strategicDriver: "Expanding European and APAC enterprise sales footprint ahead of IPO filing.",
    clientProfile: "High-growth cybersecurity leader protecting Fortune 500 infrastructure.",
    coreChallenge: "Build regional enterprise sales pods in London, Singapore, and Frankfurt to achieve $150M ARR.",
    reportingTo: "Chief Revenue Officer (CRO)",
    locationWorkspace: "Hybrid — New York, NY / London UK",
    compensationPackage: "Base: $290,000–$330,000 | Bonus: 100% Commission OTE ($620k) | Equity: 1.0% RSUs",
    targetSalaryNumber: 310000,
    feePercentage: 0.30,
    targetHuntingGrounds: "Palo Alto Networks, CrowdStrike, SentinelOne, Zscaler, Cloudflare, Fortinet",
    adjacentIndustryFit: "Identity Security, Cloud Defense, SASE Infrastructure",
    offLimitsOrganizations: "Current channel distribution partners and strategic reseller alliances",
    pnlBudgetScale: "$80M Global Revenue Quota",
    keyExecutionMilestones: "Built multi-region enterprise sales team from $30M to $100M+ international ARR",
    tenureRequirement: "Minimum 6 years in VP Sales or Commercial Director leadership",
    comparableCurrentTitles: "VP Global Sales, Head of International Sales, SVP Enterprise Revenue",
    booleanSearchString: '("VP Sales" OR "SVP Sales" OR "Global Head of Sales") AND ("Cybersecurity" OR "Zero Trust" OR "MEDDPICC")',
    geographicBoundaries: "New York Metro / EMEA / US East Coast",
    theHook: "Liquid RSU pre-IPO grant with accelerated vesting upon liquidity event and uncapped commissions.",
    boardReadinessScore: 91,
  },
  {
    roleTitle: "Chief Marketing Officer (CMO)",
    company: "Luminary Health Cloud",
    industryVertical: "HealthTech, Clinical SaaS & EHR Automation",
    stageRevenueScale: "Series B ($45M raised) / $35M ARR / 180 FTEs",
    strategicDriver: "Rebranding from clinical workflow tool to enterprise healthcare AI platform.",
    clientProfile: "Fast-growing digital health platform serving top 50 US hospital systems.",
    coreChallenge: "Establish enterprise brand dominance and drive $20M+ inbound pipeline from health system CIOs.",
    reportingTo: "Chief Executive Officer & Board of Directors",
    locationWorkspace: "Remote (US East/Central) / Boston MA HQ",
    compensationPackage: "Base: $275,000–$325,000 | Bonus: 30% MBO | Equity: 1.2% Options",
    targetSalaryNumber: 300000,
    feePercentage: 0.30,
    targetHuntingGrounds: "Veeva Systems, Epic Systems, Flatiron Health, Doximity, Athenahealth",
    adjacentIndustryFit: "Digital Health Enterprise, Clinical SaaS, Regulated Tech",
    offLimitsOrganizations: "Health network consortium board members",
    pnlBudgetScale: "$18M Global Marketing Budget",
    keyExecutionMilestones: "Executed enterprise rebrand and scaled marketing attribution from $10M to $50M ARR",
    tenureRequirement: "Minimum 6 years in CMO or VP Marketing role in B2B HealthTech",
    comparableCurrentTitles: "Chief Marketing Officer, VP Enterprise Marketing, Global Head of Growth",
    booleanSearchString: '("CMO" OR "Chief Marketing Officer" OR "VP Marketing") AND ("HealthTech" OR "Healthcare SaaS" OR "EHR")',
    geographicBoundaries: "Greater Boston / US Remote",
    theHook: "Full creative and budget autonomy to position the company as category king ahead of Series C.",
    boardReadinessScore: 88,
  },
  {
    roleTitle: "Chief Financial Officer (CFO)",
    company: "Prism Financial Rails",
    industryVertical: "FinTech, Real-Time Clearing & Embedded Banking",
    stageRevenueScale: "Series C ($80M raised) / $65M Annual Revenue / 210 FTEs",
    strategicDriver: "Leading capital markets strategy, series D growth round, and regulatory audit compliance.",
    clientProfile: "Cross-border FinTech rails processing $8B annually across North America and Europe.",
    coreChallenge: "Structure multi-currency balance sheet treasury and prepare financial systems for SOX compliance.",
    reportingTo: "Chief Executive Officer & Audit Committee",
    locationWorkspace: "Hybrid — New York, NY (2 days on-site) / Remote",
    compensationPackage: "Base: $350,000–$420,000 | Bonus: 40% MBO | Equity: 1.8% Options",
    targetSalaryNumber: 385000,
    feePercentage: 0.30,
    targetHuntingGrounds: "Stripe, Plaid, Brex, Adyen, Marqeta, Toast, Robinhood",
    adjacentIndustryFit: "Payments, High-Throughput Financial Systems, Banking Tech",
    offLimitsOrganizations: "Co-banking partner networks under strict non-solicit agreement",
    pnlBudgetScale: "$65M Corporate Treasury & P&L",
    keyExecutionMilestones: "Raised $100M+ in equity/debt and led financial readiness for major tech IPO/M&A exit",
    tenureRequirement: "Minimum 8 years as CFO or VP Finance in high-growth FinTech",
    comparableCurrentTitles: "Chief Financial Officer, VP Finance, Head of Strategic Finance & Treasury",
    booleanSearchString: '("CFO" OR "Chief Financial Officer" OR "VP Finance") AND ("FinTech" OR "Payments" OR "Treasury") AND ("SOX" OR "Series C")',
    geographicBoundaries: "New York, NY / US East Coast",
    theHook: "Direct governance role with board audit committee, substantial founder-level equity grant.",
    boardReadinessScore: 96,
  },
  {
    roleTitle: "Chief AI & Science Officer (CAIO)",
    company: "Helix BioSystems",
    industryVertical: "DeepTech, Computational Biology & Protein Design",
    stageRevenueScale: "Series B ($60M raised) / $25M Revenue / 120 FTEs",
    strategicDriver: "Scaling proprietary generative transformer models for drug target discovery.",
    clientProfile: "DeepTech biology lab building foundation models for therapeutic discovery.",
    coreChallenge: "Scale compute cluster architecture and lead 40+ Ph.D. machine learning research scientists.",
    reportingTo: "Chief Executive Officer & Scientific Advisory Board",
    locationWorkspace: "On-site / Hybrid (Cambridge, MA / London UK)",
    compensationPackage: "Base: $370,000–$440,000 | Bonus: 30% MBO | Equity: 2.0% Equity",
    targetSalaryNumber: 405000,
    feePercentage: 0.30,
    targetHuntingGrounds: "DeepMind, Isomorphic Labs, Genentech, Recursion, OpenAI, Insitro",
    adjacentIndustryFit: "Generative Chemistry, Foundation Models, Structural Biology",
    offLimitsOrganizations: "Academic research partner institutions with conflict of interest protocols",
    pnlBudgetScale: "$35M Annual Compute & Science Budget",
    keyExecutionMilestones: "Published breakthrough peer-reviewed AI research and deployed commercial drug targets",
    tenureRequirement: "Ph.D. with 7+ years directing machine learning research groups",
    comparableCurrentTitles: "Chief AI Officer, VP AI Research, Head of Machine Learning & Science",
    booleanSearchString: '("Chief AI Officer" OR "Head of AI" OR "VP Research") AND ("Computational Biology" OR "Machine Learning" OR "DeepTech")',
    geographicBoundaries: "Boston / Cambridge, MA / London UK",
    theHook: "Unlimited GPU compute cluster allocation, Tier-1 science venture backing, and Nobel-caliber advisory board.",
    boardReadinessScore: 97,
  },
  {
    roleTitle: "Chief Operating Officer (COO)",
    company: "Quantum Logistics AI",
    industryVertical: "Autonomous Supply Chain, Fleet Automation & Industrial SaaS",
    stageRevenueScale: "Series C ($95M raised) / $80M ARR / 520 FTEs",
    strategicDriver: "Overhauling multi-hub warehouse operations and implementing autonomous vehicle dispatch.",
    clientProfile: "Enterprise supply chain automation provider operating across 18 US logistics centers.",
    coreChallenge: "Drive gross margins from 42% to 65% while maintaining 99.8% on-time fulfillment SLAs.",
    reportingTo: "Chief Executive Officer & Board of Directors",
    locationWorkspace: "Hybrid — Chicago, IL HQ (3 days on-site) / US Remote",
    compensationPackage: "Base: $320,000–$380,000 | Bonus: 40% MBO | Equity: 1.5% Options",
    targetSalaryNumber: 350000,
    feePercentage: 0.30,
    targetHuntingGrounds: "Amazon Operations, Flexport, Samsara, Uber Freight, FedEx Dataworks, C.H. Robinson",
    adjacentIndustryFit: "Fleet Tech, Supply Chain Automation, Warehouse Robotics",
    offLimitsOrganizations: "National 3PL partner networks under non-compete agreements",
    pnlBudgetScale: "$60M Operations & Fleet Budget",
    keyExecutionMilestones: "Scaled multi-site operations from 200 to 1,000+ personnel with positive operating cash flow",
    tenureRequirement: "Minimum 8 years in COO / VP Operations executive capacity",
    comparableCurrentTitles: "COO, Chief Operating Officer, SVP Global Operations, VP Supply Chain Operations",
    booleanSearchString: '("COO" OR "Chief Operating Officer" OR "SVP Operations") AND ("Logistics" OR "Supply Chain" OR "Automation") AND ("P&L")',
    geographicBoundaries: "Greater Chicago / US Midwest / National",
    theHook: "Complete operational mandate to scale company toward a $1B+ enterprise valuation.",
    boardReadinessScore: 93,
  }
];

interface SearchCandidatesViewProps {
  currentRole?: UserRole;
}

export function SearchCandidatesView({ currentRole = "CEO" }: SearchCandidatesViewProps) {
  const { addLog } = useLogs();
  const {
    candidateSpecs,
    setCandidateSpecs,
    sourceCandidateSpec,
    restoreLastCandidateSpec,
    deleteCandidateSpecPermanently,
    revertAllCandidateSpecs,
    deletedSpecsBuffer,
    addCandidateSpec,
    focusedSpecId,
    setFocusedSpecId
  } = useAppData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState<CandidateSearchSpec | null>(null);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [mainTab, setMainTab] = useState<"active" | "logs">("active");
  const [ledgerTab, setLedgerTab] = useState<"active" | "logs">("active");
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>("All");
  const [slidingRightIds, setSlidingRightIds] = useState<string[]>([]);

  // Executive Action Modals State
  const [isOnePagerModalOpen, setIsOnePagerModalOpen] = useState(false);
  const [isFrictionModalOpen, setIsFrictionModalOpen] = useState(false);
  const [isBackchannelModalOpen, setIsBackchannelModalOpen] = useState(false);
  const [isSecondaryMandateModalOpen, setIsSecondaryMandateModalOpen] = useState(false);

  const [activeActionSpec, setActiveActionSpec] = useState<CandidateSearchSpec | null>(null);
  const [onePagerCopiedToast, setOnePagerCopiedToast] = useState(false);
  const [backchannelTriggeredToast, setBackchannelTriggeredToast] = useState(false);
  const [booleanCopied, setBooleanCopied] = useState(false);

  // Performance & Scaling State (for 50+ / high-volume executive mandates)
  const [modalSidebarSearch, setModalSidebarSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Lock background scroll when modal or create drawer is open
  useLockBodyScroll(
    isLedgerModalOpen ||
    isCreateProfileOpen ||
    isOnePagerModalOpen ||
    isFrictionModalOpen ||
    isBackchannelModalOpen ||
    isSecondaryMandateModalOpen
  );

  // Handle direct opening from Global Search
  useEffect(() => {
    if (!focusedSpecId) return;

    const spec = candidateSpecs.find((s) => s.id === focusedSpecId);
    if (spec) {
      setSelectedSpec(spec);
      setLedgerTab(spec.status === "Finded" ? "logs" : "active");
      setIsLedgerModalOpen(true);
    }

    setFocusedSpecId(null);
  }, [focusedSpecId, candidateSpecs, setFocusedSpecId]);

  // Calculate active and logs counts
  const activeCount = useMemo(() => candidateSpecs.filter((s) => s.status !== "Finded").length, [candidateSpecs]);
  const logsCount = useMemo(() => candidateSpecs.filter((s) => s.status === "Finded").length, [candidateSpecs]);

  // Sidebar list for modal with high-speed filter
  const sidebarList = useMemo(() => {
    const base = candidateSpecs.filter((s) => {
      if (ledgerTab === "active") return s.status !== "Finded";
      return s.status === "Finded";
    });
    if (!modalSidebarSearch.trim()) return base;
    const q = modalSidebarSearch.toLowerCase().trim();
    return base.filter((s) =>
      s.roleTitle.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.department && s.department.toLowerCase().includes(q))
    );
  }, [candidateSpecs, ledgerTab, modalSidebarSearch]);

  // Toggle candidate status between Searching and Finded with profile log entry
  const handleToggleFinded = (specId: string, fromModal: boolean = false) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setCandidateSpecs((prevSpecs) =>
      prevSpecs.map((spec) => {
        if (spec.id !== specId) return spec;

        const isCurrentlyFinded = spec.status === "Finded";
        const newStatus: "Searching" | "Finded" = isCurrentlyFinded ? "Searching" : "Finded";

        const newLog: ProfileLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          action: isCurrentlyFinded ? "Status Reverted to Searching" : "Marked as Finded",
          details: isCurrentlyFinded
            ? "Action reverted: Candidate status restored to Searching."
            : "Candidate marked as Finded (Sourced & Fulfilled).",
          type: "status_change",
        };

        const updatedLogs = [newLog, ...(spec.profileLogs || [])];
        const updatedSpec: CandidateSearchSpec = {
          ...spec,
          status: newStatus,
          profileLogs: updatedLogs,
        };

        addLog({
          category: "Candidate Spec",
          action: isCurrentlyFinded
            ? `Reverted Status to Searching: ${spec.code}`
            : `Marked Candidate as Finded: ${spec.code}`,
          details: `Candidate specification ${spec.code} (${spec.roleTitle} at ${spec.company}) status set to ${newStatus}.`,
          level: isCurrentlyFinded ? "info" : "success",
          userRole: currentRole,
        });

        return updatedSpec;
      })
    );

    if (fromModal) {
      // Auto-select next candidate spec in current tab so user can continuously spam revert
      const remainingInTab = candidateSpecs.filter((s) => {
        if (ledgerTab === "logs") {
          return s.status === "Finded" && s.id !== specId;
        }
        return s.status !== "Finded" && s.id !== specId;
      });
      setSelectedSpec(remainingInTab[0] || null);
    }
  };

  const handlePermanentDeleteSpec = (specId: string) => {
    const remainingInTab = candidateSpecs.filter((s) => s.status === "Finded" && s.id !== specId);
    setCandidateSpecs((prev) => prev.filter((s) => s.id !== specId));
    deleteCandidateSpecPermanently(specId, currentRole);
    setSelectedSpec(remainingInTab[0] || null);
  };

  // 1. Stage Advance Handler for Executive Weighted Pipeline
  const handleUpdateStage = (specId: string, newStage: MandateStage) => {
    const isPlaced = newStage === "placed";
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setCandidateSpecs((prev) =>
      prev.map((spec) => {
        if (spec.id !== specId) return spec;

        const newLog: ProfileLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          action: `Mandate Stage: ${STAGE_CONFIG[newStage].shortLabel}`,
          details: `Candidate moved to ${STAGE_CONFIG[newStage].label}. Closing probability updated to ${Math.round(STAGE_CONFIG[newStage].probability * 100)}%.`,
          type: "status_change",
        };

        const updatedSpec: CandidateSearchSpec = {
          ...spec,
          stage: newStage,
          status: isPlaced ? "Finded" : "Searching",
          profileLogs: [newLog, ...(spec.profileLogs || [])]
        };

        addLog({
          category: "Candidate Spec",
          action: `Mandate Stage Advanced: ${spec.code} → ${STAGE_CONFIG[newStage].shortLabel}`,
          details: `Pipeline Weighted Value recalculated at ${Math.round(STAGE_CONFIG[newStage].probability * 100)}% probability.`,
          level: isPlaced ? "success" : "info",
          userRole: currentRole
        });

        return updatedSpec;
      })
    );
  };

  // 2. Adjust Qualified Candidates for Search Mandate Urgency Index
  const handleAdjustQualified = (specId: string, delta: number) => {
    setCandidateSpecs((prev) =>
      prev.map((spec) => {
        if (spec.id !== specId) return spec;
        const currentCount = spec.qualifiedCandidatesCount ?? 1;
        const nextCount = Math.max(0, currentCount + delta);
        return {
          ...spec,
          qualifiedCandidatesCount: nextCount
        };
      })
    );
  };

  // Dynamic Timeline Tracker: Identifies newest and first created profile
  const { newestSpecId, oldestSpecId } = useMemo(() => {
    const activeList = candidateSpecs.filter((s) => s.status !== "Finded");
    const listToScan = activeList.length > 0 ? activeList : candidateSpecs;
    if (listToScan.length === 0) return { newestSpecId: null, oldestSpecId: null };

    let newest = listToScan[0];
    let oldest = listToScan[0];

    for (const s of listToScan) {
      if ((s.createdAt || 0) > (newest.createdAt || 0)) {
        newest = s;
      }
      if ((s.createdAt || 0) < (oldest.createdAt || 0)) {
        oldest = s;
      }
    }

    return {
      newestSpecId: newest.id,
      oldestSpecId: oldest.id !== newest.id ? oldest.id : null
    };
  }, [candidateSpecs]);

  // Format relative creation time (e.g. 5m ago, 2h ago, 1d ago)
  const formatRelativeTime = (createdAt?: number) => {
    if (!createdAt) return "Recently created";
    const diffMs = Math.max(0, Date.now() - createdAt);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1d ago";
    return `${diffDays}d ago`;
  };

  // Profile Number Helper: extracts 1, 2, 3, etc. from spec
  const getProfileNumber = (spec: CandidateSearchSpec) => {
    const match = spec.code.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10).toString();
    }
    const idMatch = spec.id.match(/\d+/);
    if (idMatch) {
      return parseInt(idMatch[0], 10).toString();
    }
    return "1";
  };

  const renderTimelineBadge = (spec?: CandidateSearchSpec | null) => {
    if (!spec) return null;

    const timeAgo = formatRelativeTime(spec.createdAt);
    const isNewest = spec.id === newestSpecId;
    const isOldest = spec.id === oldestSpecId;

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Creation Timestamp / Time Ago Badge */}
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 px-2 py-0.5 text-[10px] font-bold tracking-tight">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>Created {timeAgo}</span>
        </span>

        {/* Newest / First Created Status Badge */}
        {isNewest && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
            <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
            NEWEST
          </span>
        )}

        {isOldest && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            FIRST CREATED
          </span>
        )}
      </div>
    );
  };

  // Form State for creating a new candidate specification
  const [newSpecForm, setNewSpecForm] = useState({
    company: "",
    clientProfile: "",
    coreChallenge: "",
    roleTitle: "",
    reportingTo: "",
    compensationPackage: "",
    locationWorkspace: "",
    trackRecord: "",
    industryExperience: "",
    targetHuntingGrounds: "",
    leadershipStyle: "",
    culturalTraits: "",
    urgencyRating: 8,
    urgencyScore: "URGENT",
    urgencyDirective: "",
    aiReasoning: "",
    boardReadinessScore: 90,
    pnlScaleManaged: "$50M+ P&L"
  });

  const handleCreateSpec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecForm.roleTitle || !newSpecForm.company) return;

    const newIndex = candidateSpecs.length + 1;
    const padded = String(newIndex).padStart(3, "0");
    const newSpec: CandidateSearchSpec = {
      id: `spec-${Date.now()}`,
      code: `TARGET-${padded}`,
      company: newSpecForm.company,
      industryVertical: newSpecForm.industryExperience || "Enterprise B2B SaaS, Technology",
      stageRevenueScale: newSpecForm.clientProfile || "Growth Stage ($50M+ ARR / 250 FTEs)",
      strategicDriver: newSpecForm.coreChallenge || "Strategic leadership expansion to drive next stage of scale",
      clientProfile: newSpecForm.clientProfile || "Enterprise Scale Client",
      coreChallenge: newSpecForm.coreChallenge || "Strategic leadership expansion",
      roleTitle: newSpecForm.roleTitle,
      reportingTo: newSpecForm.reportingTo || "Chief Executive Officer & Board of Directors",
      compensationPackage: newSpecForm.compensationPackage || "Base: $280,000–$350,000 | Bonus: 35% MBO | Equity: 1.0%–1.5%",
      locationWorkspace: newSpecForm.locationWorkspace || "Hybrid / Remote Flexible",
      targetHuntingGrounds: newSpecForm.targetHuntingGrounds || "Top Tier Industry Competitors (Snowflake, Datadog, Okta)",
      adjacentIndustryFit: newSpecForm.industryExperience || "Enterprise Cloud Infrastructure, B2B SaaS",
      offLimitsOrganizations: "Current institutional client accounts and contractual NDA partners",
      pnlBudgetScale: newSpecForm.pnlScaleManaged || "$50M+ P&L",
      keyExecutionMilestones: newSpecForm.trackRecord || "Demonstrated executive track record in scaling operations",
      tenureRequirement: "Minimum 5 years in C-Suite or VP-level executive capacity",
      trackRecord: newSpecForm.trackRecord || "Demonstrated executive track record in scaling operations",
      industryExperience: newSpecForm.industryExperience || "Enterprise SaaS / Technology",
      comparableCurrentTitles: newSpecForm.roleTitle,
      booleanSearchString: `("${newSpecForm.roleTitle}") AND ("${newSpecForm.company}") AND ("Executive")`,
      geographicBoundaries: newSpecForm.locationWorkspace || "US National / Flexible",
      theHook: "High-leverage equity package with Tier-1 institutional backing and full autonomy to lead strategic expansion",
      leadershipStyle: newSpecForm.leadershipStyle || "Transformational & High Integrity",
      culturalTraits: newSpecForm.culturalTraits || "High agency & executive presence",
      urgencyRating: newSpecForm.urgencyRating || 8,
      urgencyScore: (newSpecForm.urgencyScore as any) || "URGENT",
      urgencyDirective: newSpecForm.urgencyDirective || "Active Executive Search Mandate",
      aiReasoning: newSpecForm.aiReasoning || "Standard candidate specification created by executive search partner.",
      boardReadinessScore: newSpecForm.boardReadinessScore || 90,
      pnlScaleManaged: newSpecForm.pnlScaleManaged || "$50M+ P&L",
      urgencyClassification: "High",
      frictionRisk: { hasRisk: false, type: "Clean", details: "Standard vetting" },
      backchannelStatus: "verified",
      createdAt: Date.now(),
      status: "Searching",
      profileLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          action: "Profile Initialized",
          details: `Manual candidate specification created for ${newSpecForm.roleTitle} at ${newSpecForm.company}.`,
          type: "system",
        },
      ],
    };

    addCandidateSpec(newSpec);
    setIsCreateProfileOpen(false);

    setNewSpecForm({
      company: "",
      clientProfile: "",
      coreChallenge: "",
      roleTitle: "",
      reportingTo: "",
      compensationPackage: "",
      locationWorkspace: "",
      trackRecord: "",
      industryExperience: "",
      targetHuntingGrounds: "",
      leadershipStyle: "",
      culturalTraits: "",
      urgencyRating: 8,
      urgencyScore: "URGENT",
      urgencyDirective: "",
      aiReasoning: "",
      boardReadinessScore: 90,
      pnlScaleManaged: "$50M+ P&L"
    });
  };

  // Generate a realistic random executive search candidate spec
  const handleAddRandomProfile = () => {
    const template = RANDOM_MANDATE_TEMPLATES[Math.floor(Math.random() * RANDOM_MANDATE_TEMPLATES.length)];
    const newIndex = candidateSpecs.length + 1;
    const padded = String(newIndex).padStart(3, "0");
    const stagesList: MandateStage[] = ["sourcing", "shortlist", "board"];
    const randomStage = stagesList[Math.floor(Math.random() * stagesList.length)];
    const randomDays = Math.floor(Math.random() * 35) + 6;
    const randomQual = Math.floor(Math.random() * 4) + 1;

    const newSpec: CandidateSearchSpec = {
      id: `spec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      code: `TARGET-${padded}`,
      company: template.company,
      industryVertical: template.industryVertical,
      stageRevenueScale: template.stageRevenueScale,
      strategicDriver: template.strategicDriver,
      clientProfile: template.clientProfile,
      coreChallenge: template.coreChallenge,
      roleTitle: template.roleTitle,
      reportingTo: template.reportingTo,
      compensationPackage: template.compensationPackage,
      locationWorkspace: template.locationWorkspace,
      targetHuntingGrounds: template.targetHuntingGrounds,
      adjacentIndustryFit: template.adjacentIndustryFit,
      offLimitsOrganizations: template.offLimitsOrganizations,
      pnlBudgetScale: template.pnlBudgetScale,
      keyExecutionMilestones: template.keyExecutionMilestones,
      tenureRequirement: template.tenureRequirement,
      trackRecord: template.keyExecutionMilestones,
      industryExperience: template.industryVertical,
      comparableCurrentTitles: template.comparableCurrentTitles,
      booleanSearchString: template.booleanSearchString,
      geographicBoundaries: template.geographicBoundaries,
      theHook: template.theHook,
      boardReadinessScore: template.boardReadinessScore || 92,
      stage: randomStage,
      targetSalaryNumber: template.targetSalaryNumber || 340000,
      feePercentage: template.feePercentage || 0.30,
      daysOpen: randomDays,
      qualifiedCandidatesCount: randomQual,
      leadershipStyle: "Transformational & Data-Driven Executive",
      culturalTraits: "High agency, strategic clarity, high-integrity operator",
      urgencyRating: 8,
      urgencyScore: "URGENT",
      urgencyDirective: "Active Retained Executive Search Mandate",
      aiReasoning: "Random profile generated for executive search pipeline expansion & workload load testing.",
      pnlScaleManaged: template.pnlBudgetScale,
      urgencyClassification: "High",
      frictionRisk: { hasRisk: false, type: "Clean", details: "Standard vetting" },
      backchannelStatus: "verified",
      createdAt: Date.now(),
      status: "Searching",
      profileLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          action: "Profile Initialized",
          details: `Random executive search mandate generated for ${template.roleTitle} at ${template.company}.`,
          type: "system",
        },
      ],
    };

    addCandidateSpec(newSpec);

    addLog({
      category: "Candidate Spec",
      action: `Generated Random Profile: ${newSpec.code} (${newSpec.roleTitle})`,
      details: `Added mandate at ${newSpec.company} ($${Math.round((newSpec.targetSalaryNumber || 320000) * 0.3 / 1000)}k fee). Recalculated Weighted Pipeline & Capacity Load in real time.`,
      level: "action",
      userRole: currentRole
    });
  };

  // Filter Profiles based on Search, Main Tab, and Timeline
  const filteredSpecs = useMemo(() => {
    return candidateSpecs.filter((spec) => {
      // Main Tab Filter (Active Profiles vs Logs)
      if (mainTab === "active" && spec.status === "Finded") return false;
      if (mainTab === "logs" && spec.status !== "Finded") return false;

      // Timeline filter
      if (selectedPriorityFilter === "Newest") {
        if (spec.id !== newestSpecId) return false;
      } else if (selectedPriorityFilter === "First Created") {
        if (spec.id !== oldestSpecId) return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          spec.roleTitle.toLowerCase().includes(q) ||
          spec.company.toLowerCase().includes(q) ||
          spec.code.toLowerCase().includes(q) ||
          (spec.clientProfile && spec.clientProfile.toLowerCase().includes(q)) ||
          (spec.coreChallenge && spec.coreChallenge.toLowerCase().includes(q)) ||
          (spec.trackRecord && spec.trackRecord.toLowerCase().includes(q)) ||
          (spec.industryExperience && spec.industryExperience.toLowerCase().includes(q)) ||
          (spec.targetHuntingGrounds && spec.targetHuntingGrounds.toLowerCase().includes(q)) ||
          (spec.urgencyDirective && spec.urgencyDirective.toLowerCase().includes(q)) ||
          spec.locationWorkspace.toLowerCase().includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [
    candidateSpecs,
    mainTab,
    searchQuery,
    selectedPriorityFilter,
    newestSpecId,
    oldestSpecId
  ]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, mainTab, selectedPriorityFilter, pageSize]);

  // High-Performance Paginated Specs Calculation (Handles 50-500+ profiles with 60fps)
  const totalPages = pageSize === Infinity ? 1 : Math.max(1, Math.ceil(filteredSpecs.length / pageSize));
  const paginatedSpecs = useMemo(() => {
    if (pageSize === Infinity) return filteredSpecs;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSpecs.slice(startIndex, startIndex + pageSize);
  }, [filteredSpecs, currentPage, pageSize]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Top Banner / Header */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs rounded-2xl">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                  TARGET CANDIDATE PROFILES
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Executive candidate specifications & high-stakes placement operations ({activeCount} Active • {logsCount} Placed)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {logsCount > 0 && (
                <button
                  type="button"
                  onClick={() => revertAllCandidateSpecs(currentRole)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Revert All ({logsCount})</span>
                </button>
              )}
              <button
                type="button"
                onClick={restoreLastCandidateSpec}
                disabled={deletedSpecsBuffer.length === 0 && logsCount === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <RotateCcw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Restore Last Action</span>
              </button>

              {/* Test Button: Add Random Profile */}
              <button
                type="button"
                onClick={handleAddRandomProfile}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-600/30 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                + Add Random Profile
              </button>

              <button
                type="button"
                onClick={() => setIsCreateProfileOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white px-4 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                <span>New Candidate Spec</span>
              </button>
            </div>
          </div>

          {/* Search, Status Tabs & Timeline Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search across ${candidateSpecs.length} executive profiles (Role, Company, Challenge, Hunting Grounds)...`}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 py-2 pl-10 pr-10 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all focus:border-slate-900 dark:focus:border-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Main Tabs (Active vs Finded) */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 border border-slate-200/60 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setMainTab("active")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mainTab === "active"
                    ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setMainTab("logs")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mainTab === "logs"
                    ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
                }`}
              >
                Finded ({logsCount})
              </button>
            </div>

            {/* Timeline Filter */}
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
              {["All", "Newest", "First Created"].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPriorityFilter(p)}
                  className={`rounded-lg px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    selectedPriorityFilter === p
                      ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Grid of Candidate Profiles (Optimized with PaginatedSpecs & Smooth Render) */}
      {paginatedSpecs.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {paginatedSpecs.map((spec) => {
              const urgency = calculateMandateUrgencyScore(spec.daysOpen || 20, spec.qualifiedCandidatesCount ?? 1);
              const currentStage: MandateStage = spec.stage || (spec.status === "Finded" ? "placed" : "sourcing");
              const salary = spec.targetSalaryNumber || 320000;
              const fee = salary * (spec.feePercentage || 0.30);
              const weightedValue = fee * (STAGE_CONFIG[currentStage]?.probability ?? 0.20);

              return (
                <div
                  key={spec.id}
                  onClick={() => {
                    setSelectedSpec(spec);
                    setLedgerTab(spec.status === "Finded" ? "logs" : "active");
                    setIsLedgerModalOpen(true);
                  }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md transition-all cursor-pointer space-y-4"
                >
                  {/* Header: Number Badge (Far Left) + Status & Urgency Index (Far Right) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {/* Far Left: Number Badge + TARGET CANDIDATE PROFILE */}
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono text-xs font-black px-2.5 py-0.5 shadow-xs">
                          {getProfileNumber(spec)}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                          TARGET CANDIDATE PROFILE
                        </span>
                      </div>

                      {/* Far Right: Urgency Score & Status */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-extrabold border ${
                            urgency.status === "high_risk"
                              ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                              : urgency.status === "moderate"
                              ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                              : "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          }`}
                        >
                          Urgency: {urgency.score} ({urgency.label})
                        </span>

                        {spec.status === "Finded" ? (
                          <span className="rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono text-[10px] font-black px-2 py-0.5 tracking-wider uppercase flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            FINDED
                          </span>
                        ) : (
                          <span className="rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-mono text-[10px] font-black px-2 py-0.5 tracking-wider uppercase">
                            SEARCHING
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Role Title & Client */}
                    <div className="pt-1 space-y-1">
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors tracking-tight">
                        {spec.roleTitle}
                      </h2>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span>Client: <strong className="text-slate-900 dark:text-white font-bold">{spec.company}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Strategic Executive Indicators (Board Readiness & Weighted Fee) */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                        Board Score
                      </span>
                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        {spec.boardReadinessScore || 92}/100
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                        Weighted Fee
                      </span>
                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        ${Math.round(weightedValue / 1000)}k
                      </p>
                    </div>
                  </div>

                  {/* 1. Algoritmo de Valor de Pipeline: Interactive Mandate Stage Pipeline Selector */}
                  <div
                    className="space-y-1.5 p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <span>Mandate Pipeline Stage</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">
                        {Math.round((STAGE_CONFIG[currentStage]?.probability ?? 0.2) * 100)}% Prob. (${Math.round(fee / 1000)}k Max)
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {(["sourcing", "shortlist", "board", "placed"] as MandateStage[]).map((stg) => {
                        const isCurrent = currentStage === stg;
                        return (
                          <button
                            key={stg}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStage(spec.id, stg);
                            }}
                            className={`px-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer active:scale-95 ${
                              isCurrent
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                            }`}
                          >
                            {STAGE_CONFIG[stg].shortLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary row: Core Challenge */}
                  <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Core Search Challenge:</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {spec.coreChallenge || spec.clientProfile}
                    </p>
                  </div>

                  {/* Clean Direct Action Button: Mark as Finded / Revert */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFinded(spec.id, false);
                      }}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                        spec.status === "Finded"
                          ? "bg-rose-600 hover:bg-rose-500 text-white"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {spec.status === "Finded" ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Revert</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Mark as Finded</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enterprise High-Volume Pagination Bar */}
          {filteredSpecs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Showing <strong className="text-slate-900 dark:text-white font-mono">{pageSize === Infinity ? 1 : (currentPage - 1) * pageSize + 1}</strong> to{" "}
                  <strong className="text-slate-900 dark:text-white font-mono">{pageSize === Infinity ? filteredSpecs.length : Math.min(currentPage * pageSize, filteredSpecs.length)}</strong> of{" "}
                  <strong className="text-slate-900 dark:text-white font-mono">{filteredSpecs.length}</strong> candidate profiles
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-[11px] text-slate-400">Page Size:</span>
                  {[10, 20, 50, Infinity].map((sz) => (
                    <button
                      key={sz === Infinity ? "All" : sz}
                      type="button"
                      onClick={() => {
                        setPageSize(sz);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        pageSize === sz
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {sz === Infinity ? "All" : sz}
                    </button>
                  ))}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <React.Fragment key={p}>
                            {prev && p - prev > 1 && <span className="px-1 text-slate-400 font-mono">...</span>}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(p)}
                              className={`h-7 w-7 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                                currentPage === p
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Target className="h-8 w-8 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Candidate Profiles Match Criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Try adjusting your Board Readiness, P&L Scale, or Urgency filters to view active executive candidate specifications.
          </p>
        </div>
      )}

      {/* MASTER-DETAIL LEDGER MODAL */}
      <AnimatePresence>
        {isLedgerModalOpen && (
          <div
            className="fixed inset-0 z-[110] overflow-y-auto bg-black/60 dark:bg-slate-950/80 p-4 backdrop-blur-md flex items-center justify-center min-h-screen overscroll-contain"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsLedgerModalOpen(false);
                setSelectedSpec(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl my-auto max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col transition-colors"
            >
              {/* Modal Top Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Target Candidate Profile Ledger
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Audit specification details, board vetting criteria, and placement telemetry
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsLedgerModalOpen(false);
                    setSelectedSpec(null);
                  }}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Master-Detail Split Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-[500px]">
                {/* Left Master Sidebar (4 cols) */}
                <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/40">
                  {/* Tab Selector: Active vs Logs */}
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setLedgerTab("active")}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        ledgerTab === "active"
                          ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      Active ({activeCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLedgerTab("logs")}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        ledgerTab === "logs"
                          ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      Finded Logs ({logsCount})
                    </button>
                  </div>

                  {/* Modal Sidebar Fast Search Filter (for 50+ Profiles) */}
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={modalSidebarSearch}
                        onChange={(e) => setModalSidebarSearch(e.target.value)}
                        placeholder={`Filter ${sidebarList.length} profiles in ledger...`}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-7 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                      />
                      {modalSidebarSearch && (
                        <button
                          type="button"
                          onClick={() => setModalSidebarSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sidebar Candidate List (Smooth, GPU-accelerated scrolling) */}
                  <div className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-1.5 [scrollbar-width:thin] scroll-smooth">
                    {ledgerTab === "logs" && logsCount > 0 && (
                      <div className="pb-1">
                        <button
                          type="button"
                          onClick={() => {
                            revertAllCandidateSpecs(currentRole);
                            setSelectedSpec(null);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Revert All Logs ({logsCount})</span>
                        </button>
                      </div>
                    )}
                    {sidebarList.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        {modalSidebarSearch ? "No profiles match search filter." : "No profiles recorded in this section."}
                      </div>
                    ) : (
                      sidebarList.map((spec) => {
                        const isSelected = selectedSpec?.id === spec.id;
                        return (
                          <div
                            key={spec.id}
                            onClick={() => setSelectedSpec(spec)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? "bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 shadow-xs"
                                : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                                {getProfileNumber(spec)}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                Board: {spec.boardReadinessScore || 90}/100
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white truncate">
                              {spec.roleTitle}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {spec.company}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Detail Panel (8 cols) */}
                <div className="md:col-span-8 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
                  {!selectedSpec ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
                      Select a candidate profile from the left sidebar to inspect full intelligence specifications.
                    </div>
                  ) : (
                    <>
                      {/* Detail Header */}
                      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 shrink-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                              TARGET CLIENT COMPANY
                            </span>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">
                              {selectedSpec.company}
                            </h3>
                          </div>
                          <span className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                            {selectedSpec.code}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-extrabold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                            {selectedSpec.roleTitle}
                          </span>

                          <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                            Board Readiness: {selectedSpec.boardReadinessScore || 92}/100
                          </span>

                          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 text-xs font-mono font-bold">
                            {selectedSpec.pnlScaleManaged || "$50M+ P&L"}
                          </span>

                          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 text-xs font-mono font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>Created {formatRelativeTime(selectedSpec.createdAt)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Scrollable Specifications: EXECUTIVE SEARCH MANDATE BRIEF */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                        {/* 1. CLIENT CONTEXT & MANDATE OVERVIEW */}
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold uppercase text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px] tracking-wider">
                              <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              1. CLIENT CONTEXT & MANDATE OVERVIEW
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">MANDATE BRIEF</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">Client Company</span>
                              <p className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5">{selectedSpec.company}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">Industry / Vertical</span>
                              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{selectedSpec.industryVertical || selectedSpec.industryExperience || "Enterprise B2B SaaS"}</p>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-0.5">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">Stage & Revenue Scale</span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{selectedSpec.stageRevenueScale || selectedSpec.clientProfile}</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-0.5">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">The Strategic Driver (Why This Role Exists)</span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{selectedSpec.strategicDriver || selectedSpec.coreChallenge}</p>
                          </div>
                        </div>

                        {/* 2. ROLE DEFINITION & TOTAL COMPENSATION */}
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 space-y-2.5">
                          <span className="font-extrabold uppercase text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px] tracking-wider">
                            <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            2. ROLE DEFINITION & TOTAL COMPENSATION
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">Target Title</span>
                              <p className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5">{selectedSpec.roleTitle}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">Reporting Line</span>
                              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{selectedSpec.reportingTo || "Chief Executive Officer & Board of Directors"}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">Location & Model</span>
                              <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{selectedSpec.locationWorkspace}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">Compensation Package</span>
                              <p className="text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[11px] mt-0.5">{selectedSpec.compensationPackage}</p>
                            </div>
                          </div>
                        </div>

                        {/* 3. TARGET HUNTING GROUNDS & OFF-LIMITS */}
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 space-y-2.5">
                          <span className="font-extrabold uppercase text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px] tracking-wider">
                            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            3. TARGET HUNTING GROUNDS & OFF-LIMITS
                          </span>

                          <div className="space-y-2 pt-1">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">Target Companies (Primary Poaching List)</span>
                              <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed mt-0.5">{selectedSpec.targetHuntingGrounds}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                                <span className="text-[10px] font-bold uppercase text-slate-500 block">Adjacent Industry Fit</span>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">{selectedSpec.adjacentIndustryFit || selectedSpec.industryExperience || "High-velocity infrastructure software or consumption-based SaaS"}</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                                <span className="text-[10px] font-bold uppercase text-slate-500 block">Off-Limits Organizations (Hands-Off)</span>
                                <p className="text-rose-600 dark:text-rose-400 font-semibold leading-relaxed mt-0.5">{selectedSpec.offLimitsOrganizations || "Strict list of active portfolio accounts and contractual NDA partners."}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4. MANDATORY TRACK RECORD (MUST-HAVES) */}
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 space-y-2.5">
                          <span className="font-extrabold uppercase text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px] tracking-wider">
                            <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            4. MANDATORY TRACK RECORD (MUST-HAVES)
                          </span>

                          <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                                <span className="text-[10px] font-bold uppercase text-slate-500 block">P&L & Budget Scale</span>
                                <p className="font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{selectedSpec.pnlBudgetScale || selectedSpec.pnlScaleManaged || "$50M+ P&L"}</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                                <span className="text-[10px] font-bold uppercase text-slate-500 block">Tenure Requirement</span>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedSpec.tenureRequirement || selectedSpec.experienceLevel || "Minimum 5 years in C-Suite or VP-level executive capacity"}</p>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">Key Execution Milestones</span>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">{selectedSpec.keyExecutionMilestones || selectedSpec.trackRecord}</p>
                            </div>
                          </div>
                        </div>

                        {/* 5. SOURCING PARAMETERS & BOOLEAN TARGETING */}
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 space-y-2.5">
                          <span className="font-extrabold uppercase text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px] tracking-wider">
                            <Search className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            5. SOURCING PARAMETERS & BOOLEAN TARGETING
                          </span>

                          <div className="space-y-2 pt-1">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">Comparable Current Titles</span>
                              <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{selectedSpec.comparableCurrentTitles || selectedSpec.roleTitle}</p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  Boolean Search String
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const str = selectedSpec.booleanSearchString || `("${selectedSpec.roleTitle}") AND ("${selectedSpec.company}")`;
                                    navigator.clipboard.writeText(str);
                                    setBooleanCopied(true);
                                    setTimeout(() => setBooleanCopied(false), 2000);
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-2 py-0.5 rounded cursor-pointer transition-all active:scale-95 border border-slate-200 dark:border-slate-600"
                                >
                                  {booleanCopied ? <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                  <span>{booleanCopied ? "Copied!" : "Copy String"}</span>
                                </button>
                              </div>
                              <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all leading-relaxed p-2 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200/80 dark:border-slate-700">
                                {selectedSpec.booleanSearchString || `("${selectedSpec.roleTitle}") AND ("${selectedSpec.company}") AND ("Executive")`}
                              </p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">Geographic Boundaries</span>
                              <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{selectedSpec.geographicBoundaries || selectedSpec.locationWorkspace}</p>
                            </div>
                          </div>
                        </div>

                        {/* 6. THE HOOK (EXECUTIVE VALUE PROPOSITION) */}
                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-extrabold uppercase text-emerald-900 dark:text-emerald-300 text-[11px] tracking-wider">
                              6. THE HOOK (EXECUTIVE VALUE PROPOSITION)
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                            {selectedSpec.theHook || "High-leverage equity package ahead of liquidity event / Full autonomy to replace legacy team / Strong Tier-1 Venture Capital backing with 36 months runway"}
                          </p>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
                        <span className="text-xs text-slate-500">
                          {ledgerTab === "logs" ? "Profile in Finded history ledger." : "Active candidate search mandate."}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsLedgerModalOpen(false);
                              setSelectedSpec(null);
                            }}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
                          >
                            Close
                          </button>

                          {ledgerTab === "logs" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handlePermanentDeleteSpec(selectedSpec.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleFinded(selectedSpec.id, true)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-xs"
                              >
                                <RotateCcw className="h-4 w-4" />
                                <span>Revert Action</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleFinded(selectedSpec.id, true)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-xs"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Mark as Finded</span>
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

      {/* ACTION MODAL 1: GENERATE CLIENT ONE-PAGER (ANONYMIZED) */}
      <AnimatePresence>
        {isOnePagerModalOpen && activeActionSpec && (
          <div
            className="fixed inset-0 z-[120] overflow-y-auto bg-black/60 dark:bg-slate-950/80 p-4 backdrop-blur-md flex items-center justify-center min-h-screen overscroll-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOnePagerModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl my-auto max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Generate Client One-Pager (Anonymized)</h3>
                    <p className="text-xs text-slate-500">White-labeled executive brief for {activeActionSpec.company} Search Committee</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOnePagerModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {onePagerCopiedToast && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Anonymized Executive One-Pager copied to clipboard in markdown format.</span>
                </div>
              )}

              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex justify-between">
                  <span className="font-bold text-slate-500">EXECUTIVE DOSSIER CODE</span>
                  <span className="font-bold text-slate-900 dark:text-white">ANON-EXEC-{activeActionSpec.code}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 text-[10px] block">TARGET EXECUTIVE ROLE</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeActionSpec.roleTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">BOARD READINESS INDEX</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeActionSpec.boardReadinessScore || 92}/100 (Tier-1 Certified)</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block">PROVEN P&L & SCALE RECORD</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeActionSpec.pnlScaleManaged || "$100M+ Managed P&L"}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block mb-1">ANONYMIZED EXECUTIVE TRACK RECORD</span>
                  <p className="font-sans text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                    {activeActionSpec.trackRecord}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">PII Stripped • Confidential Board Review</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `# Confidential Executive One-Pager\n**Code**: ANON-EXEC-${activeActionSpec.code}\n**Role**: ${activeActionSpec.roleTitle}\n**Board Score**: ${activeActionSpec.boardReadinessScore || 92}/100\n**P&L Scale**: ${activeActionSpec.pnlScaleManaged}\n**Track Record**: ${activeActionSpec.trackRecord}`;
                      navigator.clipboard.writeText(text);
                      setOnePagerCopiedToast(true);
                      setTimeout(() => setOnePagerCopiedToast(false), 2500);
                      addLog({
                        category: "Candidate Spec",
                        action: `Generated Anonymized One-Pager: ${activeActionSpec.code}`,
                        details: `Created white-labeled executive brief for ${activeActionSpec.company}`,
                        level: "action",
                        userRole: currentRole
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Anonymized Brief</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOnePagerCopiedToast(true);
                      setTimeout(() => setOnePagerCopiedToast(false), 2500);
                      addLog({
                        category: "Candidate Spec",
                        action: `Exported Anonymized One-Pager PDF: ${activeActionSpec.code}`,
                        details: `Downloaded PDF dossier for client board submission`,
                        level: "action",
                        userRole: currentRole
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-xs"
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

      {/* ACTION MODAL 2: FLAG NON-COMPETE / FRICTION RISK */}
      <AnimatePresence>
        {isFrictionModalOpen && activeActionSpec && (
          <div
            className="fixed inset-0 z-[120] overflow-y-auto bg-black/60 dark:bg-slate-950/80 p-4 backdrop-blur-md flex items-center justify-center min-h-screen overscroll-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsFrictionModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl my-auto max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Flag Non-Compete / Friction Risk</h3>
                    <p className="text-xs text-slate-500">Legal, Equity & Relocation Risk Management</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFrictionModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">MANDATE</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeActionSpec.roleTitle} @ {activeActionSpec.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">CURRENT RISK STATUS</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{activeActionSpec.frictionRisk?.type || "None Flagged"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Friction Category</label>
                  <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-semibold">
                    <option>12-Month Post-Employment Non-Compete (High Risk)</option>
                    <option>6-Month Non-Compete (Manageable with Garden Leave)</option>
                    <option>$1.5M+ Unvested Equity Cliff (Buyout Required)</option>
                    <option>International Tax & Relocation Resistance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Legal / Financial Risk Notes</label>
                  <textarea
                    rows={3}
                    defaultValue={activeActionSpec.frictionRisk?.details || "Covenant requires legal review by client compensation committee prior to final offer dispatch."}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFrictionModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addLog({
                      category: "Candidate Spec",
                      action: `Updated Friction Risk Flag: ${activeActionSpec.code}`,
                      details: `Tagged legal/financial non-compete risk on ${activeActionSpec.roleTitle}`,
                      level: "action",
                      userRole: currentRole
                    });
                    setIsFrictionModalOpen(false);
                  }}
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Save Friction Tag
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTION MODAL 3: TRIGGER BACKCHANNEL REFERENCE PROTOCOL */}
      <AnimatePresence>
        {isBackchannelModalOpen && activeActionSpec && (
          <div
            className="fixed inset-0 z-[120] overflow-y-auto bg-black/60 dark:bg-slate-950/80 p-4 backdrop-blur-md flex items-center justify-center min-h-screen overscroll-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsBackchannelModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl my-auto max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Trigger Backchannel Reference Protocol</h3>
                    <p className="text-xs text-slate-500">Automated mapping of informal industry peer references</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBackchannelModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {backchannelTriggeredToast ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Backchannel Protocol Initialized!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Industry peer references mapped across target ecosystem. Confidential verification report will populate upon partner review.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-500 block">VETTING PROTOCOL MATRIX</span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
                      <li>Automated reachout to 3 independent CXO peers in target hunting grounds ({activeActionSpec.targetHuntingGrounds}).</li>
                      <li>Blind reputation inquiry covering crisis leadership, board reporting, and team retention.</li>
                      <li>Strict non-attribution confidentiality guard for search candidate protection.</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBackchannelModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                {!backchannelTriggeredToast && (
                  <button
                    type="button"
                    onClick={() => {
                      setBackchannelTriggeredToast(true);
                      addLog({
                        category: "Candidate Spec",
                        action: `Triggered Backchannel Reference Protocol: ${activeActionSpec.code}`,
                        details: `Initiated informal peer verification across ${activeActionSpec.targetHuntingGrounds}`,
                        level: "action",
                        userRole: currentRole
                      });
                      setTimeout(() => {
                        setIsBackchannelModalOpen(false);
                        setBackchannelTriggeredToast(false);
                      }, 2000);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Execute Backchannel Mapping</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTION MODAL 4: RE-EVALUATE FOR SECONDARY MANDATE */}
      <AnimatePresence>
        {isSecondaryMandateModalOpen && activeActionSpec && (
          <div
            className="fixed inset-0 z-[120] overflow-y-auto bg-black/60 dark:bg-slate-950/80 p-4 backdrop-blur-md flex items-center justify-center min-h-screen overscroll-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsSecondaryMandateModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl my-auto max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                    <Repeat className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Re-evaluate for Secondary Mandate</h3>
                    <p className="text-xs text-slate-500">Cross-reference candidate across active executive searches</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSecondaryMandateModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  AI cross-referenced <strong>{activeActionSpec.roleTitle}</strong> against all 4 active client mandates in the firm pipeline:
                </p>

                <div className="space-y-2">
                  {(activeActionSpec.secondaryMandates || [
                    {
                      roleTitle: "Chief Operating Officer",
                      company: "Krypton Systems",
                      matchScore: 92,
                      rationale: "Operational scaling experience directly matches Krypton's post-acquisition turnaround."
                    }
                  ]).map((m, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{m.roleTitle} @ {m.company}</span>
                        <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                          {m.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {m.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSecondaryMandateModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addLog({
                      category: "Candidate Spec",
                      action: `Cross-Transferred Candidate to Secondary Mandate: ${activeActionSpec.code}`,
                      details: `Submitted candidate into cross-mandate pipeline for review by lead search partner.`,
                      level: "action",
                      userRole: currentRole
                    });
                    setIsSecondaryMandateModalOpen(false);
                  }}
                  className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-xs cursor-pointer"
                >
                  Cross-Transfer to Mandate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE CANDIDATE SPEC MODAL */}
      <AnimatePresence>
        {isCreateProfileOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm min-h-screen overflow-y-auto overscroll-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsCreateProfileOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl my-auto max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-slate-900 dark:text-slate-100 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold uppercase">New Target Candidate Spec</h3>
                    <p className="text-xs text-slate-500">Define executive search parameters for placement</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateProfileOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSpec} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold">Target Executive Title *</label>
                    <input
                      type="text"
                      required
                      value={newSpecForm.roleTitle}
                      onChange={(e) => setNewSpecForm({ ...newSpecForm, roleTitle: e.target.value })}
                      placeholder="e.g. Chief Executive Officer"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Hiring Client Company *</label>
                    <input
                      type="text"
                      required
                      value={newSpecForm.company}
                      onChange={(e) => setNewSpecForm({ ...newSpecForm, company: e.target.value })}
                      placeholder="e.g. Coca-Cola / Veloce Labs"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold">Board Readiness Target (1-100)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newSpecForm.boardReadinessScore}
                      onChange={(e) => setNewSpecForm({ ...newSpecForm, boardReadinessScore: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">P&L Scale Managed</label>
                    <input
                      type="text"
                      value={newSpecForm.pnlScaleManaged}
                      onChange={(e) => setNewSpecForm({ ...newSpecForm, pnlScaleManaged: e.target.value })}
                      placeholder="e.g. $100M+ P&L"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Strategic Search Challenge</label>
                  <textarea
                    rows={2}
                    value={newSpecForm.coreChallenge}
                    onChange={(e) => setNewSpecForm({ ...newSpecForm, coreChallenge: e.target.value })}
                    placeholder="Describe the operational pain or governance mandate..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateProfileOpen(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 font-bold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 font-bold shadow-xs"
                  >
                    Save Executive Spec
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchCandidatesView;
