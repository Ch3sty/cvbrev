// src/lib/email/trial-welcome-moz.ts
// ====================================
// Email template för Moz-stil trial welcome
// Skickas efter lyckad betalning, användaren är redan inloggad

export function generateTrialWelcomeEmailMoz(email: string): string {
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Välkommen till Jobbcoach.ai Premium!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                🎉 Välkommen till Premium!
              </h1>
              <p style="margin: 12px 0 0 0; color: #e0e7ff; font-size: 18px;">
                Din 7-dagars gratisperiod har startat
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                Hej!
              </p>

              <p style="margin: 0 0 24px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                Tack för att du registrerade dig för <strong>Jobbcoach.ai Premium</strong>! 🚀
              </p>

              <p style="margin: 0 0 32px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                Du har nu tillgång till alla våra premiumfunktioner i <strong>7 dagar helt gratis</strong>. Din instrumentpanel väntar på dig!
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.jobbcoach.ai/dashboard" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 12px;">
                      Gå till instrumentpanelen
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Features list -->
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 20px; font-weight: bold;">
                Det här ingår i Premium:
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 20px; margin-right: 12px;">✓</span>
                    <span style="color: #334155; font-size: 15px;"><strong>Obegränsade professionella CV:n</strong> – Skapa så många du behöver</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 20px; margin-right: 12px;">✓</span>
                    <span style="color: #334155; font-size: 15px;"><strong>AI-genererade personliga brev</strong> – För varje ansökan</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 20px; margin-right: 12px;">✓</span>
                    <span style="color: #334155; font-size: 15px;"><strong>12 exklusiva premiummallar</strong> – Designer som sticker ut</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 20px; margin-right: 12px;">✓</span>
                    <span style="color: #334155; font-size: 15px;"><strong>ATS-optimering</strong> – Bättre träffar i rekryteringssystem</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 20px; margin-right: 12px;">✓</span>
                    <span style="color: #334155; font-size: 15px;"><strong>XP-system med badges</strong> – Achievements medan du söker jobb</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 20px; margin-right: 12px;">✓</span>
                    <span style="color: #334155; font-size: 15px;"><strong>Avancerad statistik</strong> – Följ din jobbsökningsresa</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 20px; margin-right: 12px;">✓</span>
                    <span style="color: #334155; font-size: 15px;"><strong>Prioriterad support</strong> – Få hjälp när du behöver det</span>
                  </td>
                </tr>
              </table>

              <!-- Important info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: bold;">
                      📅 Viktigt att veta
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.6;">
                      <li style="margin-bottom: 8px;">Ingen kostnad de första 7 dagarna</li>
                      <li style="margin-bottom: 8px;">Efter trial: 149 kr/månad</li>
                      <li style="margin-bottom: 8px;">Avsluta när som helst - inga bindningar</li>
                      <li>Du kan hantera din prenumeration i <a href="https://www.jobbcoach.ai/dashboard/profil/prenumeration" style="color: #2563eb; text-decoration: none;">kontoinställningar</a></li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                Lycka till med jobbsökandet! 💪
              </p>

              <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.6;">
                Vänliga hälsningar,<br>
                <strong>Jobbcoach.ai-teamet</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                Behöver du hjälp? Kontakta oss på
                <a href="mailto:support@jobbcoach.ai" style="color: #2563eb; text-decoration: none;">support@jobbcoach.ai</a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © 2025 Jobbcoach.ai. Alla rättigheter förbehållna.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
