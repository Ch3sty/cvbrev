'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

import MasterHeader from './components/MasterHeader';
import CvPickerCard from './components/CvPickerCard';
import VisibilityModeCard from './components/VisibilityModeCard';
import TermsCard from './components/TermsCard';
import PitchCard from './components/PitchCard';
import VerifiedResultsCard from './components/VerifiedResultsCard';
import ContextTagsCard from './components/ContextTagsCard';
import SectionCard from './components/SectionCard';
import ProfileStrengthCard from './components/ProfileStrengthCard';
import RecruiterPreviewCard from './components/RecruiterPreviewCard';
import PendingInterestAlert from './components/PendingInterestAlert';
import MessagesShortcut from './components/MessagesShortcut';
import { useCollapsedSections } from './hooks/useCollapsedSections';
import { IlluBliUpptackt } from '@/components/illustrations/BliUpptacktIllustrations';
import type { CollapseProps } from './components/SectionCard';
import {
  type CandidateProfileState,
  type SummaryData,
} from './components/types';
import type { BliUpptacktData } from './getPageData';

/**
 * Samtyckesdialogen öppnas först efter ett klick och syns aldrig i första
 * vyn. Den bär hela villkorstexten och förhandsvisningen av rapporten, så den
 * laddas separat i stället för att ligga i sidans första paket.
 */
const ConsentModal = dynamic(() => import('./components/ConsentModal'));

/**
 * Den låsta förhandsvisningen ligger längst ned i vänsterkolumnen, under
 * flera kort, och syns aldrig utan att kandidaten scrollar. Höjden reserveras
 * nedan så inget hoppar när den landar.
 */
const LockedWorkStylePreview = dynamic(
  () => import('./components/LockedWorkStylePreview'),
  { loading: () => <div className="min-h-[220px]" aria-hidden="true" /> }
);

// Fält vi läser/skriver i candidate_profiles. consent_version skrivs bara
// tillsammans med consent_given_at och behöver inte ligga i UI-staten.
type ProfilePatch = Partial<CandidateProfileState & { consent_version: string }>;

/**
 * Bli upptäckt: kandidatprofil-sidan i dashboarden. Användaren väljer vilket
 * CV som driver profilen, styr synlighet och anonymitet, anger villkor,
 * samlar verifierade testresultat och förhandsgranskar exakt vad rekryterare
 * ser. Sidan är alltid redigerbar, även när mastern är av kan användaren
 * förbereda profilen inför aktivering.
 *
 * All startdata kommer som props från page.tsx, som läste den på servern.
 * Sidan hämtar bara om underlaget när kandidaten byter CV, och det är ett
 * medvetet klick, inte något som blockerar första vyn.
 */
