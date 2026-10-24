/**
 * Client API pour RiadPulse.
 * Ne jamais mettre de secrets ou clés API dans ce fichier.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HealthResponse {
  status: string;
}

export interface AuditCriterion {
  name: string;
  score: number;
  max_score: number;
  detail: string;
}

export interface AuditSiteWebResponse {
  url: string;
  total_score: number;
  max_total: number;
  grade: string;
  criteria: AuditCriterion[];
  saved: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  email: string;
}

export interface PricingBenchmark {
  city: string;
  stars: number;
  low_price: number;
  median_price: number;
  high_price: number;
  source: string;
}

export interface PricingRecommendation {
  title: string;
  detail: string;
  impact_mad: number;
}

export interface PricingAuditResponse {
  riad_name: string;
  city: string;
  my_price: number;
  benchmark: PricingBenchmark;
  positioning: string;
  positioning_detail: string;
  gap_percent: number;
  gap_mad_per_night: number;
  estimated_annual_loss_mad: number;
  estimated_annual_loss_eur: number;
  recommendations: PricingRecommendation[];
}

export interface ReputationCriterion {
  name: string;
  score: number;
  max_score: number;
  detail: string;
}

export interface ReputationRecommendation {
  title: string;
  detail: string;
  priority: string;
  impact_points: number;
}

export interface ReputationAuditResponse {
  riad_name: string;
  city: string;
  total_score: number;
  max_total: number;
  grade: string;
  total_reviews: number;
  avg_platform_score: number;
  benchmark_avg: number;
  benchmark_source: string;
  criteria: ReputationCriterion[];
  strengths: string[];
  weaknesses: string[];
  recommendations: ReputationRecommendation[];
}

function authHeaders(): Record<string, string> {
  const token = getToken();

  if (token) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    mode: "cors",
  });

  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }

  return res.json();
}

export async function runSiteAudit(
  url: string
): Promise<AuditSiteWebResponse> {
  const res = await fetch(`${API_URL}/api/v1/audit/site-web`, {
    method: "POST",
    headers: authHeaders(),
    mode: "cors",
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ detail: "Erreur inconnue" }));

    throw new Error(error.detail || `Audit failed: ${res.status}`);
  }

  return res.json();
}

export async function getMyAudits(): Promise<AuditSiteWebResponse[]> {
  const res = await fetch(`${API_URL}/api/v1/audits/`, {
    method: "GET",
    headers: authHeaders(),
    mode: "cors",
  });

  if (!res.ok) {
    throw new Error(`Impossible de récupérer les audits : ${res.status}`);
  }

  return res.json();
}

export async function registerUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ detail: "Erreur inconnue" }));

    throw new Error(error.detail || `Register failed: ${res.status}`);
  }

  return res.json();
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ detail: "Erreur inconnue" }));

    throw new Error(error.detail || `Login failed: ${res.status}`);
  }

  return res.json();
}

export function saveToken(token: string, email: string): void {
  localStorage.setItem("riadpulse_token", token);
  localStorage.setItem("riadpulse_email", email);
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("riadpulse_token");
}

export function getEmail(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("riadpulse_email");
}

export function logout(): void {
  localStorage.removeItem("riadpulse_token");
  localStorage.removeItem("riadpulse_email");
}

export async function runPricingAudit(data: {
  riad_name: string;
  city: string;
  my_price_per_night: number;
  stars: number;
  num_rooms: number;
  occupancy_rate: number;
}): Promise<PricingAuditResponse> {
  const res = await fetch(`${API_URL}/api/v1/audit/pricing`, {
    method: "POST",
    headers: authHeaders(),
    mode: "cors",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ detail: "Erreur inconnue" }));

    throw new Error(error.detail || `Pricing audit failed: ${res.status}`);
  }

  return res.json();
}

export async function runReputationAudit(data: {
  riad_name: string;
  city: string;
  booking_score: number;
  booking_reviews: number;
  tripadvisor_score: number;
  tripadvisor_reviews: number;
  google_score: number;
  google_reviews: number;
  response_rate: number;
  negative_reviews_last_6m: number;
}): Promise<ReputationAuditResponse> {
  const res = await fetch(`${API_URL}/api/v1/audit/reputation`, {
    method: "POST",
    headers: authHeaders(),
    mode: "cors",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ detail: "Erreur inconnue" }));

    throw new Error(
      error.detail || `Reputation audit failed: ${res.status}`
    );
  }

  return res.json();
}