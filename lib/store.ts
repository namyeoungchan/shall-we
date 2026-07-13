import { promises as fs } from "fs";
import path from "path";
import { list, put } from "@vercel/blob";
import { type AnswerRecord, type Content, defaultContent } from "./content";

const CONTENT_KEY = "shall-we/content.json";
const ANSWERS_KEY = "shall-we/answers.json";

export function usingBlob(): boolean { return Boolean(process.env.BLOB_READ_WRITE_TOKEN); }
function localPath(key: string): string { return path.join(process.cwd(), "data", path.basename(key)); }

async function readJson<T>(key: string): Promise<T | null> {
  if (usingBlob()) {
    const { blobs } = await list({ prefix: key });
    const blob = blobs.find((item) => item.pathname === key);
    if (!blob) return null;
    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  }
  try { return JSON.parse(await fs.readFile(localPath(key), "utf8")) as T; }
  catch { return null; }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  const body = JSON.stringify(value, null, 2);
  if (usingBlob()) {
    await put(key, body, { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
    return;
  }
  if (process.env.VERCEL) throw new Error("Vercel Blob 저장소가 연결되지 않았습니다.");
  const file = localPath(key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body, "utf8");
}

export async function readContent(): Promise<Content> {
  const saved = await readJson<Partial<Content>>(CONTENT_KEY);
  if (!saved) return defaultContent;
  return { ...defaultContent, ...saved, hero: { ...defaultContent.hero, ...saved.hero }, freeze: { ...defaultContent.freeze, ...saved.freeze, details: saved.freeze?.details ?? defaultContent.freeze.details }, finale: { ...defaultContent.finale, ...saved.finale }, song: { ...defaultContent.song, ...saved.song }, scenes: saved.scenes ?? defaultContent.scenes };
}
export async function writeContent(content: Content): Promise<void> { await writeJson(CONTENT_KEY, content); }
export async function readAnswers(): Promise<AnswerRecord[]> { return (await readJson<AnswerRecord[]>(ANSWERS_KEY)) ?? []; }
export async function appendAnswer(record: AnswerRecord): Promise<void> { const answers = await readAnswers(); answers.push(record); await writeJson(ANSWERS_KEY, answers); }

export async function saveLocalUpload(file: File): Promise<string> {
  const ext = path.extname(file.name);
  const safeBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9가-힣_-]/g, "").slice(0, 40);
  const name = `${Date.now()}-${safeBase || "file"}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
