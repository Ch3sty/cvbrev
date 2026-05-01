'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PenLine,
  FileSearch,
  Compass,
  Library,
  Brain,
  Linkedin,
  ArrowRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: PenLine,
    badge: 'Mest använd',
    badgeColor: 'orange',
    title: 'Personliga brev som matchar annonsen',
    description:
      'Klistra in jobbannonsen. Vi läser ditt CV, identifierar de krav som tjänsten ställer och väver in din egen erfarenhet i ett brev som bevisar matchningen.',
    href: '/personligt-brev-exempel',
    linkLabel: 'Se brev-exempel',
  },
  {
    icon: FileSearch,
    badge: 'Gratis',
    badgeColor: 'emerald',
    title: 'CV-analys med konkret feedback',
    description:
      'Vi granskar ditt CV mot ATS-systemen som svenska rekryterare använder och pekar ut exakt vad som behöver justeras för att passera första gallringen.',
    href: '/cv-exempel',
    linkLabel: 'Se CV-exempel',
  },
  {
    icon: Compass,
    badge: 'Smart',
    badgeColor: 'rose',
    title: 'Jobbmatchning mot lediga tjänster',
    description:
      'Vi extraherar din erfarenhet ur CV:t och matchar mot Arbetsförmedlingen och JobTech. Du hittar tjänster som passar, även sådana du aldrig hade sökt själv.',
    href: '/login?signup=true',
    linkLabel: 'Hitta dina jobb',
  },
  {
    icon: Brain,
    badge: 'Tränings­läge',
    badgeColor: 'orange',
    title: 'Rekryteringstester du kan öva på',
    description:
      'Logiska, verbala och numeriska tester av samma typ som rekryterare använder. Sex paket: grundnivå gratis, avancerade ingår i Premium.',
    href: '/login?signup=true',
    linkLabel: 'Börja träna',
  },
  {
    icon: Library,
    badge: '70+ exempel',
    badgeColor: 'rose',
    title: 'Branschexempel att utgå från',
    description:
      'Bibliotek med över sjuttio personliga brev och CV:n från riktiga yrken: vård, tech, ekonomi, service. Ett snabbt sätt att se hur ett vinnande brev ser ut i din bransch.',
    href: '/personligt-brev-exempel',
    linkLabel: 'Bläddra biblioteket',
  },
  {
    icon: Linkedin,
    badge: 'Premium',
    badgeColor: 'orange',
    title: 'LinkedIn-profilen som hittas',
    description:
      'Åtta av tio rekryterare söker kandidater via LinkedIn. Vi optimerar din profil för både sökmotorerna och de mänskliga ögonen som scrollar förbi.',
    href: '/login?signup=true',
    linkLabel: 'Optimera profilen',
  },
];

const BADGE_STYLES: Record<string, string> = {
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function FeaturesGrid() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Allt i en plattform
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Sex verktyg som tar dig från sökande till anställd
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Brev, CV, jobbmatchning, träning och optimerad LinkedIn. Alla
            byggda specifikt för svenska arbetsmarknaden, granskade av
            rekryterare och uppdaterade veckovis.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.07 }}
              className="group relative flex flex-col bg-white rounded-2xl border border-orange-100 p-6 hover:border-orange-300 hover:-translate-y-0.5 transition-all duration-300"
              style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl"
                  style={{
                    background:
                      'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
                  }}
                >
                  <feature.icon
                    className="w-5 h-5 text-orange-600"
                    strokeWidth={2.2}
                  />
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    BADGE_STYLES[feature.badgeColor]
                  }`}
                >
                  {feature.badge}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight tracking-tight mb-2">
                {feature.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-5 flex-1">
                {feature.description}
              </p>

              <Link
                href={feature.href}
                className="inline-flex items-center gap-1.5 text-orange-700 hover:text-orange-800 font-bold text-sm group/link mt-auto"
              >
                {feature.linkLabel}
                <ArrowRight
                  className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
