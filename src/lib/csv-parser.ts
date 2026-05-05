import Papa from "papaparse";
import type { AdData } from "@/lib/types";

const RAW_FIELDS: (keyof Pick<AdData, "spend" | "impressions" | "reach" | "frequency" | "clicks" | "link_clicks" | "landing_page_views" | "purchases" | "leads" | "revenue" | "ctr" | "link_ctr" | "cpc" | "cpm" | "cpa" | "roas" | "aov" | "add_to_cart" | "initiate_checkout" | "quality_ranking" | "engagement_rate_ranking" | "conversion_rate_ranking" | "delivery_status" | "attribution_setting" | "reporting_start" | "reporting_end">)[] = [
  "spend", "impressions", "reach", "frequency", "clicks", "link_clicks",
  "landing_page_views", "purchases", "leads", "revenue", "ctr", "link_ctr",
  "cpc", "cpm", "cpa", "roas", "aov", "add_to_cart", "initiate_checkout",
  "quality_ranking", "engagement_rate_ranking", "conversion_rate_ranking",
  "delivery_status", "attribution_setting", "reporting_start", "reporting_end",
];

const COLUMN_ALIASES: Record<string, string[]> = {
  campaign_name: [
    "campaign name", "campaignname", "campaign_name", "campaign", "camp_name",
    "campaign id", "campaignid", "camp_id", "campaign name", "campaignname",
  ],
  ad_name: [
    "ad name", "adname", "ad_name", "ad", "adtitle", "ad title",
    "adcreative", "ad creative", "creative name", "creativename", "ad name",
  ],
  ad_set_id: [
    "ad set id", "adset id", "ad_set_id", "adsetid", "adset_id",
    "ad_setid", "ad setid", "adsetid", "adset id",
  ],
  ad_set_name: [
    "ad set name", "adset name", "ad_set_name", "adsetname", "adset_name",
    "ad_setname", "ad setname", "adset name", "set name", "adsetname",
  ],
  campaign_id: [
    "campaign id", "campaign_id", "campaignid", "camp_id", "camp id", "campaignid",
  ],
  ad_id: [
    "ad id", "ad_id", "adid", "adid", "ad id",
  ],
  impressions: [
    "impressions", "impr", "imprs", "impression", "tot_impressions", "total impressions",
    "total impressions", "impressions delivered", "impr.", "impressions.",
  ],
  spend: [
    "amount spent", "amountspent", "amount_spent", "spend", "cost", "total spend",
    "total_spend", "ad spend", "ad_spend", "spent", "adspent", "ad_spent",
    "total amount spent", "totalamountspent", "amountspent", "spending",
    "budget spent", "budget_spent", "money spent", "money_spent",
    "amount spent inr", "amount spent usd", "amount spent aed", "amount spent eur", "amount spent gbp",
    "amount spent (inr)", "amount spent (usd)", "amount spent (aed)", "amount spent (eur)", "amount spent (gbp)",
    "spend inr", "spend usd", "spend aed", "spend eur", "spend gbp",
    "spend (inr)", "spend (usd)", "spend (aed)", "spend (eur)", "spend (gbp)",
  ],
  reach: [
    "reach", "unique impressions", "uniqueimpressions", "unique_impressions",
    "unique users reached", "users reached", "people reached",
  ],
  frequency: [
    "frequency", "avg frequency", "avgfrequency", "avg_frequency",
    "frequency average", "frequency view-through", "avg freq", "avgfreq",
  ],
  clicks: [
    "clicks", "clicks all", "clicksall", "clicks_all", "total clicks", "total_clicks",
    "all clicks", "click", "clicks (all)", "clicks(all)", "clicks_all",
  ],
  link_clicks: [
    "link clicks", "linkclicks", "link_clicks", "clicks link", "clickslink",
    "link_click", "link click through", "clicks (link)", "clicks(link)",
    "outbound clicks", "outbound_clicks", "outbound click",
  ],
  landing_page_views: [
    "landing page views", "landingpageviews", "landing_page_views", "lp views",
    "lpviews", "lp_views", "landing page view", "landingpageview",
    "landing_page_view", "lpv", "lp view", "page views", "pageviews",
  ],
  purchases: [
    "purchases", "purchase", "purchases 1d click", "purchases(1d click)",
    "purchase_1d_click", "conversions", "conversion", "results", "result",
    "website purchases", "websitepurchases", "website_purchases",
    "total purchases", "total_purchases", "purchase event", "purchase_event",
    "onsite conversions", "offsite conversions", "custom conversions",
  ],
  leads: [
    "leads", "lead", "onsite leads", "onsite_leads", "lead form opens",
    "leadformopens", "lead form submissions", "leadformsubmissions",
    "lead forms", "lead_forms", "form leads", "formleads",
  ],
  revenue: [
    "purchases conversion value", "purchasesconversionvalue", "purchases_conversion_value",
    "purchase conversion value", "purchaseconversionvalue", "purchase_conversion_value",
    "conversion value", "conversionvalue", "conversion_value",
    "purchase value", "purchasevalue", "purchase_value", "revenue", "total revenue",
    "total_revenue", "website purchase conversion value", "websitepurchaseconversionvalue",
    "website_purchase_conversion_value", "purchase roas", "purchase_roas",
    "website purchase roas", "website_purchase_roas", "value", "conv value",
    "sales value", "sales_value", "order value", "order_value",
  ],
  ctr: [
    "ctr", "ctr all", "ctrall", "ctr_all", "click through rate", "clickthroughrate",
    "click_through_rate", "ctr %", "ctr click-through rate", "ctr(click-through rate)",
    "click thru rate", "clickthru rate", "click_thru_rate",
  ],
  link_ctr: [
    "link ctr", "linkctr", "link_ctr", "ctr link click-through rate",
    "ctr(link click-through rate)", "link click through rate", "link click through ctr",
    "link click-thru rate", "outbound ctr", "outboundctr",
  ],
  cpc: [
    "cpc", "cpc all", "cpcall", "cpc_all", "cost per click", "costperclick",
    "cost_per_click", "cpc link", "cpc(link)", "cpc_link", "cost per link click",
    "costperlinkclick", "avg cpc", "avg_cpc", "average cpc", "average_cpc",
  ],
  cpm: [
    "cpm", "cpm cost per 1000 impressions", "cpm(cost per 1000 impressions)",
    "cost per 1000 impressions", "costper1000impressions", "cost_per_mille",
    "cpm cost per 1000 impressions", "avg cpm", "avg_cpm", "average cpm", "average_cpm",
  ],
  cpa: [
    "cost per purchase", "costperpurchase", "cost_per_purchase", "cost per conversion",
    "costperconversion", "cost_per_conversion", "cost per result", "costperresult",
    "cost_per_result", "cpa", "avg cpa", "avg_cpa", "average cpa", "average_cpa",
    "cost per acquisition", "costperacquisition", "cost_per_acquisition",
  ],
  roas: [
    "purchase roas", "purchaseroas", "purchase_roas", "roas", "website purchase roas",
    "websitepurchaseroas", "website_purchase_roas", "return on ad spend",
    "returnonadspend", "return_on_ad_spend", "purch roas", "purch_roas",
    "website purchase roas", "website_purchase_roas",
  ],
  aov: [
    "aov", "average order value", "averageordervalue", "average_order_value",
    "avg order value", "avg_order_value", "order value avg",
  ],
  add_to_cart: [
    "adds to cart", "addstocart", "add_to_cart", "add to cart", "addtocart",
    "add_to_carts", "added to cart", "addedtocart", "add to carts", "addtocarts",
    "cart adds", "cart_adds", "atc", "adds to basket", "adds_to_basket",
  ],
  initiate_checkout: [
    "initiate checkout", "initiatecheckout", "initiate_checkout", "checkouts initiated",
    "checkoutsinitiated", "checkouts_initiated", "initiated checkouts", "initiatedcheckouts",
    "checkout starts", "checkoutstarts", "checkout initiated", "checkout_initiated",
    "begin checkout", "begin_checkout", "checkout start", "checkout_start", "ic",
  ],
  quality_ranking: [
    "quality ranking", "qualityranking", "quality_ranking", "above_average",
    "quality ranking higher is better", "quality rank", "qualityrank",
    "ad quality", "ad_quality", "quality score", "quality_score",
  ],
  engagement_rate_ranking: [
    "engagement rate ranking", "engagementrateranking", "engagement_rate_ranking",
    "engagement ranking", "engagementranking", "engagement rank", "engagementrank",
    "engagement score", "engagement_score",
  ],
  conversion_rate_ranking: [
    "conversion rate ranking", "conversionrateranking", "conversion_rate_ranking",
    "conversion ranking", "conversionranking", "conversion rank", "conversionrank",
    "conv rate ranking", "conv_rate_ranking",
  ],
  delivery_status: [
    "delivery", "delivery status", "deliverystatus", "delivery_status",
    "ad status", "adstatus", "ad_status", "status", "ad delivery",
    "ad_delivery", "delivery state", "delivery_state",
  ],
  attribution_setting: [
    "attribution setting", "attributionsetting", "attribution_setting",
    "attribution window", "attributionwindow", "attribution", "attr setting",
    "attr_setting", "attribution model", "attribution_model",
  ],
  reporting_start: [
    "reporting starts", "reportingstarts", "reporting_starts", "starts",
    "start date", "startdate", "start_date", "date start", "datestart",
    "reporting start", "reporting_start", "from date", "from_date", "period start",
    "period_start", "date from", "date_from",
  ],
  reporting_end: [
    "reporting ends", "reportingends", "reporting_ends", "ends",
    "end date", "enddate", "end_date", "date end", "dateend",
    "reporting end", "reporting_end", "to date", "to_date", "period end",
    "period_end", "date to", "date_to",
  ],
};

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[\u20B9$€£₹¥]/g, "")
    .replace(/[%]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/,/g, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/[^\w\s-]/g, " ")
    .replace(/[\s_]+/g, " ")
    .trim();
}

