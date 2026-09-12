// src/lib/email/lifecycle/templates/layout.ts
// Gemensam skal för livscykelmailen. Tabellayout och inline-CSS så det
// renderar i Gmail, Outlook och Apple Mail. Avregistreringslänken är ett
// lagkrav och får aldrig tas bort.

import { unsubscribeUrl } from '../../unsubscribe';
import { withUtm } from '../schedule';

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Förnamn för tilltal, tomt om vi inte vet. */
export function firstName(fullName: string | null): string {
  const name = (fullName ?? '').trim().split(/\s+/)[0];
  return name ? escapeHtml(name) : '';
}

export interface LayoutOptions {
  type: string;
  userId: string;
  preheader: string;
  /** Brödtext som färdiga <p>-block via paragraph(). */
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  /** Liten ruta under CTA, t.ex. lista eller jämförelse. */
  note?: string;
  /** Sista raden före footern, ofta en sekundär länk. */
  footNote?: string;
  /** Transaktionella mail visar ingen avregistreringsrad i brödtexten. */
  transactional?: boolean;
  /**
   * Egen avregistreringslänk i footern, för mail som har en snävare
   * avregistrering än den globala. Veckosammanfattningen stänger bara sig
   * själv och lämnar kvotpåminnelserna orörda.
   */
  unsubscribe?: { url: string; label: string; consentLine?: string };
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#475569;">${text}</p>`;
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.3;font-weight:700;color:#0F172A;">${text}</h1>`;
}

/** Punktlista utan bullets som Outlook renderar olika. */
export function list(items: string[]): string {
  return items
    .map(
      (item) =>
        `<p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#475569;">&bull;&nbsp;&nbsp;${item}</p>`
    )
    .join('');
}

export function renderLayout(options: LayoutOptions): string {
  const base = siteUrl();
  const headerSrc = `${base}/email/email-header-jobbcoach.png`;
  const cta =
    options.ctaLabel && options.ctaUrl
      ? `<tr>
            <td style="padding:10px 32px 6px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#EA580C;border-radius:8px;">
                    <a href="${withUtm(options.ctaUrl, options.type)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${options.ctaLabel}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
      : '';

  const note = options.note
    ? `<tr>
            <td style="padding:22px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF7ED;border:1px solid #FFEDD5;border-radius:8px;">
                <tr><td style="padding:16px 18px;">${options.note}</td></tr>
              </table>
            </td>
          </tr>`
    : '';

  const footNote = options.footNote
    ? `<tr>
            <td style="padding:18px 32px 0 32px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#94A3B8;">${options.footNote}</p>
            </td>
          </tr>`
    : '';

  // Transaktionella mail (betalning, uppsägning) har inget opt-out-löfte att
  // ge, men behåller länken eftersom mottagaren ska kunna stänga av resten.
  const consentLine =
    options.unsubscribe?.consentLine ??
    (options.transactional
      ? 'Det här mailet rör ditt konto och din betalning.'
      : 'Du får det här mailet för att du har ett konto på jobbcoach.ai.');

  const unsubscribeHref = options.unsubscribe?.url ?? unsubscribeUrl(options.userId);
  const unsubscribeLabel = options.unsubscribe?.label ?? 'Avregistrera dig';

  return `<!doctype html>
<html lang="sv" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(options.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8FAFC;">
    <tr>
      <td align="center" style="padding:24px 16px 40px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;">
          <tr>
            <td style="padding:0;font-size:0;line-height:0;">
              <a href="${withUtm('/', options.type)}" target="_blank">
                <img src="${headerSrc}" width="560" alt="Jobbcoach.ai" style="display:block;width:100%;max-width:560px;height:auto;border:0;">
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 4px 32px;">
              ${options.body}
            </td>
          </tr>
          ${cta}
          ${note}
          ${footNote}
          <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:20px 24px 8px 24px;text-align:center;">
              <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#94A3B8;">${consentLine}</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#94A3B8;">
                <a href="${unsubscribeHref}" target="_blank" style="color:#94A3B8;text-decoration:underline;">${unsubscribeLabel}</a>
                &nbsp;&middot;&nbsp;
                <a href="${withUtm('/', options.type)}" target="_blank" style="color:#94A3B8;text-decoration:underline;">jobbcoach.ai</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
