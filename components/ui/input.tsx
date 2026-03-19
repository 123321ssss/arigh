import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-[rgba(19,31,30,0.12)] bg-[rgba(255,252,244,0.82)] px-4 text-sm text-[var(--ink-strong)] outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(50,156,149,0.56)] focus:ring-4 focus:ring-[rgba(50,156,149,0.12)]",
        className,
      )}
      {...props}
    />
  );
}
