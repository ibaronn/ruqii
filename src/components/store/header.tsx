"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { useStore } from "./store-provider";
import { SearchOverlay } from "./search-overlay";
import { MobileMenu } from "./mobile-menu";
import { cn } from "@/lib/utils";

export type HeaderCategory = { slug: string; nameAr: string };

export type HeaderLabels = {
  home: string;
  products: string;
  categories: string;
  track: string;
  allProducts: string;
};

const DEFAULT_LABELS: HeaderLabels = {
  home: "الرئيسية",
  products: "المنتجات",
  categories: "التصنيفات",
  track: "تتبع الطلب",
  allProducts: "عرض جميع المنتجات",
};

export function Header({
  categories = [],
  labels = DEFAULT_LABELS,
}: {
  categories?: HeaderCategory[];
  labels?: HeaderLabels;
}) {
  const { count, openCart } = useStore();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div
          className={cn(
            "glass-bar mx-auto flex h-16 w-full max-w-shell items-center gap-2 px-3 transition-shadow duration-300 sm:px-5",
            scrolled
              ? "shadow-[0_30px_64px_-34px_rgba(30,24,16,0.5)]"
              : "shadow-none"
          )}
        >
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="فتح القائمة"
            className="flex size-10 items-center justify-center rounded-xl transition hover:bg-white/60 lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/" aria-label="رُقي — الرئيسية" className="shrink-0">
            <Brand />
          </Link>

          <nav
            aria-label="التنقل الرئيسي"
            className="ms-8 hidden items-center gap-1 lg:flex"
          >
            <Link
              href="/"
              className="rounded-xl px-3.5 py-2 text-[15px] text-ink/70 transition-colors hover:bg-white/60 hover:text-ink"
            >
              {labels.home}
            </Link>
            <Link
              href="/products"
              className="rounded-xl px-3.5 py-2 text-[15px] text-ink/70 transition-colors hover:bg-white/60 hover:text-ink"
            >
              {labels.products}
            </Link>
            {categories.length > 0 && (
              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-xl px-3.5 py-2 text-[15px] text-ink/70 transition-colors hover:bg-white/60 hover:text-ink"
                >
                  {labels.categories}
                  <ChevronDown className="size-3.5 opacity-60" />
                </button>
                <div className="invisible absolute top-full start-0 flex min-w-56 translate-y-1 flex-col glass-soft p-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/products?category=${c.slug}`}
                      className="rounded-lg px-3 py-2.5 text-sm text-ink/75 transition hover:bg-white/60 hover:text-ink"
                    >
                      {c.nameAr}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-white/50" />
                  <Link
                    href="/products"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-white/60"
                  >
                    {labels.allProducts}
                  </Link>
                </div>
              </div>
            )}
            <Link
              href="/track-order"
              className="rounded-xl px-3.5 py-2 text-[15px] text-ink/70 transition-colors hover:bg-white/60 hover:text-ink"
            >
              {labels.track}
            </Link>
          </nav>

          <div className="ms-auto flex items-center gap-1">
            <Link
              href="/admin/login"
              aria-label="حساب"
              className="hidden size-10 items-center justify-center rounded-sm text-ink/75 transition hover:bg-stone-faint hover:text-ink lg:flex"
            >
              <UserRound className="size-[19px]" />
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="بحث"
              className="flex size-10 items-center justify-center rounded-xl text-ink/75 transition hover:bg-white/60 hover:text-ink"
            >
              <Search className="size-[19px]" />
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label={`السلة — ${count} منتج`}
              className="relative flex size-10 items-center justify-center rounded-xl text-ink/75 transition hover:bg-white/60 hover:text-ink"
            >
              <ShoppingBag className="size-[19px]" />
              {count > 0 && (
                <span
                  key={count}
                  className="absolute -top-0.5 -end-0.5 flex h-[18px] min-w-[18px] animate-scale-in items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold tabular-nums text-white"
                >
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} categories={categories} />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        onSearch={() => {
          setMenuOpen(false);
          setSearchOpen(true);
        }}
      />
    </>
  );
}