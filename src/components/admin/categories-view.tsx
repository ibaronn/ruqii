"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

type Category = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  navHidden: boolean;
  productCount: number;
};

const emptyForm = {
  nameAr: "",
  nameEn: "",
  slug: "",
  description: "",
  sortOrder: "0",
  isActive: true,
  navHidden: false,
};

export function CategoriesView() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Category | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setCategories(d.categories as Category[]))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setCreating(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      nameAr: c.nameAr,
      nameEn: c.nameEn,
      slug: c.slug,
      description: c.description ?? "",
      sortOrder: String(c.sortOrder),
      isActive: c.isActive,
      navHidden: c.navHidden,
    });
    setError(null);
    setCreating(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      nameAr: form.nameAr.trim(),
      nameEn: form.nameEn.trim(),
      slug:
        form.slug.trim().toLowerCase() ||
        form.nameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: form.description.trim() || null,
      sortOrder: Math.max(0, Math.round(Number(form.sortOrder) || 0)),
      isActive: form.isActive,
      navHidden: form.navHidden,
    };
    try {
      const res = await fetch(
        editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
        {
          method: editing ? "PATCH" : "POST",
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
      setCreating(false);
      load();
    } catch {
      setError("تعذّر الحفظ");
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/categories/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error ?? "تعذّر الحذف");
        return;
      }
      setDeleting(null);
      load();
    } catch {
      setDeleteError("تعذّر الحذف");
    }
  };

  const slugHint = form.slug ? `#/products?category=${form.slug}` : "سيُولّد تلقائيًا من الاسم بالإنجليزية";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-ink/45">
            لوحة التحكم
          </p>
          <h1 className="mt-2 text-3xl font-medium">التصنيفات</h1>
        </div>
        <Button onClick={openCreate} size="lg" className="gap-2">
          <Plus className="size-4" />
          إضافة تصنيف
        </Button>
      </header>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-start text-sm">
            <thead>
              <tr className="border-b border-white/50 bg-white/40 text-[12px] uppercase tracking-wider text-ink/45">
                <th className="px-4 py-3 text-start font-medium">التصنيف</th>
                <th className="px-4 py-3 text-start font-medium">المعرّف</th>
                <th className="px-4 py-3 text-start font-medium">الترتيب</th>
                <th className="px-4 py-3 text-start font-medium">المنتجات</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-end font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-5">
                      <div className="skeleton h-6 w-full" />
                    </td>
                  </tr>
                ))}
              {!loading && categories.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-ink/45">
                    لا توجد تصنيفات بعد. أضف أول تصنيف.
                  </td>
                </tr>
              )}
              {!loading &&
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-bone-warm/60">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.nameAr}</p>
                      <p className="text-[12px] text-ink/45">{c.nameEn}</p>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink/60" dir="ltr" style={{ textAlign: "center" }}>
                      {c.slug}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink/60">{c.sortOrder}</td>
                    <td className="px-4 py-3 tabular-nums">{c.productCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge tone={c.isActive ? "green" : "red"}>
                          {c.isActive ? "نشط" : "معطّل"}
                        </Badge>
                        {c.navHidden && (
                          <Badge tone="yellow">التبويب مخفي</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          aria-label="تعديل"
                          className="flex size-8 items-center justify-center rounded-lg text-ink/55 transition hover:bg-white/60 hover:text-ink"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleting(c);
                          }}
                          aria-label="حذف"
                          className="flex size-8 items-center justify-center rounded-lg text-ink/55 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / edit modal */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        labelledBy="category-form-title"
      >
        {creating && (
          <>
            <ModalHeader
              title={editing ? "تعديل التصنيف" : "إضافة تصنيف"}
              onClose={() => setCreating(false)}
            />
            <form onSubmit={submit} className="space-y-5 px-6 py-5" noValidate>
              {error && (
                <div
                  role="alert"
                  className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name-ar" className="mb-1.5 block text-sm font-medium">
                    الاسم بالعربية *
                  </label>
                  <Input
                    id="c-name-ar"
                    value={form.nameAr}
                    onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="c-name-en" className="mb-1.5 block text-sm font-medium">
                    الاسم بالإنجليزية *
                  </label>
                  <Input
                    id="c-name-en"
                    dir="ltr"
                    className="text-start"
                    value={form.nameEn}
                    onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="c-slug" className="mb-1.5 block text-sm font-medium">
                  المعرّف
                </label>
                <Input
                  id="c-slug"
                  dir="ltr"
                  className="text-start tabular-nums"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  hint={slugHint}
                />
              </div>
              <div>
                <label htmlFor="c-desc" className="mb-1.5 block text-sm font-medium">
                  الوصف
                </label>
                <Textarea
                  id="c-desc"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-order" className="mb-1.5 block text-sm font-medium">
                    الترتيب
                  </label>
                  <Input
                    id="c-order"
                    type="number"
                    min="0"
                    dir="ltr"
                    className="text-start tabular-nums"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="glass-soft flex flex-1 items-center justify-between rounded-xl px-4 py-3">
                    <span className="text-sm font-medium">نشط</span>
                    <Switch
                      checked={form.isActive}
                      onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                      label="نشط"
                    />
                  </label>
                </div>
              </div>
              <label className="glass-soft flex items-center justify-between rounded-xl px-4 py-3">
                <span>
                  <span className="block text-sm font-medium">
                    إخفاء من قائمة الأصناف في المتجر
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-5 text-ink/50">
                    لن يظهر تبويب هذا التصنيف في المتجر إلا عند تفعيله هنا
                  </span>
                </span>
                <Switch
                  checked={form.navHidden}
                  onChange={(v) => setForm((f) => ({ ...f, navHidden: v }))}
                  label="إخفاء التبويب"
                />
              </label>
              <div className="flex items-center gap-3 border-t border-white/50 pt-4">
                <Button type="submit" loading={saving}>
                  {editing ? "حفظ التغييرات" : "إنشاء التصنيف"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} labelledBy="category-delete-title">
        {deleting && (
          <>
            <ModalHeader
              title="حذف التصنيف"
              onClose={() => setDeleting(null)}
            />
            <div className="px-6 py-5">
              <p className="text-[15px] leading-relaxed text-ink/75">
                هل تريد حذف تصنيف{" "}
                <span className="font-semibold text-ink">{deleting.nameAr}</span>؟
                {" "}لا يمكن حذف تصنيف يحتوي على منتجات.
              </p>
              {deleteError && (
                <div
                  role="alert"
                  className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {deleteError}
                </div>
              )}
              <div className="mt-6 flex items-center gap-3">
                <Button variant="danger" onClick={confirmDelete}>
                  حذف
                </Button>
                <Button variant="ghost" onClick={() => setDeleting(null)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}