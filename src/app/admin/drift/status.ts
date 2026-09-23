/**
 * Rena beräkningar för Drift (spec-admin-tydlighet 2026-09-22, sida 8).
 *
 * Ingen supabase och ingen next/cache, så att testerna kör dem rakt av.
 *
 *   - Status per delsteg i senaste insamlingen, härledd ur vad delsteget
 *     skriver: Stripe (mrr_ore), GSC (gsc_clicks, som normalt ligger efter),
 *     PostHog (markörraden _samlad i admin_flode_daily) och Supabase
 *     (new_accounts).
 *   - Senaste köpet webhooken bokförde, så att "inga köp" går att skilja från
 *     "webhooken står".
 *   - Fel vars metadata pekar på ett undantaget konto räknas inte.
 */

import { datumKort, tidKort } from '@/lib/admin/tomt';
import type { Undantag } from '@/lib/admin/undantag';

/** GSC ligger normalt två till tre dagar efter. Fyra är gränsen för larm. */
export const GSC_NORMAL_EFTERSLAP_DAGAR = 4;

export interface MetrikRad {
  dag: string;
  uppdaterad: string | null;
  mrr_ore: number | null;
  gsc_clicks: number | null;
  new_accounts: number | null;
}

export interface DelstegStatus {
  namn: 'Stripe' | 'GSC' | 'PostHog' | 'Supabase';
  ok: boolean;
  text: string;
}

function dagarMellan(fran: string, till: string): number {
  return Math.round(
    (Date.parse(`${till}T12:00:00Z`) - Date.parse(`${fran}T12:00:00Z`)) / 86_400_000
  );
}

/**
 * Status per delsteg. rader är admin_daily_metrics, nyast först.
 * samladDag är senaste dagen med markörraden _samlad i admin_flode_daily.
 */
export function delstegStatus(
  rader: MetrikRad[],
  samladDag: string | null,
  idag: string
): DelstegStatus[] {
  const senaste = rader[0];
  if (!senaste) {
    const text = 'Insamlingen har inte skrivit någon rad än.';
    return (['Stripe', 'GSC', 'PostHog', 'Supabase'] as const).map((namn) => ({
      namn,
      ok: false,
      text,
    }));
  }
  const dag = datumKort(senaste.dag);

  const stripe: DelstegStatus =
    senaste.mrr_ore !== null
      ? { namn: 'Stripe', ok: true, text: `MRR skriven för ${dag}.` }
      : { namn: 'Stripe', ok: false, text: `MRR saknas på raden för ${dag}.` };

  const gscDag = rader.find((r) => r.gsc_clicks !== null)?.dag ?? null;
  let gsc: DelstegStatus;
  if (!gscDag) {
    gsc = { namn: 'GSC', ok: false, text: `Ingen dag med klick bland de ${rader.length} senaste raderna.` };
  } else {
    const efter = Math.max(0, dagarMellan(gscDag, idag));
    const normalt = efter <= GSC_NORMAL_EFTERSLAP_DAGAR;
    gsc = {
      namn: 'GSC',
      ok: normalt,
      text: `Senaste dag med klick ${datumKort(gscDag)}, Google ligger ${efter} ${
        efter === 1 ? 'dag' : 'dagar'
      } efter${normalt ? ', vilket är normalt' : ', mer än de två till tre dagar som är normalt'}.`,
    };
  }

  // Flödet samlas för gårdagen, så en dag före metrikraden är i tid.
  const posthogOk = samladDag !== null && dagarMellan(samladDag, senaste.dag) <= 1;
  const posthog: DelstegStatus = {
    namn: 'PostHog',
    ok: posthogOk,
    text: samladDag
      ? `Köpflödet samlat för ${datumKort(samladDag)}.`
      : 'Köpflödet har aldrig samlats in.',
  };

  const supabase: DelstegStatus =
    senaste.new_accounts !== null
      ? { namn: 'Supabase', ok: true, text: `Nya konton skrivna för ${dag}.` }
      : { namn: 'Supabase', ok: false, text: `Nya konton saknas på raden för ${dag}.` };

  return [stripe, gsc, posthog, supabase];
}

/** Sant när felradens metadata pekar på ett undantaget konto. */
export function felFranUndantag(
  metadata: unknown,
  u: Pick<Undantag, 'har'>
): boolean {
  if (!metadata || typeof metadata !== 'object') return false;
  const m = metadata as Record<string, unknown>;
  const id = m.user_id ?? m.userId;
  return typeof id === 'string' && u.har(id);
}

export interface KopKandidat {
  userId: string;
  tid: string;
  paket: string;
  kalla: 'grant' | 'profil';
}

/**
 * Senaste köpet webhooken bokförde. Dagspasset skriver både en grant och
 * paket_started_at; inom fem minuter från varandra är de samma köp, och då
 * vinner grantens paketnamn (profilens price_id kan vara en gammal
 * prenumeration).
 */
export function senasteKop(kandidater: KopKandidat[]): KopKandidat | null {
  if (!kandidater.length) return null;
  const sorterade = [...kandidater].sort((a, b) => b.tid.localeCompare(a.tid));
  const forsta = sorterade[0];
  if (forsta.kalla === 'profil') {
    const grant = sorterade.find(
      (k) =>
        k.kalla === 'grant' &&
        k.userId === forsta.userId &&
        Math.abs(Date.parse(k.tid) - Date.parse(forsta.tid)) < 5 * 60_000
    );
    if (grant) return { ...forsta, paket: grant.paket };
  }
  return forsta;
}

/** "Senaste köp som webhooken bokförde: 22 sep kl. 14.14, Dagspasset." */
export function kopText(kop: KopKandidat | null, sedan: string): string {
  if (!kop) return `Webhooken har inte bokfört något köp sedan ${tidKort(sedan)}.`;
  return `Senaste köp som webhooken bokförde: ${tidKort(kop.tid)}, ${kop.paket}.`;
}
