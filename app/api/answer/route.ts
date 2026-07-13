import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { appendAnswer, readAnswers } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  return NextResponse.json({ answers: await readAnswers() });
}
export async function POST(request: Request) {
  const { answer } = (await request.json().catch(() => ({}))) as { answer?: string };
  if (typeof answer !== "string" || !answer.trim() || answer.length > 200) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  try { await appendAnswer({ answer: answer.trim(), answeredAt: new Date().toISOString() }); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "응답을 기록하지 못했습니다." }, { status: 500 }); }
}
