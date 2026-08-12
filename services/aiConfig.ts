import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn("GEMINI_API_KEY environment variable not set. AI features will be limited.");
}

export const aiClient = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Wraps a promise with a timeout, throwing an error if it takes too long.
 * Essential for AI model calls to prevent unbounded execution and trigger graceful fallbacks.
 */
export const withTimeout = <T>(promise: Promise<T>, ms: number = 10000): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms)
        )
    ]);
};

/**
 * Safely parses JSON output from an AI model.
 * Handles cases where the model wraps JSON in markdown blocks (e.g., ```json ... ```)
 * or includes extraneous text before/after the JSON.
 */
export const safeParseJSON = <T>(text: string): T | null => {
  try {
    // First, try standard parsing in case it's already clean
    return JSON.parse(text) as T;
  } catch (e) {
    // If it fails, try to extract JSON from the text
    try {
      const start = text.indexOf('{');
      const startArray = text.indexOf('[');
      const end = text.lastIndexOf('}');
      const endArray = text.lastIndexOf(']');

      let actualStart = start;
      let actualEnd = end;

      if (startArray !== -1 && (start === -1 || startArray < start)) {
          actualStart = startArray;
          actualEnd = endArray;
      }

      if (actualStart !== -1 && actualEnd !== -1 && actualEnd > actualStart) {
        const jsonText = text.slice(actualStart, actualEnd + 1);
        return JSON.parse(jsonText) as T;
      }
      return null;
    } catch (innerError) {
      return null;
    }
  }
};

export { API_KEY };
export { Type } from "@google/genai";
