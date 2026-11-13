// /api/app/revenuecat
//
// POST från RevenueCat (docs/plan-app.md, avsnitt 2.6). Authorization-headern
// ska vara värdet som står i RevenueCats webhook-inställning, samma som
// env REVENUECAT_WEBHOOK_AUTH. Vad varje händelse gör står i
// lib/mobilapp/kopRevenuecat.ts.
//
// 200 för allt vi tagit emot, även händelser vi inte gör något med, så att
// RevenueCat inte skickar om dem. 401 fel nyckel, 400 trasig kropp, 500 när
// databasen felar (RevenueCat försöker då igen; idempotensen tar omsändningen).

import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { APP_KALLOR, hanteraRevenuecat, rattNyckel, type KopLager, type RcHandelse } from '@/lib/mobilapp/kopRevenuecat';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

function supabaseLager(admin: Klient): KopLager {
  return {
    async skrivGrant(rad) {
      const { error } = await admin.from('premium_grants').insert(rad);
      if (!error) return true;
      // 23505: event-id redan bokfört.
      if ((error as { code?: string }).code === '23505') return false;
      throw new Error(`premium_grants: ${error.message}`);
    },
    async aktivaAppGrants(userId, efter) {
      const { data, error } = await admin
        .from('premium_grants')
        .select('id, premium_until_after, granted_at')
        .eq('user_id', userId)
        .in('source', APP_KALLOR)
        .gt('premium_until_after', efter);
      if (error) throw new Error(`premium_grants: ${error.message}`);
      return (data ?? []) as Array<{ id: string; premium_until_after: string | null; granted_at: string }>;
    },
    async sattGrantSlut(id, slut) {
      const { error } = await admin.from('premium_grants').update({ premium_until_after: slut }).eq('id', id);
      if (error) throw new Error(`premium_grants: ${error.message}`);
    },
    async hamtaProfil(userId) {
      const { data, error } = await admin
        .from('profiles')
        .select('premium_until, premium_source, subscription_status, subscription_tier')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw new Error(`profiles: ${error.message}`);
      return (data ?? null) as Awaited<ReturnType<KopLager['hamtaProfil']>>;
    },
    async uppdateraProfil(userId, andring) {
      const { error } = await admin.from('profiles').update(andring).eq('id', userId);
      if (error) throw new Error(`profiles: ${error.message}`);
    },
  };
}

export async function POST(request: Request) {
  if (!rattNyckel(request.headers.get('authorization'), process.env.REVENUECAT_WEBHOOK_AUTH)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let handelse: RcHandelse | null = null;
  try {
    const kropp = (await request.json()) as { event?: RcHandelse } | null;
    handelse = kropp?.event ?? null;
  } catch {
    handelse = null;
  }
  if (!handelse || typeof handelse.id !== 'string') {
    return NextResponse.json({ error: 'ogiltig_kropp' }, { status: 400 });
  }

  try {
    const utfall = await hanteraRevenuecat(supabaseLager(getSupabaseAdmin() as unknown as Klient), handelse);
    console.log(`[revenuecat] ${handelse.type} ${handelse.id}: ${utfall.atgard}${'orsak' in utfall ? ` (${utfall.orsak})` : ''}`);
    return NextResponse.json({ ok: true, atgard: utfall.atgard });
  } catch (e) {
    console.error(`[revenuecat] ${handelse.type} ${handelse.id}:`, e);
    return NextResponse.json({ error: 'internt_fel' }, { status: 500 });
  }
}
