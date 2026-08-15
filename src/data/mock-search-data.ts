export interface SearchCandidate {
  id: string;
  name: string;
  role: string;
  company: string;
  skills: string[];
  avatar?: string;
}

export interface SearchMeeting {
  id: string;
  company: string;
  candidate: string;
  role: string;
  time: string;
  day: string;
  status: "completed" | "in-progress" | "upcoming";
}

export const GLOBAL_MOCK_CANDIDATES: SearchCandidate[] = [
  {
    id: "c-1",
    name: "Marcus Vance",
    role: "Lead Frontend Architect",
    company: "Veloce Labs",
    skills: ["React 18", "TypeScript", "Vite", "Tailwind CSS", "Micro-frontends", "Zustand"]
  },
  {
    id: "c-2",
    name: "Elena Rostova",
    role: "Senior Fullstack Engineer",
    company: "Nexus AI Labs",
    skills: ["Node.js", "Express", "TypeScript", "PostgreSQL", "Firestore", "GraphQL"]
  },
  {
    id: "c-3",
    name: "Liam Chen",
    role: "DevOps & Cloud Architect",
    company: "Aura Health",
    skills: ["GCP", "AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Prometheus"]
  },
  {
    id: "c-4",
    name: "Sophia Martinez",
    role: "Product Design Lead",
    company: "Krypton Systems",
    skills: ["Figma", "Design Systems", "UX Research", "Accessibility", "Tailwind CSS"]
  },
  {
    id: "c-5",
    name: "James O'Connor",
    role: "Backend Engineer (Node.js)",
    company: "Veloce Labs",
    skills: ["Node.js", "NestJS", "Redis", "Microservices", "PostgreSQL", "Docker"]
  },
  {
    id: "c-6",
    name: "Aria Takahashi",
    role: "AI & LLM Integration Specialist",
    company: "Horizon AI Labs",
    skills: ["Python", "TypeScript", "Gemini API", "Pinecone", "LangChain", "FastAPI"]
  },
  {
    id: "c-7",
    name: "Carlos Mendez",
    role: "Mobile Architect (React Native)",
    company: "Veloce Labs",
    skills: ["React Native", "iOS", "Android", "TypeScript", "Redux Toolkit"]
  }
];

export const GLOBAL_MOCK_MEETINGS: SearchMeeting[] = [
  {
    id: "m-1",
    company: "Veloce Labs",
    candidate: "Marcus Vance",
    role: "Lead Frontend Architect",
    time: "09:30 AM",
    day: "Monday",
    status: "completed"
  },
  {
    id: "m-2",
    company: "Nexus AI Labs",
    candidate: "Elena Rostova",
    role: "Senior Fullstack Engineer",
    time: "11:00 AM",
    day: "Monday",
    status: "completed"
  },
  {
    id: "m-3",
    company: "Aura Health",
    candidate: "Liam Chen",
    role: "DevOps & Cloud Architect",
    time: "01:15 PM",
    day: "Monday",
    status: "completed"
  },
  {
    id: "m-4",
    company: "Krypton Systems",
    candidate: "Sophia Martinez",
    role: "Product Design Lead",
    time: "02:30 PM",
    day: "Monday",
    status: "in-progress"
  },
  {
    id: "m-5",
    company: "Veloce Labs",
    candidate: "James O'Connor",
    role: "Backend Engineer (Node.js)",
    time: "04:00 PM",
    day: "Monday",
    status: "upcoming"
  },
  {
    id: "m-6",
    company: "Horizon AI Labs",
    candidate: "Aria Takahashi",
    role: "AI / ML Researcher",
    time: "05:15 PM",
    day: "Monday",
    status: "upcoming"
  }
];
