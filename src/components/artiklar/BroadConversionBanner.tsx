'use client'

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Users, FileText, Search, BrainCircuit, ScanSearch } from 'lucide-react';
import { useGlobalCounters } from '@/contexts/GlobalCountersContext';

const BroadConversionBanner: React.FC = () => {
  const { counters } = useGlobalCounters();

  const services = [
    {
      icon: FileText,
      title: "CV-mallar",
      description: "Professionella mallar för alla branscher",
      href: "/cv-mallar"
    },
    {
      icon: ScanSearch,
      title: "CV-analys",
      description: "AI-driven feedback på ditt CV",
      href: "/analysera-cv"
    },
    {
      icon: Search,
      title: "Personliga brev",
      description: "Matchade brev för varje tjänst",
      href: "/skapa-brev"
    },
    {
      icon: BrainCircuit,
      title: "Jobbmatchning",
      description: "Hitta rätt jobb för dig",
      href: "/jobb"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="my-8 bg-gradient-to-br from-white to-gray-50/30 rounded-xl border border-gray-200 shadow-sm p-6 not-prose"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Allt du behöver för din karriär
        </h3>
        <p className="text-gray-600 text-sm">
          Upptäck alla våra AI-drivna verktyg för att accelerera din jobbsökning
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {services.map((service, index) => (
          <motion.div
            key={service.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link
              href={service.href}
              className="group block p-3 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all duration-300"
            >
              <service.icon className="w-6 h-6 text-pink-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
              <h4 className="font-medium text-gray-900 text-sm mb-1">
                {service.title}
              </h4>
              <p className="text-xs text-gray-600 leading-tight">
                {service.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Ingen kreditkort krävs</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-pink-500" />
            <span className="font-medium text-pink-600">
              {counters.totalUsers}+ jobbsökare denna vecka
            </span>
          </div>
        </div>

        <Link
          href="/register"
          className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:from-pink-500 hover:to-purple-500 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
        >
          Starta gratis
        </Link>
      </div>
    </motion.div>
  );
};

export default BroadConversionBanner;