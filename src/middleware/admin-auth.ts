// src/middleware/admin-auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Middleware för att autentisera admin-användare
 * Denna middleware ska användas för att skydda admin-routes
 * Kontrollerar specifikt efter super_admin-rollen
 */
export async function adminAuthMiddleware(request: NextRequest) {
  console.log("Admin middleware körs för:", request.nextUrl.pathname);
  
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    
    // Hämta aktuell användare
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log("Användare i middleware:", user?.id || "ingen inloggad");
    
    // Om det inte finns någon inloggad användare, omdirigera till login
    if (!user) {
      console.log("Ingen användare, omdirigerar till /login");
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Kontrollera om användaren är super_admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .eq('role', 'super_admin')  // Endast tillåt super_admin-rollen
      .single();
    
    console.log("Admin-kontroll resultat:", { data: adminData, error: adminError?.message });
    
    // Om det är något fel eller användaren inte är super_admin, omdirigera till startsidan
    if (adminError || !adminData) {
      console.log("Användaren är inte admin, omdirigerar till /");
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    console.log("Användaren är admin, fortsätter till admin-sidan");
    // Användaren är super_admin, skicka vidare till admin-route
    return NextResponse.next();
  } catch (error) {
    console.error("Oväntat fel i admin middleware:", error);
    // Vid oväntat fel, omdirigera till startsidan för säkerhets skull
    return NextResponse.redirect(new URL('/', request.url));
  }
}

/**
 * Funktionen kontrollerar om användaren har super_admin-behörighet
 * Detta används för specifika admin-actions som kräver super_admin
 */
export async function isSuperAdmin(request: NextRequest): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  
  // Hämta aktuell användare
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("isSuperAdmin: Ingen användare hittades");
    return false;
  }
  
  console.log(`isSuperAdmin: Kontrollerar behörighet för ${user.id}`);
  
  // Använd admin-klienten för att kringgå eventuella RLS-problem
  const adminClient = getSupabaseAdmin();
  
  // Kontrollera om användaren är super_admin med admin-klienten
  const { data, error } = await adminClient
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .eq('role', 'super_admin')
    .single();
    
  if (error) {
    console.log(`isSuperAdmin: Fel vid kontroll: ${error.message}`);
  }
  
  console.log(`isSuperAdmin: Resultat: ${!!data}`);
  
  return !!data;
}