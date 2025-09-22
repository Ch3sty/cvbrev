'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Gift,
  Sparkles,
  Copy,
  Check,
  Mail,
  Heart
} from 'lucide-react';

interface GuestInvitationButtonProps {
  isPremium: boolean;
  availableInvitations?: number;
  onInviteGuest: () => void;
  className?: string;
  variant?: 'navbar' | 'dashboard' | 'compact';
}

const GuestInvitationButton: React.FC<GuestInvitationButtonProps> = ({
  isPremium,
  availableInvitations = 0,
  onInviteGuest,
  className = '',
  variant = 'navbar'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  // Don't render for non-premium users
  if (!isPremium) return null;

  const handleInviteClick = () => {
    onInviteGuest();
  };

  const getButtonContent = () => {
    switch (variant) {
      case 'navbar':
        return (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Gift className="w-4 h-4" />
              {availableInvitations > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="font-medium">Bjud in vän</span>
            {availableInvitations > 0 && (
              <Badge
                variant="secondary"
                className="bg-pink-600/20 text-pink-300 border-pink-500/30 text-xs px-1.5 py-0.5"
              >
                {availableInvitations}
              </Badge>
            )}
          </div>
        );

      case 'dashboard':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">Bjud in vänner</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-400">
                Dela premium-upplevelsen
              </p>
            </div>
            {availableInvitations > 0 && (
              <Badge
                variant="default"
                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white"
              >
                {availableInvitations} kvar
              </Badge>
            )}
          </div>
        );

      case 'compact':
        return (
          <div className="flex items-center space-x-1.5">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Bjud in</span>
            {availableInvitations > 0 && (
              <Badge variant="secondary" className="text-xs">
                {availableInvitations}
              </Badge>
            )}
          </div>
        );
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "relative overflow-hidden transition-all duration-300 group";

    switch (variant) {
      case 'navbar':
        return `${baseStyles} bg-gradient-to-r from-pink-600/90 to-purple-600/90 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl border border-pink-500/30 backdrop-blur-sm`;

      case 'dashboard':
        return `${baseStyles} w-full bg-navy-800/50 border border-navy-700/50 hover:border-pink-500/50 backdrop-blur-sm rounded-xl p-4 text-left`;

      case 'compact':
        return `${baseStyles} bg-gradient-to-r from-pink-600/80 to-purple-600/80 hover:from-pink-600 hover:to-purple-600 text-white text-sm`;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Glassmorphism glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity" />

      <Button
        onClick={handleInviteClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={getButtonStyles()}
        size={variant === 'compact' ? 'sm' : 'default'}
      >
        {/* Background glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Shimmer animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-all duration-700" />

        {/* Content */}
        <div className="relative z-10">
          {getButtonContent()}
        </div>
      </Button>

      {/* Tooltip for navbar variant */}
      {variant === 'navbar' && isHovered && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
          <div className="bg-navy-900 border border-navy-700 rounded-lg p-3 shadow-2xl min-w-64 animate-fadeIn">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="w-4 h-4 text-pink-400" />
              <span className="font-semibold text-white">Premium-inbjudningar</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              Som premium-medlem kan du bjuda in vänner att prova Jobbcoach.ai gratis.
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Tillgängliga inbjudningar:</span>
              <Badge variant="secondary" className="bg-pink-600/20 text-pink-300">
                {availableInvitations} st
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Special milestone indicator */}
      {availableInvitations >= 5 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
          <Sparkles className="w-3 h-3 text-navy-900" />
        </div>
      )}
    </div>
  );
};

export default GuestInvitationButton;