// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { type Database } from '@/types/database.types'

// För serverkomponenter och API-routes
export const createServerClient = ({ cookies: cookieStore }) => {
  return createServerComponentClient<Database>({
    cookies: cookieStore 
  })
}