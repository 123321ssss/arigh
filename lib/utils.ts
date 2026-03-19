import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: string | number | Date) {
  return format(new Date(value), "yyyy.MM.dd HH:mm", { locale: zhCN });
}

export function formatRelativeMonth(value: string | number | Date) {
  return format(new Date(value), "MM.dd", { locale: zhCN });
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

export function compactText(input: string, max = 72) {
  if (input.length <= max) {
    return input;
  }

  return `${input.slice(0, max - 1)}…`;
}
