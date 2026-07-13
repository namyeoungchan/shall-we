import { NextResponse } from "next/server";
import { AUTH_COOKIE, checkPassword, isAuthed, sessionToken } from "@/lib/auth";

export const runtime = "nodejs";
export async function GET() { return NextResponse.json({ authed: await isAuthed() }); }
export async function POST(request: Request) {
  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다." }, { status: 500 });
  if (!password || !checkPassword(password)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const response = NextResponse.json({ authed: true });
  response.cookies.set(AUTH_COOKIE, sessionToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return response;
}
export async function DELETE() {
  const response = NextResponse.json({ authed: false });
  response.cookies.set(AUTH_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
