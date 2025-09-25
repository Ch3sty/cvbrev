'use client'

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, FileText, Search, BrainCircuit, BarChart3, Users, Zap } from 'lucide-react';
import { useGlobalCounters } from '@/contexts/GlobalCountersContext';

const ComprehensiveServiceCard: React.FC = () => {
  const { counters } = useGlobalCounters();

  const allServices = [
    {
      icon: FileText,
      title: "Professionella CV-mallar",
      description: "200+ branschspecifika mallar som sticker ut"
    },
    {
      icon: BarChart3,
      title: "AI-driven CV-analys",
      description: "Djupgående feedback och konkreta förbättringsförslag"
    },
    {
      icon: Sparkles,
      title: "Personliga brev som konverterar",
      description: "Matchade brev som ökar dina chanser med 300%"
    },
    {
      icon: Search,
      title: "Smart jobbmatchning",
      description: "Hitta relevanta jobb baserat på din profil"
    },
    {
      icon: BrainCircuit,
      title: "Kompetensgap-analys",
      description: "Se vilka färdigheter som fattas för ditt drömjobb"
    },
    {
      icon: Zap,
      title: "Karriärinsikter",
      description: "Branschdata och salary benchmarks"
    }
  ];

  const trustIndicators = [
    {
      value: counters.totalUsers + '+',
      label: 'nöjda användare'
    },
    {
      value: counters.todayLetters + '+',
      label: 'brev idag'
    },
    {
      value: '95%',
      label: 'nöjdhetsgrad'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="my-12 bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl border border-gray-200 shadow-lg p-8 not-prose"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-4"
        >
          <Sparkles className="w-4 h-4" />
          Komplett karriärverktyg
        </motion.div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Testa allt helt gratis
        </h3>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Allt du behöver för att accelerera din jobbsökning och bygga en framgångsrik karriär
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {allServices.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
            className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-pink-200 hover:shadow-sm transition-all duration-300"
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <service.icon className="w-4 h-4 text-pink-600" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {service.title}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          </motion.div>
        ))}
      </div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="flex items-center justify-center gap-8 mb-8 py-6 bg-gray-50/50 rounded-xl"
      >
        {trustIndicators.map((indicator, index) => (
          <div key={indicator.label} className="text-center">
            <div className="text-2xl font-bold text-pink-600 mb-1">
              {indicator.value}
            </div>
            <div className="text-sm text-gray-600">
              {indicator.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* CTA Section */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Users className="w-5 h-5" />
            Börja gratis nu
          </Link>
        </motion.div>

        <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Ingen kreditkort krävs • Gratis för alltid
        </p>

        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>
            <strong className="text-pink-600">{counters.activeUsers}</strong> personer testar just nu
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ComprehensiveServiceCard;