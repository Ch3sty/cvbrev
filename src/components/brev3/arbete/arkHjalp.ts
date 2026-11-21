/**
 * Arket före skrivandet: brevhuvudet i mallen, datumet och raderna
 * "Arbetsgivaren" och "Ansökan: tjänsten du söker" i dämpad text, inget mer
 * (BYGGSPEC avsnitt 7). Hälsningen, styckena och avslutet döljs.
 *
 * Ren strängfunktion: används av serversidan (första målningen) och av
 * klienten (när mallen eller arbetsgivaren byts).
 */
const DOLJ = '.brev-halsning,.brev-stycke,.brev-avslut{display:none!important}'
const DAMPA = '.brev-mottagare,.brev-mottagare *,.brev-arende{color:#A893A2!important}'

export function tomtArk(html: string, dampa: boolean): string {
  return html.replace('</head>', `<style>${DOLJ}${dampa ? DAMPA : ''}</style></head>`)
}
