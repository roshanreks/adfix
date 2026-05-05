"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import { getAuditById } from "@/lib/data";
import { toast } from "sonner";
import type { AuditReport } from "@/lib/types";
import {
  WasteDistributionChart,
  CpaComparisonChart,
  ClassificationBarChart,
  CircularScore,
} from "@/components/report-charts";
import { ClassificationTable } from "@/components/classification-table";
import { ArrowLeft, TrendingDown, AlertTriangle, TrendingUp, HelpCircle, Eye, ArrowUp, Lock, Check, Calendar, MessageSquare, Send } from "lucide-react";
import { FadeIn } from "@/components/animations";
import { PDFExportButton } from "@/components/pdf-report";

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.push("/dashboard/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/audits/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.audit?.reportJson) {
            try {
              setAudit(JSON.parse(data.audit.reportJson));
            } catch {
              setAudit(null);
            }
          } else {
            // Fallback to localStorage
            setAudit(getAuditById(params.id as string));
          }
        })
        .catch(() => {
          setAudit(getAuditById(params.id as string));
        });
    }
  }, [params.id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isLoading) return <div className="flex flex-col gap-6 max-w-6xl mx-auto animate-pulse"><div className="h-10 bg-muted rounded-lg w-32" /><div className="grid md:grid-cols-3 gap-6"><div className="md:col-span-2 h-48 bg-muted rounded-xl" /><div className="h-48 bg-muted rounded-xl" /></div></div>;
  if (!user) return null;
  if (!audit) return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <HelpCircle className="h-12 w-12 text-muted-foreground" /><h2 className="text-xl font-semibold">Audit not found</h2>
      <p className="text-muted-foreground">The audit you are looking for does not exist or has been removed.</p>
      <Button onClick={() => router.push("/dashboard/audits")} variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Audits</Button>
    </div>
  );

  const allAds = audit.ad_level_audit || [];
  const scaleAds = allAds.filter(a => a.verdict === "SCALE");
  const fixAds = allAds.filter(a => a.verdict === "FIX");
  const killAds = allAds.filter(a => a.verdict === "KILL");
  const watchAds = allAds.filter(a => a.verdict === "WATCH");
  const noActionAds = allAds.filter(a => a.verdict === "NO_ACTION");
  const insufficientAds = allAds.filter(a => a.verdict === "INSUFFICIENT_DATA");
  const isDetailed = user.plan === "detailed";
  const isReportUnlocked = false; // TODO: check ConsultationBooking in DB when payment system is ready

  const healthBadgeVariant =
    audit.account_summary.health_label === "Excellent" || audit.account_summary.health_label === "Elite" || audit.account_summary.health_label === "Good"
      ? "default"
      : audit.account_summary.health_label === "Average"
      ? "secondary"
      : "destructive";

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-6xl mx-auto">
      {/* Sticky summary bar */}
      <div
        className={`sticky top-0 z-40 transition-all duration-300 ${
          showSticky ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-background/80 backdrop-blur-md border-b shadow-sm px-4 py-2.5 -mx-4 sm:-mx-6">
          <div className="flex items-center justify-between gap-3 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/audits")} className="gap-1.5 h-8 px-2 shrink-0">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Audits</span>
              </Button>
              <div className="h-4 w-px bg-border shrink-0 hidden sm:block" />
              <h2 className="text-sm font-semibold truncate max-w-[140px] sm:max-w-xs">{audit.name}</h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={healthBadgeVariant} className="text-xs h-6 px-2">
                {audit.account_summary.health_label} · {audit.account_summary.health_score}/100
              </Badge>
              {isDetailed && <PDFExportButton report={audit} />}
              <Button variant="ghost" size="sm" onClick={scrollToTop} className="h-8 w-8 p-0" aria-label="Scroll to top">
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <FadeIn>
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => router.push("/dashboard/audits")} className="gap-2 min-h-10"><ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span></Button>
          {isDetailed && <PDFExportButton report={audit} />}
        </div>
      </FadeIn>

      {/* Audit name + health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <FadeIn delay={0.1} className="sm:col-span-2 lg:col-span-2">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">{audit.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {audit.audit_metadata.reporting_start ? new Date(audit.audit_metadata.reporting_start).toLocaleDateString("en-IN") : "No date range"}
                    {audit.audit_metadata.reporting_end && ` — ${new Date(audit.audit_metadata.reporting_end).toLocaleDateString("en-IN")}`}
                    {audit.audit_metadata.days_analyzed && ` · ${audit.audit_metadata.days_analyzed}d`}
                    {` · ${audit.audit_metadata.business_type.replace("_", " ")} · ${audit.audit_metadata.account_stage}`}
                  </p>
                </div>
                <Badge variant={audit.account_summary.health_label === "Excellent" || audit.account_summary.health_label === "Elite" || audit.account_summary.health_label === "Good" ? "default" : audit.account_summary.health_label === "Average" ? "secondary" : "destructive"} className="text-base px-4 py-1">
                  {audit.account_summary.health_label}
                </Badge>
              </div>
              <Progress value={audit.account_summary.health_score} className="h-2 mb-4" />
              <p className="text-muted-foreground leading-relaxed">{audit.account_summary.summary_text}</p>
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.15} className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center gap-3">
              <span className="text-sm text-muted-foreground">Health Score</span>
              <CircularScore score={audit.account_summary.health_score} size={100} />
              <Badge variant={audit.audit_metadata.confidence_level === "High" ? "default" : audit.audit_metadata.confidence_level === "Medium" ? "secondary" : "destructive"}>
                {audit.audit_metadata.confidence_level} confidence
              </Badge>
            </CardContent>
          </Card>
          {/* WhatsApp Button */}
          <Button
            variant="outline"
            className="w-full gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30"
            onClick={() => setWhatsappModalOpen(true)}
          >
            <MessageSquare className="h-4 w-4" /> Send Report to WhatsApp
          </Button>
          <Card>
            <CardContent className="p-6 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Wasted Budget</span><span className="font-semibold text-destructive">₹{audit.account_summary.wasted_budget.toLocaleString("en-IN")}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Waste %</span><span className="font-semibold text-destructive">{audit.account_summary.waste_percentage.toFixed(1)}%</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Efficient Spend</span><span className="font-semibold text-emerald-600">₹{audit.account_summary.efficient_spend.toLocaleString("en-IN")}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Actions Required</span><span className="font-semibold">{audit.account_summary.actions_required}</span></div>
              {audit.audit_metadata.target_cpa && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Target CPA</span><span className="font-semibold">₹{audit.audit_metadata.target_cpa.toFixed(0)}</span></div>}
              {audit.audit_metadata.breakeven_roas && <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Breakeven ROAS</span><span className="font-semibold">{audit.audit_metadata.breakeven_roas.toFixed(2)}×</span></div>}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* AI Insight */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Key Insights</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">{audit.ai_insight.headline}</h3>
            <p className="text-muted-foreground leading-relaxed">{audit.ai_insight.paragraph_1}</p>
            <p className="text-muted-foreground leading-relaxed">{audit.ai_insight.paragraph_2}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-emerald-500/10"><div className="text-xs text-muted-foreground mb-1">Biggest Opportunity</div><div className="text-sm font-medium">{audit.ai_insight.biggest_opportunity}</div></div>
              <div className="p-4 rounded-lg bg-destructive/10"><div className="text-xs text-muted-foreground mb-1">Biggest Risk</div><div className="text-sm font-medium">{audit.ai_insight.biggest_risk}</div></div>
              <div className="p-4 rounded-lg bg-blue-500/10"><div className="text-xs text-muted-foreground mb-1">Next Best Action</div><div className="text-sm font-medium">{audit.ai_insight.next_best_action}</div></div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* KPI Cards */}
      <FadeIn delay={0.21}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Total Spend", value: `₹${audit.account_summary.total_spend.toLocaleString("en-IN")}` },
            { label: "Revenue", value: audit.account_summary.total_revenue > 0 ? `₹${audit.account_summary.total_revenue.toLocaleString("en-IN")}` : "—" },
            { label: "Purchases", value: audit.account_summary.total_purchases.toString() },
            { label: "Avg CPA", value: audit.account_summary.avg_cpa > 0 ? `₹${audit.account_summary.avg_cpa.toFixed(0)}` : "—" },
            { label: "Avg ROAS", value: audit.account_summary.avg_roas > 0 ? `${audit.account_summary.avg_roas.toFixed(2)}×` : "—" },
            { label: "Avg CTR", value: `${audit.account_summary.avg_ctr.toFixed(2)}%` },
            { label: "Avg CPC", value: audit.account_summary.avg_cpc > 0 ? `₹${audit.account_summary.avg_cpc.toFixed(2)}` : "—" },
            { label: "Avg CPM", value: `₹${audit.account_summary.avg_cpm.toFixed(0)}` },
          ].map((kpi) => (
            <Card key={kpi.label} className="shadow-ambient border-[#E2E8F0]">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
                <div className="text-lg font-bold mt-1">{kpi.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>

      {/* Priority Actions */}
      {audit.priority_actions.length > 0 && (
        <FadeIn delay={0.22}>
          <Card>
            <CardHeader><CardTitle>Priority Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {audit.priority_actions.map((action, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <Badge variant={action.urgency === "High" ? "destructive" : action.urgency === "Medium" ? "secondary" : "outline"}>{action.urgency}</Badge>
                  <div className="flex-1"><div className="font-medium text-sm">{action.action}</div><div className="text-xs text-muted-foreground">{action.impact}</div></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Waste Breakdown */}
      <FadeIn delay={0.23}>
        <Card>
          <CardHeader><CardTitle className="text-base">Waste Breakdown</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 rounded-lg bg-destructive/10 text-center"><div className="text-xs text-muted-foreground">Total Wasted</div><div className="text-lg font-semibold text-destructive">₹{audit.waste_breakdown.total_wasted_budget.toLocaleString("en-IN")}</div></div>
              <div className="p-3 rounded-lg bg-red-500/10 text-center"><div className="text-xs text-muted-foreground">Hard Waste</div><div className="text-lg font-semibold text-red-500">₹{audit.waste_breakdown.hard_waste.toLocaleString("en-IN")}</div></div>
              <div className="p-3 rounded-lg bg-amber-500/10 text-center"><div className="text-xs text-muted-foreground">CPA Waste</div><div className="text-lg font-semibold text-amber-500">₹{audit.waste_breakdown.cpa_waste.toLocaleString("en-IN")}</div></div>
              <div className="p-3 rounded-lg bg-orange-500/10 text-center"><div className="text-xs text-muted-foreground">ROAS Waste</div><div className="text-lg font-semibold text-orange-500">₹{audit.waste_breakdown.roas_waste.toLocaleString("en-IN")}</div></div>
              <div className="p-3 rounded-lg bg-emerald-500/10 text-center"><div className="text-xs text-muted-foreground">Efficient</div><div className="text-lg font-semibold text-emerald-500">₹{audit.account_summary.efficient_spend.toLocaleString("en-IN")}</div></div>
            </div>
            {audit.waste_breakdown.top_waste_contributors.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Top Waste Contributors</h4>
                <div className="flex flex-col gap-2">
                  {audit.waste_breakdown.top_waste_contributors.map((ad, i) => (
                    <div key={ad.ad_id} className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50">
                      <div><span className="font-medium">{i + 1}. {ad.ad_name}</span><span className="text-xs text-muted-foreground ml-2">{ad.reason}</span></div>
                      <span className="text-destructive font-semibold">₹{ad.wasted_amount.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <FadeIn delay={0.25}><Card><CardHeader><CardTitle className="text-base">Waste Distribution</CardTitle></CardHeader><CardContent><WasteDistributionChart report={audit} /></CardContent></Card></FadeIn>
        <FadeIn delay={0.3}><Card><CardHeader><CardTitle className="text-base">Classification Breakdown</CardTitle></CardHeader><CardContent><ClassificationBarChart report={audit} /></CardContent></Card></FadeIn>
      </div>
      <FadeIn delay={0.35}><Card><CardHeader><CardTitle className="text-base">CPA vs Target</CardTitle></CardHeader><CardContent><CpaComparisonChart report={audit} /></CardContent></Card></FadeIn>

      {/* Benchmarks */}
      <FadeIn delay={0.4}>
        <Card>
          <CardHeader><CardTitle>Benchmarks</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Avg CPA</div><div className="text-lg font-semibold">₹{audit.benchmarks.avg_cpa.toFixed(0)}</div></div>
              <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Avg ROAS</div><div className="text-lg font-semibold">{audit.benchmarks.avg_roas.toFixed(2)}×</div></div>
              <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Avg CTR</div><div className="text-lg font-semibold">{audit.benchmarks.avg_ctr.toFixed(2)}%</div></div>
              <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Avg CPC</div><div className="text-lg font-semibold">₹{audit.benchmarks.avg_cpc.toFixed(2)}</div></div>
              <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Avg CPM</div><div className="text-lg font-semibold">₹{audit.benchmarks.avg_cpm.toFixed(0)}</div></div>
            </div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Best Performer</span><span className="font-medium text-emerald-600">{audit.benchmarks.best_performer}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Worst Performer</span><span className="font-medium text-destructive">{audit.benchmarks.worst_performer}</span></div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* ───────────────────────────────────────────
          LOCKED ZONE — Full Action Plan
          Everything below is blurred until user pays ₹999
      ─────────────────────────────────────────── */}
      <div className="relative">
        {/* The actual content (rendered but blurred when locked) */}
        <div className={`flex flex-col gap-4 sm:gap-6 transition-all duration-500 ${!isReportUnlocked ? "blur-[6px] select-none pointer-events-none opacity-60" : ""}`}>

          {/* Scale Opportunities */}
          {audit.scale_opportunities.length > 0 && (
            <FadeIn delay={0.41}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" /> Scale Opportunities ({audit.scale_opportunities.length})</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {audit.scale_opportunities.slice(0, 2).map((opp, i) => (
                    <Card key={i} className="bg-emerald-500/5 border-emerald-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{opp.ad_name}</span>
                          <Badge className="bg-emerald-500">{opp.purchases} purchases · {opp.scale_level}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{opp.why_scale}</p>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Fix Opportunities */}
          {audit.fix_opportunities.length > 0 && (
            <FadeIn delay={0.42}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Fix Opportunities ({audit.fix_opportunities.length})</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {audit.fix_opportunities.slice(0, 2).map((fix, i) => (
                    <Card key={i} className="bg-amber-500/5 border-amber-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{fix.ad_name}</span>
                          <Badge className="bg-amber-500 capitalize">{fix.issue_type.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{fix.diagnosis}</p>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Kill Recommendations */}
          {audit.kill_recommendations.length > 0 && (
            <FadeIn delay={0.43}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-red-500" /> Kill Recommendations ({audit.kill_recommendations.length})</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {audit.kill_recommendations.slice(0, 2).map((kill, i) => (
                    <Card key={i} className="bg-red-500/5 border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{kill.ad_name}</span>
                          <Badge variant="destructive">Spend: ₹{kill.spend.toLocaleString("en-IN")}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{kill.reason}</p>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Campaign Structure */}
          {audit.campaign_structure_audit && (
            <FadeIn delay={0.44}>
              <Card>
                <CardHeader><CardTitle>Campaign Structure Audit</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Campaigns</div><div className="text-lg font-semibold">{audit.campaign_structure_audit.number_of_campaigns}</div></div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Ad Sets</div><div className="text-lg font-semibold">{audit.campaign_structure_audit.number_of_adsets}</div></div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Ads</div><div className="text-lg font-semibold">{audit.campaign_structure_audit.number_of_ads}</div></div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Ads/Ad Set</div><div className="text-lg font-semibold">{audit.campaign_structure_audit.avg_ads_per_adset}</div></div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Fragmentation</div><div className="text-lg font-semibold">{audit.campaign_structure_audit.budget_fragmentation_score}%</div></div>
                  </div>
                  <p className="text-sm font-medium">{audit.campaign_structure_audit.diagnosis}</p>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Creative Audit */}
          {audit.creative_audit && (
            <FadeIn delay={0.45}>
              <Card>
                <CardHeader><CardTitle>Creative Audit</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm font-medium">{audit.creative_audit.diagnosis}</p>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Funnel Audit */}
          {audit.funnel_audit && (
            <FadeIn delay={0.46}>
              <Card>
                <CardHeader><CardTitle>Funnel Audit</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm font-medium">{audit.funnel_audit.diagnosis}</p>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Tracking Audit */}
          {audit.tracking_audit && (
            <FadeIn delay={0.47}>
              <Card>
                <CardHeader><CardTitle>Tracking Audit</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-2"><Eye className="h-4 w-4" /><span className="text-sm">Confidence: {audit.tracking_audit.tracking_confidence}</span></div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Ad-Level Table */}
          <FadeIn delay={0.48}>
            <Tabs defaultValue="all" className="w-full">
              <div className="overflow-x-auto -mx-4 sm:-mx-0 px-4 sm:px-0">
              <TabsList className="w-max sm:w-full min-w-full justify-start flex-nowrap sm:flex-wrap gap-1 sm:gap-0">
                <TabsTrigger value="all">All ({allAds.length})</TabsTrigger>
                <TabsTrigger value="scale">Scale ({scaleAds.length})</TabsTrigger>
                <TabsTrigger value="fix">Fix ({fixAds.length})</TabsTrigger>
                <TabsTrigger value="kill">Kill ({killAds.length})</TabsTrigger>
                <TabsTrigger value="watch">Watch ({watchAds.length})</TabsTrigger>
                <TabsTrigger value="noaction">No Action ({noActionAds.length})</TabsTrigger>
                <TabsTrigger value="insufficient">Insufficient ({insufficientAds.length})</TabsTrigger>
              </TabsList>
              </div>
              <TabsContent value="all"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={allAds} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
              <TabsContent value="scale"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={scaleAds} limit={3} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
              <TabsContent value="fix"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={fixAds} limit={3} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
              <TabsContent value="kill"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={killAds} limit={3} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
              <TabsContent value="watch"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={watchAds} limit={3} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
              <TabsContent value="noaction"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={noActionAds} limit={3} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
              <TabsContent value="insufficient"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={insufficientAds} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
            </Tabs>
          </FadeIn>
        </div>

        {/* Lock Overlay */}
        {!isReportUnlocked && (
          <div className="absolute inset-0 flex items-start justify-center pt-20 z-10">
            <Card className="w-full max-w-lg mx-4 shadow-elevated border-border/80">
              <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Lock className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Your Full Action Plan is Ready</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get the complete Kill/Fix/Scale roadmap, campaign structure fixes, and creative recommendations.
                  </p>
                </div>
                <div className="w-full text-left space-y-2">
                  {[
                    "Complete Kill / Fix / Scale lists with reasoning",
                    "Campaign structure & funnel audit details",
                    "Creative fatigue analysis & test recommendations",
                    "Per-ad optimization roadmap",
                    "30-min Strategy Call with Urban Media",
                    "Custom scaling plan for your niche",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <Button className="w-full gap-2 bg-primary text-primary-foreground h-12 text-base font-semibold">
                  <Calendar className="h-5 w-5" />
                  Unlock Full Plan + Book Strategy Call — ₹999
                </Button>
                <p className="text-xs text-muted-foreground">
                  One-time payment • Instant report unlock • Call at your convenience
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  By Urban Media — Performance Marketing Agency for D2C Brands
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Missing Data */}
      {audit.missing_data && (audit.missing_data.critical_missing_fields.length > 0 || audit.missing_data.important_missing_fields.length > 0) && (
        <FadeIn delay={0.5}>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader><CardTitle className="text-amber-700 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Missing Data Warnings</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {audit.missing_data.critical_missing_fields.length > 0 && (
                <div><h4 className="text-sm font-semibold text-destructive mb-1">Critical Missing Fields</h4><div className="flex flex-wrap gap-1">{audit.missing_data.critical_missing_fields.map((f, i) => <Badge key={i} variant="destructive" className="text-xs">{f}</Badge>)}</div></div>
              )}
              {audit.missing_data.important_missing_fields.length > 0 && (
                <div><h4 className="text-sm font-semibold text-amber-700 mb-1">Important Missing Fields</h4><div className="flex flex-wrap gap-1">{audit.missing_data.important_missing_fields.map((f, i) => <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>)}</div></div>
              )}
              {audit.missing_data.recommended_next_export_columns.length > 0 && (
                <div><h4 className="text-sm font-semibold mb-1">Recommended Next Export</h4><div className="flex flex-wrap gap-1">{audit.missing_data.recommended_next_export_columns.map((c, i) => <Badge key={i} variant="outline" className="text-xs">{c}</Badge>)}</div></div>
              )}
              <p className="text-sm text-muted-foreground">{audit.missing_data.how_missing_data_affects_audit}</p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* WhatsApp Modal */}
      <Dialog open={whatsappModalOpen} onOpenChange={setWhatsappModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle>Send Report to WhatsApp</DialogTitle>
            <DialogDescription>
              Get a concise summary of your audit delivered straight to your WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">WhatsApp Number</label>
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You&apos;ll also receive D2C scaling tips from Urban Media.
              </p>
            </div>
            <Button
              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                if (!whatsappNumber.trim()) {
                  toast.error("Please enter a WhatsApp number");
                  return;
                }
                const summary = `📊 *AdFix Audit Summary*\n\n🏥 Health Score: ${audit.account_summary.health_score}/100\n💸 Waste: ${audit.account_summary.waste_percentage.toFixed(1)}% (₹${audit.account_summary.wasted_budget.toLocaleString("en-IN")})\n🎯 Top Action: ${audit.priority_actions[0]?.action || "Review your account"}\n\n_View full report: ${typeof window !== "undefined" ? window.location.href : ""}_`;
                const encoded = encodeURIComponent(summary);
                const cleanNumber = whatsappNumber.replace(/\D/g, "");
                window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, "_blank");
                setWhatsappModalOpen(false);
                toast.success("Report summary sent to WhatsApp!");
              }}
            >
              <Send className="h-4 w-4" /> Send Summary
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
