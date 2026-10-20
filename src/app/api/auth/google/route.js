import crypto from "crypto";
import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google";
import { cookieOptions, STATE_COOKIE } from "@/lib/session";

export async function GET() {
  // Open the Google login page.
  const state = crypto.randomBytes(16).toString("hex");
  const response = NextResponse.redirect(getGoogleAuthUrl(state));
  response.cookies.set(STATE_COOKIE, state, cookieOptions({ maxAge: 600 }));
  return response;
}
