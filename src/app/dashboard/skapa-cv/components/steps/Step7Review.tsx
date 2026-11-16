'use client';

/**
 * Byggarens steg 7 (plan-mallar 3.2, skissen yta 4): dokumentet först, i
 * storleken mellan, i FlowShell. "Föreslagna för dig" i remsan, tryck på ett
 * avsnitt går till steget med retur hit, rubrikerna byts på arket och
 * knappen i flödesfoten heter "Spara och ladda ner PDF" (felraden
 * primaryError från steg 1 står kvar). Karusellen och innehållslistan är
 * borta. Nedladdningen slutar i finalen.
 */
import { KNAPP_PRIMAR_SMAL } from '@/components/shell/knappar';
import { PAKETRADER } from '@/components/paywall/paywall-copy';
import { useBetalvaggVisad } from '@/hooks/useBetalvaggVisad';
import { capture } from '@/lib/analytics/events';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import PaywallCard from '@/components/paywall/PaywallCard';
import { nedladdningsFelForUndantag } from '@/lib/cv/nedladdningsFel';
import Confirmation from '@/components/shell/Confirmation';
import StatusRow from '@/components/shell/StatusRow';
import { FIELD, FIELD_OK, LABEL } from '../inputs/SkapaCvInput';
import type { CVDraft } from '../CVCreatorWizard';
import type { CVMetadata } from '@/lib/cv/cv-metadata';
import type { Format, MallVal, Sektion } from '@/lib/cv/mallar/kontrakt';
import { MALL_KATALOG } from '@/lib/cv/mallar/katalog';
import { foreslagna as raknaForslag } from '@/lib/cv/mallval/forslag';
import Dokument from '@/components/cv/Dokument/Dokument';
import Remsa from '@/components/cv/Dokument/Remsa';
import AllaArk from '@/components/cv/Dokument/AllaArk';
import Verktygsrad from '@/components/cv/Dokument/Verktygsrad';
import Mallrad from '@/components/cv/Dokument/MallArk';
import RubrikArk from '@/components/cv/Dokument/RubrikArk';
import Final from '@/components/cv/Dokument/Final';
import { FormatVal } from '@/components/cv/Dokument/FastRad';
import { useForhandsvisning } from '@/components/cv/Dokument/hooks';
import type { Matning } from '@/components/cv/Dokument/matning';
import { KNAPP, SKAL } from '@/components/cv/Dokument/texter';

export type CvFormat = Format;

/** Primärhandlingen registreras hos wizarden, som ritar den i FlowShell-foten. */
export interface ReviewPrimary {
  label: string;
  onClick: () => void;
  disabled: boolean;
  blockedReason?: string;
  /** Felet från senaste försöket, som rad under knappen. */
  error?: string;
}

type Fil = { blob: Blob; url: string; filnamn: string };

interface Step7ReviewProps {
  cvData: CVDraft;
  updateCVData: (updates: Partial<CVDraft>) => void;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  onComplete: (action: 'save' | 'download' | 'both', format?: CvFormat, val?: MallVal) => Promise<Fil | null>;
  isSaving: boolean;
  buildCVMetadata: () => CVMetadata;
  registerPrimary?: (primary: ReviewPrimary | null) => void;
  /** Tryck på ett avsnitt: till steget (0-baserat), med retur hit. */
  onGaTillSteg?: (steg: number) => void;
}

const STEG_FOR: Record<Sektion, number> = {
  profil: 1,
  erfarenhet: 2,
  utbildning: 3,
  kompetenser: 4,
  sprak: 5,
  intyg: 4,
  projekt: 2,
  intressen: 5,
  referenser: 5,
};

const LINK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1';

function ConfirmationView({ onGoToATS, onCreateNew }: { onGoToATS: () => void; onCreateNew: () => void }) {
  return (
    <div className="space-y-4">
      <Confirmation
        title="Ditt CV är klart"
        description="Sparat under Mina CV. Nästa steg: se till att det passerar rekryteringssystemen."
        action={
          <button type="button" onClick={onGoToATS} className={KNAPP_PRIMAR_SMAL}>
            Analysera ditt CV
          </button>
        }
        secondaryAction={
          <Link href="/dashboard/profil/cv" className={LINK}>
            Gå till Mina CV
          </Link>
        }
      >
        <p className="mx-auto max-w-sm text-meta text-ink-3">
          De flesta arbetsgivare låter ett rekryteringssystem (ATS) sortera ansökningarna först. Vi visar vad du ska ändra.
        </p>
      </Confirmation>
      <div className="text-center">
        <button type="button" onClick={onCreateNew} className={LINK}>
          Skapa ett nytt CV
        </button>
      </div>
    </div>
  );
}

