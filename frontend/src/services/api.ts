import type { CandidateProfile, CurriculumDay, InterviewResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const REQUEST_TIMEOUT_MS = 90_000; // 90s — LLM can be slow under rate limits

/**
 * Fetch wrapper with AbortController timeout.
 * Prevents the UI from hanging forever if the backend is slow or unresponsive.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The AI is taking too long — please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchCandidates(): Promise<CandidateProfile[]> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/candidates`);
  if (!res.ok) {
    throw new Error(`Failed to load candidate profiles (HTTP ${res.status}).`);
  }
  return res.json();
}

export async function fetchCurriculum(): Promise<CurriculumDay[]> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/curriculum`);
  if (!res.ok) {
    throw new Error(`Failed to load curriculum data (HTTP ${res.status}).`);
  }
  return res.json();
}

export async function startInterviewSession(
  sessionId: string,
  candidate: CandidateProfile
): Promise<InterviewResponse> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, candidate })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.details || errorData.error || `Failed to start interview session (HTTP ${res.status}).`);
  }

  return res.json();
}

export async function sendInterviewTurn(
  sessionId: string,
  message: string
): Promise<InterviewResponse> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.details || errorData.error || `Failed to submit response (HTTP ${res.status}).`);
  }

  return res.json();
}
