import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  async generateCurriculum(profile: UserProfile) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `Create a personalized English learning curriculum based on this user profile: ${JSON.stringify(profile)}.
        
        Requirements:
        1. The curriculum should have 2-3 tracks.
        2. If the user selected specific sub-categories (like PM, UX, 개발), create tracks specifically for those fields.
        3. ALL Unit titles MUST be in Korean (e.g., "비즈니스 미팅 기초", "UX 디자인 피드백 주고받기").
        4. Each track should have 5-6 units.
        5. Return a JSON object matching the Curriculum interface.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tracks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    units: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.NUMBER },
                          title: { type: Type.STRING },
                          track: { type: Type.STRING },
                          items: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                title: { type: Type.STRING },
                                type: { type: Type.STRING },
                                time: { type: Type.STRING },
                                icon: { type: Type.STRING }
                              },
                              required: ["title", "type", "time", "icon"]
                            }
                          }
                        },
                        required: ["id", "title", "track", "items"]
                      }
                    }
                  },
                  required: ["name", "units"]
                }
              }
            },
            required: ["tracks"]
          }
        }
      });

      const text = response.text;
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error("Curriculum generation failed:", error);
      return null;
    }
  },

  async generateFeedback(transcript: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following English speaking transcript and provide feedback in JSON format. 
      Include:
      1. A score out of 100.
      2. 2-3 specific feedback points (e.g., grammar, vocabulary, pronunciation).
      3. A "Best Moment" (a well-formed sentence from the transcript).
      
      Transcript: "${transcript}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  point: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                },
                required: ["point", "suggestion"]
              }
            },
            bestMoment: { type: Type.STRING }
          },
          required: ["score", "feedback", "bestMoment"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  },

  async generateQuiz(topic: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a quick English speaking quiz about "${topic}". 
      Return a JSON object with:
      1. A question/prompt for the user.
      2. A "hint" or "key expression" to use.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING },
            hint: { type: Type.STRING }
          },
          required: ["prompt", "hint"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  }
};
