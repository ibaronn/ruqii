import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { put, del } from "@vercel/blob";
import type { Metadata as SharpMetadata } from "sharp";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export class ImageError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function hasAlpha(meta: SharpMetadata) {
  return meta.hasAlpha ?? false;
}

function contentTypeFor(ext: string) {
  switch (ext) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    default:
      return "image/jpeg";
  }
}

async function render(
  buf: Buffer,
  ext: string,
  width: number,
  quality = 82
): Promise<{ buffer: Buffer; ext: string }> {
  const img = sharp(buf)
    .rotate()
    .resize(width, width, { fit: "inside", withoutEnlargement: true });
  const meta = await img.metadata();
  if (hasAlpha(meta)) {
    const buffer = await img
      .flatten({ background: "#ffffff" })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    return { buffer, ext: ".jpg" };
  }
  if (ext === ".png") {
    const buffer = await img
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
    return { buffer, ext: ".png" };
  }
  const buffer = await img.jpeg({ quality, mozjpeg: true }).toBuffer();
  return { buffer, ext: ".jpg" };
}

const MAIN_WIDTH = 1100;
const THUMB_WIDTH = 420;

async function savePair(
  buffer: Buffer,
  productId: string,
  sourceExt: string
): Promise<{ mainUrl: string; thumbUrl: string }> {
  const key = `${Date.now().toString(36)}-${Buffer.from(crypto.randomBytes(9)).toString("base64url")}`;

  const [{ buffer: mainBuffer, ext: mainExt }, { buffer: thumbBuffer, ext: thumbExt }] =
    await Promise.all([
      render(buffer, sourceExt, MAIN_WIDTH, 84),
      render(buffer, sourceExt, THUMB_WIDTH, 76),
    ]);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const [mainBlob, thumbBlob] = await Promise.all([
        put(`uploads/${productId}/${key}${mainExt}`, mainBuffer, {
          access: "public",
          contentType: contentTypeFor(mainExt),
          addRandomSuffix: false,
        }),
        put(`uploads/${productId}/${key}-sm${thumbExt}`, thumbBuffer, {
          access: "public",
          contentType: contentTypeFor(thumbExt),
          addRandomSuffix: false,
        }),
      ]);
      return { mainUrl: mainBlob.url, thumbUrl: thumbBlob.url };
    } catch {
      // fall through to local/db storage
    }
  }

  try {
    const dir = path.join(UPLOADS_ROOT, productId);
    await ensureDir(dir);
    await fs.writeFile(path.join(dir, `${key}${mainExt}`), mainBuffer);
    await fs.writeFile(path.join(dir, `${key}-sm${thumbExt}`), thumbBuffer);
    return {
      mainUrl: `/uploads/${productId}/${key}${mainExt}`,
      thumbUrl: `/uploads/${productId}/${key}-sm${thumbExt}`,
    };
  } catch {
    // Vercel serverless has a read-only filesystem. When neither Vercel Blob
    // nor a writable filesystem is available, store the optimized image as a
    // data URL inside the database so uploads keep working out of the box.
    return {
      mainUrl: `data:${contentTypeFor(mainExt)};base64,${mainBuffer.toString("base64")}`,
      thumbUrl: `data:${contentTypeFor(thumbExt)};base64,${thumbBuffer.toString("base64")}`,
    };
  }
}

export async function saveImageFromBuffer(
  buffer: Buffer,
  mime: string,
  productId: string
): Promise<{ mainUrl: string; thumbUrl: string }> {
  if (buffer.length === 0) throw new ImageError("empty", "الملف فارغ");
  if (buffer.length > MAX_IMAGE_BYTES)
    throw new ImageError("too-large", "حجم الصورة يتجاوز الحد المسموح 10MB");
  const ext = ALLOWED_TYPES.get(mime);
  if (!ext)
    throw new ImageError("type", "نوع الملف غير مدعوم (JPG, PNG, WebP, AVIF)");
  try {
    return await savePair(buffer, productId, ext);
  } catch {
    throw new ImageError("process", "تعذّرت معالجة الصورة، تأكد أنها صورة سليمة");
  }
}

export async function saveImageFromUrl(
  url: string,
  productId: string
): Promise<{ mainUrl: string; thumbUrl: string }> {
  if (!/^https?:\/\//i.test(url))
    throw new ImageError("url", "رابط الصورة غير صحيح");
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: { "User-Agent": "RuqiStoreBot/1.0" },
  });
  if (!res.ok) throw new ImageError("url", "تعذّر تحميل الصورة من الرابط");
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_IMAGE_BYTES)
    throw new ImageError("too-large", "حجم الصورة يتجاوز الحد المسموح 10MB");
  const mime = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  const ext = ALLOWED_TYPES.get(mime);
  if (!ext) throw new ImageError("type", "نوع ملف غير مدعوم على الرابط");
  try {
    return await savePair(buf, productId, ext);
  } catch {
    throw new ImageError("process", "تعذّرت معالجة الصورة من الرابط");
  }
}

export async function deleteImageFiles(urls: (string | null)[]) {
  const blobUrls: string[] = [];

  for (const url of urls) {
    if (!url) continue;

    if (/^https?:\/\//i.test(url)) {
      blobUrls.push(url);
      const m = url.match(/^(.*)\.([a-z0-9]+)(\?.*)?$/i);
      if (m) blobUrls.push(`${m[1]}-sm.${m[2]}`);
      continue;
    }

    if (!url.startsWith("/uploads/")) continue;
    const rel = url.replace(/^\//, "");
    const abs = path.join(process.cwd(), "public", rel);
    if (!abs.startsWith(path.join(process.cwd(), "public", "uploads"))) continue;
    try {
      await fs.unlink(abs);
    } catch {
      // ignore missing files
    }
    const m = rel.match(/^(.*)\.([a-z0-9]+)$/i);
    if (m) {
      try {
        await fs.unlink(path.join(process.cwd(), "public", `${m[1]}-sm.${m[2]}`));
      } catch {
        // ignore missing thumb
      }
    }
  }

  if (blobUrls.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(blobUrls);
    } catch {
      // ignore missing blobs
    }
  }
}

export function normalizeImageUrl(url: string) {
  return url;
}

export function thumbUrl(url: string | null) {
  if (!url) return null;
  const m = url.match(/^(.*\/)([^/]+)\.([a-z0-9]+)(\?.*)?$/i);
  if (!m) return url;
  return `${m[1]}${m[2]}-sm.${m[3]}`;
}
