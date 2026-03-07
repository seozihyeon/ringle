import { UserProfile } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function postJson(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export const geminiService = {
  async generateCurriculum(profile: UserProfile) {
    return postJson('/api/generate-curriculum', profile).catch(err => {
      console.error('Curriculum generation failed:', err);
      return null;
    });
  },

  async generateFeedback(transcript: string) {
    return postJson('/api/generate-feedback', { transcript }).catch(err => {
      console.error('Feedback generation failed:', err);
      return null;
    });
  },

  async generateQuiz(topic: string) {
    return postJson('/api/generate-quiz', { topic }).catch(err => {
      console.error('Quiz generation failed:', err);
      return null;
    });
  }
};
