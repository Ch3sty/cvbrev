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
  RefreshCw,
  ArrowRight,
  Play,
  Timer,
  Crown,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Award
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

// Types for invitation journey stages
type InvitationStage = 'sent' | 'accepted' | 'trial_active' | 'trial_expired' | 'converted';

interface JourneyStage {
  id: InvitationStage;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
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
  const [activeTab, setActiveTab] = useState<'create' | 'journey'>('journey');

  // Journey stages definition
  const journeyStages: JourneyStage[] = [
    {
      id: 'sent',
      title: 'Inbjudan skickad',
      description: 'Gästen har fått inbjudan',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'accepted',
      title: 'Inbjudan accepterad',
      description: 'Gästen har registrerat sig',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'trial_active',
      title: 'Provperiod aktiv',
      description: '7 dagars gratis Premium',
      icon: Play,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'converted',
      title: 'Konverterad!',
      description: 'Ni får båda 1 vecka extra',
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

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

    if (days > 0) return `${days} dagar kvar`;
    return `${hours} timmar kvar`;
  };

  const getInvitationStage = (invitation: GuestInvitation): InvitationStage => {
    if (invitation.converted_to_paid) return 'converted';
    if (invitation.status === 'accepted') {
      const now = new Date();
      const accepted = new Date(invitation.accepted_at || invitation.created_at);
      const trialEnd = new Date(accepted.getTime() + (invitation.trial_duration_days * 24 * 60 * 60 * 1000));

      if (now > trialEnd) return 'trial_expired';
      return 'trial_active';
    }
    return 'sent';
  };

  const getStageProgress = (invitation: GuestInvitation): number => {
    const stage = getInvitationStage(invitation);
    const stageIndex = journeyStages.findIndex(s => s.id === stage);
    return ((stageIndex + 1) / journeyStages.length) * 100;
  };

  // Fix stats calculations
  const actualUsedInvitations = invitations.length; // Count of actual invitations sent
  const actualConversions = invitations.filter(inv => inv.converted_to_paid).length;
  const actualPending = invitations.filter(inv => inv.status === 'pending').length;
  const actualTrialActive = invitations.filter(inv => {
    if (inv.status !== 'accepted' || inv.converted_to_paid) return false;
    const now = new Date();
    const accepted = new Date(inv.accepted_at || inv.created_at);
    const trialEnd = new Date(accepted.getTime() + (inv.trial_duration_days * 24 * 60 * 60 * 1000));
    return now <= trialEnd;
  }).length;

  const getInvitationLink = (code: string) => {
    return `${window.location.origin}/invited/${code}`;
  };

  const renderJourneyFlow = () => (
    <Card className="bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center border border-purple-200/50">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-gray-900 text-xl">Så fungerar belöningssystemet</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Förstå resan från inbjudan till belöning</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Enhanced Flow Diagram - Better Layout */}
        <div className="relative">
          {/* Desktop: Horizontal Flow */}
          <div className="hidden md:block">
            <div className="grid grid-cols-4 gap-8">
              {journeyStages.map((stage, index) => (
                <div key={stage.id} className="relative">
                  {/* Stage Card */}
                  <div className="text-center space-y-3">
                    <div className={`w-16 h-16 mx-auto rounded-2xl ${stage.bgColor} ${stage.borderColor} border-2 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300`}>
                      <stage.icon className={`w-8 h-8 ${stage.color}`} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight">{stage.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{stage.description}</p>
                    </div>
                  </div>

                  {/* Arrow between stages */}
                  {index < journeyStages.length - 1 && (
                    <div className="absolute top-8 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Vertical Flow */}
          <div className="md:hidden space-y-6">
            {journeyStages.map((stage, index) => (
              <div key={stage.id} className="relative">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl ${stage.bgColor} ${stage.borderColor} border-2 flex items-center justify-center flex-shrink-0`}>
                    <stage.icon className={`w-6 h-6 ${stage.color}`} />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{stage.title}</h4>
                    <p className="text-xs text-gray-600">{stage.description}</p>
                  </div>
                </div>

                {/* Vertical connector */}
                {index < journeyStages.length - 1 && (
                  <div className="ml-6 mt-3 mb-3">
                    <div className="w-0.5 h-6 bg-gray-200"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Key Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Benefits */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-blue-900">Gästens fördelar</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800">7 dagars gratis Premium</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800">Obegränsade personliga brev</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800">Avancerad CV-analys</span>
              </div>
            </div>
          </div>

          {/* Rewards & Timeline */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/60">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-purple-900">Belöningar</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-purple-800">1 vecka extra för båda vid konvertering</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-purple-800">Automatisk förlängning</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-purple-800">Endast vid uppgradering till betald plan</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Fixed Stats Cards - Light Premium Design */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Used Invitations - FIXED */}
        <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{actualUsedInvitations}</div>
                <div className="text-sm text-gray-600">Använda inbjudningar</div>
                <div className="text-xs text-gray-500 mt-1">av {allowance.total_allowance} denna månad</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-200/50">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((actualUsedInvitations / allowance.total_allowance) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations - FIXED */}
        <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{actualPending}</div>
                <div className="text-sm text-gray-600">Väntande</div>
                <div className="text-xs text-gray-500 mt-1">Inte accepterat än</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center border border-orange-200/50">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
                Väntar på gäst-respons
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Trials - NEW */}
        <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{actualTrialActive}</div>
                <div className="text-sm text-gray-600">Aktiva prover</div>
                <div className="text-xs text-gray-500 mt-1">Provperiod pågår</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border border-green-200/50">
                <Play className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Kan konvertera snart
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Successful Conversions - FIXED */}
        <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{actualConversions}</div>
                <div className="text-sm text-gray-600">Konverteringar</div>
                <div className="text-xs text-gray-500 mt-1">{actualConversions * 7} extra dagar</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center border border-purple-200/50">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                {actualConversions > 0 ? 'Belöningar erhållna' : 'Inga belöningar än'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Flow Explanation */}
      {renderJourneyFlow()}

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
                <CardTitle className="text-gray-900 text-lg">Inbjudningsvy</CardTitle>
                <p className="text-sm text-gray-600">Följ varje inbjudans resa mot konvertering</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('journey')}
                className={`
                  ${activeTab === 'journey'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } transition-all duration-200
                `}
              >
                Timelinevy ({invitations.length})
              </Button>
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
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-6 space-y-6">
          {activeTab === 'journey' ? (
            <div className="space-y-6">
              {invitations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Inga inbjudningar ännu</h3>
                  <p className="text-gray-600 mb-4">
                    Skicka din första inbjudan för att se resan mot konvertering!
                  </p>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                  >
                    Skapa första inbjudan
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {invitations.map((invitation) => {
                    const currentStage = getInvitationStage(invitation);
                    const progress = getStageProgress(invitation);

                    return (
                      <div
                        key={invitation.id}
                        className="relative p-6 bg-white border border-gray-200/80 rounded-xl hover:shadow-lg transition-all duration-300 group"
                      >
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/20 to-slate-50/30 rounded-xl" />

                        {/* Guest Info Header */}
                        <div className="relative flex items-center justify-between mb-6">
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
                                Skickad {new Date(invitation.created_at).toLocaleDateString('sv-SE')}
                                {invitation.accepted_at && (
                                  <span className="ml-2">• Accepterad {new Date(invitation.accepted_at).toLocaleDateString('sv-SE')}</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-700">{Math.round(progress)}% klar</div>
                            <div className="text-xs text-gray-500">mot konvertering</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative mb-6">
                          <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Timeline Steps */}
                        <div className="relative">
                          <div className="flex justify-between items-start">
                            {journeyStages.map((stage, index) => {
                              const isCompleted = journeyStages.findIndex(s => s.id === currentStage) >= index;
                              const isCurrent = stage.id === currentStage;

                              return (
                                <div key={stage.id} className="flex-1 text-center relative">
                                  <div className={`
                                    w-10 h-10 mx-auto rounded-full border-2 flex items-center justify-center transition-all duration-300
                                    ${isCompleted
                                      ? `${stage.bgColor} ${stage.borderColor} ${stage.color}`
                                      : 'bg-gray-100 border-gray-200 text-gray-400'
                                    }
                                    ${isCurrent ? 'ring-4 ring-purple-100 scale-110' : ''}
                                  `}>
                                    <stage.icon className="w-5 h-5" />
                                  </div>
                                  <div className="mt-2">
                                    <p className={`text-xs font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                      {stage.title}
                                    </p>
                                    <p className={`text-xs ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                                      {stage.description}
                                    </p>
                                  </div>
                                  {isCurrent && (
                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Current Status Info */}
                        <div className="relative mt-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {currentStage === 'sent' && (
                                <>
                                  <Clock className="w-5 h-5 text-orange-600" />
                                  <div>
                                    <p className="font-medium text-gray-900">Väntar på gäst-respons</p>
                                    <p className="text-sm text-gray-600">
                                      Länken går ut {formatTimeRemaining(invitation.expires_at)}
                                    </p>
                                  </div>
                                </>
                              )}
                              {currentStage === 'trial_active' && (
                                <>
                                  <Play className="w-5 h-5 text-green-600" />
                                  <div>
                                    <p className="font-medium text-gray-900">Provperiod aktiv!</p>
                                    <p className="text-sm text-gray-600">
                                      {formatTimeRemaining(invitation.expires_at)} av 7-dagars prövotid
                                    </p>
                                  </div>
                                </>
                              )}
                              {currentStage === 'converted' && (
                                <>
                                  <Crown className="w-5 h-5 text-purple-600" />
                                  <div>
                                    <p className="font-medium text-gray-900">Konverterad! 🎉</p>
                                    <p className="text-sm text-gray-600">
                                      Ni fick båda 1 vecka extra Premium
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {invitation.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onCopyLink(invitation.invitation_code)}
                                  className="bg-white hover:bg-gray-50 border-gray-200"
                                >
                                  <Copy className="w-4 h-4 mr-1" />
                                  Kopiera
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onShareSocial(invitation.invitation_code, 'email')}
                                  className="bg-white hover:bg-gray-50 border-gray-200"
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Potential Rewards Preview */}
                        {!invitation.converted_to_paid && (
                          <div className="relative mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                            <div className="flex items-center space-x-2 text-purple-800">
                              <Gift className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Potentiell belöning: 1 vecka extra Premium för er båda
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
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

              {/* Remaining Invitations Display */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">
                        {allowance.remaining_invitations} inbjudningar kvar
                      </p>
                      <p className="text-sm text-blue-700">
                        av {allowance.total_allowance} för {allowance.month_year}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(0, (allowance.remaining_invitations / allowance.total_allowance) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Reset nästa månad
                    </p>
                  </div>
                </div>
              </div>

              {/* Quota Warning */}
              {allowance.remaining_invitations <= 0 && (
                <div className="p-5 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200/60 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
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
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-800">Vad får din gäst?</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>7 dagars gratis Premium</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Obegränsade personliga brev</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Avancerad CV-analys</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Prioriterad support</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Automatisk tonalitetsanpassning</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Kompetensanalys</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestInvitationCard;