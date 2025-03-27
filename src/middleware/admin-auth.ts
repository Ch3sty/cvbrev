// src/middleware/admin-auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Middleware för att autentisera admin-användare
 * Denna middleware ska användas för att skydda admin-routes
 */
export async function adminAuthMiddleware(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  
  // Hämta aktuell användare
  const { data: { user } } = await supabase.auth.getUser();
  
  // Om det inte finns någon inloggad användare, omdirigera till login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Kontrollera om användaren är admin
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  // Om det är något fel eller användaren inte är admin, omdirigera till startsidan
  if (adminError || !adminData) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Användaren är admin, skicka vidare till admin-route
  return NextResponse.next();
}

/**
 * Funktionen kontrollerar om användaren har super_admin-behörighet
 * Detta används för specifika admin-actions som kräver super_admin
 */
export async function isSuperAdmin(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }
  
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .eq('role', 'super_admin')
    .single();
  
  return !!data;
}