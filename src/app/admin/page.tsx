/**
 * Oversikt (docs/plan-admin.md avsnitt 4.1, omgjord efter
 * spec-admin-tydlighet 2026-09-22).
 *
 * Morgonfragan forst: vad har hant sedan i gar? Sedan pengarna, folket,
 * anvandningen, mejlen och driften, en sektion var.
 *
 * Serverkomponent. Kritiska vagen laser bara Supabase (admin_daily_metrics
 * och nagra sma cachade fragor). Kopen kommer ur Stripe via kop.ts och
 * ligger darfor i Suspense-granser med reserverad hojd: i listan "Sedan i
 * gar", i tre av korten under Pengar och i "Senaste fem kopen".
 *
 * Inga streck. Noll skrivs 0, saknad matning sager sedan nar, och en kalla
 * som ligger efter sager det (src/lib/admin/tomt.ts).
 */

import { Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/shell/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import MetricCard from '@/components/admin/MetricCard';
import FlowError from '@/components/shell/FlowError';
import { hamtaOversikt, type Tal, type Veckotal } from '@/app/api/admin/oversikt/data';
import {
  DYGN_MS,
  kopHandelser,
  kontoKort,
  senasteKop,
  sorteraHandelser,
  tidEtikett,
  tomListaText,
  type Handelse,
} from '@/app/api/admin/oversikt/sedanIgar';
import { lasKopLiggare } from '@/app/admin/intakter/kopKalla';
import {
  kopIFonster,
  kopTypText,
  senasteAv,
  senasteNyFore,
} from '@/app/admin/intakter/kopFormat';
import { hamtaUndantagCachad } from '@/lib/admin/metrics';
import { undantagText } from '@/lib/admin/undantag';
import { datumKort, gscEfter, kronor, tal, tidKort } from '@/lib/admin/tomt';
import MrrDiagram from './MrrDiagram';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Formatering
// ---------------------------------------------------------------------------

const LANK =
  'text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1';

/** Hojden pa en rad i "Sedan i gar". Reserveras for kopen medan Stripe svarar. */
const RAD_HOJD = 44;

function decimal(v: number, decimaler = 1): string {
  return v.toLocaleString('sv-SE', {
    minimumFractionDigits: decimaler,
    maximumFractionDigits: decimaler,
  });
}

/**
 * Deltat som text, utan tecken: MetricCard satter pilen efter talets tecken
 * och fargen efter om utfallet ar bra.
 */
function deltaText(v: number | null, formatera: (n: number) => string): string | undefined {
  if (v === null) return undefined;
  if (v === 0) return 'oförändrat';
  return formatera(Math.abs(v));
}

/** MetricCards jamforelseprops ur ett Tal: i gar forst, veckan pa andra raden. */
function jamforelser(
  t: Tal,
  formatera: (n: number) => string
): { delta?: number | null; deltaText?: string; jamforelse?: string; andraJamforelse?: string } {
  const igar = deltaText(t.motIgar, formatera);
  const vecka = deltaText(t.motForraVeckan, formatera);
  if (igar === 'oförändrat' && vecka === 'oförändrat') {
    return { delta: 0, deltaText: 'oförändrat', jamforelse: 'mot i går och förra veckan' };
  }
  return {
    delta: t.motIgar,
    deltaText: igar,
    jamforelse: igar ? 'mot i går' : undefined,
    andraJamforelse: vecka
      ? `${vecka === 'oförändrat' ? 'Oförändrat' : vecka} mot samma dag förra veckan`
      : undefined,
  };
}

function veckoJamforelse(t: Veckotal): { delta?: number; deltaText?: string; jamforelse?: string } {
  return { delta: t.delta, deltaText: deltaText(t.delta, tal), jamforelse: 'mot veckan innan' };
}

function datumLang(dag: string): string {
  const d = new Date(`${dag}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return dag;
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d);
}

function Tal4({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{children}</div>;
}

/** Platshallare med samma hojd som ett MetricCard, medan Stripe svarar. */
function KortPlats({ etikett }: { etikett: string }) {
  return (
    <div className="h-[118px] rounded-xl border border-kant bg-panel p-4" aria-busy="true">
      <div className="text-sm font-medium text-ink-3">{etikett}</div>
      <div className="mt-2 h-8 w-20 rounded-lg bg-insunken" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sedan i gar
// ---------------------------------------------------------------------------

function HandelseRad({ h, nu }: { h: Handelse; nu: Date }) {
  return (
    <li className="flex min-h-11 items-baseline gap-3 py-2.5">
      <span className="w-20 shrink-0 text-meta tabular-nums text-ink-3">{tidEtikett(h, nu)}</span>
      <span className="min-w-0 flex-1 text-sm leading-[22px] text-ink-1">{h.text}</span>
      {typeof h.beloppOre === 'number' ? (
        <span className="shrink-0 text-sm tabular-nums text-ink-1">{kronor(h.beloppOre)}</span>
      ) : null}
    </li>
  );
}

function HandelseLista({
  handelser,
  nu,
  minHojd,
  efter,
}: {
  handelser: Handelse[];
  nu: Date;
  minHojd: number;
  efter?: ReactNode;
}) {
  return (
    <div style={{ minHeight: minHojd }}>
      <ul className="divide-y divide-kant">
        {handelser.map((h) => (
          <HandelseRad key={h.id} h={h} nu={nu} />
        ))}
      </ul>
      {efter}
    </div>
  );
}

/** Listan med kopen inflatade. Stripe-anrop, alltsa bara inuti Suspense. */
async function SedanIgarMedKop({
  handelser,
  nuMs,
  minHojd,
}: {
  handelser: Handelse[];
  nuMs: number;
  minHojd: number;
}) {
  const nu = new Date(nuMs);
  const liggare = await lasKopLiggare();
  const alla = sorteraHandelser([...handelser, ...kopHandelser(liggare.rader, nuMs - DYGN_MS)]);
  const felRad = liggare.fel ? (
    <p className="mt-2 text-meta text-ink-3">Köpen kunde inte läsas: {liggare.fel}</p>
  ) : null;

  if (!alla.length) {
    const senaste = senasteKop(liggare.rader);
    return (
      <div style={{ minHeight: minHojd }}>
        <p className="text-sm leading-[22px] text-ink-2">{tomListaText(nu)}</p>
        {senaste ? (
          <p className="mt-1 text-meta text-ink-3">
            Senaste köp: {tidKort(senaste.tid)}, {senaste.paketNamn} {kronor(senaste.beloppOre)},
            konto {kontoKort(senaste.userId)}.
          </p>
        ) : (
          <p className="mt-1 text-meta text-ink-3">Inget köp på {liggare.fonsterDagar} dagar.</p>
        )}
        {felRad}
      </div>
    );
  }

  return <HandelseLista handelser={alla} nu={nu} minHojd={minHojd} efter={felRad} />;
}

// ---------------------------------------------------------------------------
// Pengar: korten och listan ur kop.ts
// ---------------------------------------------------------------------------

async function IntaktKort({ nuMs }: { nuMs: number }) {
  const liggare = await lasKopLiggare();
  const f = kopIFonster(liggare.rader, 30, nuMs);
  const s = f.summa;
  // Senaste engångsköpet ur hela liggaren: en nolla på 30 dagar ska ha sitt
  // senaste kända värde med sig.
  const senasteEngangs = senasteAv(liggare.rader, 'engangs');
  return (
    <>
      <MetricCard
        etikett="Intäkt, 30 dagar"
        varde={kronor(s.totaltOre)}
        jamforelse={
          liggare.fel
            ? 'Stripe svarade inte, försök igen om en stund'
            : `${kronor(s.lopandeOre)} löpande, ${kronor(s.engangsOre)} engångs`
        }
      />
      <MetricCard
        etikett="Engångsköp, 30 dagar"
        varde={`${tal(s.antalEngangs)} st`}
        jamforelse={kronor(s.engangsOre)}
        andraJamforelse={
          senasteEngangs
            ? `Senaste: ${senasteEngangs.paketNamn} ${tidKort(senasteEngangs.tid)}`
            : `Inget engångsköp på ${liggare.fonsterDagar} dagar`
        }
      />
    </>
  );
}

async function NyaBetalandeKort({ nuMs }: { nuMs: number }) {
  const liggare = await lasKopLiggare();
  const f = kopIFonster(liggare.rader, 30, nuMs);
  const fore = senasteNyFore(liggare.rader, f.franMs);
  return (
    <MetricCard
      etikett="Nya betalande, 30 dagar"
      varde={tal(f.summa.nyaBetalande)}
      jamforelse={
        fore
          ? `före det: ${datumKort(fore.tid)}, ${fore.paketNamn}`
          : f.summa.nyaBetalande === 0
            ? `0 på ${liggare.fonsterDagar} dagar`
            : 'första betalningen per kund'
      }
    />
  );
}

async function SenasteFemKop({ nuMs }: { nuMs: number }) {
  const liggare = await lasKopLiggare();
  const rader = kopIFonster(liggare.rader, liggare.fonsterDagar, nuMs)
    .rader.filter((r) => !r.internt)
    .slice(0, 5);
  if (!rader.length) {
    return (
      <p className="text-sm text-ink-2">
        {liggare.fel ? `Köpen kunde inte läsas: ${liggare.fel}` : `0 köp på ${liggare.fonsterDagar} dagar.`}
      </p>
    );
  }
  return (
    <ul className="divide-y divide-kant">
      {rader.map((r) => (
        <li key={r.id} className="flex min-h-11 items-baseline gap-3 py-2.5">
          <span className="w-24 shrink-0 text-meta tabular-nums text-ink-3">{tidKort(r.tid)}</span>
          <span className="min-w-0 flex-1 text-sm leading-[22px] text-ink-1">
            {r.paketNamn}
            <span className="text-ink-3"> · {kopTypText(r)}</span>
          </span>
          <span className="shrink-0 text-sm tabular-nums text-ink-1">{kronor(r.beloppOre)}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------

export default async function AdminOversiktPage() {
  let data: Awaited<ReturnType<typeof hamtaOversikt>>;
  let u: Awaited<ReturnType<typeof hamtaUndantagCachad>>;

  try {
    [data, u] = await Promise.all([hamtaOversikt(), hamtaUndantagCachad()]);
  } catch (fel) {
    console.error('[admin/oversikt] sidan kunde inte renderas:', fel);
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title="Översikt" />
        <FlowError
          title="Översikten kunde inte läsas"
          message="Dagsmetriken svarade inte. Cronen fyller på vid midnatt, och Intäkter har en knapp för att hämta dagens rad nu."
        />
      </div>
    );
  }

  const { intakter, trafik, anvandning, mejl, drift, serie, provperioder } = data;
  const nuMs = Date.now();
  const nu = new Date(nuMs);

  // Supabase-delen av listan renderas direkt. Kopen fylls i nar Stripe
  // svarat, och en rad reserveras for dem sa att listan inte hoppar.
  const utanKop = sorteraHandelser(data.sedanIgar);
  const listHojd = (utanKop.length + 1) * RAD_HOJD;

  const gsc = trafik.gsc;
  const gscDelta = gsc.fore === null ? null : gsc.klick - gsc.fore;
  const mrr = intakter.mrrOre;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Översikt"
        description={`Talen gäller ${datumLang(data.dag)}. ${undantagText(u)}.`}
      />

      {/* ------------------------------------------------ Sedan i gar --- */}
      <SectionCard rubrik="Sedan i går">
        <Suspense
          fallback={
            <HandelseLista
              handelser={utanKop}
              nu={nu}
              minHojd={listHojd}
              efter={
                <p className="flex min-h-11 items-center text-meta text-ink-3">
                  Hämtar köpen från Stripe
                </p>
              }
            />
          }
        >
          <SedanIgarMedKop handelser={data.sedanIgar} nuMs={nuMs} minHojd={listHojd} />
        </Suspense>
      </SectionCard>

      {/* ------------------------------------------------------ Pengar --- */}
      <SectionCard
        rubrik="Pengar"
        action={
          <Link href="/admin/intakter" className={LANK}>
            Till Intäkter
          </Link>
        }
      >
        <Tal4>
          <Suspense
            fallback={
              <>
                <KortPlats etikett="Intäkt, 30 dagar" />
                <KortPlats etikett="Engångsköp, 30 dagar" />
              </>
            }
          >
            <IntaktKort nuMs={nuMs} />
          </Suspense>
          <MetricCard
            etikett="MRR"
            varde={kronor(mrr.varde)}
            jamforelse={mrr.varde === null ? 'Stripe har inte svarat i fönstret' : intakter.mrrPaket}
            andraJamforelse={
              mrr.motForraVeckan
                ? `${mrr.motForraVeckan > 0 ? 'Upp' : 'Ner'} ${kronor(Math.abs(mrr.motForraVeckan))} mot förra veckan`
                : undefined
            }
          />
          <Suspense fallback={<KortPlats etikett="Nya betalande, 30 dagar" />}>
            <NyaBetalandeKort nuMs={nuMs} />
          </Suspense>
        </Tal4>

        <p className="mt-3 text-meta text-ink-3">
          {`${tal(intakter.aktivaPren.varde)} aktiva prenumerationer. Misslyckade betalningar: ${tal(intakter.misslyckade7)} på 7 dagar. Uppsagda: ${tal(intakter.churnade7)} på 7 dagar.`}
        </p>

        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-ink-3">Senaste fem köpen</p>
            <Link href="/admin/intakter#kop" className={LANK}>
              Alla köp
            </Link>
          </div>
          <Suspense
            fallback={<div className="rounded-lg bg-insunken" style={{ height: 5 * RAD_HOJD }} />}
          >
            <SenasteFemKop nuMs={nuMs} />
          </Suspense>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-ink-3">MRR och nya betalande per dag, 30 dagar</p>
          <MrrDiagram serie={serie} />
          <p className="mt-2 text-meta text-ink-3">
            Stripe har ingen historisk MRR, så linjen börjar vid mätstart.
          </p>
        </div>
      </SectionCard>

      {/* -------------------------------------------------------- Folk --- */}
      <SectionCard
        rubrik="Folk"
        action={
          <Link href="/admin/trafik" className={LANK}>
            Till Trafik
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <MetricCard
            etikett="Nya konton, 7 dagar"
            varde={tal(trafik.nyaKonton7)}
            delta={trafik.nyaKonton7 - trafik.nyaKontonForra7}
            deltaText={deltaText(trafik.nyaKonton7 - trafik.nyaKontonForra7, tal)}
            jamforelse="mot veckan innan"
            andraJamforelse={`${tal(trafik.nyaKonton30)} på 30 dagar`}
          />
          <MetricCard
            etikett="Klick från sök, 7 dagar"
            varde={tal(gsc.klick)}
            delta={gscDelta}
            deltaText={deltaText(gscDelta, tal)}
            jamforelse={
              gsc.fran && gsc.till
                ? `${datumKort(gsc.fran)} till ${datumKort(gsc.till)}${
                    gsc.fore !== null ? `, veckan före ${tal(gsc.fore)}` : ''
                  }`
                : undefined
            }
            andraJamforelse={gscEfter(gsc.senasteDag, gsc.senasteKlick, data.dag)}
          />
          {provperioder.kvar > 0 ? (
            <MetricCard
              etikett="Provperioder kvar"
              varde={tal(provperioder.kvar)}
              jamforelse={
                provperioder.sista ? `sista går ut ${datumKort(provperioder.sista)}` : undefined
              }
            />
          ) : null}
        </div>
      </SectionCard>

      {/* -------------------------------------------------- Anvandning --- */}
      <SectionCard
        rubrik="Vad gör de när de är här?"
        action={
          <Link href="/admin/tratt" className={LANK}>
            Till Tratt
          </Link>
        }
      >
        <Tal4>
          <MetricCard
            etikett="CV uppladdade, 7 dagar"
            varde={tal(anvandning.cvUppladdade7.varde)}
            {...veckoJamforelse(anvandning.cvUppladdade7)}
          />
          <MetricCard
            etikett="Brev skapade, 7 dagar"
            varde={tal(anvandning.brevSkapade7.varde)}
            {...veckoJamforelse(anvandning.brevSkapade7)}
          />
          <MetricCard
            etikett="Tester slutförda, 7 dagar"
            varde={tal(anvandning.testerSlutforda7.varde)}
            {...veckoJamforelse(anvandning.testerSlutforda7)}
          />
          <MetricCard
            etikett="Mallar nedladdade, 7 dagar"
            varde={tal(anvandning.mallarNedladdade7.varde)}
            {...veckoJamforelse(anvandning.mallarNedladdade7)}
          />
        </Tal4>
        <p className="mt-3 text-meta text-ink-3">
          {`Aktiva i dag: ${tal(anvandning.aktiva.varde)}. Aktiva senaste 7 dagarna: ${tal(anvandning.aktiva7)} av ${tal(anvandning.profiler)} konton.`}
        </p>
      </SectionCard>

      {/* -------------------------------------------------------- Mejl --- */}
      <SectionCard
        rubrik="Fungerar mejlen?"
        action={
          <Link href="/admin/mejl" className={LANK}>
            Till Mejl
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <MetricCard
            etikett="Skickade, 7 dagar"
            varde={tal(mejl.skickade7)}
            delta={mejl.skickade7 - mejl.skickadeForra7}
            deltaText={deltaText(mejl.skickade7 - mejl.skickadeForra7, tal)}
            jamforelse="mot veckan innan"
          />
          <MetricCard etikett="Öppnade, 7 dagar" varde={tal(mejl.oppnade7)} />
          <MetricCard
            etikett="Öppnandegrad, 7 dagar"
            varde={mejl.oppnandegrad === null ? '0 %' : `${decimal(mejl.oppnandegrad)} %`}
            jamforelse={mejl.oppnandegrad === null ? '0 utskick på 7 dagar' : 'andel av utskicken'}
          />
        </div>
      </SectionCard>

      {/* ------------------------------------------------------- Drift --- */}
      <SectionCard
        rubrik="Fungerar systemet?"
        action={
          <Link href="/admin/drift" className={LANK}>
            Till Drift
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <MetricCard
            etikett="Fel senaste dygnet"
            varde={tal(drift.fel24)}
            inverterad
            jamforelse={`${tal(drift.fel7)} på 7 dagar`}
          />
          <MetricCard
            etikett="AI-kostnad, 7 dagar"
            varde={drift.aiKostnad7 === null ? '0 kr' : `${decimal(drift.aiKostnad7, 2)} kr`}
            jamforelse={drift.aiKostnad7 === null ? 'ingen körning loggad på 7 dagar' : undefined}
          />
          <MetricCard
            etikett="Senaste insamling"
            varde={drift.timmarSedanInsamling === null ? 'aldrig' : `${tal(drift.timmarSedanInsamling)} h`}
            jamforelse={drift.timmarSedanInsamling === null ? 'tabellen är tom' : 'sedan cronen skrev'}
          />
        </div>
        {drift.senasteFel ? (
          <p className="mt-3 text-meta text-ink-3">
            Senaste felet {tidKort(drift.senasteFel.nar)}, {drift.senasteFel.kalla}:{' '}
            {drift.senasteFel.meddelande}
          </p>
        ) : (
          <p className="mt-3 text-meta text-ink-3">0 rader i felloggen sedan den skapades.</p>
        )}
      </SectionCard>
    </div>
  );
}
