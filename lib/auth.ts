import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "sw_admin";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function sessionToken(): string {
  return createHmac("sha256", adminPassword())
    .update("shall-we-admin-session")
    .digest("hex");
}

export function checkPassword(password: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAuthed(): Promise<boolean> {
  if (!adminPassword()) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return false;
  const expected = sessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
