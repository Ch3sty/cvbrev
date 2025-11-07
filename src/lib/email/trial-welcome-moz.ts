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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f7;">
    <tr>
      <td align="center" style="padding: 30px 15px;">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">

          <!-- Header with gradient -->
          <tr>
            <td style="background-color: #E9457A; background-image: linear-gradient(135deg, #E9457A 0%, #9333EA 100%); padding: 50px 40px; text-align: center;" class="mobile-padding">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0 0 10px 0; font-weight: 700; line-height: 1.2;" class="mobile-text">
                Välkommen till Premium!
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 400;">
                Din 7-dagars provperiod har startat
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 45px 40px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #E9457A 0%, #9333EA 100%); border-radius: 50%; margin: 0 auto 30px auto; display: flex; align-items: center; justify-content: center; line-height: 80px;">
                      <span style="color: white; font-size: 36px;">🎉</span>
                    </div>

                    <h2 style="color: #131B32; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
                      Tack för att du valde Jobbcoach.ai!
                    </h2>

                    <p style="color: #64748b; font-size: 17px; line-height: 1.6; margin: 0 0 35px 0;">
                      Du har nu tillgång till alla våra premiumfunktioner i <strong>7 dagar helt gratis</strong>. Din instrumentpanel väntar på dig!
                    </p>

                    <!-- CTA Button -->
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.jobbcoach.ai/dashboard" style="height:56px;v-text-anchor:middle;width:280px;" arcsize="20%" strokecolor="#E9457A" fillcolor="#E9457A">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:18px;font-weight:bold;">Gå till instrumentpanelen →</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="https://www.jobbcoach.ai/dashboard" style="display: inline-block; text-decoration: none; background: linear-gradient(135deg, #E9457A 0%, #9333EA 100%); color: #ffffff; padding: 18px 45px; border-radius: 12px; font-size: 18px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 15px rgba(233, 69, 122, 0.3);" class="mobile-button">
                      Gå till instrumentpanelen →
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Features list -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 35px 40px; border-top: 1px solid #E2E8F0;" class="mobile-padding">
              <h3 style="color: #131B32; font-size: 20px; margin: 0 0 20px 0; font-weight: 600; text-align: center;">
                Vad ingår i Premium?
              </h3>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <!-- Feature 1 -->
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 36px; vertical-align: top;">
                          <div style="width: 28px; height: 28px; background-color: #E9457A; border-radius: 8px; line-height: 28px; text-align: center;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>Obegränsade AI-genererade personliga brev</strong> anpassade för varje jobb
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Feature 2 -->
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 36px; vertical-align: top;">
                          <div style="width: 28px; height: 28px; background-color: #E9457A; border-radius: 8px; line-height: 28px; text-align: center;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>Professionella CV-mallar</strong> som får dig att sticka ut
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Feature 3 -->
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 36px; vertical-align: top;">
                          <div style="width: 28px; height: 28px; background-color: #E9457A; border-radius: 8px; line-height: 28px; text-align: center;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>CV-analys med ATS-optimering</strong> som förbättrar dina chanser
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Feature 4 -->
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 36px; vertical-align: top;">
                          <div style="width: 28px; height: 28px; background-color: #E9457A; border-radius: 8px; line-height: 28px; text-align: center;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>AI-driven jobbmatchning</strong> baserad på dina kompetenser
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Feature 5 -->
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 36px; vertical-align: top;">
                          <div style="width: 28px; height: 28px; background-color: #E9457A; border-radius: 8px; line-height: 28px; text-align: center;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>Kompetensanalys</strong> som visar vad du behöver utveckla
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Feature 6 -->
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 36px; vertical-align: top;">
                          <div style="width: 28px; height: 28px; background-color: #E9457A; border-radius: 8px; line-height: 28px; text-align: center;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>Kognitiva tester</strong> för att öva inför intervjuer
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Feature 7 -->
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 36px; vertical-align: top;">
                          <div style="width: 28px; height: 28px; background-color: #E9457A; border-radius: 8px; line-height: 28px; text-align: center;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.5;">
                            <strong>Prioriterad support</strong> – få hjälp när du behöver det
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Important info box -->
          <tr>
            <td style="padding: 35px 40px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: bold;">
                      📅 Viktigt att veta
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.6;">
                      <li style="margin-bottom: 8px;">Ingen kostnad de första 7 dagarna</li>
                      <li style="margin-bottom: 8px;">Efter provperiod: 149 kr/månad</li>
                      <li style="margin-bottom: 8px;">Avsluta när som helst - inga bindningar</li>
                      <li>Du kan hantera din prenumeration i <a href="https://www.jobbcoach.ai/dashboard/profil/prenumeration" style="color: #2563eb; text-decoration: none;">kontoinställningar</a></li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 16px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                Lycka till med jobbsökandet! 💪
              </p>

              <p style="margin: 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                Vänliga hälsningar,<br>
                <strong style="color: #475569;">Jobbcoach.ai-teamet</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #131B32; padding: 35px 40px; text-align: center;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <h4 style="color: #ffffff; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">
                      Jobbcoach.ai
                    </h4>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px 0;">
                      Din partner för en framgångsrik karriär
                    </p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                      Behöver du hjälp? Kontakta oss på
                      <a href="mailto:support@jobbcoach.ai" style="color: #E9457A; text-decoration: none;">support@jobbcoach.ai</a>
                    </p>
                    <p style="color: #64748b; font-size: 12px; margin: 16px 0 0 0;">
                      © 2025 Jobbcoach.ai. Alla rättigheter förbehållna.
                    </p>
                  </td>
                </tr>
              </table>
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
