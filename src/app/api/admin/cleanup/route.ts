// src/app/api/admin/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // Använd Supabase-klienten för att hämta användarens ID
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    
    // Hämta användarens session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('Cleanup API: Ingen användare hittades');
      return NextResponse.json({ error: 'Ej behörig - Ingen användare' }, { status: 403 });
    }
    
    // Logga användar-ID för felsökning
    console.log(`Cleanup API: Användar-ID: ${user.id}`);
    
    // Använd admin-klienten för behörighetskontroll och databasoperationer
    const adminClient = getSupabaseAdmin();
    
    // Kontrollera super_admin behörighet
    const { data: adminData, error: adminError } = await adminClient
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    // Logga resultatet för felsökning
    console.log(`Admin-kontroll för ID ${user.id}:`, adminData, adminError);
    
    // Kontrollera om användaren har super_admin-rollen
    if (adminError || !adminData || adminData.role !== 'super_admin') {
      console.log('Användaren är inte super_admin');
      return NextResponse.json({ error: 'Ej behörig - Inte super_admin' }, { status: 403 });
    }
    
    console.log('Användaren är super_admin, fortsätter med rensning');
    
    // Hämta antal dagar från förfrågan
    const { days = 30 } = await request.json();
    
    // Kontrollera att days är ett giltigt värde
    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Ogiltigt antal dagar. Måste vara mellan 1 och 365.' },
        { status: 400 }
      );
    }
    
    // Beräkna datum för rensning
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    console.log(`Radera aktiviteter äldre än ${cutoffDate.toISOString()}`);
    
    // Radera gamla aktiviteter med admin-klienten som har full behörighet
    const { error, count } = await adminClient
      .from('user_activities')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDate.toISOString());
      
    if (error) {
      console.error('Fel vid rensning av aktiviteter:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`${count} aktiviteter har raderats`);
    
    // Logga rensningen för statistik
    try {
      await adminClient
        .from('admin_logs')
        .insert({
          admin_id: user.id,
          action: 'cleanup_activities',
          details: {
            days: days,
            records_removed: count,
            cutoff_date: cutoffDate.toISOString()
          }
        });
      console.log('Aktiviteten har loggats i admin_logs');
    } catch (err) {
      console.error('Kunde inte logga admin-åtgärd:', err);
      // Fortsätt ändå, loggningen är inte kritisk
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${count} aktiviteter äldre än ${days} dagar har raderats.`,
      count
    });
    
  } catch (error: any) {
    console.error('Rensningsfel:', error);
    return NextResponse.json(
      { error: 'Serverfel vid rensning: ' + error.message }, 
      { status: 500 }
    );
  }
}