'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Gift, Crown, ArrowRight } from 'lucide-react';

interface JourneyStep {
  number: number;
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle: string;
  reward?: string;
  highlight?: boolean;
}

const steps: JourneyStep[] = [
  {
    number: 1,
    icon: <Mail className="w-8 h-8 sm:w-10 sm:h-10" />,
    color: 'from-blue-500 to-indigo-600',
    title: 'Du skickar',
    subtitle: 'Bjud in vän via email',
    reward: undefined,
  },
  {
    number: 2,
    icon: <Gift className="w-8 h-8 sm:w-10 sm:h-10" />,
    color: 'from-green-500 to-emerald-600',
    title: 'Vän accepterar',
    subtitle: 'Ni får båda 2 dagar',
    reward: '+2 dagar premium',
  },
  {
    number: 3,
    icon: <Crown className="w-8 h-8 sm:w-10 sm:h-10" />,
    color: 'from-purple-500 to-pink-600',
    title: 'Vän konverterar',
    subtitle: 'Ni får båda 7 dagar till!',
    reward: '+7 dagar premium',
    highlight: true,
  },
];

export default function SimplifiedJourney() {
  return (
    <section className="py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          Så går det till – från inbjudan till belöning
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Följ resan och se exakt när du får dina extra dagar
        </p>
      </div>

      {/* Mobile: Vertical stack */}
      <div className="block md:hidden space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${step.highlight ? 'from-purple-50 to-pink-50 border-2 border-purple-300' : 'from-gray-50 to-gray-100 border border-gray-200'}`}>
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                {step.icon}
              </div>

              {/* Content */}
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-bold text-slate-500">STEG {step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.subtitle}</p>
              </div>

              {/* Reward badge */}
              {step.reward && (
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${step.highlight ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-green-100 text-green-800'}`}>
                  {step.reward}
                </div>
              )}

              {/* Arrow for non-last steps */}
              {index < steps.length - 1 && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <ArrowRight className="w-6 h-6 text-slate-300 rotate-90" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop: Horizontal flow */}
      <div className="hidden md:flex items-start justify-center space-x-4 lg:space-x-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="flex-1 max-w-xs"
            >
              <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${step.highlight ? 'from-purple-50 to-pink-50 border-2 border-purple-300 shadow-xl' : 'from-gray-50 to-gray-100 border border-gray-200 shadow-md'} hover:shadow-xl transition-shadow duration-300`}>
                {/* Step number badge */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-slate-700">{step.number}</span>
                </div>

                {/* Icon */}
                <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-4 shadow-lg mx-auto`}>
                  {step.icon}
                </div>

                {/* Content */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.subtitle}</p>
                </div>

                {/* Reward badge */}
                {step.reward && (
                  <div className="text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${step.highlight ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-green-100 text-green-800'}`}>
                      {step.reward}
                    </div>
                  </div>
                )}

                {/* Highlight pulse effect */}
                {step.highlight && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-400/20"
                    animate={{
                      opacity: [0, 0.5, 0],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </div>
            </motion.div>

            {/* Arrow between steps */}
            {index < steps.length - 1 && (
              <div className="flex items-center pt-16">
                <ArrowRight className="w-8 h-8 text-slate-300" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
