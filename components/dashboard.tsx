import { VisitorsChart } from "@/components/visitors-chart";
import { DailyMeetingsCard } from "@/components/daily-meetings-card";
import { CandidatesToFindCard } from "@/components/candidates-to-find-card";
import { useAppData } from "@/src/app-data-context";
import { calculateExecutivePipelineMetrics } from "@/src/executive-algorithms";
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";

export function Dashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
	const { whiteLabelConfig, candidateSpecs } = useAppData();

	// Calculate Executive Search Algorithms (Weighted Pipeline Value + Capacity Load)
	const metrics = calculateExecutivePipelineMetrics(candidateSpecs, 2);

	return (
		<div className="flex flex-col gap-6">
			{/* Personalized Client Executive Hero Banner (White + Emerald Theme) */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-slate-50/60 to-emerald-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850 border border-slate-200/90 dark:border-slate-700/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm">
				<div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
				<div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
					{/* Left: Client & Partner Info */}
					<div className="space-y-2 max-w-xl">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
								<Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
								<span>Custom Portal for {whiteLabelConfig.companyName || "Avantty"}</span>
							</span>
							<span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
								{whiteLabelConfig.industry || "Executive Search & Retained Mandates"}
							</span>
						</div>
						<h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
							Welcome, {whiteLabelConfig.contactName || "Managing Partner"}
						</h1>
						<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
							{whiteLabelConfig.tagline || "Enterprise Headhunting & Retainer Platform"}
						</p>

						{/* 2. Algoritmo de Carga de Capacidad: Live Status Badge */}
						<div className="pt-1">
							<span
								className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
									metrics.isOverloaded
										? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
										: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
								}`}
							>
								{metrics.isOverloaded ? (
									<AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
								) : (
									<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
								)}
								<span>{metrics.capacityBadgeText}</span>
							</span>
						</div>
					</div>

					{/* Right: Real-Time Algorithm Intelligence Cards */}
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
						{/* 1. Algoritmo de Valor de Pipeline Ponderado (Weighted Pipeline Value) */}
						<div className="flex flex-col bg-white/95 dark:bg-slate-800/90 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 shadow-2xs space-y-1 min-w-[210px]">
							<div className="flex items-center justify-between gap-2">
								<span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
									Weighted Pipeline
								</span>
								<span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
									{metrics.activeRetainersCount} Active
								</span>
							</div>
							<div className="flex items-baseline gap-2">
								<span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
									{metrics.formattedWeightedPipeline}
								</span>
								<span className="text-[11px] text-slate-500 font-mono font-bold">
									Pipeline
								</span>
							</div>
							<div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
								<span>Placed Revenue (100%):</span>
								<strong className="text-slate-900 dark:text-white font-mono">{metrics.formattedPlacedRevenue}</strong>
							</div>
						</div>

						{/* 2. Algoritmo de Carga de Capacidad (Active Retainer Capacity Load) */}
						<div className="flex flex-col bg-white/95 dark:bg-slate-800/90 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1.5 min-w-[200px]">
							<div className="flex items-center justify-between gap-2">
								<span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
									Capacity Load
								</span>
								<span
									className={`text-xs font-mono font-black ${
										metrics.isOverloaded
											? "text-amber-600 dark:text-amber-400"
											: "text-emerald-600 dark:text-emerald-400"
									}`}
								>
									{metrics.capacityLoadPercentage}%
								</span>
							</div>

							{/* Progress Bar */}
							<div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
								<div
									className={`h-full rounded-full transition-all duration-500 ${
										metrics.isOverloaded
											? "bg-amber-500 dark:bg-amber-400"
											: "bg-emerald-500 dark:bg-emerald-400"
									}`}
									style={{ width: `${Math.min(100, metrics.capacityLoadPercentage)}%` }}
								/>
							</div>

							<div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
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
	);
}
