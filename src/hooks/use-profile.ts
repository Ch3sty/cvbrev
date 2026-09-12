// src/hooks/use-profile.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Profile, ProfileUpdateParams, CV } from '@/types/user.types';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { startOfTodayStockholm, nextMidnightStockholm } from '@/lib/quota/quotaService';
import { useDashboardData } from '@/contexts/DashboardDataContext';

// Konstanter för prenumerationsbegränsningar.
// Dagskvotmodellen (docs/plan-kvotmodell.md): brev är 1 per dag med
// nollställning vid midnatt svensk tid. De "weekly"-namngivna fälten och
// state-variablerna behålls som API mot resten av appen, men värdena är
// numera DAGSVÄRDEN. "Analys" i denna hook avser kompetensanalysen
// (kalendervecka, pausad funktion) — CV-analysens 72h-kvot hanteras av
// analyze-API:ts svar, inte här.
const SUBSCRIPTION_LIMITS = {
  free: {
    maxSavedLetters: 2,
    dailyLetterLimit: 1,
    weeklyLetterLimit: 1,     // = dailyLetterLimit; namnet behålls för konsumenter
    maxCVCount: 2,
    weeklyAnalysisLimit: 1,
    availableTonalities: ['professional', 'enthusiastic', 'confident', 'balanced', 'creative'],
  },
  premium: {
    maxSavedLetters: Infinity,
    dailyLetterLimit: Infinity,
    weeklyLetterLimit: Infinity,
    maxCVCount: Infinity,
    weeklyAnalysisLimit: Infinity,
    availableTonalities: ['professional', 'enthusiastic', 'confident', 'balanced', 'creative', 'auto'],
  }
};

/**
 * Finns DashboardDataProvider över oss?
 *
 * Contextens defaultvärde har summary: null och isLoading: true, vilket ser
 * exakt likadant ut som "provider finns men laddar". Så länge contexten saknar
 * en explicit markör avgör vi det på route i stället: providern monteras i
 * src/app/dashboard/layout.tsx och täcker hela /dashboard-trädet.
 *
 * Om DashboardDataContext senare får ett hasProvider-fält (default false,
 * providern sätter true) plockas det upp automatiskt av raden nedan, och
 * route-kontrollen blir bara en fallback.
 */
function useHasDashboardProvider(ctx: unknown): boolean {
  const pathname = usePathname();

  const flagged = (ctx as { hasProvider?: boolean }).hasProvider;
  if (typeof flagged === 'boolean') return flagged;

  return pathname === '/dashboard' || (pathname?.startsWith('/dashboard/') ?? false);
}

