'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Crown,
  Trophy,
  Gift,
  Zap,
  Star,
  CheckCircle2,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  Percent,
  Users,
  Sparkles
} from 'lucide-react';

// Types for the reward claim modal
interface RewardData {
  duration_days?: number;
  percentage?: number;
  discount_type?: string;
  features?: string[];
  bonus_invitations_per_month?: number;
  status?: string;
  lifetime_discount?: number;
  priority_support?: boolean;
  beta_access?: boolean;
  auto_activate?: boolean;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  reward_type: 'trial' | 'discount' | 'premium_time' | 'guest_invitations' | 'status';
  reward_data: RewardData;
  trigger_value: number;
  icon?: string;
}

interface RewardClaimModalProps {
  isOpen: boolean;
  reward: Reward | null;
  onClose: () => void;
  onActivate: (activationData?: any) => Promise<void>;
  isActivating?: boolean;
}

const RewardClaimModal: React.FC<RewardClaimModalProps> = ({
  isOpen,
  reward,
  onClose,
  onActivate,
  isActivating = false
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [activationStep, setActivationStep] = useState<'claim' | 'celebrate' | 'activated'>('claim');
  const [discountCode, setDiscountCode] = useState<string>('');

  useEffect(() => {
    if (isOpen && reward) {
      setActivationStep('claim');
      setShowCelebration(false);
      setDiscountCode('');
    }
  }, [isOpen, reward]);

  if (!isOpen || !reward) return null;

  const getRewardIcon = (type: string, customIcon?: string) => {
    if (customIcon) return customIcon;

    const iconMap = {
      trial: <Zap className="w-8 h-8" />,
      discount: <Percent className="w-8 h-8" />,
      premium_time: <Clock className="w-8 h-8" />,
      guest_invitations: <Users className="w-8 h-8" />,
      status: <Crown className="w-8 h-8" />
    };

    return iconMap[type as keyof typeof iconMap] || <Gift className="w-8 h-8" />;
  };

  const getRewardGradient = (type: string) => {
    const gradients = {
      trial: 'from-blue-500 to-cyan-500',
      discount: 'from-green-500 to-emerald-500',
      premium_time: 'from-purple-500 to-pink-500',
      guest_invitations: 'from-yellow-400 to-orange-500',
      status: 'from-pink-500 to-purple-600'
    };

    return gradients[type as keyof typeof gradients] || 'from-purple-500 to-pink-500';
  };

  const getRewardValue = () => {
    const data = reward.reward_data;

    switch (reward.reward_type) {
      case 'trial':
        return `${data.duration_days} dagars provperiod`;
      case 'discount':
        return `${data.percentage}% rabatt`;
      case 'premium_time':
        return `${data.duration_days} dagars premium utan kostnad`;
      case 'guest_invitations':
        return `+${data.bonus_invitations_per_month} extra inbjudningar per månad`;
      case 'status':
        return `${data.status} status med exklusiva fördelar`;
      default:
        return 'Exklusiv belöning';
    }
  };

  const getRewardDetails = () => {
    const data = reward.reward_data;

    switch (reward.reward_type) {
      case 'trial':
        return {
          title: 'Provperiod',
          features: data.features || [
            'Skapa obegränsat med personliga brev',
            'Vi analyserar ditt CV och ger förbättringstips',
            'Automatisk anpassning av ton och stil',
            'Du får svar snabbare från vår support'
          ],
          expires: data.duration_days ? `${data.duration_days} dagar` : undefined
        };

      case 'discount':
        return {
          title: 'Rabattkupong',
          features: [
            `Du får ${data.percentage}% rabatt när du blir medlem`,
            data.discount_type === 'annual' ? 'Gäller för årsprenumeration' : 'Gäller för månadsprenumeration',
            'Använd koden en gång vid betalning',
            'Rabatten dras av direkt i kassan'
          ],
          expires: '30 dagar'
        };

      case 'premium_time':
        return {
          title: 'Premium utan kostnad',
          features: [
            'Startar direkt när du aktiverar',
            'Allt premium-innehåll ingår',
            'Din befintliga prenumeration pausas automatiskt',
            'Ingen betalning krävs'
          ],
          expires: data.duration_days ? `${data.duration_days} dagar` : undefined
        };

      case 'guest_invitations':
        return {
          title: 'Extra Gästinbjudningar',
          features: [
            `Du kan bjuda in ${data.bonus_invitations_per_month} extra personer varje månad`,
            'Dina gäster får premium i 7 dagar',
            'Du får bonus när gästen blir medlem',
            'Inbjudningarna förnyas automatiskt'
          ],
          expires: '12 månader'
        };

      case 'status':
        return {
          title: 'Exklusiv Status',
          features: [
            `Du får ett ${data.status}-märke i din profil`,
            data.lifetime_discount ? `${data.lifetime_discount}% rabatt så länge du är medlem` : undefined,
            data.priority_support ? 'Snabbare svar från vår support' : undefined,
            data.beta_access ? 'Testa nya funktioner före alla andra' : undefined,
            'Tillgång till medlemsevenemang och exklusivt innehåll'
          ].filter(Boolean) as string[],
          expires: 'Permanent'
        };

      default:
        return {
          title: 'Exklusiv belöning',
          features: ['Exklusiva fördelar'],
          expires: undefined
        };
    }
  };

  const handleActivate = async () => {
    try {
      setShowCelebration(true);
      setActivationStep('celebrate');

      // Generate discount code for discount rewards
      let activationData = {};
      if (reward.reward_type === 'discount') {
        const code = `SAVE${reward.reward_data.percentage}-${Date.now().toString().slice(-6)}`;
        setDiscountCode(code);
        activationData = { discount_code: code };
      }

      await onActivate(activationData);

      // Show celebration for 3 seconds
      setTimeout(() => {
        setActivationStep('activated');
        setShowCelebration(false);
      }, 3000);

    } catch (error) {
      setShowCelebration(false);
      setActivationStep('claim');
    }
  };

  const copyDiscountCode = () => {
    if (discountCode) {
      navigator.clipboard.writeText(discountCode);
    }
  };

  const details = getRewardDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white border border-gray-200/50 rounded-2xl shadow-2xl overflow-hidden modal-container">
          {/* Celebration Animation Overlay */}
          {showCelebration && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-xl animate-bounce">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>

                  {/* Confetti Effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 1000}ms`,
                          animationDuration: `${800 + Math.random() * 400}ms`
                        }}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">Grattis!</h3>
                <p className="text-gray-600">Din belöning har aktiverats</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="relative">
            <div className={`p-1 bg-gradient-to-r ${getRewardGradient(reward.reward_type)}`}>
              <div className="bg-white px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRewardGradient(reward.reward_type)} flex items-center justify-center text-white shadow-lg`}>
                      {getRewardIcon(reward.reward_type, reward.icon)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{reward.name}</h2>
                      <p className="text-sm text-gray-600">Nivå {reward.trigger_value}-belöning</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Reward Value */}
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-900 border-purple-200">
                {getRewardValue()}
              </Badge>
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-700 text-center">{reward.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-pink-500" />
                {details.title}
              </h3>
              <div className="space-y-2">
                {details.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry Info */}
            {details.expires && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-700">
                    {reward.reward_type === 'status' ? 'Permanent belöning' : `Giltig i ${details.expires}`}
                  </span>
                </div>
              </div>
            )}

            {/* Discount Code Display (for activated discount rewards) */}
            {activationStep === 'activated' && reward.reward_type === 'discount' && discountCode && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">Din rabattkod</h4>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 font-mono">
                    {discountCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyDiscountCode}
                    className="hover:bg-green-100"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Rabatten läggs på automatiskt vid betalning
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {activationStep === 'claim' ? (
                <>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isActivating}
                  >
                    Avbryt
                  </Button>
                  <Button
                    onClick={handleActivate}
                    disabled={isActivating}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  >
                    {isActivating ? 'Aktiverar...' : 'Aktivera belöning'}
                  </Button>
                </>
              ) : activationStep === 'activated' ? (
                <div className="flex-1 space-y-2">
                  {reward.reward_type === 'discount' ? (
                    <Button
                      onClick={() => window.open('/priser', '_blank')}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Använd rabatten nu
                    </Button>
                  ) : reward.reward_type === 'guest_invitations' ? (
                    <Button
                      onClick={() => window.open('/dashboard/inbjudningar', '_blank')}
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Skicka inbjudningar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => window.open('/dashboard', '_blank')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Gå till din översikt
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full"
                  >
                    Stäng
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Styles */}
      <style>{`
        @keyframes confettiDrop {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti {
          animation: confettiDrop 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RewardClaimModal;