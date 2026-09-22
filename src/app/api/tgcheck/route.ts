import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = process.env.ADMIN_TELEGRAM_CHAT_IDS;
  return NextResponse.json({
    tokenSet: Boolean(token),
    chatIdsSet: Boolean(chatIds),
    chatIdsCount: chatIds ? chatIds.split(",").filter(Boolean).length : 0,
  });
}