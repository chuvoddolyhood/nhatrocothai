import { createClient } from '@supabase/supabase-js';

// Lấy từ Supabase Dashboard → Settings → API
const supabaseUrl = 'https://ortjhktudenvorquolkj.supabase.co';         // VD: https://xxxx.supabase.co
const supabaseAnonKey = 'sb_publishable_FzFoSgvYrYcCWN3w_Dwzeg_YoZeq3xB'; // VD: eyJhbGci...

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
