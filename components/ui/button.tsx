import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--ink-strong)] shadow-[0_12px_30px_rgba(50,156,149,0.28)] hover:bg-[var(--accent-soft)]",
  secondary:
    "bg-[rgba(22,28,28,0.88)] text-[var(--paper)] hover:bg-[rgba(22,28,28,1)]",
  ghost:
    "bg-transparent text-[var(--ink)] hover:bg-[rgba(19,31,30,0.08)]",
  danger:
    "bg-[var(--danger)] text-white hover:bg-[#a8433a]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  asChild,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-transparent font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
