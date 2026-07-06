// GET /api/notifications
// Den inloggade användarens notiser (egna rader via RLS), senaste först, med
// antal olästa. Driver notisklockan i dashboarden. Notisrader skapas serverside
// (t.ex. vid rekryterarintresse, trial-aktivering) men lästes tidigare aldrig
// ut i kandidatens gränssnitt.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

const LIMIT = 30;

interface NotificationRow {
  id: string;
  type: string | null;
  title: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  action_url: string | null;
  read: boolean | null;
  created_at: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tabellen saknas i genererade DB-typer, därav as any.
    const { data, error } = await (supabase as any)
      .from('notifications')
      .select('id, type, title, message, metadata, action_url, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(LIMIT);

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const rows: NotificationRow[] = data ?? [];
    const notifications = rows.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      metadata: n.metadata,
      actionUrl: n.action_url,
      read: n.read === true,
      createdAt: n.created_at,
    }));
    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