export default function Step7Review({
  cvData,
  selectedTemplate,
  setSelectedTemplate,
  onComplete,
  isSaving,
  buildCVMetadata,
  registerPrimary,
  onGaTillSteg,
}: Step7ReviewProps) {
  const router = useRouter();
  const { subscriptionTier } = useProfile();
  const isPremium = subscriptionTier === 'premium';

  const [sparad, setSparad] = useState(false);
  const [fil, setFil] = useState<Fil | null>(null);
  const [cvName, setCvName] = useState(`CV - ${cvData.personalInfo.fullName || 'Nytt CV'}`);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [nedladdningsFel, setNedladdningsFel] = useState<string | null>(null);
  const [exportSparr, setExportSparr] = useState(false);
  const [format, setFormat] = useState<Format>('pdf');
  const [val, setVal] = useState<MallVal>({});
  const [alla, setAlla] = useState(false);
  const [rubrik, setRubrik] = useState<{ sektion: Sektion; text: string } | null>(null);
  const [matning, setMatning] = useState<Matning | null>(null);

  const metadata = useMemo(() => buildCVMetadata(), [buildCVMetadata]);
  const mall = MALL_KATALOG.find((m) => m.id === selectedTemplate) ?? MALL_KATALOG[0];
  const fv = useForhandsvisning({ typ: 'inloggad', structuredData: metadata, mall: mall.id, val });
  const forslag = useMemo(() => raknaForslag(MALL_KATALOG, metadata, matning?.sidor ?? 1), [metadata, matning?.sidor]);

  const isValid = useMemo(() => {
    const hasBasicInfo = !!(cvData.personalInfo.fullName && cvData.personalInfo.email && cvData.personalInfo.phone);
    const hasContent =
      cvData.experience.some((e) => e.position && e.company) || cvData.education.some((e) => e.degree && e.institution);
    return hasBasicInfo && hasContent;
  }, [cvData]);

  const isTemplateLocked = mall.niva === 'premium' && !isPremium;
  const aktivtFormat: Format = mall.word ? format : 'pdf';
  // Word i en gratismall är en vanlig gratisexport (ägarens besked 2026-11-16);
  // är gratisfilen använd svarar servern 402 cv_export som för PDF.
  const wordLast = !isPremium && mall.niva === 'premium';
  useBetalvaggVisad('mall', isTemplateLocked);

  const valjMall = (id: string, metod: 'tryck' | 'lista' | 'svep') => {
    setSelectedTemplate(id);
    const m = MALL_KATALOG.find((k) => k.id === id);
    capture('mall_bytt', {
      template: id,
      method: metod,
      tier: m?.niva === 'premium' ? 'premium' : 'free',
      har_word: Boolean(m?.word),
      surface: 'byggare',
    });
  };

  const handleAction = useCallback(
    async (action: 'save' | 'download' | 'both') => {
      setQuotaError(null);
      setNedladdningsFel(null);
      if (action !== 'save') {
        capture('nedladdning_klickad', { template: mall.id, format: aktivtFormat, inloggad: true, surface: 'byggare', tier: mall.niva === 'gratis' ? 'free' : 'premium' });
      }
      try {
        const ut = await onComplete(action, aktivtFormat, val);
        if (ut) setFil(ut);
        else setSparad(true);
      } catch (error) {
        const isQuota = error instanceof Error && (error as Error & { quotaExceeded?: boolean }).quotaExceeded === true;
        const status = (error as { status?: number } | null)?.status;
        if (isQuota) {
          setQuotaError(error.message);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (status === 402) {
          setExportSparr(true);
        } else if ((error as { name?: string } | null)?.name !== 'NamnKravsError') {
          setNedladdningsFel(nedladdningsFelForUndantag(error));
        }
      }
    },
    [onComplete, aktivtFormat, mall, val]
  );

  useEffect(() => {
    if (!registerPrimary) return;
    if (sparad) {
      registerPrimary(null);
      return;
    }
    const somWord = aktivtFormat === 'docx';
    const blockedReason = !isValid
      ? 'Fyll i namn, e-post och telefon samt minst en erfarenhet eller utbildning.'
      : isTemplateLocked
        ? PAKETRADER.mallSparr
        : somWord && wordLast
          ? `Word-filen ingår i ${PAKETRADER.bricka}.`
          : undefined;
    registerPrimary({
      label: somWord ? 'Spara och ladda ner Word' : KNAPP.sparaOchLaddaNer,
      onClick: () => handleAction('both'),
      disabled: !isValid || isTemplateLocked || (somWord && wordLast),
      blockedReason,
      error: nedladdningsFel ?? undefined,
    });
  }, [registerPrimary, sparad, isValid, isTemplateLocked, handleAction, aktivtFormat, wordLast, nedladdningsFel]);

  useEffect(() => () => registerPrimary?.(null), [registerPrimary]);

  if (sparad) {
    return (
      <ConfirmationView
        onGoToATS={() => router.push('/dashboard/cv-analys')}
        onCreateNew={() => {
          window.location.href = '/dashboard/skapa-cv';
        }}
      />
    );
  }

  const gratis = MALL_KATALOG.find((m) => m.niva === 'gratis' && m.id === forslag.ids[0]) ?? MALL_KATALOG.find((m) => m.niva === 'gratis');

  return (
    <div className="space-y-4">
      <header>
        <p className="text-steg uppercase text-ink-3">Steg 7 av 7</p>
        <h2 className="mt-1.5 text-fraga text-ink-1">Hur ska ditt CV se ut?</h2>
        <p className="mt-1.5 text-sm leading-[22px] text-ink-2">Välj en mall och se resultatet innan du laddar ner.</p>
      </header>

      {quotaError && <PaywallCard variant="cv-antal" />}
      {exportSparr && <PaywallCard variant="cv-export" />}
      {!isValid && (
        <StatusRow tone="warm" showDot label="Ditt CV är inte komplett">
          Kontaktuppgifter och minst en erfarenhet eller utbildning saknas.
        </StatusRow>
      )}

      <Remsa
        katalog={MALL_KATALOG}
        vald={mall.id}
        foreslagna={forslag.ids}
        skal={SKAL[forslag.skal]}
        onValj={(id) => valjMall(id, 'tryck')}
        onAlla={() => setAlla(true)}
        last={isSaving}
      />
      <Dokument
        storlek="mellan"
        html={fv.html}
        laddar={fv.laddar}
        titel={`Ditt CV i mallen ${mall.namn}`}
        mall={mall}
        ordning={MALL_KATALOG}
        last={isSaving}
        lyft={isSaving}
        onSvep={(id) => valjMall(id, 'svep')}
        onRubrik={(s, text) => setRubrik({ sektion: s, text })}
        onAvsnitt={onGaTillSteg ? (s) => onGaTillSteg(STEG_FOR[s]) : undefined}
        onMatt={setMatning}
      />

      <Verktygsrad mall={mall} val={val} onVal={(v) => setVal(v)} last={isSaving} />

      <Mallrad mall={mall} harWord={!wordLast} />

      {isTemplateLocked && gratis ? (
        <button
          type="button"
          onClick={() => valjMall(gratis.id, 'tryck')}
          className="flex w-full items-center gap-3 rounded-xl border border-kant bg-papper p-2.5 text-left hover:border-ink-1"
        >
          <span className="relative block aspect-[210/297] w-10 shrink-0 overflow-hidden rounded-[3px] border border-kant bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gratis.bild.liten} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink-1">{KNAPP.gratisI(gratis.namn)}</span>
            <span className="block text-meta text-ink-3">{KNAPP.gratisUnder}</span>
          </span>
        </button>
      ) : null}

      <FormatVal format={aktivtFormat} onFormat={setFormat} mallHarWord={mall.word} kanWord={!wordLast} last={isSaving} />
      {aktivtFormat === 'docx' && wordLast ? <PaywallCard variant="cv-export-word" /> : null}

      <section className="rounded-xl border border-kant bg-papper p-4">
        <label htmlFor="cvName" className={LABEL}>
          CV-namn
        </label>
        <input
          id="cvName"
          value={cvName}
          onChange={(e) => setCvName(e.target.value)}
          placeholder="Namnge ditt CV"
          enterKeyHint="done"
          className={`${FIELD} ${FIELD_OK}`}
        />
        <p className="mt-1.5 text-meta text-ink-3">Sparas under Mina CV, där du kan redigera och ladda ner det igen.</p>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
        <button
          type="button"
          onClick={() => handleAction('download')}
          disabled={!isValid || isSaving || isTemplateLocked}
          className={`${LINK} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Bara ladda ner PDF
        </button>
        <button
          type="button"
          onClick={() => handleAction('save')}
          disabled={!isValid || isSaving}
          className={`${LINK} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Bara spara
        </button>
      </div>

      <AllaArk open={alla} onClose={() => setAlla(false)} katalog={MALL_KATALOG} vald={mall.id} foreslagna={forslag.ids} onValj={(id) => valjMall(id, 'lista')} />

      {rubrik ? (
        <RubrikArk
          sektion={rubrik.sektion}
          nuvarande={val.rubriker?.[rubrik.sektion] ?? rubrik.text}
          egenVald={Boolean(val.rubriker?.[rubrik.sektion])}
          onVal={(s, r, kalla) => {
            capture('rubrik_bytt', { template: mall.id, tier: mall.niva === 'gratis' ? 'free' : 'premium', sektion: s, val: r === null ? 'standard' : kalla, surface: 'byggare' });
            setVal((v) => {
              const rub = { ...(v.rubriker ?? {}) };
              if (r === null) delete rub[s];
              else rub[s] = r;
              return { ...v, rubriker: rub };
            });
          }}
          onClose={() => setRubrik(null)}
        />
      ) : null}

      {fil ? (
        <Final
          open
          onClose={() => {
            setFil(null);
            setSparad(true);
          }}
          fil={fil}
          mall={mall}
          format={aktivtFormat}
          sidor={matning?.sidor ?? 1}
          titel={metadata.personalInfo.title || metadata.experience[0]?.position}
          ort={metadata.personalInfo.address}
          surface="byggare"
        />
      ) : null}
    </div>
  );
}
