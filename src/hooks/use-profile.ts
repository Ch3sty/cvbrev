// src/hooks/use-profile.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Profile, ProfileUpdateParams, CV } from '@/types/user.types';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

// Konstanter för prenumerationsbegränsningar
const SUBSCRIPTION_LIMITS = {
  free: {
    maxSavedLetters: 2,
    dailyLetterLimit: 2,      // Nytt: 2 brev per dag (ersätter weeklyLetterLimit)
    weeklyLetterLimit: 5,     // Behålls för bakåtkompatibilitet
    maxCVCount: 2,
    weeklyAnalysisLimit: 1,   // Ändrat: 1 analys per vecka (från 2)
    availableTonalities: ['professional', 'enthusiastic', 'confident', 'balanced', 'creative'],
  },
  premium: {
    maxSavedLetters: Infinity,
    dailyLetterLimit: Infinity,      // Nytt: obegränsade brev per dag
    weeklyLetterLimit: Infinity,     // Behålls för bakåtkompatibilitet
    maxCVCount: Infinity,
    weeklyAnalysisLimit: Infinity,   // Obegränsade analyser för premium
    availableTonalities: ['professional', 'enthusiastic', 'confident', 'balanced', 'creative', 'auto'],
  }
};

export const useProfile = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cv, setCv] = useState<CV | null>(null);
  const [gdprConsent, setGdprConsent] = useState<boolean>(false);

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

  // --- NY STATE FÖR CV-ANALYS ---
  const [weeklyAnalysisCount, setWeeklyAnalysisCount] = useState<number>(0);
  const [weeklyAnalysisLimit, setWeeklyAnalysisLimit] = useState<number>(SUBSCRIPTION_LIMITS.free.weeklyAnalysisLimit);
  const [lastAnalysisReset, setLastAnalysisReset] = useState<string | null>(null);
  const [remainingWeeklyAnalyses, setRemainingWeeklyAnalyses] = useState<number>(SUBSCRIPTION_LIMITS.free.weeklyAnalysisLimit);
  const [nextAnalysisResetDate, setNextAnalysisResetDate] = useState<Date | null>(null);
  const [timeUntilAnalysisReset, setTimeUntilAnalysisReset] = useState<string>('');
  const analysisTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // --- SLUT PÅ NY STATE ---


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

  // --- NY HJÄLPFUNKTION FÖR ANALYS ---
  const calculateRemainingAnalyses = useCallback((tier: 'free' | 'premium', count: number) => {
    const limit = SUBSCRIPTION_LIMITS[tier].weeklyAnalysisLimit;
    if (!isFinite(limit)) return Infinity;
    return Math.max(0, limit - count);
  }, []);
  // --- SLUT PÅ NY HJÄLPFUNKTION ---


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
            console.log("useProfile: Letter reset date reached, refreshing profile...");
            fetchProfileRef.current();
        }
      } else {
        setTimeUntilReset(formatTimeRemaining(nextResetDate));
      }
    }, 60000); // Uppdatera varje minut
    timerIntervalRef.current = interval;
  }, [nextResetDate, formatTimeRemaining, weeklyLetterLimit]);

  // --- NY TIMER-FUNKTION FÖR ANALYS ---
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
            console.log("useProfile: Analysis reset date reached, refreshing profile...");
            fetchProfileRef.current();
        }
      } else {
        setTimeUntilAnalysisReset(formatTimeRemaining(nextAnalysisResetDate));
      }
    }, 60000); // Uppdatera varje minut
    analysisTimerIntervalRef.current = interval;
  }, [nextAnalysisResetDate, formatTimeRemaining, weeklyAnalysisLimit]);
  // --- SLUT PÅ NY TIMER-FUNKTION ---

  const updateNextResetDate = useCallback((newResetDate: Date) => {
    setNextResetDate(newResetDate);
    startResetTimer();
  }, [startResetTimer]);

  // --- NYA UPPDATERINGSFUNKTIONER FÖR ANALYS ---
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
  // --- SLUT PÅ NYA UPPDATERINGSFUNKTIONER ---

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

  // Hämta profil
  const fetchProfile = useCallback(async (): Promise<Profile | null> => {
    console.log("useProfile: Fetching profile data...");
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('useProfile: User not logged in or session error:', sessionError);
        setLoading(false);
        // Återställ till default gratis-state
        setProfile(null); setCv(null); setGdprConsent(false);
        setSubscriptionTier('free');
        setMaxCvCount(SUBSCRIPTION_LIMITS.free.maxCVCount);
        setMaxSavedLetters(SUBSCRIPTION_LIMITS.free.maxSavedLetters);
        setWeeklyLetterLimit(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit);
        setWeeklyLetterCount(0); setLastCountReset(null);
        setRemainingWeeklyLetters(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit);
        
        // Återställ Stripe-states
        setStripeCustomerId(null); setSubscriptionId(null);
        setSubscriptionStatus(null); setPriceId(null); setCurrentPeriodEnd(null);
        
        // Återställ reset-timers
        const defaultReset = calculateNextResetDate(null);
        setNextResetDate(defaultReset); 
        setTimeUntilReset(formatTimeRemaining(defaultReset));
        
        // Återställ CV och brev counts
        setCvCount(0); setHasReachedCvLimit(false);
        setSavedLettersCount(0); setHasReachedLetterLimit(false);
        
        // --- NY RESET FÖR ANALYS STATE ---
        setWeeklyAnalysisLimit(SUBSCRIPTION_LIMITS.free.weeklyAnalysisLimit);
        setWeeklyAnalysisCount(0);
        setLastAnalysisReset(null);
        setRemainingWeeklyAnalyses(SUBSCRIPTION_LIMITS.free.weeklyAnalysisLimit);
        setNextAnalysisResetDate(defaultReset);
        setTimeUntilAnalysisReset(formatTimeRemaining(defaultReset));
        // --- SLUT PÅ NY RESET ---
        
        return null;
      }
      console.log("useProfile: Session found for user:", session.user.id);

      // Hämta profildata med de nya analys-fälten - ÄNDRAT KOLUMNNAMN HÄR
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
        console.log("useProfile: Profile data received from DB:", data);
        setProfile(data);

        // Hantera prenumerations- och Stripe-data
        const dbTier = (data.subscription_tier === 'premium' ? 'premium' : 'free');
        console.log("useProfile: Determined tier from DB:", dbTier);
        setSubscriptionTier(dbTier);

        setMaxCvCount(SUBSCRIPTION_LIMITS[dbTier].maxCVCount);
        setMaxSavedLetters(SUBSCRIPTION_LIMITS[dbTier].maxSavedLetters);
        setWeeklyLetterLimit(SUBSCRIPTION_LIMITS[dbTier].weeklyLetterLimit);
        // --- NY LIMIT FÖR ANALYS ---
        setWeeklyAnalysisLimit(SUBSCRIPTION_LIMITS[dbTier].weeklyAnalysisLimit);
        // --- SLUT PÅ NY LIMIT ---
        
        console.log("useProfile: Set limits based on tier:", { 
          maxCv: SUBSCRIPTION_LIMITS[dbTier].maxCVCount, 
          maxLetters: SUBSCRIPTION_LIMITS[dbTier].maxSavedLetters, 
          weeklyLimit: SUBSCRIPTION_LIMITS[dbTier].weeklyLetterLimit,
          weeklyAnalysisLimit: SUBSCRIPTION_LIMITS[dbTier].weeklyAnalysisLimit // Logga analys limit
        });

        setStripeCustomerId(data.stripe_customer_id || null);
        setSubscriptionId(data.subscription_id || null);
        setSubscriptionStatus(data.subscription_status || null);
        setPriceId(data.price_id || null);
        setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);

        // Hantera brevräknare och återställning
        const currentWeeklyCount = data.weekly_letter_count || 0;
        setWeeklyLetterCount(currentWeeklyCount);
        setLastCountReset(data.last_count_reset || null);
        setRemainingWeeklyLetters(calculateRemainingLetters(dbTier, currentWeeklyCount));
        const nextReset = calculateNextResetDate(data.last_count_reset || null);
        setNextResetDate(nextReset);
        setTimeUntilReset(formatTimeRemaining(nextReset));
        
        // --- NY HANTERING FÖR ANALYS RÄKNARE - ÄNDRAT KOLUMNNAMN HÄR ---
        const currentAnalysisCount = data.weekly_competence_analysis_count || 0;
        setWeeklyAnalysisCount(currentAnalysisCount);
        setLastAnalysisReset(data.last_competence_analysis_reset || null);
        setRemainingWeeklyAnalyses(calculateRemainingAnalyses(dbTier, currentAnalysisCount));
        const nextAnalysisReset = calculateNextResetDate(data.last_competence_analysis_reset || null);
        setNextAnalysisResetDate(nextAnalysisReset);
        setTimeUntilAnalysisReset(formatTimeRemaining(nextAnalysisReset));
        console.log("useProfile: Set analysis count & reset:", {
          count: currentAnalysisCount,
          remaining: calculateRemainingAnalyses(dbTier, currentAnalysisCount),
          nextReset: nextAnalysisReset
        });
        // --- SLUT PÅ NY HANTERING ---


        // Hämta relaterad info
        await fetchCvInfo();
        fetchCvCount();
        fetchSavedLettersCount();

        console.log("useProfile: Profile fetch complete.");
        return data;
      } else {
        // Ingen profil hittad i DB för inloggad användare
        console.warn("useProfile: No profile found in DB for user:", session.user.id, "- Treating as new free user.");
        setProfile(null);
        // Återställ till default gratis-state (med analys)
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
        
        // --- NYA DEFAULT VÄRDEN FÖR ANALYS ---
        setWeeklyAnalysisLimit(SUBSCRIPTION_LIMITS.free.weeklyAnalysisLimit);
        setWeeklyAnalysisCount(0);
        setLastAnalysisReset(null);
        setRemainingWeeklyAnalyses(SUBSCRIPTION_LIMITS.free.weeklyAnalysisLimit);
        setNextAnalysisResetDate(defaultReset);
        setTimeUntilAnalysisReset(formatTimeRemaining(defaultReset));
        // --- SLUT PÅ NYA DEFAULT VÄRDEN ---
        
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
      console.log("useProfile: fetchProfile finished, loading set to false.");
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
  
  // --- NY EFFEKT FÖR ANALYS TIMER ---
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
  // --- SLUT PÅ NY EFFEKT ---

  // Hämta profil vid mount
  useEffect(() => {
    console.log("useProfile: Component mounted, initiating initial fetchProfile.");
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effekt för att hämta om räknare när tier ändras
  useEffect(() => {
    if (!loading) {
      console.log("useProfile: subscriptionTier changed to", subscriptionTier, "- refetching counts.");
      fetchCvCount();
      fetchSavedLettersCount();
    }
  }, [subscriptionTier, loading, fetchCvCount, fetchSavedLettersCount]);

  // Uppdatera profil
  const updateProfile = useCallback(async (profileData: ProfileUpdateParams): Promise<boolean> => {
    console.log("useProfile: Attempting to update profile with data:", profileData);
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
        console.log("useProfile update: Profile updated successfully in DB. New data:", data);
        setProfile(data);

        // Om tier ändrades
        const updatedTier = (data.subscription_tier === 'premium' ? 'premium' : 'free');
        if (updatedTier !== subscriptionTier) {
            console.warn("useProfile update: subscription_tier was changed directly via updateProfile. Webhook should normally handle this.");
            setSubscriptionTier(updatedTier);
            setMaxCvCount(SUBSCRIPTION_LIMITS[updatedTier].maxCVCount);
            setMaxSavedLetters(SUBSCRIPTION_LIMITS[updatedTier].maxSavedLetters);
            setWeeklyLetterLimit(SUBSCRIPTION_LIMITS[updatedTier].weeklyLetterLimit);
            setWeeklyAnalysisLimit(SUBSCRIPTION_LIMITS[updatedTier].weeklyAnalysisLimit); // Ny uppdatering
            setRemainingWeeklyLetters(calculateRemainingLetters(updatedTier, weeklyLetterCount));
            // --- NY BERÄKNING FÖR ANALYS ---
            setRemainingWeeklyAnalyses(calculateRemainingAnalyses(updatedTier, weeklyAnalysisCount));
            // --- SLUT PÅ NY BERÄKNING ---
            
            setStripeCustomerId(data.stripe_customer_id || null);
            setSubscriptionId(data.subscription_id || null);
            setSubscriptionStatus(data.subscription_status || null);
            setPriceId(data.price_id || null);
            setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
        }

        // Om relevanta datum ändrades, uppdatera timers
        if (profileData.last_count_reset || profileData.next_reset_date) {
            const newResetDate = profileData.next_reset_date
                ? new Date(profileData.next_reset_date)
                : calculateNextResetDate(data.last_count_reset || null);
            setNextResetDate(newResetDate);
            setTimeUntilReset(formatTimeRemaining(newResetDate));
        }
        
        
        // --- NYA UPPDATERINGAR FÖR ANALYSDATUM - ÄNDRAT KOLUMNNAMN HÄR ---
        if (profileData.last_competence_analysis_reset || profileData.next_analysis_reset_date) {
            const newAnalysisResetDate = profileData.next_analysis_reset_date
                ? new Date(profileData.next_analysis_reset_date)
                : calculateNextResetDate(data.last_competence_analysis_reset || null);
            setNextAnalysisResetDate(newAnalysisResetDate);
            setTimeUntilAnalysisReset(formatTimeRemaining(newAnalysisResetDate));
        }
        // --- SLUT PÅ NYA UPPDATERINGAR ---

        return true;
      }
      console.warn("useProfile update: DB update seemed successful but no data returned.");
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
    formatTimeRemaining
  ]);

  // GDPR
  const setGdprConsentValue = (value: boolean) => { setGdprConsent(value); };

  // Simuleringsfunktioner
  const upgradeSubscription = useCallback(async (newTier: 'premium'): Promise<boolean> => {
    console.warn("useProfile: Running SIMULATED upgradeSubscription. Real status depends on Stripe webhook. Use Stripe checkout flow instead.");
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
    console.warn("useProfile: Running SIMULATED downgradeSubscription. Real status depends on Stripe webhook. Use Stripe Customer Portal instead.");
    try {
      const success = await updateProfile({ subscription_tier: 'free' });
      return success;
    } catch (error: any) {
      console.error('useProfile SIMULATED downgrade error:', error);
      return false;
    }
  }, [updateProfile]);

  // CV-funktioner
  const uploadCV = useCallback(async (file: File, title?: string): Promise<boolean> => {
    console.log("useProfile: Attempting to upload CV:", file.name);
    if (calculateCvLimitReached(subscriptionTier, cvCount)) {
       const limit = SUBSCRIPTION_LIMITS[subscriptionTier].maxCVCount;
       const message = subscriptionTier === 'free'
           ? `Som gratisanvändare kan du bara ha ${formatLimit(limit)} CV. Uppgradera till premium för obegränsade CV:n.`
           : `Du har nått maxgränsen på ${formatLimit(limit)} CV. Ta bort ett befintligt CV först.`;
       console.error("uploadCV Error: Limit reached.");
       throw new Error(message);
    }

    // GDPR-kontrollen har tagits bort härifrån eftersom:
    // - Upload-knappen i CVUploadZone är disabled om GDPR ej accepterad
    // - Användaren kan inte klicka utan att bocka i GDPR först
    // - React state updates är asynkrona vilket skapade timing-problem

    const validTypes = ['.pdf', '.docx', '.txt'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.some(type => fileExt.endsWith(type))) {
       console.error("uploadCV Error: Invalid file type.");
       throw new Error('Ogiltig filtyp. Endast PDF, DOCX och TXT är tillåtna.');
    }

    if (file.size > 5 * 1024 * 1024) {
       console.error("uploadCV Error: File too large.");
       throw new Error('Filen är för stor. Maximal storlek är 5MB.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);

    try {
      const response = await fetch('/api/cv/upload', { method: 'POST', body: formData });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Okänt serverfel vid uppladdning' }));
        console.error("uploadCV Error: Server responded with error:", response.status, errorData);
        if (errorData.code === 'CV_LIMIT_REACHED' || response.status === 403) {
             const limit = SUBSCRIPTION_LIMITS[subscriptionTier].maxCVCount;
             throw new Error(subscriptionTier === 'free'
                 ? `Som gratisanvändare kan du bara ha ${formatLimit(limit)} CV. Uppgradera till premium.`
                 : `Du har nått maxgränsen på ${formatLimit(limit)} CV.`);
        }
        throw new Error(errorData.error || `Serverfel (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        console.log("useProfile: CV uploaded successfully. Refreshing counts and info.");
        await fetchCvInfo();
        await fetchCvCount();
        setGdprConsent(false);
        return true;
      } else {
        console.error("uploadCV Error: Server responded success=false.", data);
        throw new Error(data.error || "Okänt fel från servern efter uppladdning.");
      }
    } catch (error: any) {
      console.error('uploadCV Exception:', error);
      throw error;
    }
  }, [subscriptionTier, cvCount, gdprConsent, fetchCvInfo, fetchCvCount, calculateCvLimitReached, formatLimit]);

  const deleteCV = useCallback(async (): Promise<boolean> => {
    console.log("useProfile: Attempting to delete primary CV (legacy function).");
    try {
      const response = await fetch('/api/cv', { method: 'DELETE' });
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Okänt serverfel vid borttagning' }));
          console.error("deleteCV Error: Server responded with error:", response.status, errorData);
          throw new Error(errorData.error || `Serverfel (${response.status})`);
      }
      const data = await response.json();
      if (data.success) {
        console.log("useProfile: Primary CV deleted successfully. Resetting state and counts.");
        setCv(null);
        await fetchCvCount();
        return true;
      } else {
         console.error("deleteCV Error: Server responded success=false.", data);
         throw new Error(data.error || "Okänt fel från servern vid borttagning.");
      }
    } catch (error: any) {
      console.error('deleteCV Exception:', error);
      throw error;
    }
  }, [fetchCvCount]);

  const deleteCVById = useCallback(async (id: string): Promise<boolean> => {
    console.log("useProfile: Attempting to delete CV with ID:", id);
    try {
      const response = await fetch('/api/cv/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ error: 'Okänt serverfel vid borttagning av CV' }));
         console.error("deleteCVById Error: Server responded with error:", response.status, errorData);
         throw new Error(errorData.error || `Serverfel (${response.status})`);
      }
      const data = await response.json();
      if (data.success) {
        console.log("useProfile: CV", id, "deleted successfully. Refreshing counts and info.");
        await fetchCvCount();
        await fetchCvInfo();
        return true;
      } else {
         console.error("deleteCVById Error: Server responded success=false.", data);
         throw new Error(data.error || "Okänt fel från servern vid borttagning av CV.");
      }
    } catch (error: any) {
      console.error('deleteCVById Exception:', error);
      throw error;
    }
  }, [fetchCvCount, fetchCvInfo]);

  // Helper functions for premium source detection
  const premiumUntil = profile?.premium_until ? new Date(profile.premium_until) : null;
  const premiumSource = profile?.premium_source || null;
  const isTrialUser = ['signup_trial', 'oauth_signup_trial'].includes(premiumSource || '');
  const isAdminGranted = premiumSource === 'admin';
  const hasActiveTrialOrPremium = premiumUntil ? premiumUntil > new Date() : false;

  return {
    // Grundläggande profildata
    profile,
    cv,
    gdprConsent,
    loading,

    // Prenumerationsrelaterad data
    subscriptionTier,
    isUpgrading,
    weeklyLetterCount,
    remainingWeeklyLetters,
    weeklyLetterLimit,

    // Premium source data (NEW)
    premiumUntil,
    premiumSource,
    isTrialUser,
    isAdminGranted,
    hasActiveTrialOrPremium,

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
    
    // === NYA CV-ANALYS VÄRDEN ===
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
    refreshProfile: fetchProfile,
    updateNextResetDate,
    updateRemainingLetters,
    
    // === NYA FUNKTIONER FÖR CV-ANALYS ===
    updateNextAnalysisResetDate,
    updateRemainingAnalyses,
    
    // Simuleringsfunktioner
    upgradeSubscription,
    downgradeSubscription,
  };
};