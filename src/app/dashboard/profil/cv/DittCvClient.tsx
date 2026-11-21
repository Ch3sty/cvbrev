'use client';

/**
 * Ditt CV (CV-rummet omgång 1, byggspecen avsnitt 4, skissen Main,
 * Hem-oanalyserat, Hem-ny och Mobil-hem).
 *
 *   Väggen   CvVagg: flikarna, CV-raden, nästa steg (rubrik, knapp, chips),
 *            talet, dokumentets väg och arket med hennes CV i sin mall
 *   Golvet   Tre mått på ditt CV, Vad som drar ner (när en analys finns),
 *            Samma CV, annan mall och raderna längst ner
 *   Utan CV  Två sätt att börja (uppladdning med dagens samtycke, eller
 *            CV-byggaren med titeln ifylld) och Tre saker du får direkt
 *
 * All data kommer serverrenderad (page.tsx). Efter uppladdning, borttagning
 * och strukturering läses sidan om med router.refresh(). Var dagens
 * funktioner från Mina CV hamnade står i docs/bygg-noter-cv-rummet.md.
 */

import { useMemo, useRef, useState, useTransition, type ReactNode } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import type { ParsedCV } from '@/lib/cv/cv-parser';
import type { MallKort, Sektion } from '@/lib/cv/mallar/kontrakt';
import type { Scope } from '@/lib/access/features';
import { MALL_KATALOG } from '@/lib/cv/mallval/katalog';
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal';
import {
  dokumentVag,
  fyndUrAnalys,
  innehallUrCv,
  sprakSomGenomgangen,
  poangUrAnalys,
  medForslagUrAnalys,
  type AnalysUnderlag,
  type Fynd,
} from '@/lib/rum/cvRum';
import { kvotCopy } from '@/components/paywall/paywall-copy';
import { PremiumKnappText, PremiumPrisradText, useKampanjPris } from '@/components/kampanj/KampanjPrisKontext';
import { capture } from '@/lib/analytics/events';
import { kopstegHref } from '@/lib/onboarding/steps';
import { SALD_PLAN } from '@/lib/plans/plans';
import { useRum } from '@/components/rum/RumKontext';
import { ArrowRight, Check, FileText, Flag, Lock, Mail, PenLine, Plus, Upload } from '@/components/illustrations/RumIkoner';
import EgenMiniatyr from '@/components/cv/Dokument/EgenMiniatyr';
import { merforsaljningsUrval, kortText } from '@/components/cv/Dokument/Merforsaljning';
import type { EgetCv } from '@/components/cv/Dokument/egnaMallar';
import CvVagg from '@/components/cv/rum3/CvVagg';
import CvRad, { oppnaBytCv, oppnaNyttCv } from '@/components/cv/rum3/CvRad';
import type { CvListRad } from '@/components/cv/rum3/BytCvArk';
import { DokumentBanaDator, DokumentBanaMobil, type BanaSteg } from '@/components/cv/rum3/DokumentBana';
import SkrivFranBorjan from '@/components/cv/rum3/SkrivFranBorjan';
import { arbetslageHref, flikHref } from '@/components/cv/rum3/flikar';
import { ANNAN_MALL, DRAR_NER, NASTA, NY, NYTT_ARK, PANEL, RADER, SIFFROR, VAGG } from '@/components/cv/rum3/texter';
import { platshallareIRad } from '@/lib/cv/poang';

// Syns aldrig i första vyn: snabbpoängen bara direkt efter första
// uppladdningen, betalväggen bara när ett låst fynd trycks.
const QuickScoreReveal = dynamic(() => import('@/components/cv/QuickScoreReveal'), { ssr: false });
const GraValSheet = dynamic(() => import('@/components/paywall/GraValSheet'), { ssr: false });

export interface InitialCv {
  id: string;
  user_id: string;
  file_name: string;
  original_file_path: string;
  cv_text: string | null;
  created_at: string;
  updated_at?: string | null;
  structured_data: ParsedCV | Record<string, unknown> | null;
  section_titles?: Partial<Record<Sektion, string>> | null;
}

/** Ditt CV:s underlag, läst på servern (page.tsx). */
export interface DittCvData {
  cvs: InitialCv[];
  /** CV utanför gratisnivåns två aktiva. */
  lastaIds: string[];
  /** CV:t som visas: ?cv= eller senaste aktiva. */
  aktivtId: string | null;
  /** Senaste analysen av det CV:t (eller originalet till det förbättrade). */
  underlag: AnalysUnderlag | null;
  /** När analysens förbättrade CV sparades. */
  atgardadAt: string | null;
  poangPerCv: Record<string, number>;
  nedladdatAt: string | null;
  /** Senast nedladdade mallen, annars mallen sparad på CV:t. */
  mallId: string | null;
  harBetalt: boolean;
  /** Hela analysen (alla åtgärder) ingår. */
  analysFull: boolean;
  /** Gratisanalyser kvar; null när analysen ingår utan tak. */
  analysKvar: number | null;
  maxCvs: number;
  scope: Scope | null;
  track: Scope | null;
  harFoto: boolean;
}

type Lage = 'ny' | 'utkast' | 'analysera' | 'analysera-sparr' | 'atgarda' | 'siffror' | 'ladda-ner' | 'brev';

/** Rubrikens storlek ur längden, så att den ryms på två rader på väggen. */
function rubrikPx(text: string): number {
  const n = text.length;
  return n > 40 ? 38 : n > 26 ? 42 : 46;
}

/** Första meningen, för telefonens kortare rad. */
const forstaMeningen = (s: string) => {
  const i = s.indexOf('. ');
  return i > 0 ? s.slice(0, i + 1) : s;
};

/** Nästa stegs rubrik ur fyndet: en handling, inte ett avsnittsnamn. */
function rubrikForFynd(f: Fynd, a: AnalysUnderlag | null): string {
  if (f.nyckel === 'profil') return 'Skriv om sammanfattningen';
  if (f.nyckel === 'kompetenser') return 'Lägg till kompetenserna som saknas';
  if (f.nyckel.startsWith('roll-')) {
    const r = a?.roller?.[Number(f.nyckel.slice(5))];
    const foretag = typeof r?.company === 'string' ? r.company.trim() : '';
    return foretag ? `Skriv om rollen på ${foretag}` : `Skriv om rollen ${typeof r?.roleTitle === 'string' ? r.roleTitle : ''}`.trim();
  }
  return f.titel;
}

