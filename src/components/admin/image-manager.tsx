"use client";

import * as React from "react";
import { ImagePlus, Link2, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Img = {
  id: string;
  url: string;
  thumb: string | null;
  altAr: string | null;
  isPrimary: boolean;
};

export function ImageManager({ productId }: { productId: string }) {
  const [images, setImages] = React.useState<Img[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [urlBusy, setUrlBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const apply = (list: Img[]) => setImages(list);

  const load = React.useCallback(() => {
    fetch(`/api/admin/products/${productId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => apply(d.product.images as Img[]))
      .catch(() => setError("تعذّر تحميل الصور"));
  }, [productId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "تعذّر رفع الصور");
      } else {
        apply(data.images as Img[]);
      }
    } catch {
      setError("تعذّر رفع الصور");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addFromUrl = async () => {
    if (!url.trim()) return;
    setUrlBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "تعذّر إضافة الصورة");
      } else {
        apply(data.images as Img[]);
        setUrl("");
      }
    } catch {
      setError("تعذّر إضافة الصورة");
    } finally {
      setUrlBusy(false);
    }
  };

  const setPrimary = async (imageId: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/images/${imageId}/primary`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "تعذّر التحديث");
      else apply(data.images as Img[]);
    } catch {
      setError("تعذّر التحديث");
    } finally {
      setBusy(false);
    }
  };

  const removeImage = async (imageId: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/images/${imageId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "تعذّر الحذف");
      else apply(data.images as Img[]);
    } catch {
      setError("تعذّر الحذف");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium">صور المنتج</h3>
        <p className="mt-1 text-[13px] text-ink/50">
          الأولى منها تُعرض كصورة رئيسية للمنتج.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <button
          type="button"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            uploadFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
          }}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors",
            dragging
              ? "border-ink bg-stone-faint"
              : "border-white/70 bg-white/35 hover:border-ink/40"
          )}
        >
          {busy ? (
            <Loader2 className="size-6 animate-spin text-ink/40" />
          ) : (
            <>
              <UploadCloud className="size-6 text-ink/40" />
              <span className="text-[12px] text-ink/50">اسحب صورًا أو اخترها</span>
              <span className="text-[11px] text-ink/35">
                JPG · PNG · WebP · AVIF — حتى 10MB
              </span>
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          hidden
          onChange={(e) =>
            uploadFiles(Array.from(e.target.files ?? []))
          }
        />

        <div className="glass-soft flex flex-col justify-center rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-[12px] text-ink/45">
            <Link2 className="size-3.5" />
            أو أضف من رابط
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              dir="ltr"
              className="h-10 text-start text-[13px]"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              variant="outline"
              className="h-10 shrink-0 px-3"
              onClick={addFromUrl}
              loading={urlBusy}
            >
              <ImagePlus className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <li
              key={img.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border ring-1 ring-white/50",
                img.isPrimary ? "border-ink" : "border-white/60"
              )}
            >
              <img src={img.thumb ?? img.url} alt="" className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1.5">
                {img.isPrimary ? (
                  <span className="glass-dark inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10px] font-medium text-white">
                    <Star className="size-2.5" fill="currentColor" />
                    رئيسية
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPrimary(img.id)}
                    className="flex size-7 items-center justify-center rounded-lg bg-white/85 text-ink/55 shadow-sm backdrop-blur transition hover:text-amber-500"
                    aria-label="تعيين كصورة رئيسية"
                    title="تعيين كصورة رئيسية"
                  >
                    <Star className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="flex size-7 items-center justify-center rounded-lg bg-white/85 text-ink/55 shadow-sm backdrop-blur transition hover:text-red-600"
                  aria-label="حذف الصورة"
                  title="حذف"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}