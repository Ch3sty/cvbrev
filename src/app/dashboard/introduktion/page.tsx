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
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
          Så fungerar Jobbcoach.ai
        </h1>

        <p className="text-lg md:text-xl text-neutral-600 mb-3">
          Allt du behöver för att sticka ut i din jobbsökning.
        </p>

        <p className="text-base text-neutral-500">
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
        className="bg-white rounded-xl border border-neutral-200 p-8 md:p-12 text-center"
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
            <Zap className="w-10 h-10 text-orange-600" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Redo att komma igång?
          </h2>

          <p className="text-lg text-neutral-600 mb-8">
            Börja med att ladda upp ditt CV. Sen tar vi det därifrån.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard/profil/cv">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-all duration-300 flex items-center gap-2 text-lg"
              >
                Ladda upp CV
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-neutral-700 rounded-xl font-semibold border-2 border-neutral-200 hover:border-orange-300 transition-all duration-300"
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
      <div className="h-full bg-white rounded-xl border border-neutral-200 hover:border-orange-300 transition-all duration-300 overflow-hidden">
        {/* Header with Icon */}
        <div className="p-6 border-b border-neutral-100">
          <motion.div
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="inline-flex items-center justify-center mb-4"
          >
            <Icon className="w-7 h-7 text-neutral-700" />
          </motion.div>

          <h3 className="text-xl font-bold text-neutral-900 mb-2">
            {feature.title}
          </h3>

          <p className="text-sm text-neutral-600 leading-relaxed">
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
              <span className="text-sm text-neutral-700 leading-relaxed">
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
              className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
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
