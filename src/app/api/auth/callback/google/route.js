import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getGoogleUser } from "@/lib/google";
import User from "@/models/User";
import {
  cookieOptions,
  createSessionValue,
  SESSION_COOKIE,
  STATE_COOKIE,
} from "@/lib/session";

function loginError(request) {
  const response = NextResponse.redirect(new URL("/login?error=1", request.url));
  response.cookies.delete(STATE_COOKIE);
  return response;
}

export async function GET(request) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get(STATE_COOKIE)?.value;

  // Check the state cookie.
  if (!code || !state || !savedState || state !== savedState) {
    return loginError(request);
  }

  try {
    const googleUser = await getGoogleUser(code);
    const googleId = googleUser.sub;
    if (!googleId || !googleUser.email) {
      return loginError(request);
    }

    await connectDb();

    // Save the user in the database.
    const user = await User.findOneAndUpdate(
      { googleId },
      {
        googleId,
        email: googleUser.email,
        name: googleUser.name || "",
        picture: googleUser.picture || "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Save the session cookie. Send the user to the dashboard.
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.delete(STATE_COOKIE);
    response.cookies.set(
      SESSION_COOKIE,
      createSessionValue(String(user._id)),
      cookieOptions({ maxAge: 60 * 60 * 24 * 7 }),
    );
    return response;
  } catch {
    return loginError(request);
  }
}
