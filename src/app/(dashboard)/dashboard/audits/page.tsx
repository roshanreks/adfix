"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { deleteAudit } from "@/lib/data";
import type { AuditReport } from "@/lib/types";
import { ArrowRight, Trash2, BarChart3, FileText, Search, TrendingUp, TrendingDown, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { SkeletonCard } from "@/components/animations";

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

export default function AuditsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/dashboard/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user) {
      setIsFetching(true);
      fetch("/api/audits", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.audits) {
            const parsed = data.audits
              .map((a: { reportJson: unknown; id: string; createdAt: string }) => {
                const report = parseReportJson(a.reportJson);
                if (report) {
                  report.id = a.id;
                  report.createdAt = a.createdAt;
                }
                return report;
              })
              .filter(Boolean) as AuditReport[];
            setAudits(parsed);
          }
        })
        .catch(() => {
          console.log("API fetch failed, using localStorage fallback");
        })
        .finally(() => setIsFetching(false));
    }
  }, [isLoading, user]);

  const handleDelete = useCallback(async (id: string) => {
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/audits/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setAudits((prev) => prev.filter((a) => a.id !== id));
        toast.success("Audit deleted");
      } else {
        throw new Error();
      }
    } catch {
      // Fallback to localStorage
      deleteAudit(id);
      setAudits((prev) => prev.filter((a) => a.id !== id));
      toast.success("Audit deleted");
    } finally {
      setIsDeleting(null);
    }
  }, []);

  const filtered = audits.filter((a) =>
    search.trim() === "" ||
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpend = audits.reduce((s, a) => s + (a.account_summary?.total_spend || 0), 0);
  const totalWaste = audits.reduce((s, a) => s + (a.account_summary?.wasted_budget || 0), 0);

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto" aria-busy="true">
        <div className="h-8 bg-muted rounded-md w-40 animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-56 animate-pulse" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Your Audits</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {audits.length} audit{audits.length !== 1 ? "s" : ""}
            {totalSpend > 0 && ` · ₹${Math.round(totalSpend / 1000)}K analyzed · ₹${Math.round(totalWaste / 1000)}K waste`}
          </p>
        </div>
        <Button
          onClick={() => {
            const event = new CustomEvent("open-audit-wizard");
            window.dispatchEvent(event);
          }}
          className="bg-primary text-primary-foreground gap-2 shrink-0 h-12 px-5 font-semibold text-base touch-manipulation w-full sm:w-auto"
        >
          <FileText className="h-5 w-5" aria-hidden="true" /> <span className="hidden sm:inline">New Audit</span><span className="sm:hidden">New</span>
        </Button>
      </div>

      {audits.length === 0 ? (
        <Card className="border-dashed border-2 border-border/60 bg-muted/20">
          <CardContent className="p-8 sm:p-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold">No Audits Yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md">
              Run your first audit to see reports here. Upload a Meta Ads Manager CSV and get instant insights.
            </p>
            <Button
              onClick={() => {
                const event = new CustomEvent("open-audit-wizard");
                window.dispatchEvent(event);
              }}
              className="bg-primary text-primary-foreground gap-2 h-12 px-6 font-semibold text-base touch-manipulation w-full sm:w-auto press-scale"
            >
              <FileText className="h-5 w-5" aria-hidden="true" /> Run First Audit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search audits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
              aria-label="Search audits"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No audits match your search.</p>
            ) : (
              filtered.map((audit) => (
                <Card
                  key={audit.id}
                  className="hover:border-primary/40 hover:shadow-md transition-all duration-200 group"
                >
                  <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-semibold truncate">{audit.name}</h3>
                        <Badge
                          variant={
                            audit.account_summary.health_label === "Elite" || audit.account_summary.health_label === "Excellent" || audit.account_summary.health_label === "Good"
                              ? "default"
                              : audit.account_summary.health_label === "Average"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {audit.account_summary.health_label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(audit.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                        {audit.timeWindow && ` · ${audit.timeWindow}d window`}
                        {` · Score: ${audit.account_summary.health_score}/100`}
                      </p>
                      {/* Mini classification pills */}
                      <div className="flex flex-wrap gap-2">
                        {audit.classification_breakdown.kill.count > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                            <TrendingDown className="h-3 w-3" /> {audit.classification_breakdown.kill.count} Kill
                          </span>
                        )}
                        {audit.classification_breakdown.fix.count > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="h-3 w-3" /> {audit.classification_breakdown.fix.count} Fix
                          </span>
                        )}
                        {audit.classification_breakdown.scale.count > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <TrendingUp className="h-3 w-3" /> {audit.classification_breakdown.scale.count} Scale
                          </span>
                        )}
                        {audit.account_summary.wasted_budget > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ₹{audit.account_summary.wasted_budget.toLocaleString("en-IN")} waste
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/dashboard/audits/${audit.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 group-hover:border-primary/50 transition-colors"
                        >
                          View Report <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(audit.id)}
                        disabled={isDeleting === audit.id}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`Delete audit ${audit.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
