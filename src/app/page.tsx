import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ScanLine, Sparkles, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { productInclude, serializeProduct } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";
import { ProductGrid } from "@/components/store/product-grid";
import { Reveal } from "@/components/ui/reveal";
import { BrandMark } from "@/components/brand";

export const metadata: Metadata = {
  description:
    "دار رُقي — تشكيلة مختارة بعناية من الأزياء والجلديات والعطور والإكسسوارات.",
};

const valueIcons = [Sparkles, Truck, ScanLine];

export default async function Home() {
  const [featuredProducts, categories, s] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.category.findMany({
      where: { isActive: true, navHidden: false },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    }),
    getSiteSettings(),
  ]);

  const values = [1, 2, 3].map((n, i) => ({
    icon: valueIcons[i],
    title: s[`value_${n}_title`],
    text: s[`value_${n}_text`],
  }));
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" aria-label="مقدمة رُقي">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle at 82% 18%, rgba(10,10,10,0.05) 0, transparent 42%), radial-gradient(circle at 12% 88%, rgba(10,10,10,0.04) 0, transparent 40%)",
            }}
          />
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="absolute -start-10 -top-14 h-[380px] w-[380px] rotate-180 opacity-[0.07] sm:h-[520px] sm:w-[520px]"
          />
        </div>

        <div className="shell relative grid min-h-[78vh] items-center py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="animate-fade-up text-[13px] font-medium uppercase tracking-[0.32em] text-ink/45">
              {s.hero_eyebrow}
            </p>
            <h1
              className="mt-6 animate-fade-up text-[clamp(2.6rem,7vw,5.6rem)] font-light leading-[1.08] tracking-tight"
              style={{ animationDelay: "80ms" }}
            >
              {s.hero_title_1}
              <br />
              {s.hero_title_2}
              <span className="font-semibold"> {s.hero_title_accent}</span>
            </h1>
            <p
              className="mt-7 max-w-md animate-fade-up text-lg leading-relaxed text-ink/60"
              style={{ animationDelay: "160ms" }}
            >
              {s.hero_subtitle}
            </p>
            <div
              className="mt-10 flex animate-fade-up flex-wrap items-center gap-3"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                href="/products"
                className="group inline-flex h-[52px] items-center gap-2.5 bg-ink px-8 text-[15px] font-medium text-white transition hover:bg-[#2b2b2b] active:scale-[0.98]"
              >
                {s.hero_cta_primary}
                <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
              <a
                href="#philosophy"
                className="inline-flex h-[52px] items-center gap-2.5 border border-ink/20 px-8 text-[15px] font-medium text-ink transition hover:border-ink active:scale-[0.98]"
              >
                {s.hero_cta_secondary}
              </a>
            </div>
          </div>

          <div
            className="mt-16 hidden animate-fade-up items-center justify-center lg:mt-0 lg:flex"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <BrandMark className="h-40 w-40 opacity-90" />
              <div className="space-y-1.5">
                <p className="text-5xl font-semibold leading-none">
                  {s.brand_name}
                </p>
                <p className="text-xs uppercase tracking-[0.42em] text-ink/40">
                  {s.brand_tagline}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="shell mt-16 border-t border-white/50">
          <dl className="grid grid-cols-1 divide-y divide-white/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-x-reverse">
            {values.map((v, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-6 sm:px-6 sm:first:ps-0"
              >
                <v.icon className="mt-0.5 size-5 shrink-0 text-ink/50" />
                <div>
                  <dt className="text-[15px] font-medium">{v.title}</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-ink/55">
                    {v.text}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Featured products */}
      <section className="shell mt-20">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-ink/45">
              {s.featured_eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-medium sm:text-4xl">
              {s.featured_title}
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-ink transition hover:text-ink/60"
          >
            {s.featured_viewall}
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </Reveal>
        <Reveal className="mt-8" delay={80}>
          {featuredProducts.length > 0 ? (
            <ProductGrid products={featuredProducts.map(serializeProduct)} />
          ) : (
            <p className="border border-dashed border-white/60 py-16 text-center text-ink/45">
              أضف منتجات مميزة من لوحة التحكم لتظهر هنا
            </p>
          )}
        </Reveal>
      </section>

      {/* Categories */}
      <section className="shell mt-20">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-ink/45">
              {s.categories_eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-medium sm:text-4xl">
              {s.categories_title}
            </h2>
          </div>
        </Reveal>

        {categories.length > 0 && (
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, idx) => (
              <li key={c.id}>
                <Reveal delay={idx * 50} className="h-full">
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="glass group flex h-full flex-col justify-between gap-10 rounded-2xl px-6 py-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-26px_rgba(30,24,16,0.45)]"
                  >
                    <p className="text-5xl font-light text-ink/15 transition-colors duration-300 group-hover:text-ink/25">
                      {String(c.sortOrder).padStart(2, "0")}
                    </p>
                    <div>
                      <h3 className="text-xl font-medium">{c.nameAr}</h3>
                      <p className="mt-1 text-sm text-ink/50">
                        {c._count.products} منتج
                      </p>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Philosophy */}
      <section id="philosophy" className="shell scroll-mt-24 py-24 lg:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="mx-auto mb-10 h-24 w-24 opacity-40"
          />
          <p className="text-[13px] font-medium uppercase tracking-[0.32em] text-ink/45">
            {s.about_eyebrow}
          </p>
          <h2 className="mt-6 text-3xl font-light leading-snug sm:text-[2.6rem] sm:leading-[1.35]">
            {s.about_title}{" "}
            <span className="font-medium">{s.about_accent}</span> {s.about_text}
          </h2>
        </Reveal>
      </section>
    </>
  );
}