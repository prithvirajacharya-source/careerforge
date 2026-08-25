import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export function createUserScopedServerClient(accessToken: string) { return createClient(url(), process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "", { global: { headers: { Authorization: `Bearer ${accessToken}` } }, auth: { persistSession: false, autoRefreshToken: false } }); }
export function createServiceRoleClient() { const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!url() || !key) throw new Error("Trusted Supabase server access is not configured."); return createClient(url(), key, { auth: { persistSession: false, autoRefreshToken: false } }); }
export async function authenticateRequest(request: Request) { const header = request.headers.get("authorization"); const token = header?.startsWith("Bearer ") ? header.slice(7) : null; if (!token) return null; const client = createUserScopedServerClient(token); const { data, error } = await client.auth.getUser(token); return error || !data.user ? null : { user: data.user, client }; }
