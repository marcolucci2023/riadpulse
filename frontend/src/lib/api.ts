const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getHeaders(json = true): HeadersInit {
  const h: Record<string, string> = {};
  if (json) h["Content-Type"] = "application/json";
  if (typeof window !== "undefined") {
    const t = localStorage.getItem("token");
    if (t) h["Authorization"] = `Bearer ${t}`;
  }
  return h;
}

async function handle(r: Response) {
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error(d.detail || `HTTP ${r.status}`);
  }
  return r.json();
}

export async function registerUser(email: string, password: string) {
  return handle(await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  }));
}

export async function loginUser(email: string, password: string) {
  return handle(await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  }));
}

export function saveToken(t: string) {
  if (typeof window !== "undefined") localStorage.setItem("token", t);
}

export function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

export async function runSiteAudit(url: string) {
  return handle(await fetch(`${API_URL}/api/v1/audit/site-web`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ url }),
  }));
}

export async function runSiteWebAudit(url: string) {
  return runSiteAudit(url);
}

export async function runPricingAudit(data: {
  riad_name: string;
  city: string;
  my_price: number;
  stars: number;
  num_rooms: number;
  occupancy_rate: number;
}) {
  return handle(await fetch(`${API_URL}/api/v1/audit/pricing`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }));
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
}) {
  return handle(await fetch(`${API_URL}/api/v1/audit/reputation`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }));
}

export async function runCommissionsAudit(data: {
  riad_name: string;
  city: string;
  annual_revenue_mad: number;
  booking_percent: number;
  airbnb_percent: number;
  expedia_percent: number;
  direct_percent: number;
  avg_night_price_mad: number;
  num_rooms: number;
}) {
  return handle(await fetch(`${API_URL}/api/v1/audit/commissions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }));
}

export async function runGlobalAudit(data: {
  riad_name: string;
  city: string;
  url?: string;
  my_price?: number;
  stars?: number;
  num_rooms?: number;
  occupancy_rate?: number;
  booking_score?: number;
  booking_reviews?: number;
  tripadvisor_score?: number;
  tripadvisor_reviews?: number;
  google_score?: number;
  google_reviews?: number;
  response_rate?: number;
  negative_reviews_last_6m?: number;
  annual_revenue_mad?: number;
  booking_percent?: number;
  airbnb_percent?: number;
  expedia_percent?: number;
  direct_percent?: number;
  avg_night_price_mad?: number;
}) {
  return handle(await fetch(`${API_URL}/api/v1/audit/global`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  }));
}

export async function runGlobalScore(data: Record<string, unknown>) {
  return runGlobalAudit(data as Parameters<typeof runGlobalAudit>[0]);
}

export async function getMyAudits() {
  return handle(await fetch(`${API_URL}/api/v1/audits/`, {
    headers: getHeaders(),
  }));
}

export const checkHealth = async () =>
  handle(await fetch(`${API_URL}/health`));