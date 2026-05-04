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
  Download, Loader2, X, CheckCircle2, XCircle,
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
  const [analysisDepth, setAnalysisDepth] = useState("basic");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
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
    setAnalysisDepth("basic");
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
        tier: analysisDepth as "basic" | "detailed",
      }, dateRange, missingFields);
      saveAudit(report);
      setIsProcessing(false);
      toast.success("Audit complete!");
      handleClose(false);
      router.push(`/dashboard/audits/${report.id}`);
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
      <DialogContent className="sm:max-w-xl max-h-[95dvh] overflow-y-auto p-0 sm:p-4">
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
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-6">
              <div>
                <h3 className="font-semibold text-lg">Prepare Your Ads Report</h3>
                <p className="text-sm text-muted-foreground">Follow these steps to export the correct CSV from Meta Ads Manager.</p>
              </div>
              <Card>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-medium">Access Ads Manager</h4>
                    <p className="text-sm text-muted-foreground">Open Meta Ads Manager and navigate to the <strong>Ads</strong> level view.</p>
                    <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => window.open("https://business.facebook.com/adsmanager", "_blank")}>
                      <ExternalLink className="h-3 w-3" /> Open Ads Manager
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-medium">Set Date Range & Columns</h4>
                    <p className="text-sm text-muted-foreground mb-2">Include these columns for a complete audit:</p>
                    <div className="flex flex-wrap gap-1">
                      {["Campaign name", "Ad name", "Amount spent", "Impressions", "Clicks", "Purchases", "Purchase Conversion Value", "Landing Page Views", "Add to Cart"].map((col) => (
                        <Badge key={col} variant="secondary" className="text-xs">{col}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-medium">Export as CSV</h4>
                    <p className="text-sm text-muted-foreground">Click <strong>Export → Export Table Data (CSV)</strong>.</p>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="w-full sm:w-auto">Skip, I already have CSV</Button>
                <Button onClick={() => setStep(2)} className="bg-primary text-primary-foreground gap-2 w-full sm:w-auto">
                  I've configured my report <ArrowRight className="h-4 w-4" />
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
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300 ${
                  dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border bg-muted/30"
                }`}
              >
                <CloudUpload className={`h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-4 transition-colors ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
                <p className="font-medium mb-1 text-sm sm:text-base">{file ? file.name : "Drop your CSV here or click to browse"}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">Supports standard Meta Ads Manager exports</p>
                <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" id="csv-upload" />
                <label htmlFor="csv-upload" className="inline-flex items-center justify-center cursor-pointer rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">Browse File</label>
              </div>
              {parseErrors.length > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {parseErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
              {parsedData.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-700 text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="font-medium">{parsedData.length} ads parsed</span>
                    <span className="text-emerald-600 ml-auto">{detectedCount}/{totalFields} columns matched</span>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Detected Columns</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      {Object.entries(FIELD_LABELS).map(([field, label]) => {
                        const found = field in mappedColumns;
                        const isRequired = REQUIRED_FIELDS.has(field);
                        return (
                          <div key={field} className="flex items-center gap-1.5 text-xs">
                            {found ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className={`h-3.5 w-3.5 shrink-0 ${isRequired ? "text-destructive" : "text-muted-foreground/50"}`} />
                            )}
                            <span className={found ? "text-foreground" : isRequired ? "text-destructive" : "text-muted-foreground"}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {parseWarnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-500/10 text-amber-700 text-sm">
                      {parseWarnings.map((w, i) => <p key={i}>⚠ {w}</p>)}
                    </div>
                  )}
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
                            <tr key={i} className="border-b last:border-0">
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
                <div className="grid gap-2">
                  <Label>Analysis Depth</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="depth" value="basic" checked={analysisDepth === "basic"} onChange={() => setAnalysisDepth("basic")} className="accent-primary" />
                      <span className="text-sm">Basic (₹499)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="depth" value="detailed" checked={analysisDepth === "detailed"} onChange={() => setAnalysisDepth("detailed")} className="accent-primary" />
                      <span className="text-sm">Detailed (₹999)</span>
                    </label>
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
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">{["Reading CSV...", "Calculating 25+ metrics...", "Running benchmark engine...", "Computing confidence & health scores...", "Classifying each ad...", "Analyzing waste & structure...", "Generating report..."][processingStep]}</p>
                  <Progress value={((processingStep + 1) / 7) * 100} className="w-full" />
                </motion.div>
              )}
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <Button variant="outline" onClick={() => setStep(3)} className="gap-2 w-full sm:w-auto"><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button onClick={handleContinue} disabled={isProcessing} className="bg-primary text-primary-foreground gap-2 w-full sm:w-auto">
                  {isProcessing ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>) : (<><FileText className="h-4 w-4" /> Run Audit</>)}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
