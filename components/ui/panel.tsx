import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Panel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grain rounded-[30px] border border-[var(--line-soft)] bg-[linear-gradient(155deg,rgba(255,252,244,0.88),rgba(244,236,224,0.82))] p-5 shadow-[var(--shadow-soft)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
