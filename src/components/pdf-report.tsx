"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import type { AuditReport } from "@/lib/types";
import { Download } from "lucide-react";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20, borderBottom: "1px solid #E2E8F0", paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: "#0F172A", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#64748B" },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#0F172A", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#64748B" },
  value: { fontWeight: "bold", color: "#0F172A" },
  grid: { flexDirection: "row", gap: 10, marginBottom: 10 },
  card: { flex: 1, padding: 10, borderRadius: 6, backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" },
  cardValue: { fontSize: 16, fontWeight: "bold", color: "#0F172A", marginTop: 4 },
  tableHeader: { flexDirection: "row", backgroundColor: "#F1F5F9", padding: 6, borderRadius: 4, marginBottom: 4 },
  tableRow: { flexDirection: "row", padding: 6, borderBottom: "1px solid #F1F5F9" },
  cell: { flex: 1, fontSize: 9 },
  cellSmall: { flex: 0.6, fontSize: 9 },
  verdictKill: { color: "#EF4444", fontWeight: "bold" },
  verdictFix: { color: "#F59E0B", fontWeight: "bold" },
  verdictScale: { color: "#10B981", fontWeight: "bold" },
  verdictWatch: { color: "#EAB308", fontWeight: "bold" },
  verdictNone: { color: "#64748B" },
  verdictInsufficient: { color: "#9CA3AF" },
  footer: { marginTop: 20, borderTop: "1px solid #E2E8F0", paddingTop: 10, textAlign: "center", color: "#94A3B8", fontSize: 8 },
  text: { color: "#475569", lineHeight: 1.5, marginBottom: 4 },
});

function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case "KILL": return "#EF4444";
    case "FIX": return "#F59E0B";
    case "SCALE": return "#10B981";
    case "WATCH": return "#EAB308";
    case "NO_ACTION": return "#64748B";
    case "INSUFFICIENT_DATA": return "#9CA3AF";
    default: return "#64748B";
  }
}

function verdictLabel(verdict: string): string {
  switch (verdict) {
    case "KILL": return "Kill";
    case "FIX": return "Fix";
    case "SCALE": return "Scale";
    case "WATCH": return "Watch";
    case "NO_ACTION": return "No Action";
    case "INSUFFICIENT_DATA": return "Insufficient";
    default: return verdict;
  }
}

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

