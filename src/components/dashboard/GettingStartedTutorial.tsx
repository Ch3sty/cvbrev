'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, PenTool, Brain, Briefcase, Palette, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import FloatingParticles from './FloatingParticles';

const tutorialSteps = [
  {
    id: 1,
    icon: FileText,
    title: '1. Ladda upp ditt CV',
    description: 'Börja med att ladda upp ditt CV i PDF-format. Detta är kärnan i hela systemet.',
    action: 'Ladda upp CV',
    href: '/dashboard/profil/cv',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 2,
    icon: PenTool,
    title: '2. Skapa personliga brev',
    description: 'Använd ditt CV för att automatiskt generera skräddarsydda personliga brev för varje ansökan.',
    action: 'Skapa brev',
    href: '/dashboard/skapa-brev',
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 3,
    icon: Brain,
    title: '3. Analysera & förbättra',
    description: 'Få AI-drivna förbättringsförslag baserat på ditt CV och jobbmarknaden.',
    action: 'Analysera CV',
    href: '/dashboard/cv-analys',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 4,
    icon: Briefcase,
    title: '4. Hitta passande jobb',
    description: 'Automatisk matchning mot lediga tjänster baserat på dina kompetenser och erfarenheter.',
    action: 'Sök jobb',
    href: '/dashboard/jobbmatchning',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 5,
    icon: Palette,
    title: '5. Designa ditt CV',
    description: 'Välj mellan professionella mallar och exportera ditt CV i premium-design.',
    action: 'Välj mall',
    href: '/dashboard/cv-mallar',
    color: 'from-emerald-500 to-teal-500'
  }
];

export default function GettingStartedTutorial() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6 }}
      className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/40 shadow-lg"
    >
      {/* Floating particles background */}
      <FloatingParticles
        count={8}
        colors={['bg-pink-400/5', 'bg-purple-400/5', 'bg-blue-400/5']}
        size="sm"
        speed="slow"
        className="absolute inset-0"
      />

      {/* Header - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-slate-900">Kom igång med Jobbcoach</h3>
            <p className="text-sm text-slate-600">Lär dig hur du använder alla funktioner</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-slate-400" />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="relative px-6 pb-6 space-y-4">
              {tutorialSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="group"
                >
                  <div className="flex items-start gap-4 p-4 bg-white/80 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
                    {/* Icon */}
                    <div className={`p-3 bg-gradient-to-br ${step.color} rounded-xl flex-shrink-0`}>
                      <step.icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 mb-1">{step.title}</h4>
                      <p className="text-sm text-slate-600 mb-3">{step.description}</p>
                      <Link href={step.href}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 bg-gradient-to-r ${step.color} text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all`}
                        >
                          {step.action} →
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
