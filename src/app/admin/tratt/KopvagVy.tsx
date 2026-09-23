/**
 * Tratt, vyn Köpvägen (spec-admin-tydlighet punkt 8, sidan 3 "efter").
 *
 * Fönstret är "sedan paketen släpptes" tills 30 dagar finns. Stegen står
 * som en lista med tal, inte som trappa, tills stegen är samma personer:
 * trappan med andelar visas först när minst fem nått köpsteget. Sektioner
 * utan data är en rad, inte ett tomt diagram.
 *
 * Kritiska vägen: admin_flode_daily och profiles (Supabase). Köp, intäkt och
 * förnyelser kommer ur Stripe i Suspense-gränser med reserverad höjd.
 */

import { Suspense, cache, type ReactNode } from 'react';
import { dagStr } from '@/lib/admin/collect';
import MetricCard from '@/components/admin/MetricCard';
import { hamtaKopLiggare, type KopRad } from '@/lib/admin/kop';
import type { Undantag } from '@/lib/admin/undantag';
import { MATSTART, datumKort, klockslag, kronor, tal, tidKort } from '@/lib/admin/tomt';
import { BlockeringDiagram, FornyelseDiagram, IntaktDiagram, KomIgangDiagram } from './TrattDiagram';
import { PaketForklaring, PaketNamn, Panel, Valrad } from './delar';
import { hamtaFornyelser, hamtaKontonSkapade, hamtaKopvagData, type KopvagData } from './kopvag-data';
import {
  DIAGRAM_DAGAR,
  FONSTER_VAL,
  KOPARE_MINST,
  PAKET_NAMN,
  PAKETEN,
  TRAPPA_MINST,
  fornyelseRad,
  intaktPerDag,
  intaktPerPaket,
  komIgangRad,
  kopAntalText,
  kopIFonster,
  kopstegKort,
  matsFranIFonster,
  senaste,
  stoppMening,
  talOrd,
  type FonsterVal,
} from './berakning';

/** En Stripe-läsning per förfrågan, delad av korten, köpraden och intäkten. */
const lasKop = cache(() => hamtaKopLiggare(30));

/** Korten har samma minsta höjd, så att Stripe-korten inte flyttar raden. */
const KORT = 'min-h-[148px]';

