import { cookies } from "next/headers";
import { connectDb } from "@/lib/db";
import User from "@/models/User";
import { getSessionFromCookies } from "@/lib/session";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const session = await getSessionFromCookies(cookieStore);
  if (!session?.userId) {
    return null;
  }

  await connectDb();
  const user = await User.findById(session.userId).lean();
  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    name: user.name || "",
    email: user.email,
    picture: user.picture || "",
  };
}

export async function requireOwner() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }
  return user;
}
