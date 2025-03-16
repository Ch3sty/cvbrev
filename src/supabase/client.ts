import { createClient } from '@supabase/supabase-js'
// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}
// Create Supabase client with enhanced configuration
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 
  {
    auth: {
      persistSession: true,   // Save session locally
      autoRefreshToken: true, // Automatically refresh tokens
      detectSessionInUrl: true // Handle OAuth callbacks
    },
    global: {
      headers: { 
        'x-application-name': 'CVBrev' 
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)
// Removed the .on('error') line