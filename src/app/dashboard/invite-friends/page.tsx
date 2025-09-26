'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Gift, Copy, Share2, Mail, MessageSquare, CheckCircle2, Clock, Trophy } from 'lucide-react';
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
    const text = 'Prova Jobbcoach.ai Premium kostnadsfritt i 7 dagar! 🚀';

    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepterad</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Väntar</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Utgången</Badge>;
      default:
        return <Badge>Okänd</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Inbjudan skickad! Din vän får 7 dagars kostnadsfri Premium.</span>
        </div>
      )}

      {/* Main Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Bjud in en vän</h1>
        <p className="text-gray-400 text-lg">
          Din vän får 7 dagars kostnadsfri Premium. När de blir betalande kund får båda 7 dagars extra Premium + 500 XP!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Invitation */}
        <Card className="bg-navy-800 border-navy-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-500" />
              Skicka inbjudan
            </CardTitle>
            <CardDescription className="text-gray-400">
              Bjud in en vän via e-post för att ge dem 7 dagars kostnadsfri Premium
              {remainingInvitations !== null && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge
                    variant={remainingInvitations > 0 ? "default" : "destructive"}
                    className={remainingInvitations > 0 ? "bg-green-100 text-green-800" : ""}
                  >
                    {remainingInvitations === 999 ? "Obegränsat" : `${remainingInvitations} kvar denna månad`}
                  </Badge>
                  {!isPremium && (
                    <span className="text-xs text-yellow-400">Uppgradera till Premium för 3 inbjudningar/månad</span>
                  )}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="vän@exempel.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-navy-700 border-navy-600 text-white placeholder-gray-400"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email.trim() || (remainingInvitations !== null && remainingInvitations <= 0)}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Skickar...
                  </>
                ) : remainingInvitations !== null && remainingInvitations <= 0 ? (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Inga inbjudningar kvar
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Skicka inbjudan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="bg-navy-800 border-navy-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Fördelar med att bjuda in
            </CardTitle>
            <CardDescription className="text-gray-400">
              Belöningar för dig och din vän
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-white">7 dagars kostnadsfri Premium</h4>
                <p className="text-sm text-gray-400">Din vän får full tillgång till alla Premium-funktioner helt kostnadsfritt</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-white">7 dagars extra Premium för båda</h4>
                <p className="text-sm text-gray-400">När din vän blir betalande kund får både du och din vän 7 dagars Premium</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-white">500 XP-belöning</h4>
                <p className="text-sm text-gray-400">Få 500 XP direkt när din vän blir betalande Premium-medlem</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previous Invitations */}
      {invitations.length > 0 && (
        <Card className="mt-8 bg-navy-800 border-navy-700">
          <CardHeader>
            <CardTitle className="text-white">Dina inbjudningar</CardTitle>
            <CardDescription className="text-gray-400">
              Översikt över tidigare skickade inbjudningar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 bg-navy-900/50 rounded-lg border border-navy-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-full flex items-center justify-center">
                      {invitation.status === 'accepted' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Mail className="w-5 h-5 text-pink-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {invitation.status === 'accepted' && invitation.guest ? (
                          <>
                            {invitation.guest.full_name || 'Anonym användare'}
                            <span className="text-sm text-gray-400 ml-2">({invitation.guest.email})</span>
                          </>
                        ) : (
                          invitation.email
                        )}
                      </p>
                      <p className="text-sm text-gray-400">
                        {invitation.status === 'accepted'
                          ? `Accepterad ${new Date(invitation.created_at).toLocaleDateString('sv-SE')}`
                          : `Skickad ${new Date(invitation.created_at).toLocaleDateString('sv-SE')}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(invitation.status)}

                    {invitation.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyInviteLink(invitation.invitation_code)}
                          className="border-navy-600 text-gray-300 hover:bg-navy-700"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => shareOnSocial('linkedin', invitation.invitation_code)}
                          className="border-navy-600 text-gray-300 hover:bg-navy-700"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}