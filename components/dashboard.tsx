import { VisitorsChart } from "@/components/visitors-chart";
import { DailyMeetingsCard } from "@/components/daily-meetings-card";
import { CandidatesToFindCard } from "@/components/candidates-to-find-card";
import { useAppData } from "@/src/app-data-context";
import { calculateExecutivePipelineMetrics } from "@/src/executive-algorithms";
import { Sparkles, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Dashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { whiteLabelConfig, candidateSpecs } = useAppData();

  // Calculate Executive Search Algorithms (Weighted Pipeline Value + Capacity Load)
  const metrics = calculateExecutivePipelineMetrics(candidateSpecs, 2);

  // Calculate average board readiness score for active specs
  const activeSpecs = candidateSpecs.filter((s) => s.status !== "Placed" && s.stage !== "placed");
  const avgBoardReadiness = activeSpecs.length > 0
    ? Math.round(activeSpecs.reduce((sum, s) => sum + (s.boardReadinessScore || 90), 0) / activeSpecs.length)
    : 92;

  return (
    <TooltipProvider delay={150}>
      <div className="flex flex-col gap-6">
        {/* Personalized Client Executive Hero Banner (Midnight Obsidian / Pure White / Emerald #00875A Theme) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-slate-50/60 to-emerald-50/30 dark:from-[#121816] dark:via-[#121816] dark:to-[#121816] border border-slate-200/90 dark:border-[#1E2623] p-6 text-slate-900 dark:text-slate-100 shadow-sm">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-[#00875A]/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            {/* Left: Client & Partner Info */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00875A]/10 px-3 py-0.5 text-xs font-semibold text-[#00875A] dark:text-emerald-400 border border-[#00875A]/25">
                  <Sparkles className="h-3.5 w-3.5 text-[#00875A] dark:text-emerald-400" />
                  <span>Custom Portal for {whiteLabelConfig.companyName || "Avantty"}</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
                  {whiteLabelConfig.industry || "Executive Search & Retained Mandates"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome, {whiteLabelConfig.contactName || "Managing Partner"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 font-medium leading-relaxed">
                {whiteLabelConfig.tagline || "Enterprise Headhunting & Retainer Platform"}
              </p>

              {/* Live Capacity Load Status Badge & Algorithmic Benchmarks */}
              <div className="pt-1 flex items-center gap-2.5 flex-wrap">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-help ${
                        metrics.isOverloaded
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          : "bg-[#00875A]/10 text-[#00875A] dark:text-emerald-300 border-[#00875A]/30"
                      }`}
                    >
                      {metrics.isOverloaded ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#00875A] dark:text-emerald-400 shrink-0" />
                      )}
                      <span>{metrics.capacityBadgeText}</span>
                      <Info className="h-3 w-3 opacity-60 ml-0.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs space-y-1.5 bg-[#080B0A] text-white p-3 rounded-xl border border-neutral-800 shadow-xl">
                    <p className="font-semibold text-emerald-400">Capacity Load Thresholds</p>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      Calculated as: <code className="text-emerald-300 font-mono text-[10px]">(Active Retainers ÷ (Managing Partners × 3.5)) × 100</code>.
                    </p>
                    <p className="text-neutral-400 text-[11px]">
                      &le; 85%: Partner practice has immediate capacity to pitch and onboard new retained client mandates without quality degradation.
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Estimated Benchmark: Board Readiness */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700/80 text-slate-700 dark:text-neutral-300 cursor-help">
                      <span className="text-slate-500 dark:text-neutral-400 font-normal">Board Readiness:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{avgBoardReadiness}/100</strong>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">(Est.)</span>
                      <Info className="h-3 w-3 text-slate-400" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs space-y-1 bg-[#080B0A] text-white p-3 rounded-xl border border-neutral-800 shadow-xl">
                    <p className="font-semibold text-emerald-400">Board Readiness Index (Estimated Benchmark)</p>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      Algorithmic executive score synthesizing candidate P&L scale, public/private governance experience, and C-suite leadership track record.
                    </p>
                    <p className="text-neutral-400 text-[10px] italic">
                      * Estimated benchmark metric. Validated during lead partner confidential debrief.
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Estimated Benchmark: Urgency Index */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700/80 text-slate-700 dark:text-neutral-300 cursor-help">
                      <span className="text-slate-500 dark:text-neutral-400 font-normal">Urgency Index:</span>
                      <strong className="text-[#00875A] dark:text-emerald-400 font-mono font-semibold">On Track</strong>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">(Est.)</span>
                      <Info className="h-3 w-3 text-slate-400" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs space-y-1 bg-[#080B0A] text-white p-3 rounded-xl border border-neutral-800 shadow-xl">
                    <p className="font-semibold text-emerald-400">Mandate Urgency Index (Estimated Benchmark)</p>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      Calculated as: <code className="text-emerald-300 font-mono text-[10px]">(Days Open × 1.2) - (Qualified Candidates × 15)</code>.
                    </p>
                    <p className="text-neutral-400 text-[10px] italic">
                      * Estimated benchmark metric. Flags mandates with delayed time-to-shortlist for priority sourcing allocation.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Right: Real-Time Algorithm Intelligence Cards */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
              {/* 1. Algoritmo de Valor de Pipeline Ponderado (Weighted Pipeline Value) */}
              <div className="flex flex-col bg-white/95 dark:bg-[#121816] px-4 py-3 rounded-xl border border-emerald-200/80 dark:border-[#00875A]/30 shadow-2xs space-y-1 min-w-[220px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                      Weighted Pipeline
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          aria-label="View Weighted Pipeline calculation formula"
                        >
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs space-y-1.5 bg-[#121816] text-white p-3 rounded-xl border border-[#1E2623] shadow-xl">
                        <p className="font-semibold text-emerald-400">Weighted Pipeline Formula</p>
                        <p className="text-neutral-300 text-[11px] leading-relaxed">
                          Sum of <code className="text-emerald-300 font-mono text-[10px]">(Salary × 30% Fee) × Stage Probability</code> across active retainers:
                        </p>
                        <div className="space-y-0.5 text-[11px] text-neutral-300 border-t border-[#1E2623] pt-1 font-mono">
                          <div className="flex justify-between"><span>Phase 1 (Longlist):</span><span className="text-emerald-400">20%</span></div>
                          <div className="flex justify-between"><span>Phase 2 (Shortlist):</span><span className="text-emerald-400">50%</span></div>
                          <div className="flex justify-between"><span>Phase 3 (Board Round):</span><span className="text-emerald-400">80%</span></div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-[10px] font-mono text-[#00875A] dark:text-emerald-400 font-bold">
                    {metrics.activeRetainersCount} Active
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-[#00875A] dark:text-emerald-400 font-mono tracking-tight">
                    {metrics.formattedWeightedPipeline}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono font-medium">
                    Pipeline
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-400 pt-1 border-t border-slate-100 dark:border-[#1E2623] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span>Placed Revenue (100%):</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          aria-label="View Placed Revenue calculation formula"
                        >
                          <Info className="h-2.5 w-2.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs space-y-1 bg-[#121816] text-white p-2.5 rounded-xl border border-[#1E2623] shadow-xl">
                        <p className="font-semibold text-emerald-400">Placed Revenue (100%)</p>
                        <p className="text-neutral-300 text-[11px]">
                          Realized executive placement fee revenue (100% collected) strictly for closed & placed client mandates.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <strong className="text-slate-900 dark:text-white font-mono">{metrics.formattedPlacedRevenue}</strong>
                </div>
              </div>

              {/* 2. Algoritmo de Carga de Capacidad (Active Retainer Capacity Load) */}
              <div className="flex flex-col bg-white/95 dark:bg-[#121816] px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1E2623] shadow-2xs space-y-1.5 min-w-[210px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                      Capacity Load
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          aria-label="View Capacity Load calculation formula"
                        >
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs space-y-1.5 bg-[#121816] text-white p-3 rounded-xl border border-[#1E2623] shadow-xl">
                        <p className="font-semibold text-emerald-400">Capacity Load Formula</p>
                        <p className="text-neutral-300 text-[11px] leading-relaxed">
                          <code className="text-emerald-300 font-mono text-[10px]">(Active Retainers ÷ (Managing Partners × 3.5 Max)) × 100</code>.
                        </p>
                        <p className="text-neutral-400 text-[11px]">
                          Each partner manages a maximum of 3.5 simultaneous executive retainers to ensure white-glove client dedication.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold ${
                      metrics.isOverloaded
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-[#00875A] dark:text-emerald-400"
                    }`}
                  >
                    {metrics.capacityLoadPercentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#0A0E0D] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      metrics.isOverloaded
                        ? "bg-amber-500 dark:bg-amber-400"
                        : "bg-[#00875A] dark:bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, metrics.capacityLoadPercentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-neutral-400 font-mono">
                  <span>{metrics.activeRetainersCount} Active Mandates</span>
                  <span>
                    {metrics.activeRetainersCount > 7
                      ? `${Math.ceil(metrics.activeRetainersCount / 3.5)} Partners Required`
                      : `2 Partners (3.5x max)`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Candidates Closed Chart */}
        <VisitorsChart />

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DailyMeetingsCard onNavigate={() => onNavigate?.("meetings")} />
          <CandidatesToFindCard onNavigate={() => onNavigate?.("search-candidates")} />
        </div>
      </div>
    </TooltipProvider>
  );
}
