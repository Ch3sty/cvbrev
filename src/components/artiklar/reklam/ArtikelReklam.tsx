/**
 * Reklamkorten i artiklarna och artikellistan, publikt v2
 * (docs/design/spec-publikt-v2-del-b-2026-10-12.md, avsnitt 3.1 och 3.2).
 *
 * Tre platser på en artikel: provkortet efter andra stycket (verktyget,
 * gratis först), sidopaketet i sidokolumnen (Premium i bläck, kort) och
 * slutkortet efter texten (PremiumBlock med klustrets telefoner). Två
 * platser i listan: gratiskortet bland artikelkorten och Premium i bläck
 * efter pagineringen. Klustret väljer vinkeln (paketForKluster); alla kort
 * säljer Jobbcoach Premium. Texterna står i reklam-copy.ts.
 *
 * Alla är serverkomponenter. Rubrikerna är p, aldrig h2 eller h3, så att
 * de inte hamnar i artikelns rubrikträd (SEO-spärrlistan punkt 3). Visning
 * och klick mäts av ArtikelKlient via data-cta-position och data-cta-klick.
 * InkPanel används inte längre här (del B: InkPanel bort från publika ytor).
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import type { ArtikelPaket, CtaCluster, InlineVerktyg } from '@/lib/cta/clusters'
import PremiumBlock, { PremiumOrd } from '@/components/publikt/PremiumBlock'
import Objekt, { type ObjektTyp } from '@/components/publikt/Objekt'
import ProvMatris from '@/components/publikt/innehall/ProvMatris'
import { KLUSTER_RUM } from '@/components/publikt/innehall/artikel-kluster'
import SkarmPersonlighet from '@/components/publikt/telefon/skarmar/SkarmPersonlighet'
import SkarmMatris from '@/components/publikt/telefon/skarmar/SkarmMatris'
import SkarmIntervjufragor from '@/components/publikt/telefon/skarmar/SkarmIntervjufragor'
import SkarmCvAnalys from '@/components/publikt/telefon/skarmar/SkarmCvAnalys'
import SkarmBrev from '@/components/publikt/telefon/skarmar/SkarmBrev'
import SkarmMallar from '@/components/publikt/telefon/skarmar/SkarmMallar'
import SkarmMatchning from '@/components/publikt/telefon/skarmar/SkarmMatchning'
import SkarmCoach from '@/components/publikt/telefon/skarmar/SkarmCoach'
import { PLAN_BY_KEY, SALD_PLAN } from '@/lib/plans/plans'
import {
  GRATIS_KORT,
  INLINE,
  INLINE_PROVA,
  INLINE_RAKNARE,
  LANKRAD,
  LISTA_SLUT,
  SIDO,
  SLUT,
} from './reklam-copy'

/** Datat som ArtikelKlient läser för visnings- och klickmätningen. */
function matning(position: string, cluster: CtaCluster | 'lista', variant: string) {
  return {
    'data-cta-position': position,
    'data-cta-cluster': cluster,
    'data-cta-variant': variant,
  }
}

const INLINE_OBJEKT: Record<Exclude<InlineVerktyg, 'raknare' | 'lankrad' | 'test'>, ObjektTyp> = {
  mallar: 'mallar',
  analys: 'cv',
  brev: 'brev',
  coach: 'chat',
}

/** "Alla nivåer. Klockan på." ritas med gradienten på sista meningen. */
function gradientSlut(rubrik: string): ReactNode {
  const i = rubrik.lastIndexOf('. ', rubrik.length - 2)
  if (i < 0) return rubrik
  return (
    <>
      {rubrik.slice(0, i + 1)} <span className="pub-gradord">{rubrik.slice(i + 2)}</span>
    </>
  )
}

/* --------------------------------------------------------- provkortet */

