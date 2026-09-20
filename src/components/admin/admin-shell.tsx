"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Tags,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/admin/categories", label: "التصنيفات", icon: Tags },
  { href: "/admin/settings", label: "نصوص الموقع", icon: FileText },
];

function AdminShellInner({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/admin/login");
    router.refresh();
  };

  const links = (
    <nav className="space-y-1" aria-label="لوحة التحكم">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium transition-colors",
              active
                ? "bg-ink text-white"
                : "text-ink/70 hover:bg-white/60 hover:text-ink"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}
      <div className="!mt-3 border-t border-white/50 pt-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium text-ink/70 transition-colors hover:bg-white/60 hover:text-ink"
        >
          <ExternalLink className="size-[18px]" />
          زيارة المتجر
        </a>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="glass sticky top-3 ms-3 hidden h-[calc(100dvh-1.5rem)] w-[258px] shrink-0 flex-col rounded-2xl px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <img src="/logo.png" alt="" className="size-10" />
          <div>
            <p className="text-lg font-medium leading-none">رُقي</p>
            <p className="mt-1 text-[11px] text-ink/45">لوحة التحكم</p>
          </div>
        </div>
        {links}
        <div className="mt-auto">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/40 px-3.5 py-3 ring-1 ring-white/50">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-medium text-white">
              {adminName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="trim-lines line-1 text-sm font-medium">{adminName}</p>
              <p className="text-[11px] text-ink/45">مدير المتجر</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium text-red-600 transition-colors hover:bg-red-50/70"
          >
            <LogOut className="size-[18px]" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="glass-bar sticky top-3 z-40 mx-3 mt-3 flex items-center justify-between rounded-2xl px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="size-9" />
          <span className="text-lg font-medium">رُقي</span>
          <span className="text-[11px] text-ink/45">· لوحة التحكم</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="فتح القائمة"
          className="flex size-10 items-center justify-center rounded-sm transition hover:bg-stone-faint"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
          />
          <div className="glass-panel absolute inset-y-3 end-3 flex w-[280px] animate-drawer-in flex-col overflow-hidden p-4 pt-6">
            <div className="mb-6 flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="" className="size-9" />
                <span className="text-lg font-medium">رُقي</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="إغلاق القائمة"
                className="flex size-9 items-center justify-center rounded-sm text-ink/50 transition hover:bg-stone-faint"
              >
                <X className="size-5" />
              </button>
            </div>
            {links}
            <div className="mt-auto border-t border-white/50 pt-4">
              <p className="mb-3 px-3.5 text-sm font-medium">{adminName}</p>
              <button
                type="button"
                onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium text-red-600 transition-colors hover:bg-red-50/70"
              >
                <LogOut className="size-[18px]" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <main className="p-5 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  return <AdminShellInner adminName={adminName}>{children}</AdminShellInner>;
}