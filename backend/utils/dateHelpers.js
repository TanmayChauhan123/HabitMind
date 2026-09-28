import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

export const toDateKey = (date) => format(date, "yyyy-MM-dd");

export const todayKey = () => toDateKey(new Date());

export const last90Days = () => {
  const end = new Date();
  const start = subDays(end, 89);
  return eachDayOfInterval({ start, end }).map(toDateKey);
};

export const currentWeekKeys = () => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map(toDateKey);
};

export const lastNDays = (n) => {
  const end = new Date();
  const start = subDays(end, n - 1);
  return eachDayOfInterval({ start, end }).map(toDateKey);
};

export const calcStreak = (sortedDateKeys) => {
  // sortedDateKeys -> newest first , unique

  if (!sortedDateKeys.length) {
    return { current: 0, longest: 0 };
  }

  const set = new Set(sortedDateKeys);
  const today = todayKey();

  const yesterday = toDateKey(subDays(new Date(), 1));

  let current = 0;

  let cursor = new Date();

  if (!set.has(today) && !set.has(yesterday)) {
    current = 0;
  } else {
    // yesterday logged , today not logged yet
    if (!set.has(today)) {
      cursor = subDays(cursor, 1);
    }

    while (set.has(toDateKey(cursor))) {
      current += 1;
      cursor = subDays(cursor, 1);
    }
  }

  // longest streak

  const sortedAsc = [...sortedDateKeys].sort();
  let longest = 0;
  let run = 0;
  let prev = null;

  for (const k of sortedAsc) {
    if (prev) {
      const d = new Date(k);
      const p = new Date(prev);

      const diff = Math.round((d - p) / (1000 * 60 * 60 * 24));
      if (diff == 1) {
        run += 1;
      } else {
        run = 1;
      }
    } else {
      run = 1;
    }

    if (run > longest) {
      longest = run;
    }

    prev = k;
  }

  return { current, longest };
};
