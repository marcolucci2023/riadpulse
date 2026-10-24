/**
 * Client API pour RiadPulse.
 * NE JAMAIS mettre de clé API ici (frontend public).
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
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  email: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`, {
    method: "GET",
    headers: { Accept: "application/json" },
    mode: "cors",
  });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function runSiteAudit(url: string): Promise<AuditSiteWebResponse> {
  const res = await fetch(`${API_URL}/api/v1/audit/site-web`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erreur inconnue" }));
    throw new Error(error.detail || `Audit failed: ${res.status}`);
  }
  return res.json();
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
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
    const error = await res.json().catch(() => ({ detail: "Erreur inconnue" }));
    throw new Error(error.detail || `Register failed: ${res.status}`);
  }
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
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
    const error = await res.json().catch(() => ({ detail: "Erreur inconnue" }));
    throw new Error(error.detail || `Login failed: ${res.status}`);
  }
  return res.json();
}

export function saveToken(token: string, email: string): void {
  localStorage.setItem("riadpulse_token", token);
  localStorage.setItem("riadpulse_email", email);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("riadpulse_token");
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("riadpulse_email");
}

export function logout(): void {
  localStorage.removeItem("riadpulse_token");
  localStorage.removeItem("riadpulse_email");
}