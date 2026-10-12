/**
 * /jobbkartan: arbetsmarknaden på en karta, byggd på SCB:s öppna data. Konceptet godkändes som
 * artefakt 2026-10-13 (docs/design/koncept-jobbkartan-2026-10-13.html).
 *
 * Snabbt utan tunga beroenden: hjältekartan är SVG ritad på servern, översiktsdatan (cirka 13 kB)
 * följer med sidan och yrkena och kommunerna hämtas som små filer under /jobbkartan/data först när
 * avsnitten närmar sig skärmen. Platsannonserna läses från JobTech och cachas ett dygn som resten
 * av den publika sidan. SCB-datan uppdateras med scripts/jobbkartan/hamta-data.mjs.
 *
 * Avsnitten: 1 hjälten med kartan och tidsreglaget, 2 konkurrensen om jobben, 3 ditt yrke,
 * 4 din kommun, 5 för journalister, 6 vanliga frågor, 7 vägen vidare in i tjänsten.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import PubliktSida from '@/components/publikt/PubliktSida'
import Faq, { type FaqFraga } from '@/components/publikt/Faq'
import { HjalteTal, JkTillbehor, KartScen, Tidrad } from '@/components/jobbkartan/Hjalte'
import JobbkartanKlient from '@/components/jobbkartan/JobbkartanKlient'
import { FJALL, GEO, OVERSIKT, extrem, hamtaAnnonser, kon, rubrik, type JobbkartanData } from '@/lib/jobbkartan/data'
import { fmt, kortLan, kvartalKort, kvartalNamn, manadNamn } from '@/lib/jobbkartan/karta'
import '@/components/jobbkartan/jobbkartan.css'

const URL_SIDA = 'https://www.jobbcoach.ai/jobbkartan'

export const metadata: Metadata = {
  title: 'Jobbkartan: konkurrensen om jobben, yrken och kommuner',
  description:
    'Hur många arbetslösa går det på varje ledigt jobb i ditt län? Se kön, var ditt yrke är vanligt och arbetslösheten i din kommun på en karta byggd på SCB:s data.',
  alternates: { canonical: URL_SIDA },
}

const SOK_IKON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
)
const NER_IKON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" />
  </svg>
)

function faqFor(D: JobbkartanData): FaqFraga[] {
  const q = D.kvartal.length - 1
  const riket = kon(D, '00', q)
  return [
    {
      q: 'Vad betyder arbetslösa per ledigt jobb?',
      a: `Det är antalet arbetslösa i länet delat med antalet lediga jobb hos arbetsgivarna i samma län och kvartal. ${fmt(riket, 1)} i hela landet ${kvartalNamn(D.kvartal[q])} betyder att det gick ungefär ${Math.round((riket ?? 0) * 10)} arbetslösa på tio lediga jobb. Ju lägre tal, desto kortare kö till varje jobb.`,
    },
    {
      q: 'Var kommer siffrorna ifrån?',
      a: 'Allt kommer från SCB:s statistikdatabas: arbetslösa ur Arbetskraftsundersökningarna, lediga jobb ur Konjunkturstatistik över lediga jobb, arbetslöshet per kommun ur Befolkningens arbetsmarknadsstatus, yrken per län ur yrkesregistret och lönerna ur lönestrukturstatistiken. Antalet platsannonser i dag kommer från Arbetsförmedlingen.',
    },
    {
      q: 'Varför skiljer sig arbetslösheten i min kommun från den i nyheterna?',
      a: 'Nyheterna citerar oftast Arbetskraftsundersökningarna, en urvalsundersökning bland 15 till 74 år. Kommunsiffrorna här är registerstatistik för 20 till 65 år och mäter inte exakt samma sak. Därför blandar vi dem aldrig i samma diagram.',
    },
    {
      q: 'Hur vet jag om mitt yrke är vanligt där jag bor?',
      a: 'Sök på yrket under Ditt yrke på kartan. Vi räknar hur stor del av länets anställda som har yrket och jämför med hela landet. 2,0 betyder att yrket är dubbelt så vanligt som i snitt, 0,5 att det är hälften så vanligt. Där yrket är vanligt finns oftast fler arbetsgivare att söka sig till.',
    },
    {
      q: 'Hur ofta uppdateras jobbkartan?',
      a: 'Platsannonserna läses om varje dygn. SCB:s siffror uppdaterar vi när SCB publicerar nytt: arbetslösheten per kommun varje månad, konkurrensen om jobben varje kvartal och yrkena och lönerna en gång om året.',
    },
    {
      q: 'Får jag använda siffrorna och kartan?',
      a: 'Ja. SCB:s data är fri att använda (CC0) och du kan ladda ner det du ser som CSV eller bädda in kartan på din egen webbplats. Ange gärna SCB som källa och länka till jobbkartan.',
    },
  ]
}

export default async function JobbkartanSida() {
  const D: JobbkartanData = { ...OVERSIKT, geo: GEO, fjall: FJALL, annonser: await hamtaAnnonser() }
  const q = D.kvartal.length - 1
  const ex = extrem(D, q)
  const kort = (k: string) => kortLan(D.lanNamn[k])
  const fragor = faqFor(D)
  const sistManad = D.manader[D.manader.length - 1]

  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Jobbkartan: konkurrensen om jobben, yrken och arbetslöshet per län och kommun',
    description:
      'Arbetslösa per ledigt jobb per län och kvartal, anställda per yrke och län, månadslön per riksområde och arbetslöshet per kommun och månad, sammanställt ur SCB:s statistikdatabas.',
    url: URL_SIDA,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    isAccessibleForFree: true,
    inLanguage: 'sv',
    creator: { '@type': 'Organization', name: 'Jobbcoach.ai', url: 'https://www.jobbcoach.ai' },
    isBasedOn: { '@type': 'Organization', name: 'Statistiska centralbyrån (SCB)', url: 'https://www.scb.se' },
    spatialCoverage: { '@type': 'Place', name: 'Sverige' },
    temporalCoverage: `${D.ar[0]}/${sistManad.slice(0, 4)}-${sistManad.slice(5)}`,
    dateModified: D.hamtad,
    variableMeasured: ['Arbetslösa per ledigt jobb', 'Anställda per yrke', 'Månadslön', 'Arbetslöshet', 'Sysselsättningsgrad'],
    distribution: [
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: 'https://www.jobbcoach.ai/jobbkartan/data/kommuner.json' },
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: 'https://www.jobbcoach.ai/jobbkartan/data/yrken.json' },
    ],
  }

  return (
    <PubliktSida>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dataset) }} />
      <main className="jk">
        {/* 1. Hjälten */}
        <section className="sek yta-mark" id="jk-hjalte" style={{ paddingTop: 'clamp(20px, 3vw, 40px)' }}>
          <div className="wrap">
            <Breadcrumb
              items={[
                { name: 'Hem', href: '/' },
                { name: 'Jobbkartan', href: '/jobbkartan' },
              ]}
            />
          </div>
          <div className="wrap hjalte">
            <div className="hjalte-text">
              <p className="kick">Jobbkartan, {kvartalNamn(D.kvartal[q])}</p>
              <h1 className="h1">{rubrik(D)}</h1>
              <p className="ingress" style={{ marginTop: 22 }}>
                Vi la ihop SCB:s arbetslösa och arbetsgivarnas lediga jobb, län för län. Det ger ett enkelt mått på kön:{' '}
                <b>hur många som konkurrerar om samma annons.</b> Ljusa län är lätta att få jobb i, mörka är trånga. Peka på ett
                län, eller dra i tiden.
              </p>
              <HjalteTal D={D} />
            </div>
            <KartScen D={D} />
            <Tidrad D={D} />
          </div>
        </section>

        {/* 2. Konkurrensen om jobben */}
        <section className="sek yta-panel" id="jk-konkurrens">
          <div className="wrap">
            <p className="kick">Konkurrensen om jobben</p>
            <h2 className="h2" style={{ maxWidth: '18ch' }}>
              Så lång är kön till varje ledigt jobb
            </h2>
            <p className="ingress" style={{ marginTop: 18 }}>
              SCB frågar hushållen vilka som är arbetslösa och arbetsgivarna hur många jobb som står lediga, varje kvartal. Delar
              vi det ena med det andra får vi kön. <b>Hela landet: {fmt(kon(D, '00', q), 1)} per jobb.</b>
              {ex.min && ex.max
                ? ` ${kort(ex.min.kod)}: ${fmt(ex.min.v, 1)}. ${kort(ex.max.kod)}: ${fmt(ex.max.v, 1)}.`
                : null}
            </p>
            <div className="tva">
              <div className="kort">
                <h3 className="h4" id="jk-pikto-rubrik">
                  {D.lanNamn['01']}
                </h3>
                <div className="tal-stor">
                  <span className="v" id="jk-pikto-tal">
                    {fmt(kon(D, '01', q), 1)}
                  </span>
                  <span className="e" id="jk-pikto-e">
                    arbetslösa per ledigt jobb, {kvartalNamn(D.kvartal[q])}
                  </span>
                </div>
                <div className="pikto">
                  <div>
                    <div className="pikto-rad jobb" id="jk-pikto-jobb" />
                    <p className="pikto-etikett">Tio lediga jobb</p>
                  </div>
                  <div>
                    <div className="pikto-rad folk" id="jk-pikto-folk" />
                    <p className="pikto-etikett" id="jk-pikto-folk-e" />
                  </div>
                </div>
                <p className="liten" id="jk-pikto-text" style={{ marginTop: 18 }} />
              </div>
              <div className="staplar">
                <h3 className="h4" id="jk-staplar-rubrik">
                  Alla län, {kvartalNamn(D.kvartal[q])}
                </h3>
                <p className="liten" style={{ marginBottom: 12 }}>
                  Arbetslösa per ledigt jobb. Den streckade linjen är hela landet. Klicka på ett län för att markera det.
                </p>
                <svg id="jk-lanstaplar" role="img" aria-label="Stapeldiagram över arbetslösa per ledigt jobb i alla län" />
              </div>
            </div>
            <div className="sektionsrad diagram">
              <h3 className="h3">Två år av kö, kvartal för kvartal</h3>
              <p className="liten" style={{ marginBottom: 14 }}>
                Hela landet och det markerade länet. Bandet runt landets linje är SCB:s osäkerhetsmarginal för lediga jobb.
              </p>
              <svg id="jk-tidlinje" role="img" aria-label="Linjediagram över arbetslösa per ledigt jobb per kvartal" />
              <div className="legend-rad" id="jk-tid-legend" />
            </div>
          </div>
        </section>

        {/* 3. Ditt yrke */}
        <section className="sek yta-ton" id="jk-yrke">
          <div className="wrap">
            <p className="kick">Ditt yrke på kartan</p>
            <h2 className="h2" style={{ maxWidth: '16ch' }}>
              Var är ditt yrke vanligast?
            </h2>
            <p className="ingress" style={{ marginTop: 18 }}>
              Vi räknar inte antal, för då vinner alltid Stockholm. Vi räknar{' '}
              <b>hur stor del av länets anställda som har yrket</b> och jämför med landet. 2,0 betyder dubbelt så vanligt som i
              snitt, 0,5 hälften.
            </p>
            <div className="sok">
              <label className="sr" htmlFor="jk-yrkesok">
                Sök yrke
              </label>
              <input
                type="search"
                id="jk-yrkesok"
                placeholder={`Sök bland ${D.antalYrken} yrken, till exempel sjuksköterska eller lastbil`}
                autoComplete="off"
                role="combobox"
                aria-expanded="false"
                aria-controls="jk-yrkelista"
                aria-autocomplete="list"
              />
              {SOK_IKON}
              <ul id="jk-yrkelista" role="listbox" hidden />
            </div>
            <div className="chips" id="jk-yrkechips" role="group" aria-label="Vanliga yrken">
              {D.utvaldaYrken.map(([kod, namn]) => (
                <button key={kod} type="button" className="chip" data-kod={kod} aria-pressed={kod === '2221'}>
                  {namn}
                </button>
              ))}
            </div>
            <div className="yrke-grid">
              <div>
                <figure className="yrke-karta" style={{ margin: 0 }}>
                  <svg className="karta" id="jk-yrkekarta" role="img" aria-label="Karta över var yrket är vanligt" />
                  <figcaption className="legend" aria-hidden="true">
                    <span>Ovanligt</span>
                    <div className="ramp">
                      <i className="k1" />
                      <i className="k2" />
                      <i className="k3" />
                      <i className="k4" />
                      <i className="k5" />
                    </div>
                    <span>Vanligt, jämfört med landet</span>
                  </figcaption>
                </figure>
              </div>
              <div className="yrke-fakta">
                <div>
                  <h3 className="h3" id="jk-yrke-namn">
                    Grundutbildade sjuksköterskor
                  </h3>
                  <div className="tal-stor" style={{ marginBottom: 12 }}>
                    <span className="v" id="jk-yrke-lq">
                      &nbsp;
                    </span>
                    <span className="e" id="jk-yrke-lq-e">
                      &nbsp;
                    </span>
                  </div>
                  <ol className="topplista" id="jk-yrke-topp" />
                </div>
                <div className="diagram">
                  <h4 className="h4" id="jk-yrke-trend-rubrik">
                    Anställda i hela landet
                  </h4>
                  <svg id="jk-yrketrend" role="img" aria-label="Linje över antal anställda i yrket per år" />
                  <p className="liten" id="jk-yrke-trend-text" style={{ marginTop: 8 }} />
                </div>
                <div>
                  <h4 className="h4" id="jk-kon-rubrik">
                    Män och kvinnor i yrket
                  </h4>
                  <div className="konbar" id="jk-konbar" aria-hidden="true" />
                  <div className="kon-etikett" id="jk-kon-etikett" />
                </div>
                <div className="tva-listor">
                  <div className="upp">
                    <h4 id="jk-utv-upp-h">Växer mest</h4>
                    <ul id="jk-utv-upp" />
                  </div>
                  <div className="ner">
                    <h4 id="jk-utv-ner-h">Krymper mest</h4>
                    <ul id="jk-utv-ner" />
                  </div>
                </div>
              </div>
            </div>
            <div className="sektionsrad">
              <h3 className="h3">Månadslön, område för område</h3>
              <p className="brod" style={{ marginTop: 8 }}>
                SCB publicerar lönen för åtta riksområden, inte för län. Därför färgar vi områdena och lägger länsgränserna tunna
                ovanpå, i stället för att låtsas att vi vet mer än vi gör. Medellön per månad, alla sektorer.
              </p>
              <div className="lon-grid">
                <figure className="karta-liten" style={{ margin: 0 }}>
                  <svg className="karta" id="jk-lonkarta" role="img" aria-label="Karta över månadslön per riksområde" />
                </figure>
                <div className="staplar diagram">
                  <svg id="jk-lonstaplar" role="img" aria-label="Stapeldiagram över månadslön per riksområde" />
                  <p className="liten" id="jk-lon-fot" style={{ marginTop: 8 }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Din kommun */}
        <section className="sek yta-panel" id="jk-kommun">
          <div className="wrap">
            <p className="kick">Din kommun</p>
            <h2 className="h2" style={{ maxWidth: '16ch' }}>
              Hur ser det ut där du bor?
            </h2>
            <p className="ingress" style={{ marginTop: 18 }}>
              Arbetslöshet och sysselsättningsgrad för 20 till 65 år, månad för månad sedan {manadNamn(D.manader[0], true)}.{' '}
              <b>Din kommun mot länet och hela landet.</b> Siffrorna är SCB:s preliminära registerstatistik och kan justeras när
              nya månader kommer.
            </p>
            <div className="sok">
              <label className="sr" htmlFor="jk-kommunsok">
                Sök kommun
              </label>
              <input
                type="search"
                id="jk-kommunsok"
                placeholder={`Sök bland ${D.antalKommuner} kommuner`}
                autoComplete="off"
                role="combobox"
                aria-expanded="false"
                aria-controls="jk-kommunlista"
                aria-autocomplete="list"
              />
              {SOK_IKON}
              <ul id="jk-kommunlista" role="listbox" hidden />
            </div>
            <div className="kommun-grid">
              <div className="kommun-tal">
                <div className="kort">
                  <h3 className="h4" id="jk-kommun-namn">
                    Göteborg
                  </h3>
                  <div className="tal-stor">
                    <span className="v" id="jk-kommun-al">
                      &nbsp;
                    </span>
                    <span className="e" id="jk-kommun-al-e">
                      arbetslösa
                    </span>
                  </div>
                  <div className="tal-stor" style={{ marginTop: 0 }}>
                    <span className="v" id="jk-kommun-sg" style={{ fontSize: 'clamp(34px,5vw,48px)' }}>
                      &nbsp;
                    </span>
                    <span className="e">sysselsatta av alla 20 till 65 år</span>
                  </div>
                  <p className="liten" id="jk-kommun-text" />
                </div>
                <div className="lagst-hogst">
                  <div>
                    <h4>Lägst nu</h4>
                    <ul>
                      {D.kommunLagst.map((k) => (
                        <li key={k.kod}>
                          <button type="button" data-kommun={k.kod}>
                            {k.namn}
                          </button>
                          <b>{fmt(k.v, 1)} %</b>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>Högst nu</h4>
                    <ul>
                      {D.kommunHogst.map((k) => (
                        <li key={k.kod}>
                          <button type="button" data-kommun={k.kod}>
                            {k.namn}
                          </button>
                          <b>{fmt(k.v, 1)} %</b>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="diagram-par">
                <div className="diagram">
                  <h4 className="h4">Arbetslöshet, procent</h4>
                  <svg id="jk-kommun-al-diagram" role="img" aria-label="Arbetslöshet per månad för kommunen, länet och landet" />
                </div>
                <div className="diagram">
                  <h4 className="h4">Sysselsättningsgrad, procent</h4>
                  <svg
                    id="jk-kommun-sg-diagram"
                    role="img"
                    aria-label="Sysselsättningsgrad per månad för kommunen, länet och landet"
                  />
                </div>
                <div className="legend-rad" id="jk-kommun-legend" style={{ gridColumn: '1/-1' }} />
              </div>
            </div>
          </div>
        </section>

        {/* 5. För journalister */}
        <section className="sek yta-black" id="jk-data">
          <div className="wrap">
            <p className="kick">För journalister och nyfikna</p>
            <h2 className="h2" style={{ maxWidth: '20ch' }}>
              Allt här går att kontrollera, ladda ner och bädda in
            </h2>
            <p className="ingress" style={{ marginTop: 18 }}>
              Inga egna skattningar. Varje diagram har en källa med tabellnummer, och det du ser på skärmen kan du ta med dig som
              CSV. Fri att använda, <b>CC0, ange gärna SCB</b>.
            </p>
            <div className="data-grid">
              <div className="data-kort">
                <h3>Källor</h3>
                <dl>
                  <div>
                    <dt>Konkurrensen om jobben</dt>
                    <dd>
                      SCB TAB6428. Arbetslösa ur AKU och lediga jobb ur Konjunkturstatistik över lediga jobb, kvartal{' '}
                      {kvartalKort(D.kvartal[0])} till {kvartalKort(D.kvartal[q])}.
                    </dd>
                  </div>
                  <div>
                    <dt>Arbetslöshet, sysselsättningsgrad</dt>
                    <dd>
                      SCB TAB5663, BAS, preliminär registerstatistik 20 till 65 år, {manadNamn(D.manader[0])} till{' '}
                      {manadNamn(sistManad)}.
                    </dd>
                  </div>
                  <div>
                    <dt>Yrken per län</dt>
                    <dd>
                      SCB TAB4428, yrkesregistret. Anställda med arbetsplats i länet, {D.ar[0]} till {D.ar[D.ar.length - 1]}.
                    </dd>
                  </div>
                  <div>
                    <dt>Lön</dt>
                    <dd>
                      SCB TAB5696, lönestrukturstatistik per riksområde, {D.lonAr[0]} till {D.lonAr[D.lonAr.length - 1]}.
                    </dd>
                  </div>
                  <div>
                    <dt>Platsannonser</dt>
                    <dd>Arbetsförmedlingen, JobTech JobSearch, uppdaterat varje dygn.</dd>
                  </div>
                </dl>
                <p className="liten">SCB-siffrorna hämtades {D.hamtad}.</p>
              </div>
              <div className="data-kort">
                <h3>Metod i klartext</h3>
                <ul>
                  <li>
                    <b>Kön</b> är arbetslösa delat med lediga jobb i samma län och kvartal. 1,7 betyder 17 arbetslösa på 10 lediga
                    jobb.
                  </li>
                  <li>
                    <b>Var yrket är vanligt</b> är yrkets andel av länets anställda delat med samma andel i landet. 1,0 är som
                    snittet.
                  </li>
                  <li>
                    <b>Växer och krymper</b> jämför antal anställda i länet {D.ar[D.ar.length - 1]} med {D.ar[0]}. Län med färre
                    än 100 anställda i yrket utelämnas.
                  </li>
                  <li>
                    <b>Lön</b> är medellön per månad, alla sektorer, senaste år med uppgift. Saknas uppgift visar vi det.
                  </li>
                  <li>
                    Arbetslöshet per kommun är registerbaserad och mäter inte samma sak som AKU. Vi blandar dem aldrig i samma
                    diagram.
                  </li>
                </ul>
              </div>
              <div className="data-kort">
                <h3>Osäkerhet</h3>
                <p>Lediga jobb är en urvalsundersökning. SCB anger en marginal, och i små län är den stor.</p>
                <div>
                  <div className="osak-v" id="jk-osak-riket" />
                  <p id="jk-osak-riket-e" />
                </div>
                <div>
                  <div className="osak-v" id="jk-osak-lan" />
                  <p id="jk-osak-lan-e" />
                </div>
                <p className="liten">Läs små län som en riktning, inte som ett exakt tal. Bandet i linjediagrammet visar marginalen.</p>
              </div>
              <div className="data-kort">
                <h3>Ta med dig det du ser</h3>
                <button type="button" className="knapp-tunn" id="jk-csv-konk">
                  {NER_IKON}CSV: konkurrensen per län
                </button>
                <button type="button" className="knapp-tunn" id="jk-csv-yrke">
                  {NER_IKON}CSV: valt yrke per län
                </button>
                <button type="button" className="knapp-tunn" id="jk-csv-kommun">
                  {NER_IKON}CSV: vald kommun per månad
                </button>
                <button type="button" className="knapp-tunn" id="jk-badd">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m8 8-4 4 4 4m8-8 4 4-4 4" />
                  </svg>
                  Kopiera bäddkod
                </button>
                <button type="button" className="knapp-tunn" id="jk-lank">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
                  </svg>
                  Kopiera länk till den här vyn
                </button>
                <p className="liten">Bäddkoden ger kartan och tidsreglaget i den vy du har valt, i en ram på 600 × 760 punkter.</p>
                <code id="jk-badd-kod" />
              </div>
            </div>
            <details className="tabell">
              <summary>Kartans siffror som tabell, alla län och kvartal</summary>
              <div className="tabell-wrap">
                <table id="jk-tabell">
                  <caption className="sr">Arbetslösa per ledigt jobb per län och kvartal</caption>
                  <thead>
                    <tr>
                      <th>Län</th>
                      {D.kvartal.map((k, i) => (
                        <th key={k} className={`tal${i === q ? ' nu' : ''}`} data-q={i}>
                          {kvartalKort(k)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['00', ...D.lanKoder].map((kod) => (
                      <tr key={kod}>
                        <th scope="row">{D.lanNamn[kod]}</th>
                        {D.kvartal.map((k, i) => (
                          <td key={k} className={`tal${i === q ? ' nu' : ''}`} data-q={i}>
                            {fmt(kon(D, kod, i), 1)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </section>

        {/* 6. Vanliga frågor */}
        <section className="sek yta-mark" id="jk-fragor">
          <div className="wrap" style={{ maxWidth: 820 }}>
            <Faq id="vanliga-fragor" rubrik="Vanliga frågor om jobbkartan" fragor={fragor} schema />
          </div>
        </section>

        {/* 7. Vägen vidare */}
        <section className="sek yta-panel" id="jk-vidare">
          <div className="wrap vidare">
            <div>
              <p className="kick">När du vet var jobben finns</p>
              <h2 className="h2" style={{ maxWidth: '18ch' }}>
                Sök där kön är kort, med ett CV som syns
              </h2>
              <p className="ingress" style={{ marginTop: 18 }}>
                Jobbmatchningen läser ditt CV och hittar platsannonserna som passar dig, nära dig eller i hela Sverige. Varje
                träff får ett skäl, och du kan skriva det personliga brevet direkt från annonsen.
              </p>
              <div className="vidare-knappar">
                <Link className="knapp" href="/verktyg/jobbmatchning">
                  Se jobbmatchningen
                </Link>
                <Link className="knapp-tunn" href="/cv-exempel">
                  CV-exempel för ditt yrke
                </Link>
              </div>
            </div>
          </div>
        </section>
        <JkTillbehor />
      </main>
      <JobbkartanKlient data={D} />
    </PubliktSida>
  )
}
