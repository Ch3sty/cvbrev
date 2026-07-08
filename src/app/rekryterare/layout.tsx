'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Clock, LogIn, LogOut, XCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import RecruiterSideNav from './components/RecruiterSideNav';

// Rekryterarportalens skal: eget enkelt skal, INTE kandidat-dashboardens
// sidebar. Guarden ligger här i layouten och styrs av /api/recruiter/status.
//
// DESIGNBESLUT: /rekryterare/registrera byggs av en annan agent och får inte
// låsas bakom approved-kravet — layouten släpper därför igenom den vägen helt
// orörd (varken guard eller topbar), så registreringssidan äger hela sin yta.

type GuardState =
  | 'loading'
  | 'unauth'
  | 'none'
  | 'pending'
  | 'rejected'
  | 'approved'
  | 'error';

export default function RekryterareLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isRegistrera = pathname?.startsWith('/rekryterare/registrera') ?? false;

  const [state, setState] = useState<GuardState>('loading');
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    if (isRegistrera) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/recruiter/status');
        if (cancelled) return;
        if (res.status === 401) {
          setState('unauth');
          return;
        }
        if (!res.ok) {
          setState('error');
          return;
        }
        const data = (await res.json()) as {
          status: 'none' | 'pending' | 'approved' | 'rejected';
          companyName: string | null;
        };
        if (cancelled) return;
        setCompanyName(data.companyName);
        setState(data.status === 'none' ? 'none' : data.status);
      } catch {
        if (!cancelled) setState('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isRegistrera]);

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } finally {
      window.location.href = '/login';
    }
  };

  // Registreringssidan hanterar sig själv (se designbeslutet ovan).
  if (isRegistrera) return <>{children}</>;

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-orange-50/30">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
          <div className="rounded-3xl bg-orange-50/60 h-14 animate-pulse" />
          <div className="rounded-3xl bg-orange-50/60 h-40 animate-pulse" />
          <div className="rounded-3xl bg-orange-50/60 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (state !== 'approved') {
    return (
      <GateView
        state={state}
        companyName={companyName}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/30">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-orange-100">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo variant="compact" href="/rekryterare" height={30} />
            <span className="flex-shrink-0 text-[11px] font-bold tracking-wide uppercase rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700">
              Rekryterare
            </span>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            {companyName && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 truncate max-w-[220px]">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                {companyName}
              </span>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl text-[13px] font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Logga ut
            </button>
          </div>
        </div>
      </header>

      {/* Sidnav (desktop-rail) + innehåll. Mobilen får bottom-tabs och
          extra bottenluft så inget hamnar bakom dem. */}
      <div className="max-w-[1600px] mx-auto flex items-start">
        <RecruiterSideNav />
        <main className="flex-1 min-w-0 px-4 py-5 sm:py-8 pb-24 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}

function GateView({
  state,
  companyName,
  onSignOut,
}: {
  state: GuardState;
  companyName: string | null;
  onSignOut: () => void;
}) {
  return (
    <div className="min-h-screen bg-orange-50/30 flex flex-col">
      <header className="bg-white/90 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Logo variant="compact" href="/" height={30} />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div
          className="relative w-full max-w-md bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 text-center overflow-hidden"
          style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
        >
          <div
            className="absolute top-0 inset-x-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
            aria-hidden="true"
          />

          {state === 'unauth' && (
            <>
              <IconBubble>
                <LogIn className="w-6 h-6 text-orange-600" aria-hidden="true" />
              </IconBubble>
              <h1 className="text-lg font-bold text-slate-900 mb-2">Logga in för att fortsätta</h1>
              <p className="text-[13.5px] text-slate-500 leading-relaxed mb-6">
                Rekryterarportalen kräver att du är inloggad med ditt rekryterarkonto.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
              >
                Logga in
              </Link>
            </>
          )}

          {state === 'none' && (
            <>
              <IconBubble>
                <Building2 className="w-6 h-6 text-orange-600" aria-hidden="true" />
              </IconBubble>
              <h1 className="text-lg font-bold text-slate-900 mb-2">
                Ditt konto saknar rekryterarprofil
              </h1>
              <p className="text-[13.5px] text-slate-500 leading-relaxed mb-6">
                Registrera ditt företag så granskar vi ansökan. Under betan är
                portalen kostnadsfri för godkända rekryterare.
              </p>
              <Link
                href="/rekryterare/registrera"
                className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
              >
                Registrera företag
              </Link>
            </>
          )}

          {state === 'pending' && (
            <>
              <IconBubble>
                <Clock className="w-6 h-6 text-orange-600" aria-hidden="true" />
              </IconBubble>
              <h1 className="text-lg font-bold text-slate-900 mb-2">Ansökan granskas</h1>
              <p className="text-[13.5px] text-slate-500 leading-relaxed mb-2">
                Vi verifierar {companyName ? <strong>{companyName}</strong> : 'ditt företag'} mot
                org-numret. Det tar oftast mindre än en arbetsdag, du får ett
                mail så fort kontot är godkänt.
              </p>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-6">
                Verifieringen skyddar kandidaterna: bara riktiga rekryterare
                släpps in i poolen.
              </p>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 justify-center min-h-[44px] px-6 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Logga ut
              </button>
            </>
          )}

          {state === 'rejected' && (
            <>
              <IconBubble>
                <XCircle className="w-6 h-6 text-orange-600" aria-hidden="true" />
              </IconBubble>
              <h1 className="text-lg font-bold text-slate-900 mb-2">Ansökan godkändes inte</h1>
              <p className="text-[13.5px] text-slate-500 leading-relaxed mb-6">
                Vi kunde inte verifiera företagsuppgifterna. Tror du att något
                blivit fel? Hör av dig till{' '}
                <a
                  href="mailto:hej@jobbcoach.ai"
                  className="font-bold text-orange-600 hover:text-orange-700"
                >
                  hej@jobbcoach.ai
                </a>{' '}
                så tittar vi igen.
              </p>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 justify-center min-h-[44px] px-6 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Logga ut
              </button>
            </>
          )}

          {state === 'error' && (
            <>
              <IconBubble>
                <XCircle className="w-6 h-6 text-orange-600" aria-hidden="true" />
              </IconBubble>
              <h1 className="text-lg font-bold text-slate-900 mb-2">Något gick fel</h1>
              <p className="text-[13.5px] text-slate-500 leading-relaxed mb-6">
                Vi kunde inte hämta din kontostatus. Ladda om sidan och försök igen.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
              >
                Ladda om
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function IconBubble({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
      {children}
    </div>
  );
}
