// src/lib/email/campaign-kampanj.ts
// Kampanjmejlen för Black Week och Cyber Monday (lib/kampanj, texterna ur
// docs/kampanj/copy-black-week-2026.md). Tabellayout och inline-CSS för
// Gmail, Outlook och Apple Mail. Avregistreringen är ett lagkrav: länken i
// foten och List-Unsubscribe-huvudet stänger bara erbjudanden
// (/api/email/avregistrera-erbjudanden), aldrig kvitton eller provdatum.

import { signUnsubscribe } from './unsubscribe';
import type { KampanjNyckel } from '@/lib/kampanj/kampanj';

export const kampanjMejlTyp = (nyckel: KampanjNyckel) => `campaign:${nyckel}`;

interface MejlCopy {
  amne: string;
  forhandsrad: string;
  eyebrow: string;
  rubrik: string;
  stycke1: string;
  stycke2: string;
  belopp: string;
  knapp: string;
  villkor: string;
  /** Raden överst i mejlet och knappens färg. */
  rand: string;
  eyebrowFarg: string;
}

const COPY: Record<KampanjNyckel, MejlCopy> = {
  'black-week-2026': {
    amne: 'Black Week: första månaden Premium för 99 kr',
    forhandsrad: 'Hela veckan till och med söndag. Sedan 149 kr i månaden, säg upp när du vill.',
    eyebrow: 'Black Week 23 till 29 november',
    rubrik: 'Öva inför testet. 99 kr första månaden.',
    stycke1:
      'Har du ett logiktest eller I-provet framför dig? Den här veckan kostar första månaden Premium 99 kr i stället för 149 kr. Du gör övningsprov med tid, i samma format som på riktigt, och ser exakt var du tappar poäng.',
    stycke2:
      'Vill du ha struktur lägger vi upp ett pass om dagen fram till ditt provdatum. CV, personliga brev, Jobbcoachen och jobbmatchningen ingår också. Allt inför ansökan på ett ställe, hela veckan till och med söndag.',
    belopp: '99 kr',
    knapp: 'Köp Premium, 99 kr första månaden',
    villkor:
      'Gäller till och med söndag 29 november 23.59 för konton som inte haft Premium tidigare. Efter första månaden dras 149 kr varje månad tills du säger upp, vilket du gör under Prenumeration i din profil.',
    rand: '#141210',
    eyebrowFarg: '#A8491A',
  },
  'cyber-monday-2026': {
    amne: 'Cyber Monday: 49 kr för första månaden, bara i dag',
    forhandsrad: 'Gäller till 23.59 i kväll. Sedan 149 kr i månaden, säg upp när du vill.',
    eyebrow: 'Cyber Monday 30 november',
    rubrik: 'Testet görs på nätet. Övningen också.',
    stycke1:
      'I dag, och bara i dag, kostar första månaden Premium 49 kr i stället för 149 kr. Det är vårt lägsta pris i år. Vid midnatt är det borta.',
    stycke2:
      'Gör övningsprovet med tid, se var du tappar poäng och få ett pass om dagen tills det är dags på riktigt. CV, personliga brev och Jobbcoachen följer med.',
    belopp: '49 kr',
    knapp: 'Köp Premium, 49 kr första månaden',
    villkor:
      'Gäller måndag 30 november till 23.59 för konton som inte haft Premium tidigare. Efter första månaden dras 149 kr varje månad tills du säger upp, vilket du gör under Prenumeration i din profil.',
    rand: '#1B2246',
    eyebrowFarg: '#3B4790',
  },
};

const base = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';

export function avregistreraErbjudandenUrl(userId: string): string {
  return `${base()}/api/email/avregistrera-erbjudanden?uid=${encodeURIComponent(userId)}&sig=${signUnsubscribe(userId)}`;
}

/** Huvudena för ett klick från mejlklientens egen avregistreringsknapp. */
export function kampanjHuvuden(userId: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${avregistreraErbjudandenUrl(userId)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

const F = 'font-family:Arial,Helvetica,sans-serif;';

export function genereraKampanjMejl(
  nyckel: KampanjNyckel,
  userId: string
): { subject: string; html: string } {
  const c = COPY[nyckel];
  // Köpsteget direkt. Utloggad skickas via inloggningen tillbaka hit.
  const cta = `${base()}/dashboard/valj-spar?paket=all_month&steg=kop&plats=kampanjmejl&utm_source=mejl&utm_medium=email&utm_campaign=${nyckel}`;
  const avreg = avregistreraErbjudandenUrl(userId);

  const html = `<!doctype html>
<html lang="sv" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${c.amne}</title>
</head>
<body style="margin:0;padding:0;background-color:#EDE8DF;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${c.forhandsrad}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EDE8DF;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background-color:#E07A2F;border-radius:9px;width:36px;height:36px;text-align:center;vertical-align:middle;${F}font-size:21px;font-weight:900;color:#1A1206;line-height:36px;">J</td>
            <td style="padding-left:10px;${F}font-size:19px;font-weight:900;letter-spacing:-0.3px;color:#1C1917;">Jobbcoach</td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #DBD2C4;overflow:hidden;">
          <tr>
            <td height="6" style="background-color:${c.rand};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:34px 32px 6px 32px;">
              <p style="margin:0 0 8px 0;${F}font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${c.eyebrowFarg};">${c.eyebrow}</p>
              <h1 style="margin:0;${F}font-size:26px;line-height:1.2;font-weight:800;color:#1C1917;">${c.rubrik}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 32px 4px 32px;">
              <p style="margin:0 0 12px 0;${F}font-size:15px;line-height:1.65;color:#3E3A35;">${c.stycke1}</p>
              <p style="margin:0;${F}font-size:15px;line-height:1.65;color:#3E3A35;">${c.stycke2}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F7F3EC;border-radius:10px;">
                <tr>
                  <td style="padding:12px 16px;${F}color:#1C1917;">
                    <span style="font-size:28px;font-weight:900;">${c.belopp}</span>
                    &nbsp;<span style="font-size:15px;color:#6B645E;text-decoration:line-through;">149 kr</span>
                    &nbsp;<span style="font-size:13px;color:#57534E;">första månaden</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#E07A2F;border-radius:12px;">
                    <a href="${cta}" target="_blank" style="display:inline-block;padding:14px 26px;${F}font-size:15px;font-weight:700;color:#1A1206;text-decoration:none;">${c.knapp}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 32px 30px 32px;">
              <p style="margin:0;${F}font-size:12.5px;line-height:1.6;color:#6B645E;">${c.villkor}</p>
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:22px 24px 8px 24px;text-align:center;">
              <p style="margin:0 0 6px 0;${F}font-size:12px;line-height:1.6;color:#6B645E;">Du får det här mejlet för att du har ett konto hos oss.</p>
              <p style="margin:0;${F}font-size:12px;line-height:1.6;color:#6B645E;">
                <a href="${avreg}" target="_blank" style="color:#A8491A;text-decoration:underline;">Avregistrera dig från erbjudanden</a>
                &nbsp;&middot;&nbsp;
                <a href="${base()}" target="_blank" style="color:#A8491A;text-decoration:underline;">jobbcoach.ai</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: c.amne, html };
}
