import { connection, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { expireOpenOrders } from "@/lib/expire-orders";

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function GET(request) {
  await connection();
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is missing." },
      { status: 500 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }

  try {
    await connectDb();
    const result = await expireOpenOrders();
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      { error: "Expiry job failed. Try again." },
      { status: 500 },
    );
  }
}