export default function BliUpptacktClient({
  initialData,
  userId,
}: {
  initialData: BliUpptacktData;
  userId: string;
}) {
  const supabase = getSupabaseClient();
  const { isCollapsed, toggle } = useCollapsedSections(initialData.collapsedSections);

  // Hjälpare: bygg collapse-propsen för ett hopfällbart kort ur dess nyckel.
  const collapseFor = (key: string): CollapseProps => ({
    collapsible: true,
    collapsed: isCollapsed(key),
    onToggleCollapse: () => toggle(key),
  });

  const [profile, setProfile] = useState<CandidateProfileState>(initialData.profile);
  const [summary, setSummary] = useState<SummaryData | null>(initialData.summary);
  const [saving, setSaving] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  // Dialogen laddas först vid första öppningen och förblir sedan monterad, så
  // att dess egen AnimatePresence får spela ut stängningen som förut.
  const [consentEverOpened, setConsentEverOpened] = useState(false);
  const openConsent = () => {
    setConsentEverOpened(true);
    setConsentOpen(true);
  };
  // Senaste synliga läget, så mastern kan toggla tillbaka till rätt läge.
  const [lastMode, setLastMode] = useState<'anonymous' | 'open'>(
    initialData.profile.visibility !== 'off'
      ? (initialData.profile.visibility as 'anonymous' | 'open')
      : 'anonymous'
  );

  const { fullName, cvs, interests, views } = initialData;

  // Byter kandidaten CV ändras underlaget, och då hämtar vi om det. Det är
  // enda kvarvarande klienthämtningen, och den sker efter ett klick.
  const fetchSummary = useCallback(async (cvId: string | null) => {
    try {
      const url = cvId
        ? `/api/candidate/summary?cv_id=${encodeURIComponent(cvId)}`
        : '/api/candidate/summary';
      const res = await fetch(url);
      if (!res.ok) return;
      const data = (await res.json()) as SummaryData;
      setSummary(data);
    } catch (error) {
      console.error('Bli upptäckt: kunde inte hämta summary', error);
    }
  }, []);

  // Upsert: skriv patchen direkt (RLS släpper bara igenom egna rader).
  const saveProfile = useCallback(
    async (patch: ProfilePatch) => {
      setProfile((prev) => ({ ...prev, ...patch }));
      if (!userId) return;
      setSaving(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('candidate_profiles')
          .upsert(
            { user_id: userId, ...patch, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          );
        if (error) console.error('Bli upptäckt: kunde inte spara', error);
      } finally {
        setSaving(false);
      }
    },
    [supabase, userId]
  );

  const handleMasterToggle = () => {
    if (profile.visibility === 'off') {
      // Första aktiveringen kräver samtycke, därefter räcker en vanlig toggle.
      if (!profile.consent_given_at) {
        openConsent();
      } else {
        saveProfile({ visibility: lastMode });
      }
    } else {
      setLastMode(profile.visibility as 'anonymous' | 'open');
      saveProfile({ visibility: 'off' });
    }
  };

  const handleConsentConfirm = async (showPersonality: boolean, showFullWorkstyle: boolean) => {
    await saveProfile({
      visibility: 'anonymous',
      show_personality: showPersonality,
      // Nivå 2 utan nivå 1 är meningslöst, bind dem även vid skrivning.
      show_full_workstyle: showPersonality && showFullWorkstyle,
      consent_given_at: new Date().toISOString(),
      consent_version: 'v1',
    });
    setLastMode('anonymous');
    setConsentOpen(false);
  };

  const handleSelectCv = (cvId: string) => {
    saveProfile({ cv_id: cvId });
    fetchSummary(cvId);
  };

  const handleModeChange = (mode: 'anonymous' | 'open') => {
    if (profile.visibility === 'off') return;
    setLastMode(mode);
    saveProfile({ visibility: mode });
  };

  // Tomt tillstånd (plan avsnitt 5): den som aldrig aktiverat profilen mötte
  // tidigare hela redigeringsvyn på en gång, alltså ett tjugotal "Inte gjort",
  // "Ej synlig", hänglås och en nolla i procent innan hon ens sagt ja till
  // något. Nu: en illustration, en mening, en knapp. Resten av sidan finns
  // kvar och öppnas i samma ögonblick som samtycket är givet.
  if (!profile.consent_given_at) {
    return (
      <div className="mx-auto py-4 sm:py-6 max-w-3xl">
        <section className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 text-center">
          <span className="inline-block text-neutral-900" aria-hidden="true">
            <IlluBliUpptackt size={96} />
          </span>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mt-4">
            Låt jobben hitta dig
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed mt-2 max-w-prose mx-auto">
            Rekryterare som söker din bakgrund kan hitta dig i kandidatpoolen.
            Du är anonym tills du själv godkänner en kontakt, och du stänger av
            synligheten när du vill.
          </p>
          <button
            type="button"
            onClick={handleMasterToggle}
            disabled={saving}
            className="mt-6 inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors w-full sm:w-auto disabled:opacity-60"
          >
            Kom igång
          </button>
          <p className="text-xs text-neutral-500 mt-3">
            Nästa steg är att läsa igenom vad som delas. Inget syns förrän du
            godkänt det.
          </p>
        </section>

        {consentEverOpened && (
          <ConsentModal
            open={consentOpen}
            saving={saving}
            hasAdvancedTest={Boolean(
              summary?.personality?.hasAdvancedTest && summary.personality.workStyleReport
            )}
            onConfirm={handleConsentConfirm}
            onCancel={() => setConsentOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 sm:py-6 max-w-6xl">
      {/* Full bredd överst: master, larm, genväg till meddelanden */}
      <div className="space-y-4 sm:space-y-5">
        <MasterHeader
          visibility={profile.visibility}
          saving={saving}
          onToggle={handleMasterToggle}
        />

        {/* Prioriterat larm: obesvarade intressen syns direkt, längst upp. */}
        <PendingInterestAlert pending={interests.pending} />

        {/* Meddelanden ligger högt upp, det är målet med hela sidan. */}
        <MessagesShortcut
          pending={interests.pending}
          unread={interests.unread}
          total={interests.total}
        />
      </div>

      {/* Tvåkolumns: bygg profilen till vänster, se hur du syns till höger */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_372px] gap-6 items-start">
        {/* VÄNSTER: redigering */}
        <div className="flex flex-col gap-4">
          <ZoneLabel>Bygg din profil</ZoneLabel>

          <CvPickerCard
            cvs={cvs}
            selectedId={profile.cv_id}
            onSelect={handleSelectCv}
            collapse={collapseFor('cv')}
          />

          <VisibilityModeCard
            visibility={profile.visibility}
            lastMode={lastMode}
            onChange={handleModeChange}
            collapse={collapseFor('synlighet')}
          />

          <div id="villkor" className="scroll-mt-24">
            <TermsCard profile={profile} onPatch={saveProfile} collapse={collapseFor('villkor')} />
          </div>

          <div id="pitch" className="scroll-mt-24">
            <PitchCard
              pitch={profile.pitch}
              onSave={(pitch) => saveProfile({ pitch })}
              collapse={collapseFor('pitch')}
            />
          </div>

          {/* Kontexttaggar: bara när kandidaten har kvalificerade förslag */}
          {(summary?.personality?.contextTagOptions?.length ?? 0) > 0 && (
            <div id="kontexttaggar" className="scroll-mt-24">
              <ContextTagsCard
                options={summary!.personality.contextTagOptions}
                selected={profile.context_tags}
                onChange={(context_tags) => saveProfile({ context_tags })}
              />
            </div>
          )}

          <div id="arbetsstilsrapport" className="scroll-mt-24">
            <VerifiedResultsCard
              summary={summary}
              profile={profile}
              onPatch={saveProfile}
              collapse={collapseFor('arbetsstil')}
            />
          </div>

          {/* Grundtestare: låst förhandsvisning av rapporten som konverteringsyta */}
          {summary && !summary.personality.hasAdvancedTest && (
            <SectionCard
              title="Din arbetsstilsrapport väntar"
              sub="Det fördjupade testet bygger en rapport i ord om hur du arbetar, samarbetar och drivs. Du väljer själv om rekryterare får se den."
              delay={0.22}
            >
              <LockedWorkStylePreview />
            </SectionCard>
          )}
        </div>

        {/* HÖGER: spegel som följer med när du scrollar */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6 self-start">
          <ZoneLabel>Så syns du</ZoneLabel>

          <RecruiterPreviewCard
            profile={profile}
            summary={summary}
            cvs={cvs}
            fullName={fullName}
            lastMode={lastMode}
          />

          <ProfileStrengthCard profile={profile} summary={summary} views={views} />
        </div>
      </div>

      {consentEverOpened && (
        <ConsentModal
          open={consentOpen}
          saving={saving}
          hasAdvancedTest={Boolean(
            summary?.personality?.hasAdvancedTest && summary.personality.workStyleReport
          )}
          onConfirm={handleConsentConfirm}
          onCancel={() => setConsentOpen(false)}
        />
      )}
    </div>
  );
}

/** Tunn zonrubrik som delar sidan i begripliga delar. */
function ZoneLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-0.5 pt-1">
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{children}</h2>
      <span className="flex-1 h-px bg-neutral-200" aria-hidden="true" />
    </div>
  );
}
