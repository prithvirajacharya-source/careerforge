import { createClient } from "@supabase/supabase-js";

export function assertCareerResearchAdmin(user: {
  app_metadata?: Record<string, unknown>;
} | null) {
  if (!user) throw new Error("Authenticated admin session required.");
  if (user.app_metadata?.role !== "admin") {
    throw new Error("SEKUR admin access required.");
  }
}

export async function authenticateCareerResearchAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Authenticated admin session required.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are missing.");
  }

  const supabase = createClient(url, key, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Authenticated admin session required.");
  }

  assertCareerResearchAdmin(user);

  return { supabase, user };
}
