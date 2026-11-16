/**
 * Serverdelen av mallvisningarna i artiklarna.
 *
 * CV (skissen yta 2, "namnet först"): texten (rubrik, raden under,
 * uppladdningsraden, fotraden och mallraderna) renderas här på servern med
 * talen ur katalogen. Klientön (MallVisningCv) får bara fem små objekt.
 * Uppladdningsraden är en vanlig länk till mallsidans uppladdningsyta
 * (trions beslut om punkt 13): noll JavaScript, komponenten läser aldrig
 * filen. Klicket mäts med data-cta-klick.
 *
 * Brevet: oförändrat (mallväljare och typsnitt i MallVisning).
 */
import MallVisning from './MallVisning'
import MallVisningCv, { type ArtikelMall } from './MallVisningCv'
import { MALL_KATALOG, GRATIS_ANTAL } from '@/lib/cv/mallar/katalog'
import { FONTS } from '@/lib/cv/preview-utils'
import { BREV_MALLAR } from '@/lib/cv/showcase-exempel'
import { ARTIKEL, KNAPP, UPPLADDNING, DOK } from '@/components/cv/Dokument/texter'

const TYPSNITT = FONTS.map((f) => ({ id: f.id, name: f.name }))

/** Fem mallar: gratismallarna först (katalogens ordning), sedan Premium. */
const FEM: ArtikelMall[] = MALL_KATALOG.slice(0, 5).map((m) => ({
  id: m.id,
  namn: m.namn,
  rad: ARTIKEL.mallrad(m.niva === 'gratis', m.word),
  bild: m.bild.liten,
}))

export function CvMallVisning() {
  return (
    <aside className="not-prose my-10 rounded-xl border border-kant bg-panel p-4 sm:p-6" aria-label={ARTIKEL.ey}>
      <p className="text-steg uppercase text-ink-3">{ARTIKEL.ey}</p>
      <p className="mt-1 text-sm text-ink-2">{ARTIKEL.under}</p>
      <div className="mt-3">
        <MallVisningCv
          mallar={FEM}
          etiketter={{ namn: UPPLADDNING.namn, titel: UPPLADDNING.titel, fortsatt: KNAPP.fortsatt, svep: DOK.svep }}
          uppladdning={
            <div className="mt-2.5 flex items-center justify-between gap-3 rounded-xl border border-kant bg-papper px-3 py-2">
              <p className="text-[13px] leading-5 text-ink-2">{ARTIKEL.uppladdning}</p>
              <a
                href="/cv-mallar#ladda-upp"
                data-cta-klick="/cv-mallar#ladda-upp"
                className="inline-flex h-11 shrink-0 items-center rounded-xl border border-kant-stark bg-papper px-4 text-sm font-semibold text-ink-1 hover:border-ink-1"
              >
                {ARTIKEL.laddaUpp}
              </a>
            </div>
          }
        />
      </div>
      <p className="mt-3 text-sm text-ink-2">{ARTIKEL.fotrad(GRATIS_ANTAL)}</p>
    </aside>
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
