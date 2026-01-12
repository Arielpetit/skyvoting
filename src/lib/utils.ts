import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUserName(email: string | undefined | null, fullName: string | undefined | null): string {
  if (fullName && fullName !== "User" && fullName !== "Anonymous User") return fullName;
  if (!email) return fullName || "User";

  const prefix = email.split('@')[0];
  return prefix
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
