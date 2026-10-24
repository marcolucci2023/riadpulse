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

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`, {
    method: "GET",
    headers: { Accept: "application/json" },
    mode: "cors",
  });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
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