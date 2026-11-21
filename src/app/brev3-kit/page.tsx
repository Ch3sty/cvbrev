/**
 * Förhandsvisning av brevrummets kit (BYGGSPEC avsnitt 6), bara under
 * utveckling: 404 i produktion. Ligger utanför det inloggade skalet så att den
 * går att granska utan konto och utan data, men med data-rum="brev" satt.
 *
 * Bilderna läses ur public/_brev3-kit/ som INTE checkas in (kopiera dit
 * skissens assets-src/*.webp). Saknas de ritas en vit platta med textrader.
 *
 * Varje del visas i sina lägen; ljust och mörkt växlas överst (eller
 * ?tema=mork), spärren öppnas med knapparna (eller ?sparr=nedladdning|vecka).
 */

import fs from 'node:fs'
import path from 'node:path'
import { Suspense, type CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import '../brev3.css'
import { BrevVagg, BrevFlikar, VaggArk } from '@/components/brev3/kit/BrevVagg'
import { BrevBana } from '@/components/brev3/kit/BrevBana'
import { ArkBunt } from '@/components/brev3/kit/ArkBunt'
import { StorKnapp, VitKnapp, Bricka, LitenKnapp, Chip, Tagg, MatarBricka, Formatmarken, Pips, KravBitar } from '@/components/brev3/kit/delar'
import { Golv, LyftPanel, PanelHuvud, SektionsHuvud } from '@/components/brev3/kit/LyftPanel'
import { MattRutnat, Matare, KravMitt, LangdMitt, MallMitt } from '@/components/brev3/kit/Matare'
import { Radkort, JobbKort, JobbRutnat, BrevKort, BrevRemsa, NyttBrevKort } from '@/components/brev3/kit/Kort'
import { ArbetsYta, ArbetsHuvud, MallKapsel, Avsnittsrad, Blad } from '@/components/brev3/kit/Arbete'
import { IkonBock, IkonDokument, IkonFlagga, IkonKopiera, IkonLas, IkonLaddaNer, IkonPenna, IkonPil, IkonTillbaka } from '@/components/brev3/kit/ikoner'
import { PAKETRADER, paywallPrisrad } from '@/components/paywall/paywall-copy'
import type { BrevSteg } from '@/lib/letters/brevmall/typer'
import { SparrVal, TemaVal } from './ForhandsKlient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Brevrummets kit', robots: { index: false, follow: false } }

const MAPP = path.join(process.cwd(), 'public', '_brev3-kit')

