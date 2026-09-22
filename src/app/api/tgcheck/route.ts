import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.ADMIN_TELEGRAM_CHAT_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const results = [];
  for (const chatId of chatIds) {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ اختبار من الموقع الحي: نظام إشعارات الطلبات يعمل الآن.",
          parse_mode: "HTML",
        }),
      }
    );
    const data = await res.json().catch(() => null);
    results.push({ chatId, status: res.status, ok: data?.ok ?? false });
  }
  return NextResponse.json({ results });
}