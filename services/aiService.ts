import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile, DailyReport } from "../types";

// FIX: In Vite, we access env variables via import.meta.env
// and they must be prefixed with VITE_
const apiKey = import.meta.env.VITE_API_KEY;

// Initialize genAI only if the key exists to prevent immediate crashes
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const createSalesCoachChat = (user: UserProfile, sales: DailyReport[]) => {
    if (!genAI) {
        console.error("Missing API Key. Please check .env file.");
        throw new Error("Chat system unavailable: Missing API Configuration.");
    }

    const recentSales = sales
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    const systemInstruction = `
        You are an expert Bajaj Electricals Sales Coach and Product Knowledge Specialist. 
        Your User is ${user.name} from the store "${user.storeName}". 
        Their monthly target is ${user.monthlyTarget}.
        
        Your Capabilities:
        1. Analyze their sales performance based on provided data.
        2. Answer technical questions about Bajaj products (Mixers, Geysers, Irons, etc.) including Features, Warranty, and USPs.
        3. Provide tips to close sales.

        STRICT FORMATTING RULES:
        - Do NOT use Markdown symbols like asterisks (** or *), hashes (#), backticks (\`), or underscores (_).
        - Output CLEAN plain text only.
        - Use Emojis (🔹, ✅, ⚡, etc.) to create lists or structure instead of markdown bullets.
        - Keep responses concise, chatty, and encouraging.
        
        Recent Sales Context: ${JSON.stringify(recentSales)}
    `;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction: systemInstruction,
    });

    return model.startChat({
        history: [],
    });
};

export const getMotivationalQuote = async (): Promise<string> => {
    if (!genAI) return "Set your API Key to see magic happen! 🚀";

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp" 
        });

        const result = await model.generateContent(
            'Generate a short, powerful, unique motivational quote specifically for a retail sales executive to boost their morale. Max 15 words. End with one relevant emoji. Plain text only.'
        );

        const response = result.response;
        return response.text() || "Success is a journey, not a destination. 🚀";
    } catch (error) {
        console.error("AI Quote Error:", error);
        return "Your hard work today is your success tomorrow. 💪";
    }
};