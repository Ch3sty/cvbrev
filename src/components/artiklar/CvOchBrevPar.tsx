/**
 * <CvOchBrevPar />: CV och personligt brev bredvid varandra i samma mall, i
 * artikeln om CV och brev i samma mall (saas-lead 10.1, SEO 11.1 och 11.4 i
 * docs/artiklar-2026-11/brief-cv-och-brev-samma-mall.md, byggordern H).
 *
 * Serverdelen läser katalogen (namn, nivå, Word, foto) och bygger fotraden ur
 * konstanterna; klientön CvOchBrevParVal har bara valet, svepet och
 * laddningen. Bilderna är de riktiga mallbilderna ur public/mallar (CV:t
 * 300 x 424, brevet 480 x 679), aldrig iframes, alla lazy så att
 * artikelbilden förblir LCP.
 *
 * Första vyn (Linne) står i HTML och är det enda paret av ?mall=-adresser
 * där (SEO 11.1); de andra adresserna byggs i klienten. Utan JavaScript göms
 * mallraden och kantpilarna, så att inget reglage är dött.
 */
import { getMallKort, mallBild } from '@/lib/cv/mallar/katalog'
import { BREV_GRATIS_NAMN, brevMiniatyrSrc, formatMarke } from '@/components/publikt/brevmallar'
import { paketKort } from '@/lib/plans/plans'
import CvOchBrevParVal, { type ParMall } from './CvOchBrevParVal'
import '@/components/publikt/v3/v3.css'
import './cv-och-brev-par.css'

/**
 * Artikelns fyra familjer två och två (avsnittet "Vilka mallar fungerar för
 * både CV och brev?"): en spalt, sidospalt, marginal, konstnärliga.
 */
export const PAR_MALL_IDS = ['linne', 'bjork', 'kalksten', 'granit', 'kolumn', 'arsring', 'morkrum', 'kvadrat'] as const

/** FAQ 5 och 6 i artikeln, ordagrant (saas-lead 3.4): ändras FAQ ändras fotraden samtidigt. */
export function parFot(): string {
  return `Hos oss är mallarna ${BREV_GRATIS_NAMN} gratis för båda dokumenten. Att ladda ner brevet ingår i ${paketKort()}, oavsett om du väljer PDF eller Word.`
}

export function parMallar(): ParMall[] {
  return PAR_MALL_IDS.map((id) => {
    const k = getMallKort(id)
    if (!k) throw new Error(`Mallen ${id} finns inte i katalogen`)
    const bild = mallBild(id)
    return {
      id: k.id,
      namn: k.namn,
      niva: k.niva === 'gratis' ? 'Gratis' : paketKort(),
      gratis: k.niva === 'gratis',
      format: formatMarke(k.word),
      foto: k.foto,
      cv: bild.stor,
      mini: bild.liten,
      brev: brevMiniatyrSrc(id),
    }
  })
}

/** Utan JavaScript: mallraden och kantpilarna göms, Linne står kvar i båda arken. */
const UTAN_JS = '<style>.cbp-rad,.cbp-kant{display:none!important}</style>'

export default function CvOchBrevPar({ slug }: { slug: string }) {
  return (
    <div className="cbp-hall not-prose">
      <noscript dangerouslySetInnerHTML={{ __html: UTAN_JS }} />
      <div className="p3-kort cbp" data-p3-farg="brev" role="group" aria-label="CV och personligt brev i samma mall">
        <CvOchBrevParVal
          slug={slug}
          mallar={parMallar()}
          fot={parFot()}
          fotoRad="Våra brevmallar har ingen fotoplats, inte ens när CV-mallen har en."
        />
      </div>
    </div>
  )
}
