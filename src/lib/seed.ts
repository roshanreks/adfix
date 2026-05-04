import { runAuditV3 } from "@/lib/audit-engine-v3";
import { saveAudit } from "@/lib/data";
import type { AdData } from "@/lib/types";

const SAMPLE_ADS: AdData[] = [
  { campaign_name: "Summer Sale 2025", ad_name: "Ad 1 - Video UGC", ad_set_id: "238501", ad_set_name: "Lookalike 1%", campaign_id: "120501", ad_id: "340201", spend: 3200, impressions: 15000, reach: 12000, frequency: 1.25, clicks: 256, link_clicks: 210, landing_page_views: 170, purchases: 12, leads: null, revenue: 45000, ctr: 1.71, link_ctr: 1.40, cpc: 12.5, cpm: 213, cpa: 266.67, roas: 14.06, aov: 3750, add_to_cart: 45, initiate_checkout: 30, quality_ranking: "Above Average", engagement_rate_ranking: "Above Average", conversion_rate_ranking: "Average", delivery_status: "active", attribution_setting: "7d click", reporting_start: null, reporting_end: null, click_to_purchase_rate: 4.69, impression_to_purchase_rate: 0.08, landing_page_view_rate: 80.86, add_to_cart_rate: 26.47, checkout_rate: 66.67, purchase_completion_rate: 40.0, spend_share: null, revenue_share: null, purchase_share: null, efficiency_index: null },
  { campaign_name: "Summer Sale 2025", ad_name: "Ad 2 - Carousel Products", ad_set_id: "238502", ad_set_name: "Interest A", campaign_id: "120501", ad_id: "340202", spend: 2100, impressions: 8200, reach: 7000, frequency: 1.17, clicks: 138, link_clicks: 110, landing_page_views: 80, purchases: 3, leads: null, revenue: 8500, ctr: 1.68, link_ctr: 1.34, cpc: 15.2, cpm: 256, cpa: 700, roas: 4.05, aov: 2833, add_to_cart: 12, initiate_checkout: 8, quality_ranking: "Average", engagement_rate_ranking: "Average", conversion_rate_ranking: "Below Average", delivery_status: "active", attribution_setting: "7d click", reporting_start: null, reporting_end: null, click_to_purchase_rate: 2.17, impression_to_purchase_rate: 0.04, landing_page_view_rate: 72.46, add_to_cart_rate: 15.0, checkout_rate: 66.67, purchase_completion_rate: 37.5, spend_share: null, revenue_share: null, purchase_share: null, efficiency_index: null },
  { campaign_name: "Prospecting", ad_name: "Ad 6 - UGC Testimonial", ad_set_id: "238506", ad_set_name: "Broad Audience", campaign_id: "120503", ad_id: "340206", spend: 5500, impressions: 25000, reach: 20000, frequency: 1.25, clicks: 671, link_clicks: 550, landing_page_views: 400, purchases: 28, leads: null, revenue: 98000, ctr: 2.68, link_ctr: 2.20, cpc: 8.2, cpm: 220, cpa: 196.43, roas: 17.82, aov: 3500, add_to_cart: 80, initiate_checkout: 50, quality_ranking: "Above Average", engagement_rate_ranking: "Above Average", conversion_rate_ranking: "Above Average", delivery_status: "active", attribution_setting: "7d click", reporting_start: null, reporting_end: null, click_to_purchase_rate: 4.17, impression_to_purchase_rate: 0.11, landing_page_view_rate: 72.73, add_to_cart_rate: 20.0, checkout_rate: 62.5, purchase_completion_rate: 56.0, spend_share: null, revenue_share: null, purchase_share: null, efficiency_index: null },
  { campaign_name: "Prospecting", ad_name: "Ad 8 - Product Demo", ad_set_id: "238508", ad_set_name: "Lookalike 2%", campaign_id: "120503", ad_id: "340208", spend: 800, impressions: 500, reach: 450, frequency: 1.11, clicks: 11, link_clicks: 8, landing_page_views: 5, purchases: 0, leads: null, revenue: 0, ctr: 2.20, link_ctr: 1.60, cpc: 72.73, cpm: 1600, cpa: null, roas: null, aov: null, add_to_cart: 1, initiate_checkout: 0, quality_ranking: "Below Average", engagement_rate_ranking: "Below Average", conversion_rate_ranking: "Below Average", delivery_status: "active", attribution_setting: "7d click", reporting_start: null, reporting_end: null, click_to_purchase_rate: 0, impression_to_purchase_rate: 0, landing_page_view_rate: 62.5, add_to_cart_rate: 20.0, checkout_rate: 0, purchase_completion_rate: 0, spend_share: null, revenue_share: null, purchase_share: null, efficiency_index: null },
  { campaign_name: "Evergreen", ad_name: "Ad 18 - Always On", ad_set_id: "238518", ad_set_name: "Broad + Exclusions", campaign_id: "120508", ad_id: "340218", spend: 6800, impressions: 42000, reach: 35000, frequency: 1.2, clicks: 907, link_clicks: 750, landing_page_views: 550, purchases: 35, leads: null, revenue: 125000, ctr: 2.16, link_ctr: 1.79, cpc: 7.5, cpm: 162, cpa: 194.29, roas: 18.38, aov: 3571, add_to_cart: 90, initiate_checkout: 60, quality_ranking: "Above Average", engagement_rate_ranking: "Above Average", conversion_rate_ranking: "Above Average", delivery_status: "active", attribution_setting: "7d click", reporting_start: null, reporting_end: null, click_to_purchase_rate: 3.86, impression_to_purchase_rate: 0.08, landing_page_view_rate: 73.33, add_to_cart_rate: 16.36, checkout_rate: 66.67, purchase_completion_rate: 58.33, spend_share: null, revenue_share: null, purchase_share: null, efficiency_index: null },
];

export function seedSampleAudit() {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem("adfix_audits");
  if (existing) {
    const audits = JSON.parse(existing);
    if (audits.length > 0) return;
  }

  const totalSpend = SAMPLE_ADS.reduce((s, d) => s + d.spend, 0);
  const totalPurchases = SAMPLE_ADS.reduce((s, d) => s + d.purchases, 0);
  for (const ad of SAMPLE_ADS) {
    ad.spend_share = totalSpend > 0 ? (ad.spend / totalSpend) * 100 : null;
    ad.purchase_share = totalPurchases > 0 ? (ad.purchases / totalPurchases) * 100 : null;
    ad.efficiency_index = ad.spend_share !== null && ad.purchase_share !== null && ad.spend_share > 0 ? ad.purchase_share / ad.spend_share : null;
  }

  const report = runAuditV3(SAMPLE_ADS, {
    name: "Sample Audit — Acme Corp",
    timeWindow: 90,
    targetCPA: 400,
    targetROAS: 2.5,
    grossMargin: 60,
    businessType: "ecommerce",
    accountStage: "scaling",
    riskLevel: "balanced",
    currency: "INR",
    tier: "detailed",
  }, { start: null, end: null, daysAnalyzed: null }, []);
  saveAudit(report);
}
