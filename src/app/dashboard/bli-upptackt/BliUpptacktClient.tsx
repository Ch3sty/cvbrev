'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Topprad from '@/components/rum/Topprad';
import { BLI_UPPTACKT } from '@/lib/rum/copy';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import {
  GlasKnapp,
  Golv,
  IkonBock,
  IkonLas,
  IkonLasUpp,
  IkonOga,
  IkonPil,
  JobbVagg,
  LyftPanel,
  PanelHuvud,
  Punkter,
  Spalter,
  StorKnapp,
  Strombrytare,
  TILLBAKA_JOBBSOKET,
  TonYta,
  VaggHero,
  VaggText,
} from '@/components/jobb3/kit';

import CvPickerCard from './components/CvPickerCard';
import VisibilityModeCard from './components/VisibilityModeCard';
import SectionCard, { StegKontext } from './components/SectionCard';
import { useCollapsedSections } from './hooks/useCollapsedSections';
import { AFTER_YES_ITEMS, HIDDEN_ITEMS, SHOWN_ITEMS } from './components/delas';
import StyrkorFraga from './components/StyrkorFraga';
import { SAMTYCKE_VERSION, STYRKOR_FRAGA_DATUM, STYRKOR_FRAGA_KEY, type StyrkorSvar } from './components/samtycke';
import type { CollapseProps } from './components/SectionCard';
import { FAMILY_LABELS, type CandidateProfileState, type FamilyKey, type SummaryData } from './components/types';
import type { BliUpptacktData } from './getPageData';

/**
 * Samtyckesdialogen öppnas först efter ett klick och syns aldrig i första
 * vyn. Den bär hela villkorstexten och förhandsvisningen av rapporten, så den
 * laddas separat i stället för att ligga i sidans första paket.
 */
const ConsentModal = dynamic(() => import('./components/ConsentModal'));

const PitchCard = dynamic(() => import('./components/PitchCard'), {
  loading: () => <div className="min-h-[120px]" aria-hidden="true" />,
});
const ContextTagsCard = dynamic(() => import('./components/ContextTagsCard'), {
  loading: () => <div className="min-h-[100px]" aria-hidden="true" />,
});
const TermsCard = dynamic(() => import('./components/TermsCard'), {
  loading: () => <div className="min-h-[160px]" aria-hidden="true" />,
});
const VerifiedResultsCard = dynamic(() => import('./components/VerifiedResultsCard'), {
  loading: () => <div className="min-h-[200px]" aria-hidden="true" />,
});
const RecruiterPreviewCard = dynamic(() => import('./components/RecruiterPreviewCard'), {
  loading: () => <div className="min-h-[280px]" aria-hidden="true" />,
});
const ProfileStrengthCard = dynamic(() => import('./components/ProfileStrengthCard'), {
  loading: () => <div className="min-h-[200px]" aria-hidden="true" />,
});
const LockedWorkStylePreview = dynamic(() => import('./components/LockedWorkStylePreview'), {
  loading: () => <div className="min-h-[220px]" aria-hidden="true" />,
});

type ProfilePatch = Partial<CandidateProfileState & { consent_version: string }>;

const TILLBAKA = { ...TILLBAKA_JOBBSOKET, ton: 'koppar' as const };

/** Talet i ord för panelens rubrik ("Fem av sex steg klara"). */
const ORD = ['Inga', 'Ett', 'Två', 'Tre', 'Fyra', 'Fem', 'Sex', 'Sju'];
const ORD_SMA = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju'];

/** Strecken bredvid panelens rubrik: ett per steg, ifyllt när det är klart. */
function Streck({ klara, av }: { klara: number; av: number }) {
  return (
    <span className="flex gap-1.5" role="img" aria-label={`${klara} av ${av} steg klara`}>
      {Array.from({ length: av }, (_, i) => (
        <i
          key={i}
          className="block h-3 w-[26px] rounded-md"
          style={i < klara ? { background: 'var(--j3-bock)' } : { boxShadow: 'inset 0 0 0 2px var(--koppar)' }}
        />
      ))}
    </span>
  );
}

