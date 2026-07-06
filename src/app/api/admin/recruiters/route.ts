import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// Admin-API för rekryteraransökningar (recruiter_profiles).
// GET: lista alla ansökningar med e-post från profiles, pending först.
// POST: { userId, action: 'approve' | 'reject' } — sätter status,
//       approved_at och approved_by.
// Admin-checken följer samma mönster som /api/admin/revenue.

interface RecruiterRow {
  user_id: string;
  company_name: string | null;
  org_number: string | null;
  contact_name: string | null;
  contact_role: string | null;
  recruiting_roles: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_at: string | null;
  created_at: string;
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return { user: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user, response: null };
}

export async function GET() {
  try {
    const { user, response } = await requireAdmin();
    if (!user) return response!;

    const admin = getSupabaseAdmin();

    // Tabellen saknas i genererade DB-typer, därav as any.
    const { data, error } = await (admin as any)
      .from('recruiter_profiles')
      .select('user_id, company_name, org_number, contact_name, contact_role, recruiting_roles, status, approved_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recruiter profiles:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const rows: RecruiterRow[] = data ?? [];

    // E-post från profiles (samma auth-pool som övriga användare).
    let emailMap = new Map<string, string | null>();
    if (rows.length > 0) {
      const userIds = rows.map((r) => r.user_id);
      const { data: profiles } = await (admin as any)
        .from('profiles')
        .select('id, email')
        .in('id', userIds);
      emailMap = new Map(
        (profiles ?? []).map((p: { id: string; email: string | null }) => [p.id, p.email])
      );
    }

    // Pending först, därefter created_at desc (listan är redan datumsorterad).
    const sorted = [...rows].sort((a, b) => {
      const aPending = a.status === 'pending' ? 0 : 1;
      const bPending = b.status === 'pending' ? 0 : 1;
      if (aPending !== bPending) return aPending - bPending;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const recruiters = sorted.map((r) => ({
      userId: r.user_id,
      companyName: r.company_name,
      orgNumber: r.org_number,
      contactName: r.contact_name,
      contactRole: r.contact_role,
      recruitingRoles: r.recruiting_roles,
      email: emailMap.get(r.user_id) ?? null,
      status: r.status,
      approvedAt: r.approved_at,
      createdAt: r.created_at,
    }));

    const counts = {
      pending: rows.filter((r) => r.status === 'pending').length,
      approved: rows.filter((r) => r.status === 'approved').length,
      rejected: rows.filter((r) => r.status === 'rejected').length,
    };

    return NextResponse.json({ recruiters, counts });
  } catch (error) {
    console.error('Error in admin recruiters GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireAdmin();
    if (!user) return response!;

    let body: { userId?: unknown; action?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig request-body' }, { status: 400 });
    }

    const userId = typeof body.userId === 'string' ? body.userId : null;
    const action = body.action === 'approve' || body.action === 'reject' ? body.action : null;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId och action (approve/reject) krävs' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { data: existing, error: fetchError } = await (admin as any)
      .from('recruiter_profiles')
      .select('user_id, status')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching recruiter profile:', fetchError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Rekryteraren hittades inte' }, { status: 404 });
    }

    // approved_at/approved_by fungerar som beslutstidpunkt + beslutsfattare
    // för båda utfallen (statusen skiljer godkänd från avslagen).
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const { error: updateError } = await (admin as any)
      .from('recruiter_profiles')
      .update({
        status: newStatus,
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating recruiter profile:', updateError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: newStatus });
  } catch (error) {
    console.error('Error in admin recruiters POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
