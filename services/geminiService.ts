
import { GoogleGenAI, Type } from "@google/genai";
import { TranslationMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const translateText = async (
  text: string, 
  mode: TranslationMode,
  context: string = ""
) => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are a professional real-time translator for streamers.
    Source: Spanish.
    Target: ${mode === TranslationMode.ENGLISH ? 'English' : mode === TranslationMode.JAPANESE ? 'Japanese' : 'Both English and Japanese'}.
    Rules:
    - Keep the tone natural and informal (streaming context).
    - If dual mode, return a JSON object with "en" and "jp" fields.
    - Preserve emojis and emotions.
    - Current context: ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: text,
      config: {
        systemInstruction,
        responseMimeType: mode === TranslationMode.DUAL ? "application/json" : "text/plain",
        responseSchema: mode === TranslationMode.DUAL ? {
          type: Type.OBJECT,
          properties: {
            en: { type: Type.STRING },
            jp: { type: Type.STRING }
          },
          required: ["en", "jp"]
        } : undefined
      }
    });

    return response.text;
  } catch (error) {
    console.error("Translation error:", error);
    return null;
  }
};
