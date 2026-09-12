'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { useCvQuota } from '@/hooks/useCvQuota';

import MasterHeader from './components/MasterHeader';
import ConsentModal from './components/ConsentModal';
import CvPickerCard from './components/CvPickerCard';
import VisibilityModeCard from './components/VisibilityModeCard';
import TermsCard from './components/TermsCard';
import PitchCard from './components/PitchCard';
import VerifiedResultsCard from './components/VerifiedResultsCard';
import ContextTagsCard from './components/ContextTagsCard';
import LockedWorkStylePreview from './components/LockedWorkStylePreview';
import SectionCard from './components/SectionCard';
import ProfileStrengthCard from './components/ProfileStrengthCard';
import RecruiterPreviewCard from './components/RecruiterPreviewCard';
import PendingInterestAlert from './components/PendingInterestAlert';
import MessagesShortcut from './components/MessagesShortcut';
import { useCollapsedSections } from './hooks/useCollapsedSections';
import { IlluBliUpptackt } from '@/components/illustrations/BliUpptacktIllustrations';
import type { CollapseProps } from './components/SectionCard';
import {
  EMPTY_PROFILE,
  type CandidateProfileState,
  type CvOption,
  type SummaryData,
} from './components/types';

// Fält vi läser/skriver i candidate_profiles. consent_version skrivs bara
// tillsammans med consent_given_at och behöver inte ligga i UI-staten.
type ProfilePatch = Partial<CandidateProfileState & { consent_version: string }>;

/**
 * Bli upptäckt: kandidatprofil-sidan i dashboarden. Användaren väljer vilket
 * CV som driver profilen, styr synlighet och anonymitet, anger villkor,
 * samlar verifierade testresultat och förhandsgranskar exakt vad rekryterare
 * ser. Sidan är alltid redigerbar, även när mastern är av kan användaren
 * förbereda profilen inför aktivering.
 */
export default function BliUpptacktPage() {
  const supabase = getSupabaseClient();
  const { lockedCvIds } = useCvQuota();
  const { isCollapsed, toggle } = useCollapsedSections();

  // Hjälpare: bygg collapse-propsen för ett hopfällbart kort ur dess nyckel.
  const collapseFor = (key: string): CollapseProps => ({
    collapsible: true,
    collapsed: isCollapsed(key),
    onToggleCollapse: () => toggle(key),
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [profile, setProfile] = useState<CandidateProfileState>(EMPTY_PROFILE);
  const [cvs, setCvs] = useState<Array<Omit<CvOption, 'isLocked'>>>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  // Senaste synliga läget, så mastern kan toggla tillbaka till rätt läge.
  const [lastMode, setLastMode] = useState<'anonymous' | 'open'>('anonymous');

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

  // Ladda allt vid mount: användare, namn, kandidatprofil, CV-lista, summary.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          if (!cancelled) setLoading(false);
          return;
        }
        if (cancelled) return;
        setUserId(user.id);

        const [profileRes, candidateRes, cvRes] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
          (supabase as any)
            .from('candidate_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('cv_texts')
            .select('id, file_name, created_at, updated_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        ]);

        if (cancelled) return;

        setFullName(profileRes.data?.full_name ?? null);
        setCvs(
          (cvRes.data ?? []).map((cv) => ({
            id: cv.id,
            file_name: cv.file_name,
            created_at: cv.created_at ?? '',
            updated_at: cv.updated_at,
          }))
        );

        const row = candidateRes.data as Record<string, unknown> | null;
        let cvId: string | null = null;
        if (row) {
          const loaded: CandidateProfileState = {
            cv_id: (row.cv_id as string | null) ?? null,
            visibility: (row.visibility as CandidateProfileState['visibility']) ?? 'off',
            show_personality: Boolean(row.show_personality),
            show_full_workstyle: Boolean(row.show_full_workstyle),
            context_tags: (row.context_tags as string[] | null) ?? [],
            availability: (row.availability as CandidateProfileState['availability']) ?? null,
            workplace: (row.workplace as string[] | null) ?? [],
            extent: (row.extent as string[] | null) ?? [],
            employment_types: (row.employment_types as string[] | null) ?? [],
            regions: (row.regions as string[] | null) ?? [],
            drivers_license: Boolean(row.drivers_license),
            salary_min: (row.salary_min as number | null) ?? null,
            salary_max: (row.salary_max as number | null) ?? null,
            pitch: (row.pitch as string | null) ?? null,
            consent_given_at: (row.consent_given_at as string | null) ?? null,
          };
          setProfile(loaded);
          if (loaded.visibility !== 'off') setLastMode(loaded.visibility);
          cvId = loaded.cv_id;
        }

        await fetchSummary(cvId);
      } catch (error) {
        console.error('Bli upptäckt: kunde inte ladda sidan', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, fetchSummary]);

  // Upsert: skriv patchen direkt (RLS släpper bara igenom egna rader).
  const saveProfile = useCallback(
    async (patch: ProfilePatch) => {
      setProfile((prev) => ({ ...prev, ...patch }));
      if (!userId) return;
      setSaving(true);
      try {
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
        setConsentOpen(true);
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

  const cvOptions: CvOption[] = cvs.map((cv) => ({
    ...cv,
    isLocked: lockedCvIds.has(cv.id),
  }));

  if (loading) {
    // Samma maxbredd som den riktiga sidan, annars hoppar layouten när
    // skelettet byts mot innehåll.
    return (
      <div className="mx-auto py-4 sm:py-6 max-w-6xl">
        <div className="space-y-6">
          <div className="rounded-xl bg-neutral-100 h-32 animate-pulse" />
          <div className="rounded-xl bg-neutral-100 h-40 animate-pulse" />
          <div className="rounded-xl bg-neutral-100 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

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

        <ConsentModal
          open={consentOpen}
          saving={saving}
          hasAdvancedTest={Boolean(
            summary?.personality?.hasAdvancedTest && summary.personality.workStyleReport
          )}
          onConfirm={handleConsentConfirm}
          onCancel={() => setConsentOpen(false)}
        />
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
        <PendingInterestAlert />

        {/* Meddelanden ligger högt upp, det är målet med hela sidan. */}
        <MessagesShortcut />
      </div>

      {/* Tvåkolumns: bygg profilen till vänster, se hur du syns till höger */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_372px] gap-6 items-start">
        {/* VÄNSTER: redigering */}
        <div className="flex flex-col gap-4">
          <ZoneLabel>Bygg din profil</ZoneLabel>

          <CvPickerCard
            cvs={cvOptions}
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
            cvs={cvOptions}
            fullName={fullName}
            lastMode={lastMode}
          />

          <ProfileStrengthCard profile={profile} summary={summary} />
        </div>
      </div>

      <ConsentModal
        open={consentOpen}
        saving={saving}
        hasAdvancedTest={Boolean(
          summary?.personality?.hasAdvancedTest && summary.personality.workStyleReport
        )}
        onConfirm={handleConsentConfirm}
        onCancel={() => setConsentOpen(false)}
      />
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
