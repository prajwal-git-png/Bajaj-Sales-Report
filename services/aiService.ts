import { GoogleGenAI } from "@google/genai";
import { UserProfile, DailyReport } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

export const askSalesCoach = async (
  user: UserProfile,
  sales: DailyReport[],
  message: string
): Promise<string> => {
  try {
    if (!apiKey) throw new Error("No API Key");

    const recentSales = sales
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const systemInstruction = `
You are an expert Bajaj Electricals Sales Coach.
User: ${user.name} (${user.storeName})
Monthly Target: ₹${user.monthlyTarget}

Tasks:
1. Analyze sales performance
2. Answer Bajaj product questions (Mixers, Geysers, Irons)
3. Give sales closing tips

Rules:
- Plain text only
- Use emojis
- Be concise

Recent Sales:
${JSON.stringify(recentSales)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemInstruction}\n\nUser Query: ${message}`,
      config: { maxOutputTokens: 300 }
    });

    return response.text || "Keep pushing, success is close 💪";
  } catch {
    return getOfflineResponse(message, user);
  }
};

export const getMotivationalQuote = async (): Promise<string> => {
  try {
    if (!apiKey) throw new Error("No API Key");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a short, powerful retail sales motivation quote. Max 15 words. Plain text.",
      config: { maxOutputTokens: 50 }
    });

    return response.text || "Success is a journey, not a destination 🚀";
  } catch {
    return "Your hard work today is your success tomorrow 💪";
  }
};

export const getOfflineResponse = (query: string, user: UserProfile): string => {
  const lower = query.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi")) {
    return `Hello ${user.name}! I am your Offline Sales Assistant ⚡`;
  }

  if (lower.includes("mixer") || lower.includes("grinder")) {
    return "🔹 Bajaj Mixers: 500W–750W motors\n🔹 DuraCut blades\n🔹 5-year motor warranty";
  }

  if (lower.includes("geyser") || lower.includes("heater")) {
    return "🚿 Bajaj Geysers: Instant & Storage\n🔹 Glassline tank\n🔹 Swirl Flow technology";
  }

  if (lower.includes("iron")) {
    return "👕 Bajaj Irons: Dry & Steam\n🔹 Non-stick soleplate\n🔹 360° swivel cord";
  }

  if (lower.includes("target") || lower.includes("sales")) {
    return `🎯 Monthly Target: ₹${user.monthlyTarget.toLocaleString()}\nFocus on high-value products like Geysers & OTGs`;
  }

  return "Offline mode 🌐\nI can help with Mixers, Geysers, Irons & Sales tips 💡";
};