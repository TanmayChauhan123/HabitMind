import { GoogleGenAI, Type } from "@google/genai";

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
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              habits: {
                type: Type.ARRAY,
                minItems: 3,
                maxItems: 3,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: {
                      type: Type.STRING,
                    },
                    description: {
                      type: Type.STRING,
                    },
                    frequency: {
                      type: Type.STRING,
                      enum: ["Daily", "Weekly"],
                    },
                    category: {
                      type: Type.STRING,
                      enum: [
                        "Health",
                        "Fitness",
                        "Learning",
                        "Mindfulness",
                        "Productivity",
                        "Lifestyle",
                        "Social",
                        "Finance",
                        "Creative",
                        "Other",
                      ],
                    },
                    icon: {
                      type: Type.STRING,
                    },
                    reason: {
                      type: Type.STRING,
                    },
                  },
                  required: [
                    "name",
                    "description",
                    "frequency",
                    "category",
                    "icon",
                    "reason",
                  ],
                },
              },
            },
            required: ["habits"],
          },
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
Generate exactly 3 personalized habit suggestions.

Return ONLY this JSON object:

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
- The root must be an object containing "habits".
- "habits" must be an array.
- Return exactly 3 habits.
- Every habit MUST contain all 6 fields:
  name, description, frequency, category, icon, reason.
- Use "name", never "habit" or "title".
- frequency must be either "Daily" or "Weekly".
- category must be one of:
  Health, Fitness, Learning, Mindfulness, Productivity,
  Lifestyle, Social, Finance, Creative, Other.
- Do not return Markdown.
- Do not return code fences.
- Do not return explanations outside the JSON object.
`,
  recovery:
    "Help the user recover from missed habits or broken streaks using their recent habit data. Be supportive and non-judgmental, and provide a simple, realistic plan focused on the next achievable action.Return plain text only. Do not use Markdown, hashtags, asterisks, backticks, or other formatting symbols.",
  chat: "Act as the user's AI habit coach and answer questions using their available habit data when relevant. Be conversational, concise, practical, and never invent statistics or assume information about the user.Return plain text only. Do not use Markdown, hashtags, asterisks, backticks, or other formatting symbols.",
  morning:
    "Create a concise morning habit briefing using today's habits, recent progress, and active streaks. Highlight up to 3 priorities and give the user one clear, achievable action to focus on today.Return plain text only. Do not use Markdown, hashtags, asterisks, backticks, or other formatting symbols.",
};
