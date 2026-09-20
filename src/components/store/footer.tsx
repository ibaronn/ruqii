"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/brand";

const columns = [
  {
    title: "التسوق",
    links: [
      { label: "جميع المنتجات", href: "/products" },
      { label: "تتبع الطلب", href: "/track-order" },
      { label: "سلة التسوق", href: "/cart" },
    ],
  },
  {
    title: "رُقي",
    links: [
      { label: "الرئيسية", href: "/" },
      { label: "لماذا رُقي", href: "/#philosophy" },
      { label: "لوحة التحكم", href: "/admin/login" },
    ],
  },
];

export function Footer({
  settings = {},
}: {
  settings?: Record<string, string>;
}) {
  if (usePathname().startsWith("/admin")) return null;

  const about =
    settings.footer_about ??
    "رُقي — دار عربية تجمع بين البساطة والرفاهية، لتقديم تشكيلة مختارة بعناية تعكس ذوقًا راقيًا في كل تفصيلة.";
  const service =
    settings.footer_service ?? "خدمة العملاء متاحة عبر الهاتف والوتساب يوميًا";
  const copyright =
    settings.footer_copyright ?? "© 2026 دار رُقي. جميع الحقوق محفوظة.";
  const credit =
    settings.footer_credit ?? "صُنع بفخر بهدف الإبداع العربي الأصيل";

  return (
    <footer className="mt-20 px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="glass mx-auto w-full max-w-shell overflow-hidden">
        <div className="shell grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <Brand size="lg" />
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink/60">
            {about}
          </p>
          <p className="mt-5 text-sm text-ink/45">{service}</p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-[15px] text-ink/60 transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

        <div className="border-t border-white/50">
          <div className="shell flex flex-col items-center justify-between gap-2 py-6 sm:flex-row">
            <p className="text-[13px] text-ink/45">{copyright}</p>
            <p className="text-[13px] text-ink/45">{credit}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}