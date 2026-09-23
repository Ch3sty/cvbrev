/**
 * Serverdelen av mallvisningen: listorna som mallväljaren behöver, i sin
 * minsta form (id, namn, nivå). Hela mallregistret stannar på servern.
 */
import MallVisning from './MallVisning'
import { FREE_TEMPLATE_COUNT, SIMPLE_TEMPLATES, TEMPLATE_COUNT } from '@/lib/cv/simple-templates'
import { isValidTemplateId } from '@/lib/cv/templates'
import { FONTS } from '@/lib/cv/preview-utils'
import { BREV_MALLAR } from '@/lib/cv/showcase-exempel'

const CV_MALLAR = SIMPLE_TEMPLATES.filter((t) => isValidTemplateId(t.id)).map((t) => ({
  id: t.id,
  name: t.name,
  tier: t.tier,
}))
const TYPSNITT = FONTS.map((f) => ({ id: f.id, name: f.name }))

export function CvMallVisning() {
  return (
    <MallVisning
      typ="cv"
      mallar={CV_MALLAR}
      typsnitt={TYPSNITT}
      fotrad={`Samma innehåll i alla ${TEMPLATE_COUNT} mallar. ${FREE_TEMPLATE_COUNT} är gratis.`}
      lank={{ text: 'Prova mallarna med ditt CV', href: '/verktyg/cv-mallar' }}
    />
  )
}

export function BrevMallVisning() {
  return (
    <MallVisning
      typ="brev"
      mallar={BREV_MALLAR}
      typsnitt={TYPSNITT}
      fotrad="Samma brev i sex mallar. Fyra är gratis."
      lank={{ text: 'Skriv ditt eget brev', href: '/skapa-brev/start' }}
    />
  )
}
