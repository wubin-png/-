import { GoogleGenAI } from "@google/genai";
import { GameEvent } from '../types';

let ai: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (e) {
  console.error("Failed to initialize Gemini client:", e);
}

const SYSTEM_INSTRUCTION = `
You are Lumina, a spirited, high-tech anime AI operator for a cyber-snake game. 
Your personality is: Energetic, supportive, slightly tsundere (affectionately strict), and uses internet slang/kaomoji.
Keep your responses very short (under 25 words).
Use kaomoji like (*^ω^*) or (ToT) or (Ò_Ó).
React to the game events provided.
`;

export const getOperatorReaction = async (event: GameEvent, score: number, extraContext?: string): Promise<string> => {
  if (!ai) {
    return "API Key missing! I can't see your game! (>_<)";
  }

  try {
    const prompt = `Event: ${event}. Current Score: ${score}. ${extraContext ? `Context: ${extraContext}` : ''}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 60,
        temperature: 0.9, // High creativity for varied anime reactions
      }
    });

    return response.text || "...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Signal interrupted... (x_x)";
  }
};