import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/store/store-provider";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { Toasts } from "@/components/ui/toasts";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: {
      default: s.meta_title,
      template: `%s — ${s.brand_name}`,
    },
    description: s.meta_description,
    keywords: ["رُقي", "أزياء", "إكسسوارات", "عطور", "جلديات", "تسوق"],
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://ruqii.vercel.app"
    ),
    icons: {
      icon: "/favicon.png",
      apple: "/favicon.png",
    },
    openGraph: {
      title: s.meta_title,
      description: s.meta_description,
      type: "website",
      locale: "ar_AR",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, navHidden: false },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, nameAr: true },
    }),
    getSiteSettings(),
  ]);

  return (
    <html lang="ar" dir="rtl" className={arabic.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <div className="ambient-bg" aria-hidden="true" />
        <StoreProvider>
          <Header
            categories={categories}
            labels={{
              home: settings.nav_home,
              products: settings.nav_products,
              categories: settings.nav_categories,
              track: settings.nav_track,
              allProducts: settings.nav_all_products,
            }}
          />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <CartDrawer />
          <Toasts />
        </StoreProvider>
      </body>
    </html>
  );
}