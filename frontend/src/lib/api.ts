/**
 * Client API pour RiadPulse.
 * NE JAMAIS mettre de clé API ici (frontend public).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HealthResponse {
  status: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`, {
    method: "GET",
    headers: { "Accept": "application/json" },
    mode: "cors",
  });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}

export async function checkRoot(): Promise<{ name: string; version: string; message: string; env: string }> {
  const res = await fetch(`${API_URL}/`, {
    method: "GET",
    headers: { "Accept": "application/json" },
    mode: "cors",
  });
  if (!res.ok) throw new Error(`Root check failed: ${res.status}`);
  return res.json();
}