// src/lib/email/invitation-email-generator.ts
// Genererar professionella HTML-e-postmallar för gästinbjudningar

export interface InvitationEmailData {
  inviterName: string;
  guestEmail: string;
  personalMessage?: string;
  inviteUrl: string;
  invitationCode: string;
}

export function generateInvitationEmailHTML(data: InvitationEmailData): string {
  const { inviterName, personalMessage, inviteUrl } = data;

  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Du har blivit inbjuden till Jobbcoach.ai Premium!</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 60px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0 0 20px 0; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Jobbcoach.ai Premium
              </h1>
              <div style="background: rgba(255,255,255,0.2); border-radius: 100px; padding: 12px 24px; display: inline-block; backdrop-filter: blur(10px);">
                <p style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 600;">
                  7 DAGARS KOSTNADSFRI TILLGÅNG
                </p>
              </div>
            </td>
          </tr>

          <!-- Personal Invitation Message -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h2 style="color: #1e1b4b; font-size: 24px; margin: 0 0 16px 0; font-weight: 600;">
                ${inviterName} har bjudit in dig!
              </h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0;">
                Du har fått en exklusiv inbjudan att prova Jobbcoach.ai Premium helt kostnadsfritt i 7 dagar.
                Upptäck hur AI kan accelerera din karriär och hjälpa dig nå dina yrkesmål.
              </p>
            </td>
          </tr>

          ${personalMessage ? `
          <!-- Personal Message Box -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f3e7fc 0%, #fce7f3 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #6b21a8; font-size: 16px; font-style: italic; line-height: 1.5; margin: 0;">
                      "${personalMessage}"
                    </p>
                    <p style="color: #9333ea; font-size: 14px; margin: 12px 0 0 0; font-weight: 600;">
                      — ${inviterName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Features Section -->
          <tr>
            <td style="padding: 30px 40px;">
              <h3 style="color: #1e1b4b; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">
                Vad ingår i Premium?
              </h3>

              <!-- Feature List -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; line-height: 24px;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #334155; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>Obegränsade AI-genererade brev</strong> - Skräddarsydda för varje ansökan
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; line-height: 24px;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #334155; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>Professionella CV-mallar</strong> - Designade för svenska arbetsmarknaden
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; line-height: 24px;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #334155; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>AI-driven CV-analys</strong> - Få feedback och förbättringsförslag
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; line-height: 24px;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #334155; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>1.5x snabbare XP-intjäning</strong> - Lås upp belöningar snabbare
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; line-height: 24px;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #334155; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>Personlig karriärvägledning</strong> - AI-coach för din utveckling
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center;">
              <a href="${inviteUrl}" style="display: inline-block; text-decoration: none;">
                <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 12px; padding: 18px 48px; text-align: center;">
                      <span style="color: #ffffff; font-size: 18px; font-weight: 600; text-decoration: none;">
                        Aktivera Premium Nu →
                      </span>
                    </td>
                  </tr>
                </table>
              </a>
              <p style="color: #94a3b8; font-size: 14px; margin: 20px 0 0 0;">
                Ingen betalningsinformation krävs • Avslutas automatiskt efter 7 dagar
              </p>
            </td>
          </tr>

          <!-- Reward Info -->
          <tr>
            <td style="background: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <h4 style="color: #64748b; font-size: 14px; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Win-Win Erbjudande
                    </h4>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
                      När du blir en betalande Premium-medlem får ${inviterName} en månads extra Premium och 500 XP som tack för rekommendationen!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #1e1b4b; padding: 30px 40px; text-align: center;">
              <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 8px 0;">
                Jobbcoach.ai - Din AI-drivna karriärpartner
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © 2024 Jobbcoach.ai. Alla rättigheter förbehållna.
              </p>
              <p style="color: #64748b; font-size: 12px; margin: 16px 0 0 0;">
                Inbjudan giltig i 30 dagar • <a href="https://jobbcoach.ai" style="color: #ec4899; text-decoration: none;">jobbcoach.ai</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Generera en enklare textversion för e-postklienter som inte stödjer HTML
export function generateInvitationEmailText(data: InvitationEmailData): string {
  const { inviterName, personalMessage, inviteUrl } = data;

  return `
Du har blivit inbjuden till Jobbcoach.ai Premium!

${inviterName} har bjudit in dig att prova Jobbcoach.ai Premium helt kostnadsfritt i 7 dagar.

${personalMessage ? `Personligt meddelande från ${inviterName}:\n"${personalMessage}"\n\n` : ''}

VAD INGÅR I PREMIUM?
✓ Obegränsade AI-genererade personliga brev
✓ Professionella CV-mallar
✓ AI-driven CV-analys och feedback
✓ 1.5x snabbare XP-intjäning
✓ Personlig karriärvägledning med AI

Aktivera din Premium-tillgång här:
${inviteUrl}

Ingen betalningsinformation krävs. Avslutas automatiskt efter 7 dagar.

När du blir en betalande Premium-medlem får ${inviterName} en månads extra Premium och 500 XP som tack!

Med vänliga hälsningar,
Jobbcoach.ai-teamet

© 2024 Jobbcoach.ai. Alla rättigheter förbehållna.
Inbjudan giltig i 30 dagar.
  `;
}