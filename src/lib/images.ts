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

async function savePair(
  buffer: Buffer,
  productId: string
): Promise<{ mainUrl: string; thumbUrl: string }> {
  const key = `${Date.now().toString(36)}-${Buffer.from(crypto.randomBytes(9)).toString("base64url")}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const [mainBlob, thumbBlob] = await Promise.all([
      put(`uploads/${productId}/${key}.jpg`, buffer, {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: false,
      }),
      put(`uploads/${productId}/${key}-sm.jpg`, buffer, {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: false,
      }),
    ]);
    return { mainUrl: mainBlob.url, thumbUrl: thumbBlob.url };
  }

  const dir = path.join(UPLOADS_ROOT, productId);
  await ensureDir(dir);
  await fs.writeFile(path.join(dir, `${key}.jpg`), buffer);
  await fs.writeFile(path.join(dir, `${key}-sm.jpg`), buffer);
  return {
    mainUrl: `/uploads/${productId}/${key}.jpg`,
    thumbUrl: `/uploads/${productId}/${key}-sm.jpg`,
  };
}

export async function saveImageFromBuffer(
  buffer: Buffer,
  mime: string,
  productId: string
): Promise<{ mainUrl: string; thumbUrl: string }> {
  if (buffer.length === 0) throw new ImageError("empty", "ط§ظ„ظ…ظ„ظپ ظپط§ط±ط؛");
  if (buffer.length > MAX_IMAGE_BYTES)
    throw new ImageError("too-large", "ط­ط¬ظ… ط§ظ„طµظˆط±ط© ظٹطھط¬ط§ظˆط² ط§ظ„ط­ط¯ ط§ظ„ظ…ط³ظ…ظˆط­ 10MB");
  const ext = ALLOWED_TYPES.get(mime);
  if (!ext)
    throw new ImageError("type", "ظ†ظˆط¹ ط§ظ„ظ…ظ„ظپ ط؛ظٹط± ظ…ط¯ط¹ظˆظ… (JPG, PNG, WebP, AVIF)");
  try {
    const pair = await savePair(buffer, productId);
    return pair;
  } catch {
    throw new ImageError("process", "طھط¹ط°ط± ظ…ط¹ط§ظ„ط¬ط© ط§ظ„طµظˆط±ط©طŒ طھط£ظƒط¯ ط£ظ†ظ‡ط§ طµظˆط±ط© ط³ظ„ظٹظ…ط©");
  }
}

export async function saveImageFromUrl(
  url: string,
  productId: string
): Promise<{ mainUrl: string; thumbUrl: string }> {
  if (!/^https?:\/\//i.test(url))
    throw new ImageError("url", "ط±ط§ط¨ط· ط§ظ„طµظˆط±ط© ط؛ظٹط± طµط­ظٹط­");
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: { "User-Agent": "RuqiStoreBot/1.0" },
  });
  if (!res.ok) throw new ImageError("url", "طھط¹ط°ط± طھط­ظ…ظٹظ„ ط§ظ„طµظˆط±ط© ظ…ظ† ط§ظ„ط±ط§ط¨ط·");
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_IMAGE_BYTES)
    throw new ImageError("too-large", "ط­ط¬ظ… ط§ظ„طµظˆط±ط© ظٹطھط¬ط§ظˆط² ط§ظ„ط­ط¯ ط§ظ„ظ…ط³ظ…ظˆط­ 10MB");
  const mime = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  const ext = ALLOWED_TYPES.get(mime);
  if (!ext) throw new ImageError("type", "ظ†ظˆط¹ ظ…ظ„ظپ ط؛ظٹط± ظ…ط¯ط¹ظˆظ… ط¹ظ„ظ‰ ط§ظ„ط±ط§ط¨ط·");
  try {
    return await savePair(buf, productId);
  } catch {
    throw new ImageError("process", "طھط¹ط°ط± ظ…ط¹ط§ظ„ط¬ط© ط§ظ„طµظˆط±ط© ظ…ظ† ط§ظ„ط±ط§ط¨ط·");
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
