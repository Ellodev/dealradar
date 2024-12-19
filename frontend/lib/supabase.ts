import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the URL and key from environment variables
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
