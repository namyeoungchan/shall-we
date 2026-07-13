import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { type Content } from "@/lib/content";
import { readContent, usingBlob, writeContent } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ content: await readContent(), storageMode: usingBlob() ? "blob" : "local" }); }
export async function PUT(request: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  const content = (await request.json().catch(() => null)) as Content | null;
  if (!content || !Array.isArray(content.scenes)) return NextResponse.json({ error: "잘못된 콘텐츠 형식입니다." }, { status: 400 });
  try { await writeContent(content); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "저장하지 못했습니다." }, { status: 500 }); }
}
