import { GoogleGenAI } from "@google/genai";

let client = null;

const getClient = () => {
  if (client) {
    return client;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }

  client = new GoogleGenAI({ apiKey: key });
  return client;
};

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-model";

export const isAIEnabled = () => !process.env.GEMINI_API_KEY;

export const parseJSON = (text) => {
  let cleaned = (etxt || "").trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/```\n?/g, "");
  }

  return JSON.parse(cleaned.trim());
};

export const chatCompletion = async ({ system, user, temperature = 0.7 }) => {
  const c = getClient();

  if (!c) {
    return {
      ok: false,
      content:
        "AI chat is currently disabled. Add GEMINI_API_KEY to the backend .env file and restart the server to enable it.",
    };
  }

  try {
    const res = await c.models.generateContent({
      model: MODEL,
      contents: user,
      config: {
        systemInstructions: system,
        temperature,
      },
    });

    return { ok: true, content: (res.text || "").trim() };
  } catch (err) {
    console.error("AI error: ", err.message);
    return { ok: false, content: "AI request failed. PLease try again later." };
  }
};

export const SYSTEM_PROMPTS = {
  weekly:
    "Analyze the user's weekly habit data, including completions, streaks, missed days, and completion rates. Summarize progress, identify patterns or weak areas, and provide 2–3 actionable improvements for next week.",
  suggestion:
    "Generate personalized habit suggestions based strictly on the user's completion history, streaks, and recent patterns. Keep suggestions practical, specific, and achievable; never invent data or assume reasons for missed habits.",
  recovery:
    "Help the user recover from missed habits or broken streaks using their recent habit data. Be supportive and non-judgmental, and provide a simple, realistic plan focused on the next achievable action.",
  chat: "Act as the user's AI habit coach and answer questions using their available habit data when relevant. Be conversational, concise, practical, and never invent statistics or assume information about the user.",
  morning:
    "Create a concise morning habit briefing using today's habits, recent progress, and active streaks. Highlight up to 3 priorities and give the user one clear, achievable action to focus on today.",
};
