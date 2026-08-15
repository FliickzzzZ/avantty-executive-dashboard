import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppData, WhiteLabelConfig, DEFAULT_WHITE_LABEL, generateWhiteLabelUrl } from "@/src/app-data-context";
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

  useLockBodyScroll(isDemoModalOpen);

  useEffect(() => {
    if (isDemoModalOpen) {
      setFormData(whiteLabelConfig);
      setCopied(false);
      setAppliedNotification(false);
    }
  }, [isDemoModalOpen, whiteLabelConfig]);

  if (!isDemoModalOpen) return null;

  const generatedUrl = generateWhiteLabelUrl(formData);

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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsDemoModalOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Personalizador de Demo Instantáneo (10s)
                  </h2>
                  {formData.isCustomized && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px]">
                      Marca Activa
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Personaliza todo el portal con la firma de tu cliente y genera su enlace en 10 segundos.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto p-6 space-y-5">
            {/* Quick 1-Click Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Cargar Preajuste Rápido (1 Clic)
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      formData.companyName === preset.config.companyName
                        ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
                {formData.isCustomized && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-dashed border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Restaurar Avantty</span>
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  Nombre de la Empresa / Firma
                </label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => {
                    const newComp = e.target.value;
                    const autoWeb = newComp.trim() ? `${newComp.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}.com` : "avantty.com";
                    setFormData({
                      ...formData,
                      companyName: newComp,
                      website: autoWeb,
                      isCustomized: true
                    });
                  }}
                  placeholder="Ej. Buckingham Search"
                  className="h-9 text-sm"
                />
              </div>

              {/* Contact Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  Nombre del Contacto / Prospecto
                </label>
                <Input
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value, isCustomized: true })}
                  placeholder="Ej. Adam Carlson"
                  className="h-9 text-sm"
                />
              </div>

              {/* Industry Focus */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-500" />
                  Especialización / Industria
                </label>
                <Input
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value, isCustomized: true })}
                  placeholder="Ej. Private Equity & Executive Search"
                  className="h-9 text-sm"
                />
              </div>

              {/* Pipeline Metric */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
                  Pipeline Activo / Mandatos
                </label>
                <Input
                  value={formData.pipelineMetric}
                  onChange={(e) => setFormData({ ...formData, pipelineMetric: e.target.value, isCustomized: true })}
                  placeholder="Ej. $3.2M Pipeline • 14 Retainers"
                  className="h-9 text-sm"
                />
              </div>

              {/* Tagline / Subtitle */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-slate-500" />
                  Titular / Eslogan Exclusivo
                </label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value, isCustomized: true })}
                  placeholder="Ej. Exclusive Retained Search & Partner Command Center"
                  className="h-9 text-sm"
                />
              </div>

              {/* Brand Color Theme Selection */}
              <div className="sm:col-span-2 space-y-2">
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

            {/* Shareable Link Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5 text-emerald-500" />
                  Enlace Directo para el Cliente (Con auto-configuración)
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  Personalizado con 1 Clic
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={generatedUrl}
                  className="font-mono text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9 select-all"
                />
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
