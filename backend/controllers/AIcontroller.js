import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import AIinsight from "../models/AIinsight.js";
import { chatCompletion, SYSTEM_PROMPTS } from "../utils/AIservice.js";
import { lastNDays, calcStreak, todayKey } from "../utils/dateHelpers.js";
import { HarmCategory, TrafficType } from "@google/genai";

const buildWeeklyContext = async (userId) => {
  const habits = await Habit.find({ userId, isArchived: false });
  const days = lastNDays(7);
  const logs = await HabitLog.find({
    userId,
    completedDate: { $gte: days[0], $lte: days[days.length - 1] },
  });

  const perHabit = habits.map((h) => {
    const completed = logs.filter(
      (l) => String(l.habitId) === String(h._id),
    ).length;

    return {
      name: h.name,
      category: h.category,
      frequency: h.frequency,
      completedDays: completed,
      targetDays: h.targetDays,
    };
  });

  return { days, perHabit };
};

export const weeklyReport = async (req, res) => {
  try {
    const ctx = await buildWeeklyContext(req.user._id);

    if (!ctx.perHabit.length) {
      return res.json({
        conten:
          "You don't have any active habits yet. Create your first habit to start tracking - I'll generate a weekly report once you have some data ",
      });
    }

    const userMsg = `Here is the user's habit data for the past 7 days(${ctx.days[0]} to ${ctx.days[6]}):\n\n${ctx.perHabit
      .map(
        (h) =>
          `- ${h.name} (${h.category} , ${h.frequency}): completed ${h.completedDays} of the past 7 days , target ${h.targetDays}/week`,
      )
      .join("\n")}\n\n PLease write the personalized weekly report now.`;

    const { content } = await chatCompletion({
      system: SYSTEM_PROMPTS.weekly,
      user: userMsg,
    });

    await AIinsight.create({
      userId: req.user._id,
      type: "weekly",
      content,
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const suggestHabits = async (req, res) => {
  try {
    const { goals, productiveTime, struggles } = req.body;
    const userMsg = `User goals: ${goals || "not provided"}\n Most productive time: ${productiveTime || "not provided"}\nPast struggles: ${struggles || "not provided"}\n\n Suggest 3 personalized habits now. Return JSON only`;
    const { content } = await chatCompletion({
      system: SYSTEM_PROMPTS.suggestion,
      user: userMsg,
      json: true,
    });

    console.log("AI SUGGESTION RESPONSE:", content);

    let suggestions = [];

    try {
      const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

      suggestions = (parsed.habits || []).map((h) => ({
        name: h.name || h.title || "Suggested Habit",
        description: h.description || "",
        frequency: (h.frequency || "daily").toLowerCase(),
        category: h.category || "Other",
        icon: h.icon || "🎯",
        reason:
          h.reason ||
          "This habit may help you build a more consistent routine.",
      }));
    } catch (err) {
      console.error("Failed to parse AI suggestions:", err.message);
    }

    if (!suggestions.length) {
      suggestions = [
        {
          name: "Morning Exercise",
          description: "Start the day with a short workout or walk.",
          frequency: "daily",
          category: "Health",
          icon: "🏃",
          reason: "Helps build a consistent and healthy morning routine.",
        },
        {
          name: "Read for 20 Minutes",
          description: "Spend some time reading a book or learning material.",
          frequency: "d",
          category: "Learning",
          icon: "📚",
          reason:
            "Improves knowledge and encourages a consistent learning habit.",
        },
        {
          name: "Plan Tomorrow",
          description: "Take a few minutes to organize tasks for the next day.",
          frequency: "daily",
          category: "Productivity",
          icon: "📝",
          reason: "Makes the next day more organized and reduces missed tasks.",
        },
      ];
    }

    await AIinsight.create({
      userId: req.user._id,
      type: "suggestion",
      content: JSON.stringify(suggestions),
      meta: { goals, productiveTime, struggles },
    });

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const recoveryPlan = async (req, res) => {
  try {
    const { habitId } = req.body;
    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const logs = await HabitLog.find({
      userId: req.user._id,
      habitId,
    }).sort({ completedDate: -1 });

    const keys = logs.map((l) => l.completedDate);
    const { current, longest } = calcStreak(keys);

    const userMsg = `Habit: ${habit.name} (${habit.category}).\nDescription: ${habit.description || "none"}.\ Current Streak: ${current}days. Longest ever: ${longest}days. The user just broke a streak. Write a warm , actionable 3-day recovery plan.`;
    const { content } = await chatCompletion({
      system: SYSTEM_PROMPTS.recovery,
      user: userMsg,
    });

    await AIinsight.create({
      userId: req.user._id,
      type: "recovery",
      content,
      meta: { habitId },
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const chatAnalysis = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const habits = await Habit.find({
      userId: req.user._id,
      isArchived: false,
    });

    const days = lastNDays(30);

    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: days[0], $lte: days[days.length - 1] },
    });

    const context = habits
      .map((h) => {
        const hLogs = logs.filter((l) => String(l.habitId) === String(h._id));

        const byDow = [0, 0, 0, 0, 0, 0, 0];

        for (const l of hLogs) {
          const dow = new Date(l.completedDate).getDay();
          byDow[dow] += 1;
        }

        return `${h.name} (${h.category}): ${hLogs.length}/30 in last 30 days, by weekday [Sun: ${byDow[0]}, Mon: ${byDow[1]}, Tue: ${byDow[2]}, Wed: ${byDow[3]}, Thu: ${byDow[4]}, Fri: ${byDow[5]}, Sat: ${byDow[6]}]`;
      })
      .join("\n");

    const userMsg = `User question: "${question}"\n\n User data(last 30 days):\n${context}\n\nAnswer now.`;
    const { content } = await chatCompletion({
      system: SYSTEM_PROMPTS.chat,
      user: userMsg,
    });

    await AIinsight.create({
      userId: req.user._id,
      type: "chat",
      content,
      meta: { question },
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const morningMotivation = async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.user._id,
      isArchived: false,
    });

    if (!habits.length) {
      return res.json({
        content:
          "Good morning! Add your first habit today and let's get the momentum started.",
      });
    }

    const days = lastNDays(30);
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: days[0], $lte: days[days.length - 1] },
    });

    const ctx = habits
      .map((h) => {
        const hLogs = logs
          .filter((l) => String(l.habitId) === String(h._id))
          .map((l) => l.completedDate)
          .sort()
          .reverse();
        const { current } = calcStreak(hLogs);
        return `${h.name}: current streak ${current}`;
      })
      .join("\n");

    const today = todayKey();
    const todayLogs = logs.filter((l) => l.completedDate === today);
    const done = todayLogs.length;
    const total = habits.length;

    const userMsg = `Todays's habits and streaks:\n${ctx}\n\nDone today: ${done}/${total}. Write the morning message now.`;

    const { content } = await chatCompletion({
      system: SYSTEM_PROMPTS.morning,
      user: userMsg,
      temperature: 0.8,
    });

    await AIinsight.create({
      userId: req.user._id,
      type: "morning",
      content,
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
