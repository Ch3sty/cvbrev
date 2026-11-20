'use client'

/**
 * Välj hur du vill öva (omgång 3, skissens Main och Mobil-startark): sätten
 * att öva i en testtyp ur typens meny. Träna först i koppar, sedan mönstret
 * du tappar mest på, Nivåkollen och övningsprovet, och sist nivåtesten på en
 * fast nivå (Grund, Avancerad, Expert). Samma block i planpanelen på Tester
 * och i startarket.
 *
 * Låsen är oförändrade: en låst handling är en knapp som öppnar betalväggen
 * (LasKontext, samma feature och plats som förut), aldrig en länk. Öppna
 * handlingar är riktiga länkar till befintliga adresser.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Handling, TesttypKort, TypMeny } from '@/lib/tester/v4/typer'
import { arSvagt } from '@/lib/tester/v4/monster'
import { NIVA_TEST_ANTAL } from '@/lib/tester/v4/copy'
import { nivakollOmfang } from '@/lib/nivakoll/omfang'
import { kortDatumV } from '@/lib/tester/v4/vagen'
import { useOppnaLas } from '@/components/tester-v4/tester/LasKontext'
import { TESTER } from '@/components/tester-v4/tester/copy'
import { Ikon3, Las3 } from './delar'
import { tal1 } from './matt'

const ZON_KORT = { grund: 'Grund', avancerad: 'Avancerad', expert: 'Expert' } as const
const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv']

function Lage({ h, rubrik, text, ikon, forst, chip }: { h: Handling; rubrik: string; text: string; ikon: ReactNode; forst?: boolean; chip?: string | null }) {
  const oppnaLas = useOppnaLas()
  const inne = (
    <>
      <span className="t3-lage-ik">{ikon}</span>
      <span className="t3-lage-text">
        <b>{rubrik}</b>
        <small>{text}</small>
      </span>
      {h.las ? (
        <span className="t3-lage-chip" data-ton="las">
          <Las3 size={13} />
          {h.las.chip}
        </span>
      ) : chip ? (
        <span className="t3-lage-chip" data-ton="gjord">
          {chip}
        </span>
      ) : null}
    </>
  )
  if (h.las) {
    return (
      <button type="button" className="t3-lage" data-forst={forst ? '' : undefined} data-las={h.las.skal} onClick={() => oppnaLas(h)} aria-label={TESTER.meny.lasEtikett(rubrik, h.las.chip)}>
        {inne}
      </button>
    )
  }
  return (
    <Link href={h.href} className="t3-lage" data-forst={forst ? '' : undefined} data-handling={h.slag}>
      {inne}
    </Link>
  )
}

function Fast({ h }: { h: TypMeny['nivaer'][number] }) {
  const oppnaLas = useOppnaLas()
  const namn = ZON_KORT[h.zon]
  if (h.las) {
    return (
      <button type="button" className="t3-fast" data-las={h.las.skal} onClick={() => oppnaLas(h)} aria-label={TESTER.meny.lasEtikett(namn, h.las.chip)}>
        <Las3 size={14} />
        {namn}
      </button>
    )
  }
  return (
    <Link href={h.href} className="t3-fast" data-handling="niva_test" aria-label={h.meta ? `${namn}, ${h.meta}` : namn}>
      {namn}
      {h.meta ? <small>{h.meta}</small> : null}
    </Link>
  )
}

export default function SattAttOva({ kort, meny, planNamn, rubrik = true }: { kort: TesttypKort; meny: TypMeny; planNamn: string | null; rubrik?: boolean }) {
  const omfang = nivakollOmfang(kort.id)
  const matt = kort.niva.status === 'matt'
  const svag = meny.monster?.find((m) => arSvagt(m)) ?? null
  const nk = meny.nivakoll.senaste
  const prov = meny.ovningsprov[0] ?? null
  const tranaArNivakoll = meny.trana.slag === 'nivakoll'
  const lagen: ReactNode[] = []

  lagen.push(
    <Lage
      key="trana"
      forst
      h={meny.trana}
      rubrik={tranaArNivakoll ? (kort.niva.status === 'paborjad' ? 'Gör klart Nivåkollen' : 'Nivåkollen först') : 'Träna'}
      text={
        tranaArNivakoll
          ? `${omfang ? `${ORD[omfang.uppgifter] ? ORD[omfang.uppgifter].charAt(0).toUpperCase() + ORD[omfang.uppgifter].slice(1) : omfang.uppgifter} uppgifter, cirka ${ORD[omfang.minuter] ?? omfang.minuter} minuter. ` : ''}Sedan tränar du på din nivå.`
          : 'Följer din nivå, förklaring efter varje svar. Tio minuter.'
      }
      ikon={<Ikon3 ikon={tranaArNivakoll ? 'kurva' : 'spela'} size={22} />}
    />,
  )
  if (svag && matt) {
    lagen.push(
      <Lage
        key="monster"
        h={{ slag: 'trana', etikett: 'Träna', href: svag.href, las: meny.trana.las }}
        rubrik={`Öva på ${svag.namn.toLowerCase()}`}
        text={`Mönstret du tappar mest på, ${svag.ratt} av ${svag.antal} rätt.`}
        ikon={<Ikon3 ikon="monster" size={24} />}
      />,
    )
  }
  if (!tranaArNivakoll || matt) {
    lagen.push(
      <Lage
        key="nivakoll"
        h={meny.nivakoll}
        rubrik="Nivåkollen"
        text={`Mät din nivå på ${omfang ? `${ORD[omfang.uppgifter] ?? omfang.uppgifter} uppgifter` : 'några uppgifter'}.${nk ? ` Senast ${kortDatumV(nk.dag)}: ${tal1(nk.niva)}.` : ''}`}
        chip={meny.nivakoll.las ? null : meny.nivakoll.meta ?? null}
        ikon={<Ikon3 ikon="kurva" size={24} />}
      />,
    )
  }
  if (prov) {
    lagen.push(
      <Lage
        key="prov"
        h={prov}
        rubrik={planNamn && kort.ingarIPlan ? prov.rubrik : 'Övningsprov mot klockan'}
        text={prov.text}
        ikon={<Ikon3 ikon="klocka" size={24} />}
      />,
    )
  }

  const antal = NIVA_TEST_ANTAL[kort.id].grund
  return (
    <div className="t3-satt" data-satt={kort.id}>
      {rubrik ? <h3 className="t3-h3">Välj hur du vill öva</h3> : null}
      <div className="t3-lagen">{lagen}</div>
      <div className="t3-fastrad">
        <span className="t3-fast-text">
          <b>Nivåtest.</b> {antal} uppgifter på en fast nivå, resultat i procent.
        </span>
        <span className="t3-fast-knappar">
          {meny.nivaer.map((n) => (
            <Fast key={n.zon} h={n} />
          ))}
        </span>
      </div>
    </div>
  )
}
