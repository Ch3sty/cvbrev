// src/lib/email/jobbsoketUtskick.ts
// Utskicket av mejlet om Jobbsöket (docs/beslut-mejl-och-radering-2026-11-22.md,
// 1e), efter mönstret i kampanjUtskick.ts. Morgonkörningen anropar det varje
// dag och gör något bara på utskicksdagen. Dagen står i koden och är null
// (avstängt) tills ägaren sagt ja.
//
// Urvalet, sju villkor: konton med e-postadress som
//   1. inte är undantagna (admin_undantagna_konton: admin och testadresser),
//   2. inte har stängt av mejl (quota_emails_opt_out inte sann),
//   3. inte har stängt av erbjudanden och tips (erbjudanden_mejl inte falsk),
//   4. aldrig har loggat en sökt tjänst (ingen rad i job_applications),
//   5. har varit aktiva de senaste 90 dagarna räknat från utskicksdagen,
//   6. vars adress aldrig har studsat eller anmält skräppost (email_events),
//   7. inte redan fått mejlet (email_log).
// Redan loggade mottagare hoppas över, så en andra körning samma dag skickar
// aldrig dubbelt.

import { Resend } from 'resend';
import { hamtaUndantag } from '@/lib/admin/undantag';
import { svenskDag } from '@/lib/kampanj/kampanj';
import { kampanjHuvuden } from './campaign-kampanj';
import type { UtskickResultat } from './kampanjUtskick';
import { genereraJobbsoketMejl, JOBBSOKET_MEJL_TYP } from './lifecycle/templates/campaign-jobbsoket';

export const JOBBSOKET_UTSKICK: { nyckel: 'jobbsoket-2026-12'; dag: string | null } = {
  nyckel: 'jobbsoket-2026-12',
  // Ägarens ja krävs. Sätt till '2026-12-02' (saas-leads förslag) när ägaren sagt ja.
  dag: null,
};

/** Dagar bakåt från utskicksdagen som räknas som aktiv (villkor 5). */
export const JOBBSOKET_AKTIV_DAGAR = 90;

const FROM = 'Jobbcoach <noreply@jobbcoach.ai>';
const BATCH = 100;
const PAUS_MS = 700; // Resend tillåter ungefär två anrop i sekunden
const SIDA = 1000; // PostgREST kapar tyst vid 1 000 rader

/** Är `nu` utskicksdagen i svensk tid? Alltid falskt när dagen inte är satt. */
export function arUtskicksdag(nu: Date, dag: string | null = JOBBSOKET_UTSKICK.dag): boolean {
  if (!dag) return false;
  return svenskDag(nu) === dag;
}

export interface JobbsoketMottagare {
  id: string;
  email: string;
  full_name: string | null;
  harBrev: boolean;
}

/** Läser alla rader en fråga ger, sida för sida. */
async function lasAlla<T>(fraga: (fran: number, till: number) => PromiseLike<{ data: T[] | null; error: any }>): Promise<T[]> {
  const ut: T[] = [];
  for (let fran = 0; ; fran += SIDA) {
    const { data, error } = await fraga(fran, fran + SIDA - 1);
    if (error) throw error;
    const rader = data ?? [];
    ut.push(...rader);
    if (rader.length < SIDA) break;
  }
  return ut;
}

/** Mottagaren i en händelse från Resends webhook, med gemener. */
export function handelseMottagare(payload: any): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const to = payload.to;
  const forsta = Array.isArray(to) ? to[0] : to;
  return typeof forsta === 'string' && forsta.includes('@') ? forsta.trim().toLowerCase() : null;
}

