// src/lib/applications/shareLinks.ts
// Delningslänkar för Sökta tjänster-statistiken.
//
// Samma säkerhetsmodell som recruiter_share_links: tabellen skrivs alltid via
// admin-klienten (RLS ger bara ägaren läsrätt), uppslaget via token är publikt
// men sker server-side. Statistik-RPC:n är endast GRANT:ad till service_role,
// så en gissad token räcker aldrig för att nå datan via PostgREST.

import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { ApplicationChannel, ApplicationEventType, JobApplication } from '@/lib/applications/status';
import { tjanstLage } from '@/lib/jobbsok/lage';
import { tratt as raknaTratt } from '@/lib/jobbsok/statistik';
import type { Bricka, BrickTon, Handelse, TjanstMedHistorik, Uppfoljning } from '@/lib/jobbsok/typer';

import { APPLICATION_SHARE_TTL_DAYS } from '@/lib/applications/shareTtl';

export { APPLICATION_SHARE_TTL_DAYS };

/** 32 tecken URL-säker slump, samma generator som recruiter-delningen. */
export function generateApplicationShareToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

export function applicationShareExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + APPLICATION_SHARE_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export interface ShareLinkFlags {
  show_company_names: boolean;
  show_channel_breakdown: boolean;
  show_monthly_trend: boolean;
  show_notes: boolean;
}

export interface SharedApplicationRow {
  job_title: string;
  company: string | null;
  location: string | null;
  application_channel: ApplicationChannel;
  applied_at: string;
  current_status: ApplicationEventType | null;
  notes: string | null;
}

/** Antal sökta tjänster per brickton i ett steg av tratten. */
export type DeladeToner = Partial<Record<BrickTon, number>>;

/**
 * Tratten i delningen: bara aggregat. Antal per steg, antal per ton i varje
 * steg (för brickornas färger) och delsummorna under stegen. Inga rader,
 * inga företagsbokstäver, inga datum per tjänst. Räknas med samma motor som
 * Statistik i rummet (src/lib/jobbsok/statistik.ts), så talen blir desamma.
 */
export interface DeladTratt {
  /** `sedan` (första sökta dagen) bara när listan med datum redan delas. */
  sokta: { antal: number; sedan: string | null; toner: DeladeToner };
  svar: { antal: number; kallelser: number; avslag: number; toner: DeladeToner };
  intervju: { antal: number; genomforda: number; bokade: number; toner: DeladeToner };
  erbjudande: { antal: number; toner: DeladeToner };
}

function raknaToner(brickor: readonly Bricka[]): DeladeToner {
  const ut: DeladeToner = {};
  for (const b of brickor) ut[b.ton] = (ut[b.ton] ?? 0) + 1;
  return ut;
}

export interface SharedApplicationData {
  ownerName: string | null;
  tratt: DeladTratt;
  /** Ansökningslistan ingår bara om ägaren valt att visa företagsnamn. */
  applications: SharedApplicationRow[] | null;
  flags: ShareLinkFlags;
  expiresAt: string;
}

/**
 * Publikt uppslag av en delningslänk. null om token är okänd, utgången eller
 * återkallad. Returnerar aggregat plus (om ägaren tillåtit) ansökningslistan,
 * aldrig interna id:n.
 */
export async function getSharedApplicationData(token: string): Promise<SharedApplicationData | null> {
  const trimmed = token?.trim();
  if (!trimmed || trimmed.length > 64) return null;

  const admin = getSupabaseAdmin();

  const { data: link, error: linkError } = await (admin as any)
    .from('job_application_share_links')
    .select('token, user_id, show_company_names, show_channel_breakdown, show_monthly_trend, show_notes, expires_at, revoked_at')
    .eq('token', trimmed)
    .gt('expires_at', new Date().toISOString())
    .is('revoked_at', null)
    .maybeSingle();

  if (linkError) {
    console.error('Sökta tjänster-delning: kunde inte slå upp token', linkError);
    return null;
  }
  if (!link) return null;

  // Tratten räknas här på servern ur de sökta tjänsterna med händelser och
  // uppföljningar (samma underlag som rummet). Bara aggregaten lämnar
  // funktionen. Ska sökas ligger i job_saved_ads och läses aldrig här.
  const [ansokningarRes, uppfoljningarRes] = await Promise.all([
    (admin as any)
      .from('job_applications')
      .select('*, job_application_events(*)')
      .eq('user_id', link.user_id)
      .order('applied_at', { ascending: false })
      .order('created_at', { ascending: false }),
    (admin as any).from('job_application_followups').select('*').eq('user_id', link.user_id),
  ]);
  if (ansokningarRes.error) {
    console.error('Sökta tjänster-delning: kunde inte läsa sökta tjänster', ansokningarRes.error);
    return null;
  }
  // Saknas uppföljningarna (läsfel eller tabellen saknas) räknas tratten utan dem.
  if (uppfoljningarRes.error) {
    console.error('Sökta tjänster-delning: kunde inte läsa uppföljningar', uppfoljningarRes.error);
  }

  const rader = (ansokningarRes.data ?? []) as Array<JobApplication & { job_application_events?: Handelse[] }>;
  const uppfoljningar = (uppfoljningarRes.error ? [] : (uppfoljningarRes.data ?? [])) as Uppfoljning[];
  const historik: TjanstMedHistorik[] = rader.map(({ job_application_events, ...ansokan }) => ({
    ansokan: ansokan as JobApplication,
    handelser: (job_application_events ?? []).map((h) => ({
      ...h,
      interview_at: h.interview_at ?? null,
      interview_place: h.interview_place ?? null,
    })),
    uppfoljningar: uppfoljningar.filter((u) => u.application_id === ansokan.id),
  }));
  const nu = new Date();
  const t = raknaTratt(historik, historik.map((h) => tjanstLage(h, nu)));
  const tratt: DeladTratt = {
    sokta: { antal: t.sokta.antal, sedan: link.show_company_names ? t.sokta.sedan : null, toner: raknaToner(t.sokta.brickor) },
    svar: { antal: t.svar.antal, kallelser: t.svar.kallelser, avslag: t.svar.avslag, toner: raknaToner(t.svar.brickor) },
    intervju: { antal: t.intervju.antal, genomforda: t.intervju.genomforda, bokade: t.intervju.bokade, toner: raknaToner(t.intervju.brickor) },
    erbjudande: { antal: t.erbjudande.antal, toner: raknaToner(t.erbjudande.brickor) },
  };

  // Listan ingår bara om ägaren valt att visa företagsnamn, med samma
  // kolumner som förut.
  const applications: SharedApplicationRow[] | null = link.show_company_names
    ? rader.map((row) => ({
        job_title: row.job_title,
        company: row.company,
        location: row.location,
        application_channel: row.application_channel,
        applied_at: row.applied_at,
        current_status: row.current_status,
        notes: link.show_notes ? row.notes : null,
      }))
    : null;

  const { data: profile } = await (admin as any)
    .from('profiles')
    .select('full_name')
    .eq('id', link.user_id)
    .maybeSingle();

  return {
    ownerName: profile?.full_name ?? null,
    tratt,
    applications,
    flags: {
      show_company_names: link.show_company_names,
      show_channel_breakdown: link.show_channel_breakdown,
      show_monthly_trend: link.show_monthly_trend,
      show_notes: link.show_notes,
    },
    expiresAt: link.expires_at,
  };
}
