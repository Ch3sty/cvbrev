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
  <title>Din exklusiva inbjudan till Jobbcoach.ai Premium!</title>
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
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">

          <!-- Header Section -->
          <tr>
            <td style="background-color: #E9457A; background-image: linear-gradient(135deg, #E9457A 0%, #9333EA 100%); padding: 50px 40px; text-align: center;" class="mobile-padding">
              <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 8px 20px; display: inline-block; margin-bottom: 24px;">
                <p style="color: #ffffff; font-size: 14px; margin: 0; font-weight: 600; letter-spacing: 0.5px;">
                  EXKLUSIV INBJUDAN
                </p>
              </div>
              <h1 style="color: #ffffff; font-size: 36px; margin: 0 0 16px 0; font-weight: 700; line-height: 1.2;" class="mobile-text">
                7 dagar gratis Premium
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 400;">
                Värd 149 kr - helt kostnadsfritt för dig
              </p>
            </td>
          </tr>

          <!-- Personal Invitation -->
          <tr>
            <td style="padding: 45px 40px 30px 40px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <div style="width: 60px; height: 60px; background-color: #E9457A; border-radius: 50%; margin: 0 auto 24px auto; line-height: 60px; text-align: center;">
                      <span style="color: white; font-size: 24px;">🎁</span>
                    </div>
                    <h2 style="color: #131B32; font-size: 28px; margin: 0 0 16px 0; font-weight: 700;">
                      ${inviterName} tänkte på dig!
                    </h2>
                    <p style="color: #64748b; font-size: 18px; line-height: 1.6; margin: 0 auto; max-width: 480px;">
                      Du har fått en personlig inbjudan att uppleva Sveriges mest avancerade karriärverktyg.
                      Helt kostnadsfritt i en hel vecka.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${personalMessage ? `
          <!-- Personal Message -->
          <tr>
            <td style="padding: 0 40px 30px 40px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border-radius: 16px; border: 2px solid #E2E8F0;">
                <tr>
                  <td style="padding: 30px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                      <span style="font-size: 24px;">💬</span>
                    </div>
                    <p style="color: #475569; font-size: 16px; font-style: italic; line-height: 1.6; margin: 0 0 16px 0; text-align: center;">
                      "${personalMessage}"
                    </p>
                    <p style="color: #E9457A; font-size: 14px; margin: 0; font-weight: 600; text-align: center;">
                      — ${inviterName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Benefits Section -->
          <tr>
            <td style="padding: 30px 40px;" class="mobile-padding">
              <h3 style="color: #131B32; font-size: 24px; margin: 0 0 30px 0; font-weight: 700; text-align: center;">
                Vad får du tillgång till?
              </h3>

              <!-- Benefits Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 16px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 50px; vertical-align: top;">
                          <div style="width: 40px; height: 40px; background-color: #E9457A; border-radius: 12px; line-height: 40px; text-align: center;">
                            <span style="color: white; font-size: 18px;">✉️</span>
                          </div>
                        </td>
                        <td style="padding-left: 16px; vertical-align: top;">
                          <h4 style="color: #131B32; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">
                            Personliga brev
                          </h4>
                          <p style="color: #64748b; font-size: 15px; margin: 0; line-height: 1.5;">
                            Vi matchar ditt CV mot jobbkrav för att automatiskt skapa ett världsklass personligt följebrev
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 16px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 50px; vertical-align: top;">
                          <div style="width: 40px; height: 40px; background-color: #E9457A; border-radius: 12px; line-height: 40px; text-align: center;">
                            <span style="color: white; font-size: 18px;">📄</span>
                          </div>
                        </td>
                        <td style="padding-left: 16px; vertical-align: top;">
                          <h4 style="color: #131B32; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">
                            Professionella CV-mallar
                          </h4>
                          <p style="color: #64748b; font-size: 15px; margin: 0; line-height: 1.5;">
                            Välj bara en design du gillar så skapar vi ditt färdiga CV på sekunder utan att du lyfter ett finger
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 16px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 50px; vertical-align: top;">
                          <div style="width: 40px; height: 40px; background-color: #E9457A; border-radius: 12px; line-height: 40px; text-align: center;">
                            <span style="color: white; font-size: 18px;">🎯</span>
                          </div>
                        </td>
                        <td style="padding-left: 16px; vertical-align: top;">
                          <h4 style="color: #131B32; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">
                            Smart CV-analys
                          </h4>
                          <p style="color: #64748b; font-size: 15px; margin: 0; line-height: 1.5;">
                            Vi matchar ditt CV mot din önskade roll för att identifiera kompetensluckor och föreslår relevanta kurser
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 16px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 50px; vertical-align: top;">
                          <div style="width: 40px; height: 40px; background-color: #E9457A; border-radius: 12px; line-height: 40px; text-align: center;">
                            <span style="color: white; font-size: 18px;">🚀</span>
                          </div>
                        </td>
                        <td style="padding-left: 16px; vertical-align: top;">
                          <h4 style="color: #131B32; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">
                            Personlig karriärvägledning
                          </h4>
                          <p style="color: #64748b; font-size: 15px; margin: 0; line-height: 1.5;">
                            Strategisk rådgivning för din karriärutveckling och nästa steg framåt
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Section -->
          <tr>
            <td style="padding: 40px 40px 50px 40px; text-align: center;" class="mobile-padding">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${inviteUrl}" style="height:60px;v-text-anchor:middle;width:280px;" arcsize="20%" strokecolor="#E9457A" fillcolor="#E9457A">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:sans-serif;font-size:19px;font-weight:bold;">Starta min gratisperiod →</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${inviteUrl}" style="display: inline-block; text-decoration: none; background-color: #E9457A; color: #ffffff; padding: 20px 50px; border-radius: 16px; font-size: 19px; font-weight: 700; letter-spacing: 0.3px;">
                Starta min gratisperiod →
              </a>
              <!--<![endif]-->

              <div style="margin-top: 24px;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">
                  ✓ Ingen betalningsinformation krävs
                </p>
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                  ✓ Avregistreras automatiskt efter 7 dagar
                </p>
              </div>
            </td>
          </tr>

          <!-- Reward Section -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 35px 40px; border-top: 1px solid #E2E8F0;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <div style="margin-bottom: 16px;">
                      <span style="font-size: 32px;">🎉</span>
                    </div>
                    <h4 style="color: #131B32; font-size: 18px; margin: 0 0 12px 0; font-weight: 600;">
                      Tack för att du sprider ordet!
                    </h4>
                    <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0; max-width: 400px; margin: 0 auto;">
                      När du blir Premium-medlem får ${inviterName} en hel månad extra Premium som tack för rekommendationen!
                    </p>
                  </td>
                </tr>
              </table>
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
                    <p style="color: #64748b; font-size: 13px; margin: 0;">
                      © 2024 Jobbcoach.ai • Inbjudan giltig i 30 dagar
                    </p>
                    <p style="color: #64748b; font-size: 13px; margin: 8px 0 0 0;">
                      <a href="https://jobbcoach.ai" style="color: #E9457A; text-decoration: none;">jobbcoach.ai</a>
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
  `;
}

