import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/utils";

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-3xl border bg-white p-8 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle className="h-5 w-5" />
        </div>

        <h3 className="mt-4 text-base font-semibold">Something went wrong</h3>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>

        {onRetry && (
          <Button onClick={onRetry} className="mt-5 rounded-xl">
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}