/** En av skissens bilder, eller en vit platta med textrader om den saknas. */
function Bild({ namn, alt = '', style }: { namn: string; alt?: string; style?: CSSProperties }) {
  if (fs.existsSync(path.join(MAPP, namn))) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/_brev3-kit/${namn}`} alt={alt} style={{ display: 'block', width: '100%', height: 'auto', ...style }} />
  }
  return (
    <svg viewBox="0 0 210 297" role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} style={{ display: 'block', width: '100%', height: 'auto', background: '#FFFFFF', ...style }}>
      <rect x="22" y="24" width="80" height="9" rx="2" fill="#2A2A33" />
      <rect x="22" y="38" width="60" height="4" rx="2" fill="#8A8A95" />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x="22" y={70 + i * 11} width={i % 5 === 4 ? 100 : 166} height="4" rx="2" fill="#C9C9D0" />
      ))}
    </svg>
  )
}

const BREV = 'linne-nordanvind.webp'

function Rubrik({ children, id }: { children: string; id?: string }) {
  return (
    <h2 id={id} className="b3-h2" style={{ margin: '48px 0 16px' }}>
      {children}
    </h2>
  )
}

/** En vägg-yta för att visa delar som står på väggen. */
function Vaggprov({ children, hojd }: { children: React.ReactNode; hojd?: number }) {
  return (
    <div className="b3-vagg" style={{ height: hojd ?? 'auto', padding: 20, borderRadius: 20 }}>
      <div className="b3-vagg-inre" style={{ maxWidth: 'none' }}>
        {children}
      </div>
    </div>
  )
}

const LAGEN: { namn: string; steg: BrevSteg | null; klara: BrevSteg[] }[] = [
  { namn: 'Ny: annonsen aktuell', steg: 'annonsen', klara: [] },
  { namn: 'Brevet aktuellt', steg: 'brevet', klara: ['annonsen'] },
  { namn: 'Läs igenom aktuell (Main)', steg: 'las-igenom', klara: ['annonsen', 'brevet'] },
  { namn: 'Skickat aktuell', steg: 'skickat', klara: ['annonsen', 'brevet', 'las-igenom'] },
  { namn: 'Allt klart', steg: null, klara: ['annonsen', 'brevet', 'las-igenom', 'skickat'] },
]

export default function Brev3KitSida() {
  if (process.env.NODE_ENV === 'production') notFound()

  const kravEtikett = 'Sex av sju krav besvaras i brevet. Engelska i tal och skrift saknas.'

  return (
    <div data-rum="brev" className="b3-sida" style={{ minHeight: '100vh' }}>
      {/* Verktygsraden */}
      <div style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--b3-kant)' }}>
        <p className="b3-eyebrow">Brevrummets kit · förhandsvisning under utveckling</p>
        <Suspense>
          <TemaVal />
        </Suspense>
      </div>

      {/* ============================ Main: väggen, panelen, korten ============================ */}
      <div id="main">
        <BrevVagg etikett="Nästa steg">
          <div className="hidden xl:block">
            <div className="b3-topp">
              <BrevFlikar aktiv="dina-brev" hrefDinaBrev="#main" hrefMallar="#mallar" />
              <div className="b3-cvrad">
                <span>
                  Bygger på CV:t <b>Erik Lindberg, projektledare</b>
                </span>
                <a href="#byt">Byt CV</a>
                <a href="#skriv">Skriv nytt brev</a>
              </div>
            </div>
            <div className="b3-hero">
              <div className="b3-hero-text">
                <p className="b3-ogon">Nästa steg · brevet till Nordanvind Energi</p>
                <h1 className="b3-h1">Läs igenom och skicka</h1>
                <p className="b3-ingress">Brevet är skrivet mot annonsen och ditt CV. Ett krav saknas, sedan är det klart att skicka.</p>
                <div className="b3-knapprad">
                  <StorKnapp href="#brevet">
                    Öppna brevet
                    <IkonPil />
                  </StorKnapp>
                  <span className="b3-sidorad">Skrivet i går. Brevet sparas av sig självt.</span>
                </div>
                <div className="b3-chips">
                  <Chip>
                    <IkonDokument size={16} className="text-[color:var(--koppar-ljus)]" />
                    Mallen Linne
                  </Chip>
                  <Chip>Inte skickat än</Chip>
                  <a href="#mallar">Byt mall</a>
                </div>
              </div>
              <div className="b3-hero-hoger">
                <p className="b3-stort">
                  <span className="b3-stort-tal" aria-hidden="true">
                    6
                  </span>
                  <span className="b3-stort-rad">
                    <span className="sr-only">6 </span>av 7 krav
                    <br />
                    <b>i annonsen</b>
                  </span>
                </p>
                <BrevBana form="dator" steg="las-igenom" klara={['annonsen', 'brevet']} />
                <ArkBunt
                  style={{ left: 316, top: 0 }}
                  overst={<Bild namn={BREV} />}
                  bakom={[<Bild key="k" namn="koppar-nordanvind.webp" />, <Bild key="ka" namn="kalksten-nordanvind.webp" />]}
                  alt="Ditt brev till Nordanvind Energi i mallen Linne"
                  etikett={
                    <Chip ljus href="#mallar">
                      Se det i fler mallar
                      <IkonPil size={15} />
                    </Chip>
                  }
                  etikettStil={{ right: -8, bottom: -30 }}
                />
              </div>
            </div>
          </div>

          <div className="xl:hidden">
            <BrevFlikar aktiv="dina-brev" hrefDinaBrev="#main" hrefMallar="#mallar" />
            <div className="b3-hero">
              <div className="b3-hero-text">
                <p className="b3-ogon">Nästa steg · Nordanvind Energi</p>
                <h1 className="b3-h1">Läs igenom och skicka</h1>
                <p className="b3-ingress">Ett krav saknas, sedan är brevet klart.</p>
              </div>
              <VaggArk href="#brevet" etikett="Ditt brev i mallen Linne. Sex av sju krav i annonsen har fått svar." tal={6} av={7}>
                <Bild namn={BREV} />
              </VaggArk>
            </div>
            <BrevBana form="mobil" steg="las-igenom" klara={['annonsen', 'brevet']} />
            <div style={{ marginTop: 14 }}>
              <StorKnapp href="#brevet">
                Öppna brevet
                <IkonPil />
              </StorKnapp>
            </div>
          </div>
        </BrevVagg>

        <Golv>
          <LyftPanel etikett="Så ligger brevet till">
            <PanelHuvud ogon="Så ligger brevet till" rubrik="Tre mått på brevet till Nordanvind Energi" rubrikMobil="Tre mått på brevet" lank={{ href: '#brevet', text: 'Öppna brevet' }} />
            <MattRutnat>
              <Matare
                etikett="Kraven i annonsen"
                bricka={<MatarBricka>1 krav saknas</MatarBricka>}
                rad={
                  <>
                    <b>Engelska i tal och skrift saknas.</b> En mening med ett exempel ur ditt CV räcker.
                  </>
                }
                radMobil={
                  <>
                    <b>Engelska i tal och skrift saknas.</b> En mening räcker.
                  </>
                }
              >
                <KravMitt besvarade={6} totalt={7} etikett={kravEtikett} />
              </Matare>
              <Matare
                etikett="Längden"
                bricka={<MatarBricka klar>En sida</MatarBricka>}
                brickaBaraDator
                rad={
                  <>
                    <b>Ryms på en sida, med luft kvar.</b> Det finns plats för meningen som saknas.
                  </>
                }
                radMobil={<b>Ryms på en sida.</b>}
              >
                <LangdMitt ord={150} andel={0.72} etikett="Brevet fyller knappt tre fjärdedelar av en sida." />
              </Matare>
              <Matare
                etikett="Mallen"
                bricka={<MatarBricka klar>Samma som ditt CV</MatarBricka>}
                brickaBaraDator
                rad={
                  <>
                    <b>Ansökan ser ut som en helhet.</b> <a href="#mallar">Byt mall</a>, texten följer med.
                  </>
                }
                radMobil={
                  <>
                    <b>Samma som ditt CV.</b> <a href="#mallar">Byt mall</a>
                  </>
                }
              >
                <MallMitt namn="Linne" rad="Samma huvud som CV:t" etikett="Ditt CV och ditt brev i mallen Linne, sida vid sida" cv={<Bild namn="cv-linne.webp" />} brev={<Bild namn={BREV} />} />
              </Matare>
            </MattRutnat>
          </LyftPanel>

          <SektionsHuvud rubrik="Dina brev" under="Varje brev du skriver sparas här av sig självt. De två senaste är öppna på gratisnivån." underMobil="Sparas av sig självt. De två senaste är öppna på gratisnivån." lank={{ href: '#skriv', text: 'Skriv nytt brev' }} />
          <BrevRemsa>
            <BrevKort lage="vald" href="#brevet" foretag="Nordanvind Energi" roll="IT-projektledare till kundplattformen" rollMobil="IT-projektledare" status={<Tagg ton="p">Inte skickat</Tagg>} sidotext="Skrivet i går">
              <Bild namn={BREV} />
            </BrevKort>
            <BrevKort
              lage="vanlig"
              href="#brevet"
              foretag="Hamnstadens Bostäder"
              roll="Projektledare, digitala hyresgästtjänster"
              rollMobil="Projektledare"
              status={
                <Tagg ton="g" bock>
                  Sökt 14 nov
                </Tagg>
              }
              sidotext="I Sökta tjänster"
            >
              <Bild namn="linne-hamnstaden.webp" />
            </BrevKort>
            <BrevKort
              lage="last"
              href="#brevet"
              foretag="Tallbacka Logistik"
              roll="Projektledare IT. Går att läsa och kopiera."
              rollMobil="Går att läsa och kopiera"
              status={
                <Tagg ton="p" las>
                  Låst
                </Tagg>
              }
              sidotext={<a href="#kop">{PAKETRADER.ingar}</a>}
            >
              <Bild namn="linne-hamnstaden.webp" />
            </BrevKort>
            <div className="hidden xl:contents">
              <NyttBrevKort href="#skriv" kvot={{ lage: 'slut', nasta: 'fredag 27 nov' }} />
            </div>
          </BrevRemsa>
          <div className="xl:hidden" style={{ marginTop: 12 }}>
            <NyttBrevKort href="#skriv" kvot={{ lage: 'slut', nasta: 'fredag 27 nov' }} />
          </div>
          <div style={{ marginTop: 14 }}>
            <Radkort variant="prem" ikon={<IkonLas size={22} strokeWidth={2.4} />} rubrik="Ladda ner breven som PDF och Word, och skriv utan veckotak" text={paywallPrisrad()} handling={<LitenKnapp kop>{PAKETRADER.kopCv}</LitenKnapp>} />
          </div>

          <SektionsHuvud rubrik="Jobb att skriva till" under="Ur dina matchningar, valda mot ditt CV. Annonsen följer med in i brevet, så du slipper klistra." underMobil="Ur dina matchningar. Annonsen följer med in i brevet." lank={{ href: '#matchningar', text: 'Alla matchningar' }} />
          <JobbRutnat>
            <JobbKort tagg="Ny i natt" sistaDag="Sista dag 6 dec" titel="Projektledare, systembyte" foretag="Tallbacka Logistik" ort="Göteborg" skal="Passar ditt CV: införandeprojekt och leverantörsstyrning." handling={<LitenKnapp>Skriv brev</LitenKnapp>} />
            <JobbKort tagg="Ny i natt" sistaDag="Sista dag 9 dec" titel="Agil projektledare" foretag="Hamnstadens Bostäder" ort="Malmö" skal="Passar ditt CV: agilt arbetssätt och team på tolv." handling={<LitenKnapp>Skriv brev</LitenKnapp>} />
            <JobbKort tagg="I tisdags" sistaDag="Sista dag 30 nov" titel="Programledare, digitalisering" foretag="Nordanvind Energi" ort="Sundsvall" skal="Passar ditt CV: budget på 15 miljoner och styrgrupp." handling={<LitenKnapp>Skriv brev</LitenKnapp>} />
          </JobbRutnat>

          <div className="mt-6 grid gap-2.5 xl:mt-11 xl:grid-cols-2 xl:gap-3">
            <Radkort ikon={<IkonDokument />} ogon="CV:t som breven bygger på" rubrik="Erik Lindberg, projektledare" text="Ändrar du i CV:t skrivs nästa brev efter det nya." textBaraDator handling={<LitenKnapp>Öppna CV:t</LitenKnapp>} />
            <Radkort ikon={<IkonBock size={24} strokeWidth={2.2} />} ogon="Sökta tjänster · 1 ansökan" rubrik="Håll ordning på det du har sökt" text="Brevet, annonsen och datumet, och när det är dags att följa upp." textBaraDator handling={<LitenKnapp>Öppna</LitenKnapp>} />
          </div>
        </Golv>
      </div>

      {/* ============================ Delarna, var för sig ============================ */}
      <div style={{ padding: '0 16px 80px', maxWidth: 1180, margin: '0 auto' }}>
        <Rubrik id="banan">Brevets väg i alla lägen</Rubrik>
        <div className="grid gap-4">
          {LAGEN.map((l) => (
            <div key={l.namn} className="grid items-end gap-4 xl:grid-cols-[600px_1fr]">
              <Vaggprov hojd={undefined}>
                <p className="b3-ogon" style={{ marginBottom: 8 }}>
                  {l.namn}
                </p>
                <div style={{ position: 'relative', height: 300, overflowX: 'auto', overflowY: 'hidden' }}>
                  <div style={{ position: 'relative', width: 580, height: 340 }}>
                    <BrevBana form="dator" steg={l.steg} klara={l.klara} />
                  </div>
                </div>
              </Vaggprov>
              <Vaggprov>
                <BrevBana form="mobil" steg={l.steg} klara={l.klara} />
              </Vaggprov>
            </div>
          ))}
        </div>

        <Rubrik id="mallar">Väggen med kulle och brickor (Mallar)</Rubrik>
        <BrevVagg kulle hojd={300} hojdMobil={300} className="rounded-[20px]">
          <BrevFlikar aktiv="mallar" hrefDinaBrev="#main" hrefMallar="#mallar" />
          <p className="b3-ogon" style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            Du provar mallen Koppar
            <Tagg ton="p" las liten>
              {PAKETRADER.bricka}
            </Tagg>
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Bricka href="#brevet">
              <IkonPenna />
              Ändra texten
            </Bricka>
            <Bricka>
              <span style={{ font: '600 18px/1 Georgia, serif' }}>Aa</span>Typsnitt: Inter
            </Bricka>
          </div>
        </BrevVagg>

        <Rubrik id="knappar">Knappar och små delar på väggen</Rubrik>
        <Vaggprov>
          <div className="flex flex-wrap items-center gap-4">
            <StorKnapp>
              Skriv nästa brev
              <IkonPil />
            </StorKnapp>
            <VitKnapp href="#sokta">Öppna Sökta tjänster</VitKnapp>
            <Bricka>
              <IkonPenna />
              Ändra texten
            </Bricka>
            <Chip>Inte skickat än</Chip>
            <Chip ljus href="#mallar">
              Se det i fler mallar
              <IkonPil size={15} />
            </Chip>
            <Chip glas>Ditt CV</Chip>
            <Formatmarken />
            <Pips fyllda={2} totalt={3} storlek="stor" etikett="Två av dina tre brev är skickade" />
            <a className="b3-kryss" href="#main" aria-label="Tillbaka till dina brev">
              <IkonTillbaka />
            </a>
            <MallKapsel namn="Linne" miniatyr={<Bild namn={BREV} />} href="#mallar" />
            <span className="b3-sparat">
              <IkonBock size={15} strokeWidth={3} className="text-[color:var(--ljus)]" />
              Sparat
            </span>
            <span className="b3-skrivbricka">
              <IkonPenna size={16} />
              Skriver stycke 2 av 4
            </span>
          </div>
        </Vaggprov>

        <Rubrik id="papper">Knappar och små delar på papper</Rubrik>
        <div className="b3-panel" style={{ marginTop: 0 }}>
          <div className="flex flex-wrap items-center gap-3">
            <LitenKnapp>Skriv brev</LitenKnapp>
            <LitenKnapp kop>{PAKETRADER.kopCv}</LitenKnapp>
            <LitenKnapp saknas>Lägg till i brevet</LitenKnapp>
            <LitenKnapp>
              <IkonKopiera />
              Kopiera text
            </LitenKnapp>
            <StorKnapp lag platt>
              <IkonLaddaNer />
              Ladda ner PDF
            </StorKnapp>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Tagg ton="p">Inte skickat</Tagg>
            <Tagg ton="p" las>
              Låst
            </Tagg>
            <Tagg ton="g" bock>
              Sökt 14 nov
            </Tagg>
            <Tagg ton="g">Gratis</Tagg>
            <Tagg ton="n">Ny i natt</Tagg>
            <MatarBricka>1 krav saknas</MatarBricka>
            <MatarBricka klar>En sida</MatarBricka>
            <Formatmarken yta="papper" />
            <Pips fyllda={1} totalt={1} etikett="Veckans gratisbrev används nu" />
            <Pips fyllda={1} totalt={3} etikett="Ett av tre" />
            <span className="b3-premium-rad">{PAKETRADER.bricka}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <KravBitar besvarade={6} totalt={7} etikett={kravEtikett} />
            <KravBitar besvarade={3} totalt={3} etikett="Alla tre krav besvaras" />
            <div className="b3-seg" role="group" aria-label="Brevets språk">
              <button type="button" aria-pressed="true">
                Svenska
              </button>
              <button type="button" aria-pressed="false">
                English
              </button>
            </div>
            <span style={{ width: 220 }}>
              <span className="b3-lop">
                <i />
              </span>
            </span>
          </div>
        </div>

        <Rubrik id="kort">Kort: radkort, nytt brev i tre lägen, mätare utan kravmått</Rubrik>
        <div className="grid gap-3">
          <Radkort variant="streckad" ikon={<IkonPil />} rubrik="Streckad rad" text="Som telefonens Skriv nytt brev." />
          <div className="grid gap-3 xl:grid-cols-3">
            <NyttBrevKort href="#skriv" kvot={{ lage: 'kvar' }} />
            <NyttBrevKort href="#skriv" kvot={{ lage: 'slut', nasta: 'fredag 27 nov' }} />
            <NyttBrevKort href="#skriv" kvot={null} />
          </div>
          <div className="b3-panel" style={{ marginTop: 8 }}>
            <PanelHuvud ogon="Så ligger brevet till" rubrik="Två mått på brevet till Nordanvind Energi" rubrikMobil="Två mått på brevet" />
            <MattRutnat antal={2}>
              <Matare etikett="Längden" bricka={<MatarBricka>Går över till sida två</MatarBricka>} rad={<><b>Rekryterare läser sällan längre än en sida.</b> Korta ett stycke.</>}>
                <LangdMitt ord={420} andel={1.15} etikett="Brevet går över till sida två." />
              </Matare>
              <Matare etikett="Mallen" bricka={<MatarBricka klar>Samma som ditt CV</MatarBricka>} brickaBaraDator rad={<><b>Ansökan ser ut som en helhet.</b> <a href="#mallar">Byt mall</a>, texten följer med.</>}>
                <MallMitt namn="Linne" rad="Samma huvud som CV:t" etikett="CV och brev i samma mall" cv={<Bild namn="cv-linne.webp" />} brev={<Bild namn={BREV} />} />
              </Matare>
            </MattRutnat>
          </div>
        </div>

        <Rubrik id="sparr">Spärren</Rubrik>
        <Suspense>
          <SparrVal brev={<Bild namn={BREV} alt="Ditt brev i mallen Linne, hela sidan" />} />
        </Suspense>
      </div>

      {/* ============================ Arbetsläget: Brevet ============================ */}
      <div id="brevet">
        <ArbetsYta
          huvud={
            <ArbetsHuvud
              tillbakaHref="#main"
              rubrik="Ditt brev till Nordanvind Energi"
              rubrikMobil="Nordanvind Energi"
              underrad="IT-projektledare till kundplattformen"
              underradMobil="Sparat · 6 av 7 krav"
              sparstatus="sparat"
              mallKapsel={<MallKapsel namn="Linne" miniatyr={<Bild namn={BREV} />} href="#mallar" mobil="byt" />}
              klarHref="#main"
            />
          }
          avsnitt={
            <Avsnittsrad
              aktiv="kraven"
              avsnitt={[
                { id: 'kraven', namn: 'Kraven', href: '?flik=kraven' },
                { id: 'texten', namn: 'Texten', href: '?flik=texten' },
                { id: 'ton', namn: 'Ton och språk', href: '?flik=ton' },
                { id: 'typsnitt', namn: 'Typsnitt', href: '?flik=typsnitt' },
                { id: 'info', namn: 'Titel och företag', href: '?flik=info' },
              ]}
            />
          }
          blad={
            <Blad
              id="kraven"
              rubrik="Kraven i annonsen"
              sidorad="6 av 7 har fått svar i brevet"
              sidoradMobil="6 av 7"
              hojd={752}
              fotRad={
                <>
                  Läs och kopiera ingår gratis. <span className="b3-premium-rad">{PAKETRADER.bricka}</span> PDF och Word.
                </>
              }
              fot={
                <>
                  <LitenKnapp>
                    <IkonKopiera />
                    Kopiera text
                  </LitenKnapp>
                  <LitenKnapp>Word</LitenKnapp>
                  <StorKnapp lag platt className="xl:ml-auto">
                    <IkonLaddaNer />
                    Ladda ner PDF
                  </StorKnapp>
                </>
              }
              botten={
                <>
                  <span className="b3-sokt-ik" aria-hidden="true">
                    <IkonFlagga />
                  </span>
                  <span style={{ flex: 1, fontSize: 13, lineHeight: '18px', color: 'var(--b3-ink-2)' }}>
                    <b style={{ display: 'block', fontSize: 14, lineHeight: '18px', color: 'var(--b3-ink)' }}>Har du skickat ansökan?</b>
                    Brevet, annonsen och datumet hamnar i Sökta tjänster.
                  </span>
                  <LitenKnapp>Markera som sökt</LitenKnapp>
                </>
              }
            >
              {[
                ['Leda stora införanden', '”en ny mobilbanksplattform för 1,2 miljoner kunder”'],
                ['Budget- och teamansvar', '”tolv personer och en budget på 15 miljoner kronor”'],
                ['Hålla ihop leverantörer och verksamhet', '”utvecklare, leverantörer och verksamhet i samma plan”'],
                ['Agilt arbetssätt', '”Jag har infört agilt arbetssätt”'],
                ['Rapportera till styrgrupp', '”hellre en risk för tidigt än för sent”'],
                ['Driftsäkerhet och regelefterlevnad', '”desamma som i banken”'],
              ].map(([k, c], i) => (
                <div key={k} className="b3-kr">
                  <span className="b3-kr-nr">{i + 1}</span>
                  <span className="b3-kr-text">
                    <b>{k}</b>
                    <small>{c}</small>
                  </span>
                </div>
              ))}
              <div className="b3-saknas">
                <div className="b3-saknas-topp">
                  <span className="b3-kr-nr">7</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b>Engelska i tal och skrift</b>
                    <span>Står i annonsen men inte i brevet. Ditt CV säger: engelska, flytande.</span>
                  </span>
                </div>
                <label htmlFor="kit-mening" className="sr-only">
                  Skriv en mening om din engelska
                </label>
                <textarea id="kit-mening" placeholder="En mening med ett exempel ur ditt CV räcker." />
                <div className="b3-saknas-fot">
                  <span className="b3-saknas-rad">Meningen läggs sist i tredje stycket. Du ser den på arket direkt.</span>
                  <LitenKnapp saknas>Lägg till i brevet</LitenKnapp>
                </div>
              </div>
            </Blad>
          }
          ark={<Bild namn={BREV} alt="Ditt brev i mallen Linne" style={{ borderRadius: 8, boxShadow: '0 5px 0 #1C0A18,0 30px 60px rgba(0,0,0,.4)' }} />}
          arkRad={
            <>
              <b>Siffrorna visar var brevet svarar på kraven.</b> Tryck på ett stycke på arket för att ändra texten.
            </>
          }
        />
      </div>

      {/* ============================ Arbetsläget: Skriv ============================ */}
      <div id="skriv">
        <ArbetsYta
          telefonArk="litet"
          huvud={<ArbetsHuvud tillbakaHref="#main" rubrik="Nytt brev" underrad="IT-projektledare, Nordanvind Energi" sparstatus="auto" mallKapsel={<MallKapsel namn="Linne" miniatyr={<Bild namn={BREV} />} onClick={undefined} href="#mallar" />} />}
          telefonArkSida={
            <>
              <span className="b3-skrivbricka">
                <IkonPenna size={16} />
                Skriver stycke 2 av 4
              </span>
              <span className="b3-lop vagg" style={{ marginTop: 12 }}>
                <i />
              </span>
              <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: '19px', color: 'var(--vagg-mjuk)' }}>Läser annonsens krav mot ditt CV. Tar 10 till 15 sekunder.</p>
            </>
          }
          blad={
            <Blad
              rubrik="Annonsen och valen"
              sidorad="Allt går att ändra efteråt"
              hojd={780}
              fot={
                <>
                  <Pips fyllda={1} totalt={1} etikett="Veckans gratisbrev används nu" />
                  <span style={{ fontSize: 13, lineHeight: '18px', color: 'var(--b3-ink-2)' }}>
                    <b style={{ color: 'var(--b3-ink)' }}>Det här är veckans gratisbrev.</b> Nästa fredag 27 nov.{' '}
                    <span className="b3-premium-rad" style={{ height: 22, padding: '0 8px', borderRadius: 11 }}>{`Utan tak i ${PAKETRADER.bricka}`}</span>
                  </span>
                  <LitenKnapp className="xl:ml-auto">Avbryt</LitenKnapp>
                </>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
                <div>
                  <label className="b3-eyebrow" htmlFor="kit-annons" style={{ display: 'block', marginBottom: 6 }}>
                    Annonsen
                  </label>
                  <textarea id="kit-annons" className="b3-annons" defaultValue="IT-projektledare till kundplattformen. Nordanvind Energi bygger om sin kundplattform och söker dig som har lett stora införanden med både budget- och teamansvar. Du håller ihop leverantörer och verksamhet, arbetar agilt och rapporterar till styrgrupp." />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p className="b3-eyebrow">Krav vi läst ut ur annonsen</p>
                    <span style={{ font: '700 13px/18px Inter, sans-serif', color: 'var(--b3-gron-ink)' }}>3 av 7 har fått svar</span>
                  </div>
                  <div className="b3-kravchips" role="img" aria-label="Tre av sju krav har fått ett svar i brevet så här långt.">
                    {['Leda stora införanden', 'Budget- och teamansvar', 'Leverantörer och verksamhet'].map((k) => (
                      <span key={k} data-ok="">
                        <i>
                          <IkonBock size={11} strokeWidth={4} />
                        </i>
                        {k}
                      </span>
                    ))}
                    {['Agilt arbetssätt', 'Rapportera till styrgrupp', 'Engelska i tal och skrift'].map((k) => (
                      <span key={k}>
                        <i />
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p className="b3-eyebrow">Tonen</p>
                    <div className="b3-seg" role="group" aria-label="Brevets språk">
                      <button type="button" aria-pressed="true">
                        Svenska
                      </button>
                      <button type="button" aria-pressed="false">
                        English
                      </button>
                    </div>
                  </div>
                  <div className="b3-ton">
                    <button type="button" aria-pressed="true">
                      <b>Balanserad</b>
                      <small>Saklig men varm</small>
                    </button>
                    <button type="button" aria-pressed="false">
                      <b>Professionell</b>
                      <small>Saklig och formell</small>
                    </button>
                    <button type="button" aria-pressed="false">
                      <b>Självsäker</b>
                      <small>Leder med resultat</small>
                    </button>
                    <button type="button" aria-pressed="false">
                      <b>Entusiastisk</b>
                      <small>Varm, energisk</small>
                    </button>
                    <button type="button" aria-pressed="false">
                      <b>Kreativ</b>
                      <small>Vågar sticka ut</small>
                    </button>
                    <button type="button" data-las="">
                      <b>Vi väljer ton åt dig</b>
                      <small>
                        <IkonLas size={11} />
                        {PAKETRADER.ingar}
                      </small>
                    </button>
                  </div>
                </div>
              </div>
            </Blad>
          }
          ark={<Bild namn="linne-skriver.webp" alt="Brevet skrivs i mallen Linne" style={{ borderRadius: 8, boxShadow: '0 5px 0 #1C0A18,0 30px 60px rgba(0,0,0,.4)' }} />}
          arkRad={
            <>
              <b>Linne, samma mall som ditt CV.</b> Du provar andra mallar när brevet är klart.
            </>
          }
        />
      </div>
    </div>
  )
}
