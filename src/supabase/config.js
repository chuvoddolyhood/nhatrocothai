import { createClient } from '@supabase/supabase-js';

// ⚠️ Lấy từ file .env (KHÔNG hardcode credentials trong code!)
// Trong Vite, environment variables phải có prefix VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ Thiếu Supabase credentials! Kiểm tra file .env và đảm bảo có:\n' +
    '  - VITE_SUPABASE_URL\n' +
    '  - VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    experimental: {
      passkey: true,
    },
  },
});
