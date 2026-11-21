'use client';

/**
 * Analys (CV-rummet steg 4). Sedan 2026-11-21 en genomgång av hela CV:t,
 * del för del (poängmodellen version 2, src/lib/cv/poang/genomgang.ts).
 *
 *   Väggen   CvVagg: flikarna, CV-raden, poängen som är kvar till 100, de
 *            två talen (i dag och med våra förslag) och en knapp: Åtgärda i
 *            CV:t (förslag finns), Öppna CV:t (bara eget arbete kvar) eller
 *            Välj mall och ladda ner (100).
 *   Golvet   Genomgången: de sju delarna som rader som fälls ut, med
 *            kontrollerna, Jobbcoachens förslag för delen (låsta för
 *            gratisnivån, med betalväggen) och Öppna i CV:t. Till höger arket
 *            med markeringarna 1 till 6 och "Vägen till 100".
 *
 * Lägen: resultat, utan-struktur, intro och sparr (dagens spärr för
 * omkörning). "Analysera det här CV:t" och "Be om nya förslag" startar dagens
 * flöde (children: CvAnalysClient) med CV:t redan valt.
 *
 * Alla tal kommer ur poängmodellen via servern (analysData.ts). Kontrollerna
 * och delarnas poäng är öppna för alla; ingen förslagstext för låsta förslag
 * finns i datan.
 */
import { useMemo, useState, useTransition, type ReactNode } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import './analys.css';

import type { Scope } from '@/lib/access/features';
import type { EgetCv } from '@/components/cv/Dokument/egnaMallar';
import { MALL_KATALOG } from '@/lib/cv/mallval/katalog';
import CvVagg from '@/components/cv/rum3/CvVagg';
import { arbetslageHref, flikHref } from '@/components/cv/rum3/flikar';
import { getPaywallCopy, kvotCopy, PAKETRADER } from '@/components/paywall/paywall-copy';
import { PremiumKnappText, PremiumPrisradText, useKampanjPris } from '@/components/kampanj/KampanjPrisKontext';
import { capture } from '@/lib/analytics/events';
import { kopstegHref } from '@/lib/onboarding/steps';
import { SALD_PLAN } from '@/lib/plans/plans';
import { AlertCircle, ArrowRight, Check, ChevronDown, Lock, XCircle } from '@/components/illustrations/RumIkoner';
import { PLATSHALLARE_TAL, type GenomgangDel, type KategoriId } from '@/lib/cv/poang';
import type { AnalysFynd, AnalysVyData } from './analysData';
import AnalysArk, { type ArkMarkering } from './components/AnalysArk';
import { ANALYS } from './analysTexter';

const GraValSheet = dynamic(() => import('@/components/paywall/GraValSheet'), { ssr: false });

export interface AnalysSidaData {
  lage: 'resultat' | 'utan-struktur' | 'intro' | 'sparr';
  vy: AnalysVyData | null;
  cvId: string | null;
  cvNamn: string | null;
  egetCv: EgetCv | null;
  mallId: string | null;
  remainingAnalyses: number | null;
  isPremium: boolean;
  scope: Scope | null;
  track: Scope | null;
}

/** Delarna som har en plats på arket (Datum, ordning och längd har ingen). */
const ARKETS_AVSNITT: Partial<Record<KategoriId, ArkMarkering['sektion']>> = {
  kontakt: 'kontakt',
  profil: 'profil',
  erfarenhet: 'erfarenhet',
  kompetenser: 'kompetenser',
  utbildning: 'utbildning',
  sprak: 'sprak',
};

function datumKort(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' }).format(d).replace('.', '');
}

function datumLang(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(d);
}

/** Texten med [antal] markerad, så att hon ser var hennes siffra ska in. */
function MedPlatshallare({ text }: { text: string }) {
  const delar = text.split(PLATSHALLARE_TAL);
  return (
    <>
      {delar.map((d, i) => (
        <span key={i}>
          {d}
          {i < delar.length - 1 ? <mark className="cv4-platshallare">{PLATSHALLARE_TAL}</mark> : null}
        </span>
      ))}
    </>
  );
}

function Pil({ size = 20 }: { size?: number }) {
  return <ArrowRight size={size} strokeWidth={2.4} />;
}

