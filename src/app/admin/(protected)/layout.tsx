import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return <AdminShell adminName={admin.name}>{children}</AdminShell>;
}