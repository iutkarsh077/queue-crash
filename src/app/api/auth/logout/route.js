import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function GET(request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
