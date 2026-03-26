import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usersResult, lettersResult, todayLettersResult] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('letters').select('*', { count: 'exact', head: true }),
      supabase
        .from('letters')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString()),
    ]);

    return NextResponse.json(
      {
        totalUsers: usersResult.count ?? 0,
        totalLetters: lettersResult.count ?? 0,
        todayLetters: todayLettersResult.count ?? 0,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return NextResponse.json(
      { totalUsers: 0, totalLetters: 0, todayLetters: 0 },
      { status: 500 }
    );
  }
}
