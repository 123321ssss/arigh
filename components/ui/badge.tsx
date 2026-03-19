import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[rgba(19,31,30,0.12)] bg-[rgba(255,255,255,0.56)] px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}
