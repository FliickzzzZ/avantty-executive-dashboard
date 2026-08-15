import * as React from "react";
import { cn } from "@/lib/utils";

export function StatusIndicator({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("relative inline-flex h-2 w-2 mr-1.5", className)} {...props}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-900" />
    </span>
  );
}
