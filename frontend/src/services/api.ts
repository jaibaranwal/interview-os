import type { CandidateProfile, CurriculumDay, InterviewResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchCandidates(): Promise<CandidateProfile[]> {
  const res = await fetch(`${API_BASE_URL}/candidates`);
  if (!res.ok) {
    throw new Error('Failed to load candidate profiles.');
  }
  return res.json();
}

export async function fetchCurriculum(): Promise<CurriculumDay[]> {
  const res = await fetch(`${API_BASE_URL}/curriculum`);
  if (!res.ok) {
    throw new Error('Failed to load curriculum metadata.');
  }
  return res.json();
}

export async function startInterviewSession(
  sessionId: string,
  candidate: CandidateProfile
): Promise<InterviewResponse> {
  const res = await fetch(`${API_BASE_URL}/interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, candidate })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.details || 'Failed to initialize interview session.');
  }

  return res.json();
}

export async function sendInterviewTurn(
  sessionId: string,
  message: string
): Promise<InterviewResponse> {
  const res = await fetch(`${API_BASE_URL}/interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.details || 'Failed to submit interview turn.');
  }

  return res.json();
}
