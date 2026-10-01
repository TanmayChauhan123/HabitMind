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

const MODEL = process.env.GEMINI_MODEL;

export const isAIEnabled = () => !!process.env.GEMINI_API_KEY;

export const parseJSON = (text) => {
  let cleaned = (text || "").trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/```\n?/g, "");
  }

  return JSON.parse(cleaned.trim());
};

export const chatCompletion = async ({
  system,
  user,
  temperature = 0.7,
  json = false,
}) => {
  const c = getClient();

  if (!c) {
    return {
      ok: false,
      content: "AI chat is currently disabled.",
    };
  }

  try {
    const res = await c.models.generateContent({
      model: MODEL,
      contents: user,
      config: {
        systemInstructions: system,
        temperature,
        ...(json && {
          responseMimeType: "application/json",
        }),
      },
    });

    return {
      ok: true,
      content: (res.text || "").trim(),
    };
  } catch (err) {
    console.error("AI error:", err.message);

    return {
      ok: false,
      content: "AI request failed. Please try again later.",
    };
  }
};

export const SYSTEM_PROMPTS = {
  weekly:
    "Analyze the user's weekly habit data, including completions, streaks, missed days, and completion rates. Summarize progress, identify patterns or weak areas, and provide 2–3 actionable improvements for next week.Return plain text only. Do not use Markdown, hashtags, asterisks, backticks, or other formatting symbols.",
  suggestion: `
Generate exactly 3 personalized habit suggestions based on the user's stated goals, most productive time, and past struggles.

Return ONLY valid JSON in exactly this format:

{
  "habits": [
    {
      "name": "Habit name",
      "description": "Short practical description",
      "frequency": "Daily",
      "category": "Health",
      "icon": "🏃",
      "reason": "Why this habit is suitable"
    }
  ]
}

Rules:
- Return exactly 3 habits.
- frequency must be either "Daily" or "Weekly".
- category must be one of: Health, Fitness, Learning, Mindfulness, Productivity, Lifestyle, Social, Finance, Creative, Other.
- Use "name", never "title".
- Include an appropriate emoji for icon.
- Include a short reason.
- Do not include Markdown or code fences.
- Do not include any text outside the JSON object.
- Do not invent information about the user.
`,
  recovery:
    "Help the user recover from missed habits or broken streaks using their recent habit data. Be supportive and non-judgmental, and provide a simple, realistic plan focused on the next achievable action.Return plain text only. Do not use Markdown, hashtags, asterisks, backticks, or other formatting symbols.",
  chat: "Act as the user's AI habit coach and answer questions using their available habit data when relevant. Be conversational, concise, practical, and never invent statistics or assume information about the user.Return plain text only. Do not use Markdown, hashtags, asterisks, backticks, or other formatting symbols.",
  morning:
    "Create a concise morning habit briefing using today's habits, recent progress, and active streaks. Highlight up to 3 priorities and give the user one clear, achievable action to focus on today.Return plain text only. Do not use Markdown, hashtags, asterisks, backticks, or other formatting symbols.",
};
