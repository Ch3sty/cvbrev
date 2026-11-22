/**
 * /hjalpcenter, publikt omgång 3: sidan utan egen skiss får grundens skal
 * (BYGGBRIEF beslut 10). Utseendegranskning 2 (2026-11-22): sidan var platt,
 * tre vita kort utan bild. Nu bär hjälten vägen genom jobbsöket (Stig), de
 * tre korten har var sin färg och var sin bild ur produkten (CV-arket,
 * brevmallarna, kontots två nivåer), och raden om den utbyggda hjälpen är
 * en ö. Bilderna är aria-hidden: texterna, rubrikerna och länkarna är
 * desamma som förut, ord för ord. Serverkomponent.
 */
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  Sida,
  Hjalte,
  Sektion,
  Rutnat,
  Knapp,
  TextLank,
  O,
  Chip,
  Dorr,
  Ikon,
  CvArk,
  Stig,
  MallMiniatyr,
  type Farg,
  type IkonNamn,
} from '@/components/publikt/v3'
import './hjalpcenter.css'

export const metadata: Metadata = {
  title: 'Hjälpcenter | Jobbcoach.ai',
  description:
    'Hjälp med Jobbcoach.ai: kom igång med kontot, skapa och redigera personliga brev, hantera betalning och prenumeration. Hittar du inte svaret, kontakta oss.',
  alternates: { canonical: 'https://www.jobbcoach.ai/hjalpcenter' },
}

type Kategori = {
  titel: string
  beskrivning: string
  amnen: string[]
  href: string
  farg: Farg
  ikon: IkonNamn
  bild: ReactNode
}

const KATEGORIER: Kategori[] = [
  {
    titel: 'Komma igång',
    beskrivning: 'Första stegen med Jobbcoach.ai',
    amnen: ['Skapa konto', 'Första brevet', 'Profilinställningar'],
    href: '/funktioner',
    farg: 'cv',
    ikon: 'cv',
    bild: (
      <span className="hc-ark">
        <CvArk liten />
      </span>
    ),
  },
  {
    titel: 'Personliga brev',
    beskrivning: 'Allt om att skapa och redigera brev',
    amnen: ['Skapa brev', 'Redigering', 'Export och format'],
    href: '/verktyg/personligt-brev',
    farg: 'brev',
    ikon: 'brev',
    bild: (
      <span className="hc-brev">
        <MallMiniatyr id="linne" typ="brev" namn={false} chip={false} alt="" />
        <MallMiniatyr id="koppar" typ="brev" namn={false} chip={false} alt="" />
      </span>
    ),
  },
  {
    titel: 'Konto & Fakturering',
    beskrivning: 'Hantera ditt konto och prenumeration',
    amnen: ['Betalning', 'Prenumerationer', 'Kontoinställningar'],
    href: '/priser',
    farg: 'tran',
    ikon: 'neutral',
    bild: (
      <span className="hc-konto">
        <span className="hc-konto-kort">
          <i>
            <Ikon namn="neutral" />
          </i>
          <b />
          <b />
          <Chip typ="gratis">Gratis</Chip>
        </span>
        <span className="hc-konto-kort hc-premium">
          <i>
            <Ikon namn="neutral" />
          </i>
          <b />
          <b />
          <Chip typ="koppar">Premium</Chip>
        </span>
      </span>
    ),
  },
]

export default function HjalpcenterPage() {
  return (
    <Sida>
      <main>
        <Hjalte
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Hjälpcenter', href: '/hjalpcenter' },
          ]}
          brodsmulorSchema={false}
          h1="Hjälpcenter"
          varde="Få hjälp med Jobbcoach.ai och optimera din karriärutveckling"
          bild={
            <div className="hc-hbild" aria-hidden="true">
              <Stig tyst={null} />
            </div>
          }
        />
        <Sektion className="hc-sek">
          <Rutnat kolumner={3}>
            {KATEGORIER.map((k) => (
              <Link key={k.titel} href={k.href} className="p3-kort hc-kort" data-p3-farg={k.farg}>
                <span className="hc-bild" aria-hidden="true">
                  {k.bild}
                </span>
                <div className="hc-huvud">
                  <Dorr ikon={k.ikon} />
                  <h3 className="p3-h3">{k.titel} </h3>
                </div>
                <p>{k.beskrivning} </p>
                <ul className="hc-amnen">
                  {k.amnen.map((a) => (
                    <li key={a}>{a} </li>
                  ))}
                </ul>
                <span className="hc-pil" aria-hidden="true">
                  <Ikon namn="pil" />
                </span>
              </Link>
            ))}
          </Rutnat>
        </Sektion>
        <Sektion luft="utan-topp">
          <O
            farg="jobb"
            ikon={false}
            som="div"
            rubrikNiva="h2"
            rubrik="Utbyggd hjälpsektion kommer snart"
            varde="Vi arbetar på att skapa en omfattande kunskapsbas med guider, FAQ och videotutorials"
            knappar={
              <>
                <Knapp href="/kontakt">Kontakta support</Knapp>
                <TextLank href="/funktioner">Se funktioner</TextLank>
              </>
            }
          />
        </Sektion>
      </main>
    </Sida>
  )
}
