'use client';

import { motion } from 'framer-motion';
import { Crown, Zap, Users, Shield, TrendingUp, Coins, Check } from 'lucide-react';

interface Benefit {
  icon: React.ReactNode;
  text: string;
  highlight?: boolean;
}

const benefits = [
  {
    title: 'Upp till 35 dagars gratis Premium/månad',
    description: 'Med 5 inbjudningar per vecka och bara 20% konverteringsrate kan du få nästan 5 veckor extra Premium varje månad. Helt gratis.',
    icon: <Crown className="w-8 h-8" />,
    gradient: 'from-purple-500 to-pink-600',
    benefits: [
      { icon: <TrendingUp className="w-4 h-4" />, text: '5 inbjudningar × 7 dagar = 35 dagar möjligt', highlight: true },
      { icon: <Coins className="w-4 h-4" />, text: 'Spara upp till 499 kr/månad' },
    ]
  },
  {
    title: 'Automatisk förlängning',
    description: 'När din vän uppgraderar förlängs ditt Premium automatiskt med 7 dagar. Du behöver inte göra något – det händer direkt.',
    icon: <Zap className="w-8 h-8" />,
    gradient: 'from-blue-500 to-indigo-600',
    benefits: [
      { icon: <Check className="w-4 h-4" />, text: 'Ingen manual aktivering krävs' },
      { icon: <Check className="w-4 h-4" />, text: 'Stackar med befintligt Premium' },
    ]
  },
  {
    title: 'Hjälp någon du bryr dig om',
    description: 'Dina vänner får verktyg som faktiskt gör skillnad i jobbsökningen. De får 2 dagar gratis att testa – helt utan betalkort.',
    icon: <Users className="w-8 h-8" />,
    gradient: 'from-green-500 to-emerald-600',
    benefits: [
      { icon: <Check className="w-4 h-4" />, text: 'Hjälp vänner med jobbsökningen' },
      { icon: <Check className="w-4 h-4" />, text: '2 dagar gratis utan betalkort' },
    ]
  },
  {
    title: 'Ingen spam, inga konstigheter',
    description: 'Vi skickar ett mejl, punkt. Inga upprepade påminnelser, ingen press. Om de inte är intresserade händer ingenting.',
    icon: <Shield className="w-8 h-8" />,
    gradient: 'from-slate-500 to-slate-700',
    benefits: [
      { icon: <Check className="w-4 h-4" />, text: 'Ett mejl, inget mer' },
      { icon: <Check className="w-4 h-4" />, text: 'Transparent och proffsigt' },
    ]
  },
];

export default function BenefitsShowcase() {
  return (
    <section className="py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          Vad får du ut av det?
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Fyra anledningar till varför detta är bra för dig
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <div className="h-full p-6 bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {benefit.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {benefit.description}
              </p>

              {/* Benefits list */}
              <ul className="space-y-2">
                {benefit.benefits.map((item, idx) => (
                  <li key={idx} className={`flex items-start space-x-2 text-sm ${item.highlight ? 'text-purple-700 font-medium' : 'text-slate-600'}`}>
                    <span className={`flex-shrink-0 mt-0.5 ${item.highlight ? 'text-purple-600' : 'text-green-600'}`}>
                      {item.icon}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
