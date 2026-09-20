import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const priceFmt = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatPrice(cents: number) {
  const value = cents / 100;
  const digits = Number.isInteger(value) ? priceFmt.format(value) : value.toFixed(2);
  return `${digits} د.ل`;
}

export function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTimeFull(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function slugify(input: string) {
  const latin = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return latin || `p-${Date.now().toString(36)}`;
}

export function percentOff(price: number, compareAt: number) {
  return Math.round((1 - price / compareAt) * 100);
}

export function isInStock(stock: number) {
  return stock > 0;
}