import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function StatusBadge({ value }) {
  const normalized = String(value || "").toUpperCase();

  const styles = {
    PUBLISHED: "bg-green-50 text-green-700 border-green-200",
    DRAFT: "bg-neutral-100 text-neutral-700 border-neutral-200",
    ARCHIVED: "bg-red-50 text-red-700 border-red-200",
    ACTIVE: "bg-green-50 text-green-700 border-green-200",
    INACTIVE: "bg-neutral-100 text-neutral-700 border-neutral-200",
    UPLOADED: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium",
        styles[normalized] || "bg-neutral-100 text-neutral-700 border-neutral-200"
      )}
    >
      {value || "-"}
    </Badge>
  );
}