function tokenize(str: string): string[] {
  return str.split(/\s+/).filter(Boolean);
}

function wordOverlapScore(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap++;
    else {
      // Check if any token in B starts with or contains t (fuzzy)
      for (const bt of tokensB) {
        if (bt.startsWith(t) || t.startsWith(bt)) {
          overlap += 0.5;
          break;
        }
      }
    }
  }
  return overlap / Math.max(tokensA.size, tokensB.size);
}

function scoreMatch(normalizedHeader: string, alias: string): number {
  // Exact match
  if (normalizedHeader === alias) return 100;

  // Header starts with alias or alias starts with header
  if (normalizedHeader.startsWith(alias + " ") || alias.startsWith(normalizedHeader + " ")) return 85;

  // Header contains alias as a substring with word boundary
  const aliasWords = tokenize(alias);
  if (aliasWords.length > 0) {
    const allWordsInHeader = aliasWords.every(w => normalizedHeader.includes(w));
    if (allWordsInHeader) return 75;
  }

  // Alias contains all header words
  const headerWords = tokenize(normalizedHeader);
  if (headerWords.length > 0) {
    const allWordsInAlias = headerWords.every(w => alias.includes(w));
    if (allWordsInAlias) return 65;
  }

  // Simple substring
  if (normalizedHeader.includes(alias) || alias.includes(normalizedHeader)) return 50;

  // Word overlap
  const overlap = wordOverlapScore(normalizedHeader, alias);
  if (overlap >= 0.7) return 45;
  if (overlap >= 0.5) return 35;

  return 0;
}

