
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

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

export { API_KEY };
export { Type } from "@google/genai";
