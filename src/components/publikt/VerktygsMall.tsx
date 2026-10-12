/**
 * Verktygsmallen, publikt v2 (docs/design/spec-publikt-v2-del-a-2026-10-12.md
 * avsnitt 5.7). Samma datamodell som den gamla VerktygsSida, så att varje
 * page.tsx flyttar genom att byta import och lägga till rum och telefon;
 * texterna står kvar där de står.
 *
 * Ordning: hjälten på vägg i verktygets rum (brödsmula, h1, ingress, en
 * knapp, talraden, telefon), handlingen som kort direkt under, Så fungerar
 * det på panel, kontrollen på ton, extra växelvis mark och panel, fritt,
 * citatet, slutet som Premium på bläck och frågorna på mark.
 *
 * Rubriknivåerna är desamma som i VerktygsSida (h2 per sektion, h3 per rad),
 * så baslinjens rubrikträd står kvar. Serverkomponent; handlingen och fritt
 * får vara klientkomponenter. Schemat ligger kvar i respektive page.tsx.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import Hjalte from './Hjalte'
import Rum from './Rum'
import Faq from './Faq'
import PremiumBlock from './PremiumBlock'
import FastKnapprad from './FastKnapprad'
import PubliktSida from './PubliktSida'
import type { RumNamn } from './telefon/Telefon'

export interface VerktygsLank {
  text: string
  href: string
}

export interface VerktygsRad {
  rubrik: string
  text: ReactNode
}

export interface VerktygsMallProps {
  rum: RumNamn
  /** Telefonen (eller telefon med svävande objekt) i hjälten. */
  telefon: ReactNode
  /** Valfri telefon bredvid Så fungerar det. */
  stegTelefon?: ReactNode
  brodsmulor: { name: string; href: string }[]
  eyebrow: string
  h1: ReactNode
  ingress: ReactNode
  fet?: ReactNode
  primar: VerktygsLank & { dataCta?: string }
  sekundar?: VerktygsLank
  loften?: { tal: string; text: string }[]
  handling?: ReactNode
  handlingId?: string
  steg: { id?: string; rubrik: string; ingress?: string; rader: VerktygsRad[]; lank?: VerktygsLank }
  kontroll?: { id?: string; eyebrow?: string; rubrik: string; ingress?: string; rader: VerktygsRad[] }
  extra?: { id?: string; eyebrow?: string; rubrik: string; ingress?: ReactNode; rader: VerktygsRad[]; lank?: VerktygsLank }[]
  fritt?: ReactNode
  citat?: { text: string; namn: string; roll?: string }
  slut: {
    eyebrow: string
    rubrik: string
    text: ReactNode
    knapp: VerktygsLank
    sekundar?: VerktygsLank
  }
  faq: { id?: string; rubrik: string; ingress?: ReactNode; fragor: readonly { q: string; a: string }[] }
}

