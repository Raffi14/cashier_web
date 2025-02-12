import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const log = {
  warn: (msg: string) => console.log('\x1b[33m%s\x1b[0m', `⚠️  ${msg}`),
  success: (msg: string) => console.log('\x1b[32m%s\x1b[0m', `✅ ${msg}`),
  error: (msg: string) => console.log('\x1b[31m%s\x1b[0m', `❌ ${msg}`),
  info: (msg: string) => console.log('\x1b[36m%s\x1b[0m', `ℹ️  ${msg}`)
};