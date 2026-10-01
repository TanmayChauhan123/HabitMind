import "dotenv/config";
import mongoose from "mongoose";
import { format, subDays } from "date-fns";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import AIinsight from "../models/AIinsight.js";

const EMAIL = "vin@gmail.com";
const PASSWORD = "123456";
const NAME = "Vini jr";

const HABITS = [
  {
    name: "Drink 2 L Water",
    description: "Drink at least 2 liters of water throughout the day.",
    category: "Health",
    frequency: "daily",
    targetDays: 7,
    icon: "💧",
    _StreakProb: 0.82,
    _pattern: "weekdays",
  },
  {
    name: "Morning Exercise",
    description:
      "Exercise, stretch, or walk for at least 30 minutes every morning.",
    category: "Fitness",
    frequency: "daily",
    targetDays: 6,
    icon: "🏃",
    _StreakProb: 0.74,
    _pattern: "weekdays",
    _brokeAt: "2026-09-27T07:30:00.000Z",
  },
  {
    name: "Read for 20 Minutes",
    description: "Read a book or educational material for at least 20 minutes.",
    category: "Learning",
    frequency: "daily",
    targetDays: 5,
    icon: "📚",
    _StreakProb: 0.68,
    _pattern: "weekdays",
  },
  {
    name: "Meditation",
    description: "Spend 10 minutes practicing mindfulness or meditation.",
    category: "Mindfulness",
    frequency: "daily",
    targetDays: 5,
    icon: "🧘",
    _StreakProb: 0.63,
    _pattern: "dropoff",
    _brokeAt: "2026-09-25T06:45:00.000Z",
  },
  {
    name: "Plan Tomorrow",
    description:
      "Spend a few minutes reviewing tasks and planning the next day.",
    category: "Productivity",
    frequency: "daily",
    targetDays: 6,
    icon: "📝",
    _StreakProb: 0.79,
    _pattern: "weekdays",
  },
  {
    name: "No Phone Before Bed",
    description:
      "Avoid using your phone for at least 30 minutes before going to sleep.",
    category: "Lifestyle",
    frequency: "daily",
    targetDays: 5,
    icon: "📵",
    _StreakProb: 0.57,
    _pattern: "dropoff",
    _brokeAt: "2026-09-28T22:30:00.000Z",
  },
  {
    name: "Weekly Room Cleanup",
    description: "Spend 30 minutes organizing and cleaning your room.",
    category: "Lifestyle",
    frequency: "weekly",
    targetDays: 1,
    icon: "🧹",
    _StreakProb: 0.88,
    _pattern: "weekends",
  },
];

const todayKey = () => format(new Date(), "yyyy-MM-dd");

const buildLogs = (habit, totalDays = 90) => {
  const logs = [];
  const today = new Date();

  for (let i = 0; i < totalDays; i++) {
    const d = subDays(today, i);
    const dow = d.getDay();
    const key = format(d, "yyyy-MM-dd");

    // Weekly habits: only consider Sundays
    if (habit.frequency === "weekly" && dow !== 0) {
      continue;
    }

    let p = habit._StreakProb;

    // Weekday pattern
    if (habit._pattern === "weekdays") {
      if (dow === 0 || dow === 6) {
        p *= 0.35;
      }
    }

    // Recent drop-off
    if (habit._pattern === "dropoff") {
      if (i < 14) {
        p *= 0.25;
      }
    }

    // Break around _brokeAt
    if (habit._brokeAt) {
      const brokeDate = new Date(habit._brokeAt);

      const daysFromToday = Math.floor(
        (today - brokeDate) / (1000 * 60 * 60 * 24),
      );

      if (Math.abs(i - daysFromToday) <= 2) {
        continue;
      }
    }

    // Deterministic random number
    const seed = Math.sin(i * 9301 + habit.name.length * 49297) * 233280;

    const rnd = seed - Math.floor(seed);

    if (rnd < p) {
      logs.push({
        completedDate: key,
      });
    }
  }

  return logs;
};

const run = async()=>{
  await connectDB();

  let user = await User.findOne({email: EMAIL});

  if(user){

    console.log(`Found existing user ${EMAIL} - clearing their data...`);
    await Habit.deleteMany({userId: user._id});
    await HabitLog.deleteMany({userId: user._id});
    await AIinsight.deleteMany({userId: user._id});

    user.name = NAME;
    user.avatar = NAME.charAt(0).toUpperCase();
    user.morningMotivation = true;
    user.password = PASSWORD;
    await user.save();
  }

  else{
    user = await User.create({
      name: NAME,
      email: EMAIL,
      password: PASSWORD,
      avatar: NAME.charAt(0).toUpperCase(),
      morningMotivation: true,
    });
    console.log(`Created user ${EMAIL}`);
  }

  const createdHabits = [];
  for(let i = 0 ; i<HABITS.length ; i++){
    const h = HABITS[i];
    const habit = await Habit.create({
      userId: user._id,
      name: h.name,
      description: h.description,
      category: h.category,
      frequency: h.frequency,
      targetDays: h.targetDays,
      color: h.color,
      icon: h.icon,
      order: i,
      createdAt: subDays(new Date() , 89),
      updatedAt: subDays(new Date() , 89),
    });

    habit.createdAt = subDays(new Date(), 89),
    await habit.save({timestamps: false});
    createdHabits.push({habit , config: h});
  }

  let totalLogs = 0;
  for(const {habit , config} of createdHabits){
    const logs = buildLogs(config);
    if(!logs.length){
      continue;
    }
    const docs = logs.map((l)=>({
      userId: user._id,
      habitId: habit._id,
      completedDate: l.completedDate,
    }));

    await HabitLog.insertMany(docs , {ordered: false}).catch(()=>{});
    totalLogs += docs.length;
  }

  const today = todayKey();
  const todayDoneHabits = createdHabits.slice(0,4).map((c)=>c.habit);

  for(const h of todayDoneHabits){
    await HabitLog.updateOne(
      {userId: user._id , habitId: h._id , completedDate: today},
      {$setOnInsert:{userId: user._id , habitId: h._id , completedDate: today}},
      {upsert: true}
    );
  }

  console.log(`\n☑️ Seed complete`);
  console.log(`   User:     ${EMAIL}`);
  console.log(`   Password:     ${PASSWORD}`);
  console.log(`   Habits:     ${createdHabits.length}`);
  console.log(`   Logs:     ~${totalLogs}`);
  await mongoose.disconnect();


};

// Errro handler
run().catch(async (err) =>{
  console.error("Seed failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});

