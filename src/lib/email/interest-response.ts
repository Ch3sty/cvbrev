// src/lib/email/interest-response.ts
// Mail till REKRYTERAREN när en kandidat svarat på en intresseförfrågan.
// Vid accept: uppmuntra att ta dialogen i appen. Vid avböj: kort och neutralt.
// Samma visuella språk som övriga mail (gradient-strip, J-logga, tabellayout).

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateInterestResponseEmail(params: {
  accepted: boolean;
  candidateName: string;
}): { subject: string; html: string } {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';
  const ctaUrl = `${base}/rekryterare/inbox`;
  const name = escapeHtml(params.candidateName.trim() || 'En kandidat');

  const subject = params.accepted
    ? 'En kandidat tackade ja till er kontakt'
    : 'En kandidat avböjde er intresseförfrågan';
  const eyebrow = params.accepted ? 'Kontakt upplåst' : 'Svar mottaget';
  const heading = params.accepted
    ? `${params.candidateName.trim() || 'En kandidat'} tackade ja`
    : 'En kandidat tackade nej';
  const bodyText = params.accepted
    ? `<strong style="color:#0F172A;">${name}</strong> har accepterat er intresseförfrågan. Ni kan nu se kontaktuppgifterna och ta dialogen direkt i portalen.`
    : 'En kandidat har avböjt er intresseförfrågan. Profilen förblir anonym. Det finns gott om fler kandidater i poolen som väntar på rätt roll.';
  const ctaLabel = params.accepted ? 'Öppna dialogen' : 'Tillbaka till poolen';
  const preheader = params.accepted
    ? 'Kandidaten sa ja. Ta dialogen i portalen.'
    : 'Kandidaten tackade nej. Fler väntar i poolen.';

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

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background-color:#EA580C;background:linear-gradient(135deg,#F97316 0%,#DC2626 55%,#BE185D 100%);border-radius:9px;width:36px;height:36px;text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:21px;font-weight:900;color:#ffffff;line-height:36px;">J</td>
            <td style="padding-left:10px;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:900;letter-spacing:-0.3px;color:#0F172A;">Jobbcoach<span style="color:#94A3B8;">.ai</span></td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #FED7AA;overflow:hidden;">
          <tr>
            <td height="5" style="background:#F97316;background:linear-gradient(90deg,#FB923C 0%,#DC2626 60%,#BE185D 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px 32px;">
              <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#EA580C;">${eyebrow}</p>
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.3;font-weight:800;color:#0F172A;">${escapeHtml(heading)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 32px 4px 32px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#475569;">${bodyText}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 32px 30px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#EA580C;background:linear-gradient(135deg,#F97316,#DC2626);border-radius:12px;">
                    <a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">${ctaLabel}&nbsp;&nbsp;&rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:22px 24px 8px 24px;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#B45309;">
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