function Pil({ size = 20 }: { size?: number }) {
  return <ArrowRight size={size} strokeWidth={2.4} />;
}

export default function DittCvClient({ data }: { data: DittCvData }) {
  const router = useRouter();
  const { user } = useRum();
  const kampanj = useKampanjPris();
  const [, startTransition] = useTransition();
  const [quickScoreCvId, setQuickScoreCvId] = useState<string | null>(null);
  const [sparr, setSparr] = useState<'analys' | 'analys-omkorning' | null>(null);
  const [strukturerar, setStrukturerar] = useState(false);
  const [struktureraFel, setStruktureraFel] = useState(false);
  const filRef = useRef<HTMLInputElement>(null);

  const katalog = MALL_KATALOG;
  const lasta = useMemo(() => new Set(data.lastaIds), [data.lastaIds]);
  const aktivt = data.cvs.find((c) => c.id === data.aktivtId) ?? null;
  const antalCv = data.cvs.length;
  const fullt = !data.harBetalt && data.cvs.length - data.lastaIds.length >= data.maxCvs;

  const lista: CvListRad[] = useMemo(
    () =>
      data.cvs.map((c) => ({
        id: c.id,
        namn: c.file_name,
        skapad: c.created_at,
        andrad: c.updated_at ?? null,
        last: lasta.has(c.id),
        utkast: (c.structured_data as { bygge?: { utkast?: boolean } } | null)?.bygge?.utkast === true,
        poang: data.poangPerCv[c.id] ?? null,
        cvText: c.cv_text,
      })),
    [data.cvs, data.poangPerCv, lasta]
  );

  const bygge = (aktivt?.structured_data as { bygge?: { utkast?: boolean } } | null)?.bygge ?? null;
  const utkast = bygge?.utkast === true;
  const underlag = data.underlag;
  const poang = poangUrAnalys(underlag);
  // Gratis: fyndet servern släpper med åtgärd står först (samma ordning som
  // Analys-sidan), övriga efter verkligt plus. Premium: efter plus.
  const fynd = (() => {
    const alla = fyndUrAnalys(underlag);
    const fria = underlag?.friaNycklar;
    if (data.analysFull || !fria) return alla;
    const forsta = alla.find((f) => fria.includes(f.nyckel));
    return forsta ? [forsta, ...alla.filter((f) => f !== forsta)] : alla;
  })();
  // Med våra förslag: poängmodellens tal (src/lib/cv/poang), aldrig en summa av plus.
  const potential = medForslagUrAnalys(underlag);
  const attHamta = poang !== null && potential !== null ? Math.max(0, potential - poang) : 0;
  const atgardaHref = underlag?.jobbId ? `/dashboard/cv-analys?job=${encodeURIComponent(underlag.jobbId)}` : null;
  const vag = aktivt
    ? dokumentVag({ harCv: true, analyseradAt: underlag?.klar ?? null, atgardadAt: data.atgardadAt, nedladdatAt: data.nedladdatAt })
    : null;
  const atgardad = vag?.[2]?.status === 'gjord';
  const nedladdad = vag?.[3]?.status === 'gjord';
  const kvotSlut = !data.analysFull && data.analysKvar !== null && data.analysKvar <= 0;
  // [antal] kvar i CV:t (efterrättning A): då är nästa steg hennes siffror, inte nedladdningen.
  const platshallare = useMemo(
    () => (aktivt ? platshallareIRad(aktivt.structured_data, aktivt.cv_text) : []),
    [aktivt]
  );

  const lageForeSiffror: Lage = !aktivt
    ? 'ny'
    : utkast
      ? 'utkast'
      : !underlag || poang === null
        ? kvotSlut
          ? 'analysera-sparr'
          : 'analysera'
        : fynd[0] && atgardaHref && !atgardad
          ? 'atgarda'
          : !nedladdad
            ? 'ladda-ner'
            : 'brev';
  const lage: Lage =
    platshallare.length > 0 && (lageForeSiffror === 'ladda-ner' || lageForeSiffror === 'brev') ? 'siffror' : lageForeSiffror;

  const mall: MallKort = katalog.find((m) => m.id === data.mallId) ?? katalog[0];
  const urval = useMemo(() => merforsaljningsUrval(katalog, mall.id, 1, data.harFoto), [katalog, mall.id, data.harFoto]);
  const egetCv: EgetCv | null = useMemo(
    () =>
      aktivt
        ? {
            cvId: aktivt.id,
            structuredData: aktivt.structured_data,
            cvText: aktivt.cv_text,
            val: { rubriker: { ...(aktivt.section_titles ?? {}) } },
          }
        : null,
    [aktivt]
  );

  // Innehållet: språket som genomgången ser det, så att kortet och Analys
  // aldrig säger emot varandra (poängmodellen version 2).
  const innehall = useMemo(
    () => (aktivt ? innehallUrCv(aktivt.structured_data, sprakSomGenomgangen(aktivt.structured_data, aktivt.cv_text)) : null),
    [aktivt]
  );

  /* ---------------------------------------------------------- handlingar */

  const lasOm = () => startTransition(() => router.refresh());

  const uppladdat = (id: string) => {
    if (antalCv === 0) setQuickScoreCvId(id);
    router.replace(flikHref('cv', id));
    lasOm();
  };

  const strukturera = async () => {
    if (!aktivt) return;
    setStrukturerar(true);
    setStruktureraFel(false);
    try {
      const res = await fetch('/api/cv/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId: aktivt.id }),
      });
      const j = (await res.json().catch(() => ({}))) as { success?: boolean };
      if (!res.ok || !j.success) throw new Error('struktur');
      lasOm();
    } catch {
      setStruktureraFel(true);
    } finally {
      setStrukturerar(false);
    }
  };

  const kop = () => {
    capture('paywall_cta_clicked', {
      variant: 'analys',
      surface: '/dashboard/profil/cv',
      cta: 'primary',
      plan: SALD_PLAN,
      plats: 'analys',
      kampanj: kampanj?.nyckel ?? null,
    });
    window.location.href = kopstegHref(SALD_PLAN, 'analys');
  };

  /* ------------------------------------------------------------- väggen */

  const steg: BanaSteg[] = (() => {
    if (!vag || lage === 'ny')
      return [
        { etikett: VAGG.kommer.borja, status: 'nu', ikon: 'upp' },
        { etikett: VAGG.kommer.analysera, status: 'kvar' },
        { etikett: VAGG.kommer.atgarda, status: 'kvar' },
        { etikett: VAGG.kommer.laddaNer, status: 'kvar' },
      ];
    if (lage === 'utkast')
      return [
        { etikett: VAGG.gjord.utkast, status: 'nu', ikon: 'penna' },
        { etikett: VAGG.kommer.analysera, status: 'kvar' },
        { etikett: VAGG.kommer.atgarda, status: 'kvar' },
        { etikett: VAGG.kommer.laddaNer, status: 'kvar' },
      ];
    const gjordaEtiketter = [bygge ? VAGG.gjord.utkast : VAGG.gjord.uppladdat, VAGG.gjord.analyserat, VAGG.gjord.atgardat, VAGG.gjord.nedladdat];
    const kommande = [VAGG.kommer.borja, VAGG.kommer.analysera, VAGG.kommer.atgarda, VAGG.kommer.laddaNer];
    const ikoner = ['upp', 'spela', 'penna', 'ner'] as const;
    // Ladda ner utan förslag kvar: markören står på nedladdningen, steget
    // rubriken gäller, också när inget förbättrat CV sparats (åtgärda står kvar).
    const nuIndex = lage === 'ladda-ner' && vag[2]?.status === 'nu' ? 3 : -1;
    return vag.map((c, i) => {
      const status: BanaSteg['status'] =
        c.status === 'gjord' ? 'gjord' : nuIndex >= 0 ? (i === nuIndex ? 'nu' : 'kvar') : c.status === 'nu' ? 'nu' : 'kvar';
      return { etikett: c.status === 'gjord' ? gjordaEtiketter[i] : kommande[i], status, ikon: ikoner[i] };
    });
  })();

  const knappKlass = quickScoreCvId ? 'cv3-glas cv3-glas-stor' : 't3-stor';
  const knappInnehall = (text: string) => (
    <>
      {text}
      <Pil />
    </>
  );

  // Poäng kvar till 100: ingen yta säger att CV:t är klart under 100 (genomgången på Analys, 2026-11-21).
  const kvarTill100 = poang !== null ? Math.max(0, 100 - poang) : 0;
  const genomgangLank = aktivt ? (
    <Link href={flikHref('analys', aktivt.id)} className="underline underline-offset-[3px]" data-se-genomgangen>
      {PANEL.seGenomgangen}
    </Link>
  ) : null;

  const nasta: { ogon: string; rubrik: string; text: string; textKort: string; knapp: ReactNode; knappBred: ReactNode; sidorad: ReactNode } | null = (() => {
    if (!aktivt) return null;
    const lank = (href: string, text: string, bred = false) => (
      <Link href={href} className={`${knappKlass}${bred ? ' t3-stor-bred' : ''}`} data-nasta-knapp>
        {knappInnehall(text)}
      </Link>
    );
    switch (lage) {
      case 'utkast':
        return {
          ogon: NASTA.utkast.ogon,
          rubrik: NASTA.utkast.rubrik,
          text: NASTA.utkast.text,
          textKort: forstaMeningen(NASTA.utkast.text),
          knapp: lank(arbetslageHref(aktivt.id, 'ditt-cv', { mall: mall.id }), 'Fortsätt bygga'),
          knappBred: lank(arbetslageHref(aktivt.id, 'ditt-cv', { mall: mall.id }), 'Fortsätt bygga', true),
          sidorad: NASTA.utkast.sidorad,
        };
      case 'analysera':
      case 'analysera-sparr': {
        const sparrKnapp = (bred: boolean) => (
          <button type="button" className={`${knappKlass}${bred ? ' t3-stor-bred' : ''}`} onClick={() => setSparr('analys-omkorning')} data-nasta-knapp>
            {knappInnehall(NASTA.analysera.knapp)}
          </button>
        );
        return {
          ogon: NASTA.analysera.ogon,
          rubrik: NASTA.analysera.rubrik,
          text: NASTA.analysera.text,
          textKort: forstaMeningen(NASTA.analysera.text),
          knapp: lage === 'analysera' ? lank(flikHref('analys', aktivt.id), NASTA.analysera.knapp) : sparrKnapp(false),
          knappBred: lage === 'analysera' ? lank(flikHref('analys', aktivt.id), NASTA.analysera.knapp, true) : sparrKnapp(true),
          sidorad:
            lage === 'analysera-sparr'
              ? `${kvotCopy('cv_analysis').title}.`
              : data.analysFull
                ? NASTA.analysera.sidoradPremium
                : NASTA.analysera.sidorad,
        };
      }
      case 'atgarda': {
        const f = fynd[0];
        return {
          ogon: NASTA.atgarda.ogon(f.plus),
          rubrik: rubrikForFynd(f, underlag),
          text: f.meta,
          textKort: forstaMeningen(f.meta),
          knapp: lank(atgardaHref!, NASTA.atgarda.knapp),
          knappBred: lank(atgardaHref!, NASTA.atgarda.knapp, true),
          sidorad: NASTA.atgarda.sidorad,
        };
      }
      case 'siffror': {
        const href = arbetslageHref(aktivt.id, 'ditt-cv', { avsnitt: platshallare[0].avsnitt, mall: mall.id });
        return {
          ogon: SIFFROR.ogon,
          rubrik: SIFFROR.rubrik,
          text: SIFFROR.text(platshallare.length),
          textKort: forstaMeningen(SIFFROR.text(platshallare.length)),
          knapp: lank(href, SIFFROR.knapp),
          knappBred: lank(href, SIFFROR.knapp, true),
          sidorad: null,
        };
      }
      case 'ladda-ner':
        return {
          ogon: NASTA.laddaNer.ogon,
          rubrik: NASTA.laddaNer.rubrik,
          text: NASTA.laddaNer.text,
          textKort: forstaMeningen(NASTA.laddaNer.text),
          knapp: lank(flikHref('mallar', aktivt.id), NASTA.laddaNer.knapp),
          knappBred: lank(flikHref('mallar', aktivt.id), NASTA.laddaNer.knapp, true),
          sidorad: NASTA.laddaNer.sidorad,
        };
      default:
        return {
          ogon: NASTA.brev.ogon,
          rubrik: NASTA.brev.rubrik,
          text: NASTA.brev.text,
          textKort: NASTA.brev.text,
          knapp: lank('/dashboard/skapa-brev', NASTA.brev.knapp),
          knappBred: lank('/dashboard/skapa-brev', NASTA.brev.knapp, true),
          sidorad:
            kvarTill100 > 0 ? (
              <>
                {NASTA.brev.sidoradKvar} {PANEL.kvar(kvarTill100)} {genomgangLank}
              </>
            ) : (
              NASTA.brev.sidorad
            ),
        };
    }
  })();

  const mallarHref = (m?: string) => flikHref('mallar', aktivt?.id ?? null, m ? { mall: m } : undefined);
  const bakom = [urval[1], urval[2]].filter(Boolean) as MallKort[];
  const exempelBakom = ['koppar', 'skylt'].map((id) => katalog.find((m) => m.id === id)).filter(Boolean) as MallKort[];

  const arkstapel = (
    <div className="cv3-arkstapel">
      {(aktivt ? bakom : exempelBakom).map((m, i) => (
        <span key={m.id} className="cv3-ark" data-plats={i + 1} aria-hidden="true">
          <EgenMiniatyr mall={m} cv={egetCv} direkt />
        </span>
      ))}
      {aktivt ? (
        <Link href={mallarHref(mall.id)} className="cv3-ark" data-plats="0" aria-label={VAGG.arkAlt(mall.namn)}>
          <EgenMiniatyr mall={mall} cv={egetCv} direkt />
        </Link>
      ) : (
        <span className="cv3-ark" data-plats="0">
          <EgenMiniatyr mall={mall} cv={null} alt={VAGG.exempelAlt(mall.namn)} direkt />
        </span>
      )}
      {aktivt ? (
        <Link href={mallarHref()} className="t3-chip cv3-chip-ark">
          {VAGG.seMallar}
          <Pil size={15} />
        </Link>
      ) : (
        <span className="t3-chip cv3-chip-ark">{VAGG.exempelMallar(exempelBakom.length + 1)}</span>
      )}
    </div>
  );

  const stortTal =
    lage === 'ny' ? (
      <p className="t3-stort">
        <span className="t3-stort-tal" aria-hidden="true">4</span>
        <span className="t3-stort-rad">
          <span className="sr-only">4 </span>
          {VAGG.steg[0]}
          <br />
          <b>{VAGG.steg[1]}</b>
        </span>
      </p>
    ) : poang !== null && lage !== 'utkast' ? (
      <p className="t3-stort">
        <span className="t3-stort-tal" aria-hidden="true">{poang}</span>
        <span className="t3-stort-rad">
          <span className="sr-only">{poang} </span>
          {VAGG.lasbarhet[0]}
          <br />
          <b>{VAGG.lasbarhet[1]}</b>
        </span>
      </p>
    ) : (
      <p className="t3-stort">
        <span className="cv3-lucka-vagg" aria-hidden="true">?</span>
        <span className="t3-stort-rad">
          {VAGG.inteMatt[0]}
          <br />
          <b>{VAGG.inteMatt[1]}</b>
        </span>
      </p>
    );

  const hoger = (
    <>
      {stortTal}
      <DokumentBanaDator steg={steg} />
      {arkstapel}
    </>
  );

  const valjFil = (
    <>
      <input
        ref={filRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const fil = e.target.files?.[0] ?? null;
          e.target.value = '';
          if (fil) oppnaNyttCv(fil);
        }}
      />
      <button type="button" className="cv3-valj" onClick={() => filRef.current?.click()}>
        {NYTT_ARK.valjFil}
      </button>
    </>
  );

  const tvaVagar = (
    <>
      <div className="cv3-slapp">
        <Upload size={40} strokeWidth={2.2} className="shrink-0 text-koppar-ljus" />
        <span className="min-w-0">
          <b>{NYTT_ARK.ladda}</b>
          <small>{NYTT_ARK.laddaText}</small>
        </span>
        {valjFil}
      </div>
      <div className="cv3-skriv">
        <div className="flex items-center gap-4">
          <PenLine size={40} strokeWidth={2.2} className="shrink-0 text-koppar-ljus" />
          <span className="min-w-0">
            <b>{NYTT_ARK.skriv}</b>
            <small>{NYTT_ARK.skrivText}</small>
          </span>
        </div>
        <SkrivFranBorjan ton="vagg" />
      </div>
    </>
  );

  const vanster =
    lage === 'ny' ? (
      <>
        <p className="t3-ogon">{NASTA.ny.ogon}</p>
        <h1 className="t3-h1" style={{ fontSize: 42, lineHeight: '46px', marginTop: 10 }}>
          {NASTA.ny.rubrik}
        </h1>
        {tvaVagar}
      </>
    ) : nasta ? (
      <>
        <p className="t3-ogon">{nasta.ogon}</p>
        <h1 className="t3-h1" style={{ fontSize: rubrikPx(nasta.rubrik), lineHeight: `${rubrikPx(nasta.rubrik) + 4}px` }}>
          {nasta.rubrik}
        </h1>
        <p className="cv3-ingress">{nasta.text}</p>
        <div className="t3-knapprad">
          {nasta.knapp}
          {nasta.sidorad ? <span className="t3-sidorad">{nasta.sidorad}</span> : null}
        </div>
        <div className="t3-chips">
          <span className="t3-chip">
            <FileText size={16} strokeWidth={2.2} className="text-koppar-ljus" />
            {VAGG.mallChip(mall.namn)}
          </span>
          <span className="t3-chip">{nedladdad ? VAGG.nedladdat : VAGG.inteNedladdat}</span>
          <Link href={mallarHref()} className="t3-chip-lank">
            {VAGG.bytMall}
          </Link>
        </div>
      </>
    ) : null;

  const mobil =
    lage === 'ny' ? (
      <div className="cv3-ny-mobil">
        <p className="t3-ogon" style={{ marginTop: 16 }}>{NASTA.ny.ogon}</p>
        <h1 className="cv3-h1-mobil">{NASTA.ny.rubrik}</h1>
        {tvaVagar}
      </div>
    ) : nasta ? (
      <>
        <div className="cv3-mobil-hero">
          <div className="min-w-0">
            <p className="t3-ogon">{nasta.ogon}</p>
            <h1 className="cv3-h1-mobil">{nasta.rubrik}</h1>
            <p className="cv3-text-mobil">
              <span className="md:hidden">{nasta.textKort}</span>
              <span className="hidden md:inline">{nasta.text}</span>
            </p>
          </div>
          <Link
            href={mallarHref(mall.id)}
            className="cv3-tumme"
            aria-label={poang !== null && lage !== 'utkast' ? VAGG.poangAria(mall.namn, poang) : VAGG.arkAlt(mall.namn)}
          >
            <EgenMiniatyr mall={mall} cv={egetCv} direkt />
            {poang !== null && lage !== 'utkast' ? (
              <span className="cv3-tumme-tal" aria-hidden="true">{poang}</span>
            ) : (
              <span className="cv3-tumme-tal" data-lucka aria-hidden="true">?</span>
            )}
          </Link>
        </div>
        <DokumentBanaMobil steg={steg} />
        <div className="cv3-mobil-knapp">
          {nasta.knappBred}
          {nasta.sidorad ? <span className="cv3-mobil-sidorad">{nasta.sidorad}</span> : null}
        </div>
      </>
    ) : null;

  /* ------------------------------------------------------------- golvet */

  const sparkSaknas = innehall?.avsnitt.find((a) => !a.finns) ?? null;
  const finnsAntal = innehall?.avsnitt.filter((a) => a.finns).length ?? 0;
  const sprakHref = aktivt ? arbetslageHref(aktivt.id, 'ditt-cv', { avsnitt: 'sprak', mall: mall.id }) : '#';

  const matare1 =
    poang !== null && potential !== null && lage !== 'utkast' ? (
      <div className="t3-matare t3-matare-niva">
        <div className="t3-matare-topp">
          <p className="t3-ogon-matt">{PANEL.lasbarhet}</p>
          {attHamta > 0 ? <span className="cv3-vantar">{PANEL.attHamta(attHamta)}</span> : null}
        </div>
        <div className="t3-matare-mitt">
          <span className="t3-stortal">{poang}</span>
          <PotentialStapel nu={poang} med={potential} etikett={lage === 'siffror' ? PANEL.medSiffror(potential) : undefined} />
        </div>
        <p className="t3-matare-rad">
          {attHamta > 0 ? <b>{PANEL.finnsAttHamta(attHamta)} </b> : null}
          {lage === 'siffror' ? (
            <span>{PANEL.siffrorSaknas(platshallare.length)}</span>
          ) : (
            <>
              {fynd.length === 0 && kvarTill100 > 0 ? (
                <span>
                  {PANEL.kvar(kvarTill100)} {genomgangLank}
                </span>
              ) : (
                <>
                  <span className="hidden xl:inline">{PANEL.drarNer(fynd.length)}</span>
                  <span className="xl:hidden">{PANEL.drarNerKort(fynd.length)}</span>
                </>
              )}
            </>
          )}
        </p>
      </div>
    ) : (
      <div className="t3-matare t3-matare-niva">
        <div className="t3-matare-topp">
          <p className="t3-ogon-matt">{PANEL.lasbarhet}</p>
          <span className="cv3-vantar" data-ton="petrol">{PANEL.inteMatt}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="cv3-lucka-golv" aria-label="Inte mätt än" role="img">?</span>
          <span className="text-[15px] font-semibold leading-[21px]">{PANEL.luckaText}</span>
        </div>
        <p className="t3-matare-rad">
          <b>{PANEL.matsIAnalysen}</b> {PANEL.matsIAnalysenRad}
        </p>
      </div>
    );

  const matare2 = innehall?.strukturerat ? (
    <div className="t3-matare">
      <p className="t3-ogon-matt">{PANEL.innehall}</p>
      <div className="t3-prov-tal">
        <span className="t3-medeltal">{finnsAntal}</span>
        <span>{PANEL.avAvsnitt(innehall.avsnitt.length)}</span>
      </div>
      <span
        className="cv3-bitar"
        role="img"
        aria-label={`${innehall.avsnitt
          .filter((a) => a.finns)
          .map((a) => PANEL.avsnittNamn[a.nyckel])
          .join(', ')} finns.${innehall.avsnitt.some((a) => !a.finns) ? ` ${innehall.avsnitt.filter((a) => !a.finns).map((a) => PANEL.avsnittNamn[a.nyckel]).join(', ')} saknas.` : ''}`}
      >
        {innehall.avsnitt.map((a) =>
          a.finns ? (
            <span key={a.nyckel} className="cv3-bit">
              <Check size={16} strokeWidth={3.2} />
            </span>
          ) : (
            <span key={a.nyckel} className="cv3-bit" data-lucka>
              +
            </span>
          )
        )}
      </span>
      <p className="t3-matare-rad">
        {sparkSaknas ? (
          sparkSaknas.nyckel === 'sprak' ? (
            <>
              <b>{PANEL.sprakSaknas}</b>{' '}
              <Link href={sprakHref} className="hidden underline underline-offset-[3px] xl:inline">
                {PANEL.sprakSaknasRad}
              </Link>
            </>
          ) : (
            <>
              <b>{PANEL.saknas(PANEL.avsnittNamn[sparkSaknas.nyckel])}</b> <span className="hidden xl:inline">{PANEL.saknasRad}</span>
            </>
          )
        ) : (
          <>
            <b>{PANEL.allaAvsnitt}</b> <span className="hidden xl:inline">{PANEL.allaAvsnittRad}</span>
          </>
        )}
      </p>
    </div>
  ) : (
    <div className="t3-matare">
      <p className="t3-ogon-matt">{PANEL.innehall}</p>
      <span className="cv3-lucka-golv" aria-label="Inte inläst än" role="img">?</span>
      <p className="t3-matare-rad">
        <b>{PANEL.oStrukturerat}</b> <span className="hidden xl:inline">{PANEL.oStruktureratRad}</span>
      </p>
      <button type="button" className="t3-liten cv3-strukturera" onClick={() => void strukturera()} disabled={strukturerar}>
        {strukturerar ? PANEL.strukturerar : PANEL.strukturera}
      </button>
      {struktureraFel ? (
        <p role="alert" className="text-[13px] text-fel">
          {PANEL.struktureraFel}
        </p>
      ) : null}
    </div>
  );

  const matare3 = (
    <div className="t3-matare">
      <div className="t3-matare-topp">
        <p className="t3-ogon-matt">{PANEL.mallen}</p>
        <span className="hidden xl:inline">
          <span className="cv3-plus">
            <Check size={12} strokeWidth={3.6} />
            {PANEL.atsSaker}
          </span>
        </span>
      </div>
      <div className="cv3-mallrad">
        <span className="cv3-mallrad-bild">
          <EgenMiniatyr mall={mall} cv={egetCv} />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-lg font-extrabold leading-[22px] tracking-[-.01em] xl:text-[22px] xl:leading-[26px]">{mall.namn}</span>
          <span className="hidden text-[13px] leading-[18px] text-[color:var(--cv3-ink-2)] xl:block">{PANEL.dinMallNu}</span>
          <span className="mt-1 block xl:hidden">
            <span className="cv3-plus">
              <Check size={10} strokeWidth={3.6} />
              {PANEL.atsSaker}
            </span>
          </span>
        </span>
        <Link href={mallarHref()} className="cv3-mallrad-fler" aria-label={PANEL.flerAria(TEMPLATE_COUNT - 1)}>
          {urval.map((m) => (
            <EgenMiniatyr key={m.id} mall={m} cv={null} bild="liten" />
          ))}
          <b>{PANEL.fler(TEMPLATE_COUNT - 1 - urval.length)}</b>
        </Link>
      </div>
      <p className="t3-matare-rad">
        <b className="hidden xl:inline">{PANEL.testad} </b>
        <Link href={mallarHref()} className="cv3-inlinelank">
          {PANEL.bytBland}
        </Link>
        <span className="hidden xl:inline">{PANEL.textenFoljer}</span>
      </p>
    </div>
  );

  const panel =
    lage === 'ny' ? (
      <section className="t3-panel" aria-labelledby="ditt-cv-panel">
        <p className="t3-ogon-golv">{NY.panelOgon}</p>
        <h2 id="ditt-cv-panel" className="t3-h2">
          {NY.panelRubrik}
        </h2>
        <div className="cv3-ny-panel">
          <div className="t3-matare">
            <p className="t3-ogon-matt">{NY.poang}</p>
            <div className="cv3-scen">
              <span className="cv3-lucka-golv" aria-hidden="true">?</span>
              <span className="text-[15px] font-semibold leading-[21px]">{NY.poangAv}</span>
            </div>
            <p className="t3-matare-rad">
              <b>{NY.poangRad}</b> {NY.poangRad2}
            </p>
          </div>
          <div className="t3-matare">
            <p className="t3-ogon-matt">{NY.mallar}</p>
            <div className="cv3-scen" aria-hidden="true">
              {['linne', 'kalksten', 'koppar', 'skylt'].map((id) => {
                const m = katalog.find((k) => k.id === id);
                return m ? <EgenMiniatyr key={id} mall={m} cv={null} bild="liten" /> : null;
              })}
            </div>
            <p className="t3-matare-rad">
              <b>{NY.mallarRad}</b> {NY.mallarRad2}
            </p>
          </div>
          <div className="t3-matare">
            <p className="t3-ogon-matt">{NY.brev}</p>
            <div className="cv3-scen">
              <BrevScen />
            </div>
            <p className="t3-matare-rad">
              <b>{NY.brevRad}</b> {NY.brevRad2}
            </p>
          </div>
        </div>
      </section>
    ) : (
      <section className="t3-panel" aria-labelledby="ditt-cv-panel">
        <div className="t3-panel-huvud">
          <div>
            <p className="t3-ogon-golv">{PANEL.ogon}</p>
            <h2 id="ditt-cv-panel" className="t3-h2">
              {PANEL.rubrik}
            </h2>
          </div>
          {underlag && aktivt ? (
            <Link href={flikHref('analys', aktivt.id)} className="t3-lank hidden xl:inline-flex">
              {PANEL.helaAnalysen}
            </Link>
          ) : null}
        </div>
        <div className="t3-matt-rutnat cv3-matt3">
          {matare1}
          {matare2}
          {matare3}
        </div>
      </section>
    );

  const visadeFynd = fynd.slice(0, 4);
  // Gratis: de fynd servern släpper med åtgärd (profilen och det tyngsta,
  // gateAnalysisResult), samma som på Analys-sidan. Äldre underlag: det första.
  const fri = (f: Fynd, i: number) => (underlag?.friaNycklar ? underlag.friaNycklar.includes(f.nyckel) : i === 0);
  const lastaAntal = data.analysFull ? 0 : fynd.filter((f, i) => !fri(f, i)).length;
  const drarNer =
    aktivt && underlag && poang !== null && potential !== null && visadeFynd.length > 0 && lage !== 'utkast' ? (
      <section aria-labelledby="drar-ner">
        <div className="t3-sektion-huvud">
          <h2 id="drar-ner" className="t3-h2" style={{ marginTop: 0 }}>
            {DRAR_NER.rubrik}
          </h2>
          <p className="t3-sektion-rad">
            {data.analysFull ? (
              DRAR_NER.radPremium
            ) : (
              <>
                <span className="hidden xl:inline">{DRAR_NER.rad}</span>
                <span className="xl:hidden">{DRAR_NER.radKort}</span>
              </>
            )}
          </p>
        </div>
        <ol className="cv3-fynd">
          {visadeFynd.map((f, i) => {
            const oppen = data.analysFull || fri(f, i);
            const tagg = data.analysFull ? null : fri(f, i) ? (
              <span className="cv3-tagg" data-ton="gratis">{DRAR_NER.gratis}</span>
            ) : (
              <span className="cv3-tagg">
                <Lock size={12} strokeWidth={2.6} />
                {DRAR_NER.premium}
              </span>
            );
            const innehallKort = (
              <>
                <span className="cv3-kort-nr">{i + 1}</span>
                <span className="cv3-plus" aria-label={DRAR_NER.plusAria(f.plus)}>
                  <span className="cv3-bara-dator">{DRAR_NER.plus(f.plus)}</span>
                  <span className="cv3-bara-mobil">{DRAR_NER.plusKort(f.plus)}</span>
                </span>
                <span className="cv3-kort-text">
                  <b>{f.titel}</b>
                  {f.meta ? (
                    <span className="cv3-kort-skal" data-bara-nu>
                      {i === 0 ? forstaMeningen(f.meta) : f.meta}
                    </span>
                  ) : null}
                  {tagg && i > 0 ? <span className="cv3-kort-tagg block">{tagg}</span> : null}
                </span>
                {tagg ? (
                  <span className="cv3-kort-tagg hidden xl:block" data-gratis={i === 0 ? '' : undefined}>
                    {tagg}
                  </span>
                ) : null}
              </>
            );
            return (
              <li key={f.nyckel}>
                {oppen ? (
                  <Link href={atgardaHref ?? flikHref('analys', aktivt.id)} className="cv3-kort" data-nu={i === 0 ? '' : undefined}>
                    {innehallKort}
                  </Link>
                ) : (
                  <button type="button" className="cv3-kort" onClick={() => setSparr('analys')} aria-haspopup="dialog">
                    {innehallKort}
                  </button>
                )}
              </li>
            );
          })}
          <li>
            <div className="cv3-kort" data-mal>
              <span className="cv3-kort-nr">
                <Flag size={22} strokeWidth={2.6} />
              </span>
              <span className="cv3-kort-text">
                <span className="cv3-bara-dator">
                  <span className="cv3-mal-tal">{potential}</span>
                  <span className="cv3-kort-skal">{DRAR_NER.malRad(fynd.length)}</span>
                </span>
                <span className="cv3-bara-mobil">
                  <b className="cv3-mal-tal">{DRAR_NER.malKort(potential)}</b>
                  <span className="cv3-kort-skal">{DRAR_NER.malKortRad(fynd.length)}</span>
                </span>
              </span>
            </div>
          </li>
        </ol>
        {!data.analysFull && lastaAntal > 0 ? (
          <div className="cv3-kop" data-kopruta>
            <span className="cv3-kop-ik" aria-hidden="true">
              <Lock size={22} strokeWidth={2.4} />
            </span>
            <span>
              <b>{DRAR_NER.kopRubrik(lastaAntal)}</b>
              <small>
                <PremiumPrisradText />
              </small>
            </span>
            <button type="button" className="cv3-kopknapp" onClick={kop}>
              <PremiumKnappText />
            </button>
          </div>
        ) : null}
      </section>
    ) : null;

  const annanMall = aktivt ? (
    <section aria-labelledby="annan-mall">
      <div className="cv3-sektion-huvud">
        <div>
          <h2 id="annan-mall" className="t3-h2" style={{ marginTop: 0 }}>
            {ANNAN_MALL.rubrik}
          </h2>
          <p className="t3-sektion-rad">
            <span className="hidden xl:inline">{ANNAN_MALL.rad(mall.namn, urval.length)}</span>
            <span className="xl:hidden">{ANNAN_MALL.radKort}</span>
          </p>
        </div>
        <Link href={mallarHref()} className="t3-lank inline-flex whitespace-nowrap">
          <span className="hidden xl:inline">{ANNAN_MALL.alla}</span>
          <span className="xl:hidden">{ANNAN_MALL.allaKort}</span>
        </Link>
      </div>
      <ul className="cv3-mallar">
        {[mall, ...urval].map((m) => {
          const vald = m.id === mall.id;
          return (
            <li key={m.id}>
              <Link href={mallarHref(m.id)} className="cv3-mall" data-vald={vald ? '' : undefined} aria-current={vald ? 'true' : undefined}>
                <span className="cv3-mall-bild">
                  <EgenMiniatyr mall={m} cv={egetCv} alt={VAGG.arkAlt(m.namn)} />
                </span>
                <span className="cv3-mall-text">
                  <span className="cv3-mall-namn">
                    <b>{m.namn}</b>
                    <span className="cv3-tagg" data-ton={m.niva === 'gratis' ? 'gratis' : undefined}>
                      {m.niva === 'gratis' ? ANNAN_MALL.gratis : ANNAN_MALL.premium}
                    </span>
                  </span>
                  <span className="cv3-mall-kort">
                    {vald ? (
                      <>
                        <span className="hidden xl:inline">{ANNAN_MALL.dinMall(kortText(m, data.harFoto))}</span>
                        <span className="xl:hidden">Din mall nu.</span>
                      </>
                    ) : (
                      `${kortText(m, data.harFoto)}.`
                    )}
                  </span>
                  <span className="cv3-fmrad">
                    <span className="cv3-fm">PDF</span>
                    {m.word ? <span className="cv3-fm">Word</span> : null}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  ) : null;

  const rader = aktivt ? (
    <div className="t3-nederst">
      <div className="t3-radk">
        <span className="cv3-ik" aria-hidden="true">
          <Mail size={24} strokeWidth={2.2} />
        </span>
        <span className="t3-radk-text">
          <span className="cv3-radk-ogon">{RADER.brevOgon}</span>
          <b>{RADER.brev}</b>
          <small>
            <span className="hidden xl:inline">{RADER.brevText}</span>
            <span className="xl:hidden">{RADER.brevTextKort}</span>
          </small>
        </span>
        <Link href="/dashboard/skapa-brev" className="t3-liten">
          {RADER.brevKnapp}
        </Link>
      </div>
      <div className="t3-radk">
        <span className="cv3-ik" aria-hidden="true">
          <Plus size={24} strokeWidth={2.2} />
        </span>
        <span className="t3-radk-text">
          <span className="cv3-radk-ogon">{RADER.sparadeOgon(data.harBetalt ? antalCv : antalCv - data.lastaIds.length, data.harBetalt ? null : data.maxCvs)}</span>
          <b>{RADER.nytt}</b>
          <small>
            <span className="hidden xl:inline">{RADER.nyttText}</span>
            <span className="xl:hidden">{RADER.nyttTextKort}</span>
          </small>
          {antalCv > 1 ? (
            <span className="block xl:hidden">
              <button type="button" className="cv3-textlank" onClick={oppnaBytCv}>
                Byt CV
              </button>
            </span>
          ) : null}
        </span>
        <button type="button" className="t3-liten" onClick={() => oppnaNyttCv()} aria-haspopup="dialog">
          <span className="hidden xl:inline">{RADER.nyttKnapp}</span>
          <span className="xl:hidden">{RADER.nyttKnappKort}</span>
        </button>
      </div>
      {bygge && !utkast ? (
        <div className="t3-radk">
          <span className="cv3-ik" aria-hidden="true">
            <PenLine size={24} strokeWidth={2.2} />
          </span>
          <span className="t3-radk-text">
            <span className="cv3-radk-ogon">{RADER.byggOgon}</span>
            <b>{RADER.bygg}</b>
            <small>{RADER.byggText}</small>
          </span>
          <Link href={arbetslageHref(aktivt.id, 'ditt-cv', { mall: mall.id })} className="t3-liten">
            Redigera i byggaren
          </Link>
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <div className="flex flex-1 flex-col" data-ditt-cv data-lage={lage}>
      <CvVagg
        aktiv="cv"
        cvId={aktivt?.id ?? null}
        etikett="Ditt CV"
        lage={lage}
        cvRad={<CvRad cvs={lista} aktivtId={aktivt?.id ?? null} sida="cv" fullt={fullt} onUppladdat={uppladdat} utanRad={!aktivt} />}
        vanster={vanster}
        hoger={hoger}
        mobil={mobil}
      />
      <div className="t3-golv">
        {panel}
        {quickScoreCvId && aktivt && quickScoreCvId === aktivt.id ? <QuickScoreReveal cvId={quickScoreCvId} userId={user?.id} /> : null}
        {drarNer}
        {annanMall}
        {rader}
      </div>
      {sparr ? (
        <GraValSheet
          open
          onClose={() => setSparr(null)}
          feature="cv_analysis_full"
          variant={sparr}
          scope={data.scope}
          track={data.track}
          surface="/dashboard/profil/cv"
          plats="analys"
        />
      ) : null}
    </div>
  );
}

/** Läsbarheten i dag och med våra förslag (skissen Main, mätaren). */
function PotentialStapel({ nu, med, etikett }: { nu: number; med: number; etikett?: string }) {
  const B = 264;
  const x0 = 3;
  const nuX = x0 + (B * nu) / 100;
  const medX = x0 + (B * med) / 100;
  return (
    <svg viewBox="0 0 270 98" className="block min-w-0 flex-1" style={{ maxWidth: 300 }} role="img" aria-label={med > nu ? PANEL.potentialAria(nu, med) : PANEL.idagAria(nu)}>
      {/* Bubblan bara när "med"-talet är högre än i dag (samma regel på telefon). */}
      {med > nu ? (
        <>
          <rect x="0" y="0" width="270" height="26" rx="8" style={{ fill: 'var(--sess-rad3-yta)' }} />
          <text x="10" y="17" fontSize="11" fontWeight="700" style={{ fill: 'var(--sess-rad3-ink)' }}>
            {etikett ?? PANEL.medForslag(med)}
          </text>
          <path d={`M${medX} 30V52`} style={{ stroke: 'var(--t3-streck)' }} strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
        </>
      ) : null}
      <rect x="1" y="54" width="268" height="22" rx="11" style={{ fill: 'var(--papper)', stroke: 'var(--sess-kant)' }} strokeWidth="2" />
      <rect x={x0} y="56" width={Math.max(18, medX - x0)} height="18" rx="9" style={{ fill: 'var(--sess-rad3-yta)' }} />
      <rect className="cv3-stapel-nu" x={x0} y="56" width={Math.max(18, nuX - x0)} height="18" rx="9" style={{ fill: 'var(--koppar)' }} />
      <circle cx={nuX} cy="65" r="9" style={{ fill: 'var(--koppar)', stroke: 'var(--papper)' }} strokeWidth="3" />
      <text x={nuX} y="91" textAnchor="middle" fontSize="11" fontWeight="700" style={{ fill: 'var(--cv3-ink-2)' }}>
        {PANEL.idag}
      </text>
    </svg>
  );
}

/** Brevet ur CV:t (skissen Hem-ny, tredje mätaren). */
function BrevScen() {
  return (
    <svg viewBox="0 0 150 92" width="150" height="92" aria-hidden="true" className="max-w-full">
      <rect x="2" y="6" width="62" height="82" rx="5" style={{ fill: '#FFFFFF', stroke: 'var(--sess-kant)' }} strokeWidth="2" />
      <path d="M12 20h28M12 32h42M12 40h42M12 48h34M12 60h42M12 68h26" style={{ stroke: '#9DB9B6' }} strokeWidth="3" strokeLinecap="round" />
      <path d="M74 47h20M86 39l8 8-8 8" fill="none" style={{ stroke: 'var(--koppar)' }} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="104" y="22" width="44" height="50" rx="5" style={{ fill: '#113538' }} />
      <path d="M112 34h28M112 43h28M112 52h18" style={{ stroke: '#7FCFCA' }} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
