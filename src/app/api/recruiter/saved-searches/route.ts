// /api/recruiter/saved-searches
// Sparade sökningar med bevakning, plan-rekryterare-v2 FAS B3.
//
//   GET    → rekryterarens sparade sökningar, nyast först.
//   POST   { name, filters } → skapa (filters whitelistas nyckel för nyckel,
//            okända nycklar släpps ALDRIG igenom). Max 20 per rekryterare.
//   PATCH  { id, notify? } → slå av/på bevakningen.
//   DELETE ?id= → radera.
//
// Bevakningsmailen skickas av morgon-cronen (max 1/dag), inte härifrån.

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';

export const dynamic = 'force-dynamic';

const NAME_MAX = 80;
const MAX_SEARCHES = 20;

// Whitelistan speglar sökvyns filterpanel. Allt annat kastas.
const ALLOWED_FILTER_KEYS = [
  'q',
  'seniority',
  'regions',
  'availability',
  'workplace',
  'extent',
  'employmentTypes',
  'minPercentile',
  'testFamilies',
  'strengths',
  'archetypes',
  'educationLevels',
  'budget',
  'driversLicense',
] as const;

interface SavedSearchRow {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  notify: boolean;
  last_notified_at: string | null;
  created_at: string;
}

function toApiShape(row: SavedSearchRow) {
  return {
    id: row.id,
    name: row.name,
    filters: row.filters ?? {},
    notify: row.notify,
    lastNotifiedAt: row.last_notified_at,
    createdAt: row.created_at,
  };
}

/** Plockar ENDAST whitelistade nycklar ur inskickade filters. */
function sanitizeFilters(input: unknown): Record<string, unknown> | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const source = input as Record<string, unknown>;
  const filters: Record<string, unknown> = {};
  for (const key of ALLOWED_FILTER_KEYS) {
    if (key in source && source[key] !== undefined && source[key] !== null) {
      filters[key] = source[key];
    }
  }
  return filters;
}

export async function GET() {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const admin = getSupabaseAdmin();

    const { data, error } = await (admin as any)
      .from('recruiter_saved_searches')
      .select('id, name, filters, notify, last_notified_at, created_at')
      .eq('recruiter_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Recruiter saved searches: kunde inte läsa listan', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({
      searches: ((data ?? []) as SavedSearchRow[]).map(toApiShape),
    });
  } catch (error) {
    console.error('Recruiter saved searches error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    let body: { name?: string; filters?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > NAME_MAX) {
      return NextResponse.json(
        { error: `Namnet måste vara 1-${NAME_MAX} tecken` },
        { status: 400 }
      );
    }

    const filters = sanitizeFilters(body.filters);
    if (!filters) {
      return NextResponse.json({ error: 'filters måste vara ett objekt' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    const { count } = await (admin as any)
      .from('recruiter_saved_searches')
      .select('id', { count: 'exact', head: true })
      .eq('recruiter_user_id', user.id);

    if ((count ?? 0) >= MAX_SEARCHES) {
      return NextResponse.json(
        {
          code: 'limit_reached',
          error: `Du kan ha högst ${MAX_SEARCHES} sparade sökningar. Ta bort en gammal först.`,
        },
        { status: 400 }
      );
    }

    const { data: inserted, error: insertError } = await (admin as any)
      .from('recruiter_saved_searches')
      .insert({
        recruiter_user_id: user.id,
        name,
        filters,
        notify: false,
      })
      .select('id, name, filters, notify, last_notified_at, created_at')
      .single();

    if (insertError || !inserted) {
      console.error('Recruiter saved searches: insert misslyckades', insertError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ search: toApiShape(inserted as SavedSearchRow) });
  } catch (error) {
    console.error('Recruiter saved searches error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    let body: { id?: string; notify?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }

    const id = typeof body.id === 'string' ? body.id.trim() : '';
    if (!id) {
      return NextResponse.json({ error: 'id krävs' }, { status: 400 });
    }
    if (typeof body.notify !== 'boolean') {
      return NextResponse.json({ error: 'notify krävs (boolean)' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    const { data: updated, error } = await (admin as any)
      .from('recruiter_saved_searches')
      .update({ notify: body.notify })
      .eq('id', id)
      .eq('recruiter_user_id', user.id)
      .select('id, name, filters, notify, last_notified_at, created_at')
      .maybeSingle();

    if (error) {
      console.error('Recruiter saved searches: uppdatering misslyckades', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ search: toApiShape(updated as SavedSearchRow) });
  } catch (error) {
    console.error('Recruiter saved searches error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user } = gate.ctx;

    const id = request.nextUrl.searchParams.get('id')?.trim();
    if (!id) {
      return NextResponse.json({ error: 'id krävs' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    const { data: deleted, error } = await (admin as any)
      .from('recruiter_saved_searches')
      .delete()
      .eq('id', id)
      .eq('recruiter_user_id', user.id)
      .select('id');

    if (error) {
      console.error('Recruiter saved searches: radering misslyckades', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recruiter saved searches error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
