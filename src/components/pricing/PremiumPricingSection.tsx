'use client'

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle, Lock, ArrowRight, Heart,
  Zap, FileSearch, Palette, BrainCircuit, Save, Target
} from 'lucide-react';
import { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT, PREMIUM_TEMPLATE_COUNT } from '@/lib/cv/simple-templates';

const premiumFeatures = [
  {
    icon: Zap,
    title: "Obegränsade personliga brev",
    description: "Ansök till alla jobb du vill utan att vänta. Ingen daglig gräns.",
    gradient: "from-blue-500/20 to-indigo-500/20"
  },
  {
    icon: FileSearch,
    title: "Djupgående analyser när du behöver",
    description: "Få detaljerad feedback på ditt CV och kompetenser utan begränsningar",
    gradient: "from-indigo-500/20 to-purple-500/20"
  },
  {
    icon: Palette,
    title: `Alla ${TEMPLATE_COUNT} professionella mallar`,
    description: "Från minimalistisk till executive-nivå. Välj den som passar din bransch.",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: BrainCircuit,
    title: "Automatisk tonalitetsoptimering",
    description: "Systemet anpassar automatiskt din brevstil till företaget och rollen",
    gradient: "from-pink-500/20 to-red-500/20"
  },
  {
    icon: Save,
    title: "Spara allt du skapar",
    description: "Bygg upp ditt bibliotek av anpassade brev och analyser",
    gradient: "from-red-500/20 to-orange-500/20"
  },
  {
    icon: Target,
    title: "Professionell export",
    description: "Ladda ner färdiga dokument i Word eller PDF, redo att skicka.",
    gradient: "from-orange-500/20 to-yellow-500/20"
  }
];

