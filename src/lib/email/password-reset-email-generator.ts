// src/lib/email/password-reset-email-generator.ts
// Genererar professionella HTML-e-postmallar fÃ¶r lÃ¶senordsÃ¥terstÃ¤llning

export interface PasswordResetEmailData {
  userEmail: string;
  userName: string;
  resetUrl: string;
}

export function generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
  const { userName, resetUrl } = data;

  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ã…terstÃ¤ll ditt lÃ¶senord - Jobbcoach.ai</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style type="text/css">
    table {border-collapse: collapse;}
    td {padding: 0;}
    a {color: #E9457A !important;}
  </style>
  <![endif]-->
  <style>
    @media screen and (max-width: 600px) {
      .mobile-padding { padding: 20px !important; }
      .mobile-text { font-size: 16px !important; }
      .mobile-button { padding: 16px 32px !important; font-size: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f7; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f7;">
    <tr>
      <td align="center" style="padding: 30px 15px;">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">

          <!-- Header Section -->
          <tr>
            <td style="background-color: #E9457A; background-image: linear-gradient(135deg, #E9457A 0%, #9333EA 100%); padding: 50px 40px; text-align: center;" class="mobile-padding">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0 0 10px 0; font-weight: 700; line-height: 1.2;" class="mobile-text">
                Ã…terstÃ¤ll ditt lÃ¶senord
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 400;">
                Vi hjÃ¤lper dig att komma tillbaka till ditt konto
              </p>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 45px 40px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #E9457A 0%, #9333EA 100%); border-radius: 50%; margin: 0 auto 30px auto; display: flex; align-items: center; justify-content: center; line-height: 80px;">
                      <span style="color: white; font-size: 36px;">ðŸ”’</span>
                    </div>

                    <h2 style="color: #131B32; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
                      Hej ${userName}!
                    </h2>

                    <p style="color: #475569; font-size: 16px; margin: 0 0 25px 0; line-height: 1.6;">
                      Vi har tagit emot en begÃ¤ran om att Ã¥terstÃ¤lla lÃ¶senordet fÃ¶r ditt Jobbcoach.ai-konto.
                      Om du inte gjorde denna begÃ¤ran kan du ignorera detta mejl.
                    </p>

                    <p style="color: #475569; font-size: 16px; margin: 0 0 35px 0; line-height: 1.6;">
                      Klicka pÃ¥ knappen nedan fÃ¶r att vÃ¤lja ett nytt lÃ¶senord:
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding: 0 0 35px 0;">
                          <a href="${resetUrl}" style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #E9457A 0%, #9333EA 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; box-shadow: 0 10px 30px rgba(233, 69, 122, 0.3); transition: all 0.3s ease;" class="mobile-button">
                            Ã…terstÃ¤ll mitt lÃ¶senord
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Important Info Box -->
                    <div style="background-color: #FEF3C7; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #F59E0B; text-align: left;">
                      <p style="color: #92400E; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                        âš ï¸ Viktigt att veta:
                      </p>
                      <ul style="color: #92400E; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                        <li>LÃ¤nken Ã¤r giltig i 60 minuter</li>
                        <li>Om du inte begÃ¤rde detta, ignorera mejlet</li>
                        <li>Ditt nuvarande lÃ¶senord fungerar fortfarande tills du vÃ¤ljer ett nytt</li>
                      </ul>
                    </div>

                    <!-- Alternative Link -->
                    <p style="color: #64748B; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">
                      Om knappen inte fungerar, kopiera och klistra in denna lÃ¤nk i din webblÃ¤sare:
                    </p>

                    <div style="background-color: #F8FAFC; border-radius: 8px; padding: 15px; margin-bottom: 25px; border: 1px solid #E2E8F0; word-break: break-all;">
                      <a href="${resetUrl}" style="color: #E9457A; text-decoration: none; font-size: 13px;">
                        ${resetUrl}
                      </a>
                    </div>

                    <!-- Security Tip -->
                    <div style="background-color: #DBEAFE; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #3B82F6; text-align: left;">
                      <p style="color: #1E40AF; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                        ðŸ’¡ Tips fÃ¶r ett sÃ¤kert lÃ¶senord:
                      </p>
                      <ul style="color: #1E3A8A; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                        <li>Minst 8 tecken lÃ¥ngt</li>
                        <li>Blanda stora och smÃ¥ bokstÃ¤ver</li>
                        <li>Inkludera siffror och specialtecken</li>
                        <li>AnvÃ¤nd inte samma lÃ¶senord pÃ¥ flera sajter</li>
                      </ul>
                    </div>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 35px 40px; text-align: center; border-top: 1px solid #E2E8F0;" class="mobile-padding">
              <p style="color: #64748B; font-size: 14px; margin: 0 0 15px 0; line-height: 1.6;">
                <strong style="color: #475569;">Jobbcoach.ai</strong> - Din AI-drivna karriÃ¤rpartner
              </p>

              <p style="color: #94A3B8; font-size: 13px; margin: 0 0 15px 0; line-height: 1.6;">
                Detta Ã¤r ett automatiskt mejl. Svara inte pÃ¥ detta meddelande.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 15px 0 0 0;">
                    <a href="https://www.jobbcoach.ai" style="color: #E9457A; text-decoration: none; font-size: 14px; margin: 0 15px; font-weight: 500;">
                      Hemsida
                    </a>
                    <span style="color: #CBD5E1;">|</span>
                    <a href="https://www.jobbcoach.ai/support" style="color: #E9457A; text-decoration: none; font-size: 14px; margin: 0 15px; font-weight: 500;">
                      Support
                    </a>
                    <span style="color: #CBD5E1;">|</span>
                    <a href="https://www.jobbcoach.ai/privacy" style="color: #E9457A; text-decoration: none; font-size: 14px; margin: 0 15px; font-weight: 500;">
                      Integritet
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #CBD5E1; font-size: 12px; margin: 20px 0 0 0;">
                Â© ${new Date().getFullYear()} Jobbcoach.ai. Alla rÃ¤ttigheter fÃ¶rbehÃ¥llna.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generera vanlig text-version (fallback fÃ¶r email-klienter utan HTML-stÃ¶d)
export function generatePasswordResetEmailText(data: PasswordResetEmailData): string {
  const { userName, resetUrl } = data;

  return `
Ã…terstÃ¤ll ditt lÃ¶senord - Jobbcoach.ai

Hej ${userName}!

Vi har tagit emot en begÃ¤ran om att Ã¥terstÃ¤lla lÃ¶senordet fÃ¶r ditt Jobbcoach.ai-konto.

Om du inte gjorde denna begÃ¤ran kan du ignorera detta mejl. Ditt nuvarande lÃ¶senord fungerar fortfarande tills du vÃ¤ljer ett nytt.

FÃ¶r att Ã¥terstÃ¤lla ditt lÃ¶senord, besÃ¶k fÃ¶ljande lÃ¤nk:
${resetUrl}

LÃ¤nken Ã¤r giltig i 60 minuter.

Tips fÃ¶r ett sÃ¤kert lÃ¶senord:
- Minst 8 tecken lÃ¥ngt
- Blanda stora och smÃ¥ bokstÃ¤ver
- Inkludera siffror och specialtecken
- AnvÃ¤nd inte samma lÃ¶senord pÃ¥ flera sajter

BehÃ¶ver du hjÃ¤lp? Kontakta vÃ¥r support pÃ¥ https://www.jobbcoach.ai/support

Med vÃ¤nliga hÃ¤lsningar,
Jobbcoach.ai-teamet

--
Detta Ã¤r ett automatiskt mejl. Svara inte pÃ¥ detta meddelande.
Â© ${new Date().getFullYear()} Jobbcoach.ai. Alla rÃ¤ttigheter fÃ¶rbehÃ¥llna.
  `.trim();
}
