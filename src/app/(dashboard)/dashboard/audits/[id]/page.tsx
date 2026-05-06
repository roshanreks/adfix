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

import { toast } from "sonner";
import type { AuditReport } from "@/lib/types";
import {
  WasteDistributionChart,
  CpaComparisonChart,
  ClassificationBarChart,
  CircularScore,
} from "@/components/report-charts";
import { ClassificationTable } from "@/components/classification-table";
import { ArrowLeft, TrendingDown, AlertTriangle, TrendingUp, HelpCircle, Eye, ArrowUp, Check, MessageSquare, Send, Star, Loader2, Calendar, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/animations";
import { PDFExportButton } from "@/components/pdf-report";

function parseReportJson(reportJson: unknown): AuditReport | null {
  if (!reportJson) return null;
  if (typeof reportJson === "string") {
    try {
      return JSON.parse(reportJson);
    } catch {
      return null;
    }
  }
  if (typeof reportJson === "object") {
    return reportJson as AuditReport;
  }
  return null;
}

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: { color: string };
  handler: (response: RazorpayCheckoutResponse) => Promise<void>;
  modal: {
    ondismiss: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance;

type WindowWithRazorpay = Window & {
  Razorpay?: RazorpayConstructor;
};

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [paidBooking, setPaidBooking] = useState<{ paymentId: string | null; calendlyLink: string | null; createdAt: Date } | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/dashboard/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/audits/${params.id}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.audit?.reportJson) {
            const parsed = parseReportJson(data.audit.reportJson);
            if (parsed) {
              parsed.id = data.audit.id;
              parsed.createdAt = data.audit.createdAt;
              setAudit(parsed);
            } else {
              setAudit(null);
            }
          } else {
            setAudit(null);
          }
        })
        .catch(() => {
          setAudit(null);
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

  // Check if user has already paid for funnel audit
  useEffect(() => {
    if (user && params.id) {
      fetch(`/api/payments/status?auditId=${params.id}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.hasPaid) {
            setHasPaid(true);
            setPaidBooking(data.booking);
          }
        })
        .catch(() => {});
    }
  }, [user, params.id]);

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as WindowWithRazorpay).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const handlePay = useCallback(async () => {
    if (!user?.id) {
      toast.error("Please sign in to book");
      return;
    }
    setPaymentLoading(true);
    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      // Create order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ auditId: params.id }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        if (orderRes.status === 409 && orderData.booking) {
          setHasPaid(true);
          setPaidBooking(orderData.booking);
          toast.info("You already have a paid booking");
          return;
        }
        toast.error(orderData.error || "Failed to create order");
        return;
      }

      // Open Razorpay checkout
      const Razorpay = (window as WindowWithRazorpay).Razorpay;
      if (!Razorpay) {
        toast.error("Payment gateway is unavailable");
        return;
      }

      const rzp = new Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Urban Media — AdFix",
        description: "AI + Human Full Funnel Audit",
        order_id: orderData.orderId,
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: { color: "#6D28D9" },
        handler: async function (response: RazorpayCheckoutResponse) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: orderData.bookingId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setHasPaid(true);
              setPaidBooking(verifyData.booking);
              setShowSuccessDialog(true);
              toast.success("Payment successful! Book your call now.");
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch {
            toast.error("Payment verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled. You can try again anytime.");
          },
        },
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  }, [user, params.id, loadRazorpayScript]);

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
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/audits")} className="gap-1.5 h-10 px-3 shrink-0 min-h-[44px]">
                <ArrowLeft className="h-4 w-4" />
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
              <Button variant="ghost" size="sm" onClick={scrollToTop} className="h-10 w-10 p-0 min-h-[44px] min-w-[44px]" aria-label="Scroll to top">
                <ArrowUp className="h-4 w-4" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
              <div className="p-3 rounded-lg bg-destructive/10 text-center"><div className="text-xs text-muted-foreground">Total Wasted</div><div className="text-base sm:text-lg font-semibold text-destructive">₹{audit.waste_breakdown.total_wasted_budget.toLocaleString("en-IN")}</div></div>
              <div className="p-3 rounded-lg bg-red-500/10 text-center"><div className="text-xs text-muted-foreground">Hard Waste</div><div className="text-base sm:text-lg font-semibold text-red-500">₹{audit.waste_breakdown.hard_waste.toLocaleString("en-IN")}</div></div>
              <div className="p-3 rounded-lg bg-amber-500/10 text-center"><div className="text-xs text-muted-foreground">CPA Waste</div><div className="text-base sm:text-lg font-semibold text-amber-500">₹{audit.waste_breakdown.cpa_waste.toLocaleString("en-IN")}</div></div>
              <div className="p-3 rounded-lg bg-orange-500/10 text-center"><div className="text-xs text-muted-foreground">ROAS Waste</div><div className="text-base sm:text-lg font-semibold text-orange-500">₹{audit.waste_breakdown.roas_waste.toLocaleString("en-IN")}</div></div>
              <div className="p-3 rounded-lg bg-emerald-500/10 text-center"><div className="text-xs text-muted-foreground">Efficient</div><div className="text-base sm:text-lg font-semibold text-emerald-500">₹{audit.account_summary.efficient_spend.toLocaleString("en-IN")}</div></div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
              <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Avg CPA</div><div className="text-base sm:text-lg font-semibold">₹{audit.benchmarks.avg_cpa.toFixed(0)}</div></div>
              <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Avg ROAS</div><div className="text-base sm:text-lg font-semibold">{audit.benchmarks.avg_roas.toFixed(2)}×</div></div>
              <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Avg CTR</div><div className="text-base sm:text-lg font-semibold">{audit.benchmarks.avg_ctr.toFixed(2)}%</div></div>
              <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Avg CPC</div><div className="text-base sm:text-lg font-semibold">₹{audit.benchmarks.avg_cpc.toFixed(2)}</div></div>
              <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Avg CPM</div><div className="text-base sm:text-lg font-semibold">₹{audit.benchmarks.avg_cpm.toFixed(0)}</div></div>
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="font-semibold truncate">{opp.ad_name}</span>
                      <Badge className="bg-emerald-500 w-fit">{opp.purchases} purchases · {opp.scale_level}</Badge>
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
              {audit.fix_opportunities.map((fix, i) => (
                <Card key={i} className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="font-semibold truncate">{fix.ad_name}</span>
                      <Badge className="bg-amber-500 capitalize w-fit">{fix.issue_type.replace("_", " ")}</Badge>
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
              {audit.kill_recommendations.map((kill, i) => (
                <Card key={i} className="bg-red-500/5 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="font-semibold truncate">{kill.ad_name}</span>
                      <Badge variant="destructive" className="w-fit">Spend: ₹{kill.spend.toLocaleString("en-IN")}</Badge>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Campaigns</div><div className="text-base sm:text-lg font-semibold">{audit.campaign_structure_audit.number_of_campaigns}</div></div>
                <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Ad Sets</div><div className="text-base sm:text-lg font-semibold">{audit.campaign_structure_audit.number_of_adsets}</div></div>
                <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Ads</div><div className="text-base sm:text-lg font-semibold">{audit.campaign_structure_audit.number_of_ads}</div></div>
                <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Ads/Ad Set</div><div className="text-base sm:text-lg font-semibold">{audit.campaign_structure_audit.avg_ads_per_adset}</div></div>
                <div className="p-3 rounded-lg bg-muted/50 text-center"><div className="text-xs text-muted-foreground">Fragmentation</div><div className="text-base sm:text-lg font-semibold">{audit.campaign_structure_audit.budget_fragmentation_score}%</div></div>
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
          <TabsContent value="scale"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={scaleAds} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
          <TabsContent value="fix"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={fixAds} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
          <TabsContent value="kill"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={killAds} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
          <TabsContent value="watch"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={watchAds} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
          <TabsContent value="noaction"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={noActionAds} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
          <TabsContent value="insufficient"><Card><ScrollArea className="h-[50dvh] sm:h-[400px]"><ClassificationTable data={insufficientAds} isDetailed={isDetailed} /></ScrollArea></Card></TabsContent>
        </Tabs>
      </FadeIn>

      {/* ₹999 Full Funnel Audit CTA */}
      <FadeIn delay={0.52}>
        <Card className="border-primary/20 bg-primary/5 overflow-hidden">
          <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Want a Deeper Audit?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Our team of AI + Human experts will audit your entire funnel — Shopify store, Facebook Ads, Google Ads, landing pages, creatives, and offer.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Full Meta Ads account deep-dive",
                "Google Ads performance review",
                "Shopify store CRO & UX audit",
                "Landing page & funnel analysis",
                "Creative strategy & fatigue review",
                "30-min strategy call with our team",
                "Custom action plan delivered in 48 hours",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-white dark:bg-background border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">₹999</span>
                  <span className="text-sm text-muted-foreground">One-time</span>
                </div>
                <Badge variant="secondary" className="mt-1 gap-1">
                  <Star className="h-3 w-3" /> 100% Refund Guarantee — Not satisfied? Full refund, no questions asked.
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Our team will contact you within 24 hours on your registered WhatsApp number after payment.
                </p>
              </div>
              {hasPaid ? (
                <Button
                  className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-6 font-semibold"
                  onClick={() => setShowSuccessDialog(true)}
                >
                  <CheckCircle2 className="h-5 w-5" /> Paid — We&apos;ll Contact You
                </Button>
              ) : (
                <Button
                  className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground h-12 px-6 font-semibold"
                  onClick={handlePay}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    <><Calendar className="h-5 w-5" /> Pay ₹999 & Get Full Audit</>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Data Quality Tips */}
      {audit.missing_data && (audit.missing_data.critical_missing_fields.length > 0 || audit.missing_data.important_missing_fields.length > 0) && (
        <FadeIn delay={0.5}>
          <Card className="border-blue-200/60 bg-blue-50/40 dark:bg-blue-950/10">
            <CardHeader><CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Data Quality Tips</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Your audit ran successfully with the data provided. For even deeper insights next time, consider including these columns in your export:
              </p>
              {(audit.missing_data.critical_missing_fields.length > 0 || audit.missing_data.important_missing_fields.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {[...audit.missing_data.critical_missing_fields, ...audit.missing_data.important_missing_fields].map((f, i) => (
                    <span key={i} className="inline-flex items-center text-xs bg-white dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full text-blue-700 dark:text-blue-400">
                      {f}
                    </span>
                  ))}
                </div>
              )}
              {audit.missing_data.recommended_next_export_columns.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Columns that unlock deeper analysis:</h4>
                  <div className="flex flex-wrap gap-2">
                    {audit.missing_data.recommended_next_export_columns.map((c, i) => (
                      <span key={i} className="inline-flex items-center text-xs bg-muted/50 border border-border px-2.5 py-1 rounded-full text-muted-foreground">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Payment Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <DialogTitle>Payment Successful!</DialogTitle>
            <DialogDescription>
              Your ₹999 AI + Human Full Funnel Audit is confirmed. Our team will reach out to you shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold">₹999</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-mono text-xs">{paidBooking?.paymentId || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default" className="text-xs bg-emerald-500">Paid & Confirmed</Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800">
              <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium flex items-start gap-2">
                <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                Our team will contact you within 24 hours on your registered WhatsApp number.
              </p>
            </div>
            <Button
              className="w-full gap-2 bg-primary text-primary-foreground h-12 font-semibold"
              onClick={() => setShowSuccessDialog(false)}
            >
              <Check className="h-5 w-5" /> Got It
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              100% refund guarantee. Not satisfied? Full refund, no questions asked.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
