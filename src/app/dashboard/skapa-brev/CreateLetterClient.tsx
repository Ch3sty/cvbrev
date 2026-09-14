'use client';

/**
 * Klientdelen av skapa brev.
 *
 * Exakt samma flöde som tidigare låg i page.tsx: sex steg, steget i URL:en,
 * autosparade utkast, mallval, förhandsvisning och betalvägg. Det som skiljer
 * är varifrån CV-listan kommer. Den skickas in som prop från server-
 * komponenten och finns alltså vid allra första render, så steg 1 har riktigt
 * innehåll direkt i stället för en snurra som väntar på tre seriella frågor.
 *
 * Kvoter och premiumgrader läses fortfarande ur useProfile, som i sin tur
 * läser den delade summaryn från dashboard-layouten. Ingen ny hämtning för
 * data som redan ligger där.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import { useCVStore } from '@/store/cv-store';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';
import PaywallCard from '@/components/paywall/PaywallCard';
import { coverLetterPrefill, type CoverLetterPrefillData } from '@/store/cover-letter-store';
import { useNotification } from '@/context/notificationcontext';

import LetterFlowLayout from './components/LetterFlowLayout';
import LetterFlowSummary from './components/LetterFlowSummary';
import FlowShell from '@/components/shell/FlowShell';
import FlowError from '@/components/shell/FlowError';
import FlowResumeBanner from '@/components/shell/FlowResumeBanner';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import Confirmation from '@/components/shell/Confirmation';
// Frågan ställs bara den gång brevet lämnas osparat. Ingen anledning att
// ladda dialogen med flödet.
const ConfirmDialog = dynamic(() => import('@/components/shell/ConfirmDialog'), {
  ssr: false,
});
import { useFlowStep } from '@/lib/flow/useFlowStep';
import {
  loadDraft,
  saveDraft,
  clearDraft,
  purgeExpiredDrafts,
  type FlowDraft,
} from '@/lib/flow/draft';
import PrefillBadgeCard from './components/PrefillBadgeCard';
import CVSelectionStep from './components/steps/CVSelectionStep';

/** Raden som CV-väljaren behöver. Inte hela cv_texts: cv_text är brödtexten. */
export interface InitialCv {
  id: string;
  file_name: string;
  created_at: string;
}

/* Platshållaren håller samma yta som ett riktigt stegkort medan chunken
   hämtas, så att bytet inte puttar något. Skelettet står stilla, bara
   tråden längs överkanten rör sig. */
function StepSkeleton() {
  return (
    <div
      className="loading-thread rounded-xl border border-kant bg-panel p-4"
      style={{ minHeight: 320 }}
      aria-hidden="true"
    />
  );
}

/* Varje steg ställer en fråga som rubrik (22 px), med stegetiketten ovanför. */
function StepHead({ step, total, question }: { step: number; total: number; question: string }) {
  return (
    <header className="mb-4">
      <p className="text-steg uppercase text-ink-3">
        Steg {step} av {total}
      </p>
      <h2 className="mt-1.5 text-fraga text-ink-1">{question}</h2>
    </header>
  );
}

const STEP_QUESTIONS = [
  'Vilket CV ska brevet utgå från?',
  'Vilken tjänst söker du?',
  'Hur ska brevet se ut?',
  'Hur ska brevet låta?',
  'Stämmer allt?',
];

/* Bara steg 1 finns i första vyn. Resten av flödet laddas när användaren
   faktiskt kommer dit, i stället för att ligga i samma paket som det hon ser
   direkt. Ingen ssr: allt här är klientinteraktion, och en serverrendering av
   steg hon ännu inte nått hade bara kostat tid. */
const JobDescriptionStep = dynamic(() => import('./components/steps/JobDescriptionStep'), {
  ssr: false,
  loading: () => <StepSkeleton />,
});
const TemplateStep = dynamic(() => import('./components/steps/TemplateStep'), {
  ssr: false,
  loading: () => <StepSkeleton />,
});
const TonalityLanguageStep = dynamic(() => import('./components/steps/TonalityLanguageStep'), {
  ssr: false,
  loading: () => <StepSkeleton />,
});
const PreviewStep = dynamic(() => import('./components/steps/PreviewStep'), {
  ssr: false,
  loading: () => <StepSkeleton />,
});
import { type FontId } from './components/FontSelector';
import OnboardingNextStep from '@/components/dashboard/OnboardingNextStep';
import { requestInstallPrompt } from '@/lib/pwa/installPrompt';

type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto';
type Language = 'sv' | 'en';

/** Steg 1 CV, 2 annons, 3 mall, 4 ton, 5 granska och skapa, 6 resultat. */
const LETTER_FLOW_TOTAL_STEPS = 6;
const LETTER_FLOW_NAME = 'skapa-brev';
/** Höjs när formen nedan ändras, då kastas gamla utkast i stället för att krocka. */
const LETTER_FLOW_VERSION = 1;

