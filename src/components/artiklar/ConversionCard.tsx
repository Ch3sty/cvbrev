'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  Star,
  Zap,
  Target,
  Award,
  CheckCircle,
  FileText,
  BookOpen,
  TrendingUp as TrendingUpIcon,
  GraduationCap
} from 'lucide-react';
import { useGlobalCounters } from '@/contexts/GlobalCountersContext';

interface ConversionCardProps {
  variant?: 'free-trial' | 'premium';
  position?: number; // Position in grid for analytics
}

const ConversionCard: React.FC<ConversionCardProps> = ({
  variant = 'free-trial',
  position = 0
}) => {
  const { counters } = useGlobalCounters();
  const liveUsers = counters.activeUsers;
  const completedToday = counters.todayLetters;

  const variants = {
    'free-trial': {
      icon: CheckCircle,
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
      title: 'Kom igång gratis',
      subtitle: 'Ingen risk • Inget kreditkort',
      description: 'Upptäck vad jobbcoach.ai kan göra för dig utan att betala en krona. Alla grundfunktioner är gratis att använda - för alltid.',
      ctaText: 'Starta gratis',
      ctaLink: '/register',
      features: [
        '✓ Skapa personliga brev',
        '✓ Få detaljerad CV-analys',
        '✓ Matcha mot jobbannonser',
        '✓ Feedback på din ansökan',
        '✓ Karriärtips och råd'
      ],
      showPremiumBadge: false,
      trustText: 'Helt gratis att komma igång'
    },
    'premium': {
      icon: Award,
      gradient: 'from-pink-600 to-purple-600',
      bgGradient: 'from-pink-50 via-purple-50 to-indigo-50',
      title: 'Lås upp din karriärs fulla potential',
      subtitle: 'Prova Premium gratis i 7 dagar',
      description: 'Få obegränsad tillgång till alla premium-funktioner och avancerade verktyg som tar din jobbsökning till nästa nivå.',
      ctaText: 'Prova Premium gratis i 7 dagar',
      ctaLink: '/trial-signup',
      features: [
        '✓ Obegränsade personliga brev',
        '✓ Avancerad CV-analys & optimering',
        '✓ Personlig karriärcoaching',
        '✓ Kompetensutvecklingsplaner',
        '✓ Prioriterad support',
        '✓ Premium CV-mallar'
      ],
      showPremiumBadge: true,
      trustText: '0 kr de första 7 dagarna'
    }
  };

  const config = variants[variant];
  const Icon = config.icon;


  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`group relative overflow-hidden rounded-2xl border border-gray-200/60
                  hover:border-gray-300/80 hover:shadow-2xl hover:-translate-y-2
                  transition-all duration-500 bg-gradient-to-br ${config.bgGradient}
                  before:absolute before:inset-0 before:bg-white/40 before:backdrop-blur-sm`}
    >
      {/* Premium Badge - only show for premium variant */}
      {config.showPremiumBadge && (
        <div className="absolute top-4 right-4 z-10">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white
                          bg-gradient-to-r ${config.gradient} shadow-lg`}>
            <Star className="w-3 h-3 mr-1" />
            Premium
          </div>
        </div>
      )}

      {/* Live Activity Indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded-full">
            {liveUsers} aktiva nu
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8">
        {/* Icon & Title Section */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-gradient-to-r ${config.gradient} shadow-xl mb-4 group-hover:scale-110
                          transition-transform duration-300`}>
            <Icon className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
            {config.title}
          </h2>

          <p className={`text-sm font-medium mb-4 bg-gradient-to-r ${config.gradient}
                         bg-clip-text text-transparent`}>
            {config.subtitle}
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed mb-6 text-center">
          {config.description}
        </p>

        {/* Features List */}
        <div className="space-y-2 mb-6">
          {config.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="text-sm text-gray-700 flex items-start"
            >
              <span className="mr-2">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/60 rounded-xl backdrop-blur-sm border border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-pink-600" />
              <span className="text-2xl font-bold text-gray-900">{counters.totalUsers}+</span>
            </div>
            <p className="text-xs text-gray-600">Jobbsökare</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{completedToday}</span>
            </div>
            <p className="text-xs text-gray-600">Brev idag</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href={config.ctaLink}
            className={`group/cta inline-flex items-center justify-center px-8 py-4 text-white font-semibold
                       rounded-xl bg-gradient-to-r ${config.gradient} shadow-lg hover:shadow-xl
                       transform hover:scale-105 transition-all duration-300 focus:outline-none
                       focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 w-full md:w-auto`}
          >
            {config.ctaText}
            <ArrowRight className="w-5 h-5 ml-2 group-hover/cta:translate-x-1 transition-transform duration-200" />
          </Link>

          <p className="text-xs text-gray-500 mt-3">
            <Clock className="w-3 h-3 inline mr-1" />
            {config.trustText}
          </p>
        </div>
      </div>

      {/* Subtle animation overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      bg-gradient-to-r from-transparent via-white/5 to-transparent
                      transform -skew-x-12 animate-pulse"></div>
    </motion.article>
  );
};

export default ConversionCard;