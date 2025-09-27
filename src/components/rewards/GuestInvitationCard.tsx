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
      {/* Allowance Status Card - Premium Light Design */}
      <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/30 to-gray-50/50" />

        {/* Floating accent elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-pink-600/10 to-purple-600/10 rounded-full blur-xl" />
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full blur-xl" />

        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center border border-pink-200/50">
                <UserPlus className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900 text-xl">Månatliga inbjudningar</CardTitle>
                <p className="text-sm text-gray-600">{allowance.month_year}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {allowance.remaining_invitations}
              </div>
              <p className="text-sm text-gray-600">kvar</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Kvot använd</span>
              <span className="text-sm text-gray-600">
                {allowance.used_invitations} av {allowance.total_allowance}
              </span>
            </div>

            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min((allowance.used_invitations / allowance.total_allowance) * 100, 100)}%`
                }}
              />
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse" />
            </div>
          </div>

          {/* Quota Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{allowance.base_allowance}</div>
              <div className="text-sm text-gray-600">Bas-kvot</div>
              <div className="text-xs text-gray-500 mt-1">Premium-medlem</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50">
              <div className="text-2xl font-bold text-purple-600">+{allowance.bonus_allowance}</div>
              <div className="text-sm text-gray-600">Bonus-kvot</div>
              <div className="text-xs text-gray-500 mt-1">Från level-framsteg</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Nästa reset</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards - Light Premium Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Successful Conversions */}
        <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalConversions}</div>
                <div className="text-sm text-gray-600">Konverteringar</div>
                <div className="text-xs text-gray-500 mt-1">Lyckade uppgraderingar</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border border-green-200/50">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Ger dig extra Premium-tid
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{pendingInvitations}</div>
                <div className="text-sm text-gray-600">Väntande</div>
                <div className="text-xs text-gray-500 mt-1">Inbjudningar som väntar</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center border border-orange-200/50">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
                Gäster som inte accepterat än
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extra Premium Days Earned */}
        <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalConversions * 7}</div>
                <div className="text-sm text-gray-600">Extra Premium-dagar</div>
                <div className="text-xs text-gray-500 mt-1">Från konverteringar</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center border border-purple-200/50">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                {totalConversions > 0 ? 'Automatiskt tillagt' : 'Inga bonus-dagar än'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Invitation Management - Premium Light Design */}
      <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-lg">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/20 to-gray-50/30" />

        <CardHeader className="relative border-b border-gray-100/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-200/50">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900 text-lg">Hantera inbjudningar</CardTitle>
                <p className="text-sm text-gray-600">Skicka och övervaka dina gästinbjudningar</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('create')}
                className={`
                  ${activeTab === 'create'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } transition-all duration-200
                `}
              >
                Skapa ny
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('manage')}
                className={`
                  ${activeTab === 'manage'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } transition-all duration-200
                `}
              >
                Hantera ({invitations.length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-6 space-y-6">
          {activeTab === 'create' ? (
            <div className="space-y-6">
              {/* Email Input Section */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  E-postadress till gäst
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={newGuestEmail}
                      onChange={(e) => setNewGuestEmail(e.target.value)}
                      placeholder="exempel@email.com"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                      disabled={isCreating || allowance.remaining_invitations <= 0}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateInvitation}
                    disabled={!newGuestEmail.trim() || isCreating || allowance.remaining_invitations <= 0}
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isCreating ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Skicka inbjudan
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quota Warning */}
              {allowance.remaining_invitations <= 0 && (
                <div className="p-5 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200/60 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-800">Ingen kvot kvar denna månad</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Du har använt alla dina inbjudningar för {allowance.month_year}. Fler blir tillgängliga nästa månad.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Benefits Preview */}
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-800">Vad får din gäst?</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>7 dagars gratis Premium</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Obegränsade personliga brev</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Avancerad CV-analys</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Prioriterad support</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Automatisk tonalitetsanpassning</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Kompetensanalys</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {invitations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Inga inbjudningar ännu</h3>
                  <p className="text-gray-600 mb-4">
                    Skicka din första inbjudan för att komma igång!
                  </p>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                  >
                    Skapa första inbjudan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="relative p-6 bg-white border border-gray-200/80 rounded-xl hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Subtle background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/20 to-slate-50/30 rounded-xl" />

                      {/* Header */}
                      <div className="relative flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                            {(invitation.guest_name || invitation.guest_email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {invitation.status === 'accepted' && invitation.guest_name ? (
                                <>
                                  {invitation.guest_name}
                                  <span className="text-sm text-gray-600 ml-2 font-normal">({invitation.guest_email})</span>
                                </>
                              ) : (
                                invitation.guest_email
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {invitation.status === 'accepted'
                                ? `Accepterad ${new Date(invitation.accepted_at || invitation.created_at).toLocaleDateString('sv-SE')}`
                                : `Skickad ${new Date(invitation.created_at).toLocaleDateString('sv-SE')}`}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(invitation)}
                      </div>

                      {/* Stats Grid */}
                      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Status</p>
                          <p className="text-sm font-semibold text-gray-900 capitalize">{invitation.status}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-blue-50/80 border border-blue-100">
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Provperiod</p>
                          <p className="text-sm font-semibold text-blue-700">{invitation.trial_duration_days} dagar</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-orange-50/80 border border-orange-100">
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Går ut</p>
                          <p className="text-sm font-semibold text-orange-700">{formatTimeRemaining(invitation.expires_at)}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-purple-50/80 border border-purple-100">
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Bonus</p>
                          <p className="text-sm font-semibold text-purple-700">
                            {invitation.converted_to_paid ? '7 extra dagar' : 'Väntar'}
                          </p>
                        </div>
                      </div>

                      {/* Actions for pending invitations */}
                      {invitation.status === 'pending' && (
                        <div className="relative flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCopyLink(invitation.invitation_code)}
                            className="flex-1 min-w-0 bg-white hover:bg-gray-50 border-gray-200"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Kopiera länk
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShareSocial(invitation.invitation_code, 'email')}
                            className="bg-white hover:bg-gray-50 border-gray-200"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShareSocial(invitation.invitation_code, 'social')}
                            className="bg-white hover:bg-gray-50 border-gray-200"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getInvitationLink(invitation.invitation_code), '_blank')}
                            className="bg-white hover:bg-gray-50 border-gray-200"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {/* Success state for converted */}
                      {invitation.converted_to_paid && (
                        <div className="relative mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-800">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">Konverterad! Ni fick båda 1 vecka extra Premium.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestInvitationCard;