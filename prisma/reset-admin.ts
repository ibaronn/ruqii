import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// الاستخدام: ADMIN_USERNAME=ruqi ADMIN_PASSWORD='كلمة-جديدة-قوية' npm run admin:reset
// يغيّر كلمة مرور الأدمن الموجود (مفيد إن كانت قاعدة البيانات قد زُرعت بكلمة المرور الافتراضية القديمة).
const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "ruqi";
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 10) {
    throw new Error("ADMIN_PASSWORD مطلوب ويجب ألا يقل عن 10 أحرف.");
  }
  const admin = await prisma.adminUser.findUnique({ where: { username } });
  if (!admin) throw new Error(`لا يوجد أدمن باسم: ${username}`);
  await prisma.adminUser.update({
    where: { username },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log("تم تغيير كلمة مرور الأدمن:", username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
