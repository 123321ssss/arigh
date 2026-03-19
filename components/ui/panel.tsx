import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Panel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-[rgba(19,31,30,0.1)] bg-[rgba(255,252,244,0.8)] p-5 shadow-[0_18px_60px_rgba(21,31,31,0.08)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
