'use client'

/**
 * "Öppna råtext i nytt fönster" från gamla Mina CV, flyttad hit oförändrad
 * i utseende (Byt CV-arket, Råtext). Texten escapas nu innan den skrivs in.
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function oppnaRatext(cv: { namn: string; skapad: string; cvText?: string | null }): void {
  const f = window.open('', '_blank', 'width=900,height=700')
  if (!f) return
  const namn = esc(cv.namn || 'CV')
  const datum = cv.skapad
    ? new Date(cv.skapad).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'okänt datum'
  const text = cv.cvText ? esc(cv.cvText).replace(/\n/g, '<br />') : 'Inget CV-innehåll tillgängligt'
  f.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>${namn} - Jobbcoach.ai</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; padding: 0; margin: 0; line-height: 1.7; background: #FAFAFA; color: #171717; min-height: 100dvh; }
      .header { background: #FFFFFF; border-bottom: 1px solid #E5E5E5; color: #171717; padding: 24px 40px; }
      .header h1 { margin: 0 0 8px 0; font-size: 20px; font-weight: 600; }
      .header .meta { color: #525252; font-size: 14px; display: flex; align-items: center; gap: 8px; }
      .content { max-width: 850px; margin: 32px auto; padding: 0 24px; }
      .cv-container { background: white; padding: 48px; border-radius: 12px; border: 1px solid #E5E5E5; white-space: pre-line; font-size: 15px; }
      .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 13px; }
      .footer a { color: #C2410C; text-decoration: none; font-weight: 500; }
      .footer a:hover { text-decoration: underline; }
      @media print { .header, .footer { display: none; } body { background: white; } .cv-container { box-shadow: none; border-radius: 0; padding: 0; } }
    </style>
  </head>
  <body>
    <div class="header"><h1>${namn}</h1><div class="meta">Uppladdad: ${datum}</div></div>
    <div class="content"><div class="cv-container">${text}</div></div>
    <div class="footer"><a href="https://www.jobbcoach.ai" target="_blank">jobbcoach.ai</a> · din karriärcoach</div>
  </body>
</html>`)
  f.document.close()
}
