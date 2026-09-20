"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
};

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(!!productId);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [nameAr, setNameAr] = React.useState("");
  const [nameEn, setNameEn] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [compareAt, setCompareAt] = React.useState("");
  const [stock, setStock] = React.useState("0");
  const [categoryId, setCategoryId] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [isFeatured, setIsFeatured] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) throw new Error();
        const list = (await res.json()).categories as Category[];
        if (!alive) return;
        setCategories(list);

        if (productId) {
          setLoading(true);
          const pRes = await fetch(`/api/admin/products/${productId}`);
          if (!pRes.ok) throw new Error();
          const p = (await pRes.json()).product;
          if (!alive) return;
          setNameAr(p.nameAr);
          setNameEn(p.nameEn ?? "");
          setSlug(p.slug ?? "");
          setDescription(p.description ?? "");
          setPrice((p.priceCents / 100).toFixed(2));
          setCompareAt(p.compareAtCents ? (p.compareAtCents / 100).toFixed(2) : "");
          setStock(String(p.stock));
          const match = list.find((c) => c.id === p.categorySlug) ?? list.find((c) => c.slug === p.categorySlug);
          setCategoryId(match?.id ?? list[0]?.id ?? "");
          setIsActive(p.isActive);
          setIsFeatured(p.isFeatured);
        } else {
          setCategoryId(list[0]?.id ?? "");
        }
      } catch {
        if (alive) setError("تعذّر تحميل البيانات");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [productId]);

  const toCents = (v: string) => Math.round(parseFloat(v || "0") * 100);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nameAr.trim()) return setError("أدخل اسم المنتج بالعربية");
    if (!description.trim()) return setError("أدخل وصف المنتج");
    if (!price || !(toCents(price) > 0)) return setError("أدخل سعرًا صحيحًا");
    if (!categoryId) return setError("اختر التصنيف");

    const stockNum = Math.max(0, Math.round(Number(stock) || 0));
    const body = {
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || null,
      slug: slug.trim() || null,
      description: description.trim(),
      priceCents: toCents(price),
      compareAtCents: toCents(compareAt) > 0 ? toCents(compareAt) : null,
      stock: stockNum,
      isActive,
      isFeatured,
      categoryId,
    };

    setSaving(true);
    try {
      const res = await fetch(
        productId ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: productId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "تعذّر الحفظ");
        setSaving(false);
        return;
      }
      if (productId) {
        router.push("/admin/products");
      } else {
        router.push(`/admin/products/${data.product.id}/edit`);
      }
      router.refresh();
    } catch {
      setError("تعذّر الحفظ، حاول مرة أخرى");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-10">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton h-96 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink/55 transition hover:text-ink"
        >
          <ArrowRight className="size-3.5" />
          العودة للمنتجات
        </Link>
        <h1 className="mt-2 text-3xl font-medium">
          {productId ? "تعديل المنتج" : "إضافة منتج جديد"}
        </h1>
      </header>

      <form
        onSubmit={submit}
        className="glass space-y-6 p-6"
        noValidate
      >
        {error && (
          <div
            role="alert"
            className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="p-name-ar" className="mb-1.5 block text-sm font-medium">
              الاسم بالعربية *
            </label>
            <Input id="p-name-ar" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
          </div>
          <div>
            <label htmlFor="p-name-en" className="mb-1.5 block text-sm font-medium">
              الاسم بالإنجليزية
            </label>
            <Input
              id="p-name-en"
              dir="ltr"
              className="text-start"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="p-slug" className="mb-1.5 block text-sm font-medium">
            المعرّف (رابط المنتج)
          </label>
          <Input
            id="p-slug"
            dir="ltr"
            className="text-start tabular-nums"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            hint="اتركه فارغًا ليُولّد تلقائيًا من الاسم بالإنجليزية."
          />
        </div>

        <div>
          <label htmlFor="p-desc" className="mb-1.5 block text-sm font-medium">
            الوصف *
          </label>
          <Textarea
            id="p-desc"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="p-price" className="mb-1.5 block text-sm font-medium">
              السعر (د.ل) *
            </label>
            <Input
              id="p-price"
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              dir="ltr"
              className="text-start tabular-nums"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="p-compare" className="mb-1.5 block text-sm font-medium">
              سعر قبل الخصم
            </label>
            <Input
              id="p-compare"
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              dir="ltr"
              className="text-start tabular-nums"
              value={compareAt}
              onChange={(e) => setCompareAt(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="p-stock" className="mb-1.5 block text-sm font-medium">
              المخزون
            </label>
            <Input
              id="p-stock"
              type="number"
              inputMode="numeric"
              min="0"
              dir="ltr"
              className="text-start tabular-nums"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="p-category" className="mb-1.5 block text-sm font-medium">
            التصنيف *
          </label>
          <Select
            id="p-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.length === 0 && <option value="">— لا توجد تصنيفات —</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameAr}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-4 border-t border-white/50 pt-5">
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3",
              isActive ? "border-emerald-200 bg-emerald-50/50" : "glass-soft border-transparent"
            )}
          >
            <div>
              <p className="text-sm font-medium">منتج نشط</p>
              <p className="text-[12px] text-ink/50">
                معطّل = غير ظاهر في المتجر ولا يُطلب.
              </p>
            </div>
            <Switch checked={isActive} onChange={setIsActive} label="نشط" />
          </div>
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3",
              isFeatured ? "border-amber-200 bg-amber-50/50" : "glass-soft border-transparent"
            )}
          >
            <div>
              <p className="text-sm font-medium">منتج مميز</p>
              <p className="text-[12px] text-ink/50">يُعرض في القسم المميز بالرئيسية.</p>
            </div>
            <Switch checked={isFeatured} onChange={setIsFeatured} label="مميز" />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/50 pt-5">
          <Button type="submit" size="lg" loading={saving}>
            {!saving && <Save className="size-4" />}
            {productId ? "حفظ التغييرات" : "إنشاء المنتج"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => router.push("/admin/products")}
          >
            إلغاء
          </Button>
          {saving && <Loader2 className="size-4 animate-spin text-ink/40" />}
        </div>
      </form>
    </div>
  );
}