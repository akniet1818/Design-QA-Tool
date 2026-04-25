import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only client — bypasses Row Level Security.
// Never import this in client components or NEXT_PUBLIC_ modules.
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
