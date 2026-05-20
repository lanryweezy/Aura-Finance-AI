
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn("AI API Key not set. AI features will be limited.");
}

// Detect if it's an OpenRouter key (typically starts with sk-or-)
const isOpenRouter = API_KEY.startsWith('sk-or-');

export const aiClient = !isOpenRouter && API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const openAICompatibleRequest = async (prompt: string, systemInstruction?: string, responseSchema?: any) => {
    const url = isOpenRouter ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";

    const messages = [];
    if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const body: any = {
        model: isOpenRouter ? "google/gemini-2.0-flash-001" : "gpt-4o",
        messages,
    };

    if (responseSchema) {
        body.response_format = { type: "json_object" };
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://aura.ai",
            "X-Title": "Aura Finance AI",
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    return data.choices[0].message.content;
};

export { API_KEY, isOpenRouter };
export { Type } from "@google/genai";
