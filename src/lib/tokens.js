import DailyCounter from "@/models/DailyCounter";

export function utcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export async function allocateDailyToken(ownerId) {
  const date = utcDateKey();
  const row = await DailyCounter.findOneAndUpdate(
    { ownerId, date },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return {
    tokenNumber: row.seq,
    tokenDate: date,
  };
}
