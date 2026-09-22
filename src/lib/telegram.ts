export type OrderNotifyLike = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  city: string;
  totalCents: number;
  items: {
    productNameAr: string;
    quantity: number;
    priceCents: number;
  }[];
};

const TG_TEXT_MAX = 4096;

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("ar-EG", {
    maximumFractionDigits: 0,
  });
}

function escapeHtml(source: string) {
  return source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBody(o: OrderNotifyLike) {
  const lines = [
    "🛍️ <b>رُقي — طلب جديد</b>",
    "",
    `رقم الطلب: <code>${escapeHtml(o.orderNumber)}</code>`,
    `الاسم: <b>${escapeHtml(o.customerName)}</b>`,
    `الجوال: <code>${escapeHtml(o.customerPhone)}</code>`,
    `المدينة: <b>${escapeHtml(o.city)}</b>`,
    "",
    "<b>المنتجات:</b>",
  ];

  for (const item of o.items) {
    lines.push(
      `• ${escapeHtml(item.productNameAr)} ×${item.quantity} = <b>${formatCents(
        item.priceCents * item.quantity
      )} د.ل</b>`
    );
  }

  lines.push("", `الإجمالي: <b>${formatCents(o.totalCents)} د.ل</b>`);

  return lines.join("\n").slice(0, TG_TEXT_MAX);
}

export interface TelegramResult {
  ok: boolean;
  error?: { message: string; code?: number };
}

/**
 * يُرسل إشعار الطلب الجديد إلى المشرفين على تيليجرام عبر Bot API.
 * إن لم تُضبط المتغيرات (أو فشل الإرسال) يرجع { ok: false } دون رمي خطأ،
 * بحيث لا يمنع إنشاء الطلب أبدًا.
 */
export async function notifyAdminOnOrder(
  o: OrderNotifyLike
): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const targets = process.env.ADMIN_TELEGRAM_CHAT_IDS;

  if (!token || !targets) return { ok: false };

  const text = buildBody(o);
  const chatIds = targets
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^[\d-]+$/.test(id));

  const results = await Promise.allSettled(
    chatIds.map(async (chatId) => {
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text,
              parse_mode: "HTML",
              disable_web_page_preview: true,
            }),
          }
        );

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            description?: string;
            error_code?: number;
          } | null;
          return {
            ok: false,
            error: {
              message: data?.description ?? res.statusText,
              code: data?.error_code,
            },
          } satisfies TelegramResult;
        }

        return { ok: true } satisfies TelegramResult;
      } catch {
        return { ok: false } satisfies TelegramResult;
      }
    })
  );

  const delivered = results.filter(
    (r) =>
      r.status === "fulfilled" &&
      (r as PromiseFulfilledResult<TelegramResult>).value.ok
  );

  return delivered.length > 0 ? { ok: true } : { ok: false };
}