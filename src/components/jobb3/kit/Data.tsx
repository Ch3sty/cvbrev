/**
 * Data som bild: händelsebanan, frågekorten, STAR-brickorna, bedömningen,
 * tratten, veckostaplarna med mållinje, kanalerna, personlighetsprofilens
 * band, faktalistor, kraven och annonsens "Därför passar du".
 *
 * Allt tar data som props. Serverkomponenter.
 */

import Link from 'next/link'
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react'
import { Bricka, Matchring, Rutor, type BrickTon } from './delar'
import { IkonBock, IkonFlagga, IkonPilHoger, IkonUtrop } from './ikoner'

/* ============================================================== fakta */

/** Faktalistan (Om tjänsten): etikett till vänster, värde till höger. */
export function Fakta({ rader }: { rader: { etikett: string; varde: ReactNode }[] }) {
  return (
    <dl className="j3-fakta">
      {rader.map((r) => (
        <div key={r.etikett}>
          <dt>{r.etikett}</dt>
          <dd>{r.varde}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Faktarutor (Anställningsform, Publicerad, Lön). Lönens belopp skrivs aldrig ut. */
export function FaktaRutor({ rutor }: { rutor: { varde: ReactNode; etikett: ReactNode }[] }) {
  return (
    <div className="j3-faktarutor">
      {rutor.map((r, i) => (
        <div key={i}>
          <b>{r.varde}</b>
          {r.etikett}
        </div>
      ))}
    </div>
  )
}

/* ============================================================== kraven */

/** Kraven i annonsen mot brevet (tjänstens Förbered intervjun): bock per krav, saknat krav i en vit ruta. */
export function KravLista({ krav }: { krav: { text: string; saknas?: boolean; rad?: string }[] }) {
  return (
    <div className="j3-kravlista">
      {krav.map((k) =>
        k.saknas ? (
          <span key={k.text} className="j3-krav saknas">
            <IkonUtrop />
            <span>
              <b>{k.text}</b>
              {k.rad ? <small>{k.rad}</small> : null}
            </span>
          </span>
        ) : (
          <span key={k.text} className="j3-krav">
            <IkonBock size={18} bredd={2.4} />
            {k.text}
          </span>
        ),
      )}
    </div>
  )
}

/** Annonsens "Därför passar du": stora ringen och skälen med bock. */
export function Passar({ procent, ogon = 'Därför passar du', skal }: { procent: number; ogon?: string; skal: { rubrik: string; text?: ReactNode }[] }) {
  return (
    <div className="j3-passar">
      <div className="j3-passar-ring">
        <Matchring procent={procent} storlek={112} />
        <span>procent matchgrad mot ditt CV</span>
      </div>
      <div className="j3-passar-lista">
        <p className="j3-eyebrow j3-passar-ogon">
          {ogon}
        </p>
        {skal.map((s) => (
          <div key={s.rubrik} className="j3-passar-skal">
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              <circle cx="11" cy="11" r="11" fill="currentColor" />
              <path d="M6.5 11.5l3 3 6-6.5" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <b>{s.rubrik}</b>
              {s.text ? <span>{s.text}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Annonsens text: rubriker och stycken från annonsen. */
export function AnnonsText({ children }: { children: ReactNode }) {
  return <div className="j3-annons-text">{children}</div>
}

/** Krav och meriterande i två rutor bredvid varandra. */
export function KravRutor({ krav, meriterande }: { krav: string[]; meriterande?: string[] }) {
  return (
    <div className="j3-krav2 j3-annons-text">
      <div>
        <h4>Krav</h4>
        <ul>
          {krav.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </div>
      {meriterande?.length ? (
        <div>
          <h4>Meriterande</h4>
          <ul>
            {meriterande.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

/* ============================================================== händelsebanan */

export interface Handelse {
  rubrik: string
  /** "2 nov", "tis 24 nov 10.00", "läggs till när du har skickat". */
  datum?: string
  /** Datumet i koppar (det som är bokat eller väntar på dig). */
  datumKoppar?: boolean
  text?: ReactNode
  /** 'klar' (grön med bock), 'snart' (kopparring), 'sen' (ihålig, grå rubrik). */
  lage: 'klar' | 'snart' | 'sen'
  /** Ikonen i noden (bock för klar om den utelämnas). Eller ett kort tal ("3/12"). */
  ikon?: ReactNode
  /** Linjen ned till nästa: hel eller streckad. Grund: hel om nästa är klar, annars streckad. */
  linje?: 'hel' | 'streckad'
}

/**
 * Den lodräta händelsebanan (Händelser, Vad som händer sedan). Sista
 * händelsen har ingen linje. `liten` är rutan "Vad som händer sedan".
 */
export function Handelsebana({ handelser, liten }: { handelser: Handelse[]; liten?: boolean }) {
  return (
    <ol className="j3-handlista">
      {handelser.map((h, i) => {
        const sist = i === handelser.length - 1
        const nasta = handelser[i + 1]
        const linje = h.linje ?? (nasta && nasta.lage === 'klar' ? 'hel' : 'streckad')
        const k = ['j3-hand', liten ? 'liten' : '', sist ? 'sist' : '', !sist && linje === 'streckad' ? 'streck' : '', h.lage === 'sen' ? 'sen-rubrik' : ''].filter(Boolean).join(' ')
        const tal = typeof h.ikon === 'string'
        return (
          <li key={`${h.rubrik}-${i}`} className={k}>
            <span className={`j3-hand-nod ${h.lage}${tal ? ' tal' : ''}`} aria-hidden="true">
              {h.ikon ?? (h.lage === 'klar' ? <IkonBock size={20} bredd={2.6} /> : null)}
            </span>
            <div className={h.text || h.datum ? 'j3-hand-text' : 'j3-hand-text mitt'}>
              <div className="j3-hand-topp">
                <b>{h.rubrik}</b>
                {h.datum ? <span className={h.datumKoppar ? 'j3-hand-dat koppar' : 'j3-hand-dat'}>{h.datum}</span> : null}
              </div>
              {h.text ? <p>{h.text}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Snabbvalen under händelserna ("Har något hänt? Lägg till det med ett tryck."). */
export function Snabbval({ children }: { children: ReactNode }) {
  return <div className="j3-snabbval">{children}</div>
}

/* ============================================================== frågorna */

export interface FragaKortProps {
  rubrik: string
  /** "Tunt, 2 av 5. Resultatet saknades. Börja här." eller "Inte övad än". */
  rad: string
  /** Senaste betyg 1 till 5, bara det som finns lagrat. 0 = inte övad. */
  betyg: number
  href: string
  /** Den att börja med: väggens färg. */
  nu?: boolean
}

/** Ett frågekort i tjänstens Förbered intervjun: betyget som rutor, frågan och läget. */
export function FragaKort({ rubrik, rad, betyg, href, nu }: FragaKortProps) {
  return (
    <Link className={nu ? 'j3-fraga nu' : 'j3-fraga'} href={href}>
      <Rutor antal={betyg} variant={nu ? 'morkt' : 'golv'} etikett={betyg ? `${betyg} av 5` : 'Inte övad'} />
      <b>{rubrik}</b>
      <small>{rad}</small>
    </Link>
  )
}

/** Det streckade kortet sist bland frågorna ("Allt under Inför intervjun"). */
export function FragaAllt({ rubrik, rad, href }: { rubrik: string; rad: string; href: string }) {
  return (
    <Link className="j3-fraga allt" href={href}>
      <b>{rubrik}</b>
      <small>{rad}</small>
    </Link>
  )
}

/** Rutnätet med frågekort: fyra i rad på dator, två på telefon. */
export function Fragor({ children }: { children: ReactNode }) {
  return <div className="j3-fragor">{children}</div>
}

/* ============================================================== STAR */

export interface StarDel {
  bokstav: 'S' | 'T' | 'A' | 'R'
  namn: string
  /** "Fanns med", "Saknades", eller en kort sammanfattning. */
  under: string
  saknas?: boolean
}

/**
 * STAR-brickorna. 'papper' (förra svaret, del för del), 'vagg' (det bedömda
 * svaret i väggen: bock på det som finns, kopparring och märke på det som
 * saknas).
 */
export function StarBrickor({ delar, pa = 'papper', marke = 'Saknas' }: { delar: StarDel[]; pa?: 'papper' | 'vagg'; marke?: string }) {
  return (
    <div className={pa === 'vagg' ? 'j3-star vagg' : 'j3-star'} role="list">
      {delar.map((d) => (
        <div key={d.bokstav} className={d.saknas ? 'j3-sb saknas' : 'j3-sb'} role="listitem">
          {pa === 'vagg' && !d.saknas ? (
            <span className="j3-sb-bock" aria-hidden="true">
              <IkonBock size={14} bredd={3} />
            </span>
          ) : null}
          {pa === 'vagg' && d.saknas ? <span className="j3-sb-marke">{marke}</span> : null}
          <i aria-hidden="true">{d.bokstav}</i>
          <b>{d.namn}</b>
          <small>{d.under}</small>
        </div>
      ))}
    </div>
  )
}

/** Bedömningen: "Det som fungerar" (grön bock) och "Det som saknas" (koppar ring). */
export function Bedomning({ rubrik, punkter, saknas }: { rubrik: string; punkter: ReactNode[]; saknas?: boolean }) {
  return (
    <div className={saknas ? 'j3-dom saknas' : 'j3-dom'}>
      <h3>{rubrik}</h3>
      <ul>
        {punkter.map((p, i) => (
          <li key={i}>
            {saknas ? (
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
              </svg>
            ) : (
              <IkonBock size={16} bredd={2.4} />
            )}
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Personlighetsprofilens rader: faktor, fem segment och nivån i ord. */
export function Faktorer({ faktorer }: { faktorer: { namn: string; niva: number; ord: string }[] }) {
  return (
    <div className="j3-faktorer">
      {faktorer.map((f) => (
        <div key={f.namn} className="j3-faktor">
          <b>{f.namn}</b>
          <span className="j3-band" role="img" aria-label={`${f.niva} av 5, ${f.ord}`}>
            {Array.from({ length: 5 }, (_, i) => (
              <i key={i} data-pa={i < f.niva ? '' : undefined} />
            ))}
          </span>
          <em>{f.ord}</em>
        </div>
      ))}
    </div>
  )
}

/* ============================================================== tratten */

export type TrattTon = 'int' | 'standard' | 'tyst' | 'slut'

export interface TrattLed {
  tal: number
  namn: string
  under?: string
  /** En bricka per sökt tjänst, i den ton den har. */
  brickor: { kod: string; ton: TrattTon }[]
  /** Det sista ledet (Erbjudande) när det är tomt: flaggan i en kopparram. */
  mal?: boolean
}

const TRATT_BRICKA: Record<TrattTon, BrickTon> = { int: 'int', standard: 'standard', tyst: 'tyst', slut: 'slut' }

/**
 * Tratten under Statistik (ersätter Sankey): fyra led från sökt till
 * erbjudande, en bricka per sökt tjänst. Mellan leden "5 av 9" och en pil.
 * Dator: i rad, lådorna sjunker åt höger. Telefon: under varandra.
 */
export function Tratt({ led, mellan, etikett }: { led: TrattLed[]; mellan: string[]; etikett: string }) {
  const hojd = (i: number) => Math.max(92, 176 - 44 * i)
  return (
    <>
      <div className="j3-tratt" role="img" aria-label={etikett}>
        {led.map((l, i) => (
          <FragmentLed key={l.namn} l={l} hojd={hojd(i)} mellan={i < led.length - 1 ? mellan[i] : undefined} sist={i === led.length - 1} />
        ))}
      </div>
      <div className="j3-forklaring" aria-hidden="true">
        <span className="j3-forkl">
          <i className="int" />
          Intervju
        </span>
        <span className="j3-forkl">
          <i className="std" />
          Väntar svar
        </span>
        <span className="j3-forkl">
          <i className="tyst" />
          Tyst i över tolv dagar
        </span>
        <span className="j3-forkl">
          <i className="slut" />
          Avslag
        </span>
      </div>
    </>
  )
}

function FragmentLed({ l, hojd, mellan, sist }: { l: TrattLed; hojd: number; mellan?: string; sist: boolean }) {
  const tomtMal = l.mal && l.brickor.length === 0
  return (
    <>
      <div className="j3-led" aria-hidden="true">
        <span className={l.tal === 0 ? 'j3-led-tal noll' : 'j3-led-tal'}>{l.tal}</span>
        <span className="j3-led-namn">{l.namn}</span>
        <span className="j3-led-under">{l.under}</span>
        <div className={tomtMal ? 'j3-lada mal' : 'j3-lada'} style={{ ['--j3-lada-h' as string]: `${hojd}px` } as CSSProperties}>
          {tomtMal ? (
            <IkonFlagga size={34} bredd={2.4} />
          ) : (
            l.brickor.map((b, j) => <Bricka key={`${b.kod}-${j}`} kod={b.kod} ton={TRATT_BRICKA[b.ton]} />)
          )}
        </div>
      </div>
      {!sist ? (
        <div className="j3-mellan" aria-hidden="true">
          <span>{mellan}</span>
          <IkonPilHoger size={28} />
        </div>
      ) : null}
    </>
  )
}

/* ============================================================== veckostaplarna */

export interface Vecka {
  /** "v. 42". */
  etikett: string
  /** En kloss per sökt tjänst den veckan, nedifrån och upp. */
  brickor: { kod: string; ton: TrattTon }[]
  /** Den här veckan: etiketten blir "v. 47, nu" i fet stil. */
  nu?: boolean
}

/**
 * Veckostaplarna med mållinjen (Aktivitet per vecka, BYGGSPEC F4): en kloss
 * per sökt tjänst, staplade per vecka, och veckans mål som en streckad
 * kopparlinje. Ingen svit, inga uteblivna veckor i rött.
 */
export function Veckostaplar({ veckor, mal, etikett }: { veckor: Vecka[]; mal: number; etikett: string }) {
  const rader = Math.max(mal, ...veckor.map((v) => v.brickor.length), 1)
  const stil = { ['--j3-rader' as string]: rader, ['--j3-mal' as string]: mal, ['--j3-antal' as string]: veckor.length } as CSSProperties
  return (
    <div style={stil}>
      <div className="j3-veckor" role="img" aria-label={etikett}>
        <div className="j3-veckor-mal" />
        <span className="j3-veckor-maltagg">{`Veckans mål: ${mal}`}</span>
        <div className="j3-veckor-staplar">
          {veckor.map((v) => (
            <div key={v.etikett} className="j3-vecka">
              {v.brickor.map((b, j) => (
                <span key={`${b.kod}-${j}`} className={b.ton === 'standard' ? 'j3-klots' : `j3-klots ${b.ton}`}>
                  {b.kod}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="j3-veckor-etiketter" aria-hidden="true">
        {veckor.map((v) => (
          <span key={v.etikett} className={v.nu ? 'nu' : undefined}>
            {v.nu ? `${v.etikett}, nu` : v.etikett}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Hur du sökte: en ruta per sökt tjänst per kanal, och antalet. */
export function Kanaler({ kanaler }: { kanaler: { namn: string; antal: number }[] }) {
  return (
    <div>
      {kanaler.map((k) => (
        <div key={k.namn} className="j3-kanal">
          <b>{k.namn}</b>
          <span className="j3-kanal-rutor" aria-hidden="true">
            {Array.from({ length: Math.min(k.antal, 24) }, (_, i) => (
              <i key={i} />
            ))}
          </span>
          <span className="j3-kanal-n">{k.antal}</span>
        </div>
      ))}
    </div>
  )
}

/* ============================================================== övrigt */

/** Månadsvalet i Rapport: kalenderbrickan, månaden, raden och en ring. */
export function ManadVal({ kort, rubrik, rad, vald, onClick }: { kort: string; rubrik: string; rad: string; vald?: boolean; onClick?: MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button type="button" className="j3-manad" aria-pressed={!!vald} onClick={onClick}>
      <span className="j3-manad-kal" aria-hidden="true">
        {kort}
      </span>
      <span>
        <b>{rubrik}</b>
        <small>{rad}</small>
      </span>
      <span className="j3-manad-ring" aria-hidden="true">
        {vald ? <IkonBock size={14} bredd={3} /> : null}
      </span>
    </button>
  )
}

/** Steget i Oversikt-ny: en bild med Exempel-taggen, nummer, rubrik och text. */
export function StegKort({ nr, rubrik, text, bild, exempel = true, koppar }: { nr: ReactNode; rubrik: string; text: string; bild: ReactNode; exempel?: boolean; koppar?: boolean }) {
  return (
    <div className="j3-stegkort">
      <div className="j3-stegkort-bild">{bild}</div>
      {exempel ? (
        <span className="j3-tagg exempel">
          Exempel
        </span>
      ) : null}
      <h3>
        <span className={koppar ? 'j3-nr koppar' : 'j3-nr'} aria-hidden="true">
          {nr}
        </span>
        {rubrik}
      </h3>
      <p>{text}</p>
    </div>
  )
}

/** Tre StegKort i rad på dator. */
export function StegKortRad({ children }: { children: ReactNode }) {
  return <div className="j3-stegkort-rad">{children}</div>
}

/**
 * En upplysning i en tonad ruta med ikon (samtycket i Meddelanden).
 * `handling` ritas under texten (knappar får inte ligga i ett stycke),
 * `role` gör rutan till en kvittens (role="status", kvittensen i Sökta tjänster).
 */
export function Notis({ ikon, rubrik, text, ton = 'tyst', handling, role }: { ikon: ReactNode; rubrik: string; text?: ReactNode; ton?: 'tyst' | 'ton'; handling?: ReactNode; role?: 'status' }) {
  return (
    <div className={ton === 'ton' ? 'j3-notis ton' : 'j3-notis'} role={role}>
      <span className="j3-notis-ik" aria-hidden="true">
        {ikon}
      </span>
      <div>
        <b>{rubrik}</b>
        {text ? <p>{text}</p> : null}
        {handling ? <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">{handling}</div> : null}
      </div>
    </div>
  )
}

/** En etikett för det rekryteraren ser ("Yrkesroll", "Västerbotten"). */
export function EtikettTag({ children, ton = 'mjuk' }: { children: ReactNode; ton?: 'mjuk' | 'ton' | 'kant' }) {
  return <span className={ton === 'mjuk' ? 'j3-etikett-tag' : `j3-etikett-tag ${ton}`}>{children}</span>
}

/** Punktlista med ikon i en liten ruta (Bli upptäckt: det som syns och inte syns). */
export function Punkter({ punkter, vagg }: { punkter: { ikon: ReactNode; text: ReactNode }[]; vagg?: boolean }) {
  return (
    <ul className={vagg ? 'j3-punkter vagg' : 'j3-punkter'}>
      {punkter.map((p, i) => (
        <li key={i}>
          <span aria-hidden="true">{p.ikon}</span>
          <span>{p.text}</span>
        </li>
      ))}
    </ul>
  )
}
