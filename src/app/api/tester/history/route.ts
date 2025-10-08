import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hämta attempts
    const { data: attempts, error } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('test_type', 'matrislogik-classic')
      .order('completed_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Hämta stats
    const { data: stats } = await supabase
      .from('test_user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      attempts: attempts || [],
      stats: stats || {
        matrislogikAttempts: 0,
        matrislogikBestScore: 0,
        matrislogikAvgScore: 0,
        totalTestTimeSeconds: 0,
        streakDays: 0,
        lastTestDate: null
      }
    });

  } catch (error) {
    console.error('[API /tester/history] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
