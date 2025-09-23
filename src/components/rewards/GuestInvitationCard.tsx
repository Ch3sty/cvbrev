'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Mail,
  Copy,
  Share2,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Gift,
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

// Types for guest invitations
interface MonthlyAllowance {
  base_allowance: number;
  bonus_allowance: number;
  total_allowance: number;
  used_invitations: number;
  remaining_invitations: number;
  month_year: string;
}

interface GuestInvitation {
  id: string;
  invitation_code: string;
  guest_email: string;
  guest_name?: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  trial_duration_days: number;
  expires_at: string;
  accepted_at?: string;
  converted_to_paid?: boolean;
  conversion_amount?: number;
  created_at: string;
}

interface GuestInvitationCardProps {
  allowance: MonthlyAllowance;
  invitations: GuestInvitation[];
  onCreateInvitation: (email: string) => Promise<void>;
  onCopyLink: (code: string) => void;
  onShareSocial: (code: string, platform: string) => void;
  isLoading?: boolean;
}

const GuestInvitationCard: React.FC<GuestInvitationCardProps> = ({
  allowance,
  invitations,
  onCreateInvitation,
  onCopyLink,
  onShareSocial,
  isLoading = false
}) => {
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  const handleCreateInvitation = async () => {
    if (!newGuestEmail.trim() || allowance.remaining_invitations <= 0) return;

    setIsCreating(true);
    try {
      await onCreateInvitation(newGuestEmail.trim());
      setNewGuestEmail('');
    } finally {
      setIsCreating(false);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Utgången';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} dagar`;
    return `${hours} timmar`;
  };

  const getStatusBadge = (invitation: GuestInvitation) => {
    switch (invitation.status) {
      case 'pending':
        return (
          <Badge variant="warning" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Väntar
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="success" className="text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Accepterad
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="text-xs opacity-50">
            Utgången
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-xs opacity-50">
            Avbruten
          </Badge>
        );
      default:
        return null;
    }
  };

  const totalConversions = invitations.filter(inv => inv.converted_to_paid).length;
  const totalRevenue = invitations.reduce((sum, inv) => sum + (inv.conversion_amount || 0), 0);
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending').length;

  const getInvitationLink = (code: string) => {
    return `${window.location.origin}/invited/${code}`;
  };

  return (
    <div className="space-y-6">
      {/* Allowance Status Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-navy-900 to-navy-800 border-navy-700">
        {/* Background glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-15" />

        <CardHeader className="relative">
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-pink-500" />
            <span>Gästinbjudningar</span>
            <Badge variant="secondary" className="ml-auto">
              {allowance.month_year}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative">
          {/* Usage Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {allowance.remaining_invitations}
                </p>
                <p className="text-sm text-gray-400">kvar denna månad</p>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold text-purple-400">
                  {allowance.total_allowance}
                </p>
                <p className="text-sm text-gray-400">totalt tillgängligt</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Månatlig kvot</span>
                <span>{allowance.used_invitations}/{allowance.total_allowance}</span>
              </div>

              <div className="relative h-2 bg-navy-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((allowance.used_invitations / allowance.total_allowance) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Allowance Breakdown */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <p className="text-sm text-gray-400">Bas kvot</p>
                <p className="text-lg font-semibold text-white">{allowance.base_allowance}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Bonus kvot</p>
                <p className="text-lg font-semibold text-purple-400">+{allowance.bonus_allowance}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-navy-800 border-navy-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{totalConversions}</p>
                <p className="text-sm text-gray-400">Konverteringar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-navy-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{pendingInvitations}</p>
                <p className="text-sm text-gray-400">Väntande</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-navy-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{totalRevenue} SEK</p>
                <p className="text-sm text-gray-400">Intjänat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Invitation Management */}
      <Card className="bg-navy-800 border-navy-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hantera inbjudningar</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'create' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('create')}
                className={activeTab === 'create' ? '' : 'text-gray-400 hover:text-white'}
              >
                Skapa ny
              </Button>
              <Button
                variant={activeTab === 'manage' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('manage')}
                className={activeTab === 'manage' ? '' : 'text-gray-400 hover:text-white'}
              >
                Hantera ({invitations.length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {activeTab === 'create' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-postadress till gäst
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={newGuestEmail}
                      onChange={(e) => setNewGuestEmail(e.target.value)}
                      placeholder="exempel@email.com"
                      className="w-full px-3 py-2 bg-navy-700 border border-navy-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      disabled={isCreating || allowance.remaining_invitations <= 0}
                    />
                  </div>
                  <Button
                    onClick={handleCreateInvitation}
                    disabled={!newGuestEmail.trim() || isCreating || allowance.remaining_invitations <= 0}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  >
                    {isCreating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    <span className="ml-2">Skicka inbjudan</span>
                  </Button>
                </div>
              </div>

              {allowance.remaining_invitations <= 0 && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-orange-400" />
                    <p className="text-orange-400 font-medium">Ingen kvot kvar</p>
                  </div>
                  <p className="text-sm text-orange-300 mt-1">
                    Du har använt alla dina inbjudningar för denna månad. Fler blir tillgängliga nästa månad.
                  </p>
                </div>
              )}

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-2">Vad får din gäst?</h4>
                <ul className="space-y-1 text-sm text-blue-300">
                  <li>• 7 dagars gratis premium-test</li>
                  <li>• Obegränsade personliga brev</li>
                  <li>• Avancerad CV-analys</li>
                  <li>• Prioriterad support</li>
                  <li>• Automatisk tonalitetsanpassning</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Inga inbjudningar ännu</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Skicka din första inbjudan för att komma igång!
                  </p>
                </div>
              ) : (
                invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="p-4 bg-navy-700/50 border border-navy-600 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {(invitation.guest_name || invitation.guest_email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {invitation.status === 'accepted' && invitation.guest_name ? (
                              <>
                                {invitation.guest_name}
                                <span className="text-sm text-gray-400 ml-2">({invitation.guest_email})</span>
                              </>
                            ) : (
                              invitation.guest_email
                            )}
                          </p>
                          <p className="text-sm text-gray-400">
                            {invitation.status === 'accepted'
                              ? `Accepterad ${new Date(invitation.accepted_at || invitation.created_at).toLocaleDateString('sv-SE')}`
                              : `Skickad ${new Date(invitation.created_at).toLocaleDateString('sv-SE')}`}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(invitation)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Status</p>
                        <p className="text-white capitalize">{invitation.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Provperiod</p>
                        <p className="text-white">{invitation.trial_duration_days} dagar</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Går ut</p>
                        <p className="text-white">{formatTimeRemaining(invitation.expires_at)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Konvertering</p>
                        <p className="text-white">
                          {invitation.converted_to_paid
                            ? `${invitation.conversion_amount} SEK`
                            : 'Ej konverterad'
                          }
                        </p>
                      </div>
                    </div>

                    {invitation.status === 'pending' && (
                      <div className="flex space-x-2 mt-4 pt-4 border-t border-navy-600">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCopyLink(invitation.invitation_code)}
                          className="flex-1"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Kopiera länk
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onShareSocial(invitation.invitation_code, 'email')}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onShareSocial(invitation.invitation_code, 'social')}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getInvitationLink(invitation.invitation_code), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestInvitationCard;