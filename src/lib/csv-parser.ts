import Papa from "papaparse";
import type { AdData, AdRaw } from "@/lib/types";

type FieldKey = keyof Omit<AdData, "spend" | "impressions" | "reach" | "frequency" | "clicks" | "link_clicks" | "landing_page_views" | "purchases" | "leads" | "revenue" | "ctr" | "link_ctr" | "cpc" | "cpm" | "cpa" | "roas" | "aov" | "add_to_cart" | "initiate_checkout" | "quality_ranking" | "engagement_rate_ranking" | "conversion_rate_ranking" | "delivery_status" | "attribution_setting" | "reporting_start" | "reporting_end">;

const RAW_FIELDS: (keyof Pick<AdData, "spend" | "impressions" | "reach" | "frequency" | "clicks" | "link_clicks" | "landing_page_views" | "purchases" | "leads" | "revenue" | "ctr" | "link_ctr" | "cpc" | "cpm" | "cpa" | "roas" | "aov" | "add_to_cart" | "initiate_checkout" | "quality_ranking" | "engagement_rate_ranking" | "conversion_rate_ranking" | "delivery_status" | "attribution_setting" | "reporting_start" | "reporting_end">)[] = [
  "spend", "impressions", "reach", "frequency", "clicks", "link_clicks",
  "landing_page_views", "purchases", "leads", "revenue", "ctr", "link_ctr",
  "cpc", "cpm", "cpa", "roas", "aov", "add_to_cart", "initiate_checkout",
  "quality_ranking", "engagement_rate_ranking", "conversion_rate_ranking",
  "delivery_status", "attribution_setting", "reporting_start", "reporting_end",
];

const COLUMN_ALIASES: Record<string, string[]> = {
  campaign_name: ["campaign name", "campaignname", "campaign_name", "campaignname", "campaign", "camp_name", "campaignid", "campaign id"],
  ad_name: ["ad name", "adname", "ad_name", "adname", "ad", "adtitle", "ad title", "adcreative", "ad creative"],
  ad_set_id: ["ad set id", "adset id", "ad_set_id", "adsetid", "adsetid", "ad_setid", "ad setid", "adset_id"],
  ad_set_name: ["ad set name", "adset name", "ad_set_name", "adsetname", "adset name", "ad_setname", "ad setname", "adset_name"],
  campaign_id: ["campaign id", "campaign_id", "campaignid", "camp_id", "camp id", "campaignid"],
  ad_id: ["ad id", "ad_id", "adid", "adid"],
  impressions: ["impressions", "impr", "imprs", "impression", "tot_impressions", "total impressions"],
  spend: ["amount spent", "amountspent", "amount_spent", "spend", "cost", "total spend", "total_spend", "ad spend", "ad_spend", "amount spent (inr)", "amount spent (usd)", "amount spent (aed)", "amount spent (eur)", "amount spent (gbp)"],
  reach: ["reach", "unique impressions", "uniqueimpressions", "unique_impressions", "unique users reached"],
  frequency: ["frequency", "avg frequency", "avgfrequency", "avg_frequency", "frequency (average)", "frequency (view-through)"],
  clicks: ["clicks", "clicks (all)", "clicks(all)", "clicks_all", "total clicks", "total_clicks", "all clicks", "click"],
  link_clicks: ["link clicks", "linkclicks", "link_clicks", "clicks (link)", "clicks(link)", "link_click", "link click through"],
  landing_page_views: ["landing page views", "landingpageviews", "landing_page_views", "lp views", "lpviews", "lp_views", "landing page view", "landingpageview"],
  purchases: ["purchases", "purchase", "purchases (1d click)", "purchases(1d click)", "purchase_1d_click", "conversions", "conversion", "results", "result", "website purchases", "websitepurchases", "website_purchases", "total purchases", "total_purchases"],
  leads: ["leads", "lead", "onsite leads", "onsite_leads", "lead form opens", "leadformopens", "lead form submissions", "leadformsubmissions"],
  revenue: ["purchases conversion value", "purchasesconversionvalue", "purchases_conversion_value", "purchase conversion value", "purchaseconversionvalue", "purchase_conversion_value", "conversion value", "conversionvalue", "conversion_value", "purchase value", "purchasevalue", "purchase_value", "revenue", "total revenue", "total_revenue", "website purchase conversion value", "websitepurchaseconversionvalue", "website_purchase_conversion_value", "purchase roas", "purchase_roas", "website purchase roas", "website_purchase_roas"],
  ctr: ["ctr", "ctr (all)", "ctr(all)", "ctr_all", "click through rate", "clickthroughrate", "click_through_rate", "ctr %", "ctr (click-through rate)"],
  link_ctr: ["link ctr", "linkctr", "link_ctr", "ctr (link click-through rate)", "ctr(link click-through rate)", "link_ctr", "link click through rate", "link click through ctr"],
  cpc: ["cpc", "cpc (all)", "cpc(all)", "cpc_all", "cost per click", "costperclick", "cost_per_click", "cpc (link)", "cpc(link)", "cpc_link", "cost per link click", "costperlinkclick"],
  cpm: ["cpm", "cpm (cost per 1,000 impressions)", "cpm(cost per 1,000 impressions)", "cost per 1000 impressions", "costper1000impressions", "cost_per_mille", "cpm (cost per 1000 impressions)"],
  cpa: ["cost per purchase", "costperpurchase", "cost_per_purchase", "cost per conversion", "costperconversion", "cost_per_conversion", "cost per result", "costperresult", "cost_per_result"],
  roas: ["purchase roas", "purchaseroas", "purchase_roas", "roas", "website purchase roas", "websitepurchaseroas", "website_purchase_roas", "return on ad spend", "returnonadspend"],
  aov: ["aov", "average order value", "averageordervalue", "average_order_value"],
  add_to_cart: ["adds to cart", "addstocart", "add_to_cart", "add to cart", "addtocart", "add_to_carts", "added to cart", "addedtocart"],
  initiate_checkout: ["initiate checkout", "initiatecheckout", "initiate_checkout", "checkouts initiated", "checkoutsinitiated", "checkouts_initiated", "initiated checkouts", "initiatedcheckouts", "checkout starts", "checkoutstarts"],
  quality_ranking: ["quality ranking", "qualityranking", "quality_ranking", "above_average", "quality ranking (higher is better)"],
  engagement_rate_ranking: ["engagement rate ranking", "engagementrateranking", "engagement_rate_ranking", "engagement ranking", "engagementranking"],
  conversion_rate_ranking: ["conversion rate ranking", "conversionrateranking", "conversion_rate_ranking", "conversion ranking", "conversionranking"],
  delivery_status: ["delivery", "delivery status", "deliverystatus", "delivery_status", "ad status", "adstatus", "ad_status", "status"],
  attribution_setting: ["attribution setting", "attributionsetting", "attribution_setting", "attribution window", "attributionwindow"],
  reporting_start: ["reporting starts", "reportingstarts", "reporting_starts", "starts", "start date", "startdate", "start_date", "date start", "datestart"],
  reporting_end: ["reporting ends", "reportingends", "reporting_ends", "ends", "end date", "enddate", "end_date", "date end", "dateend"],
};

