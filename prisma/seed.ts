import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  {
    nameAr: "أجهزة إلكترونية",
    nameEn: "Electronics",
    slug: "electronics",
    description: "أحدث الأجهزة والتقنيات التي تليق بذوقك",
    sortOrder: 1,
  },
  {
    nameAr: "أزياء",
    nameEn: "Fashion",
    slug: "fashion",
    description: "قطع مختارة بعناية تعكس الذوق الرفيع",
    sortOrder: 2,
  },
  {
    nameAr: "إكسسوارات",
    nameEn: "Accessories",
    slug: "accessories",
    description: "تفاصيل تصنع الفرق في إطلالتك",
    sortOrder: 3,
  },
  {
    nameAr: "عطور",
    nameEn: "Fragrances",
    slug: "fragrances",
    description: "توقيعك الخاص في عالم من الأناقة",
    sortOrder: 4,
  },
  {
    nameAr: "جلديات",
    nameEn: "Leather",
    slug: "leather",
    description: "صناعة يدوية تدوم معك طويلًا",
    sortOrder: 5,
  },
];

const products: Array<{
  nameAr: string;
  nameEn: string;
  slug: string;
  description: string;
  priceCents: number;
  compareAtCents: number | null;
  stock: number;
  isFeatured: boolean;
  categorySlug: string;
}> = [
  {
    nameAr: "معطف صوف منفّش",
    nameEn: "Wool Overcoat",
    slug: "wool-overcoat",
    description:
      "معطف شتوي من صوف طبيعي عالي الجودة، بقصّة نظيفة وتفاصيل هادئة. مناسب لإطلالة رسمية تخطف الأنظار دون مبالغة.",
    priceCents: 185000,
    compareAtCents: 225000,
    stock: 12,
    isFeatured: true,
    categorySlug: "fashion",
  },
  {
    nameAr: "قميص كتان فاخر",
    nameEn: "Linen Shirt",
    slug: "linen-shirt",
    description:
      "قميص كتان خام بنعومة فائقة وقصّة متوازنة. قطعة أساسية تليق بالصباح والمساء على حد سواء.",
    priceCents: 42000,
    compareAtCents: null,
    stock: 30,
    isFeatured: true,
    categorySlug: "fashion",
  },
  {
    nameAr: "ساعة كلاسيك جلدية",
    nameEn: "Classic Leather Watch",
    slug: "classic-leather-watch",
    description:
      "ساعة ذهبية بتصميم كلاسيكي وحركة موثوقة، مع حزام جلد طبيعي ينضج مع الاستخدام. رفاهية تظهر في التفاصيل.",
    priceCents: 640000,
    compareAtCents: 720000,
    stock: 6,
    isFeatured: true,
    categorySlug: "accessories",
  },
  {
    nameAr: "نظارة شمسية بتصميم خالد",
    nameEn: "Classic Sunglasses",
    slug: "classic-sunglasses",
    description:
      "عدسات بجودة عالية بإطار نحيف يليق بجميع ملامح الوجه. حماية أنيقة من الشمس في كل المواسم.",
    priceCents: 52000,
    compareAtCents: null,
    stock: 20,
    isFeatured: false,
    categorySlug: "accessories",
  },
  {
    nameAr: "عطر رُقي المميز",
    nameEn: "Ruqi Signature Fragrance",
    slug: "ruqi-signature-fragrance",
    description:
      "تركيبة شرقية فاخرة تمزج العنبر بنفحات خشبية دافئة. عطر يترك انطباعًا لا يُنسى من أول رشة.",
    priceCents: 385000,
    compareAtCents: 430000,
    stock: 25,
    isFeatured: true,
    categorySlug: "fragrances",
  },
  {
    nameAr: "عطر مسك نقي",
    nameEn: "Pure Musk",
    slug: "pure-musk",
    description:
      "مسك طبيعي نقي بنعومة نبيلة يدوم طويلًا على الجلد. بساطة راقية لا تحتاج إلى تعريف.",
    priceCents: 195000,
    compareAtCents: null,
    stock: 18,
    isFeatured: false,
    categorySlug: "fragrances",
  },
  {
    nameAr: "حقيبة جلد يدوية",
    nameEn: "Handcrafted Leather Bag",
    slug: "handcrafted-leather-bag",
    description:
      "حقيبة من جلد طبيعي مدبوغ بنباتي، بخياطة يدوية وبطانة حريرية. قطعة تُصنع لترافقك لسنوات.",
    priceCents: 425000,
    compareAtCents: 495000,
    stock: 8,
    isFeatured: true,
    categorySlug: "leather",
  },
  {
    nameAr: "محفظة جلد رفيعة",
    nameEn: "Slim Leather Wallet",
    slug: "slim-leather-wallet",
    description:
      "محفظة رفيعة بسعة ذكية وصناعة جلدية دقيقة. الأفضل لمن يؤمن أن البساطة قمة الإتقان.",
    priceCents: 95000,
    compareAtCents: null,
    stock: 40,
    isFeatured: false,
    categorySlug: "leather",
  },
  {
    nameAr: "حزام جلد بعقدة مخفية",
    nameEn: "Leather Belt",
    slug: "leather-belt",
    description:
      "حزام من جلد كامل السمك بإبزيم معدني صامت. تفصيل دقيق يكمّل أي إطلالة رسمية.",
    priceCents: 68000,
    compareAtCents: null,
    stock: 22,
    isFeatured: false,
    categorySlug: "leather",
  },
  {
    nameAr: "وشاح حريري",
    nameEn: "Silk Scarf",
    slug: "silk-scarf",
    description:
      "وشاح من حرير طبيعي بألوان هادئة وتصميم هندسي راقٍ. لمسة أخيرة تحول الإطلالة إلى تحفة.",
    priceCents: 110000,
    compareAtCents: 130000,
    stock: 15,
    isFeatured: false,
    categorySlug: "fashion",
  },
  {
    nameAr: "سماعات لاسلكية بخاصية عزل الضجيج",
    nameEn: "Wireless Noise-Cancelling Earbuds",
    slug: "wireless-earbuds",
    description:
      "سماعات أذن لاسلكية بعزل ضجيج فعّال وصوت نقي، مع علبة شحن أنيقة تدوم لساعات طويلة. رفيق يومك الذكي.",
    priceCents: 320000,
    compareAtCents: 380000,
    stock: 35,
    isFeatured: true,
    categorySlug: "electronics",
  },
  {
    nameAr: "ساعة ذكية رياضية",
    nameEn: "Smart Sports Watch",
    slug: "smart-watch",
    description:
      "ساعة ذكية بشاشة مرنة خارقة الكفاءة، تتابع صحتك وتمرينك وأنت تستقبل إشعاراتك بأناقة.",
    priceCents: 650000,
    compareAtCents: null,
    stock: 14,
    isFeatured: true,
    categorySlug: "electronics",
  },
  {
    nameAr: "باور بانك سريع الشحن 20000mAh",
    nameEn: "Fast Charging Power Bank",
    slug: "power-bank",
    description:
      "شاحن متنقل بسعة كبيرة وشحن سريع يدعم عدة أجهزة في آن واحد. طاقة تدوم معك أينما كنت.",
    priceCents: 145000,
    compareAtCents: null,
    stock: 45,
    isFeatured: false,
    categorySlug: "electronics",
  },
  {
    nameAr: "شاحن لاسلكي قائم",
    nameEn: "Stand Wireless Charger",
    slug: "wireless-charger",
    description:
      "شاحن لاسلكي بتصميم قائم يتيح لك متابعة هاتفك أثناء الشحن، بتشطيب معدني أنيق يليق بمكتبك.",
    priceCents: 115000,
    compareAtCents: 140000,
    stock: 26,
    isFeatured: false,
    categorySlug: "electronics",
  },
  {
    nameAr: "سماعة رأس فاخرة",
    nameEn: "Premium Over-Ear Headphones",
    slug: "premium-headphones",
    description:
      "تجربة صوت استوديو بسماعة رأس مريحة وعزل ممتاز للضوضاء، بخامة جلدية ناعمة ولمسات معدنية فاخرة.",
    priceCents: 460000,
    compareAtCents: 520000,
    stock: 10,
    isFeatured: true,
    categorySlug: "electronics",
  },
];

