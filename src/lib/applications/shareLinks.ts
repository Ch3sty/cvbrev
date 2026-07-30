// src/lib/applications/shareLinks.ts
// Delningslänkar för Sökta tjänster-statistiken.
//
// Samma säkerhetsmodell som recruiter_share_links: tabellen skrivs alltid via
// admin-klienten (RLS ger bara ägaren läsrätt), uppslaget via token är publikt
// men sker server-side. Statistik-RPC:n är endast GRANT:ad till service_role,
// så en gissad token räcker aldrig för att nå datan via PostgREST.

import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { ApplicationStats, ApplicationChannel, ApplicationEventType } from '@/lib/applications/status';

export const APPLICATION_SHARE_TTL_DAYS = 30;

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

export interface SharedApplicationData {
  ownerName: string | null;
  stats: ApplicationStats;
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

  const { data: statsData, error: statsError } = await (admin as any).rpc('get_job_application_stats', {
    p_user_id: link.user_id,
  });
  if (statsError) {
    console.error('Sökta tjänster-delning: statistik-RPC misslyckades', statsError);
    return null;
  }

  const stats = statsData as ApplicationStats;
  if (!link.show_channel_breakdown) stats.byChannel = [];
  if (!link.show_monthly_trend) {
    stats.byMonth = [];
    stats.byWeek = [];
  }

  let applications: SharedApplicationRow[] | null = null;
  if (link.show_company_names) {
    const { data: rows, error: rowsError } = await (admin as any)
      .from('job_applications')
      .select('job_title, company, location, application_channel, applied_at, current_status, notes')
      .eq('user_id', link.user_id)
      .order('applied_at', { ascending: false });
    if (rowsError) {
      console.error('Sökta tjänster-delning: kunde inte läsa ansökningar', rowsError);
    } else {
      applications = (rows ?? []).map((row: SharedApplicationRow) => ({
        ...row,
        notes: link.show_notes ? row.notes : null,
      }));
    }
  }

  const { data: profile } = await (admin as any)
    .from('profiles')
    .select('full_name')
    .eq('id', link.user_id)
    .maybeSingle();

  return {
    ownerName: profile?.full_name ?? null,
    stats,
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
