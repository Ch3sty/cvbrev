// src/lib/email/trial-welcome-generator.ts
// ========================================
// Email template generator for trial welcome emails
// Generates both HTML and plain text versions

interface TrialWelcomeEmailData {
  email: string
  loginUrl: string
  userName?: string
}

export function generateTrialWelcomeHTML(data: TrialWelcomeEmailData): string {
  const { loginUrl, userName } = data

  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Välkommen till Jobbcoach.ai Premium!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #334155;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); overflow: hidden;">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #db2777 0%, #9333ea 100%); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.2;">
                🎉 Välkommen till Premium!
              </h1>
              <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; line-height: 1.5;">
                Din 7-dagars gratisperiod har startat
              </p>
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding: 40px 32px;">
              ${userName ? `<p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">Hej ${userName}!</p>` : ''}

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                Tack för att du registrerade dig för Jobbcoach.ai Premium! 🚀
              </p>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                Du har nu tillgång till alla våra premiumfunktioner i <strong>7 dagar helt gratis</strong>. Klicka på knappen nedan för att logga in och komma igång direkt:
              </p>

              <!-- Login button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(to right, #db2777, #9333ea); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);">
                      Logga in till Premium
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Premium features -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 0 0 24px 0; border-left: 4px solid #db2777;">
                <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1e293b;">
                  Det här ingår i Premium:
                </h2>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 15px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">✨ <strong>Obegränsade CV:n</strong> – Skapa så många professionella CV:n du behöver</li>
                  <li style="margin-bottom: 8px;">📝 <strong>Obegränsade personliga brev</strong> – AI-genererade brev för varje ansökan</li>
                  <li style="margin-bottom: 8px;">🎨 <strong>12 premiummallar</strong> – Exklusiva designer för att sticka ut</li>
                  <li style="margin-bottom: 8px;">🤖 <strong>AI-optimering</strong> – Få intelligenta förbättringsförslag</li>
                  <li style="margin-bottom: 8px;">🎯 <strong>ATS-anpassning</strong> – Optimera för rekryteringssystem</li>
                  <li style="margin-bottom: 8px;">🎮 <strong>Gamification</strong> – Samla XP, badges och lås upp achievements</li>
                  <li style="margin-bottom: 8px;">📊 <strong>Avancerad statistik</strong> – Följ din jobbsökningsresa</li>
                </ul>
              </div>

              <!-- Important note -->
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 0 0 24px 0; border-left: 3px solid #f59e0b;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #78350f;">
                  ⚡ <strong>OBS:</strong> Denna inloggningslänk är giltig i 1 timme och kan endast användas en gång. Om länken har gått ut kan du begära en ny från inloggningssidan.
                </p>
              </div>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                Efter din gratisperiod fortsätter ditt Premium-konto automatiskt för endast <strong>149 kr/månad</strong>. Du kan när som helst avbryta i dina kontoinställningar.
              </p>

              <p style="margin: 0 0 8px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                Lycka till med jobbsökandet! 💪
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #334155;">
                <strong>Jobbcoach.ai-teamet</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Om du inte begärde detta konto kan du ignorera detta mejl.
              </p>
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                <a href="https://www.jobbcoach.ai" style="color: #db2777; text-decoration: none;">www.jobbcoach.ai</a> |
                <a href="https://www.jobbcoach.ai/integritetspolicy" style="color: #64748b; text-decoration: none;">Integritetspolicy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function generateTrialWelcomeText(data: TrialWelcomeEmailData): string {
  const { loginUrl, userName } = data

  return `
🎉 Välkommen till Jobbcoach.ai Premium!

${userName ? `Hej ${userName}!` : 'Hej!'}

Tack för att du registrerade dig för Jobbcoach.ai Premium! 🚀

Du har nu tillgång till alla våra premiumfunktioner i 7 dagar helt gratis.

LOGGA IN HÄR:
${loginUrl}

DET HÄR INGÅR I PREMIUM:

✨ Obegränsade CV:n – Skapa så många professionella CV:n du behöver
📝 Obegränsade personliga brev – AI-genererade brev för varje ansökan
🎨 12 premiummallar – Exklusiva designer för att sticka ut
🤖 AI-optimering – Få intelligenta förbättringsförslag
🎯 ATS-anpassning – Optimera för rekryteringssystem
🎮 Gamification – Samla XP, badges och lås upp achievements
📊 Avancerad statistik – Följ din jobbsökningsresa

⚡ OBS: Denna inloggningslänk är giltig i 1 timme och kan endast användas en gång.

Efter din gratisperiod fortsätter ditt Premium-konto automatiskt för endast 149 kr/månad. Du kan när som helst avbryta i dina kontoinställningar.

Lycka till med jobbsökandet! 💪

Jobbcoach.ai-teamet

---
Om du inte begärde detta konto kan du ignorera detta mejl.
www.jobbcoach.ai | Integritetspolicy: https://www.jobbcoach.ai/integritetspolicy
`
}
