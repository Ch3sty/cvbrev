// src/lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { type Database } from '@/types/database.types'

// För klientkomponenter
export const createClient = () => {
  return createClientComponentClient<Database>()
}