// Generera en enklare textversion för e-postklienter som inte stödjer HTML
export function generateInvitationEmailText(data: InvitationEmailData): string {
  const { inviterName, personalMessage, inviteUrl } = data;

  return `
🎁 DIN EXKLUSIVA INBJUDAN TILL JOBBCOACH.AI PREMIUM

${inviterName} tänkte på dig!

Du har fått en personlig inbjudan att uppleva Sveriges mest avancerade karriärverktyg helt kostnadsfritt i 7 dagar.

Värd 149 kr - helt gratis för dig.

${personalMessage ? `💬 Personligt meddelande från ${inviterName}:\n"${personalMessage}"\n\n` : ''}

VAD FÅR DU TILLGÅNG TILL?

✉️ Personliga brev
Vi matchar ditt CV mot jobbkrav för att automatiskt skapa ett världsklass personligt följebrev

📄 Professionella CV-mallar
Välj bara en design du gillar så skapar vi ditt färdiga CV på sekunder utan att du lyfter ett finger

🎯 Smart CV-analys
Vi matchar ditt CV mot din önskade roll för att identifiera kompetensluckor och föreslå relevanta kurser

🚀 Personlig karriärvägledning
Strategisk rådgivning för din karriärutveckling och nästa steg framåt

👉 STARTA DIN GRATISPERIOD:
${inviteUrl}

✓ Ingen betalningsinformation krävs
✓ Avregistreras automatiskt efter 7 dagar

🎉 TACK FÖR ATT DU SPRIDER ORDET!
När du blir Premium-medlem får ${inviterName} en hel månad extra Premium som tack för rekommendationen!

---
Jobbcoach.ai - Din partner för en framgångsrik karriär
© 2024 Jobbcoach.ai • Inbjudan giltig i 30 dagar
jobbcoach.ai
  `;
}