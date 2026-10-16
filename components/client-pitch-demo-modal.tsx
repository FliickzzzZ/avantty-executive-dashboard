import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useAppData,
  WhiteLabelConfig,
  DEFAULT_WHITE_LABEL,
  generateWhiteLabelUrl,
  slugifyCompanyName,
  validateSubdomain
} from "@/src/app-data-context";
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
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  ShieldCheck
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
      themeColor: "emerald",
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
      themeColor: "emerald",
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
      themeColor: "emerald",
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
      themeColor: "emerald",
      website: "privatelabelstaffing.com",
      customWelcome: "Prepared exclusively for Amanda Mihnovich @ Private Label Staff",
      isCustomized: true
    }
  }
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
  const [linkMode, setLinkMode] = useState<"slug" | "subdomain" | "query">("slug");
  const [customDomain, setCustomDomain] = useState<string>(() => {
    if (typeof window !== "undefined" && window.location.origin && window.location.origin !== "null") {
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
      if (typeof window !== "undefined" && window.location.origin && window.location.origin !== "null") {
        setCustomDomain(window.location.origin);
      }
    }
  }, [isDemoModalOpen, whiteLabelConfig]);

  if (!isDemoModalOpen) return null;

  const subdomainValidation = validateSubdomain(formData.companyName || "client");
  const generatedUrl = generateWhiteLabelUrl(formData, customDomain, linkMode);

  // Fallback testable link that works immediately in current environment
  const immediateTestingUrl = generateWhiteLabelUrl(formData, customDomain, "query");

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
    }, 600);
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
          className="fixed inset-0 bg-[#080B0A]/75 backdrop-blur-xs transition-opacity"
          onClick={() => setIsDemoModalOpen(false)}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-foreground font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00875A]/10 text-[#00875A] border border-[#00875A]/25">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <span>Custom Client Pitch & White-Label Link Generator</span>
                  <Badge variant="outline" className="text-[10px] bg-[#00875A]/10 text-[#00875A] border-[#00875A]/30">
                    Live Engine
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Generate customized partner-branded portal links for prospective executive clients
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick 1-Click Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#00875A]" />
                  Verified Executive Search Client Presets
                </label>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restore Avantty Standard</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card hover:bg-secondary hover:border-foreground/30 text-left transition-all group cursor-pointer"
                  >
                    <span className="text-base">{preset.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-[#00875A]">
                        {preset.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {preset.config.contactName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Brand Details */}
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Client Search Firm Name
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value, isCustomized: true })}
                    placeholder="e.g. Buckingham Search"
                    className="text-xs bg-background border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Managing Partner / Recipient
                  </label>
                  <Input
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value, isCustomized: true })}
                    placeholder="e.g. Adam Carlson"
                    className="text-xs bg-background border-border"
                  />
                </div>
              </div>
            </div>

            {/* Clean Domain & Shareable Link Box */}
            <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-[#00875A]" />
                  Client Link Format Architecture
                </label>
                <span className="text-[10px] text-[#00875A] font-mono font-semibold">
                  100% Parameterized
                </span>
              </div>

              {/* Format Toggle: Ultra-Clean Route Slug vs Subdomain VIP vs Direct Query */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLinkMode("slug")}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    linkMode === "slug"
                      ? "border-[#00875A] bg-[#00875A]/10 text-foreground ring-1 ring-[#00875A]/25"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  <p className="text-xs font-semibold flex items-center justify-between">
                    <span>Clean Slug Path</span>
                    {linkMode === "slug" && <span className="h-2 w-2 rounded-full bg-[#00875A]" />}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                    /{slugifyCompanyName(formData.companyName)}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setLinkMode("subdomain")}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    linkMode === "subdomain"
                      ? "border-[#00875A] bg-[#00875A]/10 text-foreground ring-1 ring-[#00875A]/25"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  <p className="text-xs font-semibold flex items-center justify-between">
                    <span>VIP Subdomain</span>
                    {linkMode === "subdomain" && <span className="h-2 w-2 rounded-full bg-[#00875A]" />}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                    {subdomainValidation.subdomain}.avanttyops.com
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setLinkMode("query")}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    linkMode === "query"
                      ? "border-[#00875A] bg-[#00875A]/10 text-foreground ring-1 ring-[#00875A]/25"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  <p className="text-xs font-semibold flex items-center justify-between">
                    <span>Direct Query</span>
                    {linkMode === "query" && <span className="h-2 w-2 rounded-full bg-[#00875A]" />}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                    ?company={slugifyCompanyName(formData.companyName)}
                  </p>
                </button>
              </div>

              {/* Subdomain Technical & DNS Reality Validation */}
              {linkMode === "subdomain" && (
                <div className="p-3 rounded-lg bg-card border border-border text-[11px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#00875A]" />
                      Subdomain Syntax: <strong className="font-mono text-[#00875A]">{subdomainValidation.subdomain}</strong>
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${subdomainValidation.isValid ? "text-[#00875A] border-[#00875A]/30" : "text-destructive border-destructive/30"}`}>
                      {subdomainValidation.isValid ? "Valid RFC 1123" : "Syntax Error"}
                    </Badge>
                  </div>

                  {subdomainValidation.error && (
                    <p className="text-destructive font-medium">
                      ⚠️ {subdomainValidation.error}
                    </p>
                  )}

                  <div className="text-muted-foreground leading-relaxed pt-1 border-t border-border/60">
                    <strong className="text-foreground">External DNS Dependency:</strong> Live wildcard subdomains (<code className="font-mono text-[10px] bg-secondary px-1 py-0.5 rounded">https://{subdomainValidation.subdomain}.avanttyops.com</code>) require a Wildcard DNS record (<code className="font-mono text-[10px] bg-secondary px-1 py-0.5 rounded">*.avanttyops.com CNAME</code>) configured in Cloudflare or your DNS host.
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                    <span className="text-muted-foreground">For zero-delay instant client testing:</span>
                    <a
                      href={immediateTestingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#00875A] hover:underline"
                    >
                      <span>Open Instant Universal Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Clean Output URL with Copy and Open Button */}
              <div className="pt-2 border-t border-border flex items-center gap-2">
                <div className="flex-1 bg-background rounded-lg border border-border px-3 py-2 font-mono text-xs text-foreground truncate select-all">
                  {generatedUrl}
                </div>
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  variant={copied ? "default" : "secondary"}
                  className={`h-9 shrink-0 gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
                    copied ? "bg-[#00875A] hover:bg-[#006E49] text-white" : ""
                  }`}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Link"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDemoModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Close
            </Button>

            <Button
              type="button"
              onClick={handleApplyToLiveDashboard}
              className="bg-[#00875A] hover:bg-[#006E49] text-white text-xs font-semibold gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              {appliedNotification ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Branding Applied!</span>
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" />
                  <span>Apply to Current Session</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
