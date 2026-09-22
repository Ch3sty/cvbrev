'use client';

/**
 * En hämtning per sidladdning för hela det inloggade läget.
 *
 * Före denna context hämtade sex olika komponenter profilen var för sig och
 * anropade auth.getUser() eller getSession() först, vilket gav minst två
 * seriella rundturer per komponent. Mätningen i
 * docs/rapporter/perf-inloggat-2026-09-12.md räknade 38 rundturer innan
 * dashboarden visade färdigt innehåll.
 *
 * Här hämtas allt en gång från /api/dashboard/summary, som kör sina frågor
 * parallellt på servern. Resultatet delas till alla konsumenter.
 *
 * Stale-while-revalidate: senast kända svar ligger i sessionStorage per
 * användare och renderas omedelbart vid nästa sidladdning, medan färsk data
 * hämtas i bakgrunden. Skelett visas därför bara första gången någonsin.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardSummaryPipelineItem {
  id: string;
  jobTitle: string;
  company: string;
  status: string | null;
  days: number;
  needsFollowUp: boolean;
}

export interface DashboardSummary {
  profile: Record<string, unknown> | null;
  letters: {
    total: number;
    monthly: number;
    recent: Array<{
      id: string;
      title: string | null;
      company: string | null;
      job_title: string | null;
      created_at: string;
    }>;
  };
  cv: { count: number; activeName: string | null };
  applications: {
    waitingCount: number;
    interviewCount: number;
    followUpCount: number;
    prevMonthCount: number;
    weekCount: number;
    replyCount: number;
    pipeline: DashboardSummaryPipelineItem[];
  };
  /**
   * Onboarding-stegen, validerade på servern. Valfri eftersom ett äldre svar
   * i sessionStorage-cachen kan sakna fältet.
   */
  onboarding?: {
    completedSteps: string[];
    rewardClaimed: boolean;
    createdAt: string | null;
  };
  /**
   * Veckoprogrammet (docs/plan-paket-och-onboarding.md, flöde 3). Valfri av
   * samma skäl som onboarding ovan: ett äldre svar i sessionStorage-cachen
   * kan sakna fältet.
   */
  week?: {
    track: 'cv' | 'tester' | 'allt' | null;
    scope: 'cv' | 'tester' | 'allt' | null;
    progressDay: number;
    startedAt: string | null;
    trackAskedAt: string | null;
    /** Nedladdade mallar. Dag 7:s tredje tal, etiketten "mallar" (T58). */
    templateDownloads?: number;
    /** Allt-dagen: behörigheten kommer bara ur ett engångsköp. */
    dayPassOnly?: boolean;
    /** När dygnet tar slut (ISO). */
    dayPassEndsAt?: string | null;
  };
}

interface DashboardDataContextValue {
  /**
   * false utanför providern. Låter useProfile skilja "ingen provider" från
   * "provider som fortfarande laddar", vilket annars ser likadant ut.
   */
  hasProvider: boolean;
  summary: DashboardSummary | null;
  /** true bara när vi saknar data helt, alltså första besöket någonsin. */
  isLoading: boolean;
  /** true när cachat innehåll visas medan färsk data hämtas. */
  isRevalidating: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataContextValue>({
  hasProvider: false,
  summary: null,
  isLoading: true,
  isRevalidating: false,
  error: null,
  refresh: async () => {},
});

export function useDashboardData() {
  return useContext(DashboardDataContext);
}

/**
 * Nyckeln bär användarens id så att ett kontobyte i samma flik aldrig kan
 * visa föregående användares siffror.
 */
function cacheKey(userId: string): string {
  return `dashboard_summary_v1_${userId}`;
}

function readCache(userId: string): DashboardSummary | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(userId));
    return raw ? (JSON.parse(raw) as DashboardSummary) : null;
  } catch {
    // Privat läge eller blockerad lagring. Vi faller tillbaka på skelettet,
    // vilket är ett fullgott tillstånd.
    return null;
  }
}

function writeCache(userId: string, summary: DashboardSummary): void {
  try {
    sessionStorage.setItem(cacheKey(userId), JSON.stringify(summary));
  } catch {
    // Full lagring eller blockerad lagring. Cachen är en bonus, inte ett krav.
  }
}

export function DashboardDataProvider({
  children,
  initialSummary = null,
}: {
  children: ReactNode;
  /**
   * Summary som dashboard-layouten redan har hämtat på servern. Finns den är
   * isLoading false vid allra första render, och vi hoppar över den
   * omedelbara hämtningen. Revalidering sker i bakgrunden, aldrig blockerande.
   */
  initialSummary?: DashboardSummary | null;
}) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [summary, setSummary] = useState<DashboardSummary | null>(initialSummary);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Serverdatan är färsk vid första render. Vi hämtar alltså inte om direkt,
  // bara vid klientnavigering eller kontobyte. Ref i stället för state: det
  // här ska inte trigga en extra render.
  const hasServerData = useRef(initialSummary !== null);

  // Håller serverdatan utanför effektens beroenden. Layouten skickar ett nytt
  // objekt vid varje render, och den identiteten får inte ensam trigga om
  // hämtningen.
  const initialSummaryRef = useRef(initialSummary);

  // Hindrar att ett svar för en tidigare användare skriver över state efter
  // ett kontobyte.
  const activeUserRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    activeUserRef.current = userId;
    setIsRevalidating(true);

    try {
      const res = await fetch('/api/dashboard/summary');
      const json = await res.json();
      if (activeUserRef.current !== userId) return;

      if (!res.ok || !json.success) {
        setError(json?.error ?? 'Kunde inte hämta dashboard-data');
        return;
      }

      setSummary(json.data as DashboardSummary);
      setError(null);
      writeCache(userId, json.data as DashboardSummary);
    } catch {
      if (activeUserRef.current !== userId) return;
      setError('Kunde inte hämta dashboard-data');
    } finally {
      if (activeUserRef.current === userId) setIsRevalidating(false);
    }
  }, [userId]);

  // Visa cachat innehåll direkt, hämta färskt i bakgrunden.
  useEffect(() => {
    if (!userId) {
      // Har vi serverdata är userId bara null för att AuthContext ännu inte
      // hydrerat. Att nolla summaryn då hade gett exakt den tomma skärm som
      // serverrenderingen finns till för att ta bort.
      if (!hasServerData.current) setSummary(null);
      return;
    }

    // Första varvet med serverdata: den är redan färsk, hämta inte om. Vi
    // lägger den bara i sessionStorage så klientnavigering har den kvar.
    if (hasServerData.current) {
      hasServerData.current = false;
      activeUserRef.current = userId;
      const fromServer = initialSummaryRef.current;
      if (fromServer) writeCache(userId, fromServer);
      return;
    }

    const cached = readCache(userId);
    if (cached) setSummary(cached);
    void load();
  }, [userId, load]);

  return (
    <DashboardDataContext.Provider
      value={{
        hasProvider: true,
        summary,
        isLoading: summary === null,
        isRevalidating,
        error,
        refresh: load,
      }}
    >
      {children}
    </DashboardDataContext.Provider>
  );
}

export default DashboardDataContext;
