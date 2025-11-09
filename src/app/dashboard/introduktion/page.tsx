'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText,
  Brain,
  PenTool,
  Linkedin,
  Briefcase,
  Palette,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap
} from 'lucide-react';

// Feature card data med förbättrad copy
const features = [
  {
    id: 1,
    icon: FileText,
    title: 'Ladda upp ditt CV',
    description: 'Grunden för allt du gör här. Ladda upp ditt CV så plockar vi automatiskt fram din erfarenhet, kompetenser och utbildning.',
    benefits: [
      'Vi läser av arbetslivserfarenhet och roller',
      'Identifierar dina kompetenser och färdigheter',
      'Sparar kontaktuppgifter för framtida brev',
      'Premium: Ladda upp obegränsat antal CV:n'
    ],
    color: 'from-blue-500 to-indigo-600',
    lightBg: 'from-blue-50 to-indigo-50',
    href: '/dashboard/profil/cv',
    cta: 'Ladda upp CV'
  },
  {
    id: 2,
    icon: Brain,
    title: 'Analysera ditt CV',
    description: 'Få konkreta tips på vad du kan förbättra. Vi kollar styrkor, svagheter och ger dig förslag som faktiskt gör skillnad.',
    benefits: [
      'Styrkor och förbättringsområden i din presentation',
      'Kompetenser som kan formuleras tydligare',
      'ATS-kompatibilitet för rekryteringssystem',
      'Exempel: "Ökade försäljningen med 35%" istället för "Ansvarade för försäljning"'
    ],
    color: 'from-purple-500 to-pink-600',
    lightBg: 'from-purple-50 to-pink-50',
    href: '/dashboard/cv-analys',
    cta: 'Analysera CV'
  },
  {
    id: 3,
    icon: PenTool,
    title: 'Skapa personliga brev',
    description: 'Klistra in en jobbannons, välj tonalitet och få ett färdigt personligt brev på under 30 sekunder.',
    benefits: [
      'Vi analyserar jobbannonsen och hittar viktiga nyckelord',
      'Lyfter fram din relevanta erfarenhet automatiskt',
      'Sex olika stilar – från professionell till kreativ',
      'ATS-optimerat så du kommer igenom första screeningen'
    ],
    color: 'from-pink-500 to-rose-600',
    lightBg: 'from-pink-50 to-rose-50',
    href: '/dashboard/skapa-brev',
    cta: 'Skapa brev'
  },
  {
    id: 4,
    icon: Linkedin,
    title: 'Optimera din LinkedIn',
    description: 'Förvandla din LinkedIn-profil till en magnet för rekryterare. Tydligare texter, bättre nyckelord, högre synlighet.',
    benefits: [
      'Professionella formuleringar som sticker ut',
      'Rätt nyckelord för din bransch och roll',
      'Optimering för LinkedIn:s algoritm',
      'Gratis: 1 optimering/vecka • Premium: Obegränsat'
    ],
    color: 'from-blue-600 to-cyan-600',
    lightBg: 'from-blue-50 to-cyan-50',
    href: '/dashboard/linkedin-optimizer',
    cta: 'Optimera LinkedIn'
  },
  {
    id: 5,
    icon: Briefcase,
    title: 'Hitta matchande jobb',
    description: 'Vi söker automatiskt bland tusentals lediga tjänster och visar vilka som passar din profil bäst.',
    benefits: [
      'Automatisk matchning mot Arbetsförmedlingens databas',
      'Förstår synonymer: "Frontend Developer" = "React Developer"',
      'Rankas 0-100% baserat på din profil',
      'Klicka på ett jobb för att skapa personligt brev direkt'
    ],
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'from-emerald-50 to-teal-50',
    href: '/dashboard/jobbmatchning',
    cta: 'Sök jobb'
  },
  {
    id: 6,
    icon: Palette,
    title: 'Välj professionell mall',
    description: 'Exportera ditt CV i över 10 professionella designer. Alla mallar är ATS-kompatibla och optimerade för både skärm och utskrift.',
    benefits: [
      'ATS-kompatibla – passerar automatiska system',
      'Branschanpassade – rätt stil för din sektor',
      'Premium-mallar: Platinum Executive, Nordic Professional, Creative Edge',
      'Olika mallar för olika typer av roller'
    ],
    color: 'from-indigo-500 to-purple-600',
    lightBg: 'from-indigo-50 to-purple-50',
    href: '/dashboard/cv-mallar',
    cta: 'Välj mall'
  }
];

export default function IntroduktionPage() {
  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center max-w-3xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-xl mb-6"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Så fungerar Jobbcoach.ai
        </h1>

        <p className="text-lg md:text-xl text-slate-600 mb-3">
          Allt du behöver för att sticka ut i din jobbsökning.
        </p>

        <p className="text-base text-slate-500">
          Sex verktyg som hjälper dig skapa bättre ansökningar, snabbare.
        </p>
      </motion.div>

      {/* Features Grid - 3 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            index={index}
          />
        ))}
      </div>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-2xl border border-purple-200/50 p-8 md:p-12 text-center shadow-xl"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-6"
          >
            <Zap className="w-16 h-16 text-purple-600" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Redo att komma igång?
          </h2>

          <p className="text-lg text-slate-600 mb-8">
            Börja med att ladda upp ditt CV. Sen tar vi det därifrån.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard/profil/cv">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex items-center gap-2 text-lg"
              >
                Ladda upp CV
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border-2 border-slate-200 hover:border-purple-300 transition-all duration-300"
              >
                Tillbaka till dashboard
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  feature: typeof features[0];
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="h-full bg-white rounded-2xl border border-slate-200 hover:border-purple-300 shadow-lg hover:shadow-2xl hover:shadow-purple-200/30 transition-all duration-300 overflow-hidden">
        {/* Gradient Header with Icon */}
        <div className={`bg-gradient-to-br ${feature.lightBg} p-6 border-b border-slate-100`}>
          <motion.div
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl shadow-lg mb-4`}
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {feature.title}
          </h3>

          <p className="text-sm text-slate-600 leading-relaxed">
            {feature.description}
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-3">
          {feature.benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + idx * 0.05 }}
              className="flex items-start gap-3 group/item"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
              <span className="text-sm text-slate-700 leading-relaxed">
                {benefit}
              </span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="px-6 pb-6">
          <Link href={feature.href} className="block">
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full px-6 py-3 bg-gradient-to-r ${feature.color} text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2`}
            >
              {feature.cta}
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
