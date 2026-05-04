"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import { getAuditById } from "@/lib/data";
import type { AuditReport } from "@/lib/types";
import {
  WasteDistributionChart,
  CpaComparisonChart,
  ClassificationBarChart,
  CircularScore,
} from "@/components/report-charts";
import { ClassificationTable } from "@/components/classification-table";
import { ArrowLeft, TrendingDown, AlertTriangle, TrendingUp, MinusCircle, HelpCircle, Lock, Eye, Clock } from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/animations";
import { PDFExportButton } from "@/components/pdf-report";

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [audit, setAudit] = useState<AuditReport | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/dashboard/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (params.id) setAudit(getAuditById(params.id as string));
  }, [params.id]);

  const handleExportPDF = useCallback(() => {
    if (user?.plan !== "detailed") { toast.error("PDF export requires Detailed tier."); return; }
  }, [user?.plan]);

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

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <FadeIn>
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/dashboard/audits")} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
          {isDetailed ? <PDFExportButton report={audit} /> : <Button variant="outline" onClick={handleExportPDF} className="gap-2"><Lock className="h-4 w-4" /> Export PDF</Button>}
        </div>
      </FadeIn>

      {/* Audit name + health */}
      <div className="grid md:grid-cols-3 gap-6">
        <FadeIn delay={0.1} className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{audit.name}</h1>
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
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

      {/* Scale Opportunities */}
      {audit.scale_opportunities.length > 0 && (
        <FadeIn delay={0.41}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" /> Scale Opportunities ({audit.scale_opportunities.length})</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {audit.scale_opportunities.map((opp, i) => (
                <Card key={i} className="bg-emerald-500/5 border-emerald-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{opp.ad_name}</span>
                      <Badge className="bg-emerald-500">{opp.purchases} purchases · {opp.scale_level}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div><span className="text-muted-foreground">CPA</span><div className="font-medium">{opp.cpa !== null ? `₹${opp.cpa.toFixed(0)}` : "—"}</div></div>
                      <div><span className="text-muted-foreground">ROAS</span><div className="font-medium">{opp.roas !== null ? `${opp.roas.toFixed(2)}×` : "—"}</div></div>
                      <div><span className="text-muted-foreground">Budget Action</span><div className="font-medium">{opp.budget_increase_pct}</div></div>
                      <div><span className="text-muted-foreground">Confidence</span><div className="font-medium">{opp.confidence}</div></div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{opp.why_scale}</p>
                    <p className="text-sm font-medium text-emerald-700">{opp.what_to_do_next}</p>
                    {opp.warnings.length > 0 && <p className="text-xs text-amber-600 mt-2">⚠ {opp.warnings.join(" ")}</p>}
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
              {audit.fix_opportunities.map((fix, i) => (
                <Card key={i} className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{fix.ad_name}</span>
                      <Badge className="bg-amber-500 capitalize">{fix.issue_type.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{fix.diagnosis}</p>
                    <div className="flex flex-col gap-1">
                      {fix.recommended_fix.map((rec, j) => <p key={j} className="text-sm">• {rec}</p>)}
                    </div>
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
              {audit.kill_recommendations.map((kill, i) => (
                <Card key={i} className="bg-red-500/5 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{kill.ad_name}</span>
                      <Badge variant="destructive">Spend: ₹{kill.spend.toLocaleString("en-IN")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{kill.reason}</p>
                    <p className="text-sm font-medium text-red-700">{kill.action}</p>
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
              {audit.campaign_structure_audit.issues_found.length > 0 && (
                <div><h4 className="text-sm font-semibold mb-2">Issues Found</h4><div className="flex flex-col gap-1">{audit.campaign_structure_audit.issues_found.map((issue, i) => <p key={i} className="text-sm text-destructive">• {issue}</p>)}</div></div>
              )}
              {audit.campaign_structure_audit.recommendations.length > 0 && (
                <div><h4 className="text-sm font-semibold mb-2">Recommendations</h4><div className="flex flex-col gap-1">{audit.campaign_structure_audit.recommendations.map((rec, i) => <p key={i} className="text-sm">• {rec}</p>)}</div></div>
              )}
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
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span className="text-sm">Fatigue: {audit.creative_audit.fatigue_detected ? "Detected" : "Not detected"}</span><span className="text-xs text-muted-foreground">({audit.creative_audit.fatigue_confidence})</span></div>
              {audit.creative_audit.creative_issues.length > 0 && <div><h4 className="text-sm font-semibold mb-1">Issues</h4>{audit.creative_audit.creative_issues.map((issue, i) => <p key={i} className="text-sm text-destructive">• {issue}</p>)}</div>}
              {audit.creative_audit.creative_tests_to_launch.length > 0 && <div><h4 className="text-sm font-semibold mb-1">Tests to Launch</h4>{audit.creative_audit.creative_tests_to_launch.map((test, i) => <p key={i} className="text-sm">• {test}</p>)}</div>}
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
              {audit.funnel_audit.funnel_metrics_available && Object.entries(audit.funnel_audit.metrics).filter(([, v]) => v !== null).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm"><span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span><span className="font-medium">{(value as number).toFixed(2)}%</span></div>
              ))}
              {audit.funnel_audit.issues_found.length > 0 && <div><h4 className="text-sm font-semibold mb-1">Issues</h4>{audit.funnel_audit.issues_found.map((issue, i) => <p key={i} className="text-sm text-destructive">• {issue}</p>)}</div>}
              {audit.funnel_audit.recommendations.length > 0 && <div><h4 className="text-sm font-semibold mb-1">Recommendations</h4>{audit.funnel_audit.recommendations.map((rec, i) => <p key={i} className="text-sm">• {rec}</p>)}</div>}
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
              {audit.tracking_audit.possible_tracking_issues.length > 0 && <div><h4 className="text-sm font-semibold mb-1">Possible Issues</h4>{audit.tracking_audit.possible_tracking_issues.map((issue, i) => <p key={i} className="text-sm text-destructive">• {issue}</p>)}</div>}
              {audit.tracking_audit.recommendations.length > 0 && <div><h4 className="text-sm font-semibold mb-1">Recommendations</h4>{audit.tracking_audit.recommendations.map((rec, i) => <p key={i} className="text-sm">• {rec}</p>)}</div>}
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Ad-Level Table */}
      <FadeIn delay={0.48}>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start flex-wrap">
            <TabsTrigger value="all">All ({allAds.length})</TabsTrigger>
            <TabsTrigger value="scale">Scale ({scaleAds.length})</TabsTrigger>
            <TabsTrigger value="fix">Fix ({fixAds.length})</TabsTrigger>
            <TabsTrigger value="kill">Kill ({killAds.length})</TabsTrigger>
            <TabsTrigger value="watch">Watch ({watchAds.length})</TabsTrigger>
            <TabsTrigger value="noaction">No Action ({noActionAds.length})</TabsTrigger>
            <TabsTrigger value="insufficient">Insufficient ({insufficientAds.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all"><Card><ScrollArea className="h-[400px]"><ClassificationTable data={allAds} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
          <TabsContent value="scale"><Card><ScrollArea className="h-[400px]"><ClassificationTable data={scaleAds} limit={3} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
          <TabsContent value="fix"><Card><ScrollArea className="h-[400px]"><ClassificationTable data={fixAds} limit={3} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
          <TabsContent value="kill"><Card><ScrollArea className="h-[400px]"><ClassificationTable data={killAds} limit={3} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
          <TabsContent value="watch"><Card><ScrollArea className="h-[400px]"><ClassificationTable data={watchAds} limit={3} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
          <TabsContent value="noaction"><Card><ScrollArea className="h-[400px]"><ClassificationTable data={noActionAds} limit={3} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
          <TabsContent value="insufficient"><Card><ScrollArea className="h-[400px]"><ClassificationTable data={insufficientAds} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
        </Tabs>
      </FadeIn>

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
    </div>
  );
}
