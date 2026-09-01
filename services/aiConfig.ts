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
 *
 * AI Quality Improvement:
 * Iteratively searches for valid JSON blocks. This prevents crashing when the
 * model response includes conversational text with brackets or braces before
 * the actual JSON object (e.g., "Here is an array [of things]: \n [ { ... } ]").
 */
export const safeParseJSON = <T>(text: string): T | null => {
  try {
    // First, try standard parsing in case it's already clean
    return JSON.parse(text) as T;
  } catch (e) {
    // If it fails, try to extract JSON from the text
    try {
      // Look for explicit markdown JSON blocks first
      const matchBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (matchBlock) {
          try { return JSON.parse(matchBlock[1]) as T; } catch (e) {}
      }

      // Find all bracket/brace indices
      const findIndices = (char: string) => {
          const indices = [];
          let i = text.indexOf(char);
          while (i !== -1) {
              indices.push(i);
              i = text.indexOf(char, i + 1);
          }
          return indices;
      };

      const leftCurlies = findIndices('{');
      const rightCurlies = findIndices('}');

      let validObj: T | null = null;
      outerObj: for (const start of leftCurlies) {
          for (let i = rightCurlies.length - 1; i >= 0; i--) {
              const end = rightCurlies[i];
              if (end <= start) break;
              try {
                  validObj = JSON.parse(text.slice(start, end + 1));
                  break outerObj;
              } catch(e) {}
          }
      }

      const leftBrackets = findIndices('[');
      const rightBrackets = findIndices(']');

      let validArr: T | null = null;
      outerArr: for (const start of leftBrackets) {
          for (let i = rightBrackets.length - 1; i >= 0; i--) {
              const end = rightBrackets[i];
              if (end <= start) break;
              try {
                  validArr = JSON.parse(text.slice(start, end + 1));
                  break outerArr;
              } catch(e) {}
          }
      }

      if (validObj && validArr) {
          const lenObj = JSON.stringify(validObj).length;
          const lenArr = JSON.stringify(validArr).length;
          return lenObj > lenArr ? validObj : validArr;
      }

      if (validObj) return validObj;
      if (validArr) return validArr;

      return null;
    } catch (innerError) {
      return null;
    }
  }
};

export { API_KEY };
export { Type } from "@google/genai";