function findColumn(headers: string[]): Map<string, string> {
  const mapping = new Map<string, string>();
  const usedHeaders = new Set<string>();

  for (const [fieldKey, aliases] of Object.entries(COLUMN_ALIASES)) {
    let bestScore = 0;
    let bestHeader: string | null = null;

    for (const header of headers) {
      if (usedHeaders.has(header)) continue;
      const normalized = normalizeHeader(header);
      if (!normalized) continue;

      for (const alias of aliases) {
        const score = scoreMatch(normalized, alias);
        if (score > bestScore) {
          bestScore = score;
          bestHeader = header;
        }
      }
    }

    // Threshold: only accept matches with score >= 35
    if (bestHeader && bestScore >= 35) {
      mapping.set(fieldKey, bestHeader);
      usedHeaders.add(bestHeader);
    }
  }

  return mapping;
}

function toNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return isNaN(val) || !isFinite(val) ? null : val;
  if (typeof val === "string") {
    const cleaned = val
      .replace(/[\u20B9$€£₹¥]/g, "")
      .replace(/[%xX]/g, "")
      .replace(/[–—]/g, "-")
      .replace(/,/g, "")
      .trim();
    if (cleaned === "" || cleaned === "-" || cleaned.toLowerCase() === "n/a" || cleaned.toLowerCase() === "null" || cleaned === "—") return null;
    const num = parseFloat(cleaned);
    return isNaN(num) || !isFinite(num) ? null : num;
  }
  return null;
}