/** Vilka som ska få mejlet, minus de som redan fått det. */
export async function jobbsoketMottagare(
  admin: any,
  nu: Date = new Date()
): Promise<{ kvar: JobbsoketMottagare[]; redan: number }> {
  const aktivGrans = new Date(nu.getTime() - JOBBSOKET_AKTIV_DAGAR * 86400000).toISOString();

  const profiler = await lasAlla<{
    id: string;
    email: string | null;
    full_name: string | null;
    quota_emails_opt_out: boolean | null;
    erbjudanden_mejl: boolean | null;
    last_active: string | null;
  }>((fran, till) =>
    admin
      .from('profiles')
      .select('id, email, full_name, quota_emails_opt_out, erbjudanden_mejl, last_active')
      .not('email', 'is', null)
      .order('id')
      .range(fran, till)
  );

  const undantag = await hamtaUndantag(admin);

  const sokta = await lasAlla<{ user_id: string }>((fran, till) =>
    admin.from('job_applications').select('user_id').order('id').range(fran, till)
  );
  const harSokt = new Set(sokta.map((r) => r.user_id));

  const handelser = await lasAlla<{ payload: unknown }>((fran, till) =>
    admin
      .from('email_events')
      .select('payload')
      .in('event_type', ['bounced', 'complained'])
      .order('id')
      .range(fran, till)
  );
  const sparradeAdresser = new Set(
    handelser.map((h) => handelseMottagare(h.payload)).filter((a): a is string => Boolean(a))
  );

  const loggade = await lasAlla<{ user_id: string | null }>((fran, till) =>
    admin.from('email_log').select('user_id').eq('email_type', JOBBSOKET_MEJL_TYP).order('id').range(fran, till)
  );
  const redan = new Set(loggade.map((r) => r.user_id).filter((id): id is string => Boolean(id)));

  const kvar = profiler.filter(
    (p) =>
      typeof p.email === 'string' &&
      p.email.includes('@') &&
      !undantag.har(p.id) &&
      p.quota_emails_opt_out !== true &&
      p.erbjudanden_mejl !== false &&
      !harSokt.has(p.id) &&
      !!p.last_active &&
      p.last_active >= aktivGrans &&
      !sparradeAdresser.has(p.email.trim().toLowerCase()) &&
      !redan.has(p.id)
  );

  // harBrev: minst ett sparat brev, samma fråga som kortet i Sökta tjänster
  // (src/lib/jobbsok/server.ts, letters med is_saved = true).
  const medBrev = new Set<string>();
  const ids = kvar.map((p) => p.id);
  for (let i = 0; i < ids.length; i += 200) {
    const del = ids.slice(i, i + 200);
    const brev = await lasAlla<{ user_id: string }>((fran, till) =>
      admin.from('letters').select('user_id').eq('is_saved', true).in('user_id', del).order('id').range(fran, till)
    );
    for (const b of brev) medBrev.add(b.user_id);
  }

  return {
    kvar: kvar.map((p) => ({ id: p.id, email: p.email as string, full_name: p.full_name, harBrev: medBrev.has(p.id) })),
    redan: redan.size,
  };
}

/** Skickar till mottagarna i omgångar och loggar varje mottagare i email_log. */
export async function skickaJobbsoket(admin: any, mottagare: JobbsoketMottagare[]): Promise<UtskickResultat> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  let skickade = 0;
  let misslyckade = 0;

  for (let i = 0; i < mottagare.length; i += BATCH) {
    const del = mottagare.slice(i, i + BATCH);
    const mejl = del.map((m) => {
      const { subject, html } = genereraJobbsoketMejl({ userId: m.id, fullName: m.full_name, harBrev: m.harBrev });
      return { from: FROM, to: [m.email], subject, html, headers: kampanjHuvuden(m.id) };
    });

    const { data, error } = await resend.batch.send(mejl);
    if (error) {
      // Hela omgången föll: logga inget, så tar nästa körning dem igen.
      console.error(`[Jobbsöket ${JOBBSOKET_UTSKICK.nyckel}] omgången misslyckades:`, error);
      misslyckade += del.length;
    } else {
      const svar = (data as any)?.data ?? [];
      const rader = del.map((m, j) => ({
        resend_id: svar[j]?.id ?? null,
        user_id: m.id,
        email_type: JOBBSOKET_MEJL_TYP,
        feature: 'jobbsoket',
        recipient: m.email,
        subject: mejl[j].subject,
      }));
      const { error: logFel } = await admin.from('email_log').insert(rader);
      if (logFel) console.error(`[Jobbsöket ${JOBBSOKET_UTSKICK.nyckel}] kunde inte logga omgången:`, logFel);
      skickade += del.length;
    }

    if (i + BATCH < mottagare.length) await new Promise((r) => setTimeout(r, PAUS_MS));
  }

  return { kampanj: JOBBSOKET_UTSKICK.nyckel, skickade, misslyckade, redan: 0 };
}
