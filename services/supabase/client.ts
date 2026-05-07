import { createClient } from '@supabase/supabase-js';

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://placeholder.supabase.co';
const key =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-anon-key';

if (
  url === 'https://placeholder.supabase.co' ||
  key === 'placeholder-anon-key'
) {
  console.warn(
    '[supabase] Using placeholder credentials. ' +
      'Set EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY and ' +
      'EXPO_PUBLIC_USE_MOCK=false to connect to a real project.'
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});
