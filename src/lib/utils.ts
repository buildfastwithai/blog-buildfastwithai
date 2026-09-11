import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getURL = () => {
  // If running in browser (client-side), use window.location.origin
  if (typeof window !== 'undefined') {
    const url = window.location.origin;
    return url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  }

  // Server-side fallback
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";

  // Make sure to include `https://` when not localhost.
  url = url.startsWith("http://localhost") ? url : url.includes("http") ? url : `https://${url}`;
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    timeZone: "Asia/Kolkata", // Set the time zone to Indian Standard Time (IST)
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
    timeZone: "Asia/Kolkata",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    timeZone: "Asia/Kolkata",
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-IN",
    dateTimeOptions,
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-IN",
    dateOptions,
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-IN",
    timeOptions,
  );

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};

export const formatVideoDuration = (duration: string[]) => {
  if (duration.length === 1) return `${duration[0]} min.`;
  if (duration.length === 2) return `${duration[0]} min. ${duration[1]} sec.`;
  if (duration.length === 3) return `${duration[0]} hr. ${duration[1]} min.`;
  return null;
};

export const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Resolve blog/curated image_url for Next/Image: accept full URL or relative path.
 * Relative paths are resolved against Supabase storage public URL.
 */
export function resolveImageUrl(
  url: string | null | undefined
): string | null {
  if (url == null || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed === "") return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const base =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ||
    "https://oukdqujzonxvqhiefdsv.supabase.co";
  const path = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  return `${base}/storage/v1/object/public/${path}`;
}
