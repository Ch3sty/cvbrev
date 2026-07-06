// src/lib/email/saved-search-alert.ts
// Bevakningsmail till rekryterare: "N nya kandidater matchar din sökning".
// Samma visuella språk som quota-back.ts (gradient-logga, kort med strip,
// tabellayout + inline-CSS för Gmail/Outlook/Apple Mail). Mottagaren har
// själv slagit på bevakningen per sparad sökning; foten länkar till
// portalen där den stängs av.

export interface AlertCandidate {
  role: string;
  region: string | null;
  years: number | null;
  topBadge: string | null;
}

export function generateSavedSearchAlertEmail(params: {
  searchName: string;
  searchId: string;
  total: number;
  candidates: AlertCandidate[];
}): { subject: string; html: string } {
  const { searchName, searchId, total } = params;
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';
  const ctaUrl = `${base}/rekryterare?saved=${encodeURIComponent(searchId)}`;
  const manageUrl = `${base}/rekryterare/sparade-sokningar`;

  const subject =
    total === 1
      ? `1 ny kandidat matchar "${searchName}"`
      : `${total} nya kandidater matchar "${searchName}"`;
  const preheader =
    'Din bevakning har hittat nya kandidater i poolen. Öppna sökningen och se träffarna.';

  const rows = params.candidates
    .slice(0, 3)
    .map((c) => {
      const facts = [
        c.years ? `${c.years} års erfarenhet` : null,
        c.region,
        c.topBadge,
      ]
        .filter(Boolean)
        .join(' &middot; ');
      return `
              <tr>
                <td style="padding:12px 16px;border-top:1px solid #FFEDD5;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#0F172A;">${c.role}</p>
                  ${facts ? `<p style="margin:2px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:1.5;color:#78716C;">${facts}</p>` : ''}
                </td>
              </tr>`;
    })
    .join('');

  const moreCount = total - Math.min(params.candidates.length, 3);

  const html = `<!doctype html>
<html lang="sv" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF7ED;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF7ED;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Logotyp (matchar src/components/Logo.tsx: varm gradient + slate .ai) -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background-color:#EA580C;background:linear-gradient(135deg,#F97316 0%,#DC2626 55%,#BE185D 100%);border-radius:9px;width:36px;height:36px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:21px;font-weight:900;color:#ffffff;line-height:36px;">J</td>
            <td style="padding-left:10px;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:900;letter-spacing:-0.3px;color:#0F172A;">Jobbcoach<span style="color:#94A3B8;">.ai</span></td>
          </tr>
        </table>

        <!-- Kort -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #FED7AA;overflow:hidden;">
          <tr>
            <td height="5" style="background:#F97316;background:linear-gradient(90deg,#FB923C 0%,#DC2626 60%,#BE185D 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px 32px;">
              <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#EA580C;">Din bevakning</p>
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;font-weight:800;color:#0F172A;">${subject}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 32px 4px 32px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#475569;">Nya kandidater har dykt upp i poolen som matchar din sparade sökning. Alla har själva valt att vara synliga och svarar på intresseförfrågningar.</p>
            </td>
          </tr>
          ${
            rows
              ? `<tr>
            <td style="padding:20px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF7ED;border:1px solid #FFEDD5;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px 2px 16px;">
                    <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#B45309;">Nya i poolen</p>
                  </td>
                </tr>${rows}
                ${
                  moreCount > 0
                    ? `<tr><td style="padding:10px 16px 14px 16px;border-top:1px solid #FFEDD5;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;color:#78716C;">och ${moreCount} till i portalen.</p></td></tr>`
                    : ''
                }
              </table>
            </td>
          </tr>`
              : ''
          }
          <!-- CTA -->
          <tr>
            <td style="padding:26px 32px 30px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#EA580C;background:linear-gradient(135deg,#F97316,#DC2626);border-radius:12px;">
                    <a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Visa kandidaterna&nbsp;&nbsp;&rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:22px 24px 8px 24px;text-align:center;">
              <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#B45309;">Du får det här mailet för att du har bevakning på sökningen "${searchName}".</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#B45309;">
                <a href="${manageUrl}" target="_blank" style="color:#B45309;text-decoration:underline;">Hantera bevakningar</a>
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
