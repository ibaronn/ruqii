import Link from "next/link";
import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatTimeFull } from "@/lib/utils";
import { OrderTimeline } from "@/components/store/order-timeline";
import { CopyOrderNumber, PrintButton } from "@/components/store/copy-number";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { STATUS_STEPS } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const orderNumber = params.orderNumber.toUpperCase();
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { orderBy: { id: "asc" } } },
  });

  if (!order) {
    return (
      <div className="shell py-16">
        <EmptyState
          title="لم نعثر على الطلب"
          subtitle="تحقق من رقم الطلب أو تواصل معنا للمساعدة."
          action={
            <Link href="/track-order">
              <Button variant="outline">تتبع طلبك</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const stepIndex = Math.max(
    0,
    STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number])
  );

  return (
    <div className="shell py-10 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="animate-check-pop mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-50">
          <Check className="size-9 text-emerald-600" strokeWidth={2.5} />
        </div>
        <h1 className="mt-6 text-3xl font-medium sm:text-4xl">
          شكرًا لك، مرحبًا بطلبك
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink/60">
          تم استلام طلبك بنجاح وسنوافيك بكل التحديثات عبر الهاتف. احفظ رقم الطلب أدناه
          لتتبعه في أي وقت.
        </p>
        <div className="glass-soft mt-6 inline-flex items-center gap-3 rounded-2xl px-5 py-3">
          <span className="text-sm text-ink/55">رقم الطلب</span>
          <span className="text-xl font-semibold tabular-nums tracking-wide text-ink">
            {order.orderNumber}
          </span>
          <CopyOrderNumber orderNumber={order.orderNumber} />
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-2xl">
        <div className="glass p-6 sm:p-8">
          {order.status === "CANCELLED" ? (
            <div className="rounded-2xl border border-red-100/70 bg-red-50/70 px-5 py-4 text-[15px] text-red-700">
                تم إلغاء هذا الطلب. إن كان لديك استفسار فتواصل معنا.
              </div>
          ) : (
            <OrderTimeline stepIndex={stepIndex} />
          )}
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-[1fr_280px]">
        <section aria-labelledby="items-title">
          <h2 id="items-title" className="text-lg font-medium">
            تفاصيل الطلب
          </h2>
          <ul className="mt-4 divide-y divide-white/40 border-y border-white/50">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-white/40">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="trim-lines line-1 text-[15px] font-medium">
                    {item.productNameAr}
                  </p>
                  <p className="mt-0.5 text-sm text-ink/50">
                    {item.quantity} × {formatPrice(item.priceCents)}
                  </p>
                </div>
                <p className="text-[15px] font-semibold tabular-nums">
                  {formatPrice(item.priceCents * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-6">
          <div className="glass p-5">
            <h2 className="text-lg font-medium">الملخص</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink/55">الإجمالي</dt>
                <dd className="text-lg font-semibold tabular-nums">
                  {formatPrice(order.totalCents)}
                </dd>
              </div>
              <div className="text-[12px] text-ink/40">
                {formatTimeFull(order.createdAt)} · دفع عند الاستلام
              </div>
            </dl>
          </div>

          <div className="flex gap-3">
            <Link href="/track-order" className="flex-1">
              <Button variant="outline" full className="gap-2">
                تتبع الطلب
              </Button>
            </Link>
            <PrintButton />
          </div>
        </aside>
      </div>
    </div>
  );
}