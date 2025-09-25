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
  CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface ConversionCardProps {
  variant?: 'hero' | 'feature' | 'testimonial' | 'cta';
  position?: number; // Position in grid for analytics
}

const ConversionCard: React.FC<ConversionCardProps> = ({
  variant = 'hero',
  position = 0
}) => {
  const [liveUsers, setLiveUsers] = useState(247);
  const [completedToday, setCompletedToday] = useState(89);

  // Live counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
      if (Math.random() > 0.7) {
        setCompletedToday(prev => prev + 1);
      }
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  const variants = {
    hero: {
      icon: Sparkles,
      gradient: 'from-pink-600 to-purple-600',
      bgGradient: 'from-pink-50 via-purple-50 to-blue-50',
      title: 'Skapa ditt vinnande personliga brev',
      subtitle: 'AI-driven karriärcoaching för svenska jobbsökare',
      description: 'Matcha ditt CV mot jobbannonsen och få ett skräddarsytt personligt brev på under 2 minuter. Över 10,000 svenska jobbsökare har redan fått sina drömjobb.',
      ctaText: 'Skapa mitt brev - Gratis',
      ctaLink: '/create-letter',
      features: ['✓ AI anpassat för svenska arbetsmarknaden', '✓ Perfekt match till jobbannonsen', '✓ Klar på 2 minuter']
    },
    feature: {
      icon: Target,
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      title: 'Analysera ditt CV med AI',
      subtitle: 'Expertfeedback på sekunder',
      description: 'Få detaljerad analys av ditt CV med konkreta förbättringsförslag från vår avancerade AI. Se precis vad rekryterare letar efter.',
      ctaText: 'Analysera mitt CV',
      ctaLink: '/analysera-cv',
      features: ['✓ Detaljerad AI-feedback', '✓ Konkreta förbättringstips', '✓ ATS-optimering']
    },
    testimonial: {
      icon: Award,
      gradient: 'from-green-600 to-teal-600',
      bgGradient: 'from-green-50 to-teal-50',
      title: '"Fick jobbet efter första intervjun!"',
      subtitle: '- Marcus, Utvecklare Stockholm',
      description: 'Med hjälp av jobbcoach.ai fick jag ett personligt brev som verkligen stack ut. Rekryteraren sa att det var det bästa brevet hen läst på månader.',
      ctaText: 'Läs fler framgångsstories',
      ctaLink: '/om-oss',
      features: ['⭐ 4.9/5 i genomsnittlig rating', '📈 85% högre svarfrekvens', '🎯 +15% högre lön i snitt']
    },
    cta: {
      icon: Zap,
      gradient: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      title: 'Prova Premium i 7 dagar',
      subtitle: 'Allt du behöver för din karriär',
      description: 'Obegränsade personliga brev, CV-analys, kompetensutvecklingsplaner och mycket mer. Endast 149 SEK/månad efter testperioden.',
      ctaText: 'Starta gratis testperiod',
      ctaLink: '/register',
      features: ['🚀 Obegränsade AI-genererade brev', '📊 Avancerad CV-analys', '🎯 Personlig karriärcoaching']
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
      {/* Premium Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white
                        bg-gradient-to-r ${config.gradient} shadow-lg`}>
          <Star className="w-3 h-3 mr-1" />
          Premium
        </div>
      </div>

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
              <span className="text-2xl font-bold text-gray-900">10K+</span>
            </div>
            <p className="text-xs text-gray-600">Nöjda användare</p>
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
            Tar endast 2 minuter • Inget kreditkort krävs
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