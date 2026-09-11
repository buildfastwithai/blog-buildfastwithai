export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }

  return url;
}

export function getSupabasePublishableKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set");
  }

  return key;
}

export function getSupabaseSecretKey() {
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!key) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }

  return key;
}

export function getLumaApiKey() {
  const key = process.env.LUMA_API_KEY;

  if (!key) {
    throw new Error("LUMA_API_KEY is not set");
  }

  return key;
}
