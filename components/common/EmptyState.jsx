import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "No records found",
  description = "Create a new record to get started.",
  action,
}) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-3xl border bg-white p-8 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
          <Inbox className="h-5 w-5 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-base font-semibold">{title}</h3>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>

        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}