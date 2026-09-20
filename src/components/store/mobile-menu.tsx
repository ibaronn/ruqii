"use client";

import Link from "next/link";
import { PackageSearch, Search } from "lucide-react";
import { Brand } from "@/components/brand";
import { Drawer } from "@/components/ui/drawer";
import type { HeaderCategory } from "./header";

export function MobileMenu({
  open,
  onClose,
  categories = [],
  onSearch,
}: {
  open: boolean;
  onClose: () => void;
  categories?: HeaderCategory[];
  onSearch: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} side="left" labelledBy="mobile-menu-title">
      <div className="flex items-center justify-between border-b border-white/50 px-5 py-4">
        <span id="mobile-menu-title" className="sr-only">
          القائمة
        </span>
        <Brand size="sm" />
        <Link
          href="/"
          onClick={onClose}
          aria-label="الرئيسية"
          className="text-[13px] text-ink/50 hover:text-ink"
        >
          الرئيسية
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="space-y-1">
          <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-ink/40">
            الأقسام
          </p>
          <MobileLink href="/" onClick={onClose}>
            الرئيسية
          </MobileLink>
          <MobileLink href="/products" onClick={onClose}>
            جميع المنتجات
          </MobileLink>
          <MobileLink href="/track-order" onClick={onClose}>
            تتبع الطلب
          </MobileLink>
        </div>

        {categories.length > 0 && (
          <div className="mt-8">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-ink/40">
              التصنيفات
            </p>
            <div className="space-y-1">
              {categories.map((c) => (
                <MobileLink
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  onClick={onClose}
                >
                  {c.nameAr}
                </MobileLink>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 space-y-2 border-t border-white/50 pt-6">
          <button
            type="button"
            onClick={onSearch}
            className="glass-soft flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] text-ink transition hover:text-ink"
          >
            <Search className="size-[18px] text-ink/45" />
            ابحث في رُقي…
          </button>
          <Link
            href="/admin/login"
            onClick={onClose}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] text-ink/70 transition hover:bg-white/60"
          >
            <PackageSearch className="size-[18px] text-ink/45" />
            لوحة التحكم
          </Link>
        </div>
      </div>

      <div className="border-t border-white/50 px-5 py-4">
        <p className="text-[13px] text-ink/50">
          © 2026 رُقي — التشطيبات الراقية المصنوعة بعناية.
        </p>
      </div>
    </Drawer>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-xl px-3 py-3 text-[17px] text-ink transition hover:bg-white/60"
    >
      {children}
    </Link>
  );
}