// src/lib/email/kampanjUtskick.ts
// Utskicket av kampanjmejlen (lib/kampanj). Morgonkörningen anropar
// skickaKampanjmejl varje dag; den gör något bara på en kampanjs första dag.
//
// Mottagare (ägarens beslut 2026-11-13): konton med e-post som inte
// avregistrerat sig (quota_emails_opt_out), inte sagt nej till erbjudanden
// (erbjudanden_mejl false) och aldrig betalat, eftersom bara de kan få
// priset. Den som köpte under Black Week har då betalat och faller bort från
// Cyber Monday av sig själv. Redan loggade mottagare hoppas över, så en ny
// körning samma dag skickar aldrig dubbelt.

import { Resend } from 'resend';
import { harBetalat, type BetalProfil, type Kampanj } from '@/lib/kampanj/kampanj';
import { genereraKampanjMejl, kampanjHuvuden, kampanjMejlTyp } from './campaign-kampanj';

const FROM = 'Jobbcoach <noreply@jobbcoach.ai>';
const BATCH = 100;
const PAUS_MS = 700; // Resend tillåter ungefär två anrop i sekunden

type Rad = BetalProfil & {
  id: string;
  email: string | null;
  quota_emails_opt_out: boolean | null;
  erbjudanden_mejl: boolean | null;
};

export interface Mottagare {
  id: string;
  email: string;
}

/** Vilka som ska få kampanjens mejl just nu, minus de som redan fått det. */
export async function kampanjMottagare(admin: any, k: Kampanj): Promise<{ kvar: Mottagare[]; redan: number }> {
  const { data, error } = await admin
    .from('profiles')
    .select(
      'id, email, quota_emails_opt_out, erbjudanden_mejl, subscription_id, subscription_status, paket_started_at, premium_source'
    )
    .not('email', 'is', null);
  if (error) throw error;

  const { data: loggade, error: logFel } = await admin
    .from('email_log')
    .select('user_id')
    .eq('email_type', kampanjMejlTyp(k.nyckel));
  if (logFel) throw logFel;
  const redan = new Set<string>((loggade ?? []).map((r: { user_id: string }) => r.user_id));

  const kvar = ((data ?? []) as Rad[])
    .filter(
      (r) =>
        typeof r.email === 'string' &&
        r.email.includes('@') &&
        r.quota_emails_opt_out !== true &&
        r.erbjudanden_mejl !== false &&
        !harBetalat(r) &&
        !redan.has(r.id)
    )
    .map((r) => ({ id: r.id, email: r.email as string }));

  return { kvar, redan: redan.size };
}

export interface UtskickResultat {
  kampanj: string;
  skickade: number;
  misslyckade: number;
  redan: number;
}

/** Skickar till mottagarna i batchar och loggar varje mottagare i email_log. */
export async function skickaKampanj(admin: any, k: Kampanj, mottagare: Mottagare[]): Promise<UtskickResultat> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const typ = kampanjMejlTyp(k.nyckel);
  let skickade = 0;
  let misslyckade = 0;

  for (let i = 0; i < mottagare.length; i += BATCH) {
    const del = mottagare.slice(i, i + BATCH);
    const mejl = del.map((m) => {
      const { subject, html } = genereraKampanjMejl(k.nyckel, m.id);
      return { from: FROM, to: [m.email], subject, html, headers: kampanjHuvuden(m.id) };
    });

    const { data, error } = await resend.batch.send(mejl);
    if (error) {
      // Hela batchen föll: logga inget, så tar nästa körning dem igen.
      console.error(`[Kampanj ${k.nyckel}] batch misslyckades:`, error);
      misslyckade += del.length;
    } else {
      const ids = (data as any)?.data ?? [];
      const rader = del.map((m, j) => ({
        resend_id: ids[j]?.id ?? null,
        user_id: m.id,
        email_type: typ,
        feature: k.nyckel,
        recipient: m.email,
        subject: mejl[j].subject,
      }));
      const { error: logFel } = await admin.from('email_log').insert(rader);
      if (logFel) console.error(`[Kampanj ${k.nyckel}] kunde inte logga batch:`, logFel);
      skickade += del.length;
    }

    if (i + BATCH < mottagare.length) await new Promise((r) => setTimeout(r, PAUS_MS));
  }

  return { kampanj: k.nyckel, skickade, misslyckade, redan: 0 };
}