export default async function KopvagVy({
  fonster,
  konton,
}: {
  fonster: FonsterVal;
  konton: Undantag['konton'];
}) {
  const d = await hamtaKopvagData(fonster, konton);
  const trappa = d.kopsteget >= TRAPPA_MINST;
  const kopvagMatsFran = matsFranIFonster(MATSTART.kopvag, fonster.franIso);

  const stoppPeriod =
    d.stoppDagar.length && d.stoppDagar.every((dag) => dag === fonster.tillDag) ? 'i dag' : fonster.etikett;
  const sparDelar = PAKETEN.filter((p) => d.spar.perPaket[p] > 0).map(
    (p) => `${tal(d.spar.perPaket[p])} ${PAKET_NAMN[p]}`
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Valrad
          etikett="Fönster"
          val={FONSTER_VAL.map((f) => ({
            namn: f.namn,
            href: f.nyckel === fonster.standard ? '/admin/tratt' : `/admin/tratt?fonster=${f.nyckel}`,
            aktiv: f.nyckel === fonster.nyckel,
          }))}
        />
        <p className="text-meta text-ink-3">
          {`Visar ${fonster.etikett}, ${tal(fonster.dagar)} ${fonster.dagar === 1 ? 'dag' : 'dagar'}. ${tal(Math.min(d.samladeDagar, fonster.dagar))} av dem är insamlade ur PostHog.`}
        </p>
      </div>

      {/* ---------------------------------------------------- Toppkorten */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          className={KORT}
          etikett="Nya konton"
          varde={d.nyaKonton === null ? <Liten>Databasen svarade inte</Liten> : tal(d.nyaKonton)}
          jamforelse={`ur databasen, ${fonster.etikett}`}
        />
        <Suspense
          fallback={
            <>
              <MetricCard className={KORT} etikett="Köpsteget till betalt" varde={<Liten>Hämtar köp</Liten>} jamforelse="ur Stripe" />
              <MetricCard className={KORT} etikett="Köp" varde={<Liten>Hämtar köp</Liten>} jamforelse="ur Stripe" />
            </>
          }
        >
          <KopKort fonster={fonster} kopsteget={d.kopsteget} />
        </Suspense>
      </section>

      {/* ----------------------------------------------------- Köpvägen */}
      <Panel rubrik={`Köpvägen ${fonster.etikett}`}>
        <ol className="divide-y divide-kant">
          <StegRad tagg="konton" text="Nya konton, ur databasen" antal={d.nyaKonton} />
          <StegRad
            tagg="spår"
            text={`Personer som valde spår, ur PostHog${sparDelar.length ? `: ${sparDelar.join(', ')}` : ''}`}
            antal={d.spar.totalt}
          />
          <StegRad
            tagg="köpsteg"
            text={`Såg köpsteget, ur PostHog${kopvagMatsFran ? `, mäts från ${tidKort(kopvagMatsFran)}` : ''}`}
            antal={d.kopsteget}
            andel={trappa ? andelAv(d.kopsteget, d.spar.totalt) : undefined}
          />
          <StegRad
            tagg="kassa"
            text={`Gick till kassan, ur PostHog${kopvagMatsFran ? `, mäts från ${tidKort(kopvagMatsFran)}` : ''}`}
            antal={d.kassan}
            andel={trappa ? andelAv(d.kassan, d.kopsteget) : undefined}
          />
          <Suspense fallback={<StegRad tagg="köp" text="Köp ur Stripe, hämtas" antal={null} />}>
            <KopStegRad fonster={fonster} kassan={d.kassan} trappa={trappa} />
          </Suspense>
        </ol>
        <p className="mt-3 text-meta text-ink-3">
          {trappa
            ? `Andelen står mot steget ovanför. Personer räknas unika per dag och summeras över fönstret; köpen är köp ur Stripe efter ${tidKort(MATSTART.kopvag)}, utan förnyelser.`
            : `Raderna ritas inte som trappa förrän stegen är samma personer: konton kommer ur databasen, spårval och köpsteg ur PostHog, köp ur Stripe. Köpsteget och kassan mäts från ${tidKort(MATSTART.kopvag)}. Trappan visas när ${talOrd(TRAPPA_MINST)} personer nått köpsteget (${tal(d.kopsteget)} hittills).`}
        </p>
      </Panel>

      {/* ------------------------------------------- Var det tar stopp */}
      <Panel rubrik="Var det tar stopp">
        {d.stoppDagar.length < DIAGRAM_DAGAR ? (
          <p className="text-sm leading-[22px] text-ink-2">
            {stoppMening(d.blockerade, d.graVal, stoppPeriod, d.kopvagFran)}
          </p>
        ) : (
          <>
            <PaketForklaring />
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-kort text-ink-1">Betalvägg visad</p>
                <BlockeringDiagram rader={d.blockerade} tomText={`0 spärrar ${fonster.etikett}.`} />
              </div>
              <div>
                <p className="mb-2 text-kort text-ink-1">Grått val tryckt</p>
                <BlockeringDiagram rader={d.graVal} tomText={`0 gråa val sedan ${tidKort(d.kopvagFran)}.`} />
              </div>
            </div>
            <p className="mt-4 text-meta text-ink-3">
              Personer per funktion, unika per dag och summerade. Färgen är paketet betalväggen
              föreslår för funktionen.
            </p>
          </>
        )}
      </Panel>

      {/* ---------------------------------- Kom igång och förnyelser */}
      <Panel rubrik="Kom igång och förnyelser">
        <KomIgang d={d} />
        <div className="mt-3 border-t border-kant pt-3">
          <Suspense
            fallback={<p className="min-h-[44px] text-sm leading-[22px] text-ink-3">Förnyelserna hämtas ur Stripe.</p>}
          >
            <Fornyelser konton={konton} />
          </Suspense>
        </div>
      </Panel>

      {/* ------------------------------------------ Intäkt per paket */}
      <Suspense
        fallback={
          <Panel rubrik={`Intäkt per paket, ${fonster.etikett}`}>
            <div className="h-[200px] rounded-lg bg-insunken" aria-busy="true" aria-label="Hämtar köp ur Stripe" />
          </Panel>
        }
      >
        <Intakt fonster={fonster} />
      </Suspense>
    </div>
  );
}

/** Text i ett kort som inte är ett tal, i mindre grad än talen. */
function Liten({ children }: { children: ReactNode }) {
  return <span className="block text-fraga">{children}</span>;
}

function andelAv(del: number, bas: number): number | null {
  return bas > 0 ? del / bas : null;
}

/**
 * Ett steg i köpvägen. Utan andel är det en rad med tal. Med andel (trappan)
 * får raden en stapel och procenten mot steget ovanför.
 */
function StegRad({
  tagg,
  text,
  antal,
  andel,
}: {
  tagg: string;
  text: ReactNode;
  antal: number | null;
  andel?: number | null;
}) {
  return (
    <li className="py-2.5">
      <div className="flex min-h-[24px] items-baseline gap-3">
        <span className="w-16 shrink-0 text-meta text-ink-3">{tagg}</span>
        <span className="min-w-0 flex-1 text-sm text-ink-1">{text}</span>
        <span className="shrink-0 text-sm font-medium tabular-nums text-ink-1">
          {antal === null ? '' : tal(antal)}
        </span>
      </div>
      {andel !== undefined ? (
        <div className="mt-1.5 flex items-center gap-3 pl-[76px]">
          <div className="h-2 flex-1 rounded-md bg-insunken">
            <div
              className="h-2 rounded-md bg-ink-1"
              style={{ width: `${andel === null ? 0 : Math.max(1.5, Math.min(100, andel * 100))}%` }}
            />
          </div>
          <span className="w-24 shrink-0 text-right text-meta tabular-nums text-ink-3">
            {andel === null ? 'inget ovanför' : `${Math.round(andel * 100)} % av ovan`}
          </span>
        </div>
      ) : null}
    </li>
  );
}

/** Köpsteget till betalt och köpen i fönstret, ur Stripe. */
async function KopKort({ fonster, kopsteget }: { fonster: FonsterVal; kopsteget: number }) {
  const l = await lasKop();
  if (l.fel) {
    return (
      <>
        <MetricCard className={KORT} etikett="Köpsteget till betalt" varde={<Liten>Stripe svarar inte</Liten>} jamforelse={l.fel} />
        <MetricCard className={KORT} etikett="Köp" varde={<Liten>Stripe svarar inte</Liten>} jamforelse="Försök igen om en stund." />
      </>
    );
  }
  const kopFonster = kopIFonster(l.rader, fonster.franIso);
  const efter = kopIFonster(l.rader, senaste(fonster.franIso, MATSTART.kopvag));
  const fore = kopIFonster(l.rader, fonster.franIso, MATSTART.kopvag);
  const k = kopstegKort(kopsteget, efter, fore);
  const summa = kopFonster.reduce((s, r) => s + r.beloppOre, 0);
  const senasteKop = l.rader.find((r) => !r.internt && !r.aterbetalning);

  return (
    <>
      <MetricCard
        className={KORT}
        etikett="Köpsteget till betalt"
        varde={k.matsFran ? <Liten>{k.varde}</Liten> : k.varde}
        jamforelse={k.jamforelse}
      />
      <MetricCard
        className={KORT}
        etikett="Köp"
        varde={tal(kopFonster.length)}
        jamforelse={
          kopFonster.length
            ? `${kronor(summa)} ur Stripe, förnyelser oräknade. Senaste: ${kopFonster[0].paketNamn} ${kronor(kopFonster[0].beloppOre)}, ${tidKort(kopFonster[0].tid)}.`
            : `0 köp ${fonster.etikett}.${senasteKop ? ` Senaste betalning: ${senasteKop.paketNamn} ${kronor(senasteKop.beloppOre)}, ${tidKort(senasteKop.tid)}.` : ''}`
        }
      />
    </>
  );
}

/** Sista steget i köpvägen: köpen ur Stripe, med kontots ålder. */
async function KopStegRad({ fonster, kassan, trappa }: { fonster: FonsterVal; kassan: number; trappa: boolean }) {
  const l = await lasKop();
  if (l.fel) return <StegRad tagg="köp" text={`Köp ur Stripe: Stripe svarar inte (${l.fel}).`} antal={null} />;

  const kop = kopIFonster(l.rader, fonster.franIso);
  const efter = kopIFonster(l.rader, senaste(fonster.franIso, MATSTART.kopvag));
  const skapade = await hamtaKontonSkapade(
    [...new Set(kop.map((r) => r.userId).filter((id): id is string => Boolean(id)))].sort()
  );

  const beskriv = (r: KopRad) => {
    const tid = dagStr(new Date(r.tid)) === fonster.tillDag ? `i dag kl. ${klockslag(r.tid)}` : tidKort(r.tid);
    const konto = r.userId && skapade[r.userId] ? `, konto skapat ${datumKort(skapade[r.userId])}` : '';
    return `${r.paketNamn} ${kronor(r.beloppOre)}, ${tid}${konto}`;
  };
  const lista = kop.slice(0, 3).map(beskriv).join('; ') + (kop.length > 3 ? ` och ${kop.length - 3} till` : '');

  return (
    <StegRad
      tagg="köp"
      text={kop.length ? `Köp ur Stripe: ${lista}` : `Köp ur Stripe: 0 ${fonster.etikett}`}
      antal={kop.length}
      andel={trappa ? andelAv(efter.length, kassan) : undefined}
    />
  );
}

function KomIgang({ d }: { d: KopvagData }) {
  if (d.kopareEfterKopvag < KOPARE_MINST) {
    return (
      <p className="text-sm leading-[22px] text-ink-2">
        {d.kopareEfterKopvag === 0 ? <b className="font-medium text-ink-1">Inga köpare att följa än. </b> : null}
        {komIgangRad(d.kopareEfterKopvag)}
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {d.komIgang.map((k) => (
        <div key={k.paket}>
          <p className="mb-1 text-kort text-ink-1">
            <PaketNamn paket={k.paket} />
          </p>
          <p className="mb-2 text-meta text-ink-3">
            {k.kopare === 0
              ? `0 köpare sedan ${tidKort(MATSTART.kopvag)}`
              : `${tal(k.kopare24)} köpare minst ett dygn gamla, ${tal(k.kopare7d)} minst sju`}
          </p>
          {k.kopare24 > 0 ? <KomIgangDiagram brickor={k.brickor} /> : null}
        </div>
      ))}
    </div>
  );
}

async function Fornyelser({ konton }: { konton: Undantag['konton'] }) {
  const f = await hamtaFornyelser(konton);
  if (!f.tillganglig) {
    return <p className="text-sm leading-[22px] text-ink-2">{`Förnyelserna går inte att räkna utan Stripe: ${f.fel ?? 'Stripe svarade inte'}.`}</p>;
  }
  const kohort = PAKETEN.reduce((s, p) => s + f.kohort[p], 0);
  if (kohort < KOPARE_MINST) {
    return <p className="text-sm leading-[22px] text-ink-2">{fornyelseRad(f.veckokopare, f.forstaVeckokop)}</p>;
  }
  return (
    <div>
      <p className="mb-2 text-sm text-ink-2">
        {PAKETEN.filter((p) => f.veckaTva[p] !== null)
          .map((p) => `${PAKET_NAMN[p]}: ${f.veckaTva[p]} % betalar vecka 2 (av ${tal(f.kohort[p])})`)
          .join('. ')}
        .
      </p>
      <FornyelseDiagram veckor={f.veckor} />
      <p className="mt-2 text-meta text-ink-3">
        Veckoprenumerationer skapade de senaste hundra dagarna, ur Stripe. Vecka n betyder minst n
        betalda fakturor, räknat bara på prenumerationer som hunnit dit.
      </p>
    </div>
  );
}

async function Intakt({ fonster }: { fonster: FonsterVal }) {
  const l = await lasKop();
  const rubrik = `Intäkt per paket, ${fonster.etikett}`;
  if (l.fel) {
    return (
      <Panel rubrik={rubrik}>
        <p className="text-sm leading-[22px] text-ink-2">{`Stripe svarade inte: ${l.fel}`}</p>
      </Panel>
    );
  }
  const rader = intaktPerPaket(l.rader, fonster.franIso);
  const dagar = intaktPerDag(l.rader, fonster);
  const dagarMedKop = dagar.filter((x) => x.cv !== null || x.tester !== null || x.allt !== null).length;
  const summa = rader.reduce((s, r) => s + r.ore, 0);
  const interna = l.rader.filter((r) => r.internt && Date.parse(r.tid) >= Date.parse(fonster.franIso)).length;

  return (
    <Panel rubrik={rubrik}>
      {dagarMedKop >= DIAGRAM_DAGAR ? (
        <div className="mb-4">
          <IntaktDiagram dagar={dagar} />
        </div>
      ) : null}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-kant text-left text-ink-3">
            <th className="py-2 pr-3 font-medium">Paket</th>
            <th className="py-2 pr-3 text-right font-medium">Köp</th>
            <th className="py-2 text-right font-medium">Intäkt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kant">
          {rader.map((r) => (
            <tr key={r.paket ?? 'okant'}>
              <td className="py-2 pr-3 text-ink-1">
                <PaketNamn paket={r.spar} namn={r.namn} />
              </td>
              <td className="py-2 pr-3 text-right tabular-nums text-ink-2">{kopAntalText(r)}</td>
              <td className="py-2 text-right tabular-nums text-ink-1">{kronor(r.ore)}</td>
            </tr>
          ))}
          <tr>
            <td className="py-2 pr-3 font-medium text-ink-1">Totalt</td>
            <td className="py-2 pr-3" />
            <td className="py-2 text-right font-medium tabular-nums text-ink-1">{kronor(summa)}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 text-meta text-ink-3">
        {`Ur Stripe. Dagspasset och andra engångsköp ingår, återbetalningar dras från sitt paket.${interna ? ` ${tal(interna)} ${interna === 1 ? 'internt köp' : 'interna köp'} undantagna.` : ''} `}
        {dagarMedKop >= DIAGRAM_DAGAR
          ? 'Diagrammet visar intäkt per dag i spårfärgerna.'
          : `Tabell tills köpen finns på ${talOrd(DIAGRAM_DAGAR)} dagar (${tal(dagarMedKop)} hittills); då kommer diagrammet med spårfärgerna.`}
      </p>
    </Panel>
  );
}
