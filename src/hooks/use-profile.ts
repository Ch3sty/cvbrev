// src/hooks/use-profile.ts
// ========================
// KOMPLETT VERSION: Inkluderar hämtning och exponering av Stripe-data,
// samtidigt som all befintlig logik och funktioner behålls.

import { useState, useEffect, useCallback, useRef } from 'react';
import { Profile, ProfileUpdateParams, CV } from '@/types/user.types';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

// Konstanter för prenumerationsbegränsningar (behålls)
const SUBSCRIPTION_LIMITS = {
  free: {
    maxSavedLetters: 2,
    weeklyLetterLimit: 5,
    maxCVCount: 1,
    availableTonalities: ['professional', 'enthusiastic', 'confident', 'balanced', 'creative'],
  },
  premium: {
    // Justera dessa om Premium ska ha obegränsat eller andra gränser
    maxSavedLetters: Infinity, // Ändrat till Infinity för premium
    weeklyLetterLimit: Infinity,
    maxCVCount: Infinity,     // Ändrat till Infinity för premium
    availableTonalities: ['professional', 'enthusiastic', 'confident', 'balanced', 'creative', 'auto'],
  }
};

export const useProfile = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cv, setCv] = useState<CV | null>(null);
  const [gdprConsent, setGdprConsent] = useState<boolean>(false);

  // Prenumerationsrelaterad state (behålls, men tier styrs av DB)
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium'>('free'); // Default, uppdateras från DB
  const [weeklyLetterCount, setWeeklyLetterCount] = useState<number>(0);
  const [weeklyLetterLimit, setWeeklyLetterLimit] = useState<number>(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit); // Default
  const [lastCountReset, setLastCountReset] = useState<string | null>(null);
  const [remainingWeeklyLetters, setRemainingWeeklyLetters] = useState<number>(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit); // Default
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false); // För simuleringsknapp

  // === NY STATE FÖR STRIPE-DATA ===
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null); // Exakt status från Stripe ('active', 'trialing', 'canceled', etc.)
  const [priceId, setPriceId] = useState<string | null>(null); // Aktuell price_id från Stripe
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null); // När perioden slutar (som Date)
  // =================================

  // State för återställningsdatum och nedräkning (behålls)
  const [nextResetDate, setNextResetDate] = useState<Date | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ref för fetchProfile (behålls)
  const fetchProfileRef = useRef<(() => Promise<Profile | null>) | null>(null);

  // CV-relaterad state (behålls)
  const [cvCount, setCvCount] = useState(0);
  const [hasReachedCvLimit, setHasReachedCvLimit] = useState(false);
  const [maxCvCount, setMaxCvCount] = useState(SUBSCRIPTION_LIMITS.free.maxCVCount); // Default

  // Letters-relaterad state (behålls)
  const [savedLettersCount, setSavedLettersCount] = useState(0);
  const [hasReachedLetterLimit, setHasReachedLetterLimit] = useState(false);
  const [maxSavedLetters, setMaxSavedLetters] = useState(SUBSCRIPTION_LIMITS.free.maxSavedLetters); // Default

  // Supabase-klient (behålls)
  const supabase = getSupabaseClient();

  // Hjälpfunktioner (behålls oförändrade)
  const formatLimit = useCallback((value: number): string => {
    if (!isFinite(value)) return '∞'; // Korrekt hantering av Infinity
    return value.toString();
  }, []);

  const formatTimeRemaining = useCallback((targetDate: Date | null): string => {
    if (!targetDate) return ''; // Hantera null-värde
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
    if (!isFinite(limit)) return Infinity; // Hantera Infinity
    return Math.max(0, limit - count);
  }, []);

  const calculateLetterLimitReached = useCallback((tier: 'free' | 'premium', count: number) => {
    const limit = SUBSCRIPTION_LIMITS[tier].maxSavedLetters;
    if (!isFinite(limit)) return false; // Aldrig nådd om obegränsad
    return count >= limit;
  }, []);

  const calculateCvLimitReached = useCallback((tier: 'free' | 'premium', count: number) => {
    const limit = SUBSCRIPTION_LIMITS[tier].maxCVCount;
    if (!isFinite(limit)) return false; // Aldrig nådd om obegränsad
    return count >= limit;
  }, []);

  const calculateNextResetDate = useCallback((lastResetTimestamp: string | null): Date => {
    const lastReset = lastResetTimestamp ? new Date(lastResetTimestamp) : new Date();
    const nextReset = new Date(lastReset);
    // Sätt nästa återställning till nästa måndag kl 00:00 UTC (eller annan logik du föredrar)
    // Exempel: Nästa måndag
    const dayOfWeek = nextReset.getUTCDay(); // 0=Söndag, 1=Måndag,...
    const daysUntilMonday = (dayOfWeek === 0 ? 1 : 8 - dayOfWeek); // 1 om söndag, annars 8-day
    nextReset.setUTCDate(nextReset.getUTCDate() + daysUntilMonday);
    nextReset.setUTCHours(0, 0, 0, 0);

    // Om nästa måndag redan passerat denna vecka, ta nästa veckas måndag
    if (nextReset.getTime() <= lastReset.getTime()) {
        nextReset.setUTCDate(nextReset.getUTCDate() + 7);
    }

    return nextReset;
  }, []);

  // Funktion för att hämta CV-information från API (behålls oförändrad)
  const fetchCvInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/cv'); // Antag att denna endpoint finns och är säker
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
  }, []); // Inga beroenden, använder bara fetch API

  // === UPPDATERADE FETCH-FUNKTIONER FÖR ATT ANVÄNDA AKTUELL TIER ===
  const fetchSavedLettersCount = useCallback(async () => {
    // Denna funktion behöver tillgång till den *aktuella* tier som hämtas i fetchProfile.
    // Vi gör den beroende av `subscriptionTier`-state, som sätts i fetchProfile.
    if (loading) return 0; // Vänta tills profilen är laddad

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
      // Använd den aktuella `subscriptionTier` från state för att beräkna gränsen
      setHasReachedLetterLimit(calculateLetterLimitReached(subscriptionTier, currentCount));
      return currentCount;

    } catch (error) { console.error('fetchSavedLettersCount Exception:', error); return 0; }
  }, [supabase, subscriptionTier, calculateLetterLimitReached, loading]); // Beroende av tier & loading

  const fetchCvCount = useCallback(async () => {
    // Samma logik som ovan: beroende av den aktuella tier från state.
     if (loading) return 0; // Vänta tills profilen är laddad

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return 0;

      // Antag att cv_texts är din tabell för CV:n
      const { count, error } = await supabase
        .from('cv_texts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      if (error) { console.error('fetchCvCount Error:', error); return 0; }

      const currentCount = count || 0;
      setCvCount(currentCount);
      // Använd den aktuella `subscriptionTier` från state
      setHasReachedCvLimit(calculateCvLimitReached(subscriptionTier, currentCount));
      return currentCount;

    } catch (error) { console.error('fetchCvCount Exception:', error); return 0; }
  }, [supabase, subscriptionTier, calculateCvLimitReached, loading]); // Beroende av tier & loading

  // Funktioner för timer (behålls oförändrade)
  const startResetTimer = useCallback(() => {
    if (!nextResetDate) return;
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); }

    setTimeUntilReset(formatTimeRemaining(nextResetDate));

    const interval = setInterval(() => {
      const now = new Date();
      if (now >= nextResetDate) {
        clearInterval(interval);
        timerIntervalRef.current = null;
        // Trigga omhämtning av profilen eftersom räknaren borde nollställts på backend
        if (fetchProfileRef.current) {
            console.log("useProfile: Reset date reached, refreshing profile...");
            fetchProfileRef.current();
        }
      } else {
        setTimeUntilReset(formatTimeRemaining(nextResetDate));
      }
    }, 60000); // Uppdatera varje minut
    timerIntervalRef.current = interval;
  }, [nextResetDate, formatTimeRemaining]);

  const updateNextResetDate = useCallback((newResetDate: Date) => {
    setNextResetDate(newResetDate);
    // Starta om timern med det nya datumet
    startResetTimer();
  }, [formatTimeRemaining, startResetTimer]); // Beroende av startResetTimer

  const updateRemainingLetters = useCallback((newRemainingCount: number) => {
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier].weeklyLetterLimit;
    if (!isFinite(limit)) {
      setRemainingWeeklyLetters(Infinity);
      setWeeklyLetterCount(0); // Obegränsat betyder att räknaren inte är relevant på samma sätt
    } else {
      setRemainingWeeklyLetters(Math.max(0, newRemainingCount));
      const newCount = Math.max(0, limit - Math.max(0, newRemainingCount));
      setWeeklyLetterCount(newCount);
    }
  }, [subscriptionTier]);

  // === HÄMTA PROFIL - UPPDATERAD FÖR STRIPE ===
  const fetchProfile = useCallback(async (): Promise<Profile | null> => {
    console.log("useProfile: Fetching profile data...");
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('useProfile: User not logged in or session error:', sessionError);
        setLoading(false);
        // Återställ till default gratis-state om ingen session finns
        setProfile(null); setCv(null); setGdprConsent(false);
        setSubscriptionTier('free');
        setMaxCvCount(SUBSCRIPTION_LIMITS.free.maxCVCount);
        setMaxSavedLetters(SUBSCRIPTION_LIMITS.free.maxSavedLetters);
        setWeeklyLetterLimit(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit);
        setWeeklyLetterCount(0); setLastCountReset(null);
        setRemainingWeeklyLetters(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit);
        setStripeCustomerId(null); setSubscriptionId(null);
        setSubscriptionStatus(null); setPriceId(null); setCurrentPeriodEnd(null);
        const defaultReset = calculateNextResetDate(null);
        setNextResetDate(defaultReset); setTimeUntilReset(formatTimeRemaining(defaultReset));
        setCvCount(0); setHasReachedCvLimit(false);
        setSavedLettersCount(0); setHasReachedLetterLimit(false);
        return null;
      }
      console.log("useProfile: Session found for user:", session.user.id);

      // Hämta profildata - säkerställ att alla relevanta fält finns i din 'profiles'-tabell
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
          last_count_reset
        `)
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // Ignorera "not found"
        console.error('useProfile: Error fetching profile from DB:', profileError);
        // Behåll tidigare state eller återställ vid allvarligt fel? Behåller tills vidare.
        return profile; // Returnera befintligt profil-state om det finns
      }

      if (data) {
        console.log("useProfile: Profile data received from DB:", data);
        setProfile(data); // Sätt grundläggande profil

        // *** Hantera prenumerations- och Stripe-data ***
        const dbTier = (data.subscription_tier === 'premium' ? 'premium' : 'free'); // Säkerställ typ
        console.log("useProfile: Determined tier from DB:", dbTier);
        setSubscriptionTier(dbTier);

        setMaxCvCount(SUBSCRIPTION_LIMITS[dbTier].maxCVCount);
        setMaxSavedLetters(SUBSCRIPTION_LIMITS[dbTier].maxSavedLetters);
        setWeeklyLetterLimit(SUBSCRIPTION_LIMITS[dbTier].weeklyLetterLimit);
        console.log("useProfile: Set limits based on tier:", { maxCv: SUBSCRIPTION_LIMITS[dbTier].maxCVCount, maxLetters: SUBSCRIPTION_LIMITS[dbTier].maxSavedLetters, weeklyLimit: SUBSCRIPTION_LIMITS[dbTier].weeklyLetterLimit });

        setStripeCustomerId(data.stripe_customer_id || null);
        setSubscriptionId(data.subscription_id || null);
        setSubscriptionStatus(data.subscription_status || null);
        setPriceId(data.price_id || null);
        setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
        console.log("useProfile: Set Stripe states:", { custId: data.stripe_customer_id, subId: data.subscription_id, status: data.subscription_status, price: data.price_id, end: data.current_period_end });

        // Hantera veckoräknare och återställning
        const currentWeeklyCount = data.weekly_letter_count || 0;
        setWeeklyLetterCount(currentWeeklyCount);
        setLastCountReset(data.last_count_reset || null);
        setRemainingWeeklyLetters(calculateRemainingLetters(dbTier, currentWeeklyCount));
        const nextReset = calculateNextResetDate(data.last_count_reset || null);
        setNextResetDate(nextReset);
        setTimeUntilReset(formatTimeRemaining(nextReset));
        console.log("useProfile: Set weekly count & reset:", { count: currentWeeklyCount, remaining: calculateRemainingLetters(dbTier, currentWeeklyCount), nextReset: nextReset });

        // Hämta relaterad info EFTER att tier är satt
        await fetchCvInfo();
        // Vänta inte på dessa, låt dem köra och uppdatera state när de är klara
        fetchCvCount();
        fetchSavedLettersCount();

        console.log("useProfile: Profile fetch complete.");
        return data;
      } else {
        // Ingen profil hittad i DB för inloggad användare (kan hända första gången)
        console.warn("useProfile: No profile found in DB for user:", session.user.id, "- Treating as new free user.");
        setProfile(null); // Ingen profil
        // Återställ till default gratis-state
        setSubscriptionTier('free');
        setMaxCvCount(SUBSCRIPTION_LIMITS.free.maxCVCount);
        setMaxSavedLetters(SUBSCRIPTION_LIMITS.free.maxSavedLetters);
        setWeeklyLetterLimit(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit);
        setWeeklyLetterCount(0); setLastCountReset(null);
        setRemainingWeeklyLetters(SUBSCRIPTION_LIMITS.free.weeklyLetterLimit);
        setStripeCustomerId(null); setSubscriptionId(null);
        setSubscriptionStatus(null); setPriceId(null); setCurrentPeriodEnd(null);
        const defaultReset = calculateNextResetDate(null);
        setNextResetDate(defaultReset); setTimeUntilReset(formatTimeRemaining(defaultReset));
        setCvCount(0); setHasReachedCvLimit(false);
        setSavedLettersCount(0); setHasReachedLetterLimit(false);
        await fetchCvInfo(); // Försök hämta CV ändå
        return null;
      }
    } catch (error: any) {
      console.error('useProfile: Exception during fetchProfile execution:', error);
      // Återställ till säkert grundläge vid oväntat fel
      setProfile(null); setSubscriptionTier('free');
      // ... (liknande nollställning som vid ingen session) ...
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
    fetchCvCount, // Inkludera dessa även om de körs asynkront inuti
    fetchSavedLettersCount // Deras state-uppdateringar triggar re-renders
    // Ta bort calculateCvLimitReached och calculateLetterLimitReached härifrån,
    // de används internt av fetchCvCount/fetchSavedLettersCount som har rätt beroenden.
  ]);

  // Spara fetchProfile ref (behålls)
  useEffect(() => {
    fetchProfileRef.current = fetchProfile;
  }, [fetchProfile]);

  // Starta timer (behålls)
  useEffect(() => {
    if (nextResetDate) {
      startResetTimer();
    }
    return () => { if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); } };
  }, [nextResetDate, startResetTimer]);

  // Hämta profil vid mount (behålls)
  useEffect(() => {
    console.log("useProfile: Component mounted, initiating initial fetchProfile.");
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Körs endast en gång vid montering

   // Effekt för att hämta om CV/Letter counts när tier ändras *efter* initial laddning
   useEffect(() => {
     if (!loading) { // Kör endast efter initial laddning är klar
       console.log("useProfile: subscriptionTier changed to", subscriptionTier, "- refetching counts.");
       fetchCvCount();
       fetchSavedLettersCount();
     }
   }, [subscriptionTier, loading, fetchCvCount, fetchSavedLettersCount]); // Beroende av tier och loading


  // Uppdatera profil (behålls, med varning för direkt tier-ändring)
  const updateProfile = useCallback(async (profileData: ProfileUpdateParams): Promise<boolean> => {
    console.log("useProfile: Attempting to update profile with data:", profileData);
    try {
      if (profileData.full_name !== undefined && profileData.full_name.trim() === '') {
        console.warn('useProfile update: Full name cannot be empty.');
        return false;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { console.error('useProfile update: User not logged in.'); return false; }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select() // Select för att få tillbaka *all* uppdaterad data
        .single(); // Antag att vi bara uppdaterar en rad

      if (error) {
        console.error('useProfile update: Error updating profile in DB:', error);
        return false;
      }

      if (data) {
        console.log("useProfile update: Profile updated successfully in DB. New data:", data);
        // Uppdatera lokal profilestate MED den returnerade datan
        setProfile(data);

        // Om tier ändrades *via detta anrop* (bör ej hända med Stripe, men för säkerhets skull)
        const updatedTier = (data.subscription_tier === 'premium' ? 'premium' : 'free');
        if (updatedTier !== subscriptionTier) {
            console.warn("useProfile update: subscription_tier was changed directly via updateProfile. Webhook should normally handle this.");
            // Synka ALLT relaterat state om tier ändrades här
            setSubscriptionTier(updatedTier);
            setMaxCvCount(SUBSCRIPTION_LIMITS[updatedTier].maxCVCount);
            setMaxSavedLetters(SUBSCRIPTION_LIMITS[updatedTier].maxSavedLetters);
            setWeeklyLetterLimit(SUBSCRIPTION_LIMITS[updatedTier].weeklyLetterLimit);
            setRemainingWeeklyLetters(calculateRemainingLetters(updatedTier, weeklyLetterCount)); // Använd befintlig count
             // Uppdatera Stripe-status också om det kom med i datan
             setStripeCustomerId(data.stripe_customer_id || null);
             setSubscriptionId(data.subscription_id || null);
             setSubscriptionStatus(data.subscription_status || null);
             setPriceId(data.price_id || null);
             setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
        }

        // Om relevanta datum ändrades, uppdatera timer
        if (profileData.last_count_reset || profileData.next_reset_date) { // Antag att next_reset_date kan sättas här
             const newResetDate = profileData.next_reset_date
                 ? new Date(profileData.next_reset_date)
                 : calculateNextResetDate(data.last_count_reset || null); // Använd den uppdaterade last_count_reset
             setNextResetDate(newResetDate);
             setTimeUntilReset(formatTimeRemaining(newResetDate));
        }

        return true;
      }
      console.warn("useProfile update: DB update seemed successful but no data returned.");
      return false;
    } catch (error: any) {
      console.error('useProfile update: Exception during updateProfile:', error);
      return false;
    }
  }, [supabase, subscriptionTier, weeklyLetterCount, cvCount, savedLettersCount, calculateRemainingLetters, calculateCvLimitReached, calculateLetterLimitReached, calculateNextResetDate, formatTimeRemaining]); // Inkludera state som används för att uppdatera sidoeffekter

  // GDPR (behålls)
  const setGdprConsentValue = (value: boolean) => { setGdprConsent(value); };

  // === SIMULERINGSFUNKTIONER (BEHÅLLS) ===
  const upgradeSubscription = useCallback(async (newTier: 'premium'): Promise<boolean> => {
    console.warn("useProfile: Running SIMULATED upgradeSubscription. Real status depends on Stripe webhook. Use Stripe checkout flow instead.");
    setIsUpgrading(true);
    try {
      // Simulerar bara en lokal ändring och anrop till updateProfile
      const success = await updateProfile({ subscription_tier: newTier });
      // Notera: updateProfile hanterar nu att sätta det lokala state om tier ändras
      return success;
    } catch (error: any) {
      console.error('useProfile SIMULATED upgrade error:', error);
      return false;
    } finally {
      setIsUpgrading(false);
    }
  }, [updateProfile]); // Beroende av updateProfile

  const downgradeSubscription = useCallback(async (): Promise<boolean> => {
    console.warn("useProfile: Running SIMULATED downgradeSubscription. Real status depends on Stripe webhook. Use Stripe Customer Portal instead.");
    try {
      // Simulerar bara en lokal ändring och anrop till updateProfile
      const success = await updateProfile({ subscription_tier: 'free' });
      // Notera: updateProfile hanterar nu att sätta det lokala state om tier ändras
      return success;
    } catch (error: any) {
      console.error('useProfile SIMULATED downgrade error:', error);
      return false;
    }
  }, [updateProfile]); // Beroende av updateProfile
  // =========================================

  // CV-funktioner (behålls oförändrade)
  const uploadCV = useCallback(async (file: File, title?: string): Promise<boolean> => {
    console.log("useProfile: Attempting to upload CV:", file.name);
    // Använd state direkt här eftersom det uppdateras av fetchProfile
    if (calculateCvLimitReached(subscriptionTier, cvCount)) { // Använd aktuell tier och count
       const limit = SUBSCRIPTION_LIMITS[subscriptionTier].maxCVCount;
       const message = subscriptionTier === 'free'
           ? `Som gratisanvändare kan du bara ha ${formatLimit(limit)} CV. Uppgradera till premium för obegränsade CV:n.`
           : `Du har nått maxgränsen på ${formatLimit(limit)} CV. Ta bort ett befintligt CV först.`;
       console.error("uploadCV Error: Limit reached.");
       throw new Error(message);
    }

    if (!gdprConsent) {
       console.error("uploadCV Error: GDPR consent missing.");
       throw new Error('Du måste godkänna GDPR-samtycket för att ladda upp CV');
    }

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
        const errorData = await response.json().catch(() => ({ error: 'Okänt serverfel vid uppladdning' })); // Fånga JSON-parse fel
        console.error("uploadCV Error: Server responded with error:", response.status, errorData);
        // Specifik felhantering
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
        await fetchCvInfo(); // Uppdatera CV-objektet
        await fetchCvCount(); // Uppdatera räknare och gränsflagga
        setGdprConsent(false);
        return true;
      } else {
        console.error("uploadCV Error: Server responded success=false.", data);
        throw new Error(data.error || "Okänt fel från servern efter uppladdning.");
      }
    } catch (error: any) {
      console.error('uploadCV Exception:', error);
      throw error; // Kasta vidare för UI-hantering
    }
  }, [supabase, subscriptionTier, cvCount, gdprConsent, fetchCvInfo, fetchCvCount, calculateCvLimitReached, formatLimit]); // Inkludera relevanta states och funktioner

  const deleteCV = useCallback(async (): Promise<boolean> => {
    console.log("useProfile: Attempting to delete primary CV (legacy function).");
    // Denna funktion verkar designad för att ta bort DET ENDA CV:t.
    // Om du tillåter flera CV:n, använd deleteCVById.
    try {
      const response = await fetch('/api/cv', { method: 'DELETE' }); // Antag endpoint
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Okänt serverfel vid borttagning' }));
          console.error("deleteCV Error: Server responded with error:", response.status, errorData);
          throw new Error(errorData.error || `Serverfel (${response.status})`);
      }
      const data = await response.json();
      if (data.success) {
        console.log("useProfile: Primary CV deleted successfully. Resetting state and counts.");
        setCv(null);
        await fetchCvCount(); // Uppdatera räknare och gränsflagga
        return true;
      } else {
         console.error("deleteCV Error: Server responded success=false.", data);
         throw new Error(data.error || "Okänt fel från servern vid borttagning.");
      }
    } catch (error: any) {
      console.error('deleteCV Exception:', error);
      throw error;
    }
  }, [fetchCvCount]); // Beroende av fetchCvCount

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
        await fetchCvCount(); // Uppdatera räknare och gränsflagga
        await fetchCvInfo(); // Uppdatera CV-listan (om fetchCvInfo hanterar lista) eller nollställ om det var det enda
        return true;
      } else {
         console.error("deleteCVById Error: Server responded success=false.", data);
         throw new Error(data.error || "Okänt fel från servern vid borttagning av CV.");
      }
    } catch (error: any) {
      console.error('deleteCVById Exception:', error);
      throw error;
    }
  }, [fetchCvCount, fetchCvInfo]); // Beroende av fetch-funktionerna


  // === RETURNERA ALLT ===
  console.log("useProfile: Hook rendering/returning values. Loading:", loading, "Tier:", subscriptionTier);
  return {
    // Grundläggande profildata (behålls)
    profile,
    cv,
    gdprConsent,
    loading,

    // Prenumerationsrelaterad data
    subscriptionTier,       // VERKLIG tier från DB
    isUpgrading,            // För simuleringsknapp
    weeklyLetterCount,      // Aktuell räknare
    remainingWeeklyLetters, // Beräknat återstående
    weeklyLetterLimit,      // Gräns för nuvarande tier

    // Gränser och antal (behålls, styrs av verklig tier)
    cvCount,                // Aktuellt antal CV
    maxCvCount,             // Max CV för nuvarande tier
    hasReachedCvLimit,      // Flagga för CV-gräns
    savedLettersCount,      // Aktuellt antal sparade brev
    maxSavedLetters,        // Max sparade brev för nuvarande tier
    hasReachedLetterLimit,  // Flagga för brevgräns

    // Gränsinformationsobjekt (behålls)
    subscriptionLimits: SUBSCRIPTION_LIMITS,
    formatLimit,

    // Timer-relaterad information (behålls)
    nextResetDate,          // Nästa återställningsdatum (som Date)
    timeUntilReset,         // Formaterad sträng för nedräkning

    // === NYA STRIPE-VÄRDEN SOM EXPONERAS ===
    stripeCustomerId,     // Stripe kund-ID (string | null)
    subscriptionId,       // Aktivt/senaste prenumerations-ID (string | null)
    subscriptionStatus,   // Exakt Stripe-status (string | null)
    priceId,              // Stripe Price ID för prenumerationen (string | null)
    currentPeriodEnd,     // När perioden slutar (Date | null)
    // ========================================

    // Funktioner (behålls)
    updateProfile,
    uploadCV,
    deleteCV,
    deleteCVById,
    setGdprConsent: setGdprConsentValue,
    refreshProfile: fetchProfile, // Funktion för att manuellt trigga omhämtning
    updateNextResetDate,          // Funktion för att sätta nytt reset-datum (om nödvändigt externt)
    updateRemainingLetters,       // Funktion för att manuellt justera återstående (används sällan externt)

    // Simuleringsfunktioner (behålls som utlovat)
    upgradeSubscription,
    downgradeSubscription,
  };
};