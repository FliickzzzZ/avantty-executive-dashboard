import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppData, WhiteLabelConfig, DEFAULT_WHITE_LABEL, generateWhiteLabelUrl, slugifyCompanyName } from "@/src/app-data-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { 
  Sparkles, 
  Copy, 
  Check, 
  X,
  RotateCcw, 
  Building2, 
  User, 
  Globe, 
  TrendingUp, 
  Palette, 
  Zap, 
  Share2,
  CheckCircle2
} from "lucide-react";

interface PresetItem {
  name: string;
  config: Partial<WhiteLabelConfig>;
  icon: string;
}

const PRESETS: PresetItem[] = [
  {
    name: "Buckingham Search",
    icon: "🏢",
    config: {
      companyName: "Buckingham Search",
      contactName: "Adam Carlson",
      industry: "Private Equity, Fintech & Executive Search",
      tagline: "Exclusive Retained Search & Partner Command Center",
      pipelineMetric: "$3.4M Pipeline • 14 Active Retainers",
      themeColor: "emerald",
      website: "buckinghamsearch.com",
      customWelcome: "Prepared exclusively for Adam Carlson @ Buckingham Search",
      isCustomized: true
    }
  },
  {
    name: "Worth Search",
    icon: "🚀",
    config: {
      companyName: "Worth Search",
      contactName: "Nolan Greenberg",
      industry: "AI Leadership & High-Growth Tech Search",
      tagline: "Executive Tech Recruitment Intelligence Engine",
      pipelineMetric: "$2.9M Pipeline • 11 Active Mandates",
      themeColor: "indigo",
      website: "worthsearch.com",
      customWelcome: "Prepared exclusively for Nolan Greenberg @ Worth Search",
      isCustomized: true
    }
  },
  {
    name: "Sci.bio Search",
    icon: "🧬",
    config: {
      companyName: "Sci.bio Recruiting",
      contactName: "Eric Celidonio",
      industry: "Biotech & Life Sciences Executive Search",
      tagline: "Life Sciences Partner & C-Suite Placement Portal",
      pipelineMetric: "$4.1M Pipeline • 18 Biotech Mandates",
      themeColor: "blue",
      website: "sci.bio",
      customWelcome: "Prepared exclusively for Eric Celidonio @ Sci.bio",
      isCustomized: true
    }
  },
  {
    name: "Rhodes Associates",
    icon: "🗽",
    config: {
      companyName: "Rhodes Associates",
      contactName: "Steven Littman",
      industry: "Real Estate & Global Financial Leadership",
      tagline: "Executive Retained Practice & Partner Dossier",
      pipelineMetric: "$5.2M Pipeline • 21 Global Retainers",
      themeColor: "amber",
      website: "rhodesassociates.com",
      customWelcome: "Prepared exclusively for Steven Littman @ Rhodes Associates",
      isCustomized: true
    }
  },
  {
    name: "Private Label Staff",
    icon: "👔",
    config: {
      companyName: "Private Label Staff",
      contactName: "Amanda Mihnovich",
      industry: "Executive Talent & High-Value Headhunting",
      tagline: "Retained Search & Executive Placement Hub",
      pipelineMetric: "$2.6M Pipeline • 12 Active Searches",
      themeColor: "purple",
      website: "privatelabelstaffing.com",
      customWelcome: "Prepared exclusively for Amanda Mihnovich @ Private Label Staff",
      isCustomized: true
    }
  }
];

const THEME_COLORS: { id: WhiteLabelConfig["themeColor"]; label: string; bgClass: string }[] = [
  { id: "emerald", label: "Emerald Growth", bgClass: "bg-emerald-500" },
  { id: "blue", label: "Sapphire Blue", bgClass: "bg-blue-500" },
  { id: "indigo", label: "Silicon Indigo", bgClass: "bg-indigo-500" },
  { id: "amber", label: "Gold / Amber", bgClass: "bg-amber-500" },
  { id: "rose", label: "Ruby Rose", bgClass: "bg-rose-500" },
  { id: "purple", label: "Royal Purple", bgClass: "bg-purple-500" },
];

