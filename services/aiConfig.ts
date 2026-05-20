
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn("GEMINI_API_KEY environment variable not set. AI features will be limited.");
}

export const aiClient = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
export { API_KEY };
export { Type } from "@google/genai";
