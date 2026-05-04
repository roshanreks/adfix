"use client";

import { memo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import type { AuditReport } from "@/lib/types";

const COLORS = {
  kill: "#ef4444",
  fix: "#f59e0b",
  scale: "#10b981",
  watch: "#eab308",
  noAction: "#6b7280",
  insufficient: "#9ca3af",
};

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case "INR": return "₹";
    case "USD": return "$";
    case "AED": return "AED ";
    case "EUR": return "€";
    case "GBP": return "£";
    default: return "";
  }
}

export const WasteDistributionChart = memo(function WasteDistributionChart({
  report,
}: {
  report: AuditReport;
}) {
  const curr = getCurrencySymbol(report.currency);
  const data = [
    { name: "Hard Waste", value: report.waste_breakdown?.hard_waste || 0, color: COLORS.kill },
    { name: "CPA Waste", value: report.waste_breakdown?.cpa_waste || 0, color: COLORS.fix },
    { name: "ROAS Waste", value: report.waste_breakdown?.roas_waste || 0, color: "#f97316" },
    { name: "Creative Waste", value: report.waste_breakdown?.creative_waste || 0, color: "#8b5cf6" },
    { name: "Efficient", value: report.account_summary?.efficient_spend || 0, color: COLORS.scale },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${curr}${Number(value).toLocaleString("en-IN")}`, "Amount"]}
          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
});

export const ClassificationBarChart = memo(function ClassificationBarChart({
  report,
}: {
  report: AuditReport;
}) {
  const cb = report.classification_breakdown;
  const data = [
    { name: "Kill", count: cb?.kill.count || 0, color: COLORS.kill },
    { name: "Fix", count: cb?.fix.count || 0, color: COLORS.fix },
    { name: "Scale", count: cb?.scale.count || 0, color: COLORS.scale },
    { name: "Watch", count: cb?.watch.count || 0, color: COLORS.watch },
    { name: "No Action", count: cb?.no_action.count || 0, color: COLORS.noAction },
    { name: "Insufficient", count: cb?.insufficient_data.count || 0, color: COLORS.insufficient },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => [`${Number(value)} ads`, "Count"]}
          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

export const CpaComparisonChart = memo(function CpaComparisonChart({
  report,
}: {
  report: AuditReport;
}) {
  const curr = getCurrencySymbol(report.currency);
  const data = report.ad_level_audit
    .slice(0, 10)
    .map((c) => ({
      name: c.ad_name.slice(0, 20),
      cpa: c.cpa || 0,
      target: report.audit_metadata?.target_cpa || 0,
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => [`${curr}${Number(value).toFixed(0)}`, "CPA"]}
          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
        />
        <Bar dataKey="cpa" fill="#6d28d9" radius={[6, 6, 0, 0]} />
        <Bar dataKey="target" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});

export function CircularScore({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 85 ? "#10b981" : score >= 75 ? "#22c55e" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";

  let label = "";
  if (score >= 95) label = "Elite";
  else if (score >= 85) label = "Excellent";
  else if (score >= 75) label = "Good";
  else if (score >= 60) label = "Average";
  else if (score >= 40) label = "Poor";
  else label = "Critical";

  return (
    <div className="relative inline-flex flex-col items-center justify-center" style={{ width: size, height: size + 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <span className="absolute text-xl font-bold" style={{ color }}>{score}</span>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}
