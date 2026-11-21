/**
 * Förhandsvisning av Jobbsökets kit (Jobbsöket omgång 1, etapp 1B), bara
 * under utveckling: 404 i produktion. Ligger utanför det inloggade skalet så
 * att den går att granska utan konto och utan data, men med data-rum="jobb".
 *
 * Överst en exempelvägg uppbyggd som skissens Main (dator) och
 * Mobil-oversikt (telefon) med påhittad data (Elin), sedan varje del i sina
 * lägen. ?tema=mork|ljus väljer läge, ?ark=1 öppnar arket.
 */

import { Suspense, type ReactNode } from 'react'
import { notFound } from 'next/navigation'
import '../jobb3.css'
import PaywallCard from '@/components/paywall/PaywallCard'
import {
  JobbVagg,
  VaggHero,
  VaggText,
  Knapprad,
  Chips,
  Golv,
  FastFot,
  StorKnapp,
  LitenKnapp,
  IkonKnapp,
  GlasKnapp,
  TextLank,
  Chip,
  VaggEtikett,
  VeckansMal,
  StorBricka,
  VaggBricka,
  Bricka,
  Tagg,
  StatusPiller,
  DatumBricka,
  DatumRuta,
  Prickar,
  Rutor,
  UppMarke,
  KompetensRad,
  Matchring,
  FyrstegsBana,
  JobbsokBana,
  JobbsokBanaNy,
  TjanstBana,
  FrageBana,
  LyftPanel,
  PanelHuvud,
  SektionsHuvud,
  GruppHuvud,
  Kort,
  TonYta,
  Spalter,
  Avsnitt,
  GoraKort,
  GoraLista,
  TjanstRad,
  SidoRad,
  SparadKort,
  SparadLista,
  TraffKort,
  Traffar,
  TraffRad,
  TraffLista,
  FilterRad,
  Fakta,
  FaktaRutor,
  KravLista,
  Passar,
  AnnonsText,
  KravRutor,
  Handelsebana,
  Snabbval,
  FragaKort,
  FragaAllt,
  Fragor,
  StarBrickor,
  Bedomning,
  Faktorer,
  Tratt,
  Veckostaplar,
  Kanaler,
  ManadVal,
  StegKort,
  StegKortRad,
  Notis,
  EtikettTag,
  Punkter,
  TjanstHuvud,
  VaggRuta,
  RutaRad,
  VaggTal,
  StortTal,
  StegFack,
  VaggBrickLag,
  MejlUtkast,
  LinjeratSvar,
  Hak,
  Markor,
  RapportBlad,
  Samtal,
  JagBubbla,
  SvarBubbla,
  Kallrad,
  FragaForslag,
  ForslagLista,
  Inmatning,
  KvotPrickar,
  TomtLage,
  Felruta,
  SparrRam,
  VaggSkelett,
  PanelSkelett,
  RadSkelett,
  SokFalt,
  Kryss,
  IkonPil,
  IkonPlus,
  IkonPenna,
  IkonKalender,
  IkonMejl,
  IkonOga,
  IkonPrat,
  IkonRutnat,
  IkonBokmark,
  IkonBock,
  IkonVaska,
  IkonFlagga,
  IkonAvslag,
  IkonKopiera,
  IkonSkrivare,
  IkonLasUpp,
  IkonSkold,
  IkonPilUpp,
  IkonSkicka,
  IkonKlocka,
  IkonDokument,
} from '@/components/jobb3/kit'
import { ArkDemo, BrytDemo, TemaVal, VaxelDemo } from './KitKlient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Jobbsökets kit', robots: { index: false, follow: false } }

function Del({ rubrik, children, id }: { rubrik: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} style={{ marginTop: 56 }}>
      <h2 className="j3-h2" style={{ marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid var(--j3-kant)' }}>
        {rubrik}
      </h2>
      {children}
    </section>
  )
}

function Rad({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginTop: 12 }}>{children}</div>
}

/** En liten vägg för att visa delar som står på väggen. */
function Vaggprov({ children }: { children: ReactNode }) {
  return (
    <div className="j3-vagg" style={{ minHeight: 0, padding: 20, borderRadius: 20, marginTop: 12 }}>
      <div className="j3-vagg-inre" style={{ maxWidth: 'none' }}>
        {children}
      </div>
    </div>
  )
}

const LOGGA = (
  <GlasKnapp href="#logga" ikon={<IkonPlus />}>
    Logga sökt tjänst
  </GlasKnapp>
)

/** Platshållare för kontots åtgärder (i vyerna: <Topprad bara="atgarder" />). */
function Atgarder() {
  return (
    <span style={{ display: 'flex', gap: 4 }}>
      {[IkonPrat, IkonKlocka, IkonOga].map((I, i) => (
        <span key={i} style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vagg-mjuk)' }}>
          <I size={20} />
        </span>
      ))}
    </span>
  )
}

const FRAGOR = [
  { nr: 1, rubrik: 'Berätta om dig själv', href: '#f1', lage: 'klar' as const, betyg: 4, betygOrd: 'Starkt' },
  { nr: 2, rubrik: 'Styrkor och svagheter', href: '#f2', lage: 'ny' as const, under: 'Inte gjord än' },
  { nr: 3, rubrik: 'Varför ska vi anställa dig', href: '#f3', lage: 'ny' as const, under: 'Inte gjord än' },
  { nr: 4, rubrik: 'Varför söker du jobbet', href: '#f4', lage: 'klar' as const, betyg: 3, betygOrd: 'Godkänt' },
  { nr: 5, rubrik: 'Ett problem du löste', href: '#f5', lage: 'nasta' as const, betyg: 2, betygOrd: 'Tunt', under: 'resultatet saknades', underKoppar: true },
  { nr: 6, rubrik: 'En konflikt', href: '#f6', lage: 'ny' as const, under: 'Inte gjord än' },
  { nr: 7, rubrik: 'Ett misstag', href: '#f7', lage: 'ny' as const, under: 'Inte gjord än' },
]

