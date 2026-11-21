/**
 * Brevets färdiga HTML för kolumnen content (BYGGSPEC avsnitt 3).
 *
 * content skrivs fortfarande, så att äldre kod, mejl och den publika
 * utkastvägen fungerar. Den räknas om på servern varje gång stycken, mall,
 * typsnitt eller brevets uppgifter ändras. Källan är body_stycken.
 *
 * Alla rutter i src/app/api/letters ritar brevet HÄR och ingen annanstans,
 * så att sammanslagningen med brevmallen bara byter en rad.
 */
import type { BrevData } from './brevmall/typer'
import { getDocxTemplate, DOCX_TEMPLATES, type DocxTemplateId } from './docx-templates'
import { getFontFamilyForHTML } from '@/lib/documents/typsnitt'

export interface BrevValForRitning {
  /** CV-mallens id. Null = gammalt brev i en av de sex gamla mallarna. */
  mall_id: string | null
  /** Gamla mallens id, för brev utan mall_id. */
  template_id?: string | null
  font_id?: string | null
}

function arGammalMall(id: unknown): id is DocxTemplateId {
  return typeof id === 'string' && id in DOCX_TEMPLATES
}

/**
 * Den gamla mallens splitIntoParagraphs tar bort taggar och avkodar &lt; till
 * <, så text kan inte skyddas med entiteter där. I reservvägen byts vinklarna
 * mot typografiska tecken, så att användarens text aldrig blir HTML.
 */
function utanVinklar(text: string): string {
  return text.replace(/</g, '‹').replace(/>/g, '›')
}

/** Reservvägen: den gamla mallen (template_id, annars Klassisk). */
function ritaIGammalMall(val: BrevValForRitning, data: BrevData): string {
  const mall = getDocxTemplate(arGammalMall(val.template_id) ? val.template_id : 'classic')
  const a = data.avsandare
  const datum = new Intl.DateTimeFormat(data.sprak === 'en' ? 'en-GB' : 'sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Stockholm',
  }).format(new Date(`${data.datum}T12:00:00Z`))
  return mall.generateHTML(
    {
      full_name: utanVinklar(a.namn),
      email: utanVinklar(a.epost),
      phone: a.telefon ? utanVinklar(a.telefon) : null,
      location: a.ort ? utanVinklar(a.ort) : null,
      include_phone_in_letters: !!a.telefon,
      include_location_in_letters: !!a.ort,
    },
    {
      title: data.tjanst ? utanVinklar(data.tjanst) : data.sprak === 'en' ? 'Job Application' : 'Ansökningsbrev',
      company: utanVinklar(data.mottagare.foretag ?? ''),
      position: utanVinklar(data.tjanst ?? ''),
      recipient: data.mottagare.person ? utanVinklar(data.mottagare.person) : undefined,
    },
    data.stycken.map(utanVinklar).join('\n'),
    datum,
    val.font_id ? getFontFamilyForHTML(val.font_id) : undefined
  )
}

/**
 * Brevet som fristående HTML-dokument.
 *
 * SAMMANSLAGNING (arket, src/lib/letters/brevmall/index.ts): byt raden
 * märkt BREVMALL nedan mot
 *   if (val.mall_id) return renderBrevHtml(val.mall_id, data, { typsnitt: val.font_id ?? null })
 * och lägg till importen `import { renderBrevHtml } from './brevmall'`.
 * Brev utan mall_id ritas i sin gamla mall som förut.
 */
export function ritaBrevHtml(val: BrevValForRitning, data: BrevData): string {
  // BREVMALL: tills brevmallen är sammanslagen ritas även nya brev i den gamla mallen.
  if (val.mall_id) return ritaIGammalMall({ ...val, template_id: 'classic' }, data)
  return ritaIGammalMall(val, data)
}