export const useProfile = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cv, setCv] = useState<CV | null>(null);
  const [gdprConsent, setGdprConsent] = useState<boolean>(false);

  // Delad data från dashboardens layout. Utanför dashboarden är summary null
  // och hasProvider false, och hooken kör sin egen hämtningskedja som förut.
  const dashboardData = useDashboardData();
  const { summary, refresh: refreshDashboardData } = dashboardData;
  const hasProvider = useHasDashboardProvider(dashboardData);
  /** Sant när vi faktiskt har delad data att läsa ur. */
  const usingSharedData = hasProvider && summary !== null;

  // Prenumerationsrelaterad state
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium'>('free');
  const [weeklyLetterCount, setWeeklyLetterCount] = useState<number>(0);
  const [weeklyLetterLimit, setWeeklyLetterLimit] = useState<number>(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit);
  const [lastCountReset, setLastCountReset] = useState<string | null>(null);
  const [remainingWeeklyLetters, setRemainingWeeklyLetters] = useState<number>(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);

  // Stripe-data state
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [priceId, setPriceId] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null);

  // State för återställningsdatum och nedräkning
  const [nextResetDate, setNextResetDate] = useState<Date | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ref för fetchProfile
  const fetchProfileRef = useRef<(() => Promise<Profile | null>) | null>(null);

  // CV-relaterad state
  const [cvCount, setCvCount] = useState(0);
  const [hasReachedCvLimit, setHasReachedCvLimit] = useState(false);
  const [maxCvCount, setMaxCvCount] = useState(SUBSCRIPTION_LIMITS.free.maxCVCount);

  // Letters-relaterad state
  const [savedLettersCount, setSavedLettersCount] = useState(0);
  const [hasReachedLetterLimit, setHasReachedLetterLimit] = useState(false);
  const [maxSavedLetters, setMaxSavedLetters] = useState(SUBSCRIPTION_LIMITS.free.maxSavedLetters);

  // --- STATE FÖR CV-ANALYS ---
  const [weeklyAnalysisCount, setWeeklyAnalysisCount] = useState<number>(0);
  const [weeklyAnalysisLimit, setWeeklyAnalysisLimit] = useState<number>(SUBSCRIPTION_LIMITS.free.weeklyAnalysisLimit);
  const [lastAnalysisReset, setLastAnalysisReset] = useState<string | null>(null);
  const [remainingWeeklyAnalyses, setRemainingWeeklyAnalyses] = useState<number>(SUBSCRIPTION_LIMITS.free.weeklyAnalysisLimit);
  const [nextAnalysisResetDate, setNextAnalysisResetDate] = useState<Date | null>(null);
  const [timeUntilAnalysisReset, setTimeUntilAnalysisReset] = useState<string>('');
  const analysisTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // --- SLUT PÅ STATE FÖR CV-ANALYS ---


  // Supabase-klient
  const supabase = getSupabaseClient();

  // Hjälpfunktioner
  const formatLimit = useCallback((value: number): string => {
    if (!isFinite(value)) return '∞';
    return value.toString();
  }, []);

  const formatTimeRemaining = useCallback((targetDate: Date | null): string => {
    if (!targetDate) return '';
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs <= 0) return 'nu';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} dag${diffDays > 1 ? 'ar' : ''} ${diffHours} tim`;
    } else if (diffHours > 0) {
      return `${diffHours} tim ${diffMinutes} min`;
    } else {
      return `${diffMinutes} min`;
    }
  }, []);

  const calculateRemainingLetters = useCallback((tier: 'free' | 'premium', count: number) => {
    const limit = SUBSCRIPTION_LIMITS[tier].weeklyLetterLimit;
    if (!isFinite(limit)) return Infinity;
    return Math.max(0, limit - count);
  }, []);

  const calculateRemainingAnalyses = useCallback((tier: 'free' | 'premium', count: number) => {
    const limit = SUBSCRIPTION_LIMITS[tier].weeklyAnalysisLimit;
    if (!isFinite(limit)) return Infinity;
    return Math.max(0, limit - count);
  }, []);

  const calculateLetterLimitReached = useCallback((tier: 'free' | 'premium', count: number) => {
    const limit = SUBSCRIPTION_LIMITS[tier].maxSavedLetters;
    if (!isFinite(limit)) return false;
    return count >= limit;
  }, []);

  const calculateCvLimitReached = useCallback((tier: 'free' | 'premium', count: number) => {
    const limit = SUBSCRIPTION_LIMITS[tier].maxCVCount;
    if (!isFinite(limit)) return false;
    return count >= limit;
  }, []);

  const calculateNextResetDate = useCallback((lastResetTimestamp: string | null): Date => {
    const lastReset = lastResetTimestamp ? new Date(lastResetTimestamp) : new Date();
    const nextReset = new Date(lastReset);
    // Sätt nästa återställning till nästa måndag kl 00:00 UTC
    const dayOfWeek = nextReset.getUTCDay();
    const daysUntilMonday = (dayOfWeek === 0 ? 1 : 8 - dayOfWeek);
    nextReset.setUTCDate(nextReset.getUTCDate() + daysUntilMonday);
    nextReset.setUTCHours(0, 0, 0, 0);

    // Om nästa måndag redan passerat denna vecka, ta nästa veckas måndag
    if (nextReset.getTime() <= lastReset.getTime()) {
        nextReset.setUTCDate(nextReset.getUTCDate() + 7);
    }

    return nextReset;
  }, []);

  /**
   * Avgör nivån på exakt samma sätt som förut: premium gäller bara om
   * premium_until ligger i framtiden, eller saknas helt (Stripe-abonnemang).
   */
  const resolveTier = useCallback((data: Record<string, any> | null): 'free' | 'premium' => {
    if (!data || data.subscription_tier !== 'premium') return 'free';
    if (!data.premium_until) return 'premium';
    return new Date(data.premium_until) > new Date() ? 'premium' : 'free';
  }, []);

  // Funktioner för att hämta data
  const fetchCvInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/cv');
      if (response.status === 404) {
        setCv(null); return null;
      }
      if (!response.ok) { throw new Error('Network response was not ok for CV info'); }
      const data = await response.json();
      if (data.success && data.data) {
        setCv({
          name: data.data.file_name || 'CV',
          url: data.data.publicUrl || null,
          lastUpdated: data.data.updated_at || data.data.created_at || null
        });
        return data.data;
      } else { setCv(null); return null; }
    } catch (error) { console.error('fetchCvInfo Error:', error); setCv(null); return null; }
  }, []);

  const fetchSavedLettersCount = useCallback(async () => {
    if (loading) return 0;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return 0;

      const { count, error } = await supabase
        .from('letters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_saved', true);

      if (error) { console.error('fetchSavedLettersCount Error:', error); return 0; }

      const currentCount = count || 0;
      setSavedLettersCount(currentCount);
      setHasReachedLetterLimit(calculateLetterLimitReached(subscriptionTier, currentCount));
      return currentCount;

    } catch (error) { console.error('fetchSavedLettersCount Exception:', error); return 0; }
  }, [supabase, subscriptionTier, calculateLetterLimitReached, loading]);

  const fetchCvCount = useCallback(async () => {
    if (loading) return 0;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return 0;

      const { count, error } = await supabase
        .from('cv_texts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      if (error) { console.error('fetchCvCount Error:', error); return 0; }

      const currentCount = count || 0;
      setCvCount(currentCount);
      setHasReachedCvLimit(calculateCvLimitReached(subscriptionTier, currentCount));
      return currentCount;

    } catch (error) { console.error('fetchCvCount Exception:', error); return 0; }
  }, [supabase, subscriptionTier, calculateCvLimitReached, loading]);

  // Timer-funktioner
  const startResetTimer = useCallback(() => {
    if (!nextResetDate) return;
    // Skippa timer för premium-användare med infinity limits
    if (!isFinite(weeklyLetterLimit)) return;
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); }

    setTimeUntilReset(formatTimeRemaining(nextResetDate));

    const interval = setInterval(() => {
      const now = new Date();
      if (now >= nextResetDate) {
        clearInterval(interval);
        timerIntervalRef.current = null;
        if (fetchProfileRef.current) {
            fetchProfileRef.current();
        }
      } else {
        setTimeUntilReset(formatTimeRemaining(nextResetDate));
      }
    }, 60000); // Uppdatera varje minut
    timerIntervalRef.current = interval;
  }, [nextResetDate, formatTimeRemaining, weeklyLetterLimit]);

  const startAnalysisResetTimer = useCallback(() => {
    if (!nextAnalysisResetDate) return;
    // Skippa timer för premium-användare med infinity limits
    if (!isFinite(weeklyAnalysisLimit)) return;
    if (analysisTimerIntervalRef.current) { clearInterval(analysisTimerIntervalRef.current); }

    setTimeUntilAnalysisReset(formatTimeRemaining(nextAnalysisResetDate));

    const interval = setInterval(() => {
      const now = new Date();
      if (now >= nextAnalysisResetDate) {
        clearInterval(interval);
        analysisTimerIntervalRef.current = null;
        if (fetchProfileRef.current) {
            fetchProfileRef.current();
        }
      } else {
        setTimeUntilAnalysisReset(formatTimeRemaining(nextAnalysisResetDate));
      }
    }, 60000); // Uppdatera varje minut
    analysisTimerIntervalRef.current = interval;
  }, [nextAnalysisResetDate, formatTimeRemaining, weeklyAnalysisLimit]);

  const updateNextResetDate = useCallback((newResetDate: Date) => {
    setNextResetDate(newResetDate);
    startResetTimer();
  }, [startResetTimer]);

  const updateNextAnalysisResetDate = useCallback((newResetDate: Date) => {
    setNextAnalysisResetDate(newResetDate);
    startAnalysisResetTimer();
  }, [startAnalysisResetTimer]);

  const updateRemainingAnalyses = useCallback((newRemainingCount: number) => {
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier].weeklyAnalysisLimit;
    if (!isFinite(limit)) {
      setRemainingWeeklyAnalyses(Infinity);
      setWeeklyAnalysisCount(0);
    } else {
      setRemainingWeeklyAnalyses(Math.max(0, newRemainingCount));
      const newCount = Math.max(0, limit - Math.max(0, newRemainingCount));
      setWeeklyAnalysisCount(newCount);
    }
  }, [subscriptionTier]);

  const updateRemainingLetters = useCallback((newRemainingCount: number) => {
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier].weeklyLetterLimit;
    if (!isFinite(limit)) {
      setRemainingWeeklyLetters(Infinity);
      setWeeklyLetterCount(0);
    } else {
      setRemainingWeeklyLetters(Math.max(0, newRemainingCount));
      const newCount = Math.max(0, limit - Math.max(0, newRemainingCount));
      setWeeklyLetterCount(newCount);
    }
  }, [subscriptionTier]);

  /**
   * Nollställ allt till gratis-grundläge (utloggad, eller ingen profilrad).
   * Identisk med den nollställning som tidigare låg inlinad två gånger i
   * fetchProfile.
   */
  const resetToFreeDefaults = useCallback(() => {
    setSubscriptionTier('free');
    setMaxCvCount(SUBSCRIPTION_LIMITS.free.maxCVCount);
    setMaxSavedLetters(SUBSCRIPTION_LIMITS.free.maxSavedLetters);
    setWeeklyLetterLimit(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit);
    setWeeklyLetterCount(0); setLastCountReset(null);
    setRemainingWeeklyLetters(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit);

    setStripeCustomerId(null); setSubscriptionId(null);
    setSubscriptionStatus(null); setPriceId(null); setCurrentPeriodEnd(null);

    const defaultReset = calculateNextResetDate(null);
    setNextResetDate(defaultReset);
    setTimeUntilReset(formatTimeRemaining(defaultReset));

    setCvCount(0); setHasReachedCvLimit(false);
    setSavedLettersCount(0); setHasReachedLetterLimit(false);

    setWeeklyAnalysisLimit(SUBSCRIPTION_LIMITS.free.weeklyAnalysisLimit);
    setWeeklyAnalysisCount(0);
    setLastAnalysisReset(null);
    setRemainingWeeklyAnalyses(SUBSCRIPTION_LIMITS.free.weeklyAnalysisLimit);
    setNextAnalysisResetDate(defaultReset);
    setTimeUntilAnalysisReset(formatTimeRemaining(defaultReset));
  }, [calculateNextResetDate, formatTimeRemaining]);

  // Hämta profil. Fallback-vägen: körs utanför dashboarden, och som
  // omhämtning efter skrivningar när ingen provider finns.
  const fetchProfile = useCallback(async (): Promise<Profile | null> => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setLoading(false);
        // Återställ till default gratis-state
        setProfile(null); setCv(null); setGdprConsent(false);
        resetToFreeDefaults();
        return null;
      }

      // Hämta profildata med de nya analys-fälten
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          stripe_customer_id,
          subscription_id,
          subscription_status,
          subscription_tier,
          price_id,
          current_period_end,
          weekly_letter_count,
          last_count_reset,
          weekly_competence_analysis_count,
          last_competence_analysis_reset
        `)
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('useProfile: Error fetching profile from DB:', profileError);
        return profile;
      }

      if (data) {
        setProfile(data);

        // Hantera prenumerations- och Stripe-data.
        // VIKTIGT: premium_until valideras så att utgångna premiums blir 'free'.
        const dbTier = resolveTier(data);
        setSubscriptionTier(dbTier);

        setMaxCvCount(SUBSCRIPTION_LIMITS[dbTier].maxCVCount);
        setMaxSavedLetters(SUBSCRIPTION_LIMITS[dbTier].maxSavedLetters);
        setWeeklyLetterLimit(SUBSCRIPTION_LIMITS[dbTier].weeklyLetterLimit);
        setWeeklyAnalysisLimit(SUBSCRIPTION_LIMITS[dbTier].weeklyAnalysisLimit);

        setStripeCustomerId(data.stripe_customer_id || null);
        setSubscriptionId(data.subscription_id || null);
        setSubscriptionStatus(data.subscription_status || null);
        setPriceId(data.price_id || null);
        setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);

        // Hantera brevräknare och återställning (dagsfönster, midnatt svensk tid).
        // Räknaren i weekly_letter_count gäller bara om fönstret startade idag
        // (weekly_letter_first_used_at >= dagens midnatt) — annars är den
        // logiskt 0 och servern nollställer kolumnerna vid nästa generering.
        const letterFirstUsed = data.weekly_letter_first_used_at
          ? new Date(data.weekly_letter_first_used_at)
          : null;
        const letterWindowIsToday =
          letterFirstUsed !== null &&
          letterFirstUsed.getTime() >= startOfTodayStockholm().getTime();
        const currentWeeklyCount = letterWindowIsToday ? (data.weekly_letter_count || 0) : 0;
        setWeeklyLetterCount(currentWeeklyCount);
        setLastCountReset(data.last_count_reset || null);
        setRemainingWeeklyLetters(calculateRemainingLetters(dbTier, currentWeeklyCount));
        const nextReset = nextMidnightStockholm();
        setNextResetDate(nextReset);
        setTimeUntilReset(formatTimeRemaining(nextReset));

        // Kompetensanalysens räknare (kalendervecka).
        const currentAnalysisCount = data.weekly_competence_analysis_count || 0;
        setWeeklyAnalysisCount(currentAnalysisCount);
        setLastAnalysisReset(data.last_competence_analysis_reset || null);
        setRemainingWeeklyAnalyses(calculateRemainingAnalyses(dbTier, currentAnalysisCount));
        const nextAnalysisReset = calculateNextResetDate(data.last_competence_analysis_reset || null);
        setNextAnalysisResetDate(nextAnalysisReset);
        setTimeUntilAnalysisReset(formatTimeRemaining(nextAnalysisReset));

        // Hämta relaterad info parallellt (oberoende anrop).
        await Promise.all([
          fetchCvInfo(),
          fetchCvCount(),
          fetchSavedLettersCount(),
        ]);

        return data;
      } else {
        // Ingen profil hittad i DB för inloggad användare
        console.warn('useProfile: No profile found in DB for user:', session.user.id, '- Treating as new free user.');
        setProfile(null);
        resetToFreeDefaults();
        await fetchCvInfo();
        return null;
      }
    } catch (error: any) {
      console.error('useProfile: Exception during fetchProfile execution:', error);
      // Återställ till säkert grundläge vid oväntat fel
      setProfile(null); setSubscriptionTier('free');
      // Liknande nollställning som vid ingen session...
      return null;
    } finally {
      setLoading(false);
    }
  }, [
    supabase,
    calculateRemainingLetters,
    calculateNextResetDate,
    formatTimeRemaining,
    fetchCvInfo,
    fetchCvCount,
    fetchSavedLettersCount,
    calculateRemainingAnalyses,
    resetToFreeDefaults,
    resolveTier,
    profile, // Add profile dependency
  ]);

  // Spara fetchProfile ref
  useEffect(() => {
    fetchProfileRef.current = fetchProfile;
  }, [fetchProfile]);

  // Starta timer
  useEffect(() => {
    if (nextResetDate && isFinite(weeklyLetterLimit)) {
      startResetTimer();
    } else if (timerIntervalRef.current) {
      // Rensa timer för premium-användare
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    return () => { if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); } };
  }, [nextResetDate, startResetTimer, weeklyLetterLimit]);

  useEffect(() => {
    if (nextAnalysisResetDate && isFinite(weeklyAnalysisLimit)) {
      startAnalysisResetTimer();
    } else if (analysisTimerIntervalRef.current) {
      // Rensa timer för premium-användare
      clearInterval(analysisTimerIntervalRef.current);
      analysisTimerIntervalRef.current = null;
    }
    return () => { if (analysisTimerIntervalRef.current) { clearInterval(analysisTimerIntervalRef.current); } };
  }, [nextAnalysisResetDate, startAnalysisResetTimer, weeklyAnalysisLimit]);

  // ==========================================================================
  // DELAT LÄGE
  //
  // Här läser hooken ur DashboardDataContext i stället för att göra egna
  // nätverksanrop. Beräkningarna nedan speglar fetchProfile rad för rad, fast
  // på summary.profile: samma SUBSCRIPTION_LIMITS, samma premium_until-
  // validering, samma dagsfönster för brevräknaren och samma veckoberäkning
  // för kompetensanalysen. Kvotlogiken är alltså oförändrad.
  // ==========================================================================
  useEffect(() => {
    if (!usingSharedData || !summary) return;

    const data = summary.profile as Record<string, any> | null;

    if (!data) {
      setProfile(null);
      resetToFreeDefaults();
      setLoading(false);
      return;
    }

    setProfile(data as unknown as Profile);

    const tier = resolveTier(data);
    setSubscriptionTier(tier);

    setMaxCvCount(SUBSCRIPTION_LIMITS[tier].maxCVCount);
    setMaxSavedLetters(SUBSCRIPTION_LIMITS[tier].maxSavedLetters);
    setWeeklyLetterLimit(SUBSCRIPTION_LIMITS[tier].weeklyLetterLimit);
    setWeeklyAnalysisLimit(SUBSCRIPTION_LIMITS[tier].weeklyAnalysisLimit);

    setStripeCustomerId((data.stripe_customer_id as string) || null);
    setSubscriptionId((data.subscription_id as string) || null);
    setSubscriptionStatus((data.subscription_status as string) || null);
    setPriceId((data.price_id as string) || null);
    setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end as string) : null);

    // Brevräknare: identiskt dagsfönster som i fetchProfile.
    const letterFirstUsed = data.weekly_letter_first_used_at
      ? new Date(data.weekly_letter_first_used_at as string)
      : null;
    const letterWindowIsToday =
      letterFirstUsed !== null &&
      letterFirstUsed.getTime() >= startOfTodayStockholm().getTime();
    const currentWeeklyCount = letterWindowIsToday ? ((data.weekly_letter_count as number) || 0) : 0;
    setWeeklyLetterCount(currentWeeklyCount);
    setLastCountReset((data.last_count_reset as string) || null);
    setRemainingWeeklyLetters(calculateRemainingLetters(tier, currentWeeklyCount));
    const nextReset = nextMidnightStockholm();
    setNextResetDate(nextReset);
    setTimeUntilReset(formatTimeRemaining(nextReset));

    // Kompetensanalys: identisk veckoberäkning som i fetchProfile.
    const currentAnalysisCount = (data.weekly_competence_analysis_count as number) || 0;
    const lastAnalysisResetValue = (data.last_competence_analysis_reset as string) || null;
    setWeeklyAnalysisCount(currentAnalysisCount);
    setLastAnalysisReset(lastAnalysisResetValue);
    setRemainingWeeklyAnalyses(calculateRemainingAnalyses(tier, currentAnalysisCount));
    const nextAnalysisReset = calculateNextResetDate(lastAnalysisResetValue);
    setNextAnalysisResetDate(nextAnalysisReset);
    setTimeUntilAnalysisReset(formatTimeRemaining(nextAnalysisReset));

    // CV: summary.cv.count är samma räkning som fetchCvCount gjorde, alltså
    // antalet rader i cv_texts för användaren.
    const sharedCvCount = summary.cv.count;
    setCvCount(sharedCvCount);
    setHasReachedCvLimit(calculateCvLimitReached(tier, sharedCvCount));
    // cv-objektet: summary bär namnet på det senast uppdaterade CV:t men
    // varken publicUrl eller tidsstämpel. Ingen konsument läser cv.url eller
    // cv.lastUpdated, så namnet räcker och /api/cv behöver inte anropas.
    setCv(
      summary.cv.activeName
        ? { name: summary.cv.activeName, url: null, lastUpdated: null }
        : null
    );

    setLoading(false);
  }, [
    usingSharedData,
    summary,
    resolveTier,
    resetToFreeDefaults,
    calculateRemainingLetters,
    calculateRemainingAnalyses,
    calculateCvLimitReached,
    calculateNextResetDate,
    formatTimeRemaining,
  ]);

  // Initial hämtning. I delat läge gör hooken inga egna anrop alls: den väntar
  // på att providern levererar summary. Utan provider körs gamla kedjan.
  const didInitialFetchRef = useRef(false);
  useEffect(() => {
    if (hasProvider) return;
    if (didInitialFetchRef.current) return;
    didInitialFetchRef.current = true;
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProvider]);

  // Sparade brev räknas fortfarande separat. summary.letters.total räknar ALLA
  // brevrader, även previews med is_saved = false, medan maxSavedLetters gäller
  // sparade brev. Att byta källa här skulle ändra hasReachedLetterLimit för
  // gratisanvändare, så frågan behålls tills summary levererar en savedCount.
  // Den körs en gång per hook i stället för en gång per hämtningskedja.
  useEffect(() => {
    if (!usingSharedData) return;
    let cancelled = false;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || cancelled) return;

        const { count, error } = await supabase
          .from('letters')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_saved', true);

        if (error) { console.error('fetchSavedLettersCount Error:', error); return; }
        if (cancelled) return;

        const currentCount = count || 0;
        setSavedLettersCount(currentCount);
        setHasReachedLetterLimit(calculateLetterLimitReached(subscriptionTier, currentCount));
      } catch (error) {
        console.error('fetchSavedLettersCount Exception:', error);
      }
    })();

    return () => { cancelled = true; };
  }, [usingSharedData, subscriptionTier, supabase, calculateLetterLimitReached]);

  // Effekt för att hämta om räknare när tier ändras. I delat läge kommer
  // CV-antalet ur summary och brevräkningen ur effekten ovan, så den här
  // omhämtningen ska inte köras då.
  useEffect(() => {
    if (usingSharedData) return;
    if (!loading) {
      fetchCvCount();
      fetchSavedLettersCount();
    }
  }, [usingSharedData, subscriptionTier, loading, fetchCvCount, fetchSavedLettersCount]);

  /**
   * Efter en lyckad skrivning: uppdatera den delade datan när providern finns,
   * annars hämta om lokalt. Så ser alla konsumenter samma nya värden.
   * Detta är även implementationen bakom det publika refreshProfile.
   */
  const refreshAfterWrite = useCallback(async (): Promise<Profile | null> => {
    if (hasProvider) {
      await refreshDashboardData();
      return profile;
    }
    return fetchProfile();
  }, [hasProvider, refreshDashboardData, fetchProfile, profile]);

  // Uppdatera profil
  const updateProfile = useCallback(async (profileData: ProfileUpdateParams): Promise<boolean> => {
    try {
      if (profileData.full_name !== undefined && profileData.full_name.trim() === '') {
        console.warn('useProfile update: Full name cannot be empty.');
        return false;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { console.error('useProfile update: User not logged in.'); return false; }

      // Sanera linkedin_url för att förhindra constraint-fel
      const sanitizedData = { ...profileData };
      if (sanitizedData.linkedin_url !== undefined && sanitizedData.linkedin_url !== null) {
        const trimmed = sanitizedData.linkedin_url.trim();
        // Konvertera tom sträng till null för databas-constraint
        sanitizedData.linkedin_url = trimmed === '' ? null : trimmed;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...sanitizedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('useProfile update: Error updating profile in DB:', error);
        return false;
      }

      if (data) {
        setProfile(data);

        // Om tier ändrades
        const updatedTier = (data.subscription_tier === 'premium' ? 'premium' : 'free');
        if (updatedTier !== subscriptionTier) {
            console.warn('useProfile update: subscription_tier was changed directly via updateProfile. Webhook should normally handle this.');
            setSubscriptionTier(updatedTier);
            setMaxCvCount(SUBSCRIPTION_LIMITS[updatedTier].maxCVCount);
            setMaxSavedLetters(SUBSCRIPTION_LIMITS[updatedTier].maxSavedLetters);
            setWeeklyLetterLimit(SUBSCRIPTION_LIMITS[updatedTier].weeklyLetterLimit);
            setWeeklyAnalysisLimit(SUBSCRIPTION_LIMITS[updatedTier].weeklyAnalysisLimit);
            setRemainingWeeklyLetters(calculateRemainingLetters(updatedTier, weeklyLetterCount));
            setRemainingWeeklyAnalyses(calculateRemainingAnalyses(updatedTier, weeklyAnalysisCount));

            setStripeCustomerId(data.stripe_customer_id || null);
            setSubscriptionId(data.subscription_id || null);
            setSubscriptionStatus(data.subscription_status || null);
            setPriceId(data.price_id || null);
            setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
        }

        // Om relevanta datum ändrades, uppdatera timers.
        // Brevkvoten nollställs alltid vid nästa midnatt svensk tid.
        if (profileData.last_count_reset || profileData.next_reset_date) {
            const newResetDate = nextMidnightStockholm();
            setNextResetDate(newResetDate);
            setTimeUntilReset(formatTimeRemaining(newResetDate));
        }

        if (profileData.last_competence_analysis_reset || profileData.next_analysis_reset_date) {
            const newAnalysisResetDate = profileData.next_analysis_reset_date
                ? new Date(profileData.next_analysis_reset_date)
                : calculateNextResetDate(data.last_competence_analysis_reset || null);
            setNextAnalysisResetDate(newAnalysisResetDate);
            setTimeUntilAnalysisReset(formatTimeRemaining(newAnalysisResetDate));
        }

        // Låt den delade datan följa med skrivningen så att alla andra
        // konsumenter ser samma nya profil.
        if (hasProvider) {
          void refreshDashboardData();
        }

        return true;
      }
      console.warn('useProfile update: DB update seemed successful but no data returned.');
      return false;
    } catch (error: any) {
      console.error('useProfile update: Exception during updateProfile:', error);
      return false;
    }
  }, [
    supabase,
    subscriptionTier,
    weeklyLetterCount,
    weeklyAnalysisCount,
    calculateRemainingLetters,
    calculateRemainingAnalyses,
    calculateNextResetDate,
    formatTimeRemaining,
    hasProvider,
    refreshDashboardData,
  ]);

  // GDPR
  const setGdprConsentValue = (value: boolean) => { setGdprConsent(value); };

  // Simuleringsfunktioner
  const upgradeSubscription = useCallback(async (newTier: 'premium'): Promise<boolean> => {
    console.warn('useProfile: Running SIMULATED upgradeSubscription. Real status depends on Stripe webhook. Use Stripe checkout flow instead.');
    setIsUpgrading(true);
    try {
      // Simulerar bara en lokal ändring och anrop till updateProfile
      const success = await updateProfile({ subscription_tier: newTier });
      return success;
    } catch (error: any) {
      console.error('useProfile SIMULATED upgrade error:', error);
      return false;
    } finally {
      setIsUpgrading(false);
    }
  }, [updateProfile]);

  const downgradeSubscription = useCallback(async (): Promise<boolean> => {
    console.warn('useProfile: Running SIMULATED downgradeSubscription. Real status depends on Stripe webhook. Use Stripe Customer Portal instead.');
    try {
      const success = await updateProfile({ subscription_tier: 'free' });
      return success;
    } catch (error: any) {
      console.error('useProfile SIMULATED downgrade error:', error);
      return false;
    }
  }, [updateProfile]);

  // CV-funktioner
  const uploadCV = useCallback(async (
    file: File,
    title?: string,
    onPhaseChange?: (phase: 'uploading' | 'vision', label: string) => void,
    onComplete?: (cv: { id: string }) => void,
  ): Promise<boolean> => {
    if (calculateCvLimitReached(subscriptionTier, cvCount)) {
       const limit = SUBSCRIPTION_LIMITS[subscriptionTier].maxCVCount;
       const message = subscriptionTier === 'free'
           ? `Som gratisanvändare kan du bara ha ${formatLimit(limit)} CV. Uppgradera till premium för obegränsade CV:n.`
           : `Du har nått maxgränsen på ${formatLimit(limit)} CV. Ta bort ett befintligt CV först.`;
       console.error('uploadCV Error: Limit reached.');
       throw new Error(message);
    }

    const validTypes = ['.pdf', '.docx', '.txt'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.some(type => fileExt.endsWith(type))) {
       console.error('uploadCV Error: Invalid file type.');
       throw new Error('Ogiltig filtyp. Endast PDF, DOCX och TXT är tillåtna.');
    }

    if (file.size > 5 * 1024 * 1024) {
       console.error('uploadCV Error: File too large.');
       throw new Error('Filen är för stor. Maximal storlek är 5MB.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);

    try {
      const response = await fetch('/api/cv/upload', { method: 'POST', body: formData });

      if (!response.body) {
        throw new Error('Servern svarade utan stream. Försök igen.');
      }

      // Parsa SSE-strömmen: events kommer som "event: phase\ndata: {...}\n\n"
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let completePayload: any = null;
      let errorPayload: { error?: string; message?: string; code?: string } | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          const lines = rawEvent.split('\n');
          let eventName = 'message';
          let dataLine = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) eventName = line.slice(7).trim();
            else if (line.startsWith('data: ')) dataLine += line.slice(6);
          }

          if (dataLine) {
            try {
              const payload = JSON.parse(dataLine);
              if (eventName === 'phase' && onPhaseChange) {
                onPhaseChange(payload.phase, payload.label);
              } else if (eventName === 'complete') {
                completePayload = payload;
              } else if (eventName === 'error') {
                errorPayload = payload;
              }
            } catch (e) {
              console.warn('Kunde inte parsa SSE-event:', dataLine);
            }
          }

          boundary = buffer.indexOf('\n\n');
        }
      }

      if (errorPayload) {
        if (errorPayload.code === 'CV_LIMIT_REACHED') {
          const limit = SUBSCRIPTION_LIMITS[subscriptionTier].maxCVCount;
          throw new Error(subscriptionTier === 'free'
            ? `Som gratisanvändare kan du bara ha ${formatLimit(limit)} CV. Uppgradera till premium.`
            : `Du har nått maxgränsen på ${formatLimit(limit)} CV.`);
        }
        throw new Error(errorPayload.message || errorPayload.error || 'Okänt serverfel vid uppladdning');
      }

      if (completePayload?.success) {
        // completePayload.data är hela cv_texts-raden (se /api/cv/upload).
        const uploadedCv = completePayload.data;
        if (uploadedCv?.id && onComplete) {
          onComplete({ id: uploadedCv.id });
        }
        // Uppdatera den delade datan i stället för två egna anrop.
        if (hasProvider) {
          await refreshDashboardData();
        } else {
          await fetchCvInfo();
          await fetchCvCount();
        }
        setGdprConsent(false);
        return true;
      }

      throw new Error('Uppladdningen avslutades utan svar från servern.');
    } catch (error: any) {
      console.error('uploadCV Exception:', error);
      throw error;
    }
  }, [
    subscriptionTier,
    cvCount,
    gdprConsent,
    fetchCvInfo,
    fetchCvCount,
    calculateCvLimitReached,
    formatLimit,
    hasProvider,
    refreshDashboardData,
  ]);

  const deleteCV = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/cv', { method: 'DELETE' });
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Okänt serverfel vid borttagning' }));
          console.error('deleteCV Error: Server responded with error:', response.status, errorData);
          throw new Error(errorData.error || `Serverfel (${response.status})`);
      }
      const data = await response.json();
      if (data.success) {
        setCv(null);
        if (hasProvider) {
          await refreshDashboardData();
        } else {
          await fetchCvCount();
        }
        return true;
      } else {
         console.error('deleteCV Error: Server responded success=false.', data);
         throw new Error(data.error || 'Okänt fel från servern vid borttagning.');
      }
    } catch (error: any) {
      console.error('deleteCV Exception:', error);
      throw error;
    }
  }, [fetchCvCount, hasProvider, refreshDashboardData]);

  const deleteCVById = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/cv/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ error: 'Okänt serverfel vid borttagning av CV' }));
         console.error('deleteCVById Error: Server responded with error:', response.status, errorData);
         throw new Error(errorData.error || `Serverfel (${response.status})`);
      }
      const data = await response.json();
      if (data.success) {
        if (hasProvider) {
          await refreshDashboardData();
        } else {
          await fetchCvCount();
          await fetchCvInfo();
        }
        return true;
      } else {
         console.error('deleteCVById Error: Server responded success=false.', data);
         throw new Error(data.error || 'Okänt fel från servern vid borttagning av CV.');
      }
    } catch (error: any) {
      console.error('deleteCVById Exception:', error);
      throw error;
    }
  }, [fetchCvCount, fetchCvInfo, hasProvider, refreshDashboardData]);

  // Helper functions for premium source detection
  const premiumUntil = profile?.premium_until ? new Date(profile.premium_until) : null;
  const premiumSource = profile?.premium_source || null;
  const isTrialUser = ['signup_trial', 'oauth_signup_trial'].includes(premiumSource || '');
  const isAdminGranted = premiumSource === 'admin';
  const hasActiveTrialOrPremium = premiumUntil ? premiumUntil > new Date() : false;

  // Har användaren en riktig, betalande Stripe-prenumeration?
  // Detta avgör om Stripe-portalen (och därmed uppsägning) ska visas.
  // Vi litar på Stripe-fälten, inte på premium_source: en användare som först
  // fick gratispremie via onboarding och sedan tecknade abonnemang behåller sin
  // gamla premium_source, och får annars aldrig se någon avsluta-knapp.
  const hasStripeSubscription =
    Boolean(subscriptionId) &&
    !String(subscriptionId).startsWith('sub_test') &&
    ['active', 'trialing', 'past_due', 'unpaid'].includes(subscriptionStatus || '');

  return {
    // Grundläggande profildata
    profile,
    cv,
    gdprConsent,
    loading,

    // Email verification
    isEmailVerified: profile?.email_verified_at !== null,

    // Prenumerationsrelaterad data
    subscriptionTier,
    isUpgrading,
    weeklyLetterCount,
    remainingWeeklyLetters,
    weeklyLetterLimit,

    // Premium source data (NEW)
    premiumUntil,
    premiumSource,
    // A2: hur många gratis CV-exporter kontot har använt (0 eller 1).
    freeCvExportsUsed: (profile as unknown as { free_cv_exports_used?: number } | null)?.free_cv_exports_used ?? 0,
    isTrialUser,
    isAdminGranted,
    hasActiveTrialOrPremium,
    hasStripeSubscription,

    // Gränser och antal
    cvCount,
    maxCvCount,
    hasReachedCvLimit,
    savedLettersCount,
    maxSavedLetters,
    hasReachedLetterLimit,

    // Gränsinformationsobjekt
    subscriptionLimits: SUBSCRIPTION_LIMITS,
    formatLimit,

    // Timer-relaterad information
    nextResetDate,
    timeUntilReset,

    // Stripe-värden
    stripeCustomerId,
    subscriptionId,
    subscriptionStatus,
    priceId,
    currentPeriodEnd,

    // === CV-ANALYS VÄRDEN ===
    weeklyAnalysisCount,
    weeklyAnalysisLimit,
    remainingWeeklyAnalyses,
    nextAnalysisResetDate,
    timeUntilAnalysisReset,

    // Funktioner
    updateProfile,
    uploadCV,
    deleteCV,
    deleteCVById,
    setGdprConsent: setGdprConsentValue,
    refreshProfile: refreshAfterWrite,
    updateNextResetDate,
    updateRemainingLetters,

    // === FUNKTIONER FÖR CV-ANALYS ===
    updateNextAnalysisResetDate,
    updateRemainingAnalyses,

    // Simuleringsfunktioner
    upgradeSubscription,
    downgradeSubscription,
  };
};