/** Delen som är utfälld från start: tyngsta öppna förslagets, annars den med flest poäng kvar. */
function forvaldDel(delar: readonly GenomgangDel[], fynd: readonly AnalysFynd[]): KategoriId | null {
  const forslag = fynd.find((f) => f.oppen && f.typ !== 'siffror');
  if (forslag) return forslag.del;
  const kvar = delar.filter((d) => d.poang < d.max);
  if (kvar.length === 0) return null;
  return [...kvar].sort((a, b) => b.max - b.poang - (a.max - a.poang) || a.nr - b.nr)[0].id;
}

export default function AnalysVy({ data, cvRad, children }: { data: AnalysSidaData; cvRad: ReactNode; children: ReactNode }) {
  const router = useRouter();
  const kampanj = useKampanjPris();
  const [, startTransition] = useTransition();
  const [startad, setStartad] = useState(false);
  const [sparr, setSparr] = useState<'analys' | 'analys-omkorning' | null>(null);
  const [strukturerar, setStrukturerar] = useState(false);
  const [struktureraFel, setStruktureraFel] = useState(false);

  const vy = data.vy;
  const mall = MALL_KATALOG.find((m) => m.id === data.mallId) ?? MALL_KATALOG[0];
  const fynd = useMemo(() => vy?.fynd ?? [], [vy]);
  const delar = useMemo(() => vy?.delar ?? [], [vy]);
  const startDel = useMemo(() => forvaldDel(delar, fynd), [delar, fynd]);
  const [oppna, setOppna] = useState<ReadonlySet<KategoriId>>(() => new Set(startDel ? [startDel] : []));
  const p = vy?.poang ?? null;
  const kvar = p ? Math.max(0, 100 - p.idag) : 0;
  const harForslag = fynd.some((f) => f.typ !== 'siffror');
  const delarKvar = delar.filter((d) => d.poang < d.max);
  const lastaFinns = fynd.some((f) => !f.oppen);
  const cvQ = data.cvId ? `&cv=${encodeURIComponent(data.cvId)}` : '';
  const jobbHref = (steg: 4 | 5, valj: string) =>
    vy ? `/dashboard/cv-analys?job=${encodeURIComponent(vy.jobbId)}${cvQ}&steg=${steg}&valj=${encodeURIComponent(valj)}` : '#';
  const mallarHref = flikHref('mallar', data.cvId, { mall: mall.id });
  const delHref = (d: GenomgangDel) => (data.cvId ? arbetslageHref(data.cvId, 'analys', { avsnitt: d.avsnitt, mall: mall.id }) : mallarHref);
  const siffror = fynd.find((f) => f.typ === 'siffror') ?? null;
  const siffrorHref = siffror && data.cvId ? arbetslageHref(data.cvId, 'analys', { avsnitt: siffror.sektion, mall: mall.id }) : null;
  const paywall = getPaywallCopy('analys');
  const cvNamn = data.cvNamn?.trim() || null;

  const markeringar: ArkMarkering[] = useMemo(
    () =>
      delar.flatMap((d) => {
        const sektion = ARKETS_AVSNITT[d.id];
        if (!sektion) return [];
        const harKvar = d.poang < d.max;
        return [{ nr: d.nr, sektion, nu: harKvar, klar: !harKvar, puls: d.id === startDel }];
      }),
    [delar, startDel]
  );

  /* ---------------------------------------------------------- handlingar */

  const kop = () => {
    capture('paywall_cta_clicked', {
      variant: 'analys',
      surface: '/dashboard/cv-analys',
      cta: 'primary',
      plan: SALD_PLAN,
      plats: 'analys',
      kampanj: kampanj?.nyckel ?? null,
    });
    window.location.href = kopstegHref(SALD_PLAN, 'analys');
  };

  /** Be om nya förslag: dagens flöde med CV:t valt, eller dagens spärr för omkörning. */
  const nyaForslag = () => {
    if (!data.isPremium && data.remainingAnalyses !== null && data.remainingAnalyses <= 0) {
      setSparr('analys-omkorning');
      return;
    }
    setStartad(true);
  };

  const vaxla = (id: KategoriId) =>
    setOppna((nu) => {
      const ny = new Set(nu);
      if (ny.has(id)) ny.delete(id);
      else ny.add(id);
      return ny;
    });

  const strukturera = async () => {
    if (!data.cvId) return;
    setStrukturerar(true);
    setStruktureraFel(false);
    try {
      const res = await fetch('/api/cv/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId: data.cvId }),
      });
      const j = (await res.json().catch(() => ({}))) as { success?: boolean };
      if (!res.ok || !j.success) throw new Error('struktur');
      startTransition(() => router.refresh());
    } catch {
      setStruktureraFel(true);
    } finally {
      setStrukturerar(false);
    }
  };

  // Dagens flöde, med CV:t redan valt.
  if (startad) return <>{children}</>;

  /* ------------------------------------------------------------- väggen */

  // "Med"-talet är förslagen och siffrorna tillsammans (medAllt), samma tal som Ditt CV och Mallar.
  const medSiffrorNu = (p?.siffrorPlus ?? 0) > 0;
  const senare =
    p && p.plusAllt > 0
      ? { tal: p.medAllt, text: medSiffrorNu ? (p.plus > 0 ? ANALYS.medForslagOchSiffror : ANALYS.medSiffror) : ANALYS.medForslag }
      : null;
  const talRad = p ? (
    <div
      className="cv4-tal-rad"
      role="img"
      aria-label={senare ? ANALYS.talAriaMed(p.idag, senare.tal, senare.text) : ANALYS.talAria(p.idag)}
    >
      <div className="cv4-tal" data-nu>
        <b>{p.idag}</b>
        <span>{ANALYS.idag}</span>
      </div>
      {senare ? (
        <>
          <svg className="cv4-tal-pil" width="34" height="24" viewBox="0 0 34 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12h28M22 4l8 8-8 8" />
          </svg>
          <div className="cv4-tal" data-sen>
            <b>{senare.tal}</b>
            <span>{senare.text}</span>
          </div>
        </>
      ) : null}
    </div>
  ) : null;

  const introSidorad = data.isPremium ? ANALYS.introSidoradPremium : ANALYS.introSidorad;
  const forstaKvar = delarKvar[0] ?? null;

  const vagg: { ogon: string; rubrik: string; ingress: string; ingressKort: string; knapp: (bred: boolean) => ReactNode; sidorad: ReactNode; tal: ReactNode } = (() => {
    switch (data.lage) {
      case 'resultat': {
        const klass = (bred: boolean) => `t3-stor${bred ? ' t3-stor-bred' : ''}`;
        if (kvar <= 0) {
          return {
            ogon: ANALYS.ogon(datumKort(vy?.klar ?? null)),
            rubrik: ANALYS.rubrik(0),
            ingress: ANALYS.ingressKlar,
            ingressKort: ANALYS.ingressKlar,
            knapp: (bred) => (
              <Link href={mallarHref} className={klass(bred)}>
                {ANALYS.laddaNer}
                <Pil />
              </Link>
            ),
            sidorad: ANALYS.laddaNerSidorad,
            tal: talRad,
          };
        }
        if (harForslag) {
          const med = p?.medAllt ?? 0;
          return {
            ogon: ANALYS.ogon(datumKort(vy?.klar ?? null)),
            rubrik: ANALYS.rubrik(kvar),
            ingress: ANALYS.ingressMedForslag(med),
            ingressKort: ANALYS.ingressMedForslagKort(med),
            knapp: (bred) => (
              <Link href={jobbHref(4, 'forvalda')} className={klass(bred)}>
                {ANALYS.atgarda}
                <Pil />
              </Link>
            ),
            sidorad: ANALYS.atgardaSidorad,
            tal: talRad,
          };
        }
        return {
          ogon: ANALYS.ogon(datumKort(vy?.klar ?? null)),
          rubrik: ANALYS.rubrik(kvar),
          ingress: ANALYS.ingressEget(Math.max(1, delarKvar.length)),
          ingressKort: ANALYS.ingressEgetKort(Math.max(1, delarKvar.length)),
          knapp: (bred) => (
            <Link href={forstaKvar ? delHref(forstaKvar) : mallarHref} className={klass(bred)} data-oppna-cv>
              {ANALYS.oppnaCv}
              <Pil />
            </Link>
          ),
          sidorad: ANALYS.oppnaCvSidorad,
          tal: talRad,
        };
      }
      case 'utan-struktur':
        return {
          ogon: ANALYS.ogon(null),
          rubrik: ANALYS.strukturRubrik,
          ingress: ANALYS.strukturIngress,
          ingressKort: ANALYS.strukturIngress,
          knapp: (bred) => (
            <button type="button" className={`t3-stor${bred ? ' t3-stor-bred' : ''}`} onClick={() => void strukturera()} disabled={strukturerar}>
              {strukturerar ? ANALYS.strukturar : ANALYS.strukturKnapp}
              <Pil />
            </button>
          ),
          sidorad: struktureraFel ? <span role="alert">{ANALYS.strukturFel}</span> : null,
          tal: null,
        };
      case 'sparr': {
        const k = getPaywallCopy('analys-omkorning');
        return {
          ogon: ANALYS.introOgon,
          rubrik: kvotCopy('cv_analysis').title,
          ingress: k.body,
          ingressKort: k.body,
          knapp: (bred) => (
            <button type="button" className={`t3-stor${bred ? ' t3-stor-bred' : ''}`} onClick={kop}>
              <PremiumKnappText />
            </button>
          ),
          sidorad: <PremiumPrisradText />,
          tal: null,
        };
      }
      default:
        return {
          ogon: ANALYS.introOgon,
          rubrik: ANALYS.introRubrik,
          ingress: ANALYS.introIngress(cvNamn),
          ingressKort: ANALYS.introIngress(cvNamn),
          knapp: (bred) => (
            <button type="button" className={`t3-stor${bred ? ' t3-stor-bred' : ''}`} onClick={() => setStartad(true)}>
              {ANALYS.introKnapp}
              <Pil />
            </button>
          ),
          sidorad: introSidorad,
          tal: null,
        };
    }
  })();

  const vanster = (
    <>
      <p className="t3-ogon">{vagg.ogon}</p>
      <h1 className="t3-h1" style={{ fontSize: vagg.rubrik.length > 30 ? 38 : 46, lineHeight: vagg.rubrik.length > 30 ? '42px' : '50px', marginTop: 10 }}>
        {vagg.rubrik}
      </h1>
      <p className="cv4-ingress">{vagg.ingress}</p>
      {vagg.tal}
      <div className="t3-knapprad">
        {vagg.knapp(false)}
        {vagg.sidorad ? <span className="t3-sidorad" style={{ maxWidth: 220 }}>{vagg.sidorad}</span> : null}
      </div>
    </>
  );

  const mobil = (
    <div className="cv4-mobil">
      <p className="t3-ogon">{vagg.ogon}</p>
      <h1 className="cv3-h1-mobil">{vagg.rubrik}</h1>
      <p className="cv4-mobil-text">{vagg.ingressKort}</p>
      {vagg.tal}
      <div className="cv4-mobil-knapp">
        {vagg.knapp(true)}
        {vagg.sidorad ? <span className="cv3-mobil-sidorad">{vagg.sidorad}</span> : null}
      </div>
    </div>
  );

  /* ------------------------------------------------------------- golvet */

  /** Ett låst förslag: rubrik, plus och lås. Öppnar dagens betalvägg. */
  const lastRad = (f: AnalysFynd) => (
    <button key={f.nyckel} type="button" className="cv4-last" onClick={() => setSparr('analys')} aria-haspopup="dialog" aria-label={ANALYS.lastAria(f.titel)}>
      <span className="cv4-last-text">
        <b>{f.titel}</b>
        <small>{f.meta}</small>
      </span>
      {f.plus > 0 ? (
        <span className="cv4-pluspill" aria-hidden="true">
          {ANALYS.plus(f.plus)}
        </span>
      ) : null}
      <span className="cv4-las" aria-hidden="true">
        <Lock size={16} strokeWidth={2.6} />
      </span>
    </button>
  );

  const papper = (f: AnalysFynd, nr: number) => (
    <div key={f.nyckel} className="cv4-papper" data-papper>
      <div className="cv4-papper-hu">
        <span className="cv4-nr" data-nu>
          {nr}
        </span>
        <b>{f.typ === 'roll' ? f.titel : f.typ === 'profil' ? 'Sammanfattningen' : 'Kompetenserna'}</b>
        <span className="cv4-pluspill" aria-label={ANALYS.plusAria(f.plus)}>
          {ANALYS.plus(f.plus)}
        </span>
      </div>
      <div className="cv4-spalter">
        <div className="cv4-spalt" data-gammal>
          <p className="cv4-ogon">{ANALYS.nuvarande}</p>
          <p>{f.nuvarande || ANALYS.ingenText}</p>
        </div>
        <div className="cv4-spalt" data-ny>
          <p className="cv4-ogon">{f.typ === 'kompetenser' ? ANALYS.forslagKompetenser : ANALYS.forslag}</p>
          <p>
            <MedPlatshallare text={f.forslag ?? ''} />
          </p>
        </div>
      </div>
      {f.fyllI ? <p className="cv4-fyll">{ANALYS.fyllI}</p> : null}
      <div className="cv4-fot">
        <p className="cv4-fot-text">
          <b>{ANALYS.andrat}</b> {ANALYS.andratLista(f.andrat ?? [])}
        </p>
        <Link
          href={data.cvId ? arbetslageHref(data.cvId, 'analys', { avsnitt: f.sektion, mall: mall.id }) : jobbHref(4, f.nyckel)}
          className="cv4-kn"
          data-ton="ljus"
          data-andra-texten
        >
          {ANALYS.andraTexten}
        </Link>
        <Link href={jobbHref(5, f.nyckel)} className="cv4-kn" data-ton="mork">
          {ANALYS.anvandForslaget}
        </Link>
      </div>
    </div>
  );

  /** Siffrorna: hennes egen uppgift, ingen förslagstext. */
  const siffrorKort = (f: AnalysFynd, nr: number) => (
    <div key={f.nyckel} className="cv4-papper" data-papper data-siffror>
      <div className="cv4-papper-hu">
        <span className="cv4-nr" data-nu>
          {nr}
        </span>
        <b>{ANALYS.siffrorRubrik}</b>
        {f.plus > 0 ? (
          <span className="cv4-pluspill" aria-label={ANALYS.plusAria(f.plus)}>
            {ANALYS.plus(f.plus)}
          </span>
        ) : null}
      </div>
      <div className="cv4-spalter">
        <div className="cv4-spalt" data-ny style={{ gridColumn: '1 / -1' }}>
          <p>
            <MedPlatshallare text={ANALYS.siffrorText} />
          </p>
        </div>
      </div>
      <div className="cv4-fot">
        <p className="cv4-fot-text">{ANALYS.siffrorSidorad(f.rader ?? 1)}</p>
        {siffrorHref ? (
          <Link href={siffrorHref} className="cv4-kn" data-ton="mork" data-fyll-siffror>
            {ANALYS.siffrorKnapp}
          </Link>
        ) : null}
      </div>
    </div>
  );

  const premRuta =
    vy && !vy.harFull && lastaFinns ? (
      <div className="cv4-prem" data-kopruta>
        <p className="cv4-ogon">{ANALYS.premOgon}</p>
        <h3>{paywall.title}</h3>
        <p>{paywall.body}</p>
        <div className="cv4-prem-fot">
          <p>
            <b>
              <PremiumPrisradText />
            </b>
            <br />
            <Link href="/priser">{ANALYS.seVadSomIngar}</Link>
          </p>
          <button type="button" className="cv4-kop" onClick={kop}>
            <PremiumKnappText />
          </button>
        </div>
      </div>
    ) : null;

  const delRad = (d: GenomgangDel) => {
    const oppen = oppna.has(d.id);
    const harKvar = d.poang < d.max;
    const ouppfyllda = d.kontroller.filter((k) => k.status !== 'klar');
    const uppfyllda = d.kontroller.filter((k) => k.status === 'klar');
    // Statusraden: första bristen och hur många till. Kontroller utan egen
    // text (en annan kontroll säger redan samma sak) räknas inte.
    const texter = ouppfyllda.flatMap((k) => k.brister.map((b) => b.text));
    const rader = texter.length > 0 ? texter : ouppfyllda.map((k) => k.rubrik);
    const forstaText = rader[0] ?? '';
    const fler = Math.max(0, rader.length - 1);
    const delensForslag = fynd.filter((f) => f.del === d.id && f.typ !== 'siffror');
    const delensSiffror = fynd.filter((f) => f.del === d.id && f.typ === 'siffror');
    const inneId = `analys-del-${d.id}`;
    return (
      <li key={d.id} className="cv4-gdel" data-oppen={oppen ? '' : undefined} data-klar={harKvar ? undefined : ''} data-del={d.id}>
        <h3 className="cv4-gdel-h">
          <button type="button" className="cv4-gdel-knapp" aria-expanded={oppen} aria-controls={inneId} onClick={() => vaxla(d.id)}>
            <span className="cv4-nr" data-nu={harKvar ? '' : undefined}>
              {d.nr}
            </span>
            <span className="cv4-gdel-text">
              <b>{d.namn}</b>
              <small>
                {harKvar ? (
                  <>
                    {forstaText}
                    {fler > 0 ? ANALYS.ochFler(fler) : null}
                  </>
                ) : (
                  <span className="cv4-gdel-ok">
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                    {ANALYS.allt}
                  </span>
                )}
              </small>
            </span>
            <span className="cv4-gdel-matt" role="img" aria-label={ANALYS.delAria(d.namn, d.poang, d.max)}>
              <span className="cv4-matare" aria-hidden="true">
                <i style={{ width: `${Math.round((d.poang / d.max) * 100)}%` }} />
              </span>
              <span className="cv4-gdel-tal" aria-hidden="true">
                {ANALYS.delAv(d.poang, d.max)}
              </span>
            </span>
            <span className="cv4-gdel-pil" aria-hidden="true">
              <ChevronDown size={20} strokeWidth={2.4} />
            </span>
          </button>
        </h3>
        <div id={inneId} className="cv4-gdel-inne" hidden={!oppen}>
          <ul className="cv4-kontroller">
            {ouppfyllda.map((k) => (
              <li key={k.id} data-status={k.status}>
                <span className="cv4-kstatus" aria-label={k.status === 'saknas' ? ANALYS.saknas : ANALYS.delvis} role="img">
                  {k.status === 'saknas' ? <XCircle size={18} strokeWidth={2.4} /> : <AlertCircle size={18} strokeWidth={2.4} />}
                </span>
                <span className="cv4-ktext">
                  <b>{k.rubrik}</b>
                  {k.brister.map((b, i) => (
                    <span key={i}>{b.text}</span>
                  ))}
                </span>
              </li>
            ))}
            {uppfyllda.map((k) => (
              <li key={k.id} data-status="klar">
                <span className="cv4-kstatus" aria-label={ANALYS.klar} role="img">
                  <Check size={16} strokeWidth={3} />
                </span>
                <span className="cv4-ktext">
                  <b>{k.rubrik}</b>
                </span>
              </li>
            ))}
          </ul>
          {d.not ? <p className="cv4-gdel-not">{d.not}</p> : null}
          {delensForslag.length > 0 ? (
            <div className="cv4-gdel-forslag">
              <p className="cv4-ogon" data-ton="koppar">
                {ANALYS.jobbcoachensForslag}
              </p>
              {delensForslag.map((f) => (f.oppen ? papper(f, d.nr) : lastRad(f)))}
            </div>
          ) : null}
          {delensSiffror.map((f) => siffrorKort(f, d.nr))}
          {data.cvId && harKvar ? (
            <div className="cv4-gdel-fot">
              <Link href={delHref(d)} className="cv4-kn" data-ton="ljus" data-oppna-i-cv>
                {ANALYS.oppnaICv}
              </Link>
            </div>
          ) : null}
        </div>
      </li>
    );
  };

  const datum = datumLang(vy?.klar ?? null);
  const resultatPanel =
    data.lage === 'resultat' && vy ? (
      <section className="cv4-panel" aria-labelledby="analys-panel">
        <p className="cv4-ogon" data-ton="koppar">
          {ANALYS.genomgangOgon}
        </p>
        <h2 id="analys-panel" className="cv4-h2">
          {ANALYS.genomgangRubrik(delarKvar.length)}
        </h2>
        <p className="cv4-rad cv4-genomgang-rad">
          {ANALYS.genomgangAv(cvNamn)}
          {datum ? ` ${ANALYS.forslagSkrevs(datum)}` : null}
          {datum ? (
            <button type="button" className="cv4-nya" onClick={nyaForslag}>
              {ANALYS.nyaForslag}
            </button>
          ) : null}
        </p>
        <ol className="cv4-gdelar">{delar.map(delRad)}</ol>
        {premRuta}
      </section>
    ) : null;

  const kvotRad =
    data.remainingAnalyses !== null || data.isPremium ? (
      <p className="cv4-kvot">
        <b>{ANALYS.kvotLabel}. </b>
        {data.isPremium
          ? PAKETRADER.analysUtanTak
          : `${data.remainingAnalyses} ${data.remainingAnalyses === 1 ? 'analys' : 'analyser'} kvar. En analys ingår gratis per konto. Att köra om efter en rättning ingår i ${PAKETRADER.bricka}.`}
      </p>
    ) : null;

  const introPanel =
    data.lage === 'intro' || data.lage === 'sparr' || data.lage === 'utan-struktur' ? (
      <section className="cv4-panel" aria-labelledby="analys-panel">
        <p className="cv4-ogon" data-ton="koppar">
          {ANALYS.introPanelOgon}
        </p>
        <h2 id="analys-panel" className="cv4-h2">
          {ANALYS.introPanelRubrik}
        </h2>
        <ol className="cv4-steg">
          {ANALYS.introSteg.map((s, i) => (
            <li key={s.titel}>
              <span className="cv4-nr">{i + 1}</span>
              <span className="cv4-ktext">
                <b>{s.titel}</b>
                <span>{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        {data.lage === 'sparr' ? (
          <p className="cv4-kvot">
            <b>{getPaywallCopy('analys-omkorning').title}. </b>
            <Link href="/priser" className="underline underline-offset-[3px]">
              {getPaywallCopy('analys-omkorning').secondary}
            </Link>
          </p>
        ) : (
          kvotRad
        )}
        <p className="cv4-rad cv4-byt">{ANALYS.introBytCv}</p>
      </section>
    ) : null;

  // Vägen till 100: i dag, våra förslag (förslag och siffror, samma tal som väggen) och resten.
  const vagen = (rid: string) => {
    if (!p || data.lage !== 'resultat') return null;
    const forslag = Math.max(0, p.plusAllt);
    const sjalv = Math.max(0, 100 - p.idag - forslag);
    return (
      <section className="cv4-kortet" aria-labelledby={rid}>
        <p id={rid} className="cv4-ogon">
          {ANALYS.vagenOgon}
        </p>
        <div className="cv4-stapel" role="img" aria-label={ANALYS.vagenAria(p.idag, forslag, sjalv)}>
          <span style={{ width: `${p.idag}%`, background: 'var(--koppar)' }} />
          {forslag > 0 ? <span style={{ width: `${forslag}%`, background: 'var(--cv3-ikon)' }} /> : null}
          {sjalv > 0 ? <span className="cv4-stapel-sjalv" style={{ width: `${sjalv}%` }} /> : null}
        </div>
        <div className="cv4-delar">
          <div className="cv4-del">
            <span>
              <i style={{ background: 'var(--koppar)' }} />
              {ANALYS.vagenIdag}
            </span>
            <b>{p.idag}</b>
          </div>
          {forslag > 0 ? (
            <div className="cv4-del">
              <span>
                <i style={{ background: 'var(--cv3-ikon)' }} />
                {ANALYS.vagenForslag}
              </span>
              <b>+{forslag}</b>
            </div>
          ) : null}
          <div className="cv4-del">
            <span>
              <i className="cv4-stapel-sjalv" />
              {ANALYS.vagenSjalv}
            </span>
            <b>+{sjalv}</b>
          </div>
        </div>
        <p className="cv4-forklaring">{ANALYS.forklaring}</p>
      </section>
    );
  };

  const arkAlt = ANALYS.arkAlt(
    data.lage === 'resultat'
      ? delar
          .filter((d) => ARKETS_AVSNITT[d.id])
          .map((d) => `${d.nr} ${d.namn.toLowerCase()}`)
          .join(', ')
      : ''
  );

  const hoger = (
    <div className="cv4-hoger">
      <div className="cv4-arkplats">
        <AnalysArk mall={mall} cv={data.egetCv} markeringar={data.lage === 'resultat' ? markeringar : []} alt={arkAlt} />
      </div>
      <p className="cv4-mallrad">
        <b>{ANALYS.mallen(mall.namn)}</b> <Link href={mallarHref}>{ANALYS.seMallar}</Link>
      </p>
      <div className="cv4-bara-dator">{vagen('vagen-till-100')}</div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col" data-analys data-lage={data.lage}>
      <CvVagg
        aktiv="analys"
        cvId={data.cvId}
        etikett="Analys"
        lage={data.lage}
        cvRad={cvRad}
        vanster={vanster}
        hoger={null}
        mobil={mobil}
      />
      <div className="t3-golv">
        <div className="cv4-golv">
          {resultatPanel ?? introPanel}
          {hoger}
          {/* Telefon och mellanbredd: Vägen till 100 efter genomgången. */}
          <div className="cv4-bara-mobil">{vagen('vagen-till-100-mobil')}</div>
        </div>
      </div>
      {sparr ? (
        <GraValSheet
          open
          onClose={() => setSparr(null)}
          feature="cv_analysis_full"
          variant={sparr}
          scope={data.scope}
          track={data.track}
          surface="/dashboard/cv-analys"
          plats="analys"
        />
      ) : null}
    </div>
  );
}
