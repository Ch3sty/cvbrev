// src/app/api/admin/cleanup/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/middleware/admin-auth';

export async function POST(request: Request) {
  try {
    // Verifiera admin-behörighet
    const isAdmin = await isSuperAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Ej behörig' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    
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
    
    // Radera gamla aktiviteter
    const { error, count } = await supabase
      .from('user_activities')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDate.toISOString());
      
    if (error) {
      console.error('Fel vid rensning av aktiviteter:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Logga rensningen för statistik
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'cleanup_activities',
        details: {
          days: days,
          records_removed: count,
          cutoff_date: cutoffDate.toISOString()
        }
      })
      .catch(err => console.error('Kunde inte logga admin-åtgärd:', err));
    
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