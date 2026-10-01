import HabitLog from "../models/HabitLog.js";
import Habit from "../models/Habit.js";

import {
  todayKey,
  last90Days,
  lastNDays,
  lastNDaysFrom,
  calcStreak,
} from "../utils/dateHelpers.js";

export const markComplete = async (req, res) => {
  try {
    const { habitId, date } = req.body;

    const completedDate = date || todayKey();
    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const log = await HabitLog.findOneAndUpdate(
      { userId: req.user._id, habitId, completedDate },
      { $setOnInsert: { userId: req.user._id, habitId, completedDate } },
      { upsert: true, new: true },
    );

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unmarkComplete = async (req, res) => {
  try {
    const { habitId, date } = req.body;

    const completedDate = date || todayKey();
    await HabitLog.findOneAndDelete({
      userId: req.user._id,
      habitId,
      completedDate,
    });
    res.json({ message: "Unmarked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getToday = async (req, res) => {
  try {
    const date = req.query.date || todayKey();

    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: date,
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: start, $lte: end },
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHeatmap = async (req, res) => {
  try {
    const days = last90Days();
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: days[0], $lte: days[days.length - 1] },
    });

    const counts = {};
    for (const d of days) {
      counts[d] = 0;
    }
    for (const l of logs) {
      counts[l.completedDate] = (counts[l.completedDate] || 0) + 1;
    }

    const data = days.map((d) => ({ date: d, count: counts[d] || 0 }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHabitStats = async (req, res) => {
  // deep diving into each habit separately
  try {
    const habit = await Habit.findOne({
      _id: req.params.habitId,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const logs = await HabitLog.find({
      userId: req.user._id,
      habitId: habit._id,
    }).sort({ completedDate: -1 });

    const dateKeys = logs.map((l) => l.completedDate);
    const { current, longest } = calcStreak(dateKeys);

    // completion rate since habit created
    const createdKey = habit.createdAt.toISOString().slice(0, 10);
    const today = todayKey();
    const start = new Date(createdKey);
    const end = new DataTransfer(today);

    const totalDays =
      Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24))) + 1;
    const completionRate = Math.round((logs.length / totalDays) * 100);

    // monthly breakdown ( last 6 months)

    const monthly = {};
    for (const l of logs) {
      const m = l.completedDate.slice(0, 7);
      monthly[m] = (monthly[m] || 0) + 1;
    }

    res.json({
      habit,
      totalCompletions: logs.length,
      currentStreak: current,
      longestStreak: longest,
      completionRate,
      monthly,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllStats = async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.user._id,
      isArchived: false,
    });

    // Frontend tells us what "today" is for the user.
    // This prevents Render/UTC timezone differences.
    const end = req.query.end || todayKey();

    const days = lastNDaysFrom(end, 30);

    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: {
        $gte: days[0],
        $lte: days[days.length - 1],
      },
    });

    const perHabit = habits.map((h) => {
      const hLogs = logs.filter((l) => String(l.habitId) === String(h._id));

      const keys = hLogs
        .map((l) => l.completedDate)
        .sort()
        .reverse();

      const { current, longest } = calcStreak(keys, end);

      return {
        habitId: h._id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        category: h.category,
        completions30d: hLogs.length,
        currentStreak: current,
        longestStreak: longest,
      };
    });

    res.json({
      perHabit,
      days,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
