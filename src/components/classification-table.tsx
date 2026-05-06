"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { AdAuditResult } from "@/lib/types";
import { verdictColor, verdictLabel } from "@/lib/utils";

interface ClassificationTableProps {
  data: AdAuditResult[];
  limit?: number;
  isDetailed: boolean;
}

export const ClassificationTable = memo(function ClassificationTable({
  data,
  limit,
  isDetailed,
}: ClassificationTableProps) {
  const displayData = limit && !isDetailed ? data.slice(0, limit) : data;

  if (displayData.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">No ads in this category.</p>
      </div>
    );
  }

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
