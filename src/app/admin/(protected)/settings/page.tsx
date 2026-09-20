import type { Metadata } from "next";
import { SiteSettingsView } from "@/components/admin/site-settings-view";

export const metadata: Metadata = {
  title: "نصوص الموقع — لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function AdminSiteSettingsPage() {
  return <SiteSettingsView />;
}