const IDENTITY_KEYS = new Set(["campaign_name", "ad_name", "ad_set_id", "ad_set_name", "campaign_id", "ad_id"]);
const NUMERIC_FIELDS = new Set(RAW_FIELDS.filter((f) =>
  !["quality_ranking", "engagement_rate_ranking", "conversion_rate_ranking", "delivery_status", "attribution_setting", "reporting_start", "reporting_end"].includes(f)
));

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[\u20B9$€£₹¥]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/[\s_]+/g, " ")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .trim();
}

function findColumn(headers: string[]): Map<string, string> {
  const mapping = new Map<string, string>();
  const usedHeaders = new Set<string>();

  for (const [fieldKey, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const header of headers) {
      if (usedHeaders.has(header)) continue;
      const normalized = normalizeHeader(header);
      for (const alias of aliases) {
        if (normalized === alias || normalized.includes(alias) || alias.includes(normalized)) {
          if (normalized === alias || Math.abs(normalized.length - alias.length) <= 3) {
            mapping.set(fieldKey, header);
            usedHeaders.add(header);
            break;
          }
        }
      }
      if (mapping.has(fieldKey)) break;
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

        if (!columnMap.has("spend")) {
          errors.push("We could not detect a Spend column. Please export 'Amount Spent' from Meta Ads Manager.");
        }
        const hasPerformance = columnMap.has("purchases") || columnMap.has("leads") || columnMap.has("revenue") || columnMap.has("ctr") || columnMap.has("clicks");
        if (!hasPerformance) {
          errors.push("We could not detect Purchases, Leads, Results, or Conversions. Please include at least one result column.");
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
        if (missingFields.includes("revenue")) {
          warnings.push("Purchase Conversion Value is missing. ROAS analysis will be unavailable.");
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
