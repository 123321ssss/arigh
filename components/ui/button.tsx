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
    "bg-[linear-gradient(145deg,var(--accent),#23aaa2)] text-[var(--ink-strong)] shadow-[0_14px_34px_rgba(31,159,151,0.3)] hover:translate-y-[-1px] hover:bg-[linear-gradient(145deg,var(--accent-soft),#52bfb8)]",
  secondary:
    "bg-[rgba(22,28,28,0.9)] text-[var(--paper)] shadow-[0_10px_26px_rgba(13,19,19,0.24)] hover:bg-[rgba(22,28,28,1)] hover:translate-y-[-1px]",
  ghost:
    "bg-transparent text-[var(--ink)] hover:bg-[rgba(19,31,30,0.08)]",
  danger:
    "bg-[var(--danger)] text-white shadow-[0_12px_28px_rgba(184,86,74,0.28)] hover:bg-[#a8433a] hover:translate-y-[-1px]",
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
