import { NextRequest, NextResponse } from "next/server";
import { guardAdmin, unauthorized } from "../_guard";
import {
  getSiteSettings,
  saveSiteSettings,
  SITE_SETTING_DEFS,
  SETTING_GROUPS,
} from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const settings = await getSiteSettings();
  return NextResponse.json({
    settings,
    defs: SITE_SETTING_DEFS,
    groups: SETTING_GROUPS,
  });
}

export async function PUT(req: NextRequest) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const values =
    body && typeof body === "object" && "values" in body
      ? (body as { values: unknown }).values
      : null;

  if (!values || typeof values !== "object") {
    return NextResponse.json({ error: "لا توجد بيانات للحفظ" }, { status: 400 });
  }

  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(values as Record<string, unknown>)) {
    clean[k] = typeof v === "string" ? v : String(v ?? "");
  }

  const settings = await saveSiteSettings(clean);
  return NextResponse.json({ settings });
}