interface LetterDraftData {
  selectedCV: string | null;
  jobDescription: string;
  tonality: Tonality;
  language: Language;
  templateId: string;
  selectedFont: FontId;
  headerPhone: string;
  headerLocation: string;
}

export default function CreateLetterClient({
  initialCvs,
  initialLockedCvIds,
  initialIsPremium,
}: {
  initialCvs: InitialCv[];
  initialLockedCvIds: string[];
  initialIsPremium: boolean;
}) {
  const router = useRouter();
  /* CV-listan kommer server-hämtad. Storen hålls ändå i synk, eftersom andra
     vyer i flödet (och uppladdning från en annan flik) läser ur den. Den
     synkningen ligger i en effekt nedan och blockerar aldrig första render. */
  const { fetchCVs, cvs: storeCvs } = useCVStore();
  /* skipInitialFetch: flödet visar aldrig brevlistan, det skapar ett nytt
     brev. Hämtningen låg ändå på den kritiska vägen vid sidladdning.
     refreshLetters anropas fortfarande efter en sparning, så listan är
     uppdaterad när användaren går vidare till Mina brev. */
  const { createLetter, saveLetter, isGenerating, refreshLetters } = useLetters({
    skipInitialFetch: true,
  });
  const {
    subscriptionTier,
    profile,
    updateProfile,
    loading: profileLoading,
  } = useProfile();

  /* Serverlistan är sanningen vid första render. Så fort storen har hunnit
     hämta om (efter en uppladdning, eller vid klientnavigering hit) tar den
     över, så att en ny uppladdning syns utan omladdning. */
  const [cvsRefreshed, setCvsRefreshed] = useState(false);
  const cvs = cvsRefreshed ? storeCvs : initialCvs;
  const cvCount = cvs.length;

  const lockedCvIds = useRef(new Set(initialLockedCvIds)).current;

  // B3: brevhuvudets kontaktuppgifter. Samlas in här i stället för vid
  // registrering, där de bara var friktion. Båda är valfria.
  const [headerPhone, setHeaderPhone] = useState('');
  const [headerLocation, setHeaderLocation] = useState('');
  // Förifyll när profilen laddats, men skriv aldrig över något användaren
  // redan hunnit ändra i fältet.
  const prefilledContactRef = useRef(false);
  useEffect(() => {
    if (prefilledContactRef.current || !profile) return;
    prefilledContactRef.current = true;
    setHeaderPhone(profile.phone || '');
    setHeaderLocation(profile.location || '');
  }, [profile]);
  const { successWithMascotAndActivity, logActivity } = useNotification();

  // Synkron prefill-läsning – module-level cache klarar dubbel-mount.
  const [prefillData] = useState<CoverLetterPrefillData | null>(() =>
    coverLetterPrefill.consume()
  );

  /* Hård gating: utan CV → tillbaka till CV-uppladdning. Servern har redan
     räknat listan, så beslutet kan tas direkt utan att först vänta in en
     klienthämtning. */
  useEffect(() => {
    if (cvCount === 0) {
      router.push('/dashboard/profil/cv?reason=cv-required');
    }
  }, [cvCount, router]);

  /* Premiumgraden. useProfile är fortsatt sanningen, men den startar på
     'free' och laddar. Under den luckan visade mallsteget premiumlås för en
     betalande kund. Serverns svar täcker luckan; så fort profilen laddat är
     det useProfile som gäller, precis som förut. Ingen gate har flyttat. */
  const isPremium = profileLoading ? initialIsPremium : subscriptionTier === 'premium';

  // Form state, bevarat från originalet
  const [selectedCV, setSelectedCV] = useState<string | null>(prefillData?.cvId || null);
  const [jobDescription, setJobDescription] = useState(prefillData?.jobDescription || '');
  const [tonality, setTonality] = useState<Tonality>('balanced');
  const [language, setLanguage] = useState<Language>('sv');
  const [templateId, setTemplateId] = useState<string>('classic');
  const [selectedFont, setSelectedFont] = useState<FontId>('arial');
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [letterData, setLetterData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasDownloadedOrSaved, setHasDownloadedOrSaved] = useState(false);
  // Sant först när servern bekräftat sparandet. Styr både foten på steg 6
  // ("Spara brevet" → "Klar") och varningen när flödet lämnas med X.
  const [isLetterSaved, setIsLetterSaved] = useState(false);
  const [isSavingLetter, setIsSavingLetter] = useState(false);
  // A1: sant när nedladdningen svarat 402. Brevet visas fortfarande, men
  // betalväggen läggs under det.
  const [downloadGate, setDownloadGate] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isRegeneratingTemplate, setIsRegeneratingTemplate] = useState(false);
  // Dagskvoten slut (429 quota_exceeded från servern) → visa spärrvyn
  const [quotaLock, setQuotaLock] = useState<{ nextResetAt: string } | null>(null);
  // Antal brev kvar idag, uppdateras från serverns svar efter varje generering
  const [remainingToday, setRemainingToday] = useState<number | null>(null);

  const [showPipeline, setShowPipeline] = useState(false);

  // Sant medan genereringen pågår.
  //
  // Storens isGenerating sätts bara av spar-vägen. Förhandsvisningen
  // (save: false) går direkt mot /api/letters/generate-preview och rörde
  // aldrig flaggan, så primärknappen förblev klickbar i de tjugo sekunder
  // genereringen tog. Pipeline-kortet låg dessutom under vecket på mobil,
  // så det såg ut som att ingenting hände och användaren tryckte igen.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs behålls för preview och pipeline. Sektionsscrollen är borta:
  // FlowShell visar ett steg i taget, så det finns inget att scrolla till.
  const pipelineRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);

  /* Flödessteg i URL:en (?steg=N). Tidigare låg steget i useState, så
     bakåtgesten på mobil lämnade hela flödet i stället för att backa ett
     steg, och en omladdning började om från noll. */
  const cvDone = !!selectedCV;
  const jobDone = jobDescription.length > 20;

  // Spärr mot handskrivna ?steg=5: man når bara så långt datan räcker.
  const maxReachableStep = !cvDone ? 1 : !jobDone ? 2 : generatedLetter ? 6 : 5;

  const { step, goToStep, next, back } = useFlowStep({
    totalSteps: LETTER_FLOW_TOTAL_STEPS,
    maxReachableStep,
  });

  /* Utkast. Flödet tappade tidigare allt vid minsta avbrott eftersom hela
     state bara låg i minnet. Ett inkommande samtal räckte. */
  const [pendingDraft, setPendingDraft] = useState<FlowDraft<LetterDraftData> | null>(null);
  const draftChecked = useRef(false);

  useEffect(() => {
    if (draftChecked.current) return;
    draftChecked.current = true;
    purgeExpiredDrafts();

    // Prefill från en annons väger tyngre än ett gammalt utkast: användaren
    // kom hit med ett tydligt ärende just nu.
    if (prefillData?.cvId || prefillData?.jobDescription) return;

    const found = loadDraft<LetterDraftData>(LETTER_FLOW_NAME, LETTER_FLOW_VERSION);
    if (found) setPendingDraft(found);
  }, [prefillData]);

  const currentDraftData = useCallback(
    (): LetterDraftData => ({
      selectedCV,
      jobDescription,
      tonality,
      language,
      templateId,
      selectedFont,
      headerPhone,
      headerLocation,
    }),
    [
      selectedCV,
      jobDescription,
      tonality,
      language,
      templateId,
      selectedFont,
      headerPhone,
      headerLocation,
    ]
  );

  // Sparas vid stegbyte och när fliken göms, aldrig på varje tangenttryck:
  // en skrivning per keystroke gör inmatningen hackig på svagare telefoner.
  useEffect(() => {
    if (pendingDraft || generatedLetter) return;
    if (!selectedCV && !jobDescription) return;
    saveDraft(LETTER_FLOW_NAME, LETTER_FLOW_VERSION, step, currentDraftData());
  }, [step, pendingDraft, generatedLetter, selectedCV, jobDescription, currentDraftData]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState !== 'hidden') return;
      if (generatedLetter) return;
      if (!selectedCV && !jobDescription) return;
      saveDraft(LETTER_FLOW_NAME, LETTER_FLOW_VERSION, step, currentDraftData());
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [step, generatedLetter, selectedCV, jobDescription, currentDraftData]);

  const resumeDraft = useCallback(() => {
    if (!pendingDraft) return;
    const d = pendingDraft.data;
    setSelectedCV(d.selectedCV);
    setJobDescription(d.jobDescription);
    setTonality(d.tonality);
    setLanguage(d.language);
    setTemplateId(d.templateId);
    setSelectedFont(d.selectedFont);
    setHeaderPhone(d.headerPhone);
    setHeaderLocation(d.headerLocation);
    prefilledContactRef.current = true;
    setPendingDraft(null);
    goToStep(pendingDraft.step);
  }, [pendingDraft, goToStep]);

  const restartDraft = useCallback(() => {
    clearDraft(LETTER_FLOW_NAME, LETTER_FLOW_VERSION);
    setPendingDraft(null);
    goToStep(1);
  }, [goToStep]);

  /* Förvald ton från profilen (profiles.preferred_tonality), med 'balanced'
     som fallback. Tidigare hade profilvalet ingen produktionsyta alls:
     användaren valde en skrivton som aldrig lästes, och tvingades välja om i
     varje brev. Nu är profilvalet startvärdet här.

     Körs en gång, när profilen laddat, och bara så länge tonen står kvar på
     sitt startvärde. Har användaren redan bytt ton i det här brevet, eller
     återupptagit ett utkast, rör vi den inte.

     Premiumgaten ligger kvar: 'auto' kan bara väljas av premium, både på
     profilsidan och i TonalityLanguageStep. En gratisanvändare med ett gammalt
     auto-val i profilen landar därför på 'balanced'. */
  const tonalityInitialized = useRef(false);
  useEffect(() => {
    if (tonalityInitialized.current) return;
    if (!profile) return;

    tonalityInitialized.current = true;

    const preferred = (profile as { preferred_tonality?: string } | null)
      ?.preferred_tonality;
    if (!preferred) return;

    const allowed: Tonality[] = [
      'professional',
      'enthusiastic',
      'creative',
      'confident',
      'balanced',
      'auto',
    ];
    if (!allowed.includes(preferred as Tonality)) return;
    if (preferred === 'auto' && !isPremium) return;

    setTonality((current) => (current === 'balanced' ? (preferred as Tonality) : current));
  }, [profile, isPremium]);

  /* Synka storen i bakgrunden. Serverlistan visas medan detta pågår, så
     hämtningen ligger inte på den kritiska vägen till första innehåll. */
  useEffect(() => {
    fetchCVs().finally(() => {
      setCvsRefreshed(true);
    });
  }, [fetchCVs]);

  /* Kommer användaren från en annons har hon redan gjort de första valen.
     Hoppa fram till första steget som faktiskt saknar något, i stället för
     att låta henne klicka förbi det hon just fyllt i. */
  const didInitialJump = useRef(false);
  useEffect(() => {
    if (didInitialJump.current || !prefillData) return;
    if (cvCount === 0) return; // vänta tills CV-listan finns
    didInitialJump.current = true;

    if (prefillData.cvId && prefillData.jobDescription) goToStep(3);
    else if (prefillData.cvId) goToStep(2);
  }, [prefillData, cvCount, goToStep]);

  const handleGenerateLetter = useCallback(async () => {
    if (!selectedCV || !jobDescription) {
      setError('CV eller jobbeskrivning saknas');
      return;
    }

    // Andra klicket ska inte göra någonting alls. Tidigare gick det in i
    // hookens dubblettvakt, fick null tillbaka och visade felbannern
    // "Kunde inte generera brevet" fast första anropet var på väg att
    // lyckas. Det var exakt vad användaren såg i produktion.
    if (isSubmitting) return;

    setError(null);
    setShowPipeline(true);
    setIsSubmitting(true);

    // B3: spara brevhuvudets kontaktuppgifter om användaren ändrat dem.
    // Fire-and-forget: en misslyckad profilsparning får aldrig stoppa brevet.
    const trimmedPhone = headerPhone.trim();
    const trimmedLocation = headerLocation.trim();
    if (
      trimmedPhone !== (profile?.phone || '') ||
      trimmedLocation !== (profile?.location || '')
    ) {
      void Promise.resolve(
        updateProfile({ phone: trimmedPhone, location: trimmedLocation })
      ).catch((err) => {
        console.error('Kunde inte spara kontaktuppgifter:', err);
      });
    }

    // Scroll till pipeline
    requestAnimationFrame(() => {
      pipelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    try {
      const result = await createLetter({
        cv_id: selectedCV,
        job_description: jobDescription,
        tonality,
        language,
        template_id: templateId,
        save: false,
      });

      if (result) {
        const letterContent = typeof result === 'string' ? result : (result.content || '');
        if (!letterContent || typeof letterContent !== 'string' || letterContent.trim() === '') {
          setError('Brevinnehållet kunde inte laddas korrekt');
          return;
        }
        setGeneratedLetter(letterContent);
        setLetterData(result);
        // Brevet finns, flödet är klart: utkastet behövs inte längre.
        clearDraft(LETTER_FLOW_NAME, LETTER_FLOW_VERSION);
        // Inget goToStep(6) här. maxReachableStep räknas ur
        // generatedLetter, som fortfarande är null i den här rendern, så
        // taket är 5 och hoppet klampades tyst tillbaka till steg 5.
        // Steget byts i stället i en effekt när state har landat.

        if (typeof result.remainingLetters === 'number') {
          setRemainingToday(result.remainingLetters);
        }
      } else {
        setError('Kunde inte generera brevet');
      }
    } catch (err: any) {
      console.error('Letter generation error:', err);
      // En pågående generering är inget fel för användaren: det första
      // anropet är på väg att lyckas. Säg ingenting.
      if (err?.code === 'generation_in_progress') return;
      // Dagskvoten slut → visa spärrvyn i stället för generiskt fel
      if (err?.code === 'quota_exceeded' || err?.payload?.code === 'quota_exceeded') {
        setShowPipeline(false);
        setQuotaLock({
          nextResetAt: err?.payload?.nextResetAt || err?.payload?.nextResetDate || new Date().toISOString(),
        });
        return;
      }
      setError('Ett fel uppstod vid genereringen');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCV, jobDescription, tonality, language, templateId, createLetter, headerPhone, headerLocation, profile, updateProfile, isSubmitting]);

  // Steg 6 när brevet landat.
  //
  // Hoppet kan inte göras i handlern: maxReachableStep räknas ur
  // generatedLetter, och i handlerns render är den fortfarande null, så
  // taket är 5 och goToStep(6) klampades tillbaka till 5. Användaren blev
  // kvar på steg 5 trots att brevet fanns. Här har state landat och taket
  // är 6.
  useEffect(() => {
    if (step === 5 && generatedLetter && generatedLetter.trim().length > 0) {
      goToStep(6);
    }
  }, [step, generatedLetter, goToStep]);

  // När brevet är klart: scrolla till preview + visa toast
  const didShowToast = useRef(false);
  useEffect(() => {
    if (
      generatedLetter &&
      typeof generatedLetter === 'string' &&
      generatedLetter.trim().length > 0 &&
      !isGenerating &&
      !didShowToast.current
    ) {
      didShowToast.current = true;
      // Vänta in render
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);

      successWithMascotAndActivity(
        'Ditt brev är skrivet. Granska gärna och spara om du vill behålla det.',
        'letter-created',
        'letter_created',
        'genererade ett personligt brev',
        {
          tonality,
          language,
          job_description_length: jobDescription.length,
        },
        6000
      );
    }
  }, [generatedLetter, isGenerating, successWithMascotAndActivity, tonality, language, jobDescription]);

  // Template change i preview - regenerera
  const handleTemplateChange = useCallback(
    async (newTemplateId: string) => {
      setTemplateId(newTemplateId);

      if (generatedLetter && selectedCV && jobDescription) {
        setIsRegeneratingTemplate(true);
        try {
          const result = await createLetter({
            cv_id: selectedCV,
            job_description: jobDescription,
            tonality,
            language,
            template_id: newTemplateId,
            save: false,
          });

          if (result) {
            const letterContent =
              typeof result === 'string' ? result : (result.content || '');
            if (letterContent && typeof letterContent === 'string' && letterContent.trim() !== '') {
              setGeneratedLetter(letterContent);
              setLetterData(result);
            }
            if (typeof result.remainingLetters === 'number') {
              setRemainingToday(result.remainingLetters);
            }
          }
        } catch (err: any) {
          console.error('Failed to regenerate letter with new template:', err);
          if (err?.code === 'quota_exceeded' || err?.payload?.code === 'quota_exceeded') {
            setQuotaLock({
              nextResetAt: err?.payload?.nextResetAt || err?.payload?.nextResetDate || new Date().toISOString(),
            });
          }
        } finally {
          setIsRegeneratingTemplate(false);
        }
      }
    },
    [generatedLetter, selectedCV, jobDescription, tonality, language, createLetter]
  );

  const handleEditLetter = (content: string) => {
    setGeneratedLetter(content);
    if (letterData) {
      setLetterData({ ...letterData, content });
    }
  };

  const handleSaveLetter = async () => {
    if (!generatedLetter || !selectedCV) return;
    try {
      setIsSavingLetter(true);
      setSaveError(null);
      const dataToSave = letterData
        ? {
            ...letterData,
            content: generatedLetter,
            cv_id: selectedCV,
            job_description: jobDescription,
            tonality,
            language,
          }
        : {
            content: generatedLetter,
            cv_id: selectedCV,
            job_description: jobDescription,
            tonality,
            language,
          };

      const savedLetter = await saveLetter(dataToSave);

      if (!savedLetter) {
        throw new Error('Brevet kunde inte sparas. Försök igen.');
      }

      setHasDownloadedOrSaved(true);
      setIsLetterSaved(true);

      // Listan är en bekvämlighet. Brevet ligger redan i databasen, så ett
      // fel här får inte se ut som ett misslyckat sparande.
      try {
        await refreshLetters();
      } catch (listError) {
        console.warn('Brevet sparades men listan kunde inte uppdateras:', listError);
      }

      // Frågan om hemskärmen (docs/plan-pwa.md). Först nu, när brevet
      // faktiskt ligger sparat, och aldrig när sparandet misslyckades: den
      // som just fick ett felmeddelande ska inte få en fråga ovanpå det.
      // Reglerna för om frågan får visas ligger i storen, inte här.
      requestInstallPrompt('letter_saved');
    } catch (err: any) {
      console.error('Save error:', err);
      // "Failed to fetch" är webbläsarens ord för ett tappat mobilnät. Det
      // säger användaren ingenting, så vi säger det på svenska i stället.
      const arNatverksfel =
        err?.code === 'network_error' ||
        /failed to fetch|load failed|networkerror/i.test(String(err?.message || ''));
      const errorMessage = arNatverksfel
        ? 'Nätverket svarade inte. Kontrollera uppkopplingen och försök igen.'
        : err?.message || 'Kunde inte spara brevet. Försök igen.';
      setSaveError(errorMessage);
      // Kastas vidare så att PreviewStep inte visar "Brevet är sparat"
      // ovanför felrutan. Ett misslyckat sparande är ett misslyckat sparande.
      throw new Error(errorMessage);
    } finally {
      setIsSavingLetter(false);
    }
  };

  // "Markera som sökt": loggar brevet som en ansökan i Sökta tjänster.
  // Preview-raden i letters finns alltid när knappen visas, så letter_id
  // kan kopplas direkt. Idempotent i API:t: dubbeltryck ger samma ansökan.
  const handleMarkAsApplied = useCallback(async (): Promise<string> => {
    if (!letterData?.id) throw new Error('Brevet saknar id');
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_title: letterData.job_title || letterData.title || 'Okänd tjänst',
        company: letterData.company || 'Okänd arbetsgivare',
        application_channel: 'ad',
        letter_id: letterData.id,
        cv_id: selectedCV || null,
        job_ad_url: prefillData?.jobAdUrl || null,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Kunde inte logga ansökan');
    }
    logActivity(
      'application_logged',
      `Markerade brevet som sökt: ${json.data.job_title} hos ${json.data.company}`,
      { applicationId: json.data.id, letterId: letterData.id, source: 'letter_preview' }
    );
    return json.data.id as string;
  }, [letterData, selectedCV, logActivity, prefillData]);

  const handleUndoMarkApplied = useCallback(async (applicationId: string) => {
    await fetch(`/api/applications/${applicationId}`, { method: 'DELETE' });
  }, []);

  const handleDownloadLetter = async (format: 'pdf' | 'docx' = 'pdf') => {
    if (!generatedLetter) return;
    try {
      const safeMetadata = {
        title:
          letterData && typeof letterData === 'object' && letterData.title
            ? String(letterData.title)
            : 'Ansökningsbrev',
        company:
          letterData && typeof letterData === 'object' && letterData.company
            ? String(letterData.company)
            : '',
        position:
          letterData && typeof letterData === 'object' && letterData.job_title
            ? String(letterData.job_title)
            : '',
      };

      const response = await fetch('/api/letters/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedLetter,
          format,
          title: safeMetadata.title,
          company: safeMetadata.company,
          position: safeMetadata.position,
          template: templateId,
          font: selectedFont,
        }),
      });

      // A1: 402 betyder att filen kräver Premium. Brevet syns fortfarande i
      // sin helhet, betalväggen läggs under det.
      if (response.status === 402) {
        setDownloadGate(true);
        return;
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personligt-brev.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        setHasDownloadedOrSaved(true);
      } else {
        console.error('Download failed:', await response.text());
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Escape för exit warning modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showExitWarning) {
        setShowExitWarning(false);
      }
    };
    if (showExitWarning) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [showExitWarning]);

  const cvName =
    cvs.find((c) => c.id === selectedCV)?.file_name?.replace(/\.[^.]+$/, '') || null;
  const jobPreview = prefillData?.jobTitle && prefillData?.company
    ? `${prefillData.jobTitle} hos ${prefillData.company}`
    : jobDescription.slice(0, 80).trim() + (jobDescription.length > 80 ? '…' : '');

  // Företaget brevet går till, för "Skriver ditt brev till X" och
  // bekräftelsen "Ditt brev till X är klart". Från annonsen om vi vet, annars
  // från det genererade brevets metadata.
  const companyName: string | null =
    (letterData && typeof letterData === 'object' && letterData.company
      ? String(letterData.company)
      : null) || prefillData?.company || null;

  const canGenerate =
    !!selectedCV && jobDescription.length > 20 && !!templateId && !!tonality;

  // Free-användare som använt dagens kvot (429 från servern) ser spärrvyn
  // i stället för flödet. Ett redan genererat brev visas fortfarande under
  // spärren så att det kan sparas/laddas ned.
  if (quotaLock) {
    return (
      <LetterFlowLayout>
        <PaywallCard
          variant="kvot"
          quota={{ feature: 'letter_generation', nextResetAt: quotaLock.nextResetAt }}
        />
        {generatedLetter && (
          <PreviewStep
            letterContent={generatedLetter}
            templateId={templateId}
            onEdit={handleEditLetter}
            onDownload={handleDownloadLetter}
            onSave={handleSaveLetter}
            showInlineSave
            onMarkAsApplied={handleMarkAsApplied}
            onUndoMarkAsApplied={handleUndoMarkApplied}
            selectedFont={selectedFont}
            onFontChange={setSelectedFont}
            saveError={saveError}
            isPremium={isPremium}
            isRegeneratingTemplate={false}
            registerRef={(el) => {
              previewRef.current = el;
            }}
          />
        )}
        {downloadGate && generatedLetter && (
          <PaywallCard
            variant="nedladdning"
            isPremium={isPremium}
            onCopy={() => navigator.clipboard?.writeText(generatedLetter)}
          />
        )}
      </LetterFlowLayout>
    );
  }

  /* Ett steg i taget i FlowShell. Tidigare låg alla fem korten på samma
     långa sida, med primärknappen sist: på 375 px betydde det att man
     scrollade genom hela flödet för att hitta knappen. */

  // Vad som saknas just nu, så en spärrad knapp aldrig är tyst.
  const blockedReason =
    step === 1 && !cvDone
      ? 'Välj vilket CV brevet ska utgå från.'
      : step === 2 && !jobDone
        ? 'Klistra in annonsen, minst ett par meningar.'
        : step === 5 && !canGenerate
          ? 'Något saknas i dina val. Gå tillbaka och fyll i det som fattas.'
          : undefined;

  const primaryFor = (): { label: string; onClick: () => void; disabled: boolean } | null => {
    if (step === 1) return { label: 'Fortsätt', onClick: next, disabled: !cvDone };
    if (step === 2) return { label: 'Fortsätt', onClick: next, disabled: !jobDone };
    if (step === 3) return { label: 'Fortsätt', onClick: next, disabled: false };
    if (step === 4) return { label: 'Fortsätt', onClick: next, disabled: false };
    if (step === 5)
      return {
        label: 'Skapa mitt brev',
        onClick: handleGenerateLetter,
        disabled: !canGenerate,
      };
    // Steg 6: den viktigaste handlingen hör hemma i foten, inom räckhåll
    // utan att scrolla. Övriga val (redigera, kopiera, ladda ner, markera
    // som sökt) står kvar som sekundära i innehållet.
    if (step === 6 && generatedLetter) {
      if (isLetterSaved) {
        return {
          label: 'Klar',
          onClick: () => router.push('/dashboard/mina-brev'),
          disabled: false,
        };
      }
      return {
        label: 'Spara brevet',
        onClick: () => {
          void handleSaveLetter().catch(() => {
            // Felet visas redan som saveError i PreviewStep.
          });
        },
        disabled: false,
      };
    }
    return null;
  };

  const primary = primaryFor();

  // X i toppraden. Är brevet skrivet men inte sparat frågar vi först.
  const handleFlowExit = () => {
    if (step === 6 && generatedLetter && !isLetterSaved) {
      setShowExitWarning(true);
      return;
    }
    router.push('/dashboard');
  };

  // Återkomstvalet tar över hela steget: det är ett vägval, inte en banner
  // att scrolla förbi.
  if (pendingDraft) {
    return (
      <FlowShell
        title="Personligt brev"
        step={pendingDraft.step}
        totalSteps={LETTER_FLOW_TOTAL_STEPS}
        onExit={() => router.push('/dashboard')}
        exitLabel="Tillbaka till översikten"
      >
        <FlowResumeBanner
          savedAt={pendingDraft.savedAt}
          step={pendingDraft.step}
          totalSteps={LETTER_FLOW_TOTAL_STEPS}
          onResume={resumeDraft}
          onRestart={restartDraft}
        />
      </FlowShell>
    );
  }

  return (
    <FlowShell
      title="Personligt brev"
      step={step}
      totalSteps={LETTER_FLOW_TOTAL_STEPS}
      onBack={step > 1 && !isSubmitting && !isGenerating ? back : undefined}
      onExit={handleFlowExit}
      exitLabel="Tillbaka till översikten"
      primaryLabel={primary?.label}
      onPrimary={primary?.onClick}
      primaryDisabled={primary?.disabled}
      primaryBlockedReason={blockedReason}
      primaryBusy={
        (step === 5 && (isSubmitting || isGenerating)) || (step === 6 && isSavingLetter)
      }
      busyLabel={step === 6 ? 'Sparar' : 'Skriver brevet'}
      banner={
        error ? (
          <FlowError
            message={error}
            onRetry={() => {
              setError(null);
              if (step === 5) void handleGenerateLetter();
            }}
          />
        ) : undefined
      }
    >
      {step >= 1 && step <= 5 ? (
        <StepHead step={step} total={LETTER_FLOW_TOTAL_STEPS} question={STEP_QUESTIONS[step - 1]} />
      ) : null}

      {step === 1 && (
        <>
          <p className="text-sm leading-[22px] text-ink-2">
            I ett svenskt urval läses brevet mot annonsens kravprofil. Välj vilket CV vi ska utgå
            från, så lyfter vi fram det som svarar mot kraven.
          </p>
          <OnboardingNextStep stepCompleted="create_letter" />
          {prefillData && (prefillData.cvId || prefillData.jobDescription) && (
            <PrefillBadgeCard
              company={prefillData.company}
              jobTitle={prefillData.jobTitle}
              hasCv={!!prefillData.cvId}
              hasJobDescription={!!prefillData.jobDescription}
              onJumpToTemplate={() => goToStep(3)}
            />
          )}
          <CVSelectionStep
            cvs={cvs}
            lockedCvIds={lockedCvIds}
            selectedCV={selectedCV}
            onCVSelect={setSelectedCV}
            isActive
            startCollapsed={false}
            onComplete={() => {}}
          />
        </>
      )}

      {step === 2 && (
        <JobDescriptionStep
          jobDescription={jobDescription}
          onJobDescriptionChange={setJobDescription}
          isActive
          startCollapsed={false}
          onComplete={() => {}}
          prefillCompany={prefillData?.company}
          prefillJobTitle={prefillData?.jobTitle}
        />
      )}

      {step === 3 && (
        <TemplateStep
          templateId={templateId}
          onTemplateChange={handleTemplateChange}
          isPremium={isPremium}
          isActive
        />
      )}

      {step === 4 && (
        <TonalityLanguageStep
          tonality={tonality}
          language={language}
          onTonalityChange={setTonality}
          onLanguageChange={setLanguage}
          isPremium={isPremium}
          isActive
        />
      )}

      {step === 5 && (
        <>
          <LetterFlowSummary
            cvName={cvName}
            jobDescriptionPreview={jobPreview}
            templateId={templateId}
            tonality={tonality}
            language={language}
            canGenerate={canGenerate}
            isGenerating={isSubmitting || isGenerating}
            onGenerate={handleGenerateLetter}
            remainingLetters={remainingToday}
            phone={headerPhone}
            location={headerLocation}
            onPhoneChange={setHeaderPhone}
            onLocationChange={setHeaderLocation}
            hidePrimaryAction
          />
          {/* Brevet skrivs: rubriken säger vad som görs, tre rader fylls,
              meta säger hur länge. Felet visas i skalets banner. */}
          {(showPipeline || isSubmitting || isGenerating) && !error && (
            <div ref={pipelineRef} className="mt-4">
              <LoadingSkeleton
                variant="writing"
                label={companyName ? `Skriver ditt brev till ${companyName}` : 'Skriver ditt brev'}
                meta="Läser annonsens krav mot ditt CV. Tar cirka 15 sekunder."
              />
            </div>
          )}
        </>
      )}

      {step === 6 && generatedLetter && (
        <>
          <Confirmation
            title={companyName ? `Ditt brev till ${companyName} är klart` : 'Ditt brev är klart'}
            description="Läs igenom det en gång. Spara det så hamnar det under Mina brev."
            className="mb-4"
          />
          <PreviewStep
            letterContent={generatedLetter}
            templateId={templateId}
            onEdit={handleEditLetter}
            onDownload={handleDownloadLetter}
            onSave={handleSaveLetter}
            onMarkAsApplied={handleMarkAsApplied}
            onUndoMarkAsApplied={handleUndoMarkApplied}
            selectedFont={selectedFont}
            onFontChange={setSelectedFont}
            saveError={saveError}
            isPremium={isPremium}
            isRegeneratingTemplate={isRegeneratingTemplate}
            registerRef={(el) => {
              previewRef.current = el;
            }}
          />
          {downloadGate && (
            <div className="mt-4">
              <PaywallCard
                variant="nedladdning"
                isPremium={isPremium}
                onCopy={() => navigator.clipboard?.writeText(generatedLetter)}
              />
            </div>
          )}
        </>
      )}

      {showExitWarning ? (
        <ConfirmDialog
          open={showExitWarning}
          onCancel={() => setShowExitWarning(false)}
          onConfirm={() => {
            setShowExitWarning(false);
            router.push('/dashboard');
          }}
          title="Lämna utan att spara?"
          description="Brevet är skrivet men inte sparat. Lämnar du nu finns det inte kvar under Mina brev."
          confirmLabel="Lämna"
          cancelLabel="Stanna"
        />
      ) : null}
    </FlowShell>
  );
}
