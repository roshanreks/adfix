"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { getStoredAudits } from "@/lib/data";
import type { AuditReport } from "@/lib/types";
import {
  ArrowRight, BarChart3, TrendingDown, AlertTriangle, TrendingUp,
  MinusCircle, ClipboardList, Sparkles, FileText, IndianRupee, Zap,
} from "lucide-react";
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
                // Preserve DB id and createdAt if report JSON has different ones
                parsed.id = a.id;
                parsed.createdAt = a.createdAt;
                dbAudits.push(parsed);
              }
            }
          }
          // Sort by createdAt desc
          dbAudits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAudits(dbAudits);
        })
        .catch(() => {
          setAudits(getStoredAudits());
        })
        .finally(() => setIsFetching(false));
    }
  }, [isLoading, user]);

  const handleRunAudit = useCallback(() => {
    const event = new CustomEvent("open-audit-wizard");
    window.dispatchEvent(event);
  }, []);

  const latestAudit = audits[0];
  const totalAudits = audits.length;

  // Aggregate stats across all audits
  const totalSpendAnalyzed = audits.reduce((sum, a) => sum + (a.account_summary?.total_spend || 0), 0);
  const totalWasteIdentified = audits.reduce((sum, a) => sum + (a.account_summary?.wasted_budget || 0), 0);

  const avgHealthScore = totalAudits > 0
    ? Math.round(audits.reduce((sum, a) => sum + (a.account_summary?.health_score || 0), 0) / totalAudits)
    : 0;

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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-base text-muted-foreground mt-1">Welcome back, {user.name}</p>
          </div>
          <Badge className="bg-primary/10 text-primary gap-1.5 px-3 py-1.5 font-semibold border-none text-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {planLabel}
          </Badge>
        </div>
      </FadeIn>

      {/* Run Audit CTA */}
      <FadeIn delay={0.1}>
        <Card className="bg-card border-border shadow-elevated overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 pointer-events-none" />
          <CardContent className="p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Run a New Audit</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your Meta Ads CSV and get a deterministic classification report.
              </p>
            </div>
            <Button
              onClick={handleRunAudit}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-lg press-scale shrink-0 w-full sm:w-auto h-12 sm:h-12 px-5 rounded-lg font-semibold text-base touch-manipulation"
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
              Run Audit <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </FadeIn>

      {totalAudits === 0 ? (
        <FadeIn delay={0.2}>
          <Card className="border-dashed border-2 border-border bg-card shadow-ambient">
            <CardContent className="p-8 sm:p-16 flex flex-col items-center text-center gap-5">
              <ClipboardList className="h-14 sm:h-16 w-14 sm:w-16 text-muted-foreground/60" aria-hidden="true" />
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Run Your First Audit</h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                Upload your Meta Ads Manager CSV to get started. We support standard export formats.
              </p>
              <Button onClick={handleRunAudit} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 press-scale h-12 px-6 rounded-lg font-semibold text-base w-full sm:w-auto touch-manipulation">
                <FileText className="h-5 w-5" aria-hidden="true" /> Run First Audit
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <>
          {/* Aggregate stats */}
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="shadow-ambient border-border hover:shadow-ambient-hover transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground">Total Audits</span>
                  </div>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter target={totalAudits} />
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-ambient border-border hover:shadow-ambient-hover transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <IndianRupee className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground">Spend Analyzed</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ₹<AnimatedCounter target={Math.round(totalSpendAnalyzed / 1000)} suffix="K" />
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-ambient border-border hover:shadow-ambient-hover transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-4 w-4 text-destructive" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground">Waste Found</span>
                  </div>
                  <p className="text-2xl font-bold text-destructive">
                    ₹<AnimatedCounter target={Math.round(totalWasteIdentified / 1000)} suffix="K" />
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-ambient border-border hover:shadow-ambient-hover transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-amber-500" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground">Avg Health Score</span>
                  </div>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter target={avgHealthScore} suffix="/100" />
                  </p>
                </CardContent>
              </Card>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-6">
              {latestAudit && (
                <FadeIn delay={0.2}>
                  <Card className="shadow-ambient border-border hover:shadow-ambient-hover transition-shadow duration-300">
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
                      <Progress value={latestAudit.account_summary.health_score} className="h-2" />
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="text-xs text-muted-foreground">Wasted Budget</div>
                          <div className="text-lg font-semibold">
                            ₹{latestAudit.account_summary.wasted_budget.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="text-xs text-muted-foreground">Actions Required</div>
                            <div className="text-lg font-semibold">{latestAudit.account_summary.actions_required}</div>
                        </div>
                      </div>
                      <Link href={`/dashboard/audits/${latestAudit.id}`}>
                        <Button variant="outline" className="w-full gap-2">
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
                <Card className="shadow-ambient border-border">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <span className="font-semibold text-sm">Latest Classifications</span>
              {latestAudit && latestAudit.account_summary && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-destructive">
                            <TrendingDown className="h-4 w-4" aria-hidden="true" /> Kill
                          </span>
                          <span className="font-semibold">{latestAudit.classification_breakdown.kill.count}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-amber-500">
                            <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Fix
                          </span>
                          <span className="font-semibold">{latestAudit.classification_breakdown.fix.count}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-emerald-500">
                            <TrendingUp className="h-4 w-4" aria-hidden="true" /> Scale
                          </span>
                          <span className="font-semibold">{latestAudit.classification_breakdown.scale.count}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <MinusCircle className="h-4 w-4" aria-hidden="true" /> No Action
                          </span>
                          <span className="font-semibold">{latestAudit.classification_breakdown.no_action.count}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.3}>
                <Card className="shadow-ambient border-border">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium mb-3">All Audits</p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {audits.filter(a => a.account_summary).map((a) => {
                const hl = a.account_summary.health_label;
                const hs = a.account_summary.health_score;
                return (
                  <Link
                    key={a.id}
                    href={`/dashboard/audits/${a.id}`}
                    className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="truncate text-muted-foreground max-w-[120px]">{a.name}</span>
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
                      <Button variant="ghost" size="sm" className="w-full mt-3 gap-1 text-xs">
                        View All <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
