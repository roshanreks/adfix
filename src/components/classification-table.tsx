"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import type { AdAuditResult } from "@/lib/types";

interface ClassificationTableProps {
  data: AdAuditResult[];
  limit?: number;
  isDetailed: boolean;
}

function verdictColor(verdict: string): string {
  switch (verdict) {
    case "KILL": return "bg-red-500 text-white hover:bg-red-600";
    case "FIX": return "bg-amber-500 text-white hover:bg-amber-600";
    case "SCALE": return "bg-emerald-500 text-white hover:bg-emerald-600";
    case "WATCH": return "bg-yellow-500 text-black hover:bg-yellow-600";
    case "NO_ACTION": return "bg-gray-500 text-white hover:bg-gray-600";
    case "INSUFFICIENT_DATA": return "bg-gray-300 text-gray-700 hover:bg-gray-400";
    default: return "bg-gray-500 text-white";
  }
}

function verdictLabel(verdict: string): string {
  switch (verdict) {
    case "KILL": return "Kill";
    case "FIX": return "Fix";
    case "SCALE": return "Scale";
    case "WATCH": return "Watch";
    case "NO_ACTION": return "No Action";
    case "INSUFFICIENT_DATA": return "Insufficient Data";
    default: return verdict;
  }
}

export const ClassificationTable = memo(function ClassificationTable({
  data,
  limit,
  isDetailed,
}: ClassificationTableProps) {
  const displayData = limit && !isDetailed ? data.slice(0, limit) : data;

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead>Ad Name</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead className="text-right">Spend</TableHead>
            <TableHead className="text-right">Purchases</TableHead>
            <TableHead className="text-right">CPA</TableHead>
            <TableHead className="text-right">ROAS</TableHead>
            <TableHead className="text-right">CTR</TableHead>
            <TableHead>Verdict</TableHead>
            {isDetailed && <TableHead>Recommended Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((ad) => (
            <TableRow key={ad.ad_id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium max-w-[200px] truncate">{ad.ad_name}</TableCell>
              <TableCell className="max-w-[150px] truncate">{ad.campaign_name}</TableCell>
              <TableCell className="text-right">₹{ad.spend.toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-right">{ad.purchases}</TableCell>
              <TableCell className="text-right">{ad.cpa !== null ? `₹${ad.cpa.toFixed(0)}` : "—"}</TableCell>
              <TableCell className="text-right">{ad.roas !== null ? `${ad.roas.toFixed(2)}×` : "—"}</TableCell>
              <TableCell className="text-right">{ad.ctr !== null ? `${ad.ctr.toFixed(2)}%` : "—"}</TableCell>
              <TableCell><Badge className={verdictColor(ad.verdict)}>{verdictLabel(ad.verdict)}</Badge></TableCell>
              {isDetailed && <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{ad.recommended_action}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {limit && data.length > limit && !isDetailed && (
        <div className="p-8 text-center border-t border-dashed">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground mb-2">
            {data.length - limit} more items hidden
          </p>
          <Button variant="outline" size="sm" onClick={() => toast.info("Upgrade to Detailed tier to view all items")}>
            Upgrade to Detailed
          </Button>
        </div>
      )}
    </div>
  );
});