export default function Jobb3KitSida() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div data-rum="jobb" className="j3-sida" style={{ minHeight: '100vh' }}>
      {/* ======================================================= exempelväggen: Main och Mobil-oversikt */}
      <div id="main">
        <JobbVagg
          hojd={596}
          hojdMobil={500}
          flik="oversikt"
          handling={LOGGA}
          etikett="Läget och nästa steg"
        >
          <VaggHero
            spalt={480}
            glapp={28}
            bild={
              <JobbsokBana
                etikett="Dina sökta tjänster på väg mot ett erbjudande: två sparade att söka, fyra sökta som väntar svar varav en har varit tyst i 15 dagar, två i intervju varav en är bokad på tisdag, inget erbjudande än."
                skaSokas={{ brickor: [{ kod: 'ÅL' }, { kod: 'VO' }], under: '2 sparade' }}
                sokt={{ brickor: [{ kod: 'NO', tyst: true, tagg: 'tyst 15 dagar' }, { kod: 'UK' }, { kod: 'RV' }, { kod: 'KO' }], under: '4 väntar svar', underMobil: '4, en tyst' }}
                intervju={{ brickor: [{ kod: 'UE', tagg: 'tis 10.00' }, { kod: 'LF' }], under: '1 bokad, 1 väntar besked', underMobil: '2 på gång' }}
                erbjudande={{ brickor: [] }}
              />
            }
          >
            <VaggText
              ogon="Lördag 21 nov · vecka 47"
              ogonMobil="Lör 21 nov · vecka 47"
              ogonHoger={<VeckansMal kompakt antal={2} mal={3} />}
              rubrik="Intervju på Umeå Energi på tisdag"
              ingress="Redovisningsekonom, tisdag 24 november klockan 10.00. Du har övat på tre av de sju vanligaste frågorna."
              ingressMobil="Redovisningsekonom, klockan 10.00. Tre av sju frågor övade."
            />
            <Knapprad rad="En kvart räcker. Vi börjar med frågan du fick 2 av 5 på.">
              <StorKnapp href="#tjanst">
                Förbered intervjun
                <IkonPil />
              </StorKnapp>
            </Knapprad>
            <Chips dator>
              <VeckansMal antal={2} mal={3} andraHref="#mal" />
            </Chips>
          </VaggHero>
        </JobbVagg>

        <Golv>
          <LyftPanel rubrikId="gora-rubrik">
            <PanelHuvud ogon="Att göra nu" rubrik="Tre saker som för jobbsöket framåt" rubrikId="gora-rubrik" hoger="Ordnade efter datum. Det som brinner står först." />
            <GoraLista>
              <GoraKort ton="nu" ikon={<IkonKalender />} nar="Tisdag 24 nov 10.00" rubrik="Förbered intervjun på Umeå Energi" rubrikMobil="Förbered intervjun" text="Tre av sju frågor övade. Börja med Ett problem du löste, där fick du 2 av 5." textMobil="Umeå Energi. Tre av sju frågor övade." href="#tjanst" knapp="Förbered intervjun" />
              <GoraKort ton="tyst" ikon={<IkonMejl />} nar="Tyst i 15 dagar" rubrik="Följ upp Norrmejerier" text="Ekonomiassistent, sökt 6 november. Ett kort mejl brukar ge besked, och utkastet är skrivet." textMobil="Utkastet till mejlet är skrivet." href="#mejl" knapp="Öppna utkastet" />
              <GoraKort ikon={<IkonPenna />} nar="Sista dag torsdag 26 nov" rubrik="Sök Ålö före torsdag" text="Ekonomiassistent, 92 % matchgrad. Annonsen ligger redan ifylld i brevet." textMobil="Ekonomiassistent, 92 % matchgrad." href="#annons" knapp="Skriv brevet" />
            </GoraLista>
          </LyftPanel>

          <Avsnitt rubrikId="nya-rubrik">
            <SektionsHuvud rubrikId="nya-rubrik" rubrik="4 nya jobb som passar dig" under="Sedan du tittade i tisdags. Vi har läst 600 annonser hos Arbetsförmedlingen mot ditt CV." lank={{ href: '#jobb', text: 'Alla 25 träffar', textMobil: 'Alla 25' }} />
            <Traffar>
              <TraffKort procent={92} titel="Ekonomiassistent" var="Ålö AB, Umeå" ny skal={['Din roll matchar', '6 av 7 kompetenser i kravprofilen']} dag="Sista dag 26 nov, 5 dagar kvar" snart href="#annons" knapp={{ text: 'Skriv brev', href: '#brev' }} />
              <TraffKort procent={88} titel="Redovisningsassistent" var="Volvo Lastvagnar, Umeå" ny skal={['2 av dina 3 roller', '5 av 6 kompetenser i kravprofilen']} dag="Sista dag 30 nov" href="#annons" knapp={{ text: 'Skriv brev', href: '#brev' }} />
              <TraffKort procent={84} titel="Ekonomiadministratör" var="Skellefteå Kraft, distans" ny skal={['Din roll matchar', 'Distans, som du har valt']} dag="Sista dag 6 dec" href="#annons" knapp={{ text: 'Skriv brev', href: '#brev' }} />
            </Traffar>
          </Avsnitt>

          <Spalter sido={380}>
            <section aria-labelledby="sokta-rubrik">
              <SektionsHuvud rubrikId="sokta-rubrik" rubrik="Sökta tjänster" lank={{ href: '#sokta', text: 'Alla 9' }} />
              <Kort lista>
                <TjanstRad bricka={{ kod: 'UE' }} rubrik="Umeå Energi, Redovisningsekonom" rubrikMobil="Umeå Energi" text="Kallad till intervju 13 nov. Intervjun är på tisdag 10.00." textMobil="Redovisningsekonom. Intervjun är på tisdag 10.00." steg={{ steg: 3 }} status={{ status: 'intervju', text: 'Intervju bokad' }} href="#tjanst" />
                <TjanstRad bricka={{ kod: 'LF' }} rubrik="Länsförsäkringar Västerbotten, Ekonomiassistent" rubrikMobil="Länsförsäkringar Västerbotten" text="Intervju genomförd 18 nov. Väntar på besked." textMobil="Ekonomiassistent. Intervju genomförd 18 nov." steg={{ steg: 3 }} status={{ status: 'vantar-besked' }} href="#tjanst" />
                <TjanstRad bricka={{ kod: 'NO', ton: 'tyst' }} rubrik="Norrmejerier, Ekonomiassistent" rubrikMobil="Norrmejerier" text="Sökt för 15 dagar sedan, inget svar än. Följ upp med ett kort mejl." textMobil="Ekonomiassistent. Sökt för 15 dagar sedan, inget svar än." steg={{ steg: 1, tyst: true }} status={{ status: 'folj-upp' }} href="#mejl" />
                <TjanstRad bricka={{ kod: 'KO' }} rubrik="Komatsu Forest, Ekonomiassistent" rubrikMobil="Komatsu Forest" text="Sökt för 2 dagar sedan. Svar brukar dröja en till två veckor." textMobil="Ekonomiassistent. Sökt för 2 dagar sedan." steg={{ steg: 1 }} status={{ status: 'vantar' }} href="#tjanst" />
              </Kort>
            </section>
            <aside aria-labelledby="mer-rubrik">
              <SektionsHuvud rubrikId="mer-rubrik" rubrik="Mer i Jobbsöket" />
              <Kort lista>
                <SidoRad ikon={<IkonOga />} rubrik="Bli upptäckt" text="12 rekryterare har sett din anonyma profil." href="#upptackt" hoger={<StatusPiller status="folj-upp">1 väntar</StatusPiller>} />
                <SidoRad ikon={<IkonPrat />} rubrik="Jobbcoachen" text="Fråga om lön, uppsägningstid eller hur du svarar en arbetsgivare." href="#coach" />
                <SidoRad ikon={<IkonRutnat />} ikonTon="test" rubrik="Har du ett rekryteringstest på gång?" text="Kolla din nivå, 8 minuter. Till Rekryteringstester." href="#tester" />
              </Kort>
            </aside>
          </Spalter>

          <FastFot>
            <LitenKnapp storlek={52} bred href="#logga" ikon={<IkonPlus size={20} />}>
              Logga sökt tjänst
            </LitenKnapp>
          </FastFot>
        </Golv>
      </div>

      {/* ======================================================= galleriet */}
      <Golv>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', marginTop: 40, padding: '16px 0', borderTop: '2px solid var(--j3-kant)' }}>
          <p className="j3-eyebrow">Jobbsökets kit · förhandsvisning under utveckling</p>
          <Suspense>
            <TemaVal />
          </Suspense>
        </div>

        <Del rubrik="Knappar">
          <Rad>
            <StorKnapp href="#x">
              Förbered intervjun
              <IkonPil />
            </StorKnapp>
            <StorKnapp storlek="mellan" golv href="#x">
              Skriv brev
              <IkonPil />
            </StorKnapp>
            <StorKnapp storlek="lag" href="#x">
              Skicka
              <IkonPil />
            </StorKnapp>
            <StorKnapp disabled>Inaktiv</StorKnapp>
          </Rad>
          <Rad>
            <LitenKnapp href="#x">Skriv brev</LitenKnapp>
            <LitenKnapp storlek={48} ikon={<IkonBokmark />}>
              Spara till Ska sökas
            </LitenKnapp>
            <LitenKnapp storlek={48} ikon={<IkonBock />}>
              Markera som sökt
            </LitenKnapp>
            <LitenKnapp ikon={<IkonBock />}>Intervju genomförd</LitenKnapp>
            <LitenKnapp variant="streckad">Annat</LitenKnapp>
            <LitenKnapp variant="kop">Köpvariant (bara betalväggar)</LitenKnapp>
            <IkonKnapp etikett="Spara till Ska sökas">
              <IkonBokmark size={22} />
            </IkonKnapp>
            <TextLank href="#x">Markera som sökt</TextLank>
          </Rad>
          <Rad>
            <div style={{ width: 340 }}>
              <LitenKnapp storlek={52} bred ikon={<IkonPlus size={20} />}>
                Logga sökt tjänst
              </LitenKnapp>
            </div>
          </Rad>
          <Vaggprov>
            <Rad>
              {LOGGA}
              <GlasKnapp href="#x" ikon={<IkonPenna size={18} />}>
                Redigera
              </GlasKnapp>
              <TextLank vagg href="#x">
                Ändra tid
              </TextLank>
              <LitenKnapp variant="morkt" href="#x">
                Förbered intervjun
              </LitenKnapp>
            </Rad>
          </Vaggprov>
        </Del>

        <Del rubrik="Väggens brickor, mål och tal">
          <Vaggprov>
            <Rad>
              <VeckansMal antal={2} mal={3} andraHref="#x" />
              <VeckansMal antal={3} mal={3} />
              <VeckansMal kompakt antal={2} mal={3} />
              <Chip>
                <span className="j3-brickrad" aria-hidden="true">
                  <VaggBricka kod="BO" ton="av" />
                </span>
                3 avslutade ligger längst ned
              </Chip>
              <VaggEtikett>Umeå</VaggEtikett>
              <VaggEtikett>Lön: satt</VaggEtikett>
            </Rad>
            <Rad>
              <VaggBricka kod="UK" />
              <VaggBricka kod="NO" ton="tyst" tagg="15 dagar" />
              <VaggBricka kod="ÅL" ton="tom" />
              <VaggBricka kod="UE" ton="int" stor />
              <VaggBricka kod="BO" ton="av" stor />
              <VaggBricka kod="UE" tagg="tis 10.00" taggLjus />
              <StorBricka kod="UE" />
              <StorBricka kod="NO" tyst />
              <DatumBricka manad="nov" dag={24} />
              <VaggTal tal={14} etikett="kompetenser" />
              <StortTal tal={23} rad="dagar kvar till" stark="sista inlämningsdag" />
            </Rad>
            <Rad>
              <DatumRuta bricka={<DatumBricka manad="nov" dag={24} />} rubrik="Intervju tisdag 24 november, 10.00" rad={<>Om 3 dagar. <TextLank vagg href="#x">Ändra tid</TextLank></>} />
              <div style={{ width: 380 }}>
                <RutaRad rubrik="Elin Sundberg, ekonomi.pdf" text="3 roller, 14 kompetenser, 2 utbildningar" handling="Byt CV" href="#x" />
              </div>
            </Rad>
            <Rad>
              <div style={{ width: 300 }}>
                <VaggRuta rubrik="Ditt CV" lankar={<><a href="#x">Byt CV</a><a href="#x">Rätta</a></>}>
                  <p style={{ margin: '8px 0 12px', fontWeight: 700, fontSize: 15 }}>Elin Sundberg, ekonomi.pdf</p>
                  <span style={{ display: 'flex', gap: 26 }}>
                    <VaggTal tal={3} etikett="roller" />
                    <VaggTal tal={14} etikett="kompetenser" />
                    <VaggTal tal={2} etikett="utbildningar" />
                  </span>
                </VaggRuta>
              </div>
              <VaggBrickLag brickor={[{ kod: 'UE', ton: 'int' }, { kod: 'LF', ton: 'int' }]} rubrik="2 i intervju" text="Umeå Energi, Länsförsäkringar" />
              <div style={{ width: 420 }}>
                <BrytDemo />
              </div>
            </Rad>
          </Vaggprov>
        </Del>

        <Del rubrik="Golvets brickor, piller och taggar">
          <Rad>
            <Bricka kod="UE" />
            <Bricka kod="NO" ton="tyst" />
            <Bricka kod="ÅL" ton="tom" />
            <Bricka kod="BO" ton="slut" />
            <Bricka kod="UE" ton="int" />
            <Bricka kod="NO" ring ton="tyst" />
            <Bricka mobil={48} dator={56} kod="UE" />
            <Bricka mobil={56} dator={60} kod="ÅL" />
            <Bricka mobil={56} dator={60} ton="las">
              <IkonLasUpp size={22} />
            </Bricka>
            <DatumBricka manad="nov" dag={24} pa="golv" />
          </Rad>
          <Rad>
            <StatusPiller status="vantar" />
            <StatusPiller status="folj-upp" />
            <StatusPiller status="intervju" />
            <StatusPiller status="vantar-besked" />
            <StatusPiller status="avslutad" />
            <StatusPiller status="erbjudande" />
            <StatusPiller status="intervju" vit>
              Tis 10.00
            </StatusPiller>
            <Tagg>Ny</Tagg>
            <Tagg liten>Ny</Tagg>
            <Tagg variant="exempel">Exempel</Tagg>
          </Rad>
        </Del>

        <Del rubrik="Matchringen, fyrstegsbanan, betyg och kompetens">
          <Rad>
            <Matchring procent={92} storlek={48} />
            <Matchring procent={88} storlek={52} />
            <Matchring procent={84} storlek={64} />
            <Matchring procent={81} storlek={112} />
            <FyrstegsBana steg={1} />
            <FyrstegsBana steg={1} tyst />
            <FyrstegsBana steg={2} />
            <FyrstegsBana steg={3} />
            <FyrstegsBana steg={4} />
            <FyrstegsBana steg={2} avslutad />
          </Rad>
          <Rad>
            <Prickar antal={2} etikett="2 av 5, Tunt" />
            <Prickar antal={4} />
            <Rutor antal={3} etikett="3 av 5" />
            <Rutor antal={0} />
            <UppMarke>
              <IkonPilUpp />
              upp från 2 av 5
            </UppMarke>
            <KompetensRad har={['Leverantörsreskontra', 'Fortnox', 'Excel']} saknas={['SAP']} />
          </Rad>
          <Vaggprov>
            <Rad>
              <Prickar antal={4} variant="stor" etikett="4 av 5" />
              <Prickar antal={3} variant="vagg" />
              <Prickar antal={2} variant="mini" />
              <Rutor antal={4} av={7} variant="vagg" etikett="Fyra av sju övade" />
            </Rad>
          </Vaggprov>
        </Del>

        <Del rubrik="Väggar: tjänsten, tyst, utan flik, Sökta, Inför intervjun, utan CV, laddar">
          <p className="j3-text" style={{ marginBottom: 12 }}>
            Varje vägg nedan är JobbVagg med andra delar i. Kontots åtgärder (platshållare här) står till höger om glasknappen på dator och i en egen rad över flikarna på telefon.
          </p>
        </Del>
      </Golv>

      <div id="tjanst" style={{ marginTop: 24 }}>
        <JobbVagg hojd={528} hojdMobil={392} kullar="tva" flik="sokta" handling={<GlasKnapp href="#x" ikon={<IkonPenna size={18} />}>Redigera</GlasKnapp>} atgarder={<Atgarder />} tillbaka={{ href: '#sokta', text: 'Alla sökta tjänster' }} handlingMobil={<TextLank vagg href="#x">Redigera</TextLank>}>
          <VaggHero spalt={520} glapp={32} topp={18} bild={<TjanstBana steg="intervju" kod="UE" datum={{ sokt: '2 nov', svar: '13 nov', intervju: 'tis 24 nov 10.00' }} datumMobil={{ intervju: 'tis 24 nov' }} etikett="Tjänstens väg: sökt 2 november, svar 13 november, intervju tisdag 24 november klockan 10.00, erbjudande återstår." />}>
            <TjanstHuvud kod="UE" ogon="Kallad till intervju" titel="Redovisningsekonom" arbetsgivare="Umeå Energi, Umeå" />
            <div className="hidden xl:block" style={{ marginTop: 30 }}>
              <DatumRuta bricka={<DatumBricka manad="nov" dag={24} />} rubrik="Intervju tisdag 24 november, 10.00" rad={<>Om 3 dagar. <TextLank vagg href="#x">Ändra tid</TextLank></>} />
            </div>
          </VaggHero>
        </JobbVagg>
        <Golv>
          <LyftPanel rubrikId="nasta">
            <div className="xl:hidden" style={{ marginBottom: 14 }}>
              <DatumRuta pa="golv" bricka={<DatumBricka manad="nov" dag={24} pa="golv" />} rubrik="Intervju tisdag 10.00" rad={<>Om 3 dagar. <TextLank href="#x">Ändra tid</TextLank></>} />
            </div>
            <PanelHuvud ogon="Nästa steg" rubrik="Förbered intervjun på tisdag" rubrikId="nasta" stor under="Tre av de sju vanligaste frågorna är övade. Börja med den du fick lägst betyg på." mitt hoger={<StorKnapp golv href="#x">Öva på nästa fråga<IkonPil /></StorKnapp>} />
            <div className="xl:hidden" style={{ marginTop: 14 }}>
              <StorKnapp href="#x">
                Öva på nästa fråga
                <IkonPil />
              </StorKnapp>
            </div>
            <div className="mt-[18px] grid gap-6 xl:mt-[22px] xl:grid-cols-[minmax(0,1fr)_336px] xl:items-start">
              <Fragor>
                <FragaKort nu betyg={2} rubrik="Ett problem du löste" rad="Tunt, 2 av 5. Resultatet saknades. Börja här." href="#x" />
                <FragaKort betyg={4} rubrik="Berätta om dig själv" rad="Starkt, 4 av 5. Övad i går." href="#x" />
                <FragaKort betyg={3} rubrik="Varför söker du jobbet" rad="Godkänt, 3 av 5. Övad 17 nov." href="#x" />
                <FragaKort betyg={0} rubrik="Styrkor och svagheter" rad="Inte övad än" href="#x" />
                <FragaKort betyg={0} rubrik="Varför ska vi anställa dig" rad="Inte övad än" href="#x" />
                <FragaKort betyg={0} rubrik="En konflikt" rad="Inte övad än" href="#x" />
                <FragaKort betyg={0} rubrik="Ett misstag" rad="Inte övad än" href="#x" />
                <FragaAllt rubrik="Allt under Inför intervjun" rad="Dina prov och din personlighetsprofil." href="#x" />
              </Fragor>
              <TonYta>
                <p className="j3-eyebrow">Kraven i annonsen</p>
                <p className="j3-h3" style={{ margin: '6px 0 14px' }}>
                  Brevet svarade på fyra av fem
                </p>
                <KravLista krav={[{ text: 'Löpande redovisning och avstämningar' }, { text: 'Vana vid månadsbokslut' }, { text: 'Kund- och leverantörsreskontra' }, { text: 'Goda kunskaper i Excel' }, { text: 'Erfarenhet av koncernredovisning', saknas: true, rad: 'Står inte i brevet. Ha ett svar redo.' }]} />
                <div style={{ marginTop: 14 }}>
                  <TextLank href="#x">Öppna brevet</TextLank>
                </div>
              </TonYta>
            </div>
          </LyftPanel>
          <Spalter sido={400} topp={48}>
            <section>
              <SektionsHuvud rubrik="Händelser" />
              <Kort luft>
                <Handelsebana
                  handelser={[
                    { rubrik: 'Ansökan skickad', datum: '2 nov', text: 'Svar på annons, med personligt brev.', lage: 'klar' },
                    { rubrik: 'Kallad till intervju', datum: '13 nov', text: 'På plats hos Umeå Energi. Två intervjuare, ungefär en timme.', lage: 'klar', linje: 'hel' },
                    { rubrik: 'Intervju', datum: 'tis 24 nov 10.00', datumKoppar: true, text: 'Om 3 dagar. På onsdag frågar vi hur det gick, så loggas den som genomförd.', lage: 'snart', ikon: <IkonKalender size={20} /> },
                    { rubrik: 'Erbjudande', lage: 'sen', ikon: <IkonFlagga size={20} /> },
                  ]}
                />
                <div style={{ marginTop: 22, paddingTop: 20, borderTop: '2px solid var(--j3-linje)' }}>
                  <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 15 }}>Har något hänt? Lägg till det med ett tryck.</p>
                  <Snabbval>
                    <LitenKnapp ikon={<IkonBock />}>Intervju genomförd</LitenKnapp>
                    <LitenKnapp ikon={<IkonVaska />}>Provjobbade</LitenKnapp>
                    <LitenKnapp ikon={<IkonFlagga />}>Fick erbjudande</LitenKnapp>
                    <LitenKnapp ikon={<IkonAvslag />}>Fick avslag</LitenKnapp>
                    <LitenKnapp variant="streckad">Annat</LitenKnapp>
                  </Snabbval>
                </div>
              </Kort>
            </section>
            <aside>
              <SektionsHuvud rubrik="Om tjänsten" />
              <Kort luft>
                <Fakta rader={[{ etikett: 'Sökt', varde: '2 november 2026' }, { etikett: 'Hur', varde: 'Svar på annons' }, { etikett: 'Brev', varde: <a href="#x">Personligt brev till Umeå Energi</a> }, { etikett: 'CV', varde: 'Elin Sundberg, ekonomi.pdf' }, { etikett: 'Anteckning', varde: 'Lönefrågan kommer troligen. Kolla marknadslönen före tisdag.' }]} />
              </Kort>
            </aside>
          </Spalter>
        </Golv>
      </div>

      <div id="tyst" style={{ marginTop: 24 }}>
        <JobbVagg hojd={528} hojdMobil={392} flik="sokta" handling={<GlasKnapp href="#x" ikon={<IkonPenna size={18} />}>Redigera</GlasKnapp>} tillbaka={{ href: '#sokta', text: 'Alla sökta tjänster' }}>
          <VaggHero spalt={520} glapp={32} topp={18} bild={<TjanstBana steg="sokt" kod="NO" tyst="tyst 15 dagar" datum={{ sokt: '6 nov' }} etikett="Tjänstens väg: sökt 6 november, tyst i 15 dagar. Svar, intervju och erbjudande återstår." />}>
            <TjanstHuvud kod="NO" tyst ogon="Tyst i 15 dagar" titel="Ekonomiassistent" arbetsgivare="Norrmejerier, Umeå" />
          </VaggHero>
        </JobbVagg>
        <Golv>
          <LyftPanel rubrikId="folj">
            <PanelHuvud ogon="Nästa steg" rubrik="Följ upp Norrmejerier" rubrikId="folj" stor under="Ett kort mejl brukar ge besked. Utkastet är skrivet utifrån din ansökan. Ändra det du vill direkt i texten." />
            <div className="mt-[18px] grid gap-6 xl:mt-[22px] xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start" id="mejl">
              <MejlUtkast till="Mottagarens adress, står oftast under Kontakt i annonsen" amne="Min ansökan till tjänsten som ekonomiassistent" fotVanster="68 ord. Kort nog att läsas på en gång." fotHoger={<><TextLank liten href="#x">Skriv om kortare</TextLank><TextLank liten href="#x">Till annonsen</TextLank></>}>
                <p>Hej,</p>
                <p>Jag sökte tjänsten som ekonomiassistent hos er den 6 november och undrar hur långt ni har kommit i rekryteringen.</p>
                <p>Jag är fortfarande intresserad. Det jag gör i dag, kund- och leverantörsreskontra och månadsavstämningar i Fortnox, ligger nära det ni beskriver i annonsen.</p>
                <p>Vänliga hälsningar<br />Elin Sundberg</p>
              </MejlUtkast>
              <div className="flex flex-col gap-4">
                <StorKnapp bred golv storlek="mellan" href="mailto:?subject=Min%20ans%C3%B6kan">
                  <IkonMejl size={20} />
                  Öppna i e-post
                </StorKnapp>
                <LitenKnapp storlek={48} bred ikon={<IkonKopiera />}>
                  Kopiera mejlet
                </LitenKnapp>
                <TonYta>
                  <p className="j3-eyebrow" style={{ marginBottom: 12 }}>
                    Vad som händer sedan
                  </p>
                  <Handelsebana
                    liten
                    handelser={[
                      { rubrik: 'Du skickar mejlet', text: 'När du har skickat det loggar vi Följde upp i dag, lördag 21 nov.', lage: 'snart', ikon: <IkonSkicka size={18} /> },
                      { rubrik: 'Påminnelsen flyttas fram', text: 'Tjänsten lämnar Följ upp. Ingen ny påminnelse på tolv dagar.', lage: 'sen', ikon: <IkonKlocka size={18} /> },
                      { rubrik: 'Torsdag 3 december', text: 'Är det fortfarande tyst säger vi till, och då får du välja om du vill fråga en gång till.', lage: 'sen', ikon: '3/12' },
                    ]}
                  />
                </TonYta>
                <Kort ton="streckad" luft>
                  <Kryss>Jag har redan skickat det</Kryss>
                </Kort>
              </div>
            </div>
          </LyftPanel>
        </Golv>
      </div>

      <div id="coach" style={{ marginTop: 24 }}>
        <JobbVagg hojd={330} hojdMobil={260} flik={null} handling={<GlasKnapp href="#x">Nytt samtal</GlasKnapp>} tillbaka={{ href: '#main', text: 'Jobbsöket', ton: 'koppar' }} luft={96}>
          <div style={{ marginTop: 4 }}>
            <VaggText rubrik="Jobbcoachen" ingress="Fråga om lön, intervjuer, arbetsrätt eller ditt CV. Vi svarar med källor du kan kolla själv." bredIngress />
          </div>
        </JobbVagg>
        <Golv>
          <Spalter sido={360} tat>
            <LyftPanel tat etikett="Samtalet">
              <div style={{ padding: '16px 16px 20px' }}>
                <Samtal>
                  <JagBubbla>Vad är marknadslön för en redovisningsekonom i Umeå?</JagBubbla>
                  <SvarBubbla kallor={<Kallrad kallor={[{ text: 'SCB, lönestrukturstatistik', href: 'https://www.scb.se' }, { text: 'Arbetsförmedlingen, yrkesprognos', href: 'https://arbetsformedlingen.se' }]} />}>
                    <p>Det finns ingen enda siffra, men tre källor ger tillsammans ett spann du kan stå för.</p>
                    <p>
                      <b>Börja med SCB:s lönestrukturstatistik.</b> Sök på yrket och välj region och sektor.
                    </p>
                  </SvarBubbla>
                  <SvarBubbla skriver />
                </Samtal>
                <div style={{ marginTop: 20 }}>
                  <Inmatning
                    etikett="Din fråga"
                    placeholder="Fråga vad du vill veta om jobb, lön, intervju eller arbetsrätt"
                    knapp={
                      <StorKnapp storlek="lag" type="submit" className="lag-alltid">
                        Skicka
                        <IkonPil size={18} />
                      </StorKnapp>
                    }
                  />
                </div>
              </div>
            </LyftPanel>
            <aside className="xl:pt-[40px]">
              <GruppHuvud niva={2} rubrik="Frågor utifrån ditt läge" />
              <p className="j3-text" style={{ margin: '0 0 14px' }}>
                Hämtade ur dina sökta tjänster. Tryck på en, så står den i fältet.
              </p>
              <ForslagLista>
                <FragaForslag kod="UE">Hur svarar jag på lönefrågan hos Umeå Energi?</FragaForslag>
                <FragaForslag kod="NO" ton="tyst">
                  Vad skriver jag i ett uppföljningsmejl?
                </FragaForslag>
              </ForslagLista>
              <div style={{ marginTop: 20 }}>
                <Kort ton="streckad" luft>
                  <p className="j3-eyebrow" style={{ marginBottom: 10 }}>
                    Så ser det ut på gratisnivån
                  </p>
                  <KvotPrickar kvar={7} av={10} />
                  <p style={{ margin: '10px 0 0', fontWeight: 700, fontSize: 15 }}>7 gratis meddelanden kvar på kontot</p>
                </Kort>
              </div>
            </aside>
          </Spalter>
        </Golv>
      </div>

      <div id="bedomt" style={{ marginTop: 24 }}>
        <JobbVagg hojd={460} hojdMobil={420} flik={false} tillbaka={{ href: '#intervju', text: 'Inför intervjun' }} handling={<GlasKnapp href="#x">Skriv om en gång till</GlasKnapp>}>
          <VaggHero spalt={560} glapp={40} topp={26} bild={<div style={{ width: 520, maxWidth: '100%' }}><p className="j3-vaggtext-rad">Det här hörde rekryteraren</p><StarBrickor pa="vagg" delar={[{ bokstav: 'S', namn: 'Situation', under: 'Avstämningen som inte gick ihop' }, { bokstav: 'T', namn: 'Uppgift', under: 'Hitta felet före bokslutet' }, { bokstav: 'A', namn: 'Handling', under: 'Gick igenom filerna, skrev rutinen' }, { bokstav: 'R', namn: 'Resultat', under: 'Reskontran stämde igen' }]} /></div>}>
            <VaggText ogon="Ditt intervjusvar, bedömt · Ett problem du löste" rubrik={<span style={{ display: 'flex', flexDirection: 'column', gap: 12 }}><span style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Prickar antal={4} variant="stor" /><UppMarke><IkonPilUpp />upp från 2 av 5</UppMarke></span>Starkt, 4 av 5</span>} ingress="Nu hör rekryteraren både vad du gjorde och vad det ledde till." />
          </VaggHero>
        </JobbVagg>
        <Golv>
          <Spalter sido={360} tat>
            <LyftPanel luft="22px">
              <div className="grid gap-4 xl:grid-cols-2">
                <Bedomning rubrik="Det som fungerar" punkter={['Du börjar i en tydlig situation.', 'Det hörs vad just du gjorde, steg för steg.']} />
                <Bedomning saknas rubrik="Det som saknas" punkter={['En siffra på resultatet.', 'Svaret är i längsta laget.']} />
              </div>
            </LyftPanel>
            <div>
              <SektionsHuvud rubrik="Ditt svar, omskrivet" />
              <LinjeratSvar>
                <p>
                  Skillnaden var <Hak>[belopp]</Hak> och hade vuxit under <Hak>[antal]</Hak> månader. Jag fick i uppgift att hitta felet före bokslutet.
                  <Markor />
                </p>
              </LinjeratSvar>
            </div>
          </Spalter>
        </Golv>
      </div>

      <div id="sokta" style={{ marginTop: 24 }}>
        <JobbVagg hojd={486} hojdMobil={336} flik="sokta" handling={LOGGA} atgarder={<Atgarder />}>
          <VaggHero spalt={340} glapp={40} bild={<StegFack etikett="Dina sökta tjänster per steg" fack={[{ namn: 'Ska sökas', antal: 2, under: 'Närmast: torsdag', brickor: [{ kod: 'ÅL', ton: 'tom' }, { kod: 'VO', ton: 'tom' }] }, { namn: 'Sökt', antal: 4, under: 'Väntar svar', brickor: [{ kod: 'NO', ton: 'tyst', tagg: '15 dagar' }, { kod: 'UK' }, { kod: 'RV' }, { kod: 'KO' }] }, { namn: 'Intervju', antal: 2, under: '1 bokad, 1 väntar besked', brickor: [{ kod: 'UE', tagg: 'tis 10.00' }, { kod: 'LF' }] }, { namn: 'Erbjudande', antal: 0, under: 'Hit ska en bricka', mal: true }]} />} bildPlats="bred">
            <VaggText ogon="Sökta tjänster · 9 hittills" rubrik="Sex är på väg" ingress="Två är i intervju och fyra väntar svar. Norrmejerier har varit tyst i 15 dagar." ingressMobil="Norrmejerier har varit tyst i 15 dagar." />
            <Chips dator>
              <VeckansMal antal={2} mal={3} />
            </Chips>
          </VaggHero>
        </JobbVagg>
        <Golv>
          <LyftPanel lyftMobil={28} luft="20px 28px 28px">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <VaxelDemo />
              <div className="xl:w-[300px]">
                <SokFalt etikett="Sök på företag eller tjänst" placeholder="Sök på företag eller tjänst" />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <FilterRad etikett="Filter" valt="alla" val={[{ id: 'alla', text: 'Alla', antal: 9, href: '#sokta' }, { id: 'ska', text: 'Ska sökas', antal: 2, href: '#sokta' }, { id: 'vantar', text: 'Väntar svar', antal: 4, href: '#sokta' }, { id: 'intervju', text: 'Intervju', antal: 2, href: '#sokta' }, { id: 'erbjudande', text: 'Erbjudande', antal: 0, href: '#sokta' }, { id: 'avslutade', text: 'Avslutade', antal: 3, href: '#sokta' }]} />
            </div>
            <div style={{ marginTop: 22 }}>
              <GruppHuvud rubrik="Följ upp" antal={1} antalTyst text="Tyst i minst tolv dagar. Ett kort mejl brukar ge besked." />
              <Kort ton="tyst" lista>
                <TjanstRad storlek="stor" bricka={{ kod: 'NO', ton: 'tyst' }} rubrik="Ekonomiassistent" arbetsgivare="Norrmejerier, Umeå" text="Sökt 6 nov, svar på annons, med personligt brev" steg={{ steg: 1, tyst: true }} status={{ status: 'folj-upp', text: 'Tyst i 15 dagar', vit: true }} hogerMobil={<StatusPiller status="folj-upp" vit>Tyst 15 dagar</StatusPiller>} handling={<StorKnapp storlek="lag" golv href="#mejl" className="lag-alltid">Följ upp<IkonPil size={18} /></StorKnapp>} href="#tyst" />
              </Kort>
            </div>
            <div style={{ marginTop: 22 }}>
              <GruppHuvud rubrik="Intervju på gång" antal={2} text="Förbered dig här. Frågorna hör ihop med tjänsten." />
              <Kort ton="ton" lista>
                <TjanstRad storlek="stor" bricka={{ kod: 'UE' }} rubrik="Redovisningsekonom" arbetsgivare="Umeå Energi, Umeå" text="Kallad till intervju 13 nov. Tre av sju frågor övade." steg={{ steg: 3 }} status={{ status: 'intervju', text: 'Tis 24 nov 10.00', vit: true }} hogerMobil={<StatusPiller status="intervju" vit>Tis 10.00</StatusPiller>} handling={<LitenKnapp storlek={48}>Förbered intervjun</LitenKnapp>} href="#tjanst" />
                <TjanstRad storlek="stor" bricka={{ kod: 'LF' }} rubrik="Ekonomiassistent" arbetsgivare="Länsförsäkringar Västerbotten, Umeå" text="Intervju genomförd 18 nov. Väntar på besked." steg={{ steg: 3 }} status={{ status: 'vantar-besked', vit: true }} hogerMobil={<StatusPiller status="vantar-besked" vit />} handling={<LitenKnapp storlek={48}>Uppdatera</LitenKnapp>} handlingMobil={false} href="#tjanst" />
              </Kort>
            </div>
          </LyftPanel>
          <Avsnitt topp={52}>
            <GruppHuvud rubrik="Ska sökas" antal={2} text="Sparade annonser med sista ansökningsdag. De räknas inte förrän du har sökt." />
            <SparadLista>
              <SparadKort kod="ÅL" titel="Ekonomiassistent" arbetsgivare="Ålö AB, Umeå" matchgrad={92} dag="Sista dag tors 26 nov, 5 dagar kvar" snart lank={<TextLank href="#x">Markera som sökt</TextLank>} handling={<LitenKnapp storlek={48}>Skriv brev</LitenKnapp>} />
              <SparadKort kod="VO" titel="Redovisningsassistent" arbetsgivare="Volvo Lastvagnar, Umeå" passerad lank={<TextLank href="#x">Ta bort</TextLank>} handling={<LitenKnapp storlek={48}>Sökt ändå</LitenKnapp>} />
            </SparadLista>
          </Avsnitt>
          <Avsnitt topp={48}>
            <GruppHuvud rubrik="Väntar svar" antal={3} text="Svar brukar dröja en till två veckor. Vi säger till när det är dags att följa upp." />
            <Kort lista>
              <TjanstRad storlek="stor" bricka={{ kod: 'UK' }} rubrik="Ekonomihandläggare" arbetsgivare="Umeå kommun" text="Sökt 10 nov, svar på annons" steg={{ steg: 1 }} status={{ status: 'vantar', text: '11 dagar' }} hogerMobil={<StatusPiller status="vantar">11 dagar</StatusPiller>} handling={<LitenKnapp storlek={48}>Uppdatera</LitenKnapp>} handlingMobil={false} href="#tjanst" />
              <TjanstRad storlek="stor" bricka={{ kod: 'BO', ton: 'slut' }} rubrik="Löneadministratör" arbetsgivare="Bostaden" text="Avslag 12 nov. Räknas som svar i din statistik." steg={{ steg: 2, avslutad: true }} status={{ status: 'avslutad', text: 'Avslag' }} hogerMobil={<StatusPiller status="avslutad">Avslag</StatusPiller>} href="#tjanst" />
            </Kort>
          </Avsnitt>
          <Avsnitt topp={48}>
            <SektionsHuvud rubrik="Statistik: tratten" />
            <Kort luft>
              <Tratt
                etikett="Nio sökta. Fem har svarat. Två har lett till intervju. Inget erbjudande än."
                mellan={['5 av 9', '2 av 5', 'väntar']}
                led={[
                  { tal: 9, namn: 'Sökta', under: 'Sedan 14 oktober', brickor: [{ kod: 'UE', ton: 'int' }, { kod: 'LF', ton: 'int' }, { kod: 'NO', ton: 'tyst' }, { kod: 'UK', ton: 'standard' }, { kod: 'RV', ton: 'standard' }, { kod: 'KO', ton: 'standard' }, { kod: 'BO', ton: 'slut' }, { kod: 'SW', ton: 'slut' }, { kod: 'PW', ton: 'slut' }] },
                  { tal: 5, namn: 'Fått svar', under: '2 kallelser, 3 avslag', brickor: [{ kod: 'UE', ton: 'int' }, { kod: 'LF', ton: 'int' }, { kod: 'BO', ton: 'slut' }, { kod: 'SW', ton: 'slut' }, { kod: 'PW', ton: 'slut' }] },
                  { tal: 2, namn: 'Intervju', under: '1 genomförd, 1 bokad', brickor: [{ kod: 'UE', ton: 'int' }, { kod: 'LF', ton: 'int' }] },
                  { tal: 0, namn: 'Erbjudande', under: 'Inget än', brickor: [], mal: true },
                ]}
              />
            </Kort>
          </Avsnitt>
          <Spalter sido={400} topp={48}>
            <section>
              <SektionsHuvud rubrik="Aktivitet per vecka" under="En till två sökta tjänster i veckan sedan mitten av oktober." />
              <Kort luft>
                <Veckostaplar
                  etikett="Sökta tjänster per vecka: vecka 42 en, vecka 43 en, vecka 44 två, vecka 45 två, vecka 46 en, vecka 47 två. Veckans mål är tre."
                  mal={3}
                  veckor={[
                    { etikett: 'v. 42', brickor: [{ kod: 'SW', ton: 'slut' }] },
                    { etikett: 'v. 43', brickor: [{ kod: 'PW', ton: 'slut' }] },
                    { etikett: 'v. 44', brickor: [{ kod: 'BO', ton: 'slut' }, { kod: 'LF', ton: 'int' }] },
                    { etikett: 'v. 45', brickor: [{ kod: 'UE', ton: 'int' }, { kod: 'NO', ton: 'tyst' }] },
                    { etikett: 'v. 46', brickor: [{ kod: 'UK', ton: 'standard' }] },
                    { etikett: 'v. 47', brickor: [{ kod: 'RV', ton: 'standard' }, { kod: 'KO', ton: 'standard' }], nu: true },
                  ]}
                />
              </Kort>
            </section>
            <aside>
              <SektionsHuvud rubrik="Hur du sökte" />
              <Kort luft>
                <Kanaler kanaler={[{ namn: 'Svar på annons', antal: 7 }, { namn: 'Spontanansökan', antal: 1 }, { namn: 'Via kontakt', antal: 1 }]} />
              </Kort>
            </aside>
          </Spalter>
          <Avsnitt topp={48}>
            <SektionsHuvud rubrik="Rapport" />
            <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)] xl:gap-7">
              <div className="flex flex-col gap-3">
                <ManadVal kort="nov" rubrik="November 2026" rad="5 sökta jobb, 1 intervju" vald />
                <ManadVal kort="okt" rubrik="Oktober 2026" rad="4 sökta jobb" />
                <StorKnapp bred golv storlek="mellan">
                  <IkonSkrivare />
                  Skriv ut eller spara som PDF
                </StorKnapp>
              </div>
              <RapportBlad
                namn="Elin Sundberg"
                period="November 2026"
                periodRad="5 sökta jobb, 1 intervju denna period"
                sektioner={[
                  { rubrik: '1. Sökta annonserade jobb', rader: [{ datum: '2 nov', arbetsgivare: 'Umeå Energi', tjanst: 'Redovisningsekonom' }, { datum: '6 nov', arbetsgivare: 'Norrmejerier', tjanst: 'Ekonomiassistent' }] },
                  { rubrik: '2. Intresseanmälningar och spontanansökningar', rader: [{ datum: '19 nov', arbetsgivare: 'Komatsu Forest', tjanst: 'Ekonomiassistent' }], las: true },
                ]}
                siffror={[{ tal: 9, text: 'Sökta totalt' }, { tal: 5, text: 'Fått svar' }, { tal: 2, text: 'Intervjuer' }, { tal: 0, text: 'Erbjudanden' }]}
                under="Så här blir utskriften. Intervjun hos Umeå Energi kommer med när den är genomförd."
              />
            </div>
          </Avsnitt>
          <FastFot>
            <LitenKnapp storlek={52} bred href="#logga" ikon={<IkonPlus size={20} />}>
              Logga sökt tjänst
            </LitenKnapp>
          </FastFot>
        </Golv>
      </div>

      <div id="jobb" style={{ marginTop: 24 }}>
        <JobbVagg hojd={436} hojdMobil={338} flik="jobb" handling={LOGGA}>
          <VaggHero spalt={470} glapp={40} bildPlats="bred" bild={<div className="hidden gap-4 xl:grid xl:grid-cols-2"><VaggRuta rubrik="Ditt CV" lankar={<><a href="#x">Byt CV</a><a href="#x">Rätta</a></>}><p style={{ margin: '8px 0 12px', fontWeight: 700, fontSize: 15 }}>Elin Sundberg, ekonomi.pdf</p><span style={{ display: 'flex', gap: 26 }}><VaggTal tal={3} etikett="roller" /><VaggTal tal={14} etikett="kompetenser" /><VaggTal tal={2} etikett="utbildningar" /></span></VaggRuta><VaggRuta rubrik="Så söker vi åt dig" lankar={<a href="#x">Ändra</a>}><span style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}><VaggEtikett>Umeå</VaggEtikett><VaggEtikett>Skellefteå</VaggEtikett><VaggEtikett>Distans: ja</VaggEtikett><VaggEtikett>Heltid</VaggEtikett><VaggEtikett>Lön: satt</VaggEtikett></span></VaggRuta></div>}>
            <VaggText ogon="600 annonser lästa · senast i dag" rubrik="25 jobb passar dig, fyra är nya" ingress="Vi läser ditt CV och letar bland Arbetsförmedlingens annonser. Varje träff säger varför den passar." bredIngress />
            <div className="mt-3 flex flex-col gap-2 xl:hidden">
              <RutaRad rubrik="Elin Sundberg, ekonomi.pdf" text="3 roller, 14 kompetenser, 2 utbildningar" handling="Byt CV" href="#x" />
              <RutaRad rubrik="Umeå, Skellefteå och distans" text="Heltid. Lön: satt, visas aldrig för någon annan." handling="Ändra" href="#x" />
            </div>
          </VaggHero>
        </JobbVagg>
        <Golv>
          <LyftPanel delad={432}>
            <section style={{ padding: '20px 14px 20px 20px' }}>
              <h2 className="j3-h2" style={{ fontSize: 20, lineHeight: '26px' }}>
                25 bästa träffarna
              </h2>
              <div style={{ margin: '12px 0' }}>
                <FilterRad sort etikett="Sortering" valt="relevans" val={[{ id: 'relevans', text: 'Relevans' }, { id: 'nyast', text: 'Nyast' }, { id: 'dag', text: 'Sista ansökningsdag' }]} />
              </div>
              <TraffLista>
                <TraffRad procent={92} titel="Ekonomiassistent" var="Ålö AB, Umeå" skal="Din roll, 6 av 7 kompetenser" dag="Sista dag 26 nov, 5 dagar kvar" snart ny vald href="#jobb" />
                <TraffRad procent={88} titel="Redovisningsassistent" var="Volvo Lastvagnar, Umeå" skal="2 av dina 3 roller, 5 av 6 kompetenser" dag="Sista dag 30 nov" ny href="#jobb" />
                <TraffRad procent={81} href="#jobb" />
                <TraffRad procent={77} href="#jobb" />
              </TraffLista>
            </section>
            <article style={{ padding: '26px 30px 30px' }} id="annons">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Bricka kod="ÅL" mobil={56} dator={60} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2 className="j3-h2" style={{ fontSize: 30, lineHeight: '36px' }}>
                    Ekonomiassistent
                  </h2>
                  <p className="j3-under" style={{ marginTop: 2 }}>
                    Ålö AB, Umeå
                  </p>
                </div>
                <StatusPiller status="folj-upp">Sista dag 26 nov, 5 dagar kvar</StatusPiller>
              </div>
              <Passar procent={92} skal={[{ rubrik: 'Din roll matchar', text: 'Ekonomiassistent är en av de tre rollerna i ditt CV.' }, { rubrik: '6 av 7 kompetenser i kravprofilen', text: <KompetensRad har={['Leverantörsreskontra', 'Kundreskontra', 'Fortnox', 'Excel']} saknas={['SAP']} /> }, { rubrik: 'Umeå', text: 'Samma ort som i ditt CV.' }]} />
              <div className="mt-[22px] flex flex-wrap gap-3">
                <StorKnapp storlek="mellan" golv href="#brev">
                  Skriv brev
                  <IkonPil />
                </StorKnapp>
                <LitenKnapp storlek={48} ikon={<IkonBokmark />}>
                  Spara till Ska sökas
                </LitenKnapp>
                <LitenKnapp storlek={48} ikon={<IkonBock />}>
                  Markera som sökt
                </LitenKnapp>
              </div>
              <div style={{ marginTop: 22 }}>
                <FaktaRutor rutor={[{ varde: 'Tillsvidare, heltid', etikett: 'Anställningsform' }, { varde: '19 november', etikett: 'Publicerad, för 2 dagar sedan' }, { varde: 'Enligt överenskommelse', etikett: 'Lön, annonsens egen text' }]} />
              </div>
              <AnnonsText>
                <h3>Arbetsuppgifter</h3>
                <p>Du blir en del av ekonomiavdelningen i Umeå och arbetar med den löpande redovisningen tillsammans med fem kollegor.</p>
              </AnnonsText>
              <KravRutor krav={['Gymnasieekonom eller motsvarande', 'Erfarenhet av leverantörsreskontra']} meriterande={['Erfarenhet av SAP', 'Vana vid månadsbokslut']} />
              <div style={{ marginTop: 22 }}>
                <SparrRam etikett="Ingår i Premium">
                  <PaywallCard variant="jobbtraffar" hiddenCount={22} bare />
                </SparrRam>
              </div>
            </article>
          </LyftPanel>
        </Golv>
      </div>

      <div id="intervju" style={{ marginTop: 24 }}>
        <JobbVagg hojd={612} hojdMobil={432} flik="intervju" handling={<GlasKnapp href="#x">Välj en annan fråga</GlasKnapp>}>
          <VaggHero spalt={480} glapp={28} bild={<FrageBana fragor={FRAGOR} intervju={{ rubrik: 'Intervjun', under: 'tis 24 nov 10.00' }} />}>
            <VaggText ogon="Intervju om 3 dagar · tre av sju frågor övade" ogonMobil="Om 3 dagar · 3 av 7 övade" rubrik="Intervju på Umeå Energi på tisdag" ingress="Redovisningsekonom, tisdag 24 november klockan 10.00. Öva på frågorna du kommer att få, och se vad rekryteraren hör i dina svar." ingressMobil="Öva på frågorna du kommer att få." />
            <Knapprad rad="Ett problem du löste. Förra gången saknades resultatet.">
              <StorKnapp href="#x">
                Öva på nästa fråga
                <IkonPil />
              </StorKnapp>
            </Knapprad>
          </VaggHero>
        </JobbVagg>
        <Golv>
          <LyftPanel luft="24px 28px 28px">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_436px] xl:items-center">
              <PanelHuvud ogon="Nästa fråga" rubrik="Skriv om svaret om Ett problem du löste" under="Du fick 2 av 5 den 16 november, och det var resultatet som saknades." />
              <TonYta>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <b style={{ fontSize: 13 }}>Förra svaret, del för del</b>
                  <span className="flex items-center gap-2 text-[13px]">
                    <Prickar antal={2} />
                    Tunt
                  </span>
                </div>
                <StarBrickor delar={[{ bokstav: 'S', namn: 'Situation', under: 'Fanns med' }, { bokstav: 'T', namn: 'Uppgift', under: 'Fanns med' }, { bokstav: 'A', namn: 'Handling', under: 'Fanns med' }, { bokstav: 'R', namn: 'Resultat', under: 'Saknades', saknas: true }]} />
              </TonYta>
            </div>
          </LyftPanel>
          <Spalter sido={400} topp={48}>
            <section>
              <GruppHuvud rubrik="Intervjuer på gång" />
              <Kort lista>
                <TjanstRad bricka={{ kod: 'UE' }} rubrik="Umeå Energi, Redovisningsekonom" text="Tisdag 24 november 10.00, om 3 dagar" handling={<LitenKnapp>Förbered intervjun</LitenKnapp>} />
              </Kort>
              <div style={{ marginTop: 24 }}>
                <SektionsHuvud rubrik="Dina intervjuprov" hoger={<span className="j3-text">Utan tak i Premium</span>} />
                <Kort lista>
                  <SidoRad figur={<Prickar antal={4} />} rubrik="Berätta om dig själv" text="Starkt, i går" href="#x" hoger={<TextLank href="#x">Öppna</TextLank>} />
                  <SidoRad figur={<Prickar antal={2} />} rubrik="Ett problem du löste" text="Tunt, 16 november. Resultatet saknades." href="#x" />
                </Kort>
              </div>
            </section>
            <aside>
              <SektionsHuvud rubrik="Din personlighetsprofil" />
              <Kort luft>
                <p className="j3-eyebrow" style={{ marginBottom: 14 }}>
                  Grundtestet, 50 påståenden · 9 nov
                </p>
                <Faktorer faktorer={[{ namn: 'Samvetsgrannhet', niva: 5, ord: 'Mycket hög' }, { namn: 'Vänlighet', niva: 4, ord: 'Hög' }, { namn: 'Öppenhet', niva: 3, ord: 'Medel' }, { namn: 'Extraversion', niva: 2, ord: 'Låg' }]} />
              </Kort>
            </aside>
          </Spalter>
        </Golv>
      </div>

      <div id="ny" style={{ marginTop: 24 }}>
        <JobbVagg hojd={566} hojdMobil={480} flik="oversikt" handling={LOGGA}>
          <VaggHero spalt={480} glapp={28} bild={<JobbsokBanaNy etikett="Vägen i Jobbsöket: först CV:t, sedan de första träffarna, sedan den första sökta tjänsten, och till sist ett erbjudande." steg={[{ rubrik: 'CV:t in' }, { rubrik: 'Första träffarna', under: 'jobb som passar ditt CV' }, { rubrik: 'Första sökta tjänsten', under: 'vi håller koll på svaren' }]} />}>
            <VaggText ogon="Börja här" rubrik="Börja med ditt CV, Elin" ingress="Rekryterare letar först efter senaste rollen och vad du uppnådde. Vi läser ditt CV likadant, på under en minut." />
            <Knapprad rad="PDF, Word eller text. Namn, telefon och adress maskas först.">
              <StorKnapp href="#x">
                Ladda upp ditt CV
                <IkonPil />
              </StorKnapp>
            </Knapprad>
          </VaggHero>
        </JobbVagg>
        <Golv>
          <LyftPanel>
            <PanelHuvud ogon="När CV:t är inne" rubrik="Tre saker Jobbsöket gör åt dig" />
            <StegKortRad>
              <StegKort nr={2} rubrik="Hittar jobb som passar" text="Vi läser ditt CV och letar bland Arbetsförmedlingens annonser. Varje träff säger varför den passar." bild={<Matchring procent={86} storlek={64} />} />
              <StegKort nr={3} rubrik="Håller koll på svaren" text="Logga varje sökt tjänst, så påminner vi när det är dags att följa upp." bild={<><Bricka kod="AB" /><FyrstegsBana steg={2} /></>} />
              <StegKort nr={<IkonFlagga size={16} />} koppar rubrik="Förbereder intervjun" text="Öva på frågorna du kommer att få. Ett prov om dagen ingår gratis." bild={<Rutor antal={4} />} />
            </StegKortRad>
          </LyftPanel>
        </Golv>
      </div>

      <div id="laddar" style={{ marginTop: 24 }}>
        <JobbVagg hojd={596} hojdMobil={500} flik={false}>
          <VaggSkelett />
        </JobbVagg>
        <Golv>
          <LyftPanel>
            <PanelSkelett />
          </LyftPanel>
          <Avsnitt>
            <RadSkelett rader={3} />
          </Avsnitt>
        </Golv>
      </div>

      <Golv>
        <Del rubrik="Tomt läge och fel">
          <TomtLage ikon={<IkonDokument />} rubrik="Inga sökta tjänster än" text="Logga den första, så håller vi koll på svaren och säger till när det är dags att följa upp." handling={<LitenKnapp ikon={<IkonPlus />}>Logga sökt tjänst</LitenKnapp>} />
          <div style={{ marginTop: 14 }}>
            <Felruta text="Vi kunde inte hämta dina sökta tjänster just nu." forsokHref="#x" />
          </div>
        </Del>

        <Del rubrik="Övrigt: notis, etiketter, punkter, rader">
          <Notis ikon={<IkonLasUpp />} rubrik="Om du godkänner ser rekryteraren ditt namn och dina kontaktuppgifter" text="Avböjer du får rekryteraren bara veta att du tackat nej. Profilen är fortsatt anonym för alla andra." />
          <Rad>
            <EtikettTag ton="kant">Yrkesroll</EtikettTag>
            <EtikettTag ton="kant">8 år i yrket</EtikettTag>
            <EtikettTag>Västerbotten</EtikettTag>
            <EtikettTag ton="ton">Syns</EtikettTag>
          </Rad>
          <Punkter punkter={[{ ikon: <IkonBock size={16} />, text: 'Yrkesroll, år i yrket och län' }, { ikon: <IkonSkold />, text: 'Namn och kontaktuppgifter syns först när du säger ja' }]} />
          <div style={{ marginTop: 14, maxWidth: 520 }}>
            <Kort lista>
              <SidoRad vald ikon={<IkonOga />} ikonTon="tyst" rubrik="Rekryterare på ett bemanningsföretag i Umeå" text="Vill komma i kontakt om en roll som redovisningsekonom." hoger={<StatusPiller status="folj-upp">Väntar på ditt svar</StatusPiller>} />
              <SidoRad ikon={<IkonOga />} ikonTon="ton" rubrik="Rekryterare på en redovisningsbyrå i Skellefteå" text="Du: Tack, då hörs vi på torsdag." />
            </Kort>
          </div>
        </Del>

        <Del rubrik="Arket (botten på telefon, mitten på dator) och fälten">
          <Suspense>
            <ArkDemo />
          </Suspense>
        </Del>
        <div style={{ height: 80 }} />
      </Golv>
    </div>
  )
}
