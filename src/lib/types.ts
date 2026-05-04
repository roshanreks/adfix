export type AdVerdict = "SCALE" | "FIX" | "KILL" | "WATCH" | "NO_ACTION" | "INSUFFICIENT_DATA";
export type Priority = "High" | "Medium" | "Low";
export type ConfidenceLevel = "High" | "Medium" | "Low";
export type AuditTier = "basic" | "detailed";
export type BusinessType = "ecommerce" | "lead_generation" | "app_installs" | "awareness" | "engagement" | "other";
export type AccountStage = "testing" | "scaling" | "mature";
export type RiskLevel = "conservative" | "balanced" | "aggressive";
export type Currency = "INR" | "USD" | "AED" | "EUR" | "GBP" | "other";
export type IssueType = "creative" | "funnel" | "audience_delivery" | "offer" | "tracking" | "none";
export type ScaleLevel = "conservative" | "balanced" | "aggressive";
export type BenchmarkSource = "target_input" | "account_average" | "median";

export interface AdRaw {
  [key: string]: string | number | null | undefined;
}

export interface AdData {
  campaign_name: string;
  ad_name: string;
  ad_set_id: string;
  ad_set_name: string;
  campaign_id: string;
  ad_id: string;
  spend: number;
  impressions: number;
  reach: number | null;
  frequency: number | null;
  clicks: number;
  link_clicks: number | null;
  landing_page_views: number | null;
  purchases: number;
  leads: number | null;
  revenue: number | null;
  ctr: number | null;
  link_ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  cpa: number | null;
  roas: number | null;
  aov: number | null;
  add_to_cart: number | null;
  initiate_checkout: number | null;
  quality_ranking: string | null;
  engagement_rate_ranking: string | null;
  conversion_rate_ranking: string | null;
  delivery_status: string | null;
  attribution_setting: string | null;
  reporting_start: string | null;
  reporting_end: string | null;
  click_to_purchase_rate: number | null;
  impression_to_purchase_rate: number | null;
  landing_page_view_rate: number | null;
  add_to_cart_rate: number | null;
  checkout_rate: number | null;
  purchase_completion_rate: number | null;
  spend_share: number | null;
  revenue_share: number | null;
  purchase_share: number | null;
  efficiency_index: number | null;
}

export interface AdAuditResult {
  ad_id: string;
  ad_name: string;
  campaign_name: string;
  ad_set_name: string;
  verdict: AdVerdict;
  verdict_reason: string;
  recommended_action: string;
  decision_confidence: ConfidenceLevel;
  issue_type: IssueType;
  spend: number;
  purchases: number;
  leads: number | null;
  revenue: number | null;
  cpa: number | null;
  roas: number | null;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  wasted_budget: number;
  confidence_score: number;
  scale_level?: ScaleLevel;
  budget_increase_pct?: string;
  scale_warnings?: string[];
  fix_recommendations?: string[];
}

export interface WasteBreakdown {
  total_wasted_budget: number;
  hard_waste: number;
  cpa_waste: number;
  roas_waste: number;
  creative_waste: number;
  waste_percentage: number;
  top_waste_contributors: {
    ad_id: string;
    ad_name: string;
    spend: number;
    wasted_amount: number;
    reason: string;
    action: string;
  }[];
}

export interface AuditConfig {
  name: string;
  timeWindow: number;
  targetCPA?: number;
  targetROAS?: number;
  grossMargin?: number;
  businessType: BusinessType;
  accountStage: AccountStage;
  riskLevel: RiskLevel;
  currency: Currency;
  tier: AuditTier;
}

export interface AuditReport {
  id: string;
  name: string;
  createdAt: string;
  audit_metadata: {
    reporting_start: string | null;
    reporting_end: string | null;
    days_analyzed: number | null;
    currency: string;
    business_type: string;
    account_stage: string;
    risk_level: string;
    target_cpa: number | null;
    target_roas: number | null;
    gross_margin: number | null;
    breakeven_roas: number | null;
    benchmark_source: BenchmarkSource;
    confidence_level: ConfidenceLevel;
    confidence_score: number;
    confidence_reason: string;
  };
  account_summary: {
    health_score: number;
    health_label: string;
    total_spend: number;
    total_revenue: number;
    total_purchases: number;
    total_leads: number;
    avg_cpa: number;
    median_cpa: number;
    avg_roas: number;
    median_roas: number;
    avg_ctr: number;
    avg_cpc: number;
    avg_cpm: number;
    wasted_budget: number;
    waste_percentage: number;
    efficient_spend: number;
    fixable_spend: number;
    scalable_spend: number;
    actions_required: number;
    summary_text: string;
  };
  ai_insight: {
    headline: string;
    paragraph_1: string;
    paragraph_2: string;
    biggest_opportunity: string;
    biggest_risk: string;
    next_best_action: string;
  };
  classification_breakdown: {
    scale: { count: number; spend: number; revenue: number };
    fix: { count: number; spend: number; revenue: number };
    kill: { count: number; spend: number; revenue: number };
    watch: { count: number; spend: number; revenue: number };
    no_action: { count: number; spend: number; revenue: number };
    insufficient_data: { count: number; spend: number; revenue: number };
  };
  waste_breakdown: WasteBreakdown;
  benchmarks: {
    avg_cpa: number;
    median_cpa: number;
    avg_roas: number;
    median_roas: number;
    avg_ctr: number;
    median_ctr: number;
    avg_cpc: number;
    avg_cpm: number;
    avg_aov: number;
    best_performer: string;
    worst_performer: string;
    highest_spend_ad: string;
    highest_waste_contributor: string;
    most_scalable_asset: string;
  };
  scale_opportunities: {
    ad_name: string;
    cpa: number | null;
    roas: number | null;
    purchases: number;
    recommended_budget_action: string;
    confidence: ConfidenceLevel;
    why_scale: string;
    scale_level: ScaleLevel;
    budget_increase_pct: string;
    what_to_do_next: string;
    what_not_to_do: string;
    warnings: string[];
  }[];
  fix_opportunities: {
    ad_name: string;
    issue_type: IssueType;
    diagnosis: string;
    recommended_fix: string[];
    confidence: ConfidenceLevel;
  }[];
  kill_recommendations: {
    ad_name: string;
    spend: number;
    cpa: number | null;
    wasted_budget: number;
    reason: string;
    action: string;
  }[];
  watch_items: {
    ad_name: string;
    spend: number;
    purchases: number;
    reason: string;
  }[];
  campaign_structure_audit: {
    number_of_campaigns: number;
    number_of_adsets: number;
    number_of_ads: number;
    avg_ads_per_adset: number;
    avg_adsets_per_campaign: number;
    budget_fragmentation_score: number;
    diagnosis: string;
    issues_found: string[];
    recommendations: string[];
  };
  creative_audit: {
    diagnosis: string;
    fatigue_detected: boolean;
    fatigue_confidence: string;
    creative_issues: string[];
    creative_tests_to_launch: string[];
  };
  funnel_audit: {
    funnel_metrics_available: boolean;
    diagnosis: string;
    metrics: Record<string, number | null>;
    issues_found: string[];
    recommendations: string[];
  };
  tracking_audit: {
    tracking_confidence: string;
    missing_fields: string[];
    possible_tracking_issues: string[];
    recommendations: string[];
  };
  priority_actions: {
    action: string;
    impact: string;
    urgency: "High" | "Medium" | "Low";
  }[];
  ad_level_audit: AdAuditResult[];
  missing_data: {
    critical_missing_fields: string[];
    important_missing_fields: string[];
    recommended_next_export_columns: string[];
    how_missing_data_affects_audit: string;
  };
  currency: Currency;
  tier: AuditTier;
  timeWindow: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: "free" | "basic" | "detailed";
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface UserPreferences {
  defaultTimeWindow: number;
  defaultMinSpend: number;
  defaultTargetCPA?: number;
  defaultTargetROAS?: number;
  defaultGrossMargin?: number;
  defaultBusinessType?: BusinessType;
  defaultAccountStage?: AccountStage;
  defaultRiskLevel?: RiskLevel;
  defaultCurrency?: Currency;
}
