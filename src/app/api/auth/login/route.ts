import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const rl = rateLimit(`login:${ip}`, 8, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "محاولات كثيرة، حاول بعد قليل" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const admin = await prisma.adminUser.findUnique({
    where: { username: parsed.data.username },
  });
  const ok =
    admin && (await bcrypt.compare(parsed.data.password, admin.passwordHash));
  if (!ok || !admin) {
    return NextResponse.json(
      { error: "اسم المستخدم أو كلمة المرور غير صحيحة" },
      { status: 401 }
    );
  }

  const secure =
    process.env.NODE_ENV === "production" &&
    (req.headers.get("x-forwarded-proto") === "https" ||
      new URL(req.url).protocol === "https:");

  await createSessionCookie(admin.id, secure);
  return NextResponse.json({ name: admin.name });
}