export function InlineKort({
  cluster,
  verktyg,
  slug,
}: {
  cluster: CtaCluster
  verktyg: InlineVerktyg
  slug: string
}) {
  const rum = `pub-rum-${KLUSTER_RUM[cluster]}`

  if (verktyg === 'lankrad') {
    return (
      <aside
        className={`not-prose ib-lankrad ${rum}`}
        aria-label="Relaterade räknare"
        {...matning('inline', cluster, 'lankrad')}
        data-cta-slug={slug}
      >
        <p className="pub-liten">{LANKRAD.text}</p>
        <ul>
          {LANKRAD.lankar.map((l) => (
            <li key={l.href}>
              <Link href={l.href} data-cta-klick={l.href}>
                {l.text}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    )
  }

  if (verktyg === 'raknare') {
    return (
      <aside
        className={`not-prose ib-prova ${rum}`}
        aria-label={INLINE_RAKNARE.rubrik}
        {...matning('inline', cluster, 'raknare')}
        data-cta-slug={slug}
      >
        <div>
          <p className="pub-kick">Verktyget</p>
          <p className="ib-rub">{INLINE_RAKNARE.rubrik}</p>
          <p className="ib-prova-text">{INLINE_RAKNARE.text}</p>
          <ul className="ib-lankrad-lista">
            {INLINE_RAKNARE.lankar.map((l) => (
              <li key={l.href}>
                <Link href={l.href} data-cta-klick={l.href} className="pub-lank">
                  {l.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="ib-prova-sida" aria-hidden="true">
          <Objekt typ="rakna" storlek={64} />
        </div>
      </aside>
    )
  }

  if (verktyg === 'test') {
    return (
      <aside
        className={`not-prose ib-prova ${rum}`}
        aria-label={INLINE_PROVA.etikett}
        {...matning('inline', cluster, verktyg)}
        data-cta-slug={slug}
      >
        <div>
          <p className="pub-kick">{INLINE_PROVA.etikett}</p>
          <p className="ib-rub">{INLINE_PROVA.rubrik}</p>
          <p className="ib-prova-text">{INLINE_PROVA.text}</p>
          <div className="pub-handling">
            <Link
              href={INLINE_PROVA.href}
              data-cta={`article-inline-${cluster}`}
              data-cta-klick={INLINE_PROVA.href}
              className="pub-knapp"
            >
              {INLINE_PROVA.knapp}
            </Link>
          </div>
          <p className="pub-liten">{INLINE_PROVA.paketrad}</p>
        </div>
        <div className="ib-prova-sida">
          <ProvMatris />
        </div>
      </aside>
    )
  }

  const copy = INLINE[verktyg]
  return (
    <aside
      className={`not-prose ib-prova ${rum}`}
      aria-label={copy.rubrik}
      {...matning('inline', cluster, verktyg)}
      data-cta-slug={slug}
    >
      <div>
        <p className="pub-kick">Verktyget</p>
        <p className="ib-rub">{copy.rubrik}</p>
        <p className="ib-prova-text">{copy.text}</p>
        <div className="pub-handling">
          <Link href={copy.href} data-cta={`article-inline-${cluster}`} data-cta-klick={copy.href} className="pub-knapp">
            {copy.knapp}
          </Link>
        </div>
        <p className="pub-liten">{copy.paketrad}</p>
      </div>
      <div className="ib-prova-sida" aria-hidden="true">
        <Objekt typ={INLINE_OBJEKT[verktyg]} storlek={64} />
      </div>
    </aside>
  )
}

/* ------------------------------------------------ sidokolumnens paketkort */

export function SidoPaketKort({ paket, cluster, slug }: { paket: ArtikelPaket; cluster: CtaCluster; slug: string }) {
  if (paket === 'gratis') {
    return (
      <section
        className="ib-gratis"
        aria-label={GRATIS_KORT.rubrik}
        {...matning('sidebar', cluster, 'gratis')}
        data-cta-slug={slug}
      >
        <div>
          <p className="pub-kick">{GRATIS_KORT.etikett}</p>
          <p className="ib-rub" style={{ fontSize: 18 }}>
            {GRATIS_KORT.rubrik}
          </p>
          <ul className="pub-bock" style={{ marginTop: 12 }}>
            {GRATIS_KORT.rader.slice(0, 3).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <Link href={GRATIS_KORT.href} data-cta-klick={GRATIS_KORT.href} className="pub-knapp" style={{ width: '100%', marginTop: 16 }}>
            {GRATIS_KORT.knapp}
          </Link>
        </div>
      </section>
    )
  }
  const copy = SIDO[paket]
  return (
    <section className="ib-black" aria-label={copy.rubrik} {...matning('sidebar', cluster, paket)} data-cta-slug={slug}>
      <p className="pub-kick">{copy.etikett}</p>
      <p className="ib-rub">{copy.rubrik}</p>
      <p className="pub-liten" style={{ marginTop: 6 }}>
        {copy.text}
      </p>
      <p className="ib-pris-l">
        {copy.belopp}
        <small>{copy.under}</small>
      </p>
      <Link href="/priser" data-cta-klick="/priser" className="ib-knapp-ram">
        Se vad som ingår
      </Link>
      {copy.gratisrad ? (
        <p className="pub-liten" style={{ marginTop: 12 }}>
          {copy.gratisrad}
        </p>
      ) : null}
    </section>
  )
}

/* ---------------------------------------------------- slutkortet i bläck */

function Telefoner({ paket }: { paket: 'cv' | 'test' | 'allt' | 'lista' }) {
  if (paket === 'test') {
    return (
      <>
        <SkarmPersonlighet />
        <SkarmMatris />
        <SkarmIntervjufragor />
      </>
    )
  }
  if (paket === 'cv') {
    return (
      <>
        <SkarmBrev />
        <SkarmCvAnalys />
        <SkarmMallar />
      </>
    )
  }
  if (paket === 'allt') {
    return (
      <>
        <SkarmCoach />
        <SkarmMatchning />
        <SkarmIntervjufragor />
      </>
    )
  }
  return (
    <>
      <SkarmCvAnalys />
      <SkarmMatchning />
      <SkarmMatris />
    </>
  )
}

/**
 * Slutkortet efter texten: PremiumBlock på bläck med klustrets telefoner.
 * Rubriken är p (rubrikNiva 'p'), så att 139 artiklar inte får en ny h2.
 * Paketet gratis ritas i textspalten av GratisKort i stället.
 */
export function SlutKort({ paket, cluster, slug }: { paket: Exclude<ArtikelPaket, 'gratis'>; cluster: CtaCluster; slug: string }) {
  const copy = SLUT[paket]
  return (
    <div {...matning('final', cluster, paket)} data-cta-slug={slug}>
      <PremiumBlock
        id="premium-artikel"
        kick={copy.etikett}
        rubrik={gradientSlut(copy.rubrik)}
        rubrikNiva="p"
        punkter={copy.rader}
        pris
        knapp={
          <Link href={copy.href} data-cta={`article-final-${cluster}`} data-cta-klick={copy.href} className="pub-knapp">
            {copy.knapp}
          </Link>
        }
        lank={copy.sekundar}
        bild={<Telefoner paket={paket} />}
      />
    </div>
  )
}

/* ------------------------------------------------------- gratiskortet */

export function GratisKort({
  cluster,
  slug,
  position = 'inline',
  className,
}: {
  cluster: CtaCluster | 'lista'
  slug?: string
  position?: string
  className?: string
}) {
  return (
    <aside
      className={`not-prose ib-gratis ib-gratis-bred ${className ?? ''}`.trim()}
      aria-label={GRATIS_KORT.rubrik}
      {...matning(position, cluster, 'gratis')}
      data-cta-slug={slug}
    >
      <div>
        <p className="pub-kick">{GRATIS_KORT.etikett}</p>
        <p className="pub-h3 ib-rub">{GRATIS_KORT.rubrik}</p>
        <div className="pub-handling">
          <Link href={GRATIS_KORT.href} data-cta-klick={GRATIS_KORT.href} className="pub-knapp">
            {GRATIS_KORT.knapp}
          </Link>
          <Link href={GRATIS_KORT.sekundar.href} data-cta-klick={GRATIS_KORT.sekundar.href} className="pub-lank">
            {GRATIS_KORT.sekundar.text}
          </Link>
        </div>
      </div>
      <ul className="pub-bock">
        {GRATIS_KORT.rader.map((r, i) => (
          <li key={r}>
            {/* Mallraden leder till verktygssidan: intern länkkraft som kortet
                hade förut och inte får tappa (SEO-spärrlistan punkt 4). */}
            {i === 0 ? (
              <Link href="/verktyg/cv-mallar" data-cta-klick="/verktyg/cv-mallar" className="pub-lank" style={{ fontWeight: 500 }}>
                {r}
              </Link>
            ) : (
              <span>{r}</span>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}

/* -------------------------------------------- listans slutkort i bläck */

export function ListaSlutKort() {
  return (
    <div {...matning('final', 'lista', 'paket')}>
      <PremiumBlock
        id="premium-arkiv"
        kick={LISTA_SLUT.etikett}
        rubrik={gradientSlut(LISTA_SLUT.rubrik.replace(', ', '. '))}
        rubrikNiva="p"
        text={LISTA_SLUT.text}
        punkter={LISTA_SLUT.rader}
        knapp={
          <Link href={LISTA_SLUT.href} data-cta-klick={LISTA_SLUT.href} className="pub-knapp">
            {LISTA_SLUT.knapp}
          </Link>
        }
        lank={{ text: 'Eller börja gratis med en CV-mall', href: '/verktyg/cv-mallar' }}
        bild={<Telefoner paket="lista" />}
      />
    </div>
  )
}

/** Premium-namnet med gradienten, för sidor som vill skriva det i en rubrik. */
export { PremiumOrd }

/** Priset för sidopaketet, ur plans.ts. */
export const SIDO_PRIS = PLAN_BY_KEY[SALD_PLAN].amount
