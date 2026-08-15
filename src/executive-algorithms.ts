import { CandidateSearchSpec, MandateStage, STAGE_CONFIG } from "@/components/search-candidates-view";

export interface PipelineCalculations {
  // 1. Weighted Pipeline Value
  weightedPipelineValue: number; // Sum of (Salary * Fee%) * Stage Probability
  totalPotentialFee: number; // Sum of (Salary * Fee%) without probability
  totalPlacedRevenue: number; // Sum of closed/placed placement fees (Facturación Cobrada 100%)
  
  // 2. Active Retainer Capacity Load
  activeRetainersCount: number; // Count of open retainers
  placedCount: number; // Count of closed mandates
  partnerCount: number; // Number of executive partners (e.g. 2)
  maxPartnerCapacity: number; // partnerCount * 3.5
  capacityLoadPercentage: number; // (activeRetainersCount / maxPartnerCapacity) * 100
  isOverloaded: boolean; // capacityLoadPercentage > 85%
  capacityBadgeText: string;
  
  // Formatted Strings
  formattedWeightedPipeline: string; // e.g. "$2.55M" or "$275k"
  formattedPlacedRevenue: string; // e.g. "$380k"
  formattedCapacityMetric: string; // e.g. "$2.55M Pipeline • 4 Active Retainers"
}

export const DEFAULT_PARTNER_COUNT = 2;
export const MAX_MANDATES_PER_PARTNER = 3.5;
export const DEFAULT_SEARCH_FEE_PERCENTAGE = 0.30; // 30% executive retained search fee

/**
 * 1. Algoritmo de Valor de Pipeline Ponderado (Weighted Pipeline Value)
 * Pipeline Mandato = (Salario Target * Fee %) * Probabilidad de Cierre
 * - Sourcing/Longlist: 20%
 * - Shortlist: 50%
 * - Board Round: 80%
 * - Placed/Closed: 100% (Facturación Cobrada)
 *
 * 2. Algoritmo de Carga de Capacidad (Active Retainer Capacity Load)
 * Carga de Capacidad (%) = (Retainers Activos / (Socios * 3.5)) * 100
 * - > 85%: "High Workload Friction — Delay Risk in Execution" (Amber/Red)
 * - <= 85%: "Capacity Available: Ready to Pitch New Client" (Emerald/Green)
 */
export function calculateExecutivePipelineMetrics(
  specs: CandidateSearchSpec[],
  partnerCount: number = DEFAULT_PARTNER_COUNT
): PipelineCalculations {
  let weightedPipelineValue = 0;
  let totalPotentialFee = 0;
  let totalPlacedRevenue = 0;
  let activeRetainersCount = 0;
  let placedCount = 0;

  for (const spec of specs) {
    const isPlaced = spec.status === "Finded" || spec.stage === "placed";
    const salary = spec.targetSalaryNumber || 320000;
    const feePct = spec.feePercentage || DEFAULT_SEARCH_FEE_PERCENTAGE;
    const placementFee = salary * feePct;

    if (isPlaced) {
      placedCount += 1;
      totalPlacedRevenue += placementFee;
    } else {
      activeRetainersCount += 1;
      totalPotentialFee += placementFee;

      const stageKey = spec.stage || "sourcing";
      const probability = STAGE_CONFIG[stageKey]?.probability ?? 0.20;
      weightedPipelineValue += placementFee * probability;
    }
  }

  const maxPartnerCapacity = partnerCount * MAX_MANDATES_PER_PARTNER;
  const capacityLoadPercentage = maxPartnerCapacity > 0
    ? Math.round((activeRetainersCount / maxPartnerCapacity) * 100)
    : 0;

  const isOverloaded = capacityLoadPercentage > 85;
  const capacityBadgeText = isOverloaded
    ? "High Workload Friction — Delay Risk in Execution"
    : "Capacity Available: Ready to Pitch New Client";

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    return `$${Math.round(val / 1000)}k`;
  };

  const formattedWeightedPipeline = formatCurrency(weightedPipelineValue);
  const formattedPlacedRevenue = formatCurrency(totalPlacedRevenue);
  const formattedCapacityMetric = `${formattedWeightedPipeline} Pipeline • ${activeRetainersCount} Active Retainer${activeRetainersCount === 1 ? "" : "s"}`;

  return {
    weightedPipelineValue,
    totalPotentialFee,
    totalPlacedRevenue,
    activeRetainersCount,
    placedCount,
    partnerCount,
    maxPartnerCapacity,
    capacityLoadPercentage,
    isOverloaded,
    capacityBadgeText,
    formattedWeightedPipeline,
    formattedPlacedRevenue,
    formattedCapacityMetric,
  };
}

/**
 * 3. Algoritmo de Índice de Riesgo y Urgencia (Search Mandate Urgency Index)
 * Urgency Score = (Días Abierto * 1.2) - (Candidatos Cualificados en Pipeline * 15)
 */
export function calculateMandateUrgencyScore(daysOpen: number = 20, qualifiedCandidates: number = 1): {
  score: number;
  status: "low_risk" | "moderate" | "high_risk";
  label: string;
  badgeColor: string;
} {
  const score = Math.round((daysOpen * 1.2) - (qualifiedCandidates * 15));
  
  if (score >= 18) {
    return {
      score,
      status: "high_risk",
      label: "Delay Risk",
      badgeColor: "rose",
    };
  } else if (score >= 5) {
    return {
      score,
      status: "moderate",
      label: "Attention Required",
      badgeColor: "amber",
    };
  } else {
    return {
      score,
      status: "low_risk",
      label: "Low Risk / On Track",
      badgeColor: "emerald",
    };
  }
}
