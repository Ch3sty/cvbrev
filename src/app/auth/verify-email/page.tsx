// app/auth/verify-email/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MailCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email: string; fullName: string } | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          fullName: (data.user.user_metadata?.full_name as string) || 'Användare',
        });
      }
    });
  }, [supabase]);

  const handleResend = async () => {
    if (!user) return;
    setResending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          fullName: user.fullName,
          userId: user.id,
          isInvitation: false,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Kunde inte skicka mejlet');
      }
      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 p-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-3xl text-center border border-orange-100 shadow-[0_24px_48px_-16px_rgba(249,115,22,0.18)]">
        <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)' }}>
          <MailCheck className="w-7 h-7" strokeWidth={2.2} />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900">Bekräfta din e-postadress</h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Vi har skickat ett mejl{user?.email ? <> till <span className="font-bold text-slate-800">{user.email}</span></> : ''}.
            Klicka på länken i mejlet för att bekräfta ditt konto.
          </p>
        </div>

        {/* Du kan börja jobba direkt - bekräftelse är inte blockerande */}
        <Link
          href="/dashboard"
          className="group inline-flex items-center justify-center gap-1.5 w-full px-6 py-3.5 rounded-2xl text-white font-black text-sm min-h-[52px] active:scale-[0.98] transition-all"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
            boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.4)',
          }}
        >
          Fortsätt till appen
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.8} />
        </Link>

        <div className="pt-2 border-t border-slate-100">
          {resent ? (
            <p className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 mt-4">
              <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
              Nytt mejl skickat – kolla din inkorg
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending || !user}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 hover:text-orange-800 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} strokeWidth={2.5} />
              {resending ? 'Skickar...' : 'Skicka mejlet igen'}
            </button>
          )}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <p className="text-xs text-slate-400">
          Ser du inget mejl? Kontrollera din skräppostmapp.
        </p>

        <Link href="/login" className="block text-sm text-slate-500 hover:text-slate-700">
          Tillbaka till inloggning
        </Link>
      </div>
    </div>
  );
}