export default function PremiumPricingSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container px-4 mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Transparent prissättning - <span className="text-neutral-900">äkta värde</span>
          </h2>
          <p className="text-xl text-neutral-600 mb-4">
            Testa gratis först, sedan bestäm om du vill ha obegränsad tillgång till alla verktyg.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center px-6 py-3 bg-green-100 text-green-700 text-sm font-semibold rounded-full border border-green-200 shadow-sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Ingen bindningstid • Transparenta priser • Spara 15-20 timmar per månad
          </motion.div>
        </motion.div>

        <div className="grid max-w-7xl gap-8 mx-auto lg:grid-cols-2 items-stretch">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -40, rotateY: -5 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{
              y: -12,
              rotateY: 2,
              scale: 1.02,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            className="relative group perspective-1000"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Floating particles */}
            <motion.div
              className="absolute -top-2 -left-2 w-4 h-4 bg-green-400 rounded-full opacity-60"
              animate={{
                y: [-5, -15, -5],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -top-1 -right-3 w-2 h-2 bg-blue-400 rounded-full opacity-50"
              animate={{
                y: [-3, -10, -3],
                x: [0, 5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />

            <div className="flex flex-col h-full bg-white border border-gray-200/60 rounded-xl overflow-hidden relative">
              <div className="p-8 flex-grow relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-neutral-900">Gratis</h3>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-full border border-green-200 shadow-sm"
                  >
                    För att testa
                  </motion.div>
                </div>

                <p className="text-neutral-600 mb-6 leading-relaxed">
                  Perfekt för att uppleva våra smarta verktyg och testa grundfunktionerna
                </p>

                <div className="mb-8">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="text-5xl font-bold text-neutral-900 inline-block"
                  >
                    0 kr
                  </motion.span>
                  <span className="text-neutral-600 ml-2">/ för alltid</span>
                </div>

                <div className="space-y-4">
                  <p className="font-semibold text-neutral-900 mb-4">Detta ingår:</p>

                  <div className="space-y-3">
                    {[
                      '1 personligt brev per dag',
                      '1 CV-analys var tredje dag',
                      '2 uppladdade CV:n',
                      '1 LinkedIn-optimering per vecka',
                      'Alla rekryteringstester på grundnivå',
                      '10 jobbmatchningar',
                      `${FREE_TEMPLATE_COUNT} gratis CV-mallar`
                    ].map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        whileHover={{ x: 5 }}
                        className="flex items-center group/item"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CheckCircle className="w-6 h-6 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0" />
                        </motion.div>
                        <span className="text-sm sm:text-base text-neutral-700 group-hover/item:text-neutral-900 transition-colors">{feature}</span>
                      </motion.div>
                    ))}

                    {/* Locked features */}
                    <div className="pt-4 border-t border-gray-100">
                      {[
                        'Obegränsade personliga brev (Premium)',
                        'Obegränsade CV-analyser (Premium)',
                        'Avancerade rekryteringstester (Premium)',
                        'Helt obegränsad jobbmatchning (Premium)',
                        `Alla ${PREMIUM_TEMPLATE_COUNT} premium CV-mallar (Premium)`
                      ].map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                          className="flex items-center opacity-60 mt-2 group/locked"
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <Lock className="w-6 h-6 sm:w-5 sm:h-5 text-gray-400 mr-3 flex-shrink-0" />
                          </motion.div>
                          <span className="text-sm sm:text-base text-neutral-500 group-hover/locked:text-neutral-600 transition-colors">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 relative z-10">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/register"
                    className="flex items-center justify-center w-full min-h-[44px] touch-manipulation px-6 py-4 font-semibold text-neutral-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 group border border-gray-200 hover:border-gray-300 shadow-sm relative overflow-hidden"
                  >
                    Starta gratis
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: 5 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{
              y: -16,
              rotateY: -3,
              scale: 1.03,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
            className="relative group perspective-1000 transform-gpu"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Floating particles */}
            <motion.div
              className="absolute -top-3 -left-3 w-6 h-6 bg-pink-400 rounded-full"
              animate={{
                y: [-8, -20, -8],
                rotate: [0, 360, 720],
                scale: [0.8, 1.2, 0.8],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Popular Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.1, y: -2 }}
              className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30"
            >
              <div className="relative">
                <div className="px-6 py-3 bg-pink-600 text-white text-sm font-bold rounded-xl shadow-2xl border border-white/20 backdrop-blur-sm">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="inline-block mr-2"
                  >
                    ⭐
                  </motion.div>
                  Mest populär
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col h-full bg-white border-2 border-pink-200/60 rounded-xl overflow-hidden relative transform-gpu">
              <div className="p-8 flex-grow relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.h3
                    whileHover={{ scale: 1.05 }}
                    className="text-3xl font-bold text-neutral-900"
                  >
                    Premium
                  </motion.h3>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-bold rounded-full border border-purple-200 shadow-sm"
                  >
                    Obegränsat
                  </motion.div>
                </div>

                <p className="text-neutral-600 mb-6 leading-relaxed">
                  Få tillgång till alla funktioner för 149 kr/mån, mindre än vad en arbetslunch kostar. Perfekt för seriös jobbsökning.
                </p>

                <div className="mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block"
                  >
                    <span className="text-6xl font-bold text-neutral-900">
                      149 kr
                    </span>
                  </motion.div>
                  <span className="text-neutral-600 ml-3 text-lg">/ månad</span>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-neutral-500 mt-2 flex items-center gap-1"
                  >
                    <Heart className="w-3 h-3 text-pink-500" />
                    Ingen bindningstid • Avsluta när som helst
                  </motion.p>
                </div>

                <div className="space-y-4">
                  <p className="font-semibold text-neutral-900 mb-4">Allt i Gratis, plus:</p>

                  <div className="space-y-3">
                    {premiumFeatures.map((feature, index) => {
                      const IconComponent = feature.icon
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          whileHover={{
                            x: 8,
                            scale: 1.02,
                            transition: { duration: 0.2 }
                          }}
                          className="flex items-start group/feature cursor-pointer"
                        >
                          <motion.div
                            whileHover={{
                              scale: 1.2,
                              rotate: 360,
                              transition: { duration: 0.5 }
                            }}
                            className="flex items-center justify-center mr-4 flex-shrink-0"
                          >
                            <IconComponent className="w-5 h-5 text-purple-600 group-hover/feature:text-purple-700" />
                          </motion.div>
                          <div className="flex-grow">
                            <div className="font-semibold text-neutral-900 group-hover/feature:text-purple-900 transition-colors">{feature.title}</div>
                            <div className="text-sm text-neutral-600 group-hover/feature:text-neutral-700 transition-colors">{feature.description}</div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 relative z-10">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <Link
                    href="/trial-signup"
                    className="flex items-center justify-center w-full min-h-[44px] touch-manipulation px-6 sm:px-8 py-5 font-bold text-sm sm:text-base text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all duration-300 group relative overflow-hidden border border-white/20"
                  >
                    <span className="hidden sm:inline">Prova Premium gratis i 7 dagar</span>
                    <span className="sm:hidden">Prova Premium i 7 dagar</span>
                    <ArrowRight className="w-5 h-5 ml-2 sm:ml-3 transition-transform group-hover:translate-x-2" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-neutral-500"
        >
          Alla priser inkluderar moms. Säkra betalningar via Stripe. Ingen bindningstid.
        </motion.p>
      </div>
    </section>
  );
}
