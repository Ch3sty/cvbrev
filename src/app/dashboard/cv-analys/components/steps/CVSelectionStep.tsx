'use client';

import Link from 'next/link';
import { Upload, Lock } from 'lucide-react';
import { formatCVDate } from '@/lib/utils/date-formatter';

import ChoiceCard from '@/components/shell/ChoiceCard';
import EmptyState from '@/components/shell/EmptyState';
import { IlluTomMapp } from '@/components/illustrations/TradenScener';
import { IkonCv } from '@/components/illustrations/Ikoner';

interface CVSelectionStepProps {
  cvs: any[];
  selectedCV: string | null;
  onSelectCV: (cvId: string) => void;
  /**
   * Id på CV som är låsta av CV-kvoten. Förut räknade steget ut det själv med
   * useCvQuota, alltså ett auth.getUser() över nätet följt av två frågor,
   * efter att wizarden redan monterat. Kvotregeln är oförändrad, den räknas nu
   * på servern i getCvAnalysData och skickas hit.
   */
  lockedCvIds: Set<string>;
}

/**
 * Steg 0: Välj vilket CV som ska analyseras.
 *
 * Bort: kort med två kanter, grön bock som roterade in, dokumentmönster i
 * bakgrunden och en fot som bytte färg mellan orange och grönt. Valet ritas
 * nu av ChoiceCard, alltså kant i ink och en fylld bock.
 */
export default function CVSelectionStep({
  cvs,
  selectedCV,
  onSelectCV,
  lockedCvIds,
}: CVSelectionStepProps) {
  if (!cvs || cvs.length === 0) {
    return (
      <EmptyState
        illustration={IlluTomMapp}
        title="Inga CV hittades"
        description="Du behöver minst ett CV för att kunna göra en analys."
        action={
          <Link
            href="/dashboard/profil/cv"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
          >
            Ladda upp CV
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {cvs.map((cv) => {
          const locked = lockedCvIds.has(cv.id);
          return (
            <ChoiceCard
              key={cv.id}
              variant="plain"
              selected={selectedCV === cv.id}
              onSelect={() => {
                if (!locked) onSelectCV(cv.id);
              }}
              leading={
                locked ? (
                  <Lock className="h-6 w-6 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <IkonCv />
                )
              }
              title={cv.file_name}
              meta={formatCVDate(cv.created_at)}
              description={
                locked
                  ? 'Låst tills du uppgraderar till Premium.'
                  : undefined
              }
            />
          );
        })}
      </div>

      {/* Subtil länk till uppladdning */}
      <Link
        href="/dashboard/profil/cv"
        className="flex items-center gap-3 rounded-xl border border-kant bg-panel px-4 py-3 transition-colors hover:border-kant-stark"
      >
        <Upload className="h-6 w-6 flex-shrink-0 text-ink-2" strokeWidth={1.75} aria-hidden="true" />
        <span className="min-w-0">
          <span className="block text-kort text-ink-1">Ladda upp ett nytt CV</span>
          <span className="block text-meta text-ink-3">Tar dig till Mina CV</span>
        </span>
      </Link>
    </div>
  );
}
