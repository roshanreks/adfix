"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseCSV, generateSampleCSV } from "@/lib/csv-parser";
import { runAuditV3 } from "@/lib/audit-engine-v3";
import { saveAudit, getPreferences } from "@/lib/data";
import type { AdData, BusinessType, AccountStage, RiskLevel, Currency } from "@/lib/types";
import {
  Check, CloudUpload, FileText, ExternalLink, ArrowRight, ArrowLeft,
  Download, Loader2, X, CheckCircle2, XCircle, Copy, ClipboardCheck,
  Info, PlayCircle, AlertCircle, BarChart3, TrendingUp, Filter,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AuditWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FIELD_LABELS: Record<string, string> = {
  campaign_name: "Campaign Name",
  ad_name: "Ad Name",
  ad_set_id: "Ad Set ID",
  ad_set_name: "Ad Set Name",
  campaign_id: "Campaign ID",
  ad_id: "Ad ID",
  spend: "Amount Spent",
  impressions: "Impressions",
  clicks: "Clicks",
  purchases: "Purchases",
  revenue: "Purchase Value",
  ctr: "CTR",
  cpc: "CPC",
  cpm: "CPM",
  reach: "Reach",
  link_clicks: "Link Clicks",
  landing_page_views: "Landing Page Views",
};

const REQUIRED_FIELDS = new Set([
  "campaign_name", "ad_name", "ad_set_id", "ad_set_name", "campaign_id", "ad_id",
  "spend", "impressions", "clicks", "purchases",
]);

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "ecommerce", label: "Ecommerce" },
  { value: "lead_generation", label: "Lead Generation" },
  { value: "app_installs", label: "App Installs" },
  { value: "awareness", label: "Awareness" },
  { value: "engagement", label: "Engagement" },
  { value: "other", label: "Other" },
];

const ACCOUNT_STAGES: { value: AccountStage; label: string }[] = [
  { value: "testing", label: "Testing" },
  { value: "scaling", label: "Scaling" },
  { value: "mature", label: "Mature" },
];

const RISK_LEVELS: { value: RiskLevel; label: string }[] = [
  { value: "conservative", label: "Conservative" },
  { value: "balanced", label: "Balanced" },
  { value: "aggressive", label: "Aggressive" },
];

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "INR", label: "INR (₹)" },
  { value: "USD", label: "USD ($)" },
  { value: "AED", label: "AED" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "other", label: "Other" },
];

