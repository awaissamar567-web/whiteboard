import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ntwusntkvsshrsouhmir.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50d3VzbnRrdnNzaHJzb3VobWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMjgxMTcsImV4cCI6MjEwMjgwNDExN30.kZXDUqvKJYWtBIiSBS4drz1S-vwcJYlyH11llIaN4h0';

export const supabase =
  typeof window !== 'undefined' || supabaseUrl
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;