async function main() {
  const env = process.env as Record<string, string | undefined>;
  const isProd = env.NODE_ENV === "production" || !!env.VERCEL;

  const adminUsername = env.ADMIN_USERNAME ?? "ruqi";
  let adminPassword = env.ADMIN_PASSWORD;
  if (!adminPassword) {
    if (isProd) {
      throw new Error(
        "ADMIN_PASSWORD غير مضبوط. اضبطه في متغيرات البيئة قبل النشر."
      );
    }
    adminPassword = "dev-only-change-me";
    console.warn("⚠ ADMIN_PASSWORD غير مضبوط — تم استخدام كلمة مرور للتطوير المحلي فقط.");
  }

  // الأدمن: يُنشأ إن لم يوجد ولا يُعدَّل أبدًا (لا نكتب فوق كلمة مرور موجودة)
  const admin = await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: env.ADMIN_NAME ?? "رُقي",
    },
  });
  console.log("Admin:", admin.username);

  // بيانات العرض تُزرع مرة واحدة فقط على قاعدة فارغة،
  // حتى لا تُستبدل تعديلات لوحة التحكم (أسعار/مخزون/وصف) عند كل نشر
  const [categoryCount, productCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
  ]);
  if (categoryCount > 0 || productCount > 0) {
    console.log("البيانات موجودة — تخطي زرع التصنيفات والمنتجات ✓");
    return;
  }

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }
  console.log("Categories:", categories.length);

  let created = 0;
  for (const p of products) {
    const category = await prisma.category.findUnique({
      where: { slug: p.categorySlug },
    });
    if (!category) continue;
    await prisma.product.create({
      data: {
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        slug: p.slug,
        description: p.description,
        priceCents: p.priceCents,
        compareAtCents: p.compareAtCents,
        stock: p.stock,
        isFeatured: p.isFeatured,
        categoryId: category.id,
        isActive: true,
      },
    });
    created++;
  }
  console.log("Products:", created);
  console.log("Done ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });