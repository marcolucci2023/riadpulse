const API_URL = "http://localhost:8000";

// ==================== TOKEN & AUTH UTILS ====================

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_email");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
  }
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Erreur ${res.status}`);
  }
  return res.json();
}

// ==================== AUTH ====================

export interface AuthResponse {
  access_token: string;
  token_type: string;
  email: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erreur de connexion");
  }
  return res.json();
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erreur d'inscription");
  }
  return res.json();
}

// ==================== SITE WEB ====================

export interface SiteWebCriteria {
  https: { score: number; max: number; detail: string };
  speed: { score: number; max: number; detail: string };
  responsive: { score: number; max: number; detail: string };
  tech: { score: number; max: number; detail: string };
}

export interface SiteWebResult {
  url: string;
  total_score: number;
  max_total: number;
  grade: string;
  criteria: SiteWebCriteria;
}

export async function auditSiteWeb(url: string): Promise<SiteWebResult> {
  return authFetch(`${API_URL}/api/v1/audit/site-web`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

// ==================== PRICING ====================

export interface PricingRecommendation {
  title: string;
  detail: string;
  impact_mad: number;
  difficulty: string;
}

export interface PricingResult {
  riad_name: string;
  city: string;
  stars: number;
  current_price_mad: number;
  benchmark_price_mad: number;
  price_gap_percent: number;
  annual_loss_mad: number;
  annual_loss_eur: number;
  occupancy_rate: number;
  num_rooms: number;
  recommendations: PricingRecommendation[];
}

export async function auditPricing(data: {
  riad_name: string;
  city: string;
  stars: number;
  current_price_mad: number;
  num_rooms: number;
  occupancy_rate: number;
}): Promise<PricingResult> {
  return authFetch(`${API_URL}/api/v1/audit/pricing`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==================== REPUTATION ====================

export interface PlatformScore {
  platform: string;
  score: number;
  max_score: number;
  normalized: number;
  review_count: number;
  color: string;
}

export interface ReputationRecommendation {
  title: string;
  detail: string;
  impact_points: number;
  difficulty: string;
}

export interface ReputationResult {
  riad_name: string;
  city: string;
  total_score: number;
  max_total: number;
  grade: string;
  platforms: PlatformScore[];
  response_rate_percent: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: ReputationRecommendation[];
}

export async function auditReputation(data: {
  riad_name: string;
  city: string;
  booking_score: number;
  booking_reviews: number;
  tripadvisor_score: number;
  tripadvisor_reviews: number;
  google_score: number;
  google_reviews: number;
  response_rate_percent: number;
}): Promise<ReputationResult> {
  return authFetch(`${API_URL}/api/v1/audit/reputation`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==================== COMMISSIONS ====================

export interface PlatformCost {
  name: string;
  revenue_mad: number;
  commission_rate: number;
  commission_mad: number;
  commission_eur: number;
  color: string;
}

export interface CommissionRecommendation {
  title: string;
  detail: string;
  saving_mad: number;
  difficulty: string;
}

export interface CommissionResult {
  riad_name: string;
  city: string;
  annual_revenue_mad: number;
  annual_revenue_eur: number;
  total_commission_mad: number;
  total_commission_eur: number;
  commission_percent: number;
  platforms: PlatformCost[];
  direct_revenue_mad: number;
  potential_direct_percent: number;
  potential_saving_mad: number;
  potential_saving_eur: number;
  cost_per_booking_mad: number;
  recommendations: CommissionRecommendation[];
}

export async function auditCommissions(data: {
  riad_name: string;
  city: string;
  annual_revenue_mad: number;
  booking_percent: number;
  airbnb_percent: number;
  expedia_percent: number;
  direct_percent: number;
  avg_night_price_mad: number;
  num_rooms: number;
}): Promise<CommissionResult> {
  return authFetch(`${API_URL}/api/v1/audit/commissions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==================== HISTORY ====================

export interface AuditRecord {
  id: number;
  url: string;
  total_score: number;
  max_total: number;
  grade: string;
  created_at: string;
}

export async function getAudits(): Promise<AuditRecord[]> {
  return authFetch(`${API_URL}/api/v1/audits/`);
}

// ==================== SCORE GLOBAL ====================

export interface SubScore {
  score: number;
  max_score: number;
  grade: string;
  weight: number;
  weighted_score: number;
}

export interface Priority {
  rank: number;
  module: string;
  title: string;
  detail: string;
  impact_mad: number;
  difficulty: string;
}

export interface GlobalAuditResponse {
  riad_name: string;
  city: string;
  global_score: number;
  grade: string;
  total_annual_loss_mad: number;
  total_annual_loss_eur: number;
  sub_scores: Record<string, SubScore>;
  top_priorities: Priority[];
  city_position: string;
  modules: Record<string, any>;
}

export async function runGlobalAudit(data: {
  riad_name: string;
  city: string;
  stars: number;
  url: string;
  current_price_mad: number;
  num_rooms: number;
  occupancy_rate: number;
  annual_revenue_mad: number;
  booking_percent: number;
  airbnb_percent: number;
  expedia_percent: number;
  direct_percent: number;
  booking_score: number;
  booking_reviews: number;
  tripadvisor_score: number;
  tripadvisor_reviews: number;
  google_score: number;
  google_reviews: number;
  response_rate_percent: number;
}): Promise<GlobalAuditResponse> {
  return authFetch(`${API_URL}/api/v1/audit/global`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==================== ALIAS (compatibilité pages) ====================

export { auditSiteWeb as runSiteWebAudit };
export { auditSiteWeb as runSiteAudit };
export type { SiteWebResult as SiteWebAuditResponse };
export type { SiteWebResult as AuditSiteWebResponse };

export { auditPricing as runPricingAudit };
export type { PricingResult as PricingAuditResponse };

export { auditReputation as runReputationAudit };
export type { ReputationResult as ReputationAuditResponse };

export { auditCommissions as runCommissionsAudit };
export type { CommissionResult as CommissionsAuditResponse };

export { getAudits as getMyAudits };