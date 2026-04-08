
import { GoogleGenAI, Type } from "@google/genai";
import type { ReceiptData } from '../types';
import { DEFAULT_CATEGORIES } from '../components/TransactionsView';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result as string;
            const base64Content = base64Data.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Content,
                    mimeType: file.type,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const ocrService = {
    scanReceipt: async (file: File): Promise<ReceiptData> => {
        // Fallback if no API key
        if (!process.env.API_KEY) {
            console.warn("No API Key found. Returning mock OCR data.");
            return new Promise(resolve => {
                setTimeout(() => resolve({
                    merchantName: "Mock Vendor Ltd",
                    date: new Date().toISOString().split('T')[0],
                    totalAmount: 15750,
                    category: "Miscellaneous",
                    description: "Office Supplies (Mock Scan)"
                }), 2000);
            });
        }

        try {
            const imagePart = await fileToGenerativePart(file);
            const categories = DEFAULT_CATEGORIES.map(c => c.name).join(', ');

            const prompt = `
                Analyze this receipt image and extract the following information.
                1. Merchant/Vendor Name
                2. Date of transaction (Format: YYYY-MM-DD)
                3. Total Amount (Numbers only)
                4. A brief description of items purchased (e.g. "Lunch meeting" or "Laptop repair")
                5. The most appropriate category from this list: [${categories}]

                Return the data in valid JSON format matching this schema:
                {
                    "merchantName": "string",
                    "date": "string",
                    "totalAmount": number,
                    "description": "string",
                    "category": "string"
                }
            `;

            const receiptSchema = {
                type: Type.OBJECT,
                properties: {
                    merchantName: { type: Type.STRING },
                    date: { type: Type.STRING },
                    totalAmount: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING },
                },
                required: ["merchantName", "date", "totalAmount", "description", "category"],
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: {
                    parts: [imagePart, { text: prompt }],
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: receiptSchema,
                }
            });

            const jsonText = response.text.trim();
            const data = JSON.parse(jsonText) as ReceiptData;
            return data;

        } catch (error) {
            console.error("OCR Error:", error);
            throw new Error("Failed to scan receipt. Please try again manually.");
        }
    }
};
