/**
 * Bjud in en vän. Sidhuvud, kvoten som statusrad, formuläret i en panel,
 * fördelarna som lista, tidigare inbjudningar som lista i en panel.
 */
'use client';

import { useState, useEffect } from 'react';
import { Copy, Share2 } from 'lucide-react';
import PageHeader from '@/components/shell/PageHeader';
import StatusRow from '@/components/shell/StatusRow';
import { IkonKrona, IkonProfil, IkonMeddelanden } from '@/components/illustrations/Ikoner';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface InvitationData {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
  invitation_code: string;
  guest?: {
    id: string;
    email: string;
    full_name: string;
  };
}

const STATUS_LABEL: Record<InvitationData['status'], { text: string; tone: string }> = {
  accepted: { text: 'Accepterad', tone: 'text-positiv' },
  pending: { text: 'Väntar', tone: 'text-ink-3' },
  expired: { text: 'Utgången', tone: 'text-varning' },
};

export default function InviteFriendsPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [remainingInvitations, setRemainingInvitations] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadInvitations();
    loadUserStatus();
  }, []);

  const loadInvitations = async () => {
    try {
      const response = await fetch('/api/invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const loadUserStatus = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check premium status
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, premium_until')
          .eq('id', user.id)
          .single();

        const hasPremiumUntil = profile?.premium_until && new Date(profile.premium_until) > new Date();
        const hasPremiumTier = profile?.subscription_tier === 'premium';
        const userIsPremium = hasPremiumUntil || hasPremiumTier;
        setIsPremium(userIsPremium);

        // Get monthly allowance
        const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
        const { data: allowance } = await supabase
          .from('monthly_guest_allowances')
          .select('*')
          .eq('user_id', user.id)
          .eq('month_year', currentMonth)
          .single();

        if (allowance) {
          const total = allowance.base_allowance + allowance.bonus_allowance;
          const remaining = total - allowance.used_invitations;
          setRemainingInvitations(Math.max(0, remaining));
        } else {
          // No allowance record yet - use defaults
          setRemainingInvitations(userIsPremium ? 3 : 1);
        }
      }
    } catch (error) {
      console.error('Error loading user status:', error);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/guest/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestEmail: email.trim(),
          personalMessage: '' // Can be added as a feature later
        })
      });

      if (response.ok) {
        setEmail('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        await loadInvitations();
        await loadUserStatus(); // Reload remaining invitations
      } else {
        const error = await response.json();
        console.error('Failed to send invitation:', error);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = async (code: string) => {
    const link = `${window.location.origin}/invite/${code}`;
    await navigator.clipboard.writeText(link);
  };

  const shareOnSocial = (platform: 'linkedin' | 'twitter', code: string) => {
    const link = `${window.location.origin}/invite/${code}`;
    const text = 'Prova Jobbcoach.ai Premium kostnadsfritt i 7 dagar!';

    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`);
    }
  };

  const noneLeft = remainingInvitations !== null && remainingInvitations <= 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
      <PageHeader
        title="Bjud in en vän"
        description="Din vän får sju dagars Premium. Blir hen betalande kund får ni båda sju dagar till."
      />

      {showSuccess ? (
        <StatusRow tone="positive" showDot label="Inbjudan skickad">
          Inbjudan skickad. Din vän får sju dagars Premium.
        </StatusRow>
      ) : remainingInvitations !== null ? (
        <StatusRow tone={noneLeft ? 'warm' : 'neutral'} showDot>
          {remainingInvitations === 999
            ? 'Obegränsat antal inbjudningar'
            : `${remainingInvitations} ${remainingInvitations === 1 ? 'inbjudan' : 'inbjudningar'} kvar den här månaden`}
          {!isPremium ? ' · Premium ger tre i månaden' : ''}
        </StatusRow>
      ) : null}

      <section aria-label="Skicka inbjudan" className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <h2 className="text-kort text-ink-1">Skicka inbjudan</h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          Skriv in din väns e-postadress så skickar vi inbjudan.
        </p>
        <form onSubmit={handleSendInvitation} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="invite-email" className="sr-only">
            E-postadress
          </label>
          <input
            id="invite-email"
            type="email"
            placeholder="van@exempel.se"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 w-full flex-1 rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-kant-stark focus:bg-panel focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={isLoading || !email.trim() || noneLeft}
            className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isLoading ? 'Skickar' : noneLeft ? 'Inga inbjudningar kvar' : 'Skicka inbjudan'}
          </button>
        </form>
      </section>

      <section aria-label="Det här får ni">
        <h2 className="mb-2 text-sm font-medium text-ink-3">Det här får ni</h2>
        <div className="divide-y divide-kant rounded-xl border border-kant bg-panel">
          <div className="flex items-start gap-3 p-4">
            <span className="mt-0.5 shrink-0 text-ink-2" aria-hidden="true">
              <IkonKrona size={24} />
            </span>
            <div>
              <p className="text-sm font-medium text-ink-1">Sju dagars Premium till din vän</p>
              <p className="mt-0.5 text-meta text-ink-3">Full tillgång till allt, utan kostnad.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4">
            <span className="mt-0.5 shrink-0 text-ink-2" aria-hidden="true">
              <IkonProfil size={24} />
            </span>
            <div>
              <p className="text-sm font-medium text-ink-1">Sju dagar till, för er båda</p>
              <p className="mt-0.5 text-meta text-ink-3">
                När din vän blir betalande kund förlängs både din och hens Premium.
              </p>
            </div>
          </div>
        </div>
      </section>

      {invitations.length > 0 ? (
        <section aria-label="Dina inbjudningar">
          <h2 className="mb-2 text-sm font-medium text-ink-3">Dina inbjudningar</h2>
          <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
            {invitations.map((invitation) => {
              const status = STATUS_LABEL[invitation.status] ?? { text: 'Okänd', tone: 'text-ink-3' };
              return (
                <li key={invitation.id} className="flex items-center gap-3 p-4">
                  <span className="shrink-0 text-ink-2" aria-hidden="true">
                    <IkonMeddelanden size={24} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-1">
                      {invitation.status === 'accepted' && invitation.guest
                        ? invitation.guest.full_name || invitation.guest.email
                        : invitation.email}
                    </p>
                    <p className="text-meta text-ink-3">
                      {invitation.status === 'accepted' ? 'Accepterad' : 'Skickad'}{' '}
                      {new Date(invitation.created_at).toLocaleDateString('sv-SE')}
                      <span className={`ml-2 font-medium ${status.tone}`}>{status.text}</span>
                    </p>
                  </div>

                  {invitation.status === 'pending' ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => copyInviteLink(invitation.invitation_code)}
                        aria-label="Kopiera inbjudningslänk"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-insunken hover:text-ink-1"
                      >
                        <Copy className="h-5 w-5" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={() => shareOnSocial('linkedin', invitation.invitation_code)}
                        aria-label="Dela på LinkedIn"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-insunken hover:text-ink-1"
                      >
                        <Share2 className="h-5 w-5" strokeWidth={1.75} />
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
