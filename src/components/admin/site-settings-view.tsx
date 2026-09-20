"use client";

import * as React from "react";
import { CheckCircle2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SettingDef = {
  key: string;
  label: string;
  hint?: string;
  type?: "text" | "textarea";
  group: string;
  default: string;
};

export function SiteSettingsView() {
  const [defs, setDefs] = React.useState<SettingDef[]>([]);
  const [groups, setGroups] = React.useState<string[]>([]);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [initial, setInitial] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setDefs(d.defs as SettingDef[]);
        setGroups(d.groups as string[]);
        setValues(d.settings as Record<string, string>);
        setInitial(d.settings as Record<string, string>);
      })
      .catch(() => setError("تعذّر تحميل النصوص"))
      .finally(() => setLoading(false));
  }, []);

  const setValue = (key: string, value: string) => {
    setSaved(false);
    setValues((v) => ({ ...v, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "تعذّر الحفظ");
        setSaving(false);
        return;
      }
      setValues(data.settings as Record<string, string>);
      setInitial(data.settings as Record<string, string>);
      setSaved(true);
    } catch {
      setError("تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const resetAll = () => {
    const defaults = Object.fromEntries(defs.map((d) => [d.key, d.default]));
    setValues(defaults);
    setSaved(false);
  };

  const dirty = React.useMemo(
    () => defs.some((d) => values[d.key] !== initial[d.key]),
    [defs, values, initial]
  );

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-ink/45">
            لوحة التحكم
          </p>
          <h1 className="mt-2 text-3xl font-medium">نصوص الموقع</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink/55">
            عدّل كل النصوص الظاهرة في المتجر — رسالة الترحيب، من نحن، التذييل
            وغيرها — ثم اضغط حفظ.
          </p>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass p-6">
              <div className="skeleton mb-4 h-6 w-40" />
              <div className="skeleton h-11 w-full" />
            </div>
          ))}
        </div>
      ) : (
        groups.map((group) => (
          <section key={group} className="glass p-6">
            <h2 className="mb-5 text-lg font-medium">{group}</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {defs
                .filter((d) => d.group === group)
                .map((d) => (
                  <div
                    key={d.key}
                    className={
                      d.type === "textarea" ? "md:col-span-2" : undefined
                    }
                  >
                    <label
                      htmlFor={`setting-${d.key}`}
                      className="mb-1.5 block text-sm font-medium"
                    >
                      {d.label}
                    </label>
                    {d.type === "textarea" ? (
                      <Textarea
                        id={`setting-${d.key}`}
                        rows={3}
                        value={values[d.key] ?? ""}
                        onChange={(e) => setValue(d.key, e.target.value)}
                      />
                    ) : (
                      <Input
                        id={`setting-${d.key}`}
                        value={values[d.key] ?? ""}
                        onChange={(e) => setValue(d.key, e.target.value)}
                        hint={d.hint}
                      />
                    )}
                  </div>
                ))}
            </div>
          </section>
        ))
      )}

      {!loading && (
        <div className="glass-bar fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:inset-x-auto sm:start-1/2 sm:-translate-x-1/2">
          <div className="flex items-center gap-2 text-sm">
            {saved && !dirty ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="size-4" />
                تم الحفظ
              </span>
            ) : dirty ? (
              <span className="text-ink/55">لديك تغييرات غير محفوظة</span>
            ) : (
              <span className="text-ink/40">كل التغييرات محفوظة</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={resetAll}
              className="gap-2"
            >
              <RotateCcw className="size-4" />
              استعادة الافتراضي
            </Button>
            <Button type="submit" loading={saving} className="gap-2">
              <Save className="size-4" />
              حفظ
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