/** Raderna som kort med h3, två eller tre i bredd. */
function Kort({ rader }: { rader: VerktygsRad[] }) {
  const kolumner = rader.length % 3 === 0 && rader.length > 3 ? 'pub-raster-3' : rader.length === 3 ? 'pub-raster-3' : 'pub-raster-2'
  return (
    <div className={`pub-raster ${kolumner}`} style={{ marginTop: 32 }}>
      {rader.map((r) => (
        <div className="pub-kort" key={r.rubrik}>
          <h3 className="pub-h4" style={{ marginTop: 0 }}>
            {r.rubrik}
          </h3>
          <div className="pub-brod" style={{ fontSize: 15, marginTop: 8 }}>
            {r.text}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Numrerade steg med h3. Texten kan bära länkar, därför en div och inte p. */
function StegRader({ rader }: { rader: VerktygsRad[] }) {
  return (
    <ol className={`pub-steg ${rader.length > 4 ? 'pub-steg-2' : ''}`.trim()}>
      {rader.map((r) => (
        <li key={r.rubrik}>
          <div>
            <h3>{r.rubrik}</h3>
            <div className="pub-brod" style={{ fontSize: 15 }}>
              {r.text}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Mittpunkten i gamla eyebrows blir kommatecken (husregeln). */
function kick(text: string): string {
  return text.replace(/\s*·\s*/g, ', ')
}

export default function VerktygsMall(p: VerktygsMallProps) {
  const ytor = ['mark', 'panel'] as const
  return (
    <PubliktSida>
      <div id="innehall">
        {/* 1. Hjälten */}
        <Hjalte
          id="hjalte"
          rum={p.rum}
          yta="vagg"
          vag="mark"
          brodsmulor={p.brodsmulor}
          kick={kick(p.eyebrow)}
          h1={p.h1}
          ingress={p.ingress}
          fet={p.fet}
          primar={{ text: p.primar.text, href: p.primar.href, dataCta: p.primar.dataCta }}
          sekundar={p.sekundar}
          tal={p.loften}
          bildLag
          bild={p.telefon}
        />

        {/* 2. Handlingen, direkt under hjälten */}
        {p.handling ? (
          <Rum yta="mark" storlek="tat" id={p.handlingId}>
            <div className="pub-wrap">
              <div className={`pub-kort pub-prova-kort pub-rum-${p.rum}`} style={{ display: 'block' }}>
                {p.handling}
              </div>
            </div>
          </Rum>
        ) : null}

        {/* 3. Så fungerar det */}
        <Rum yta="panel" id={p.steg.id}>
          <div className={`pub-wrap ${p.stegTelefon ? 'pub-tva pub-omv' : ''}`.trim()}>
            <div className={`${p.stegTelefon ? 'pub-tva-text' : ''} pub-rum-${p.rum}`.trim()}>
              <h2 className="pub-h2">{p.steg.rubrik}</h2>
              {p.steg.ingress ? (
                <p className="pub-ingress" style={{ marginTop: 16 }}>
                  {p.steg.ingress}
                </p>
              ) : null}
              <div style={{ marginTop: 28 }}>
                <StegRader rader={p.steg.rader} />
              </div>
              {p.steg.lank ? (
                <div className="pub-handling">
                  <Link className="pub-knapp" href={p.steg.lank.href}>
                    {p.steg.lank.text}
                  </Link>
                </div>
              ) : null}
            </div>
            {p.stegTelefon ? <div className="pub-mitt">{p.stegTelefon}</div> : null}
          </div>
        </Rum>

        {/* 4. Kontrollen på ton */}
        {p.kontroll ? (
          <Rum yta="ton" rum={p.rum} id={p.kontroll.id}>
            <div className="pub-wrap">
              {p.kontroll.eyebrow ? <p className="pub-kick">{p.kontroll.eyebrow}</p> : null}
              <h2 className="pub-h2">{p.kontroll.rubrik}</h2>
              {p.kontroll.ingress ? (
                <p className="pub-ingress" style={{ marginTop: 16 }}>
                  {p.kontroll.ingress}
                </p>
              ) : null}
              <Kort rader={p.kontroll.rader} />
            </div>
          </Rum>
        ) : null}

        {/* 5. Extra, växelvis mark och panel */}
        {p.extra?.map((e, i) => (
          <Rum key={e.rubrik} yta={ytor[i % 2]} rum={p.rum} id={e.id}>
            <div className="pub-wrap">
              {e.eyebrow ? <p className="pub-kick">{e.eyebrow}</p> : null}
              <h2 className="pub-h2">{e.rubrik}</h2>
              {e.ingress ? (
                <p className="pub-ingress" style={{ marginTop: 16 }}>
                  {e.ingress}
                </p>
              ) : null}
              <Kort rader={e.rader} />
              {e.lank ? (
                <p style={{ marginTop: 24 }}>
                  <Link className="pub-lank" href={e.lank.href}>
                    {e.lank.text}
                  </Link>
                </p>
              ) : null}
            </div>
          </Rum>
        ))}

        {/* 6. Fritt innehåll */}
        {p.fritt ? (
          <Rum yta={ytor[(p.extra?.length ?? 0) % 2]} rum={p.rum}>
            <div className="pub-wrap">{p.fritt}</div>
          </Rum>
        ) : null}

        {/* 7. Citatet */}
        {p.citat ? (
          <Rum yta="panel" storlek="tat">
            <div className="pub-wrap">
              <figure className="pub-kort" style={{ margin: 0 }}>
                <blockquote className="pub-h3" style={{ margin: 0, fontWeight: 700 }}>
                  {p.citat.text}
                </blockquote>
                <figcaption className="pub-liten" style={{ marginTop: 14 }}>
                  <b style={{ color: 'var(--ink-1)' }}>{p.citat.namn}</b>
                  {p.citat.roll ? `, ${p.citat.roll}` : ''}
                </figcaption>
              </figure>
            </div>
          </Rum>
        ) : null}

        {/* 8. Slutet på bläck */}
        <PremiumBlock
          kick={p.slut.eyebrow}
          rubrik={p.slut.rubrik}
          text={p.slut.text}
          knapp={{ text: p.slut.knapp.text, href: p.slut.knapp.href }}
          lank={p.slut.sekundar}
        />

        {/* 9. Frågorna */}
        <Rum yta="mark" id={p.faq.id ?? 'fragor'}>
          <div className="pub-wrap" style={{ maxWidth: 820 }}>
            <Faq rubrik={p.faq.rubrik} ingress={p.faq.ingress} fragor={p.faq.fragor} />
          </div>
        </Rum>
      </div>
      <FastKnapprad text={p.primar.text} href={p.primar.href} observera="hjalte" />
    </PubliktSida>
  )
}
