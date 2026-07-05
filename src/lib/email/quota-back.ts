// src/lib/email/quota-back.ts
// "Din kvot är tillbaka"-mail. MEDVETET ENKEL PLACEHOLDER — designen görs om
// när funktionaliteten är verifierad (beslut 2026-07-05). Avregistreringslänk
// är obligatorisk och får inte tas bort vid omdesign.

import { unsubscribeUrl } from './unsubscribe';

const FEATURE_LABELS: Record<string, { label: string; path: string }> = {
  letter_generation: { label: 'dina personliga brev', path: '/dashboard/skapa-brev' },
  cv_analysis: { label: 'din CV-analys', path: '/dashboard/cv-analys' },
  chat_message: { label: 'jobbcoach-chatten', path: '/dashboard/jobbcoachen' },
};

function featureInfo(feature: string): { label: string; path: string } {
  if (FEATURE_LABELS[feature]) return FEATURE_LABELS[feature];
  if (feature.startsWith('test:') || feature.includes('prov')) {
    return { label: 'dagens test', path: '/dashboard/tester' };
  }
  return { label: 'din dagskvot', path: '/dashboard' };
}

export function generateQuotaBackEmail(userId: string, feature: string): {
  subject: string;
  html: string;
} {
  const { label, path } = featureInfo(feature);
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';

  const subject = 'Nu kan du fortsätta där du slutade';
  const html = `<!doctype html>
<html lang="sv">
  <body style="margin:0;background:#F8FAFC;font-family:system-ui,-apple-system,sans-serif;padding:24px 12px">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden">
      <div style="height:4px;background:linear-gradient(90deg,#FB923C,#DC2626)"></div>
      <div style="padding:28px">
        <h1 style="font-size:20px;color:#0F172A;margin:0 0 12px">Kvoten är tillbaka</h1>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 20px">
          Du bad oss säga till när ${label} blev tillgänglig igen. Nu är det klart,
          logga in och fortsätt där du slutade.
        </p>
        <a href="${base}${path}"
           style="display:inline-block;background:linear-gradient(135deg,#F97316,#DC2626);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px">
          Fortsätt på jobbcoach.ai
        </a>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #F1F5F9">
        <p style="font-size:12px;color:#94A3B8;margin:0">
          Du får detta mail eftersom du klickade på "Påminn mig" på jobbcoach.ai.
          <a href="${unsubscribeUrl(userId)}" style="color:#94A3B8">Avregistrera dig från påminnelser</a>
        </p>
      </div>
    </div>
  </body>
</html>`;

  return { subject, html };
}
