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

const GRAPH_VERSION = "v22.0";
const WA_PHONE_MAX = 4096;

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("ar-EG", {
    maximumFractionDigits: 0,
  });
}

function escapeWa(source: string) {
  return source
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/~/g, "\\~")
    .replace(/`/g, "\\`")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

function buildBody(o: OrderNotifyLike) {
  const lines = [
    "*رُقي — طلب جديد* 🛍️",
    "",
    `# الطلب: *${o.orderNumber}*`,
    `الاسم: *${o.customerName}*`,
    `الجوال: *${o.customerPhone}*`,
    `المدينة: *${o.city}*`,
    "",
    "*المنتجات:*",
  ];

  for (const item of o.items) {
    lines.push(
      `• ${escapeWa(item.productNameAr)} ×${item.quantity} = *${formatCents(
        item.priceCents * item.quantity
      )} ر.س*`
    );
  }

  lines.push("", `الإجمالي: *${formatCents(o.totalCents)} ر.س*`, "");

  return lines.join("\n").slice(0, 4096);
}

export interface WhatsAppResult {
  ok: boolean;
  error?: { message: string; code?: number };
}

/**
 * يُرسل إشعار الطلب الجديد إلى مشرفي المتجر على واتساب عبر WhatsApp Cloud API.
 * إن لم تُضبط المتغيرات (أو فشل الإرسال) يرجع { ok: false } دون رمي خطأ،
 * بحيث لا يمنع إنشاء الطلب أبدًا.
 */
export async function notifyAdminOnOrder(
  o: OrderNotifyLike
): Promise<WhatsAppResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const targets = process.env.ADMIN_WHATSAPP_PHONES;

  if (!token || !phoneId || !targets) return { ok: false };

  const text = buildBody(o!);
  const phones = targets
    .split(",")
    .map((p) => p.trim())
    .filter((p) => /^\d+$/.test(p))
    .map((p) => (p.startsWith("2") ? p : `2${p}`));

  const results = await Promise.allSettled(
    phones.map(async (waPhone) => {
      try {
        const res = await fetch(
          `https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: waPhone,
              type: "text",
              text: { body: text, preview_url: false },
            }),
          }
        );

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: { message?: string; code?: number };
          } | null;
          return {
            ok: false,
            error: {
              message: data?.error?.message ?? res.statusText,
              code: data?.error?.code,
            },
          } satisfies WhatsAppResult;
        }

        return { ok: true } satisfies WhatsAppResult;
      } catch {
        return { ok: false } satisfies WhatsAppResult;
      }
    })
  );

  const delivered = results.filter(
    (r) =>
      r.status === "fulfilled" &&
      (r as PromiseFulfilledResult<WhatsAppResult>).value.ok
  );

  return delivered.length > 0 ? { ok: true } : { ok: false };
}