export function ClientPitchDemoModal() {
  const { 
    whiteLabelConfig, 
    updateWhiteLabelConfig, 
    resetWhiteLabelConfig, 
    isDemoModalOpen, 
    setIsDemoModalOpen 
  } = useAppData();

  const [formData, setFormData] = useState<WhiteLabelConfig>(whiteLabelConfig);
  const [copied, setCopied] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState(false);
  const [linkMode, setLinkMode] = useState<"subdomain" | "query">("subdomain");
  const [customDomain, setCustomDomain] = useState<string>(() => {
    if (typeof window !== "undefined" && window.location.origin !== "null") {
      return window.location.origin;
    }
    return "https://demodashboard.avanttyops.com";
  });

  useLockBodyScroll(isDemoModalOpen);

  useEffect(() => {
    if (isDemoModalOpen) {
      setFormData(whiteLabelConfig);
      setCopied(false);
      setAppliedNotification(false);
      if (typeof window !== "undefined" && window.location.origin !== "null") {
        setCustomDomain(window.location.origin);
      }
    }
  }, [isDemoModalOpen, whiteLabelConfig]);

  if (!isDemoModalOpen) return null;

  const generatedUrl = generateWhiteLabelUrl(formData, customDomain, linkMode);

  const handleApplyPreset = (preset: PresetItem) => {
    setFormData((prev) => ({
      ...prev,
      ...preset.config,
      isCustomized: true
    }));
  };

  const handleApplyToLiveDashboard = () => {
    updateWhiteLabelConfig(formData);
    setAppliedNotification(true);
    setTimeout(() => {
      setAppliedNotification(false);
      setIsDemoModalOpen(false);
    }, 800);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleReset = () => {
    resetWhiteLabelConfig();
    setFormData(DEFAULT_WHITE_LABEL);
    setAppliedNotification(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overscroll-contain">
        <div 
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
          onClick={() => setIsDemoModalOpen(false)}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Generador de Enlace Limpio & White-Label Pitch</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Auto-Config
                  </Badge>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Crea enlaces directos personalizados con la marca y dominio de tu cliente
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick 1-Click Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Plantillas Rápidas de Clientes Reales
                </label>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restablecer Avantty</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-left transition-all group cursor-pointer"
                  >
                    <span className="text-base">{preset.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {preset.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {preset.config.contactName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Brand Details */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-500" />
                    Nombre de Empresa Cliente
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value, isCustomized: true })}
                    placeholder="Ej. Buckingham Search"
                    className="text-xs bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    Managing Partner / Contacto
                  </label>
                  <Input
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value, isCustomized: true })}
                    placeholder="Ej. Adam Carlson"
                    className="text-xs bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Theme Accent Color */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-slate-500" />
                  Color de Acento de la Marca
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {THEME_COLORS.map((tc) => (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, themeColor: tc.id, isCustomized: true })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        formData.themeColor === tc.id
                          ? "bg-slate-100 dark:bg-slate-800 border-slate-900 dark:border-slate-100 shadow-2xs"
                          : "bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <span className={`h-3.5 w-3.5 rounded-full ${tc.bgClass}`} />
                      <span>{tc.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clean Domain & Shareable Link Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  Formato de Enlace para el Cliente
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  Personalizado al 100%
                </span>
              </div>

              {/* Format Toggle: Subdomain VIP vs Clean Parameter */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLinkMode("subdomain")}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    linkMode === "subdomain"
                      ? "border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white ring-1 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold flex items-center justify-between">
                    <span>Subdominio VIP</span>
                    {linkMode === "subdomain" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    demodashboard-{slugifyCompanyName(formData.companyName)}.avanttyops.com
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setLinkMode("query")}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    linkMode === "query"
                      ? "border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white ring-1 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold flex items-center justify-between">
                    <span>Enlace Auto-Limpiable</span>
                    {linkMode === "query" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    demodashboard.avanttyops.com (Scrubbing)
                  </p>
                </button>
              </div>

              {/* Clean Output URL with Copy Button */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono text-xs text-slate-800 dark:text-slate-200 truncate select-all">
                  {generatedUrl}
                </div>
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  variant={copied ? "default" : "secondary"}
                  className={`h-9 shrink-0 gap-1.5 text-xs font-bold cursor-pointer transition-all ${
                    copied ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                  }`}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "¡Copiado!" : "Copiar Enlace"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDemoModalOpen(false)}
              className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              Cerrar
            </Button>

            <Button
              type="button"
              onClick={handleApplyToLiveDashboard}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              {appliedNotification ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>¡Dashboard Personalizado!</span>
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" />
                  <span>Aplicar al Dashboard Ahora</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
