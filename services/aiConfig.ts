
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn("GEMINI_API_KEY environment variable not set. AI features will be limited.");
}

export const aiClient = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
export { API_KEY };
export { Type } from "@google/genai";

/**
 * 🤖 Astra AI Quality Improvement: Output Handling & Resilience
 * AI models can sometimes hang indefinitely or respond very slowly.
 * This wrapper enforces a strict timeout on all AI calls, ensuring
 * that the application fails fast and triggers graceful fallbacks
 * instead of leaving the user with an endless loading state.
 */
export const withTimeout = <T>(promise: Promise<T>, ms: number = 15000): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`AI call timed out after ${ms}ms`));
        }, ms);

        promise
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(timeoutId));
    });
};
