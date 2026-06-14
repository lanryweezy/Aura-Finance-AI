
import { Type } from "@google/genai";
import { aiClient, API_KEY, withTimeout } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';
import { localDb } from './localDb';
import type { ReceiptData } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/accounting';

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
        if (await usageService.isRateLimited('ocr_scan')) {
            monitoringService.log('warn', 'OCR_ENGINE', 'Rate limit reached for OCR');
            throw new Error("Plan limit reached for AI Receipt Scanning. Please upgrade your plan.");
        }

        if (!aiClient || !API_KEY) {
            return localDb.simulateRequest(async () => {
                await usageService.trackUsage('ocr_scan');

                // Return slightly dynamic mock data based on filename
                const name = file.name.toLowerCase();
                if (name.includes('uber')) {
                    return {
                        merchantName: "Uber Technologies",
                        date: new Date().toISOString().split('T')[0],
                        totalAmount: 4500,
                        category: "Travel",
                        description: "Ride from Ikeja (Simulated)"
                    };
                }
                if (name.includes('amazon') || name.includes('jumia')) {
                    return {
                        merchantName: name.includes('amazon') ? "Amazon.com" : "Jumia Nigeria",
                        date: new Date().toISOString().split('T')[0],
                        totalAmount: 12500,
                        category: "Office Supplies",
                        description: "Logistics equipment (Simulated)"
                    };
                }

                return {
                    merchantName: "Aura Vendor Simulation",
                    date: new Date().toISOString().split('T')[0],
                    totalAmount: 15750,
                    category: "Miscellaneous",
                    description: "Office Supplies (Mock Scan)"
                };
            }, 2000);
        }

        try {
            monitoringService.log('info', 'OCR_ENGINE', 'Starting receipt scan', { fileName: file.name });
            const imagePart = await fileToGenerativePart(file);
            const categories = DEFAULT_CATEGORIES.map(c => c.name).join(', ');

            const prompt = `Analyze this receipt and extract: Merchant, Date (YYYY-MM-DD), Total Amount, Description, and Category from [${categories}].`;

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

            const response = await withTimeout(aiClient.models.generateContent({ model: "gemini-2.0-flash",
                contents: [{ role: 'user', parts: [imagePart, { text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: receiptSchema as any,
                }
            }));

            const jsonText = response.text.trim();
            const data = JSON.parse(jsonText) as ReceiptData;
            if (!data || typeof data !== "object" || !data.merchantName || typeof data.totalAmount !== "number" || !data.date) throw new Error("AI output is missing required fields");

            await usageService.trackUsage('ocr_scan');

            return data;

        } catch (error) {
            monitoringService.trackError('OCR_ENGINE', error as Error);
            throw new Error("Failed to scan receipt. Please try again manually.");
        }
    }
};
