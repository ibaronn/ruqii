import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "أدخل اسم المستخدم" })
    .max(64),
  password: z.string().min(1, { message: "أدخل كلمة المرور" }).max(128),
});

export const productSchema = z.object({
  nameAr: z.string().min(1, { message: "أدخل اسم المنتج بالعربية" }).max(200),
  nameEn: z.string().max(200).optional().nullable(),
  slug: z
    .string()
    .max(200)
    .regex(/^[a-z0-9-]*$/, { message: "المعرّف يجب أن يكون أحرف لاتينية صغيرة وأرقام فقط" })
    .optional(),
  description: z.string().min(1, { message: "أدخل وصف المنتج" }).max(5000),
  priceCents: z.number().int().positive({ message: "أدخل سعرًا صحيحًا" }).max(100_000_000),
  compareAtCents: z.number().int().nonnegative().max(100_000_000).optional().nullable(),
  stock: z.number().int().nonnegative({ message: "المخزون لا يمكن أن يكون سالبًا" }).max(100_000),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.string().min(1, { message: "اختر التصنيف" }),
});

export const orderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, { message: "أدخل الاسم الصحيح" })
    .max(100),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{7,15}$/, { message: "أدخل رقم هاتف صحيحًا" }),
  city: z.string().trim().min(2, { message: "أدخل المدينة / المنطقة" }).max(120),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(999),
      })
    )
    .min(1, { message: "السلة فارغة" })
    .max(50),
});

export const trackingSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .regex(/^RQI-\d{8}-\d{3}$/i, { message: "رقم الطلب غير صحيح" }),
  phone: z.string().trim().min(7, { message: "أدخل رقم الهاتف" }).max(15),
});

export const categorySchema = z.object({
  nameAr: z.string().min(1, { message: "أدخل اسم التصنيف بالعربية" }).max(120),
  nameEn: z.string().min(1, { message: "أدخل اسم التصنيف بالإنجليزية" }).max(120),
  slug: z
    .string()
    .min(1)
    .max(140)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().optional(),
  navHidden: z.boolean().optional(),
});

export const imageUrlSchema = z.object({
  url: z.string().url({ message: "رابط الصورة غير صحيح" }).max(1000),
  altAr: z.string().max(200).optional().nullable(),
});