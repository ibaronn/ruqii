import { prisma } from "./prisma";

export type SettingFieldType = "text" | "textarea";

export type SettingDef = {
  key: string;
  label: string;
  hint?: string;
  type?: SettingFieldType;
  group: string;
  default: string;
};

export const SITE_SETTING_DEFS: SettingDef[] = [
  // عام
  {
    key: "brand_name",
    label: "اسم المتجر",
    group: "عام",
    default: "رُقي",
  },
  {
    key: "brand_tagline",
    label: "الشعار الجانبي",
    group: "عام",
    default: "Ruqii — since 2026",
  },
  {
    key: "meta_title",
    label: "عنوان الصفحة (SEO)",
    group: "عام",
    default: "رُقي — تشكيلة راقية",
  },
  {
    key: "meta_description",
    label: "وصف الصفحة (SEO)",
    type: "textarea",
    group: "عام",
    default:
      "رُقي: دار عربية تجمع بين البساطة والرفاهية، تشكيلة مختارة بعناية من أزياء وإكسسوارات وعطور وجلديات.",
  },

  // الترويسة
  { key: "nav_home", label: "رابط الرئيسية", group: "الترويسة", default: "الرئيسية" },
  { key: "nav_products", label: "رابط المنتجات", group: "الترويسة", default: "المنتجات" },
  { key: "nav_categories", label: "رابط التصنيفات", group: "الترويسة", default: "التصنيفات" },
  { key: "nav_track", label: "رابط تتبع الطلب", group: "الترويسة", default: "تتبع الطلب" },
  {
    key: "nav_all_products",
    label: "رابط عرض جميع المنتجات",
    group: "الترويسة",
    default: "عرض جميع المنتجات",
  },

  // رسالة الترحيب (الواجهة)
  {
    key: "hero_eyebrow",
    label: "السطر العلوي",
    group: "رسالة الترحيب",
    default: "دار رُقي — تشكيلة مختارة بعناية",
  },
  { key: "hero_title_1", label: "العنوان — السطر 1", group: "رسالة الترحيب", default: "الأناقةُ" },
  { key: "hero_title_2", label: "العنوان — السطر 2", group: "رسالة الترحيب", default: "تُروى" },
  {
    key: "hero_title_accent",
    label: "العنوان — الكلمة المميزة",
    group: "رسالة الترحيب",
    default: "بالتفاصيل",
  },
  {
    key: "hero_subtitle",
    label: "النص التعريفي",
    type: "textarea",
    group: "رسالة الترحيب",
    default:
      "من الأزياء إلى الجلديات والعطور، نختار كل قطعة بمعايير الرُّقي الحقيقية لتصبح جزءًا من أسلوبك.",
  },
  {
    key: "hero_cta_primary",
    label: "زر التسوق",
    group: "رسالة الترحيب",
    default: "تسوق التشكيلة",
  },
  {
    key: "hero_cta_secondary",
    label: "زر قصتنا",
    group: "رسالة الترحيب",
    default: "قصتنا",
  },

  // المزايا
  { key: "value_1_title", label: "الميزة 1 — العنوان", group: "المزايا", default: "جودة صناعية" },
  {
    key: "value_1_text",
    label: "الميزة 1 — النص",
    group: "المزايا",
    default: "خامات مختارة وتفاصيل تُصنع بعناية لتدوم",
  },
  { key: "value_2_title", label: "الميزة 2 — العنوان", group: "المزايا", default: "توصيل موثوق" },
  {
    key: "value_2_text",
    label: "الميزة 2 — النص",
    group: "المزايا",
    default: "شحن سريع ومتابعة طلبك لحظة بلحظة",
  },
  { key: "value_3_title", label: "الميزة 3 — العنوان", group: "المزايا", default: "تجربة راقية" },
  {
    key: "value_3_text",
    label: "الميزة 3 — النص",
    group: "المزايا",
    default: "تصميم هادئ يضع المنتج في مركز الاهتمام",
  },

  // الأقسام
  { key: "featured_eyebrow", label: "المختارات — السطر العلوي", group: "الأقسام", default: "مختارات" },
  {
    key: "featured_title",
    label: "المختارات — العنوان",
    group: "الأقسام",
    default: "قطع تميّز كل يوم",
  },
  { key: "featured_viewall", label: "زر عرض الكل", group: "الأقسام", default: "عرض الكل" },
  { key: "categories_eyebrow", label: "التصنيفات — السطر العلوي", group: "الأقسام", default: "الأقسام" },
  {
    key: "categories_title",
    label: "التصنيفات — العنوان",
    group: "الأقسام",
    default: "تصفح بتصنيفات",
  },

  // من نحن
  { key: "about_eyebrow", label: "من نحن — السطر العلوي", group: "من نحن", default: "لماذا رُقي" },
  {
    key: "about_title",
    label: "من نحن — العنوان",
    group: "من نحن",
    default: "نؤمن أن الفخامة لا تصرخ…",
  },
  {
    key: "about_accent",
    label: "من نحن — العبارة المميزة",
    group: "من نحن",
    default: "بل تُرى في التفاصيل الصغيرة،",
  },
  {
    key: "about_text",
    label: "من نحن — النص",
    type: "textarea",
    group: "من نحن",
    default: "في الخامة، في القصّة، وفي الطريقة التي يُقدَّم بها كل شيء.",
  },

  // التذييل
  {
    key: "footer_about",
    label: "نبذة المتجر",
    type: "textarea",
    group: "التذييل",
    default:
      "رُقي — دار عربية تجمع بين البساطة والرفاهية، لتقديم تشكيلة مختارة بعناية تعكس ذوقًا راقيًا في كل تفصيلة.",
  },
  {
    key: "footer_service",
    label: "سطر خدمة العملاء",
    group: "التذييل",
    default: "خدمة العملاء متاحة عبر الهاتف والوتساب يوميًا",
  },
  {
    key: "footer_copyright",
    label: "حقوق النشر",
    group: "التذييل",
    default: "© 2026 دار رُقي. جميع الحقوق محفوظة.",
  },
  {
    key: "footer_credit",
    label: "سطر الختام",
    group: "التذييل",
    default: "صُنع بفخر بهدف الإبداع العربي الأصيل",
  },
];

export const SETTING_GROUPS: string[] = Array.from(
  new Set(SITE_SETTING_DEFS.map((d) => d.group))
);

export function siteSettingDefaults(): Record<string, string> {
  return Object.fromEntries(SITE_SETTING_DEFS.map((d) => [d.key, d.default]));
}

export type SiteSettings = Record<string, string>;

export async function getSiteSettings(): Promise<SiteSettings> {
  const values = siteSettingDefaults();
  try {
    const rows = await prisma.setting.findMany();
    for (const row of rows) {
      if (row.key in values) values[row.key] = row.value;
    }
  } catch {
    // قاعدة البيانات غير مهيأة بعد — استخدم القيم الافتراضية
  }
  return values;
}

export async function saveSiteSettings(
  updates: Record<string, string>
): Promise<SiteSettings> {
  const known = new Set(SITE_SETTING_DEFS.map((d) => d.key));
  const entries = Object.entries(updates).filter(([k]) => known.has(k));

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value ?? "") },
        update: { value: String(value ?? "") },
      })
    )
  );

  return getSiteSettings();
}
