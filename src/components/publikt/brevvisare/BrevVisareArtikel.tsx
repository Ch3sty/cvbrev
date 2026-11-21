/**
 * Mallvisaren i artiklarna (byggspecen våg 2, avsnitt 4). Serverkomponenter:
 * namn, nivå och fotrad läses ur brevets katalog här, och brevets text för
 * "Läs brevet som text" ritas här (öppen i HTML, ingen JavaScript), så att
 * klientön bara får fem små objekt.
 *
 *  - BrevMallVisning: tre artiklar (MDX InteractiveLetterShowcase och
 *    PersonligtBrevTemplateShowcase), motorns eget exempelbrev.
 *  - BrevForhandsvisning: de 19 artiklarna med <PersonligtBrevPreview />,
 *    artikelns eget brev (personligt-brev-preview-data.ts).
 *
 * Första vyn (Linne) står i HTML och syns utan JavaScript; noscript-stilen
 * gömmer miniatyrerna och de kikande arken så att inget reglage är dött.
 */
import type { ReactNode } from 'react'
import BrevVisare from './BrevVisare'
import { VISARE_TEXT as T } from './texter'
import { brevDataFranFalt, brevTextDelar, idagISverige, visarFot, visarMallar } from './visare-data'
import { ARTIKEL_BREV, arArtikelBrevNyckel, type ArtikelBrevNyckel } from '@/components/mdx/personligt-brev-preview-data'

/** Utan JavaScript: Linne i hela scenens bredd, namnraden och länken. */
const UTAN_JS =
  '<style>.mv-rad,.mv-kik{display:none!important}.mv-bord{display:block!important}.mv-bunt{width:100%!important}</style>'

function Ram({ brev, yrke, children }: { brev: string; yrke?: string; children?: ReactNode }) {
  return (
    <>
      <noscript dangerouslySetInnerHTML={{ __html: UTAN_JS }} />
      <BrevVisare
        mallar={visarMallar()}
        brev={brev}
        yrke={yrke}
        kontext="artikel"
        handling={{ text: T.skriv, href: '/skapa-brev/start' }}
        fot={visarFot()}
        lazy
      >
        {children}
      </BrevVisare>
    </>
  )
}

export function BrevMallVisning() {
  return <Ram brev="" />
}

/** Brevet som text, ur samma data som arket och med samma avslut. Inga rubriker. */
function BrevSomText({ nyckel }: { nyckel: ArtikelBrevNyckel }) {
  const t = brevTextDelar(brevDataFranFalt(ARTIKEL_BREV[nyckel], idagISverige()))
  return (
    <details className="mv-text" open>
      <summary>
        {T.lasSomText}
        <svg className="mv-text-ikon" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="13" strokeWidth="1.5" />
          <path d="M14 8v12M8 14h12" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </summary>
      <div className="mv-text-brev">
        <p className="mv-text-huvud">
          <b>{t.namn}</b>
          {t.foretag ? ` till ${t.foretag}` : ''}
          {t.arende ? (
            <>
              <br />
              {t.arende}
            </>
          ) : null}
        </p>
        <p>{t.halsning}</p>
        {t.stycken.map((s, i) => (
          <p key={i}>{s}</p>
        ))}
        <p>
          {t.avslut}
          <br />
          {t.namn}
        </p>
      </div>
    </details>
  )
}

export function BrevForhandsvisning({ yrke }: { yrke?: string }) {
  const nyckel: ArtikelBrevNyckel = arArtikelBrevNyckel(yrke) ? yrke : 'student'
  return (
    <Ram brev={`nyckel=${nyckel}`} yrke={ARTIKEL_BREV[nyckel].yrke}>
      <BrevSomText nyckel={nyckel} />
    </Ram>
  )
}
