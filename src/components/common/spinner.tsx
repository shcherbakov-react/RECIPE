import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-muted-foreground", className)} />;
}

export function FullSpinner({ label }: { label?: string }) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
      <Loader2 className="size-7 animate-spin" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
