import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="shell flex flex-col items-center justify-center px-6 py-28 text-center">
      <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-ink/45">
        خطأ 404
      </p>
      <h1 className="mt-4 text-4xl font-medium sm:text-5xl">الصفحة غير موجودة</h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/60">
        يبدو أن الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
      </p>
      <Link href="/" className="mt-8">
        <Button size="lg">العودة إلى الرئيسية</Button>
      </Link>
    </div>
  );
}