function calcSafely(a: number | null, b: number | null, fn: (a: number, b: number) => number): number | null {
  if (a === null || b === null || b === 0) return null;
  const result = fn(a, b);
  return !isFinite(result) || isNaN(result) ? null : result;
}

export interface ParseResult {
  data: AdData[];
  mappedColumns: Record<string, string>;
  errors: string[];
  warnings: string[];
  dateRange: { start: string | null; end: string | null; daysAnalyzed: number | null };
  rawFields: string[];
  missingFields: string[];
}

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const columnMap = findColumn(headers);
        const mappedColumns: Record<string, string> = {};
        columnMap.forEach((originalHeader, fieldKey) => {
          mappedColumns[fieldKey] = originalHeader;
        });

        const rawFieldKeys = RAW_FIELDS.filter((f) => columnMap.has(f));
        const missingFields = RAW_FIELDS.filter((f) => !columnMap.has(f));

        const errors: string[] = [];
        const warnings: string[] = [];

        // More forgiving spend detection
        const hasSpend = columnMap.has("spend");
        if (!hasSpend) {
          // Try to find ANY column that looks like spend
          const spendLike = headers.find(h => {
            const n = normalizeHeader(h);
            return n.includes("spend") || n.includes("spent") || n.includes("amount") || n.includes("cost") || n.includes("budget");
          });
          if (spendLike) {
            errors.push(`We detected a column "${spendLike}" that looks like spend, but we couldn't map it confidently. Please rename it to "Amount Spent" or "Spend".`);
          } else {
            errors.push("We could not detect a Spend column. Please export 'Amount Spent' from Meta Ads Manager.");
          }
        }

        // More forgiving results/conversions detection
        const hasResults = columnMap.has("purchases") || columnMap.has("leads") || columnMap.has("revenue");
        if (!hasResults) {
          const resultLike = headers.find(h => {
            const n = normalizeHeader(h);
            return n.includes("purchase") || n.includes("conversion") || n.includes("result") || n.includes("lead") || n.includes("sale");
          });
          if (resultLike) {
            errors.push(`We detected a column "${resultLike}" that looks like results, but we couldn't map it confidently. Please rename it to "Purchases" or "Results".`);
          } else {
            errors.push("We could not detect Purchases, Leads, Results, or Conversions. Please include at least one result column.");
          }
        }

        let reportStart: string | null = null;
        let reportEnd: string | null = null;

        const data: AdData[] = [];
        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i];
          try {
            const get = (field: string): string | number | null | undefined => {
              const header = columnMap.get(field);
              return header ? row[header] as string | number | null | undefined : undefined;
            };

            const str = (field: string): string => {
              const val = get(field);
              if (val === null || val === undefined) return "";
              const s = String(val).trim();
              if (s === "-" || s === "—" || s.toLowerCase() === "n/a" || s.toLowerCase() === "null") return "";
              return s;
            };

            const num = (field: string): number | null => toNumber(get(field));

            const campaign_name = str("campaign_name");
            const ad_name = str("ad_name");
            const ad_set_id = str("ad_set_id");
            const ad_set_name = str("ad_set_name");
            const campaign_id = str("campaign_id");
            const ad_id = str("ad_id") || `row-${i}`;

            const impressions = num("impressions") ?? 0;
            const spend = num("spend") ?? 0;
            const reach = num("reach");
            const clicks = num("clicks") ?? 0;
            const link_clicks = num("link_clicks");
            const landing_page_views = num("landing_page_views");
            const purchases = num("purchases") ?? 0;
            const leads = num("leads");
            const revenue = num("revenue");
            const ctr = num("ctr");
            const link_ctr = num("link_ctr");
            const cpc = num("cpc");
            const cpm = num("cpm");
            const add_to_cart = num("add_to_cart");
            const initiate_checkout = num("initiate_checkout");
            const quality_ranking = str("quality_ranking") || null;
            const engagement_rate_ranking = str("engagement_rate_ranking") || null;
            const conversion_rate_ranking = str("conversion_rate_ranking") || null;
            const delivery_status = str("delivery_status") || null;
            const attribution_setting = str("attribution_setting") || null;

            const rs = str("reporting_start");
            const re = str("reporting_end");
            if (rs) reportStart = rs;
            if (re) reportEnd = re;

            const frequency = calcSafely(impressions, reach, (a, b) => a / b);

            // Auto-calculate derived metrics when raw columns are missing but base data exists
            const cpa = calcSafely(spend, purchases, (a, b) => a / b);
            const roas = calcSafely(revenue, spend, (a, b) => a / b);
            const aov = calcSafely(revenue, purchases, (a, b) => a / b);

            const finalCtr = ctr ?? calcSafely(clicks, impressions, (a, b) => (a / b) * 100);
            const finalLinkCtr = link_ctr ?? calcSafely(link_clicks, impressions, (a, b) => (a / b) * 100);
            const finalCpc = cpc ?? calcSafely(spend, clicks, (a, b) => a / b);
            const finalCpm = cpm ?? calcSafely(spend, impressions, (a, b) => (a / b) * 1000);

            const click_to_purchase_rate = calcSafely(purchases, clicks, (a, b) => (a / b) * 100);
            const impression_to_purchase_rate = calcSafely(purchases, impressions, (a, b) => (a / b) * 100);
            const landing_page_view_rate = calcSafely(landing_page_views, link_clicks, (a, b) => (a / b) * 100);
            const add_to_cart_rate = calcSafely(add_to_cart, landing_page_views, (a, b) => (a / b) * 100);
            const checkout_rate = calcSafely(initiate_checkout, add_to_cart, (a, b) => (a / b) * 100);
            const purchase_completion_rate = calcSafely(purchases, initiate_checkout, (a, b) => (a / b) * 100);

            data.push({
              campaign_name, ad_name, ad_set_id, ad_set_name, campaign_id, ad_id,
              spend, impressions, reach, frequency, clicks, link_clicks, landing_page_views,
              purchases, leads, revenue,
              ctr: finalCtr, link_ctr: finalLinkCtr,
              cpc: finalCpc, cpm: finalCpm,
              cpa, roas, aov,
              add_to_cart, initiate_checkout,
              quality_ranking, engagement_rate_ranking, conversion_rate_ranking,
              delivery_status, attribution_setting,
              reporting_start: rs || null, reporting_end: re || null,
              click_to_purchase_rate, impression_to_purchase_rate,
              landing_page_view_rate, add_to_cart_rate, checkout_rate, purchase_completion_rate,
              spend_share: null, revenue_share: null, purchase_share: null, efficiency_index: null,
            });
          } catch {
            errors.push(`Error parsing row ${i + 1}`);
          }
        }

        const totalSpend = data.reduce((s, d) => s + d.spend, 0);
        const totalRevenue = data.reduce((s, d) => s + (d.revenue ?? 0), 0);
        const totalPurchases = data.reduce((s, d) => s + d.purchases, 0);
        for (const ad of data) {
          ad.spend_share = totalSpend > 0 ? (ad.spend / totalSpend) * 100 : null;
          ad.revenue_share = totalRevenue > 0 ? ((ad.revenue ?? 0) / totalRevenue) * 100 : null;
          ad.purchase_share = totalPurchases > 0 ? (ad.purchases / totalPurchases) * 100 : null;
          if (totalSpend > 0 && ad.spend_share !== null && ad.revenue_share !== null && ad.spend_share > 0) {
            ad.efficiency_index = ad.revenue_share / ad.spend_share;
          } else if (totalSpend > 0 && ad.spend_share !== null && ad.purchase_share !== null && ad.spend_share > 0) {
            ad.efficiency_index = ad.purchase_share / ad.spend_share;
          }
        }

        let daysAnalyzed: number | null = null;
        if (reportStart && reportEnd) {
          const start = new Date(reportStart);
          const end = new Date(reportEnd);
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            daysAnalyzed = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          }
        }

        if (missingFields.includes("reach") || missingFields.includes("frequency")) {
          warnings.push("Reach/Frequency data is missing. Creative fatigue detection will be limited.");
        }
        if (missingFields.includes("revenue") && !missingFields.includes("purchases")) {
          warnings.push("Purchase Conversion Value is missing. ROAS analysis will be calculated only where revenue data is available.");
        }
        if (missingFields.includes("landing_page_views")) {
          warnings.push("Landing Page Views is missing. Funnel analysis will be limited.");
        }
        if (daysAnalyzed === null) {
          warnings.push("Reporting date range was not detected. Confidence is reduced.");
        }

        resolve({
          data,
          mappedColumns,
          errors,
          warnings,
          dateRange: { start: reportStart, end: reportEnd, daysAnalyzed },
          rawFields: rawFieldKeys,
          missingFields,
        });
      },
      error: (err) => reject(err),
    });
  });
}

export function generateSampleCSV(): string {
  const headers = [
    "Campaign name", "Ad name", "Ad set ID", "Ad set name", "Campaign ID", "Ad ID",
    "Impressions", "Reach", "Amount spent", "Clicks (all)", "Link Clicks",
    "Landing Page Views", "Adds to Cart", "Initiate Checkout", "Purchases",
    "Purchases conversion value", "CTR (all)", "CPC (all)", "CPM",
    "Quality Ranking", "Engagement Rate Ranking", "Conversion Rate Ranking", "Delivery",
  ];

  const rows = [
    ["Summer Sale 2025", "Ad 1 - Video UGC", "238501", "Lookalike 1%", "120501", "340201", "15000", "12000", "3200", "256", "210", "170", "45", "30", "12", "45000", "1.71", "12.5", "213", "Above Average", "Above Average", "Average", "active"],
    ["Summer Sale 2025", "Ad 2 - Carousel Products", "238502", "Interest A", "120501", "340202", "8200", "7000", "2100", "138", "110", "80", "12", "8", "3", "8500", "1.68", "15.2", "256", "Average", "Average", "Below Average", "active"],
    ["Summer Sale 2025", "Ad 3 - Static Image", "238503", "Interest B", "120501", "340203", "4500", "3800", "1800", "82", "60", "40", "5", "3", "1", "3500", "1.82", "22.0", "400", "Below Average", "Below Average", "Below Average", "active"],
    ["Retargeting", "Ad 4 - Dynamic Product", "238504", "Website Visitors 30d", "120502", "340204", "6000", "5500", "1500", "150", "130", "100", "25", "15", "8", "28000", "2.50", "10.0", "250", "Above Average", "Above Average", "Above Average", "active"],
    ["Retargeting", "Ad 5 - Collection Ad", "238505", "Add to Cart 7d", "120502", "340205", "3200", "2800", "1200", "65", "50", "35", "8", "5", "2", "6000", "2.03", "18.5", "375", "Average", "Average", "Average", "active"],
    ["Prospecting", "Ad 6 - UGC Testimonial", "238506", "Broad Audience", "120503", "340206", "25000", "20000", "5500", "671", "550", "400", "80", "50", "28", "98000", "2.68", "8.2", "220", "Above Average", "Above Average", "Above Average", "active"],
    ["Prospecting", "Ad 7 - Founder Story", "238507", "Broad Audience", "120503", "340207", "18000", "15000", "4200", "442", "370", "280", "40", "25", "15", "42000", "2.46", "9.5", "233", "Above Average", "Average", "Above Average", "active"],
    ["Prospecting", "Ad 8 - Product Demo", "238508", "Lookalike 2%", "120503", "340208", "500", "450", "800", "11", "8", "5", "1", "0", "0", "0", "2.20", "45.0", "1600", "Below Average", "Below Average", "Below Average", "active"],
    ["Brand Awareness", "Ad 9 - Brand Intro", "238509", "Cold Interests", "120504", "340209", "45000", "38000", "3000", "857", "700", "500", "30", "15", "5", "15000", "1.90", "3.5", "67", "Average", "Average", "Average", "active"],
    ["Brand Awareness", "Ad 10 - Behind Scenes", "238510", "Cold Interests", "120504", "340210", "12000", "10000", "1600", "267", "220", "160", "15", "10", "4", "12000", "2.23", "6.0", "133", "Average", "Average", "Average", "active"],
    ["Diwali Campaign", "Ad 11 - Festive Offer", "238511", "Festive Audience", "120505", "340211", "22000", "18000", "4800", "615", "500", "380", "55", "35", "22", "75000", "2.80", "7.8", "218", "Above Average", "Above Average", "Above Average", "active"],
    ["Diwali Campaign", "Ad 12 - Gift Guide", "238512", "Festive Audience", "120505", "340212", "9000", "7500", "2500", "223", "180", "140", "20", "12", "6", "18000", "2.48", "11.2", "278", "Average", "Average", "Average", "active"],
    ["Independence Day", "Ad 13 - Patriotism", "238513", "National Audience", "120506", "340213", "35000", "30000", "2800", "420", "350", "250", "10", "5", "2", "5000", "1.20", "4.2", "80", "Below Average", "Below Average", "Below Average", "active"],
    ["Independence Day", "Ad 14 - Discount Code", "238514", "Deal Seekers", "120506", "340214", "18000", "15000", "3200", "265", "220", "160", "25", "15", "9", "32000", "1.47", "6.8", "178", "Average", "Average", "Average", "active"],
    ["New Year Sale", "Ad 15 - Countdown", "238515", "High Intent", "120507", "340215", "28000", "23000", "5200", "571", "470", "350", "50", "30", "18", "55000", "2.04", "9.1", "186", "Above Average", "Above Average", "Above Average", "active"],
    ["New Year Sale", "Ad 16 - Flash Sale", "238516", "Urgency Audience", "120507", "340216", "15000", "12500", "3800", "362", "300", "220", "30", "20", "11", "28000", "2.41", "10.5", "253", "Average", "Above Average", "Average", "active"],
    ["New Year Sale", "Ad 17 - Last Chance", "238517", "Cart Abandoners", "120507", "340217", "8000", "6800", "2100", "150", "120", "85", "10", "7", "4", "9500", "1.88", "14.0", "263", "Average", "Average", "Below Average", "active"],
    ["Evergreen", "Ad 18 - Always On", "238518", "Broad + Exclusions", "120508", "340218", "42000", "35000", "6800", "907", "750", "550", "90", "60", "35", "125000", "2.16", "7.5", "162", "Above Average", "Above Average", "Above Average", "active"],
    ["Evergreen", "Ad 19 - Social Proof", "238519", "Warm Audience", "120508", "340219", "25000", "21000", "4100", "461", "380", "280", "45", "28", "19", "48000", "1.84", "8.9", "164", "Above Average", "Above Average", "Average", "active"],
    ["Evergreen", "Ad 20 - FAQ Video", "238520", "Problem Aware", "120508", "340220", "12000", "10000", "2900", "240", "195", "140", "18", "12", "7", "21000", "2.00", "12.1", "242", "Average", "Average", "Average", "active"],
  ];

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