/** Vad som saknas innan profilen kan synas, med väg dit. */
function Saknas({ saknas }: { saknas: { text: string; href: string }[] }) {
  return (
    <div className="j3-text" role="status">
      <p>
        <b>Innan du kan synas behöver profilen ett CV och en yrkesroll.</b>
      </p>
      <ul className="mt-1.5 space-y-1">
        {saknas.map((s) => (
          <li key={s.href}>
            {s.href.startsWith('#') ? (
              <a href={s.href} className="underline underline-offset-2">
                {s.text}
              </a>
            ) : (
              <Link href={s.href} className="underline underline-offset-2">
                {s.text}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Bli upptäckt (Jobbsöket omgång 1, skissen Upptackt och Upptackt-fore).
 * Kandidaten väljer CV, styr synlighet och anonymitet, anger villkor,
 * samlar verifierade resultat och ser exakt vad rekryterare ser.
 *
 * Logiken är dagens: startdata från servern, sparning direkt i
 * candidate_profiles (RLS släpper bara egna rader), samtycket i dagens
 * dialog med dagens texter. Bara formen runt dem är rummets: väggen med
 * strömbrytaren, panelen med stegen och spegeln bredvid.
 */
export default function BliUpptacktClient({ initialData, userId }: { initialData: BliUpptacktData; userId: string }) {
  const supabase = getSupabaseClient();
  const { isCollapsed, toggle } = useCollapsedSections(initialData.collapsedSections);
  const collapseFor = (key: string): CollapseProps => ({
    collapsible: true,
    collapsed: isCollapsed(key),
    onToggleCollapse: () => toggle(key),
  });

  const [profile, setProfile] = useState<CandidateProfileState>(initialData.profile);
  const [summary, setSummary] = useState<SummaryData | null>(initialData.summary);
  const [saving, setSaving] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentEverOpened, setConsentEverOpened] = useState(false);
  const openConsent = () => {
    setConsentEverOpened(true);
    setConsentOpen(true);
  };
  const [lastMode, setLastMode] = useState<'anonymous' | 'open'>(
    initialData.profile.visibility !== 'off' ? (initialData.profile.visibility as 'anonymous' | 'open') : 'anonymous'
  );

  const { fullName, cvs, interests, views } = initialData;

  // Frågan om sökbara styrkor till dem som samtyckte före 2026-11-22.
  const [styrkorFragaKvar, setStyrkorFragaKvar] = useState(initialData.styrkorFraga);
  const [svarSparas, setSvarSparas] = useState(false);

  /** Sparar svaret med tidpunkt, så att rutan aldrig kommer tillbaka. */
  const sparaStyrkorSvar = useCallback(
    async (svar: StyrkorSvar, kalla: 'rutan' | 'kortet') => {
      setStyrkorFragaKvar(false);
      if (!userId) return;
      const nu = new Date().toISOString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('user_ui_preferences').upsert(
        {
          user_id: userId,
          key: STYRKOR_FRAGA_KEY,
          value: { svar, svarat_at: nu, fraga: STYRKOR_FRAGA_DATUM, kalla },
          updated_at: nu,
        },
        { onConflict: 'user_id,key' }
      );
      if (error) console.error('Bli upptäckt: kunde inte spara svaret om styrkorna', error);
    },
    [supabase, userId]
  );

  const fetchSummary = useCallback(async (cvId: string | null) => {
    try {
      const url = cvId ? `/api/candidate/summary?cv_id=${encodeURIComponent(cvId)}` : '/api/candidate/summary';
      const res = await fetch(url);
      if (!res.ok) return;
      setSummary((await res.json()) as SummaryData);
    } catch (error) {
      console.error('Bli upptäckt: kunde inte hämta summary', error);
    }
  }, []);

  const saveProfile = useCallback(
    async (patch: ProfilePatch) => {
      setProfile((prev) => ({ ...prev, ...patch }));
      if (!userId) return;
      setSaving(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('candidate_profiles')
          .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        if (error) console.error('Bli upptäckt: kunde inte spara', error);
      } finally {
        setSaving(false);
      }
    },
    [supabase, userId]
  );

  // Synligheten går inte att slå på förrän profilen har ett valt CV och en
  // yrkesroll (ägarbeslut 2026-11-22). Poolen filtrerar dessutom bort sådana
  // profiler på servern, vad raden än säger.
  const roll = summary?.skills?.occupation?.trim() || null;
  const saknas: { text: string; href: string }[] = [];
  if (!profile.cv_id) {
    saknas.push(
      cvs.length === 0
        ? { text: 'Ladda upp ett CV', href: '/dashboard/profil/cv' }
        : { text: 'Välj vilket CV rekryterare ska se', href: '#cv' }
    );
  } else if (!roll) {
    saknas.push({
      text: 'Vi hittar ingen yrkesroll i CV:t. Analysera CV:t så hämtar vi roll och kompetenser.',
      href: '/dashboard/jobbmatchning',
    });
  }
  const kanSynas = saknas.length === 0;

  const handleMasterToggle = () => {
    if (profile.visibility === 'off') {
      if (!kanSynas) return;
      if (!profile.consent_given_at) openConsent();
      else saveProfile({ visibility: lastMode, cv_id: profile.cv_id });
    } else {
      setLastMode(profile.visibility as 'anonymous' | 'open');
      saveProfile({ visibility: 'off' });
    }
  };

  const handleConsentConfirm = async (showPersonality: boolean, showFullWorkstyle: boolean) => {
    await saveProfile({
      visibility: 'anonymous',
      // Ett förvalt CV (kontots enda) sparas här, tillsammans med samtycket.
      cv_id: profile.cv_id,
      show_personality: showPersonality,
      show_full_workstyle: showPersonality && showFullWorkstyle,
      consent_given_at: new Date().toISOString(),
      // v2: raden om styrkor säger att rekryterare kan söka på dem. Nya
      // samtycken får därför aldrig frågan i StyrkorFraga.
      consent_version: SAMTYCKE_VERSION,
    });
    setStyrkorFragaKvar(false);
    setLastMode('anonymous');
    setConsentOpen(false);
  };

  // Kontots enda CV är förvalt. Har kandidaten redan samtyckt sparas det
  // direkt, så att en redan synlig profil inte står utan CV i poolen.
  useEffect(() => {
    if (initialData.cvForvalt && initialData.profile.consent_given_at && initialData.profile.cv_id) {
      saveProfile({ cv_id: initialData.profile.cv_id });
    }
    // Bara vid första visningen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const svaraStyrkor = async (svar: StyrkorSvar) => {
    setSvarSparas(true);
    try {
      if (svar === 'sluta') await saveProfile({ show_personality: false, show_full_workstyle: false });
      await sparaStyrkorSvar(svar, 'rutan');
    } finally {
      setSvarSparas(false);
    }
  };

  // Slår kandidaten på styrkorna i kortet har hon läst den nya texten om
  // sökbarheten där; då ställs frågan inte.
  const patchResultat = (patch: Partial<CandidateProfileState>) => {
    if (patch.show_personality === true && styrkorFragaKvar) void sparaStyrkorSvar('fortsatt', 'kortet');
    saveProfile(patch);
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

  const samtycke = consentEverOpened ? (
    <ConsentModal
      open={consentOpen}
      saving={saving}
      hasAdvancedTest={Boolean(summary?.personality?.hasAdvancedTest && summary.personality.workStyleReport)}
      onConfirm={handleConsentConfirm}
      onCancel={() => setConsentOpen(false)}
    />
  ) : null;

  /* ------------------------------------------------ före samtycket */
  if (!profile.consent_given_at) {
    const steg = [
      { rubrik: 'Du väljer vad som visas', under: 'CV, villkor och en kort pitch.' },
      { rubrik: 'Rekryterare hittar profilen', under: 'De ser din bakgrund, inte vem du är.' },
      { rubrik: 'Du godkänner varje kontakt', under: 'Först då visas ditt namn.' },
    ];
    return (
      <>
        <JobbVagg hojd={420} hojdMobil={420} flik={null} tillbaka={TILLBAKA} atgarder={<Topprad bara="atgarder" />}>
          <VaggHero
            spalt={480}
            glapp={40}
            topp={8}
            bild={
              <ol className="j3c-trestag" aria-label="Så fungerar Bli upptäckt">
                {steg.map((s, i) => (
                  <li key={s.rubrik}>
                    <div>
                      <span aria-hidden="true">{i + 1}</span>
                      <b>{s.rubrik}</b>
                      <small>{s.under}</small>
                    </div>
                  </li>
                ))}
              </ol>
            }
          >
            <VaggText rubrik={BLI_UPPTACKT.rubrik} ingress={BLI_UPPTACKT.radFore} />
          </VaggHero>
        </JobbVagg>
        <Golv>
          <LyftPanel rubrikId="fore-rubrik" luft="24px 28px 28px">
            <PanelHuvud
              ogon="Innan du säger ja"
              rubrik="Bli synlig för rekryterare"
              rubrikId="fore-rubrik"
              hoger={<span className="j3-text">Du kan slå av synligheten när du vill.</span>}
            />
            <div className="mt-5 grid gap-3.5 xl:grid-cols-3">
              <TonYta>
                <div className="flex items-center gap-2.5 text-[var(--j3-bock)]">
                  <IkonOga size={22} />
                  <b className="j3c-kortrubrik">Det här visas</b>
                </div>
                <Punkter punkter={SHOWN_ITEMS.map((s) => ({ ikon: <IkonBock size={16} />, text: s }))} />
              </TonYta>
              <TonYta>
                <div className="flex items-start gap-2.5 text-[var(--j3-ink)]">
                  <IkonLasUpp size={20} className="mt-px shrink-0" />
                  <b className="j3c-kortrubrik [text-wrap:balance]">Visas först när du tackat ja till en kontakt</b>
                </div>
                <Punkter punkter={AFTER_YES_ITEMS.map((s) => ({ ikon: <IkonBock size={16} />, text: s }))} />
              </TonYta>
              <TonYta>
                <div className="flex items-center gap-2.5 text-[var(--j3-ink)]">
                  <IkonLas size={20} />
                  <b className="j3c-kortrubrik">Det här visas aldrig</b>
                </div>
                <Punkter punkter={HIDDEN_ITEMS.map((s) => ({ ikon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M6 12h12" /></svg>, text: s }))} />
              </TonYta>
            </div>
            {!kanSynas && !profile.cv_id && cvs.length > 1 ? (
              <div id="cv" className="mt-6 scroll-mt-24">
                <CvPickerCard cvs={cvs} selectedId={profile.cv_id} onSelect={handleSelectCv} />
              </div>
            ) : null}
            <div className="mt-6 flex flex-col gap-4 border-t-2 border-[var(--j3-linje)] pt-6 xl:flex-row xl:items-center xl:justify-between">
              {kanSynas ? (
                <p className="j3-text">
                  Nästa steg är att läsa igenom vad som delas. <b>Inget syns förrän du godkänt det.</b>
                </p>
              ) : (
                <Saknas saknas={saknas} />
              )}
              <StorKnapp golv storlek="mellan" onClick={handleMasterToggle} disabled={saving || !kanSynas}>
                Kom igång
                <IkonPil />
              </StorKnapp>
            </div>
          </LyftPanel>
          {samtycke}
        </Golv>
      </>
    );
  }

  /* ------------------------------------------------ efter samtycket */
  const synlig = profile.visibility !== 'off';
  const bryterRubrik = !synlig ? 'Inte sökbar' : profile.visibility === 'anonymous' ? 'Sökbar för rekryterare, anonym' : 'Sökbar för rekryterare, öppen';
  const harTaggar = (summary?.personality?.contextTagOptions?.length ?? 0) > 0;
  const termsDone = !!profile.availability && profile.regions.length > 0 && profile.workplace.length > 0;
  const resultatKlart =
    !!summary &&
    ((Object.keys(FAMILY_LABELS) as FamilyKey[]).some((k) => summary.results[k]?.done) || summary.personality.done);
  const stegLista: { nyckel: string; klar: boolean }[] = [
    { nyckel: 'cv', klar: !!profile.cv_id },
    { nyckel: 'synlighet', klar: synlig },
    { nyckel: 'villkor', klar: termsDone },
    { nyckel: 'pitch', klar: (profile.pitch ?? '').trim().length > 0 },
    ...(harTaggar ? [{ nyckel: 'kontexttaggar', klar: profile.context_tags.length > 0 }] : []),
    { nyckel: 'resultat', klar: resultatKlart },
  ];
  const nr = (nyckel: string) => stegLista.findIndex((s) => s.nyckel === nyckel) + 1;
  const klar = (nyckel: string) => stegLista.find((s) => s.nyckel === nyckel)?.klar ?? false;
  const antalKlara = stegLista.filter((s) => s.klar).length;
  const stegRubrik = antalKlara === stegLista.length ? 'Profilen är klar' : `${ORD[antalKlara] ?? antalKlara} av ${ORD_SMA[stegLista.length]} steg klara`;
  // En funktion, inte en komponent: en komponent definierad här skulle
  // monteras om vid varje sparning och tappa kortens egen state.
  const steg = (nyckel: string, kort: React.ReactNode, id?: string) => (
    <div key={nyckel} id={id} className="j3c-stegwrap scroll-mt-24">
      <StegKontext.Provider value={{ nr: nr(nyckel), klar: klar(nyckel) }}>{kort}</StegKontext.Provider>
    </div>
  );
  const tittat = synlig && views && views.total > 0 ? views.total : null;

  return (
    <>
      <JobbVagg
        hojd={472}
        hojdMobil={420}
        flik={null}
        tillbaka={TILLBAKA}
        handling={interests.total > 0 ? <GlasKnapp href="/dashboard/meddelanden">{interests.unread + interests.pending > 0 ? `Dina meddelanden (${interests.unread + interests.pending})` : 'Dina meddelanden'}</GlasKnapp> : undefined}
        atgarder={<Topprad bara="atgarder" />}
      >
        <VaggHero
          spalt={500}
          glapp={40}
          topp={8}
          bild={
            tittat || interests.pending > 0 ? (
              <div className="w-full xl:w-[580px]">
                {tittat ? (
                  <div className="j3c-tittat">
                    <span className="j3c-tittat-tal">{tittat}</span>
                    <span className="j3c-tittat-text">
                      {tittat === 1 ? 'visning' : 'visningar'}
                      <b>av profilen</b>
                    </span>
                  </div>
                ) : null}
                {interests.pending > 0 ? (
                  <div className="j3c-forfragan">
                    <div>
                      <p className="j3-ogon-golv">Väntar på ditt svar</p>
                      <b>{interests.pending === 1 ? 'En rekryterare vill komma i kontakt' : `${interests.pending} rekryterare vill komma i kontakt`}</b>
                    </div>
                    <StorKnapp storlek="lag" href="/dashboard/meddelanden">
                      Öppna förfrågan
                      <IkonPil size={18} />
                    </StorKnapp>
                  </div>
                ) : null}
              </div>
            ) : undefined
          }
        >
          <VaggText
            rubrik={BLI_UPPTACKT.rubrik}
            ingress={synlig ? [BLI_UPPTACKT.radEfter, views && views.total > 0 ? BLI_UPPTACKT.tittat(views.total) : null].filter(Boolean).join(' ') : BLI_UPPTACKT.radFore}
          />
          <div className="mt-6 xl:mt-7">
            <Strombrytare
              pa={synlig}
              rubrik={bryterRubrik}
              text={
                !kanSynas
                  ? synlig
                    ? 'Rekryterare ser inte profilen förrän den har ett CV och en yrkesroll.'
                    : 'Profilen behöver ett CV och en yrkesroll innan du kan synas.'
                  : synlig
                    ? 'Slå av när du vill. Då syns du inte alls.'
                    : 'Slå på för att synas i kandidatpoolen igen.'
              }
              onClick={handleMasterToggle}
              disabled={saving || (!synlig && !kanSynas)}
            />
            {!kanSynas ? (
              <div className="mt-4">
                <Saknas saknas={saknas} />
              </div>
            ) : null}
          </div>
        </VaggHero>
      </JobbVagg>

      <Golv>
        <Spalter sido={420} tat>
          <div>
            <LyftPanel rubrikId="bygg-rubrik" luft="22px 28px 28px">
              <PanelHuvud ogon="Bygg din profil" rubrik={stegRubrik} rubrikId="bygg-rubrik" hoger={<Streck klara={antalKlara} av={stegLista.length} />} hogerAlltid mitt />
              {/* Frågan om sökbara styrkor, en gång, överst i panelen. */}
              {styrkorFragaKvar && profile.show_personality ? (
                <div className="mt-4">
                  <StyrkorFraga avancerad={Boolean(summary?.personality?.hasAdvancedTest)} sparar={svarSparas} onSvar={svaraStyrkor} />
                </div>
              ) : null}
              <div className="mt-3">
                {steg('cv', <CvPickerCard cvs={cvs} selectedId={profile.cv_id} onSelect={handleSelectCv} collapse={collapseFor('cv')} />, 'cv')}
                {steg('synlighet', <VisibilityModeCard visibility={profile.visibility} lastMode={lastMode} onChange={handleModeChange} collapse={collapseFor('synlighet')} />)}
                {steg('villkor', <TermsCard profile={profile} onPatch={saveProfile} collapse={collapseFor('villkor')} />, 'villkor')}
                {steg('pitch', <PitchCard pitch={profile.pitch} onSave={(pitch) => saveProfile({ pitch })} collapse={collapseFor('pitch')} />, 'pitch')}
                {harTaggar
                  ? steg('kontexttaggar', <ContextTagsCard options={summary!.personality.contextTagOptions} selected={profile.context_tags} onChange={(context_tags) => saveProfile({ context_tags })} />, 'kontexttaggar')
                  : null}
                {steg('resultat', <VerifiedResultsCard summary={summary} profile={profile} onPatch={patchResultat} collapse={collapseFor('arbetsstil')} />, 'arbetsstilsrapport')}
              </div>
            </LyftPanel>

            {summary && !summary.personality.hasAdvancedTest ? (
              <div className="mt-[30px] xl:mt-10">
                <SectionCard
                  title="Din arbetsstilsrapport väntar"
                  sub="Det fördjupade testet bygger en rapport i ord om hur du arbetar, samarbetar och drivs. Du väljer själv om rekryterare får se den."
                >
                  <LockedWorkStylePreview />
                </SectionCard>
              </div>
            ) : null}
          </div>

          <aside className="mt-[30px] flex flex-col gap-6 self-start xl:sticky xl:top-6 xl:mt-[52px]" aria-label="Så syns du">
            <RecruiterPreviewCard profile={profile} summary={summary} cvs={cvs} fullName={fullName} lastMode={lastMode} />
            <ProfileStrengthCard profile={profile} summary={summary} views={views} />
          </aside>
        </Spalter>
        {samtycke}
      </Golv>
    </>
  );
}
