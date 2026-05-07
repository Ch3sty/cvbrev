// src/lib/email/confirmation-email-generator.ts
// Genererar professionella HTML-e-postmallar för e-postbekräftelse

export interface ConfirmationEmailData {
  userEmail: string;
  userName: string;
  confirmationUrl: string;
  isInvitation?: boolean;
  inviterName?: string;
}

export function generateConfirmationEmailHTML(data: ConfirmationEmailData): string {
  const { userName, confirmationUrl, isInvitation, inviterName } = data;

  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bekräfta din e-postadress - Jobbcoach.ai</title>
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
                Välkommen till Jobbcoach.ai!
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 400;">
                Vi behöver bara bekräfta din e-postadress
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
                      <span style="color: white; font-size: 36px;">✉️</span>
                    </div>

                    <h2 style="color: #131B32; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
                      Hej ${userName}!
                    </h2>

                    ${isInvitation && inviterName ? `
                    <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #E2E8F0;">
                      <p style="color: #475569; font-size: 16px; margin: 0; line-height: 1.6;">
                        <span style="font-weight: 600; color: #E9457A;">${inviterName}</span> har bjudit in dig att prova
                        Jobbcoach.ai Premium gratis i 7 dagar!
                      </p>
                    </div>
                    ` : ''}

                    <p style="color: #64748b; font-size: 17px; line-height: 1.6; margin: 0 0 35px 0;">
                      ${isInvitation
                        ? 'Klicka på knappen nedan för att bekräfta din e-postadress och aktivera din gratis Premium-period.'
                        : 'Tack för att du registrerat dig! Klicka på knappen nedan för att bekräfta din e-postadress och komma igång.'}
                    </p>

                    <!-- CTA Button -->
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${confirmationUrl}" style="height:56px;v-text-anchor:middle;width:280px;" arcsize="20%" strokecolor="#E9457A" fillcolor="#E9457A">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:18px;font-weight:bold;">Bekräfta e-postadress</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${confirmationUrl}" style="display: inline-block; text-decoration: none; background: linear-gradient(135deg, #E9457A 0%, #9333EA 100%); color: #ffffff; padding: 18px 45px; border-radius: 12px; font-size: 18px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 15px rgba(233, 69, 122, 0.3);">
                      Bekräfta e-postadress →
                    </a>
                    <!--<![endif]-->

                    <!-- Alternative Link -->
                    <p style="color: #94a3b8; font-size: 14px; margin: 30px 0 0 0;">
                      Problem med knappen? Kopiera och klistra in denna länk i din webbläsare:
                    </p>
                    <p style="color: #64748b; font-size: 13px; margin: 10px 0 0 0; word-break: break-all;">
                      <a href="${confirmationUrl}" style="color: #E9457A; text-decoration: underline;">
                        ${confirmationUrl}
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${isInvitation ? `
          <!-- Premium Features for Invitation -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 35px 40px; border-top: 1px solid #E2E8F0;" class="mobile-padding">
              <h3 style="color: #131B32; font-size: 20px; margin: 0 0 20px 0; font-weight: 600; text-align: center;">
                Vad ingår i din Premium-provperiod?
              </h3>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
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
                            <strong>Smart kompetensanalys</strong> som visar vad du behöver utveckla
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

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
                      © 2024 Jobbcoach.ai • Denna länk är giltig i 24 timmar
                    </p>
                    <p style="color: #64748b; font-size: 13px; margin: 8px 0 0 0;">
                      <a href="https://www.jobbcoach.ai" style="color: #E9457A; text-decoration: none;">jobbcoach.ai</a>
                      ${' | '}
                      <a href="mailto:support@jobbcoach.ai" style="color: #E9457A; text-decoration: none;">support@jobbcoach.ai</a>
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
export function generateConfirmationEmailText(data: ConfirmationEmailData): string {
  const { userName, confirmationUrl, isInvitation, inviterName } = data;

  if (isInvitation && inviterName) {
    return `
Välkommen till Jobbcoach.ai!

Hej ${userName}!

${inviterName} har bjudit in dig att prova Jobbcoach.ai Premium gratis i 7 dagar!

För att aktivera ditt konto och din gratis Premium-period, bekräfta din e-postadress genom att klicka på länken nedan:

${confirmationUrl}

VAD INGÅR I DIN PREMIUM-PROVPERIOD?

✓ Obegränsade AI-genererade personliga brev anpassade för varje jobb
✓ Professionella CV-mallar som får dig att sticka ut
✓ Smart kompetensanalys som visar vad du behöver utveckla
✓ Personlig karriärvägledning med AI
✓ Ingen bindningstid eller kreditkort krävs

Länken är giltig i 24 timmar.

Har du problem? Kontakta oss på support@jobbcoach.ai

---
Jobbcoach.ai - Din partner för en framgångsrik karriär
© 2024 Jobbcoach.ai
jobbcoach.ai
    `;
  }

  return `
Välkommen till Jobbcoach.ai!

Hej ${userName}!

Tack för att du registrerat dig! För att komma igång behöver du bekräfta din e-postadress.

Klicka på länken nedan för att bekräfta:

${confirmationUrl}

Länken är giltig i 24 timmar.

Har du problem? Kontakta oss på support@jobbcoach.ai

---
Jobbcoach.ai - Din partner för en framgångsrik karriär
© 2024 Jobbcoach.ai
jobbcoach.ai
  `;
}