export function AuditWizard({ open, onOpenChange }: AuditWizardProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<AdData[]>([]);
  const [mappedColumns, setMappedColumns] = useState<Record<string, string>>({});
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null; daysAnalyzed: number | null }>({ start: null, end: null, daysAnalyzed: null });

  const [auditName, setAuditName] = useState("");
  const [timeWindow, setTimeWindow] = useState("90");
  const [targetCPA, setTargetCPA] = useState("");
  const [targetROAS, setTargetROAS] = useState("");
  const [grossMargin, setGrossMargin] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("ecommerce");
  const [accountStage, setAccountStage] = useState<AccountStage>("scaling");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("balanced");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      const prefs = getPreferences();
      setTimeWindow(String(prefs.defaultTimeWindow));
      if (prefs.defaultTargetCPA) setTargetCPA(String(prefs.defaultTargetCPA));
      if (prefs.defaultTargetROAS) setTargetROAS(String(prefs.defaultTargetROAS));
      if (prefs.defaultGrossMargin) setGrossMargin(String(prefs.defaultGrossMargin));
      if (prefs.defaultBusinessType) setBusinessType(prefs.defaultBusinessType);
      if (prefs.defaultAccountStage) setAccountStage(prefs.defaultAccountStage);
      if (prefs.defaultRiskLevel) setRiskLevel(prefs.defaultRiskLevel);
      if (prefs.defaultCurrency) setCurrency(prefs.defaultCurrency);
    }
  }, [open]);

  useEffect(() => {
    const handler = () => onOpenChange(true);
    window.addEventListener("open-audit-wizard", handler);
    return () => window.removeEventListener("open-audit-wizard", handler);
  }, [onOpenChange]);

  const reset = useCallback(() => {
    const prefs = getPreferences();
    setStep(1);
    setFile(null);
    setParsedData([]);
    setMappedColumns({});
    setParseErrors([]);
    setParseWarnings([]);
    setMissingFields([]);
    setDateRange({ start: null, end: null, daysAnalyzed: null });
    setAuditName("");
    setTimeWindow(String(prefs.defaultTimeWindow));
    setTargetCPA("");
    setTargetROAS("");
    setGrossMargin("");
    setBusinessType(prefs.defaultBusinessType || "ecommerce");
    setAccountStage(prefs.defaultAccountStage || "scaling");
    setRiskLevel(prefs.defaultRiskLevel || "balanced");
    setCurrency(prefs.defaultCurrency || "INR");
    setIsProcessing(false);
    setProcessingStep(0);
  }, []);

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) await processFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) await processFile(e.target.files[0]);
  };

  const processFile = async (f: File) => {
    setFile(f);
    try {
      const result = await parseCSV(f);
      setParsedData(result.data);
      setMappedColumns(result.mappedColumns);
      setParseErrors(result.errors);
      setParseWarnings(result.warnings);
      setMissingFields(result.missingFields);
      setDateRange(result.dateRange);
      if (result.data.length > 0) {
        toast.success(`Parsed ${result.data.length} ads`);
        if (!auditName) setAuditName(`Audit — ${new Date().toLocaleDateString("en-IN")}`);
      } else {
        toast.error("No valid ad data found in this CSV");
      }
    } catch {
      toast.error("Failed to parse CSV");
      setParseErrors(["Failed to parse CSV file"]);
    }
  };

  const handleContinue = async () => {
    if (step === 2) {
      if (parsedData.length === 0) { toast.error("Please upload a valid CSV first"); return; }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      if (!auditName.trim()) { toast.error("Please enter an audit name"); return; }
      setIsProcessing(true);
      const steps = ["Reading CSV...", "Calculating 25+ metrics...", "Running benchmark engine...", "Computing confidence & health scores...", "Classifying each ad...", "Analyzing waste & structure...", "Generating report..."];
      for (let i = 0; i < steps.length; i++) {
        setProcessingStep(i);
        await new Promise((r) => setTimeout(r, 300));
      }
      const report = runAuditV3(parsedData, {
        name: auditName.trim(),
        timeWindow: parseInt(timeWindow) || 90,
        targetCPA: targetCPA ? parseFloat(targetCPA) : undefined,
        targetROAS: targetROAS ? parseFloat(targetROAS) : undefined,
        grossMargin: grossMargin ? parseFloat(grossMargin) : undefined,
        businessType,
        accountStage,
        riskLevel,
        currency,
        tier: "detailed",
      }, dateRange, missingFields);
      // Save to localStorage for backward compat
      saveAudit(report);
      // Save to database
      let navigateId = report.id;
      try {
        const res = await fetch("/api/audits", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: report.name,
            reportJson: report,
            healthScore: report.account_summary.health_score,
            wastePercentage: report.account_summary.waste_percentage,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.audit?.id) {
            navigateId = data.audit.id;
          }
        }
      } catch {
        console.error("Failed to save audit to database");
      }
      setIsProcessing(false);
      toast.success("Audit complete!");
      handleClose(false);
      router.push(`/dashboard/audits/${navigateId}`);
      router.refresh();
    }
  };

  const handleDownloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "adfix-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Sample CSV downloaded");
  };

  const detectedCount = Object.keys(mappedColumns).length;
  const totalFields = Object.keys(FIELD_LABELS).length;

  const breakevenRoas = grossMargin ? (1 / (parseFloat(grossMargin) / 100)).toFixed(2) : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[95dvh] sm:max-h-[85vh] overflow-y-auto p-0 sm:p-4">
        <div className="p-4 sm:p-0">
        <DialogHeader>
          <DialogTitle>Run New Audit</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-1 sm:gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-1 sm:gap-2 flex-1">
              <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                s === step ? "bg-primary text-primary-foreground" :
                s < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {s < step ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`flex-1 h-1 rounded-full transition-colors ${s < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-5">
              <div>
                <h3 className="font-semibold text-lg">Get Your Meta Ads CSV</h3>
                <p className="text-sm text-muted-foreground">AdFix reads your Ads Manager CSV and auto-calculates everything else.</p>
              </div>

              {/* Ads Manager Link Card */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Step 1: Open Meta Ads Manager Reporting</h4>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5">
                    <span className="text-sm text-muted-foreground truncate flex-1 font-mono">https://adsmanager.facebook.com/adsmanager/reporting</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 h-8 gap-1.5"
                      onClick={() => {
                        navigator.clipboard.writeText("https://adsmanager.facebook.com/adsmanager/reporting");
                        setCopied(true);
                        toast.success("Link copied to clipboard");
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? <ClipboardCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open("https://adsmanager.facebook.com/adsmanager/reporting", "_blank")}>
                      <ExternalLink className="h-3.5 w-3.5" /> Open Ads Manager
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => setGuideOpen(true)}>
                      <Info className="h-3.5 w-3.5" /> View Full Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Required Columns */}
              <Card>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <h4 className="font-medium">Required Columns (we auto-detect these)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>The 6 columns above are all you need for a complete audit.</strong> We handle the rest. AdFix is flexible — we accept many column name variants.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { label: "Campaign Name", aliases: "Campaign, Camp Name", required: true },
                      { label: "Ad Name", aliases: "Ad, Creative Name", required: true },
                      { label: "Amount Spent", aliases: "Spend, Cost, Spent, Budget Spent", required: true },
                      { label: "Impressions", aliases: "Impr, Total Impressions", required: true },
                      { label: "Clicks", aliases: "Clicks (all), Total Clicks", required: true },
                      { label: "Purchases", aliases: "Conversions, Results, Website Purchases", required: true },
                    ].map((col) => (
                      <div key={col.label} className="flex items-start gap-2 rounded-lg border p-2.5 bg-muted/30">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">{col.label}</div>
                          <div className="text-[11px] text-muted-foreground">Also accepts: {col.aliases}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Columns */}
              <Card>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-amber-500" />
                    <h4 className="font-medium">Recommended Columns (for deeper analysis)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Add these for bonus insights</strong> — ROAS, CPA, CPM, CTR, CPC, AOV, and funnel metrics are calculated automatically when these columns are present.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Purchase Conversion Value",
                      "Reach",
                      "Frequency",
                      "Link Clicks",
                      "Landing Page Views",
                      "Add to Cart",
                      "Initiate Checkout",
                      "Quality Ranking",
                      "Delivery",
                    ].map((col) => (
                      <Badge key={col} variant="secondary" className="text-xs font-normal">{col}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Auto-detect note */}
              <Card className="border-blue-200/60 bg-blue-50/40 dark:bg-blue-950/10">
                <CardContent className="p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Column names don't need to match exactly</h4>
                    <p className="text-sm text-blue-700/80 dark:text-blue-400/80 mt-0.5">
                      If your export says "Spent" instead of "Amount Spent" or "Conversions" instead of "Purchases" — AdFix will auto-detect them. No need to rename anything.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="w-full sm:w-auto">I already have a CSV</Button>
                <Button onClick={() => setStep(2)} className="bg-primary text-primary-foreground gap-2 w-full sm:w-auto">
                  Next: Upload CSV <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-6">
              <div>
                <h3 className="font-semibold text-lg">Upload Your CSV</h3>
                <p className="text-sm text-muted-foreground">We automatically detect and map your column names.</p>
              </div>
              <div
                onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300 overflow-hidden ${
                  dragActive
                    ? "border-primary bg-primary/[0.04] scale-[1.01]"
                    : file
                    ? "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : "border-border bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/50"
                }`}
              >
                {/* Animated border glow on drag */}
                {dragActive && (
                  <motion.div
                    layoutId="dropGlow"
                    className="absolute inset-0 rounded-xl border-2 border-primary/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <div className="relative z-10">
                  <motion.div
                    animate={dragActive ? { y: [0, -4, 0] } : {}}
                    transition={{ duration: 1, repeat: dragActive ? Infinity : 0 }}
                  >
                    <CloudUpload className={`h-9 w-9 sm:h-11 sm:w-11 mx-auto mb-3 transition-colors ${
                      dragActive ? "text-primary" : file ? "text-emerald-500" : "text-muted-foreground"
                    }`} />
                  </motion.div>
                  {file ? (
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-medium text-sm sm:text-base text-emerald-700 dark:text-emerald-400">{file.name}</p>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60">
                        {(file.size / 1024).toFixed(1)} KB · Ready to parse
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium mb-1 text-sm sm:text-base">Drop your CSV here or click to browse</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4">Supports standard Meta Ads Manager exports</p>
                    </>
                  )}
                  <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" id="csv-upload" />
                  <label
                    htmlFor="csv-upload"
                    className="inline-flex items-center justify-center cursor-pointer rounded-md text-sm font-medium h-10 px-5 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {file ? "Change File" : "Browse File"}
                  </label>
                </div>
              </div>
              {parseErrors.length > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {parseErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
              {parsedData.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                  {/* Parse success banner */}
                  <div className="p-3 rounded-lg bg-emerald-500/[0.08] border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{parsedData.length} ads parsed</span>
                      <span className="text-emerald-600/70 dark:text-emerald-400/60 ml-2">{detectedCount}/{totalFields} columns detected</span>
                    </div>
                  </div>

                  {/* Column detection progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Column Mapping</span>
                      <span className="text-muted-foreground">{Math.round((detectedCount / totalFields) * 100)}% matched</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(detectedCount / totalFields) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Matched columns */}
                  {detectedCount > 0 && (
                    <div className="rounded-lg border overflow-hidden">
                      <div className="px-3 py-2 bg-emerald-50/50 dark:bg-emerald-950/20 border-b flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Matched ({detectedCount})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
                        {Object.entries(FIELD_LABELS)
                          .filter(([field]) => field in mappedColumns)
                          .map(([field, label]) => (
                            <div key={field} className="flex items-center gap-2 px-3 py-2.5 bg-background text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-foreground truncate">{label}</span>
                                <span className="text-[10px] text-muted-foreground truncate">{mappedColumns[field]}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Missing columns */}
                  {detectedCount < totalFields && (
                    <div className="rounded-lg border overflow-hidden">
                      <div className="px-3 py-2 bg-muted/30 border-b flex items-center gap-2">
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Missing ({totalFields - detectedCount})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
                        {Object.entries(FIELD_LABELS)
                          .filter(([field]) => !(field in mappedColumns))
                          .map(([field, label]) => {
                            const isRequired = REQUIRED_FIELDS.has(field);
                            return (
                              <div key={field} className="flex items-center gap-2 px-3 py-2.5 bg-background text-xs">
                                <XCircle className={`h-3.5 w-3.5 shrink-0 ${isRequired ? "text-destructive" : "text-muted-foreground/40"}`} />
                                <span className={isRequired ? "text-destructive font-medium" : "text-muted-foreground"}>{label}</span>
                                {isRequired && <Badge variant="destructive" className="text-[9px] h-4 px-1 ml-auto">Required</Badge>}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {parseWarnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-500/[0.08] border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-sm space-y-1">
                      {parseWarnings.map((w, i) => (
                        <p key={i} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                          {w}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Data preview */}
                  <div className="rounded-lg border overflow-hidden">
                    <p className="text-xs font-medium text-muted-foreground px-3 py-2 bg-muted/30 uppercase tracking-wide">
                      Data Preview (first {Math.min(3, parsedData.length)} rows)
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-muted/20">
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Ad Name</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Campaign</th>
                            <th className="text-right px-3 py-2 font-medium text-muted-foreground">Spend</th>
                            <th className="text-right px-3 py-2 font-medium text-muted-foreground">Purchases</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.slice(0, 3).map((ad, i) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                              <td className="px-3 py-2 max-w-[140px] truncate">{ad.ad_name || "—"}</td>
                              <td className="px-3 py-2 max-w-[120px] truncate text-muted-foreground">{ad.campaign_name || "—"}</td>
                              <td className="px-3 py-2 text-right font-mono">₹{ad.spend.toLocaleString("en-IN")}</td>
                              <td className="px-3 py-2 text-right font-mono">{ad.purchases}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
              {file && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <button onClick={() => { setFile(null); setParsedData([]); setMappedColumns({}); }} className="text-destructive ml-auto" aria-label="Remove file">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
              <Button variant="ghost" size="sm" className="w-fit gap-2 text-muted-foreground" onClick={handleDownloadSample}>
                <Download className="h-4 w-4" /> Download Sample CSV
              </Button>
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2 w-full sm:w-auto"><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button onClick={handleContinue} disabled={parsedData.length === 0} className="bg-primary text-primary-foreground gap-2 w-full sm:w-auto">Continue <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-6">
              <div>
                <h3 className="font-semibold text-lg">Audit Setup</h3>
                <p className="text-sm text-muted-foreground">Tell us about your business so the audit can give better recommendations.</p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="target-cpa">Target CPA (optional)</Label>
                  <Input id="target-cpa" type="number" placeholder="e.g. 435" value={targetCPA} onChange={(e) => setTargetCPA(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Your ideal cost per acquisition. Leave blank to use account average.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="target-roas">Target ROAS (optional)</Label>
                  <Input id="target-roas" type="number" step="0.1" placeholder="e.g. 2.5" value={targetROAS} onChange={(e) => setTargetROAS(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Your ideal return on ad spend. Used for ecommerce businesses.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gross-margin">Gross Margin % (optional)</Label>
                  <Input id="gross-margin" type="number" placeholder="e.g. 60" value={grossMargin} onChange={(e) => setGrossMargin(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Used to calculate breakeven ROAS. Example: 60% margin = 1.67× breakeven ROAS.</p>
                  {breakevenRoas && (
                    <p className="text-xs text-emerald-600 font-medium">Breakeven ROAS: {breakevenRoas}×</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Business Type</Label>
                  <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((bt) => <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Account Stage</Label>
                  <Select value={accountStage} onValueChange={(v) => setAccountStage(v as AccountStage)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Risk Level</Label>
                  <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RISK_LEVELS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!targetCPA && (
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-700 text-sm">
                  ⚠ Target CPA was not provided, so this audit will use account average CPA as the benchmark.
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-2 w-full sm:w-auto"><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button onClick={handleContinue} className="bg-primary text-primary-foreground gap-2 w-full sm:w-auto">Continue <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-6">
              <div>
                <h3 className="font-semibold text-lg">Configure & Run</h3>
                <p className="text-sm text-muted-foreground">Name your audit and set final preferences.</p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="audit-name">Audit Name</Label>
                  <Input id="audit-name" placeholder="e.g. June 2025 Account Audit" value={auditName} onChange={(e) => setAuditName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Time Window</Label>
                  <div className="flex gap-2">
                    {["7", "30", "90"].map((w) => (
                      <Button key={w} type="button" variant={timeWindow === w ? "default" : "outline"} size="sm" onClick={() => setTimeWindow(w)} className={timeWindow === w ? "bg-primary text-primary-foreground" : ""}>{w}d</Button>
                    ))}
                  </div>
                </div>
                {/* Free Audit Banner */}
                <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Free Comprehensive Audit</span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-3">
                    All features included at no cost. You get the full health score, waste analysis, benchmarks, and complete Kill/Fix/Scale classification.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Health Score & Verdict", "Kill / Fix / Scale", "Waste Analysis", "Benchmarks", "Campaign Structure", "Creative Audit", "Funnel Audit", "PDF Export"].map((f) => (
                      <span key={f} className="inline-flex items-center gap-1 text-[10px] bg-white dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full text-emerald-700 dark:text-emerald-400">
                        <Check className="h-2.5 w-2.5" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Card className="bg-muted/30">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Ads to analyze</span><span className="font-medium">{parsedData.length}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Total spend</span><span className="font-medium">₹{parsedData.reduce((s, a) => s + a.spend, 0).toLocaleString("en-IN")}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Total purchases</span><span className="font-medium">{parsedData.reduce((s, a) => s + a.purchases, 0)}</span></div>
                  {targetCPA && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Target CPA</span><span className="font-medium">₹{targetCPA}</span></div>}
                  {targetROAS && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Target ROAS</span><span className="font-medium">{targetROAS}×</span></div>}
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Business type</span><span className="font-medium capitalize">{businessType.replace("_", " ")}</span></div>
                </CardContent>
              </Card>
              {isProcessing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {["Reading CSV", "Calculating 25+ metrics", "Running benchmark engine", "Computing confidence & health scores", "Classifying each ad", "Analyzing waste & structure", "Generating report"][processingStep]}
                    </p>
                    <p className="text-xs text-muted-foreground">Step {processingStep + 1} of 7</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Reading CSV", icon: FileText },
                      { label: "Calculating metrics", icon: BarChart3 },
                      { label: "Benchmark engine", icon: TrendingUp },
                      { label: "Confidence scoring", icon: CheckCircle2 },
                      { label: "Classifying ads", icon: Filter },
                      { label: "Waste analysis", icon: AlertCircle },
                      { label: "Generating report", icon: ClipboardCheck },
                    ].map((step, i) => {
                      const isComplete = i < processingStep;
                      const isCurrent = i === processingStep;
                      const Icon = step.icon;
                      return (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                          isComplete ? "bg-emerald-50/50 dark:bg-emerald-950/20" :
                          isCurrent ? "bg-primary/5 border border-primary/20" : "bg-muted/20 opacity-50"
                        }`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            isComplete ? "bg-emerald-500 text-white" :
                            isCurrent ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            {isComplete ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Icon className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <span className={`text-xs font-medium ${
                            isComplete ? "text-emerald-700 dark:text-emerald-400" :
                            isCurrent ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {step.label}
                          </span>
                          {isCurrent && (
                            <motion.div
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Progress value={((processingStep + 1) / 7) * 100} className="w-full h-1.5" />
                </motion.div>
              )}
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <Button variant="outline" onClick={() => setStep(3)} className="gap-2 w-full sm:w-auto"><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button onClick={handleContinue} disabled={isProcessing} className="bg-primary text-primary-foreground gap-2 w-full sm:w-auto">
                  {isProcessing ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>) : (<><FileText className="h-4 w-4" /> Run Free Audit →</>)}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </DialogContent>

      {/* Full Ads Manager Guide Dialog */}
      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              How to Export Your Meta Ads Report
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">Direct Link</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white border rounded px-2 py-1.5 flex-1 truncate">https://adsmanager.facebook.com/adsmanager/reporting</code>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 h-8"
                  onClick={() => {
                    navigator.clipboard.writeText("https://adsmanager.facebook.com/adsmanager/reporting");
                    toast.success("Link copied");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  step: 1,
                  title: "Open Ads Manager Reporting",
                  desc: "Go to the link above. Make sure you are in the Reporting tab (not the main Ads tab).",
                },
                {
                  step: 2,
                  title: "Break Down by Ad",
                  desc: "In the top-left, change the breakdown from 'Campaign' or 'Ad Set' to 'Ad'. AdFix needs ad-level data.",
                },
                {
                  step: 3,
                  title: "Set Your Date Range",
                  desc: "Pick the date range you want to audit (e.g., Last 30 days, Last 90 days). Make sure it covers enough data for meaningful results.",
                },
                {
                  step: 4,
                  title: "Add Required Columns",
                  desc: "Click the Columns button and make sure these are included: Campaign Name, Ad Name, Amount Spent, Impressions, Clicks, Purchases. Add Purchase Conversion Value if you want ROAS analysis.",
                },
                {
                  step: 5,
                  title: "Export as CSV",
                  desc: "Click the Export button in the top-right and choose 'Export Table Data (CSV)'. Save the file to your computer.",
                },
                {
                  step: 6,
                  title: "Upload to AdFix",
                  desc: "Come back here, go to Step 2, and drop your CSV file. AdFix will auto-detect columns and calculate all metrics.",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                <strong>Tip:</strong> AdFix accepts many column name variants. If your export says &ldquo;Spent&rdquo; instead of &ldquo;Amount Spent&rdquo; or &ldquo;Conversions&rdquo; instead of &ldquo;Purchases&rdquo; — it will still work.
              </p>
            </div>

            <Button onClick={() => { setGuideOpen(false); setStep(2); }} className="w-full bg-primary text-primary-foreground gap-2">
              Got it — Upload CSV <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
