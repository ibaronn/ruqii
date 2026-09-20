import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "تسجيل الدخول — لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-md overflow-hidden p-8 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <img src="/logo.png" alt="" className="size-11" />
          <div>
            <p className="text-xl font-medium leading-none">رُقي</p>
            <p className="mt-1 text-xs text-ink/45">لوحة التحكم</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}