// src/lib/email/quota-back.ts
// "Din kvot är tillbaka"-mail i appens visuella språk (orange/röd gradient,
// J-logotyp, varm bakgrund). Byggd med tabellayout och inline-CSS så den
// renderar korrekt i Gmail, Outlook och Apple Mail. Avregistreringslänken
// är ett lagkrav och får aldrig tas bort.

import { unsubscribeUrl } from './unsubscribe';

interface FeatureCopy {
  subject: string;
  preheader: string;
  heading: string;
  body: string;
  cta: string;
  path: string;
}

const FEATURE_COPY: Record<string, FeatureCopy> = {
  letter_generation: {
    subject: 'Dagens brev är redo att skrivas',
    preheader: 'Din brevkvot har nollställts. Två nya personliga brev väntar.',
    heading: 'Två nya brev väntar på dig',
    body: 'Du bad oss säga till när din brevkvot var tillbaka. Nu är den det. Skriv dagens ansökningar medan annonserna är färska, det tar bara ett par minuter per brev.',
    cta: 'Skriv ditt nästa brev',
    path: '/dashboard/skapa-brev',
  },
  cv_analysis: {
    subject: 'Din CV-analys är tillgänglig igen',
    preheader: 'Kvoten har nollställts. Kör en ny analys och se vad som förbättrats.',
    heading: 'Dags att analysera ditt CV igen',
    body: 'Du bad oss påminna dig när CV-analysen blev tillgänglig. Har du hunnit justera något sedan sist? Kör en ny analys och se hur poängen förändras.',
    cta: 'Analysera ditt CV',
    path: '/dashboard/cv-analys',
  },
  chat_message: {
    subject: 'Jobbcoachen är redo för nya frågor',
    preheader: 'Dina tio dagliga meddelanden har nollställts.',
    heading: 'Jobbcoachen väntar på dig',
    body: 'Dina dagliga meddelanden till jobbcoachen har nollställts. Ställ frågorna du inte hann med igår, om CV:t, intervjun eller nästa steg i karriären.',
    cta: 'Öppna chatten',
    path: '/dashboard/jobbcoachen',
  },
};

const TEST_COPY: FeatureCopy = {
  subject: 'Dagens test väntar på dig',
  preheader: 'Din dagliga testkvot har nollställts. Håll träningen igång.',
  heading: 'Dags för dagens träningspass',
  body: 'Din dagliga testkvot är nollställd. Regelbunden träning är det som gör skillnad på riktiga rekryteringstest, en omgång om dagen räcker långt.',
  cta: 'Gör dagens test',
  path: '/dashboard/tester',
};

const DEFAULT_COPY: FeatureCopy = {
  subject: 'Nu kan du fortsätta där du slutade',
  preheader: 'Din kvot har nollställts och väntar på dig.',
  heading: 'Din kvot är tillbaka',
  body: 'Du bad oss säga till när du kunde fortsätta. Nu är det klart, logga in och plocka upp där du slutade.',
  cta: 'Fortsätt på Jobbcoach.ai',
  path: '/dashboard',
};

function copyFor(feature: string): FeatureCopy {
  if (FEATURE_COPY[feature]) return FEATURE_COPY[feature];
  if (feature.startsWith('test:') || feature.includes('prov')) return TEST_COPY;
  return DEFAULT_COPY;
}

export function generateQuotaBackEmail(userId: string, feature: string): {
  subject: string;
  html: string;
} {
  const copy = copyFor(feature);
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';
  const ctaUrl = `${base}${copy.path}`;

  const html = `<!doctype html>
<html lang="sv" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${copy.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF7ED;-webkit-text-size-adjust:100%;">
  <!-- Preheader (syns i inkorgens förhandsvisning, inte i mailet) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${copy.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF7ED;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Logotyp -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background-color:#F97316;border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:#ffffff;line-height:36px;">J</td>
            <td style="padding-left:10px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;color:#0F172A;">Jobbcoach<span style="color:#F97316;">.ai</span></td>
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
              <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#EA580C;">Din kvot är tillbaka</p>
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;font-weight:800;color:#0F172A;">${copy.heading}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 32px 4px 32px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#475569;">${copy.body}</p>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:26px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#EA580C;background:linear-gradient(135deg,#F97316,#DC2626);border-radius:12px;">
                    <a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">${copy.cta}&nbsp;&nbsp;&rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Sekundär rad -->
          <tr>
            <td style="padding:14px 32px 30px 32px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#94A3B8;">Vill du slippa vänta på kvoter? <a href="${base}/priser" target="_blank" style="color:#EA580C;font-weight:600;text-decoration:none;">Premium ger dig obegränsad tillgång</a>, med 7 dagar gratis.</p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:22px 24px 8px 24px;text-align:center;">
              <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#B45309;">Du får det här mailet för att du klickade på "Påminn mig" på jobbcoach.ai.</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#B45309;">
                <a href="${unsubscribeUrl(userId)}" target="_blank" style="color:#B45309;text-decoration:underline;">Avregistrera dig från påminnelser</a>
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

  return { subject: copy.subject, html };
}
