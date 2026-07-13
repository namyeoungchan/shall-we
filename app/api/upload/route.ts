import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthed } from "@/lib/auth";
import { saveLocalUpload, usingBlob } from "@/lib/store";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (usingBlob()) {
    try {
      const body = (await request.json()) as HandleUploadBody;
      const result = await handleUpload({ body, request, onBeforeGenerateToken: async () => {
        if (!(await isAuthed())) throw new Error("인증이 필요합니다.");
        return { allowedContentTypes: ["image/*", "audio/*"], addRandomSuffix: true, maximumSizeInBytes: 50 * 1024 * 1024 };
      }, onUploadCompleted: async () => {} });
      return NextResponse.json(result);
    } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "업로드에 실패했습니다." }, { status: 400 }); }
  }
  if (!(await isAuthed())) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  if (!file.type.startsWith("image/") && !file.type.startsWith("audio/")) return NextResponse.json({ error: "이미지나 오디오 파일만 업로드할 수 있습니다." }, { status: 415 });
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: "파일은 50MB 이하여야 합니다." }, { status: 413 });
  return NextResponse.json({ url: await saveLocalUpload(file) });
}
