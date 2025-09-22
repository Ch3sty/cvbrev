'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Crown,
  Zap,
  CheckCircle2,
  Star,
  Trophy,
  Clock,
  Gift,
  Users,
  ArrowRight,
  Mail,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';

// Types for guest welcome landing
interface Inviter {
  full_name: string;
  email: string;
  current_level: number;
  level_title: string;
  profile_photo_url?: string;
}

interface InvitationDetails {
  invitation_code: string;
  trial_duration_days: number;
  expires_at: string;
  inviter: Inviter;
  features_included: string[];
}

interface GuestWelcomeLandingProps {
  invitation: InvitationDetails;
  onAcceptInvitation: (email: string, fullName: string, password: string) => Promise<void>;
  onDeclineInvitation: () => void;
  isAccepting?: boolean;
  error?: string;
  showEmailConfirmation?: boolean;
  confirmationEmail?: string;
}

const GuestWelcomeLanding: React.FC<GuestWelcomeLandingProps> = ({
  invitation,
  onAcceptInvitation,
  onDeclineInvitation,
  isAccepting = false,
  error,
  showEmailConfirmation = false,
  confirmationEmail = ''
}) => {
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [currentStep, setCurrentStep] = useState<'welcome' | 'signup' | 'success'>('welcome');
  const [timeRemaining, setTimeRemaining] = useState('');

  // Calculate time remaining for invitation
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(invitation.expires_at);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Utgången');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days} dagar kvar`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours} timmar kvar`);
      } else {
        setTimeRemaining(`${minutes} minuter kvar`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [invitation.expires_at]);

  const handleAcceptInvitation = async () => {
    if (!guestEmail.trim() || !guestName.trim() || !guestPassword.trim()) return;

    if (guestPassword.length < 6) {
      // Should show error but handled by parent
      return;
    }

    try {
      await onAcceptInvitation(guestEmail.trim(), guestName.trim(), guestPassword.trim());
      setCurrentStep('success');
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const premiumFeatures = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Obegränsade personliga brev',
      description: 'Skapa så många anpassade personliga brev som du vill'
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Avancerad CV-analys',
      description: 'AI-driven analys som identifierar förbättringsområden'
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: 'Automatisk tonalitetsanpassning',
      description: 'AI anpassar ditt brev till företagskulturen'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Kompetensanalys',
      description: 'Identifiera kompetensglapp och få utvecklingsförslag'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Prioriterad support',
      description: 'Snabbare hjälp när du behöver det'
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: 'Premium mallar',
      description: 'Tillgång till alla professionella CV-mallar'
    }
  ];

  const testimonials = [
    {
      name: 'Anna Lindström',
      role: 'Marketing Manager',
      text: 'Tack vare Jobbcoach.ai fick jag mitt drömjobb inom två veckor!',
      rating: 5
    },
    {
      name: 'Erik Johansson',
      role: 'Systemutvecklare',
      text: 'AI-analyserna hjälpte mig förstå vad rekryterare verkligen söker.',
      rating: 5
    },
    {
      name: 'Sofia Karlsson',
      role: 'Projektledare',
      text: 'Bästa investeringen för min karriär. Rekommenderar starkt!',
      rating: 5
    }
  ];

  // Show email confirmation message if needed
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto bg-navy-800 border-navy-700">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-20 animate-pulse" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">Bekräfta din e-postadress</h1>
            <p className="text-gray-300 mb-6">
              Vi har skickat ett bekräftelsemail till:
              <br />
              <span className="font-semibold text-white">{confirmationEmail}</span>
            </p>

            <div className="bg-navy-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-3">För att slutföra registreringen:</p>
              <ol className="text-left text-sm text-gray-300 space-y-2">
                <li>1. Öppna bekräftelsemailet i din inkorg</li>
                <li>2. Klicka på bekräftelselänken</li>
                <li>3. Återkom hit för att acceptera din premium-inbjudan</li>
              </ol>
            </div>

            <Button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 mb-3"
            >
              Jag har bekräftat min e-post
            </Button>

            <p className="text-xs text-gray-400">
              Hittar du inte mailet? Kolla skräpposten eller kontakta{' '}
              <a href="mailto:support@jobbcoach.ai" className="text-pink-400 hover:text-pink-300">
                support@jobbcoach.ai
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto bg-navy-800 border-navy-700">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur opacity-20 animate-pulse" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">Välkommen till Jobbcoach.ai!</h1>
            <p className="text-gray-300 mb-6">
              Din {invitation.trial_duration_days}-dagars premium-provperiod har aktiverats.
              Kolla din e-post för inloggningsuppgifter.
            </p>

            <Button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              Logga in och kom igång
            </Button>

            <p className="text-sm text-gray-400 mt-4">
              Har du frågor? Kontakta vår support på{' '}
              <a href="mailto:support@jobbcoach.ai" className="text-pink-400 hover:text-pink-300">
                support@jobbcoach.ai
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        <div className="relative container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-xl">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-30 animate-pulse" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Du har blivit inbjuden till{' '}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Jobbcoach.ai Premium
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Sveriges mest avancerade AI-drivna karriärcoach. Skapa personliga brev som verkligen sticker ut.
            </p>
          </div>

          {/* Invitation Details */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-navy-800/50 border-navy-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold">
                      {invitation.inviter.profile_photo_url ? (
                        <img
                          src={invitation.inviter.profile_photo_url}
                          alt={invitation.inviter.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(invitation.inviter.full_name)
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {invitation.inviter.full_name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {invitation.inviter.level_title} • Level {invitation.inviter.current_level}
                      </p>
                    </div>
                  </div>

                  <Badge variant="warning" className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeRemaining}</span>
                  </Badge>
                </div>

                <div className="p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Gift className="w-5 h-5 text-pink-400" />
                    <span className="font-semibold text-white">
                      Exklusiv inbjudan: {invitation.trial_duration_days} dagars gratis premium
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Testa alla premium-funktioner utan kostnad. Ingen bindningstid eller kreditkort krävs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Left Column - Features */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Vad ingår i din premium-provperiod?
              </h2>

              <div className="space-y-4 mb-8">
                {premiumFeatures.map((feature, index) => (
                  <Card key={index} className="bg-navy-800/30 border-navy-700 hover:border-pink-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                          <p className="text-sm text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Social Proof */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Vad våra användare säger</h3>
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="bg-navy-800/30 border-navy-700">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-1 mb-2">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">"{testimonial.text}"</p>
                      <p className="text-xs text-gray-400">
                        — {testimonial.name}, {testimonial.role}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Column - Signup Form */}
            <div>
              <Card className="bg-navy-800 border-navy-700 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <UserPlus className="w-6 h-6 text-pink-500" />
                      <span>Acceptera inbjudan</span>
                    </div>
                    <p className="text-sm font-normal text-gray-400">
                      Starta din {invitation.trial_duration_days}-dagars gratis provperiod
                    </p>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ditt namn
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Anna Andersson"
                      className="w-full px-3 py-2 bg-navy-700 border border-navy-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      disabled={isAccepting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-postadress
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="anna@example.com"
                      className="w-full px-3 py-2 bg-navy-700 border border-navy-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      disabled={isAccepting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Lösenord
                    </label>
                    <input
                      type="password"
                      value={guestPassword}
                      onChange={(e) => setGuestPassword(e.target.value)}
                      placeholder="Minst 6 tecken"
                      className="w-full px-3 py-2 bg-navy-700 border border-navy-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      disabled={isAccepting}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Du använder detta för att logga in senare
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleAcceptInvitation}
                      disabled={!guestEmail.trim() || !guestName.trim() || !guestPassword.trim() || guestPassword.length < 6 || isAccepting}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3"
                    >
                      {isAccepting ? (
                        'Aktiverar provperiod...'
                      ) : (
                        <>
                          Starta gratis provperiod
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={onDeclineInvitation}
                      disabled={isAccepting}
                      className="w-full text-gray-400 hover:text-white"
                    >
                      Nej tack, inte nu
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-navy-700">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>Ingen bindningstid</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>Inget kreditkort krävs</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>Avbryt när som helst</span>
                    </div>
                  </div>

                  <div className="pt-4 text-center">
                    <p className="text-sm text-gray-400">
                      Redan registrerad?{' '}
                      <a
                        href="/login"
                        className="text-pink-400 hover:text-pink-300 font-medium"
                      >
                        Logga in här
                      </a>
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Genom att acceptera inbjudan godkänner du våra{' '}
                    <a href="/anvandarvillkor" className="text-pink-400 hover:text-pink-300">
                      användarvillkor
                    </a>{' '}
                    och{' '}
                    <a href="/integritetspolicy" className="text-pink-400 hover:text-pink-300">
                      integritetspolicy
                    </a>
                    .
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestWelcomeLanding;