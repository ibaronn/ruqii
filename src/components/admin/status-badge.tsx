import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type OrderStatus } from "@/lib/orders";

const TONE_MAP: Record<string, "yellow" | "blue" | "green" | "red"> = {
  APPROVED: "yellow",
  SHIPPING: "blue",
  DELIVERED: "green",
  CANCELLED: "red",
};

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status as OrderStatus] ?? status;
  return <Badge tone={TONE_MAP[status] ?? "neutral"}>{label}</Badge>;
}