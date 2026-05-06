"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import type { AuditReport } from "@/lib/types";
import {
  ArrowRight, BarChart3, TrendingDown, AlertTriangle, TrendingUp,
  MinusCircle, ClipboardList, Sparkles, FileText, IndianRupee, Zap,
  ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react";
import { ExpertAuditCard } from "@/components/expert-audit-card";
import { ScaleTeaser } from "@/components/scale-teaser";
import { FadeIn, AnimatedCounter, SkeletonCard, SkeletonStats } from "@/components/animations";

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

/* Simple sparkline using CSS — no heavy chart library needed */
function MiniSparkline({ data, color = "var(--primary)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-8 opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  prefix = "",
  colorClass = "text-foreground",
  trend,
  trendUp,
  sparklineData,
  sparklineColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  colorClass?: string;
  trend?: string;
  trendUp?: boolean;
  sparklineData?: number[];
  sparklineColor?: string;
}) {
  return (
    <Card className="relative overflow-hidden border-border hover:shadow-ambient-hover transition-all duration-300 group">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </div>
          {trend && (
            <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${trendUp ? "text-emerald-500" : "text-destructive"}`}>
              {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend}
            </span>
          )}
        </div>
        <p className={`text-2xl sm:text-[28px] font-bold ${colorClass}`}>
          {prefix}<AnimatedCounter target={value} suffix={suffix} />
        </p>
        {sparklineData && (
          <div className="mt-2">
            <MiniSparkline data={sparklineData} color={sparklineColor} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardHome() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/dashboard/login");
    }
  }, [user, isLoading, router]);

  // Onboarding safety net: redirect if not completed
  useEffect(() => {
    if (user && user.onboardingComplete === false) {
      router.push("/onboarding");
    }
  }, [user, router]);

  useEffect(() => {
    if (!isLoading && user) {
      setIsFetching(true);
      fetch("/api/audits", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          const dbAudits: AuditReport[] = [];
          if (data.audits) {
            for (const a of data.audits) {
              const parsed = parseReportJson(a.reportJson);
              if (parsed) {
                parsed.id = a.id;
                parsed.createdAt = a.createdAt;
                dbAudits.push(parsed);
              }
            }
          }
          dbAudits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAudits(dbAudits);
        })
        .catch(() => setAudits([]))
        .finally(() => setIsFetching(false));
    }
  }, [isLoading, user]);

  const handleRunAudit = useCallback(() => {
    const event = new CustomEvent("open-audit-wizard");
    window.dispatchEvent(event);
  }, []);

  const latestAudit = audits[0];
  const totalAudits = audits.length;

  const totalSpendAnalyzed = audits.reduce((sum, a) => sum + (a.account_summary?.total_spend || 0), 0);
  const totalWasteIdentified = audits.reduce((sum, a) => sum + (a.account_summary?.wasted_budget || 0), 0);

  const avgHealthScore = totalAudits > 0
    ? Math.round(audits.reduce((sum, a) => sum + (a.account_summary?.health_score || 0), 0) / totalAudits)
    : 0;

  // Generate fake sparkline data from audit health scores (or fallback)
  const healthSparkline = audits.length > 1
    ? audits.slice(0, 10).reverse().map(a => a.account_summary?.health_score || 50)
    : [45, 52, 48, 60, 55, 62, 58, 65, 70, 68];

  const planLabel =
    user?.plan === "detailed" ? "Detailed Plan" :
    user?.plan === "basic" ? "Basic Plan" : "Free Plan";

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto" aria-busy="true">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded-md w-40 animate-pulse" />
            <div className="h-4 bg-muted rounded-md w-56 animate-pulse" />
          </div>
          <div className="h-8 bg-muted rounded-md w-32 animate-pulse" />
        </div>
        <SkeletonCard />
        <SkeletonStats />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-6xl mx-auto">
      <FadeIn>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">AdFix Dashboard</h1>
            <p className="text-base text-muted-foreground mt-1">Welcome back, {user.name}. Ready to find wasted spend?</p>
          </div>
          <Badge className="bg-primary/10 text-primary gap-1.5 px-3 py-1.5 font-semibold border-none text-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {planLabel}
          </Badge>
        </div>
      </FadeIn>

      {/* Run Audit CTA */}
      <FadeIn delay={0.1}>
        <Card className="bg-card border-border shadow-depth overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-60 pointer-events-none" />
          {/* Animated shimmer on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
          <CardContent className="p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Run a Free Audit</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your Meta Ads CSV and get clear Kill, Fix, Scale, or No Action recommendations.
              </p>
            </div>
            <Button
              onClick={handleRunAudit}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-glow-sm shrink-0 w-full sm:w-auto h-12 px-5 rounded-xl font-semibold text-base touch-manipulation"
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
              Start Free Audit <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </FadeIn>

      {totalAudits === 0 ? (
        <FadeIn delay={0.2}>
          <Card className="border-dashed border-2 border-border bg-card shadow-ambient hover:shadow-ambient-hover transition-shadow">
            <CardContent className="p-8 sm:p-16 flex flex-col items-center text-center gap-5">
              <div className="animate-float-slow">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-[#a855f7]/10 flex items-center justify-center">
                  <ClipboardList className="h-10 w-10 text-primary/70" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Run Your First Free Audit</h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                Upload a Meta Ads Manager CSV to see where budget is working, leaking, or ready to scale.
              </p>
              <Button onClick={handleRunAudit} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-6 rounded-xl font-semibold text-base w-full sm:w-auto touch-manipulation shadow-glow-sm">
                <FileText className="h-5 w-5" aria-hidden="true" /> Start First Audit
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <>
          {/* Aggregate stats */}
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={BarChart3}
                label="Total Audits"
                value={totalAudits}
                trend="+12%"
                trendUp={true}
                sparklineData={[1, 2, 2, 3, 3, 4, 4, 5, 6, totalAudits]}
                sparklineColor="var(--primary)"
              />
              <StatCard
                icon={IndianRupee}
                label="Spend Analyzed"
                value={Math.round(totalSpendAnalyzed / 1000)}
                suffix="K"
                trend="+8%"
                trendUp={true}
                sparklineData={[12, 18, 22, 28, 32, 38, 45, 52, 58, Math.max(10, Math.round(totalSpendAnalyzed / 1000))]}
                sparklineColor="var(--primary)"
              />
              <StatCard
                icon={TrendingDown}
                label="Wasted Spend Found"
                value={Math.round(totalWasteIdentified / 1000)}
                suffix="K"
                colorClass="text-destructive"
                trend="-5%"
                trendUp={false}
                sparklineData={[15, 14, 16, 13, 12, 14, 11, 10, 9, Math.max(1, Math.round(totalWasteIdentified / 1000))]}
                sparklineColor="var(--destructive)"
              />
              <StatCard
                icon={Activity}
                label="Avg Health Score"
                value={avgHealthScore}
                suffix="/100"
                trend={avgHealthScore > 50 ? "+3%" : "-2%"}
                trendUp={avgHealthScore > 50}
                sparklineData={healthSparkline}
                sparklineColor={avgHealthScore > 60 ? "var(--emerald-500, #10b981)" : "var(--amber-500, #f59e0b)"}
              />
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-6">
              {latestAudit && (
                <FadeIn delay={0.2}>
                  <Card className="shadow-depth border-border hover:shadow-depth-lg transition-all duration-300 group overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Latest Audit</CardTitle>
                        <Badge
                          variant={
                            latestAudit.account_summary.health_label === "Excellent" || latestAudit.account_summary.health_label === "Good" || latestAudit.account_summary.health_label === "Elite"
                              ? "default"
                              : latestAudit.account_summary.health_label === "Average"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {latestAudit.account_summary.health_label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{latestAudit.name}</p>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Health Score</span>
                        <span className="font-bold text-lg">
                          <AnimatedCounter target={latestAudit.account_summary.health_score} duration={1.5} />/100
                        </span>
                      </div>
                      <Progress value={latestAudit.account_summary.health_score} className="h-2.5 rounded-full" />
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                          <div className="text-xs text-muted-foreground mb-1">Wasted Budget</div>
                          <div className="text-lg font-semibold">
                            ₹{latestAudit.account_summary.wasted_budget.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                          <div className="text-xs text-muted-foreground mb-1">Actions Required</div>
                          <div className="text-lg font-semibold">{latestAudit.account_summary.actions_required}</div>
                        </div>
                      </div>
                      <Link href={`/dashboard/audits/${latestAudit.id}`}>
                        <Button variant="outline" className="w-full gap-2 rounded-xl">
                          View Report <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <FadeIn delay={0.25}>
                <Card className="shadow-depth border-border hover:shadow-depth-lg transition-all duration-300">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <span className="font-semibold text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Latest Classifications
                    </span>
                    {latestAudit && latestAudit.account_summary && (
                      <>
                        <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="flex items-center gap-2 text-destructive">
                            <TrendingDown className="h-4 w-4" aria-hidden="true" /> Kill
                          </span>
                          <span className="font-semibold bg-destructive/10 px-2 py-0.5 rounded-md text-xs">{latestAudit.classification_breakdown.kill.count}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="flex items-center gap-2 text-amber-500">
                            <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Fix
                          </span>
                          <span className="font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md text-xs">{latestAudit.classification_breakdown.fix.count}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="flex items-center gap-2 text-emerald-500">
                            <TrendingUp className="h-4 w-4" aria-hidden="true" /> Scale
                          </span>
                          <span className="font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md text-xs">{latestAudit.classification_breakdown.scale.count}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <MinusCircle className="h-4 w-4" aria-hidden="true" /> No Action
                          </span>
                          <span className="font-semibold bg-muted px-2 py-0.5 rounded-md text-xs">{latestAudit.classification_breakdown.no_action.count}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.3}>
                <Card className="shadow-depth border-border hover:shadow-depth-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      Audit History
                    </p>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                      {audits.filter(a => a.account_summary).map((a) => {
                        const hl = a.account_summary.health_label;
                        const hs = a.account_summary.health_score;
                        return (
                          <Link
                            key={a.id}
                            href={`/dashboard/audits/${a.id}`}
                            className="flex items-center justify-between text-xs p-2.5 rounded-lg hover:bg-muted transition-colors group"
                          >
                            <span className="truncate text-muted-foreground max-w-[120px] group-hover:text-foreground transition-colors">{a.name}</span>
                            <Badge
                              variant={
                                hl === "Excellent" || hl === "Good" || hl === "Elite"
                                  ? "default"
                                  : hl === "Average"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-[10px] shrink-0"
                            >
                              {hs}
                            </Badge>
                          </Link>
                        );
                      })}
                    </div>
                    <Link href="/dashboard/audits">
                      <Button variant="ghost" size="sm" className="w-full mt-3 gap-1 text-xs rounded-lg">
                        View All <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>

          {/* Expert Audit Upsell */}
          <FadeIn delay={0.35}>
            <ExpertAuditCard />
          </FadeIn>

          {/* Scale Teaser */}
          <FadeIn delay={0.4}>
            <ScaleTeaser variant="banner" />
          </FadeIn>
        </>
      )}
    </div>
  );
}
