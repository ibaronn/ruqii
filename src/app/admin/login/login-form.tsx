"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "تعذّر تسجيل الدخول");
      return;
    }
    startTransition(() => {
      router.push("/admin");
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-medium">تسجيل الدخول</h1>
      <p className="mt-1.5 text-sm text-ink/55">
        ادخل إلى لوحة تحكم رُقي.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="admin-username" className="mb-1.5 block text-sm font-medium">
            اسم المستخدم
          </label>
          <Input
            id="admin-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            dir="ltr"
            className="text-start"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium">
            كلمة المرور
          </label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            dir="ltr"
            className="text-start"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <Button full size="lg" type="submit" loading={pending}>
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              جارٍ الدخول…
            </span>
          ) : (
            "دخول"
          )}
        </Button>
      </form>
    </div>
  );
}