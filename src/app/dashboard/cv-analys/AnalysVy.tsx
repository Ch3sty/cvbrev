'use client';

/**
 * Analys (CV-rummet steg 4, byggspecen avsnitt 8, skissen Analys).
 *
 *   Väggen   CvVagg: flikarna, CV-raden, rubriken som räknar fynden, de två
 *            talen (i dag och med våra förslag) och "Åtgärda i CV:t"
 *   Golvet   Vad som drar ner: första öppna fyndet utfällt som papper med
 *            mörkt huvud, övriga som rader (låsta för gratisnivån, med
 *            betalväggen). Till höger arket med numrerade markeringar och
 *            "Så räknas poängen".
 *
 * Lägen: resultat, utan-struktur, intro (dagens texter och kvotrad) och
 * sparr (dagens spärr för omkörning). "Analysera mitt CV" startar dagens
 * flöde (children: CvAnalysClient) med CV:t redan valt.
 *
 * Alla tal kommer ur poängmodellen via servern (analysData.ts). Ingen
 * åtgärdstext för låsta fynd finns i datan.
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
import { ArrowRight, Check, Lock, Target, FileSearch, Zap } from '@/components/illustrations/RumIkoner';
import { PLATSHALLARE_TAL } from '@/lib/cv/poang';
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

const FARGER = ['#1E5F5F', '#4C9A96', '#9CCFCB', '#2F7D5B', '#7FB8A4', '#3E7775', '#A9D5BE'];

function datumKort(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' }).format(d).replace('.', '');
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
  const fynd = vy?.fynd ?? [];
  const forsta = fynd.find((f) => f.oppen) ?? null;
  const lastaFinns = fynd.some((f) => !f.oppen);
  const p = vy?.poang ?? null;
  const cvQ = data.cvId ? `&cv=${encodeURIComponent(data.cvId)}` : '';
  const jobbHref = (steg: 4 | 5, valj: string) =>
    vy ? `/dashboard/cv-analys?job=${encodeURIComponent(vy.jobbId)}${cvQ}&steg=${steg}&valj=${encodeURIComponent(valj)}` : '#';
  const mallarHref = flikHref('mallar', data.cvId, { mall: mall.id });
  const paywall = getPaywallCopy('analys');

  const markeringar: ArkMarkering[] = useMemo(
    () =>
      fynd.map((f, i) => ({
        nr: i + 1,
        sektion: f.sektion,
        roll: f.roll,
        nu: forsta ? f.nyckel === forsta.nyckel : i === 0,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vy]
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

  const talRad = p ? (
    <div className="cv4-tal-rad" role="img" aria-label={ANALYS.talAria(p.idag, p.medAlla)}>
      <div className="cv4-tal" data-nu>
        <b>{p.idag}</b>
        <span>{ANALYS.idag}</span>
      </div>
      <svg className="cv4-tal-pil" width="34" height="24" viewBox="0 0 34 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12h28M22 4l8 8-8 8" />
      </svg>
      <div className="cv4-tal" data-sen>
        <b>{p.medAlla}</b>
        <span>{ANALYS.medForslag}</span>
      </div>
    </div>
  ) : null;

  const introSidorad = data.isPremium ? ANALYS.introSidoradPremium : ANALYS.introSidorad;

  const vagg: { ogon: string; rubrik: string; ingress: string; ingressKort: string; knapp: (bred: boolean) => ReactNode; sidorad: ReactNode; tal: ReactNode } = (() => {
    switch (data.lage) {
      case 'resultat': {
        const n = fynd.length;
        return {
          ogon: ANALYS.ogon(datumKort(vy?.klar ?? null)),
          rubrik: ANALYS.rubrik(n),
          ingress: ANALYS.ingress(n),
          ingressKort: ANALYS.ingressKort(n),
          knapp: (bred) =>
            n > 0 ? (
              <Link href={jobbHref(4, 'forvalda')} className={`t3-stor${bred ? ' t3-stor-bred' : ''}`}>
                {ANALYS.atgarda}
                <Pil />
              </Link>
            ) : (
              <Link href={mallarHref} className={`t3-stor${bred ? ' t3-stor-bred' : ''}`}>
                {ANALYS.laddaNer}
                <Pil />
              </Link>
            ),
          sidorad: n > 0 ? ANALYS.atgardaSidorad : ANALYS.laddaNerSidorad,
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
          ingress: ANALYS.introIngress,
          ingressKort: ANALYS.introIngress,
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
      {vagg.tal ? null : <p className="cv4-mobil-text">{vagg.ingressKort}</p>}
      {vagg.tal}
      <div className="cv4-mobil-knapp">
        {vagg.knapp(true)}
        {vagg.sidorad ? <span className="cv3-mobil-sidorad">{vagg.sidorad}</span> : null}
      </div>
    </div>
  );

  /* ------------------------------------------------------------- golvet */

  const fyndRad = (f: AnalysFynd, nr: number) => {
    const innehall = (
      <>
        <span className="cv4-nr">{nr}</span>
        <span className="cv4-last-text">
          <b>{f.titel}</b>
          <small>{f.meta}</small>
        </span>
        <span className="cv4-pluspill" aria-label={ANALYS.plusAria(f.plus)}>
          {ANALYS.plus(f.plus)}
        </span>
        {f.oppen ? null : (
          <span className="cv4-las" aria-hidden="true">
            <Lock size={16} strokeWidth={2.6} />
          </span>
        )}
      </>
    );
    return (
      <li key={f.nyckel}>
        {f.oppen ? (
          <Link href={jobbHref(4, f.nyckel)} className="cv4-last">
            {innehall}
          </Link>
        ) : (
          <button type="button" className="cv4-last" onClick={() => setSparr('analys')} aria-haspopup="dialog" aria-label={ANALYS.lastAria(f.titel)}>
            {innehall}
          </button>
        )}
      </li>
    );
  };

  const papper = (f: AnalysFynd, nr: number) => (
    <div className="cv4-papper" data-papper>
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

  const resultatPanel =
    data.lage === 'resultat' && vy ? (
      <section className="cv4-panel" aria-labelledby="analys-panel">
        <p className="cv4-ogon" data-ton="koppar">
          {ANALYS.drarNerOgon}
        </p>
        {forsta ? (
          <>
            <h2 id="analys-panel" className="cv4-h2">
              {ANALYS.borjaMed(forsta.typ, forsta.roll?.foretag)}
            </h2>
            <p className="cv4-rad">{ANALYS.borjaMedRad(forsta.typ)}</p>
            {papper(forsta, fynd.indexOf(forsta) + 1)}
          </>
        ) : (
          <>
            <h2 id="analys-panel" className="cv4-h2">
              {fynd.length ? ANALYS.rubrik(fynd.length) : ANALYS.inget}
            </h2>
            <p className="cv4-rad">{fynd.length ? paywall.body : ANALYS.ingetRad}</p>
          </>
        )}
        {fynd.some((f) => f !== forsta) ? <ol className="cv4-rader">{fynd.map((f, i) => (f === forsta ? null : fyndRad(f, i + 1)))}</ol> : null}
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

  const ikoner = [Target, FileSearch, Zap];
  const introPanel =
    data.lage === 'intro' || data.lage === 'sparr' || data.lage === 'utan-struktur' ? (
      <section className="cv4-panel" aria-labelledby="analys-panel">
        <p className="cv4-ogon" data-ton="koppar">
          {ANALYS.introOgon}
        </p>
        <h2 id="analys-panel" className="cv4-h2">
          {ANALYS.introPanelRubrik}
        </h2>
        <p className="cv4-rad">{ANALYS.introPanelRad}</p>
        <ul className="cv4-lista">
          {ANALYS.introInnehall.map((t) => (
            <li key={t}>
              <span className="cv4-bock" aria-hidden="true">
                <Check size={14} strokeWidth={3.2} />
              </span>
              {t}
            </li>
          ))}
        </ul>
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
        <div className="cv4-fordelar">
          {ANALYS.fordelar.map((f, i) => {
            const Ikon = ikoner[i];
            return (
              <div key={f.titel} className="cv4-fordel">
                <span className="cv4-bock" aria-hidden="true">
                  <Ikon size={16} strokeWidth={2.2} />
                </span>
                <b>{f.titel}</b>
                <p>{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    ) : null;

  const delar = p ? p.kategorier.filter((k) => k.plus > 0) : [];
  const sasRaknas = (rid: string) => p ? (
    <section className="cv4-kortet" aria-labelledby={rid}>
      <p id={rid} className="cv4-ogon">
        {ANALYS.sasOgon}
      </p>
      <div className="cv4-mojliga">
        {p.plus > 0 ? (
          <>
            <b>+{p.plus}</b>
            <span>{ANALYS.mojliga}</span>
          </>
        ) : (
          <span>{ANALYS.ingenOkning}</span>
        )}
      </div>
      <div
        className="cv4-stapel"
        role="img"
        aria-label={ANALYS.stapelAria(p.idag, delar.map((k) => `${k.namn} ger ${k.plus} till.`).join(' '))}
      >
        <span style={{ width: `${p.idag}%`, background: 'var(--koppar)' }} />
        {delar.map((k, i) => (
          <span key={k.id} style={{ width: `${k.plus}%`, background: FARGER[i % FARGER.length] }} />
        ))}
      </div>
      <div className="cv4-delar">
        <div className="cv4-del">
          <span>
            <i style={{ background: 'var(--koppar)' }} />
            {ANALYS.idagRad}
          </span>
          <b>{p.idag}</b>
        </div>
        {delar.map((k, i) => (
          <div key={k.id} className="cv4-del">
            <span>
              <i style={{ background: FARGER[i % FARGER.length] }} />
              {k.namn}
            </span>
            <b>+{k.plus}</b>
          </div>
        ))}
      </div>
      <p className="cv4-forklaring">{ANALYS.forklaring}</p>
      <details className="cv4-alla">
        <summary>{ANALYS.allaDelar}</summary>
        <ul>
          {p.kategorier.map((k) => (
            <li key={k.id}>
              <span>{k.namn}</span>
              <span>
                {ANALYS.delAv(k.idag, k.max)}
                {k.plus > 0 ? ` (+${k.plus})` : ''}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  ) : null;

  const arkAlt = ANALYS.arkAlt(
    data.lage === 'resultat' ? fynd.length : 0,
    fynd.map((f) => (f.typ === 'roll' ? f.titel : f.typ === 'profil' ? 'sammanfattningen' : 'kompetenserna')).join(', ')
  );

  const hoger = (
    <div className="cv4-hoger">
      <div className="cv4-arkplats">
        <AnalysArk mall={mall} cv={data.egetCv} markeringar={data.lage === 'resultat' ? markeringar : []} alt={arkAlt} />
      </div>
      <p className="cv4-mallrad">
        <b>{ANALYS.mallen(mall.namn)}</b> <Link href={mallarHref}>{ANALYS.seMallar}</Link>
      </p>
      <div className="cv4-bara-dator">{sasRaknas('sa-raknas')}</div>
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
          {/* Telefon och mellanbredd: poängkortet efter fynden. */}
          <div className="cv4-bara-mobil">{sasRaknas('sa-raknas-mobil')}</div>
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
