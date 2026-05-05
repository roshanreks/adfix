import type {
  AdData, AdAuditResult, AuditReport, AuditConfig, ConfidenceLevel,
  IssueType, ScaleLevel, BenchmarkSource, WasteBreakdown,
} from "@/lib/types";

const CURR: Record<string, string> = { INR: "₹", USD: "$", AED: "AED ", EUR: "€", GBP: "£", other: "" };
const fmt = (amount: number, currency: string) => `${CURR[currency] || ""}${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;


function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ─── Confidence Score Engine ───

function calcConfidence(
  data: AdData[],
  config: AuditConfig,
  missingFields: string[],
  daysAnalyzed: number | null
): { confidence_score: number; confidence_level: ConfidenceLevel; confidence_reason: string } {
  let score = 100;
  const reasons: string[] = [];

  if (missingFields.includes("revenue")) { score -= 15; reasons.push("revenue data is missing"); }
  if (!config.targetCPA) { score -= 10; reasons.push("target CPA was not provided"); }
  if (config.businessType === "ecommerce" && !config.targetROAS && missingFields.includes("revenue")) { score -= 8; reasons.push("target ROAS is missing for ecommerce"); }
  if (missingFields.includes("reach") || missingFields.includes("frequency")) { score -= 8; reasons.push("reach/frequency data is missing"); }
  if (missingFields.includes("add_to_cart") || missingFields.includes("initiate_checkout") || missingFields.includes("landing_page_views")) { score -= 10; reasons.push("funnel event columns are missing"); }
  if (daysAnalyzed === null) { score -= 10; reasons.push("date range is missing"); }
  else if (daysAnalyzed < 3) { score -= 20; reasons.push("less than 3 days of data"); }
  else if (daysAnalyzed <= 6) { score -= 10; reasons.push("only 3-6 days of data"); }

  const totalConversions = data.reduce((s, d) => s + d.purchases + (d.leads ?? 0), 0);
  if (totalConversions < 10) { score -= 20; reasons.push("fewer than 10 total purchases/leads"); }
  else if (totalConversions < 30) { score -= 10; reasons.push("10-29 total purchases/leads"); }

  if (data.length < 5) { score -= 5; reasons.push("fewer than 5 ads analyzed"); }
  if (missingFields.includes("delivery_status")) { score -= 5; reasons.push("delivery status is missing"); }
  if (missingFields.includes("quality_ranking")) { score -= 5; reasons.push("quality ranking columns are missing"); }

  score = Math.max(0, Math.min(100, score));
  const level: ConfidenceLevel = score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";

  return {
    confidence_score: score,
    confidence_level: level,
    confidence_reason: reasons.length > 0
      ? `Confidence is ${level} because ${reasons.join(", ")}.`
      : `Confidence is High. All critical data fields are present.`,
  };
}

// ─── Account Health Score Engine ───

function calcHealthScore(
  data: AdData[],
  results: AdAuditResult[],
  wastePct: number,
  confidence: { confidence_score: number; confidence_level: ConfidenceLevel },
  config: AuditConfig,
  missingFields: string[],
  daysAnalyzed: number | null
): { health_score: number; health_label: string } {
  const totalSpend = data.reduce((s, d) => s + d.spend, 0);
  const totalPurchases = data.reduce((s, d) => s + d.purchases, 0);
  const totalLeads = data.reduce((s, d) => s + (d.leads ?? 0), 0);
  const totalConversions = totalPurchases + totalLeads;
  const targetCPA = config.targetCPA;

  // 1. Efficiency Score (30 points)
  let efficiencyScore = 0;
  const cpas = data.filter(d => d.cpa !== null && d.cpa > 0 && d.purchases > 0).map(d => d.cpa!);
  const roases = data.filter(d => d.roas !== null && d.roas > 0).map(d => d.roas!);

  if (cpas.length > 0 && targetCPA) {
    const avgCpa = avg(cpas);
    const cpaRatio = targetCPA / Math.max(avgCpa, 1);
    efficiencyScore += Math.min(30, Math.max(0, cpaRatio * 15));
  } else if (cpas.length > 0) {
    efficiencyScore += 10;
  }

  if (config.businessType === "ecommerce" && roases.length > 0) {
    const avgRoas = avg(roases);
    const breakeven = config.grossMargin ? 1 / (config.grossMargin / 100) : 1.5;
    if (avgRoas >= breakeven * 1.5) efficiencyScore += 15;
    else if (avgRoas >= breakeven) efficiencyScore += 10;
    else efficiencyScore += 5;
  } else {
    efficiencyScore += 5;
  }

  // 2. Waste Control Score (20 points)
  const wasteScore = Math.max(0, 20 - wastePct * 0.8);

  // 3. Scaling Score (15 points)
  const scaleCount = results.filter(r => r.verdict === "SCALE").length;
  const scalingScore = Math.min(15, scaleCount * 3);

  // 4. Creative Score (15 points)
  let creativeScore = 7;
  const ctres = data.filter(d => d.ctr !== null && d.ctr > 0).map(d => d.ctr!);
  if (ctres.length > 0) {
    const aboveAvgCtr = ctres.filter(c => c >= avg(ctres)).length;
    creativeScore = Math.round((aboveAvgCtr / ctres.length) * 15);
  }

  // 5. Structure Score (10 points)
  const campaigns = new Set(data.map(d => d.campaign_name)).size;
  const adsets = new Set(data.map(d => d.ad_set_id)).size;
  let structureScore = 5;
  if (campaigns > 1 && campaigns <= 4) structureScore = 8;
  if (campaigns >= 2 && campaigns <= 3 && adsets <= 10) structureScore = 10;
  if (campaigns > 8) structureScore = 3;

  // 6. Data Quality Score (10 points)
  let dataQualityScore = 10 - (missingFields.filter(f =>
    ["spend", "purchases", "leads", "impressions", "clicks", "revenue"].includes(f)
  ).length * 2);
  dataQualityScore = Math.max(0, dataQualityScore);

  let rawScore = efficiencyScore + wasteScore + scalingScore + creativeScore + structureScore + dataQualityScore;

  // Caps
  const noRevenue = missingFields.includes("revenue");
  const lowConversions = totalConversions < 10;
  const noDates = daysAnalyzed === null;
  const halfSpendNoConv = data.filter(d => d.spend > 0 && d.purchases === 0 && (d.leads ?? 0) === 0)
    .reduce((s, d) => s + d.spend, 0) > totalSpend * 0.5;

  if ((config.businessType === "ecommerce" && noRevenue) || lowConversions || noDates || halfSpendNoConv) {
    rawScore = Math.min(rawScore, 80);
  }
  if (confidence.confidence_level !== "High") {
    rawScore = Math.min(rawScore, 90);
  }

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));
  let label: string;
  if (score >= 95) label = "Elite";
  else if (score >= 85) label = "Excellent";
  else if (score >= 75) label = "Good";
  else if (score >= 60) label = "Average";
  else if (score >= 40) label = "Poor";
  else label = "Critical";

  return { health_score: score, health_label: label };
}

// ─── Verdict Engine ───

/* eslint-disable @typescript-eslint/no-unused-vars */
function assignVerdict(
  ad: AdData,
  config: AuditConfig,
  accountAvgCpa: number,
  accountAvgRoas: number,
  accountAvgCtr: number,
  accountAvgCpm: number,
  accountAvgCpc: number,
  medianAdSpend: number,
  _totalPurchases: number,
  _totalLeads: number,
  _totalConversions: number
): {
  verdict: AdAuditResult["verdict"];
  verdict_reason: string;
  recommended_action: string;
  decision_confidence: ConfidenceLevel;
  issue_type: IssueType;
  scale_level?: ScaleLevel;
  budget_increase_pct?: string;
  scale_warnings?: string[];
  fix_recommendations?: string[];
} {
  const targetCPA = config.targetCPA || accountAvgCpa;
  const targetROAS = config.targetROAS || accountAvgRoas;
  const meaningfulSpend = targetCPA > 0 ? targetCPA : (accountAvgCpa > 0 ? accountAvgCpa : medianAdSpend);
  const highWasteThreshold = meaningfulSpend * 1.5;
  const purchases = ad.purchases;
  const leads = ad.leads ?? 0;
  const conversions = purchases + leads;
  const cpa = ad.cpa;
  const roas = ad.roas;
  const ctr = ad.ctr;
  const cpc = ad.cpc;
  const cpm = ad.cpm;
  const spend = ad.spend;

  const convConfidence = conversions >= 10 ? "High" : conversions >= 5 ? "Medium" : conversions >= 3 ? "Low" : "Low";

  // INSUFFICIENT_DATA
  if (spend === 0 && ad.impressions === 0 && ad.clicks === 0) {
    return {
      verdict: "INSUFFICIENT_DATA",
      verdict_reason: "No spend, impressions, or clicks detected. This ad has no data to evaluate.",
      recommended_action: "Check if this ad is active. If it should be running, check delivery status and budget allocation.",
      decision_confidence: "Low",
      issue_type: "none",
    };
  }

  // INSUFFICIENT_DATA — very low data
  if (spend < meaningfulSpend * 0.3 && conversions === 0) {
    return {
      verdict: "INSUFFICIENT_DATA",
      verdict_reason: `Spend of ${fmt(spend, config.currency)} is too low to make a reliable decision. Need at least ${fmt(meaningfulSpend, config.currency)} spend.`,
      recommended_action: "Let this ad run longer to collect meaningful data. Re-evaluate after it reaches the spend threshold.",
      decision_confidence: "Low",
      issue_type: "none",
    };
  }

  // WATCH — below meaningful threshold but has some signal
  if (spend < meaningfulSpend && conversions <= 2 && conversions > 0) {
    return {
      verdict: "WATCH",
      verdict_reason: `${conversions} conversion(s) with ${fmt(spend, config.currency)} spend. Not enough data for a firm decision yet, but early signal looks ${conversions >= 1 ? "promising" : "weak"}.`,
      recommended_action: "Monitor for another 48-72 hours. If conversions increase, re-evaluate for Scale or Fix.",
      decision_confidence: "Low",
      issue_type: "none",
    };
  }

  // WATCH — good CTR but not enough purchases
  if (ctr !== null && ctr > accountAvgCtr * 1.3 && spend >= meaningfulSpend * 0.5 && conversions <= 2) {
    return {
      verdict: "WATCH",
      verdict_reason: `CTR of ${ctr.toFixed(2)}% is above account average (${accountAvgCtr.toFixed(2)}%), but only ${conversions} conversion(s). Creative is working; waiting for conversion data.`,
      recommended_action: "Keep running. If purchases don't increase within 3 days, check funnel and landing page.",
      decision_confidence: "Low",
      issue_type: "none",
    };
  }

  // KILL — high waste, zero conversions
  if (spend >= highWasteThreshold && conversions === 0) {
    return {
      verdict: "KILL",
      verdict_reason: `Spent ${fmt(spend, config.currency)} with zero conversions. This is ${spend / (meaningfulSpend || 1)}× the meaningful spend threshold with no results.`,
      recommended_action: "Pause this ad immediately. Reallocate budget to performing ads.",
      decision_confidence: convConfidence,
      issue_type: "creative",
    };
  }

  // KILL — CPA way above target
  if (cpa !== null && targetCPA > 0 && cpa > targetCPA * 1.5 && spend >= meaningfulSpend) {
    return {
      verdict: "KILL",
      verdict_reason: `CPA of ${fmt(cpa, config.currency)} is ${(cpa / targetCPA).toFixed(1)}× your target CPA of ${fmt(targetCPA, config.currency)}. Budget is better reallocated.`,
      recommended_action: `Pause this ad. It's spending ${fmt(cpa - targetCPA, config.currency)} more per conversion than your target.`,
      decision_confidence: convConfidence,
      issue_type: cpa > targetCPA * 2 ? "creative" : "funnel",
    };
  }

  // KILL — ROAS way below target
  if (config.businessType === "ecommerce" && roas !== null && targetROAS > 0 && roas < targetROAS * 0.5 && spend >= meaningfulSpend) {
    return {
      verdict: "KILL",
      verdict_reason: `ROAS of ${roas.toFixed(2)}× is less than half your target ROAS of ${targetROAS.toFixed(2)}× after ${fmt(spend, config.currency)} spend.`,
      recommended_action: "Pause this ad. It's not generating enough revenue to justify the spend.",
      decision_confidence: convConfidence,
      issue_type: "offer",
    };
  }

  // KILL — high spend share but poor performance
  if (ad.spend_share !== null && ad.spend_share > 20 && ad.purchase_share !== null && ad.purchase_share < ad.spend_share * 0.3 && spend >= meaningfulSpend) {
    return {
      verdict: "KILL",
      verdict_reason: `Consuming ${ad.spend_share.toFixed(0)}% of budget but only generating ${ad.purchase_share?.toFixed(0) || 0}% of purchases. Clear top waste contributor.`,
      recommended_action: "Pause this ad. It's consuming disproportionate budget with poor results.",
      decision_confidence: convConfidence,
      issue_type: "audience_delivery",
    };
  }

  // KILL — poor CTR + high CPM + no conversions
  if (ctr !== null && ctr < accountAvgCtr * 0.5 && cpm !== null && cpm > accountAvgCpm * 1.5 && conversions === 0 && spend >= meaningfulSpend) {
    return {
      verdict: "KILL",
      verdict_reason: `CTR is ${(ctr / accountAvgCtr * 100).toFixed(0)}% of account average with CPM ${fmt(cpm, config.currency)} and zero conversions. Creative is not resonating and costs are high.`,
      recommended_action: "Pause this ad. The creative is not working and costs are above average.",
      decision_confidence: convConfidence,
      issue_type: "creative",
    };
  }

  // SCALE
  if (conversions >= 3 && spend >= meaningfulSpend) {
    const cpaGood = cpa !== null && targetCPA > 0 && cpa <= targetCPA * 0.8;
    const roasGood = roas !== null && targetROAS > 0 && roas >= targetROAS * 1.25;
    const ctrOk = ctr === null || ctr >= accountAvgCtr * 0.5;

    if ((cpaGood || roasGood) && ctrOk) {
      const scaleLevel: ScaleLevel = conversions >= 10 ? "aggressive" : conversions >= 5 ? "balanced" : "conservative";
      const budgetIncrease = scaleLevel === "aggressive" ? "25-40%" : scaleLevel === "balanced" ? "15-25%" : "10-15%";

      const warnings: string[] = [];
      if (scaleLevel === "aggressive" && convConfidence !== "High") {
        warnings.push("Confidence is not High — consider balanced scaling instead.");
      }

      return {
        verdict: "SCALE",
        verdict_reason: `${conversions} purchase(s) at ${cpa !== null ? fmt(cpa, config.currency) : "N/A"} CPA${roas !== null ? ` and ${roas.toFixed(2)}× ROAS` : ""}. ${cpaGood ? `CPA is below your ${fmt(targetCPA, config.currency)} target.` : `ROAS exceeds your ${targetROAS.toFixed(2)}× target.`}`,
        recommended_action: `Increase budget by ${budgetIncrease} for the next 48 hours. Do not edit the existing ad directly.`,
        decision_confidence: convConfidence,
        issue_type: "none",
        scale_level: scaleLevel,
        budget_increase_pct: budgetIncrease,
        scale_warnings: warnings,
        fix_recommendations: [],
      };
    }
  }

  // FIX — various conditions
  const fixReasons: string[] = [];
  let fixIssue: IssueType = "none";

  if (cpa !== null && targetCPA > 0 && cpa >= targetCPA && cpa <= targetCPA * 1.5 && spend >= meaningfulSpend) {
    fixReasons.push(`CPA of ${fmt(cpa, config.currency)} is ${(cpa / targetCPA).toFixed(1)}× target. Close to breakeven but needs optimization.`);
    fixIssue = "funnel";
  }

  if (ctr !== null && ctr > accountAvgCtr * 1.3 && cpa !== null && targetCPA > 0 && cpa > targetCPA && spend >= meaningfulSpend) {
    fixReasons.push("High CTR but poor CPA — creative is working but funnel is leaking.");
    fixIssue = fixIssue === "none" ? "funnel" : fixIssue;
  }

  if (cpc !== null && cpc > accountAvgCpc * 1.3 && conversions > 0 && spend >= meaningfulSpend) {
    fixReasons.push(`CPC of ${fmt(cpc, config.currency)} is ${(cpc / accountAvgCpc).toFixed(1)}× account average. High costs per click.`);
    fixIssue = fixIssue === "none" ? "creative" : fixIssue;
  }

  if (cpm !== null && cpm > accountAvgCpm * 1.3 && cpa !== null && targetCPA > 0 && cpa <= targetCPA * 1.5 && spend >= meaningfulSpend) {
    fixReasons.push(`CPM of ${fmt(cpm, config.currency)} is elevated but CPA is still close to target.`);
  }

  if (ad.click_to_purchase_rate !== null && ad.click_to_purchase_rate < 1 && conversions > 0 && spend >= meaningfulSpend) {
    fixReasons.push(`Click-to-purchase rate is ${ad.click_to_purchase_rate.toFixed(2)}%. Good clicks but poor conversion.`);
    fixIssue = fixIssue === "none" ? "funnel" : fixIssue;
  }

  if (fixReasons.length > 0) {
    return {
      verdict: "FIX",
      verdict_reason: fixReasons.join(" "),
      recommended_action: getFixAction(fixIssue, ad, config),
      decision_confidence: convConfidence,
      issue_type: fixIssue,
      fix_recommendations: getFixRecommendations(fixIssue, ad, config, accountAvgCtr, accountAvgCpm, accountAvgCpc),
    };
  }

  // NO_ACTION
  return {
    verdict: "NO_ACTION",
    verdict_reason: `Performance is within acceptable range. CPA ${cpa !== null ? fmt(cpa, config.currency) : "N/A"}${targetCPA > 0 ? ` vs target ${fmt(targetCPA, config.currency)}` : ""}. No urgent action needed.`,
    recommended_action: "Continue monitoring. Re-evaluate in 3-5 days.",
    decision_confidence: convConfidence,
    issue_type: "none",
  };
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */
function getFixAction(issueType: IssueType, _ad: AdData, _config: AuditConfig): string {
  switch (issueType) {
    case "creative": return "Test new creative angles. Change the first 3 seconds, hook, and visual format.";
    case "funnel": return "Improve landing page speed, trust signals, and checkout flow. Test offer clarity.";
    case "audience_delivery": return "Broaden audience targeting. Consolidate similar ad sets. Use Advantage+ placements.";
    case "offer": return "Test stronger offers: bundle pricing, free shipping threshold, or first-order discount.";
    case "tracking": return "Check Pixel purchase event, Conversion API, and purchase value parameter.";
    default: return "Review ad performance and test optimizations.";
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */
function getFixRecommendations(
  issueType: IssueType,
  _ad: AdData,
  _config: AuditConfig,
  _avgCtr: number,
  _avgCpm: number,
  _avgCpc: number
): string[] {
  switch (issueType) {
    case "creative":
      return [
        "Test stronger first 3 seconds with a clear hook",
        "Test UGC-style content with creator face-to-camera",
        "Test problem-solution angle",
        "Test product demo format",
        "Test testimonial/social proof angle",
        "Test Reels-first 9:16 format",
        "Try a new thumbnail or opening frame",
      ];
    case "funnel":
      return [
        "Improve landing page speed (target under 3 seconds)",
        "Add trust signals (reviews, badges, guarantees)",
        "Improve product page headline and description",
        "Clarify delivery, COD, and return policy",
        "Improve checkout flow — reduce steps",
        "Test offer clarity and price anchoring",
      ];
    case "audience_delivery":
      return [
        "Broaden audience — remove narrow interest constraints",
        "Consolidate similar ad sets to reduce overlap",
        "Use Advantage+ placements where possible",
        "Reduce the number of small-budget ad sets",
      ];
    case "offer":
      return [
        "Test bundle offer to increase AOV",
        "Test free shipping threshold",
        "Test first-order discount",
        "Improve COD messaging if applicable",
        "Test urgency carefully (limited stock/time)",
        "Strengthen value proposition in ad copy",
      ];
    case "tracking":
      return [
        "Check Pixel purchase event is firing correctly",
        "Verify Conversion API setup",
        "Check purchase value parameter in events",
        "Verify currency parameter matches your account",
        "Check event deduplication between Pixel and CAPI",
        "Verify domain verification in Events Manager",
        "Check attribution setting matches your analysis window",
      ];
    default:
      return ["Review ad creative and targeting. Test small optimizations."];
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// ─── Waste Breakdown Engine ───

function calcWasteBreakdown(
  results: AdAuditResult[],
  data: AdData[],
  config: AuditConfig,
  accountAvgCpa: number,
  accountAvgCtr: number,
  accountAvgCpm: number
): {
  total_wasted_budget: number;
  hard_waste: number;
  cpa_waste: number;
  roas_waste: number;
  creative_waste: number;
  waste_percentage: number;
  top_waste_contributors: WasteBreakdown["top_waste_contributors"];
} {
  const targetCPA = config.targetCPA || accountAvgCpa;
  const targetROAS = config.targetROAS;
  const meaningfulSpend = targetCPA > 0 ? targetCPA : (accountAvgCpa > 0 ? accountAvgCpa : median(data.map(d => d.spend)));

  let hardWaste = 0;
  let cpaWaste = 0;
  const roasWaste = 0;
  let creativeWaste = 0;
  const wasteContributors: WasteBreakdown["top_waste_contributors"] = [];

  for (const result of results) {
    const ad = data.find(d => d.ad_id === result.ad_id);
    if (!ad) continue;

    let adWaste = 0;
    let wasteReason = "";
    let wasteAction = "";

    // Hard waste: spend >= meaningful, zero conversions
    if (ad.spend >= meaningfulSpend && ad.purchases === 0 && (ad.leads ?? 0) === 0) {
      adWaste = ad.spend;
      wasteReason = `Spent ${fmt(ad.spend, config.currency)} with zero conversions`;
      wasteAction = "Pause immediately";
    }

    // CPA waste
    if (ad.cpa !== null && targetCPA > 0 && ad.cpa > targetCPA && ad.purchases > 0) {
      const calculatedCpaWaste = Math.max(0, ad.spend - (ad.purchases * targetCPA));
      if (calculatedCpaWaste > adWaste) {
        adWaste = calculatedCpaWaste;
        wasteReason = `CPA ${fmt(ad.cpa, config.currency)} is ${(ad.cpa / targetCPA).toFixed(1)}× target`;
        wasteAction = "Optimize or pause";
      }
    }

    // ROAS waste
    if (config.businessType === "ecommerce" && targetROAS && ad.roas !== null && ad.revenue !== null) {
      const requiredRevenue = ad.spend * targetROAS;
      if (ad.revenue < requiredRevenue) {
        const calculatedRoasWaste = Math.max(0, (requiredRevenue - ad.revenue) / targetROAS);
        if (calculatedRoasWaste > adWaste) {
          adWaste = calculatedRoasWaste;
          wasteReason = `ROAS ${ad.roas.toFixed(2)}× is below ${targetROAS.toFixed(2)}× target`;
          wasteAction = "Pause or improve offer";
        }
      }
    }

    // Creative waste
    if (ad.ctr !== null && ad.ctr < accountAvgCtr * 0.5 && ad.cpm !== null && ad.cpm > accountAvgCpm * 1.5 && ad.spend >= meaningfulSpend && result.verdict !== "KILL") {
      const calculatedCreativeWaste = ad.spend * 0.25;
      if (calculatedCreativeWaste > adWaste * 0.5) {
        creativeWaste += Math.min(calculatedCreativeWaste, adWaste > 0 ? 0 : calculatedCreativeWaste);
      }
    }

    if (adWaste > 0) {
      wasteContributors.push({
        ad_id: ad.ad_id,
        ad_name: ad.ad_name,
        spend: ad.spend,
        wasted_amount: Math.round(adWaste),
        reason: wasteReason,
        action: wasteAction,
      });
    }

    switch (result.verdict) {
      case "KILL": hardWaste += adWaste > 0 ? adWaste : ad.spend; break;
      case "FIX": cpaWaste += adWaste; break;
    }
  }

  wasteContributors.sort((a, b) => b.wasted_amount - a.wasted_amount);

  const totalWaste = hardWaste + cpaWaste + roasWaste + creativeWaste;
  const totalSpend = data.reduce((s, d) => s + d.spend, 0);

  return {
    total_wasted_budget: Math.round(totalWaste),
    hard_waste: Math.round(hardWaste),
    cpa_waste: Math.round(cpaWaste),
    roas_waste: Math.round(roasWaste),
    creative_waste: Math.round(creativeWaste),
    waste_percentage: totalSpend > 0 ? (totalWaste / totalSpend) * 100 : 0,
    top_waste_contributors: wasteContributors.slice(0, 10),
  };
}

// ─── Campaign Structure Audit ───

function calcCampaignStructure(data: AdData[]): AuditReport["campaign_structure_audit"] {
  const campaigns = new Set(data.map(d => d.campaign_name)).size;
  const adsets = new Set(data.map(d => d.ad_set_id)).size;
  const ads = data.length;
  const avgAdsPerAdset = adsets > 0 ? ads / adsets : 0;
  const avgAdsetsPerCampaign = campaigns > 0 ? adsets / campaigns : 0;

  const spendByCampaign = new Map<string, number>();
  const spendByAdset = new Map<string, number>();
  for (const ad of data) {
    spendByCampaign.set(ad.campaign_name, (spendByCampaign.get(ad.campaign_name) || 0) + ad.spend);
    spendByAdset.set(ad.ad_set_id, (spendByAdset.get(ad.ad_set_id) || 0) + ad.spend);
  }

  const totalSpend = data.reduce((s, d) => s + d.spend, 0);
  const lowSpendCampaigns = [...spendByCampaign.entries()].filter(([, s]) => s < totalSpend * 0.05).length;
  const lowSpendAdsets = [...spendByAdset.entries()].filter(([, s]) => s < totalSpend * 0.02).length;

  const adsetNames = data.map(d => d.ad_set_name);
  const similarAdsets = adsetNames.filter((name, i) => adsetNames.indexOf(name) !== i);
  const uniqueSimilarNames = [...new Set(similarAdsets)];

  let fragmentationScore = 0;
  if (campaigns > 6) fragmentationScore += 30;
  if (adsets > 15) fragmentationScore += 20;
  if (lowSpendCampaigns > 2) fragmentationScore += 20;
  if (lowSpendAdsets > 4) fragmentationScore += 15;
  if (uniqueSimilarNames.length > 0) fragmentationScore += 15;
  fragmentationScore = Math.min(100, fragmentationScore);

  const issues: string[] = [];
  const recommendations: string[] = [];

  if (lowSpendCampaigns > 2) {
    issues.push(`${lowSpendCampaigns} campaigns have less than 5% of total spend`);
    recommendations.push("Consolidate low-spend campaigns. Keep one main scaling campaign and one creative testing campaign.");
  }
  if (lowSpendAdsets > 4) {
    issues.push(`${lowSpendAdsets} ad sets have less than 2% of total spend`);
    recommendations.push("Merge similar ad sets. Avoid spreading budget across too many small audiences.");
  }
  if (uniqueSimilarNames.length > 0) {
    issues.push(`Similar ad set names detected: ${uniqueSimilarNames.slice(0, 3).join(", ")}`);
    recommendations.push("Consolidate overlapping ad sets to reduce internal competition.");
  }
  if (campaigns > 6) {
    issues.push(`${campaigns} campaigns detected — account structure may be fragmented`);
    recommendations.push("Keep maximum 3-4 campaigns: Scaling, Testing, Retargeting, and Brand.");
  }
  if (avgAdsPerAdset > 8) {
    issues.push(`Average of ${avgAdsPerAdset.toFixed(1)} ads per ad set — too many ads competing`);
    recommendations.push("Limit to 3-5 active ads per ad set. Pause underperformers to let winners get budget.");
  }

  if (issues.length === 0) {
    recommendations.push("Account structure looks healthy. Continue monitoring.");
  }

  return {
    number_of_campaigns: campaigns,
    number_of_adsets: adsets,
    number_of_ads: ads,
    avg_ads_per_adset: Math.round(avgAdsPerAdset * 10) / 10,
    avg_adsets_per_campaign: Math.round(avgAdsetsPerCampaign * 10) / 10,
    budget_fragmentation_score: fragmentationScore,
    diagnosis: issues.length > 0 ? "Structure needs optimization" : "Account structure is well-organized",
    issues_found: issues,
    recommendations,
  };
}

// ─── Creative Audit ───

function calcCreativeAudit(
  data: AdData[],
  accountAvgCtr: number,
  accountAvgCpm: number,
  accountAvgCpc: number,
  targetCPA: number
): AuditReport["creative_audit"] {
  const issues: string[] = [];
  const tests: string[] = [];
  let fatigueDetected = false;
  let fatigueConfidence = "";

  // Fatigue detection
  const withFrequency = data.filter(d => d.frequency !== null && d.reach !== null);
  if (withFrequency.length > 0) {
    const fatigued = withFrequency.filter(d => {
      const freq = d.frequency!;
      return (freq > 2.5 && d.ctr !== null && d.ctr < accountAvgCtr) ||
        (freq > 4) ||
        (freq > 2 && d.cpa !== null && targetCPA > 0 && d.cpa > targetCPA);
    });
    if (fatigued.length > 0) {
      fatigueDetected = true;
      fatigueConfidence = fatigued.length > 3 ? "High" : fatigued.length > 1 ? "Medium" : "Low";
      issues.push(`${fatigued.length} ad(s) show creative fatigue signals (high frequency + declining performance)`);
      tests.push("Refresh creative. Keep the winning message, but change the first 3 seconds, visual, creator, and format.");
    }
  } else {
    fatigueConfidence = "Cannot confirm — Reach/Frequency data is missing.";
  }

  // CTR analysis
  const ctrAds = data.filter(d => d.ctr !== null && d.impressions > 100);
  if (ctrAds.length > 0) {
    const lowCtr = ctrAds.filter(d => d.ctr! < accountAvgCtr * 0.7);
    if (lowCtr.length > ctrAds.length * 0.5) {
      issues.push("More than half of ads have CTR below 70% of account average — creative quality needs improvement");
      tests.push("Test UGC-style content with real people");
      tests.push("Test problem-solution angle in first 3 seconds");
      tests.push("Test founder/creator face-to-camera format");
    }
  }

  // CPM analysis
  const cpmAds = data.filter(d => d.cpm !== null);
  if (cpmAds.length > 0) {
    const highCpm = cpmAds.filter(d => d.cpm! > accountAvgCpm * 1.5);
    if (highCpm.length > cpmAds.length * 0.3) {
      issues.push("Many ads have CPM above 1.5× account average — audience may be too narrow or competitive");
      tests.push("Broaden audience targeting to reduce CPM");
      tests.push("Test Advantage+ placements");
    }
  }

  if (tests.length === 0) {
    tests.push("Current creative performance is acceptable. Continue testing new angles.");
  }

  return {
    diagnosis: issues.length > 0 ? "Creative optimization needed" : "Creative performance is healthy",
    fatigue_detected: fatigueDetected,
    fatigue_confidence: fatigueConfidence,
    creative_issues: issues,
    creative_tests_to_launch: tests,
  };
}

// ─── Funnel Audit ───

function calcFunnelAudit(data: AdData[]): AuditReport["funnel_audit"] {
  const hasFunnelData = data.some(d =>
    d.landing_page_views !== null || d.add_to_cart !== null || d.initiate_checkout !== null
  );

  if (!hasFunnelData) {
    return {
      funnel_metrics_available: false,
      diagnosis: "Funnel data is not available in this export.",
      metrics: {},
      issues_found: ["Landing Page Views, Add to Cart, and Initiate Checkout columns are missing"],
      recommendations: [
        "Export these columns from Meta Ads Manager: Link Clicks, Landing Page Views, View Content, Add to Cart, Initiate Checkout, Purchases, Purchase Conversion Value, Website Purchase ROAS",
      ],
    };
  }

  const totalClicks = data.reduce((s, d) => s + d.clicks, 0);
  const totalLPV = data.reduce((s, d) => s + (d.landing_page_views ?? 0), 0);
  const totalATC = data.reduce((s, d) => s + (d.add_to_cart ?? 0), 0);
  const totalIC = data.reduce((s, d) => s + (d.initiate_checkout ?? 0), 0);
  const totalPurchases = data.reduce((s, d) => s + d.purchases, 0);

  const clickToLPV = totalClicks > 0 ? (totalLPV / totalClicks) * 100 : null;
  const lpvToATC = totalLPV > 0 ? (totalATC / totalLPV) * 100 : null;
  const atcToCheckout = totalATC > 0 ? (totalIC / totalATC) * 100 : null;
  const checkoutToPurchase = totalIC > 0 ? (totalPurchases / totalIC) * 100 : null;
  const clickToPurchase = totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : null;

  const issues: string[] = [];
  const recommendations: string[] = [];

  if (clickToLPV !== null && clickToLPV < 50) {
    issues.push(`Click to Landing Page View rate is ${clickToLPV.toFixed(1)}% — below 50% suggests click quality or page speed issues`);
    recommendations.push("Improve landing page load speed (target under 3 seconds). Check if ad creative matches landing page.");
  }
  if (lpvToATC !== null && lpvToATC < 5) {
    issues.push(`Landing Page View to Add to Cart rate is ${lpvToATC.toFixed(1)}% — product page or offer may need improvement`);
    recommendations.push("Improve product page: clearer headline, better images, trust signals, and shipping/return policy.");
  }
  if (atcToCheckout !== null && atcToCheckout < 30) {
    issues.push(`Add to Cart to Checkout rate is ${atcToCheckout.toFixed(1)}% — cart friction detected`);
    recommendations.push("Check for surprise shipping fees, improve cart page UX, add trust signals.");
  }
  if (checkoutToPurchase !== null && checkoutToPurchase < 40) {
    issues.push(`Checkout to Purchase rate is ${checkoutToPurchase.toFixed(1)}% — payment or checkout flow issues`);
    recommendations.push("Simplify checkout flow. Offer multiple payment methods. Improve COD messaging if applicable.");
  }

  if (issues.length === 0) {
    recommendations.push("Funnel conversion rates look healthy. Continue monitoring.");
  }

  return {
    funnel_metrics_available: true,
    diagnosis: issues.length > 0 ? "Funnel optimization opportunities detected" : "Funnel conversion rates are healthy",
    metrics: {
      click_to_landing_page_view: clickToLPV,
      landing_page_view_to_add_to_cart: lpvToATC,
      add_to_cart_to_checkout: atcToCheckout,
      checkout_to_purchase: checkoutToPurchase,
      click_to_purchase: clickToPurchase,
    },
    issues_found: issues,
    recommendations,
  };
}

// ─── Tracking Audit ───

function calcTrackingAudit(data: AdData[], missingFields: string[]): AuditReport["tracking_audit"] {
  const missing: string[] = [];
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (missingFields.includes("revenue")) {
    missing.push("Purchase Conversion Value");
    const hasPurchases = data.some(d => d.purchases > 0);
    if (hasPurchases) {
      issues.push("Purchases exist but revenue data is missing — Pixel/CAPI may not be passing value parameter");
      recommendations.push("Check Pixel purchase event — ensure value and currency parameters are being sent");
      recommendations.push("Check Conversion API setup for purchase events");
      recommendations.push("Check event deduplication between Pixel and CAPI");
    }
  }

  if (missingFields.includes("landing_page_views") && missingFields.includes("add_to_cart")) {
    missing.push("Landing Page Views");
    missing.push("Add to Cart");
  }

  if (missingFields.includes("attribution_setting")) {
    missing.push("Attribution Setting");
    recommendations.push("Check your attribution window setting in Ads Manager — it affects how conversions are counted");
  }

  if (missingFields.includes("quality_ranking")) {
    missing.push("Quality Ranking");
  }

  const hasZeroRevenueWithPurchases = data.some(d => d.purchases > 0 && (d.revenue === null || d.revenue === 0));
  if (hasZeroRevenueWithPurchases) {
    issues.push(`${data.filter(d => d.purchases > 0 && (d.revenue === null || d.revenue === 0)).length} ad(s) have purchases but zero revenue — tracking value may be broken`);
    recommendations.push("Verify purchase value parameter in Pixel/CAPI events");
    recommendations.push("Check currency parameter matches your ad account currency");
  }

  const trackingConfidence = missing.filter(m => ["Purchase Conversion Value", "Attribution Setting"].includes(m)).length > 0
    ? "Medium"
    : issues.length > 0 ? "Medium" : "High";

  return {
    tracking_confidence: trackingConfidence,
    missing_fields: missing,
    possible_tracking_issues: issues,
    recommendations: recommendations.length > 0 ? recommendations : ["Tracking setup appears correct. Continue monitoring."],
  };
}

// ─── AI Insight Generator ───

/* eslint-disable @typescript-eslint/no-unused-vars */
function generateAIInsight(
  data: AdData[],
  results: AdAuditResult[],
  waste: WasteBreakdown,
  health: { health_score: number; health_label: string },
  config: AuditConfig,
  confidence: { confidence_score: number; confidence_level: ConfidenceLevel },
  _accountAvgCpa: number,
  _accountAvgRoas: number,
  _daysAnalyzed: number | null
): AuditReport["ai_insight"] {
  const totalSpend = data.reduce((s, d) => s + d.spend, 0);
  const totalRevenue = data.reduce((s, d) => s + (d.revenue ?? 0), 0);
  const totalPurchases = data.reduce((s, d) => s + d.purchases, 0);
  const scaleCount = results.filter(r => r.verdict === "SCALE").length;
  const killCount = results.filter(r => r.verdict === "KILL").length;
  const fixCount = results.filter(r => r.verdict === "FIX").length;

  let headline = "";
  let p1 = "";
  let p2 = "";
  let biggestOpp = "";
  let biggestRisk = "";
  let nextAction = "";

  if (health.health_label === "Elite" || health.health_label === "Excellent") {
    headline = `Your account is performing ${health.health_label.toLowerCase()} with a health score of ${health.health_score}/100.`;
    p1 = `You've spent ${fmt(totalSpend, config.currency)} and generated ${totalPurchases} purchase(s)${totalRevenue > 0 ? ` with ${fmt(totalRevenue, config.currency)} revenue` : ""}. ${scaleCount} ad(s) are ready to scale.`;
    p2 = confidence.confidence_level === "High"
      ? "Data confidence is high, so these recommendations are reliable."
      : "Data confidence is limited — treat recommendations as directional.";
    biggestOpp = `${scaleCount} ad(s) are performing above target. Scaling these could increase volume by 15-40%.`;
    biggestRisk = killCount > 0 ? `${killCount} ad(s) are wasting budget. Pausing them could save ${fmt(waste.total_wasted_budget, config.currency)}.` : "No major risks detected. Continue monitoring.";
    nextAction = `Focus on scaling your ${scaleCount} top performer(s). Increase budget gradually and monitor CPA.`;
  } else if (health.health_label === "Good" || health.health_label === "Average") {
    headline = `Your account is ${health.health_label.toLowerCase()} with room for improvement.`;
    p1 = `Spend: ${fmt(totalSpend, config.currency)} | Purchases: ${totalPurchases}${totalRevenue > 0 ? ` | Revenue: ${fmt(totalRevenue, config.currency)}` : ""}. ${killCount} ad(s) need pausing, ${fixCount} need optimization, ${scaleCount} can be scaled.`;
    p2 = waste.waste_percentage > 20
      ? `${waste.waste_percentage.toFixed(0)}% of your budget is being wasted. Reallocating this could significantly improve performance.`
      : "Waste levels are manageable. Focus on optimizing fix candidates and scaling winners.";
    biggestOpp = fixCount > 0
      ? `${fixCount} ad(s) have optimization potential. Fixing these could improve CPA by 15-30%.`
      : `Scale your ${scaleCount} top performer(s) to increase volume.`;
    biggestRisk = waste.hard_waste > 0 ? `${fmt(waste.hard_waste, config.currency)} is being spent on ads with zero conversions.` : `${fixCount} ad(s) are underperforming and dragging down account efficiency.`;
    nextAction = killCount > 0
      ? `Pause the ${killCount} worst-performing ad(s) first. Then optimize fix candidates, then scale winners.`
      : `Start by optimizing your ${fixCount} fix candidates, then scale the ${scaleCount} top performer(s).`;
  } else {
    headline = `Your account needs urgent attention — health score is ${health.health_score}/100 (${health.health_label.toLowerCase()}).`;
    p1 = `You've spent ${fmt(totalSpend, config.currency)}${totalPurchases > 0 ? ` for ${totalPurchases} purchase(s)` : " with very few conversions"}. ${killCount} ad(s) should be paused immediately, wasting ${fmt(waste.hard_waste, config.currency)}.`;
    p2 = waste.waste_percentage > 30
      ? `${waste.waste_percentage.toFixed(0)}% of your budget is wasted. This is the biggest lever for improvement.`
      : "Multiple issues are contributing to poor performance — creative, targeting, and funnel all need work.";
    biggestOpp = `Reallocating wasted budget (${fmt(waste.total_wasted_budget, config.currency)}) to performing ads could dramatically improve results.`;
    biggestRisk = `Continuing to run ${killCount} underperforming ad(s) will burn through budget with minimal returns.`;
    nextAction = "1) Pause all KILL ads immediately. 2) Review FIX ads for creative/funnel issues. 3) Ensure tracking is working correctly.";
  }

  return { headline, paragraph_1: p1, paragraph_2: p2, biggest_opportunity: biggestOpp, biggest_risk: biggestRisk, next_best_action: nextAction };
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// ─── Main Orchestrator ───

export function runAuditV3(
  data: AdData[],
  config: AuditConfig,
  dateRange: { start: string | null; end: string | null; daysAnalyzed: number | null },
  missingFields: string[]
): AuditReport {
  const totalSpend = data.reduce((s, d) => s + d.spend, 0);
  const totalRevenue = data.reduce((s, d) => s + (d.revenue ?? 0), 0);
  const totalPurchases = data.reduce((s, d) => s + d.purchases, 0);
  const totalLeads = data.reduce((s, d) => s + (d.leads ?? 0), 0);
  const totalConversions = totalPurchases + totalLeads;

  // Account benchmarks
  const cpas = data.filter(d => d.cpa !== null && d.cpa > 0 && d.purchases > 0).map(d => d.cpa!);
  const roases = data.filter(d => d.roas !== null && d.roas > 0 && d.revenue !== null).map(d => d.roas!);
  const ctrs = data.filter(d => d.ctr !== null && d.ctr > 0).map(d => d.ctr!);
  const cpcs = data.filter(d => d.cpc !== null && d.cpc > 0).map(d => d.cpc!);
  const cpms = data.filter(d => d.cpm !== null && d.cpm > 0).map(d => d.cpm!);
  const aovs = data.filter(d => d.aov !== null && d.aov > 0).map(d => d.aov!);

  const accountAvgCpa = cpas.length > 0 ? avg(cpas) : 0;
  const accountMedianCpa = cpas.length > 0 ? median(cpas) : 0;
  const accountAvgRoas = roases.length > 0 ? avg(roases) : 0;
  const accountMedianRoas = roases.length > 0 ? median(roases) : 0;
  const accountAvgCtr = ctrs.length > 0 ? avg(ctrs) : 0;
  const accountMedianCtr = ctrs.length > 0 ? median(ctrs) : 0;
  const accountAvgCpc = cpcs.length > 0 ? avg(cpcs) : 0;
  const accountAvgCpm = cpms.length > 0 ? avg(cpms) : 0;
  const accountAvgAov = aovs.length > 0 ? avg(aovs) : 0;

  // Confidence
  const confidence = calcConfidence(data, config, missingFields, dateRange.daysAnalyzed);

  // Benchmark source
  const benchmarkSource: BenchmarkSource = config.targetCPA ? "target_input" : (accountAvgCpa > 0 ? "account_average" : "median");
  const medianAdSpend = median(data.map(d => d.spend));

  // Assign verdicts
  const results: AdAuditResult[] = data.map(ad => {
    const verdict = assignVerdict(ad, config, accountAvgCpa, accountAvgRoas, accountAvgCtr, accountAvgCpm, accountAvgCpc, medianAdSpend, totalPurchases, totalLeads, totalConversions);
    const wastedBudget = verdict.verdict === "KILL" ? ad.spend : (verdict.verdict === "FIX" && ad.cpa !== null && config.targetCPA ? Math.max(0, ad.spend - ad.purchases * config.targetCPA) : 0);
    return {
      ad_id: ad.ad_id,
      ad_name: ad.ad_name,
      campaign_name: ad.campaign_name,
      ad_set_name: ad.ad_set_name,
      verdict: verdict.verdict,
      verdict_reason: verdict.verdict_reason,
      recommended_action: verdict.recommended_action,
      decision_confidence: verdict.decision_confidence,
      issue_type: verdict.issue_type,
      spend: ad.spend,
      purchases: ad.purchases,
      leads: ad.leads,
      revenue: ad.revenue,
      cpa: ad.cpa,
      roas: ad.roas,
      ctr: ad.ctr,
      cpc: ad.cpc,
      cpm: ad.cpm,
      wasted_budget: Math.round(wastedBudget),
      confidence_score: confidence.confidence_score,
      scale_level: verdict.scale_level,
      budget_increase_pct: verdict.budget_increase_pct,
      scale_warnings: verdict.scale_warnings,
      fix_recommendations: verdict.fix_recommendations,
    };
  });

  // Waste
  const waste = calcWasteBreakdown(results, data, config, accountAvgCpa, accountAvgCtr, accountAvgCpm);

  // Health
  const health = calcHealthScore(data, results, waste.waste_percentage, confidence, config, missingFields, dateRange.daysAnalyzed);

  // Classification breakdown
  const classifyCount = (v: string) => results.filter(r => r.verdict === v).length;
  const classifySpend = (v: string) => results.filter(r => r.verdict === v).reduce((s, r) => s + r.spend, 0);
  const classifyRevenue = (v: string) => results.filter(r => r.verdict === v).reduce((s, r) => s + (r.revenue ?? 0), 0);

  // Scale opportunities
  const scaleOpps = results
    .filter(r => r.verdict === "SCALE")
    .map(r => ({
      ad_name: r.ad_name,
      cpa: r.cpa,
      roas: r.roas,
      purchases: r.purchases,
      recommended_budget_action: `Increase budget by ${r.budget_increase_pct}`,
      confidence: r.decision_confidence,
      why_scale: r.verdict_reason,
      scale_level: r.scale_level || "conservative",
      budget_increase_pct: r.budget_increase_pct || "10-15%",
      what_to_do_next: `Scale this ad by ${r.budget_increase_pct} for the next 48 hours. Do not edit the existing ad directly.`,
      what_not_to_do: "Do not increase budget too aggressively. Avoid editing winning ads directly. Duplicate winning creative into fresh variations.",
      warnings: r.scale_warnings || [],
    }));

  // Fix opportunities
  const fixOpps = results
    .filter(r => r.verdict === "FIX")
    .map(r => ({
      ad_name: r.ad_name,
      issue_type: r.issue_type,
      diagnosis: r.verdict_reason,
      recommended_fix: r.fix_recommendations || ["Review and optimize."],
      confidence: r.decision_confidence,
    }));

  // Kill recommendations
  const killRecs = results
    .filter(r => r.verdict === "KILL")
    .map(r => ({
      ad_name: r.ad_name,
      spend: r.spend,
      cpa: r.cpa,
      wasted_budget: r.wasted_budget,
      reason: r.verdict_reason,
      action: r.recommended_action,
    }));

  // Watch items
  const watchItems = results
    .filter(r => r.verdict === "WATCH")
    .map(r => ({
      ad_name: r.ad_name,
      spend: r.spend,
      purchases: r.purchases,
      reason: r.verdict_reason,
    }));

  // Best/worst performers
  const sortedByRevenue = [...results].filter(r => r.roas !== null).sort((a, b) => (b.roas || 0) - (a.roas || 0));
  const sortedBySpend = [...results].sort((a, b) => b.spend - a.spend);
  const sortedByWaste = [...results].sort((a, b) => b.wasted_budget - a.wasted_budget);

  // Breakeven ROAS
  const breakevenRoas = config.grossMargin ? 1 / (config.grossMargin / 100) : null;

  // Confidence reason for benchmark


  // AI Insight
  const aiInsight = generateAIInsight(data, results, waste, health, config, confidence, accountAvgCpa, accountAvgRoas, dateRange.daysAnalyzed);

  // Missing data
  const criticalMissing = missingFields.filter(f => ["spend", "purchases", "leads", "impressions", "clicks"].includes(f));
  const importantMissing = missingFields.filter(f => !criticalMissing.includes(f));
  const recommendedColumns: string[] = [];
  if (missingFields.includes("revenue")) recommendedColumns.push("Purchase Conversion Value", "Website Purchase ROAS");
  if (missingFields.includes("landing_page_views")) recommendedColumns.push("Landing Page Views");
  if (missingFields.includes("add_to_cart")) recommendedColumns.push("Adds to Cart");
  if (missingFields.includes("initiate_checkout")) recommendedColumns.push("Initiate Checkout");
  if (missingFields.includes("reach")) recommendedColumns.push("Reach");
  if (missingFields.includes("frequency")) recommendedColumns.push("Frequency");
  if (missingFields.includes("link_clicks")) recommendedColumns.push("Link Clicks");
  if (missingFields.includes("quality_ranking")) recommendedColumns.push("Quality Ranking", "Engagement Rate Ranking", "Conversion Rate Ranking");

  const howMissing = criticalMissing.length > 0
    ? `Critical fields are missing: ${criticalMissing.join(", ")}. The audit cannot run accurately without these.`
    : importantMissing.length > 0
      ? `${importantMissing.length} field(s) are missing. The audit will run but with reduced confidence. ${recommendedColumns.length > 0 ? `Next time, also export: ${recommendedColumns.join(", ")}.` : ""}`
      : "All critical fields are present. Audit is running at full accuracy.";

  // Priority actions
  const priorityActions: AuditReport["priority_actions"] = [];
  if (killRecs.length > 0) {
    priorityActions.push({
      action: `Pause ${killRecs.length} underperforming ad(s)`,
      impact: `Could save ${fmt(waste.hard_waste, config.currency)} in wasted spend`,
      urgency: "High",
    });
  }
  if (scaleOpps.length > 0) {
    priorityActions.push({
      action: `Scale ${scaleOpps.length} high-performing ad(s)`,
      impact: "Could increase conversion volume by 15-40%",
      urgency: "High",
    });
  }
  if (fixOpps.length > 0) {
    priorityActions.push({
      action: `Optimize ${fixOpps.length} fix candidate(s)`,
      impact: "Could improve CPA by 15-30%",
      urgency: "Medium",
    });
  }

  return {
    id: crypto.randomUUID(),
    name: config.name,
    createdAt: new Date().toISOString(),
    audit_metadata: {
      reporting_start: dateRange.start,
      reporting_end: dateRange.end,
      days_analyzed: dateRange.daysAnalyzed,
      currency: config.currency,
      business_type: config.businessType,
      account_stage: config.accountStage,
      risk_level: config.riskLevel,
      target_cpa: config.targetCPA || null,
      target_roas: config.targetROAS || null,
      gross_margin: config.grossMargin || null,
      breakeven_roas: breakevenRoas,
      benchmark_source: benchmarkSource,
      confidence_level: confidence.confidence_level,
      confidence_score: confidence.confidence_score,
      confidence_reason: confidence.confidence_reason,
    },
    account_summary: {
      health_score: health.health_score,
      health_label: health.health_label,
      total_spend: totalSpend,
      total_revenue: totalRevenue,
      total_purchases: totalPurchases,
      total_leads: totalLeads,
      avg_cpa: accountAvgCpa,
      median_cpa: accountMedianCpa,
      avg_roas: accountAvgRoas,
      median_roas: accountMedianRoas,
      avg_ctr: accountAvgCtr,
      avg_cpc: accountAvgCpc,
      avg_cpm: accountAvgCpm,
      wasted_budget: waste.total_wasted_budget,
      waste_percentage: waste.waste_percentage,
      efficient_spend: Math.max(0, totalSpend - waste.total_wasted_budget),
      fixable_spend: waste.cpa_waste + waste.creative_waste,
      scalable_spend: classifySpend("SCALE"),
      actions_required: classifyCount("KILL") + classifyCount("FIX") + classifyCount("SCALE"),
      summary_text: `${health.health_label} account health (${health.health_score}/100). ${killRecs.length} ad(s) need pausing, ${fixOpps.length} need optimization, ${scaleOpps.length} ready to scale. ${fmt(waste.total_wasted_budget, config.currency)} wasted budget detected.`,
    },
    ai_insight: aiInsight,
    classification_breakdown: {
      scale: { count: classifyCount("SCALE"), spend: classifySpend("SCALE"), revenue: classifyRevenue("SCALE") },
      fix: { count: classifyCount("FIX"), spend: classifySpend("FIX"), revenue: classifyRevenue("FIX") },
      kill: { count: classifyCount("KILL"), spend: classifySpend("KILL"), revenue: classifyRevenue("KILL") },
      watch: { count: classifyCount("WATCH"), spend: classifySpend("WATCH"), revenue: classifyRevenue("WATCH") },
      no_action: { count: classifyCount("NO_ACTION"), spend: classifySpend("NO_ACTION"), revenue: classifyRevenue("NO_ACTION") },
      insufficient_data: { count: classifyCount("INSUFFICIENT_DATA"), spend: classifySpend("INSUFFICIENT_DATA"), revenue: classifyRevenue("INSUFFICIENT_DATA") },
    },
    waste_breakdown: waste,
    benchmarks: {
      avg_cpa: accountAvgCpa,
      median_cpa: accountMedianCpa,
      avg_roas: accountAvgRoas,
      median_roas: accountMedianRoas,
      avg_ctr: accountAvgCtr,
      median_ctr: accountMedianCtr,
      avg_cpc: accountAvgCpc,
      avg_cpm: accountAvgCpm,
      avg_aov: accountAvgAov,
      best_performer: sortedByRevenue[0]?.ad_name || "N/A",
      worst_performer: sortedByRevenue[sortedByRevenue.length - 1]?.ad_name || "N/A",
      highest_spend_ad: sortedBySpend[0]?.ad_name || "N/A",
      highest_waste_contributor: sortedByWaste[0]?.ad_name || "N/A",
      most_scalable_asset: scaleOpps[0]?.ad_name || "N/A",
    },
    scale_opportunities: scaleOpps,
    fix_opportunities: fixOpps,
    kill_recommendations: killRecs,
    watch_items: watchItems,
    campaign_structure_audit: calcCampaignStructure(data),
    creative_audit: calcCreativeAudit(data, accountAvgCtr, accountAvgCpm, accountAvgCpc, config.targetCPA || accountAvgCpa),
    funnel_audit: calcFunnelAudit(data),
    tracking_audit: calcTrackingAudit(data, missingFields),
    priority_actions: priorityActions,
    ad_level_audit: results,
    missing_data: {
      critical_missing_fields: criticalMissing,
      important_missing_fields: importantMissing,
      recommended_next_export_columns: recommendedColumns,
      how_missing_data_affects_audit: howMissing,
    },
    currency: config.currency,
    tier: config.tier,
    timeWindow: config.timeWindow,
  };
}
