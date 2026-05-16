import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoadingState({ label = "Loading...", fullScreen = false }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "min-h-screen bg-[#f7f7f5]" : "min-h-[260px]"
      )}
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}