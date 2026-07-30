// src/lib/email/campaign-sokta-tjanster.ts
// Kampanjmail "Ny funktion: Sökta tjänster". Samma visuella språk som
// quota-back (orange/röd gradient, J-logotyp, varm bakgrund), tabellayout
// och inline-CSS för Gmail/Outlook/Apple Mail. Avregistreringslänken är
// ett lagkrav och får aldrig tas bort.

import { unsubscribeUrl } from './unsubscribe';

/** Identifierar kampanjen i email_log; visas som "Kampanj – Ny funktion" i admin. */
export const CAMPAIGN_EMAIL_TYPE = 'campaign:sokta-tjanster';
export const CAMPAIGN_TEST_EMAIL_TYPE = 'campaign_test';

export function generateSoktaTjansterCampaignEmail(userId: string): {
  subject: string;
  html: string;
} {
  const subject = 'Nyhet: håll koll på alla jobb du sökt';
  const preheader =
    'Logga dina ansökningar, följ din statistik och skriv ut en färdig översikt till Arbetsförmedlingen.';
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';
  const ctaUrl = `${base}/dashboard/sokta-tjanster`;

  const html = `<!doctype html>
<html lang="sv" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF7ED;-webkit-text-size-adjust:100%;">
  <!-- Preheader (syns i inkorgens förhandsvisning, inte i mailet) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF7ED;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Logotyp -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background-color:#EA580C;background:linear-gradient(135deg,#F97316 0%,#DC2626 55%,#BE185D 100%);border-radius:9px;width:36px;height:36px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:21px;font-weight:900;color:#ffffff;line-height:36px;">J</td>
            <td style="padding-left:10px;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:900;letter-spacing:-0.3px;color:#0F172A;">Jobbcoach<span style="color:#94A3B8;">.ai</span></td>
          </tr>
        </table>

        <!-- Kort -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #FED7AA;overflow:hidden;">
          <!-- Gradient-strip -->
          <tr>
            <td height="5" style="background:#F97316;background:linear-gradient(90deg,#FB923C 0%,#DC2626 60%,#BE185D 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px 32px;">
              <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#EA580C;">Ny funktion</p>
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;font-weight:800;color:#0F172A;">Full koll på alla jobb du sökt</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 32px 4px 32px;">
              <p style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#475569;">Hur många jobb har du sökt den här månaden? Hur många svarade? Om du inte vet på rak arm är du inte ensam. Därför har vi byggt Sökta tjänster, en ny del av ditt konto där hela din jobbsökning samlas på ett ställe.</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#475569;">Logga en ansökan på under 15 sekunder. Har du skapat ett personligt brev hos oss räcker ett enda tryck, vi fyller i resten.</p>
            </td>
          </tr>
          <!-- Funktionslista -->
          <tr>
            <td style="padding:22px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF7ED;border:1px solid #FFEDD5;border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#B45309;">Det här får du</p>
                    <p style="margin:0 0 7px 0;font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.55;color:#78350F;"><strong>Följ varje steg.</strong> Kallad till intervju, provjobb, erbjudande. Du loggar händelserna, vi håller ordningen.</p>
                    <p style="margin:0 0 7px 0;font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.55;color:#78350F;"><strong>Se din statistik.</strong> Svarsfrekvens, intervjuer och ett flödesdiagram över hela resan.</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.55;color:#78350F;"><strong>Visa upp den.</strong> Skriv ut eller dela en färdig månadsöversikt, byggd efter Arbetsförmedlingens aktivitetsrapport. Perfekt till mötet med handläggaren.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:26px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#EA580C;background:linear-gradient(135deg,#F97316,#DC2626);border-radius:12px;">
                    <a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Öppna Sökta tjänster&nbsp;&nbsp;&rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Sekundär rad -->
          <tr>
            <td style="padding:16px 32px 30px 32px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#94A3B8;">Helt gratis, för alla konton. Har du redan skapat brev hos oss? Då kan du lägga till dem som sökta tjänster med ett klick när du öppnar sidan.</p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:22px 24px 8px 24px;text-align:center;">
              <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#B45309;">Du får det här mailet för att du har ett konto på jobbcoach.ai.</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#B45309;">
                <a href="${unsubscribeUrl(userId)}" target="_blank" style="color:#B45309;text-decoration:underline;">Avregistrera dig från våra mail</a>
                &nbsp;&middot;&nbsp;
                <a href="${base}" target="_blank" style="color:#B45309;text-decoration:underline;">jobbcoach.ai</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
