import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Get authenticated user
    const {
      data: { session },
      error: authError
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all CVs for this user
    const { data: cvs, error: cvError } = await supabase
      .from('cv_texts')
      .select('id, file_name, created_at, updated_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (cvError) {
      console.error('Error fetching CVs:', cvError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch CVs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cvs: cvs || []
    });
  } catch (error) {
    console.error('Unexpected error in /api/cv/list:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
