// src/lib/email/rekryterarMejl.ts
//
// Två mail kring rekryterarkontot (Bli upptäckt, rättningsomgången
// 2026-11-22):
//
//   1. Till rekryteraren när kontot godkänns. Transaktionellt, skickas en
//      gång: email_log (typ recruiter_approved) avgör om det redan gått.
//      Godkännandet sätts i adminen (Innehåll, fliken Rekryterare, POST
//      /api/admin/recruiters). Sätts statusen direkt i databasen skickas
//      inget mail.
//   2. Till oss när en ansökan kommer in. Samma mottagare och mönster som
//      kontaktformulärets mail till supporten (src/app/api/contact/kontakt.ts).
//      Skickas en gång per konto (email_log, typ recruiter_application).
//
// Samma skal, knapp och fot som de omskrivna livscykelmailen (renderLayout).

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resend } from 'resend';
import { renderLayout, heading, paragraph, firstName, escapeHtml, siteUrl } from './lifecycle/templates/layout';
import { unsubscribeUrl } from './unsubscribe';
import { AVSANDARE, mottagare as supportMottagare } from '@/app/api/contact/kontakt';

export const GODKANT_TYP = 'recruiter_approved';
export const ANSOKAN_TYP = 'recruiter_application';

export interface Mejl {
  subject: string;
  html: string;
}

/** Mailet till rekryteraren när kontot är godkänt. */
export function genereraGodkantMejl(p: { userId: string; fullName: string | null }): Mejl {
  const subject = 'Ditt rekryterarkonto är godkänt';
  const preheader = 'Du kan nu logga in och söka bland kandidater som har valt att synas.';
  const namn = firstName(p.fullName);
  return {
    subject,
    html: renderLayout({
      type: GODKANT_TYP,
      userId: p.userId,
      preheader,
      transactional: true,
      body:
        heading(subject) +
        paragraph(namn ? `Hej ${namn},` : 'Hej,') +
        paragraph(
          'Ditt konto hos Jobbcoach.ai är godkänt. Du kan nu logga in och söka bland kandidater som har valt att synas.'
        ) +
        paragraph(
          'Profilerna är anonyma tills kandidaten tackar ja till din kontaktförfrågan. Då delas namn och kontaktuppgifter, och ni kan skriva till varandra i tjänsten.'
        ),
      ctaLabel: 'Logga in',
      ctaUrl: '/login?redirect=/rekryterare',
      unsubscribe: {
        url: unsubscribeUrl(p.userId),
        label: 'Avregistrera dig',
        consentLine: 'Det här mailet rör ditt rekryterarkonto hos Jobbcoach.ai.',
      },
    }),
  };
}

export interface Ansokan {
  userId: string;
  foretag: string;
  orgnummer: string;
  namn: string | null;
  epost: string | null;
}

/** Mailet till oss när en ansökan kommer in. */
export function genereraAnsokanMejl(a: Ansokan): Mejl {
  const subject = `Ny rekryteraransökan: ${a.foretag}`;
  const lank = `${siteUrl()}/admin/innehall?flik=rekryterare`;
  const rad = (etikett: string, varde: string | null) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#64748B;">${etikett}</td><td style="padding:4px 0;color:#0F172A;">${escapeHtml(varde ?? 'Saknas')}</td></tr>`;
  const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#0F172A;">
<p style="margin:0 0 12px 0;">En ny rekryterare väntar på granskning.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;">
${rad('Företag', a.foretag)}
${rad('Organisationsnummer', a.orgnummer)}
${rad('Namn', a.namn)}
${rad('E-post', a.epost)}
</table>
<p style="margin:0;"><a href="${lank}" style="color:#EA580C;">Granska ansökan i adminen</a></p>
</body></html>`;
  return { subject, html };
}

/** Har mailet redan gått till kontot? */
async function redanSkickat(admin: any, userId: string, typ: string): Promise<boolean> {
  const { count, error } = await admin
    .from('email_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('email_type', typ);
  if (error) {
    // Hellre inget mail än två: vid lästfel skickar vi inte.
    console.error('rekryterarMejl: kunde inte läsa email_log', error);
    return true;
  }
  return (count ?? 0) > 0;
}

async function skicka(admin: any, userId: string, typ: string, till: string, mejl: Mejl): Promise<boolean> {
  const nyckel = process.env.RESEND_API_KEY;
  if (!nyckel) {
    console.error(`rekryterarMejl: RESEND_API_KEY saknas, ${typ} skickades inte`);
    return false;
  }
  const resend = new Resend(nyckel);
  const { data, error } = await resend.emails.send({
    from: AVSANDARE,
    to: [till],
    subject: mejl.subject,
    html: mejl.html,
    tags: [{ name: 'type', value: typ }],
  });
  if (error) {
    console.error(`rekryterarMejl: ${typ} misslyckades`, error);
    return false;
  }
  await admin.from('email_log').insert({
    resend_id: data?.id ?? null,
    user_id: userId,
    email_type: typ,
    recipient: till,
    subject: mejl.subject,
  });
  return true;
}

/**
 * Skickar godkännandemailet om det inte redan gått. Best effort: ett fel
 * loggas men fäller aldrig godkännandet.
 */
export async function skickaGodkantMejl(admin: any, userId: string): Promise<boolean> {
  try {
    if (await redanSkickat(admin, userId, GODKANT_TYP)) return false;
    const { data: profil } = await admin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .maybeSingle();
    const { data: rek } = await admin
      .from('recruiter_profiles')
      .select('contact_name, contact_email')
      .eq('user_id', userId)
      .maybeSingle();
    const till: string | null = profil?.email ?? rek?.contact_email ?? null;
    if (!till) {
      console.error('rekryterarMejl: ingen adress för godkännandemailet', userId);
      return false;
    }
    const mejl = genereraGodkantMejl({ userId, fullName: rek?.contact_name ?? profil?.full_name ?? null });
    return await skicka(admin, userId, GODKANT_TYP, till, mejl);
  } catch (error) {
    console.error('rekryterarMejl: godkännandemailet föll', error);
    return false;
  }
}

/** Skickar ansökningsmailet till oss om det inte redan gått för kontot. */
export async function skickaAnsokanMejl(admin: any, a: Ansokan): Promise<boolean> {
  try {
    if (await redanSkickat(admin, a.userId, ANSOKAN_TYP)) return false;
    return await skicka(admin, a.userId, ANSOKAN_TYP, supportMottagare(), genereraAnsokanMejl(a));
  } catch (error) {
    console.error('rekryterarMejl: ansökningsmailet föll', error);
    return false;
  }
}