const AuditPDF = ({ report }: { report: AuditReport }) => {
  const curr = getCurrencySymbol(report.currency);
  const as = report.account_summary;
  const am = report.audit_metadata;
  const cb = report.classification_breakdown;
  const wb = report.waste_breakdown;
  const ai = report.ai_insight;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AdFix Audit Report</Text>
          <Text style={styles.subtitle}>{report.name} · {new Date(report.createdAt).toLocaleDateString("en-IN")} · Tier: {report.tier}</Text>
        </View>

        {/* Health & Confidence */}
        <View style={styles.section}>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.label}>Health Score</Text>
              <Text style={styles.cardValue}>{as.health_score}/100 — {as.health_label}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Confidence</Text>
              <Text style={styles.cardValue}>{am.confidence_score}% — {am.confidence_level}</Text>
            </View>
          </View>
        </View>

        {/* Account Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Summary</Text>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.label}>Total Spend</Text>
              <Text style={styles.cardValue}>{curr}{as.total_spend.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Revenue</Text>
              <Text style={styles.cardValue}>{curr}{as.total_revenue.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Purchases</Text>
              <Text style={styles.cardValue}>{as.total_purchases}</Text>
            </View>
          </View>
          <View style={styles.row}><Text style={styles.label}>Avg CPA</Text><Text style={styles.value}>{as.avg_cpa > 0 ? `${curr}${as.avg_cpa.toFixed(0)}` : "N/A"}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Avg ROAS</Text><Text style={styles.value}>{as.avg_roas > 0 ? `${as.avg_roas.toFixed(2)}×` : "N/A"}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Avg CTR</Text><Text style={styles.value}>{as.avg_ctr > 0 ? `${as.avg_ctr.toFixed(2)}%` : "N/A"}</Text></View>
        </View>

        {/* Waste Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waste Analysis</Text>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.label}>Total Waste</Text>
              <Text style={[styles.cardValue, { color: "#EF4444" }]}>{curr}{wb.total_wasted_budget.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Waste %</Text>
              <Text style={[styles.cardValue, { color: "#F59E0B" }]}>{wb.waste_percentage.toFixed(1)}%</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.label}>Efficient Spend</Text>
              <Text style={[styles.cardValue, { color: "#10B981" }]}>{curr}{as.efficient_spend.toLocaleString("en-IN")}</Text>
            </View>
          </View>
          <View style={styles.row}><Text style={styles.label}>Hard Waste</Text><Text style={styles.value}>{curr}{wb.hard_waste.toLocaleString("en-IN")}</Text></View>
          <View style={styles.row}><Text style={styles.label}>CPA Waste</Text><Text style={styles.value}>{curr}{wb.cpa_waste.toLocaleString("en-IN")}</Text></View>
          <View style={styles.row}><Text style={styles.label}>ROAS Waste</Text><Text style={styles.value}>{curr}{wb.roas_waste.toLocaleString("en-IN")}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Creative Waste</Text><Text style={styles.value}>{curr}{wb.creative_waste.toLocaleString("en-IN")}</Text></View>
        </View>

        {/* AI Insight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insight</Text>
          <Text style={styles.text}>{ai.headline}</Text>
          <Text style={styles.text}>{ai.paragraph_1}</Text>
          <Text style={styles.text}>{ai.paragraph_2}</Text>
        </View>

        {/* Classification Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Classification Breakdown</Text>
          <View style={styles.row}><Text style={styles.label}>Scale</Text><Text style={[styles.value, { color: "#10B981" }]}>{cb.scale.count} ads · {curr}{cb.scale.spend.toLocaleString("en-IN")}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Fix</Text><Text style={[styles.value, { color: "#F59E0B" }]}>{cb.fix.count} ads · {curr}{cb.fix.spend.toLocaleString("en-IN")}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Kill</Text><Text style={[styles.value, { color: "#EF4444" }]}>{cb.kill.count} ads · {curr}{cb.kill.spend.toLocaleString("en-IN")}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Watch</Text><Text style={styles.value}>{cb.watch.count} ads · {curr}{cb.watch.spend.toLocaleString("en-IN")}</Text></View>
          <View style={styles.row}><Text style={styles.label}>No Action</Text><Text style={styles.value}>{cb.no_action.count} ads</Text></View>
          <View style={styles.row}><Text style={styles.label}>Insufficient Data</Text><Text style={styles.value}>{cb.insufficient_data.count} ads</Text></View>
        </View>

        {/* Ad-Level Classifications Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ad-Level Classifications</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, { flex: 2 }]}>Ad Name</Text>
            <Text style={styles.cellSmall}>Spend</Text>
            <Text style={styles.cellSmall}>Purchases</Text>
            <Text style={styles.cellSmall}>CPA</Text>
            <Text style={styles.cellSmall}>ROAS</Text>
            <Text style={styles.cellSmall}>Verdict</Text>
          </View>
          {report.ad_level_audit.slice(0, 25).map((ad) => (
            <View key={ad.ad_id} style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 2 }]}>{ad.ad_name}</Text>
              <Text style={styles.cellSmall}>{curr}{ad.spend.toLocaleString("en-IN")}</Text>
              <Text style={styles.cellSmall}>{ad.purchases}</Text>
              <Text style={styles.cellSmall}>{ad.cpa !== null ? `${curr}${ad.cpa.toFixed(0)}` : "—"}</Text>
              <Text style={styles.cellSmall}>{ad.roas !== null ? `${ad.roas.toFixed(2)}×` : "—"}</Text>
              <Text style={[styles.cellSmall, { color: getVerdictColor(ad.verdict) }]}>{verdictLabel(ad.verdict)}</Text>
            </View>
          ))}
        </View>

        {/* Campaign Structure */}
        {report.campaign_structure_audit && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Campaign Structure</Text>
            <View style={styles.grid}>
              <View style={styles.card}>
                <Text style={styles.label}>Campaigns</Text>
                <Text style={styles.cardValue}>{report.campaign_structure_audit.number_of_campaigns}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.label}>Ad Sets</Text>
                <Text style={styles.cardValue}>{report.campaign_structure_audit.number_of_adsets}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.label}>Fragmentation</Text>
                <Text style={styles.cardValue}>{report.campaign_structure_audit.budget_fragmentation_score}/100</Text>
              </View>
            </View>
            {report.campaign_structure_audit.diagnosis && <Text style={styles.text}><Text style={{ fontWeight: "bold" }}>Diagnosis: </Text>{report.campaign_structure_audit.diagnosis}</Text>}
          </View>
        )}

        {/* Priority Actions */}
        {report.priority_actions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Actions</Text>
            {report.priority_actions.map((action, i) => (
              <View key={i} style={styles.row}>
                <Text style={{ flex: 3 }}>{action.action}</Text>
                <Text style={{ flex: 2, color: "#64748B" }}>{action.impact}</Text>
                <Text style={{ flex: 1, fontWeight: "bold", color: action.urgency === "High" ? "#EF4444" : action.urgency === "Medium" ? "#F59E0B" : "#64748B" }}>{action.urgency}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by AdFix · Deterministic Meta Ads Audit · adfixapp.in</Text>
        </View>
      </Page>
    </Document>
  );
};

export function PDFExportButton({ report }: { report: AuditReport }) {
  return (
    <PDFDownloadLink
      document={<AuditPDF report={report} />}
      fileName={`AdFix-Audit-${report.name.replace(/\s+/g, "-")}-${new Date(report.createdAt).toISOString().split("T")[0]}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" className="gap-2" disabled={loading}>
          <Download className="h-4 w-4" />
          {loading ? "Generating PDF..." : "Export PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
