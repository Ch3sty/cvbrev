// src/lib/email/trial-reminder.ts
// =================================
// Email påminnelse för användare som hoppade av efter Steg 1
// Skickas 24h efter signup om de inte slutfört betalning

export function generateTrialReminderEmail(email: string, resumeUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Du är nästan klar!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <div style="font-size: 48px; margin-bottom: 12px;">⏰</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Du är nästan klar!
              </h1>
              <p style="margin: 12px 0 0 0; color: #fef3c7; font-size: 16px;">
                Slutför din registrering och få 7 dagar gratis Premium
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
                Vi märkte att du påbörjade din registrering för <strong>Jobbcoach.ai Premium</strong> men inte slutförde den. Det tar bara en minut att komma igång!
              </p>

              <p style="margin: 0 0 32px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                Ditt konto är skapat och väntar på dig – du behöver bara lägga till betalningsuppgifter för att aktivera din <strong>7-dagars gratisperiod</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resumeUrl}" style="display: inline-block; padding: 18px 36px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 18px; border-radius: 12px;">
                      Slutför min registrering →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Benefits reminder -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 16px 0; color: #065f46; font-size: 18px; font-weight: bold;">
                      ✨ Vad du får tillgång till:
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 15px; line-height: 1.8;">
                      <li><strong>Obegränsade CV:n</strong> med professionella mallar</li>
                      <li><strong>AI-genererade personliga brev</strong> för varje ansökan</li>
                      <li><strong>12 premiummallar</strong> som sticker ut</li>
                      <li><strong>ATS-optimering</strong> för bättre träffar</li>
                      <li><strong>XP-system</strong> med badges och achievements</li>
                      <li><strong>Prioriterad support</strong></li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Trial terms -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: bold;">
                      💡 Så fungerar det:
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.6;">
                      <li style="margin-bottom: 8px;"><strong>0 kr de första 7 dagarna</strong> – testa allt utan kostnad</li>
                      <li style="margin-bottom: 8px;">Efter trial: <strong>149 kr/månad</strong></li>
                      <li style="margin-bottom: 8px;">Avsluta när som helst – inga bindningar</li>
                      <li>Vi debiterar inte förrän dag 8</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                Vänliga hälsningar,<br>
                <strong>Jobbcoach.ai-teamet</strong>
              </p>

              <p style="margin: 0; color: #64748b; font-size: 14px; font-style: italic;">
                P.S. Denna länk är giltig i 48 timmar. Efter det behöver du registrera dig på nytt.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                Vill du inte ha påminnelser?
                <a href="https://www.jobbcoach.ai" style="color: #2563eb; text-decoration: none;">Avprenumerera</a>
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
