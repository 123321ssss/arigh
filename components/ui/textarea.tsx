import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[132px] w-full resize-none rounded-[28px] border border-[rgba(19,31,30,0.12)] bg-[rgba(255,252,244,0.82)] px-5 py-4 text-sm leading-7 text-[var(--ink-strong)] outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(50,156,149,0.56)] focus:ring-4 focus:ring-[rgba(50,156,149,0.12)]",
        className,
      )}
      {...props}
    />
  );
}
