'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Star, Award, CheckCircle2, TrendingUp } from 'lucide-react';

export default function TrustSignals() {
  const signals = [
    {
      icon: Shield,
      text: 'Verifierad av HR-experter',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Users,
      text: '15,000+ jobbsökande',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Star,
      text: '4.8/5 användarrecensioner',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: TrendingUp,
      text: 'Uppdaterad 2025',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm my-8"
    >
      {/* Huvudrubrik */}
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-pink-600" />
        <h3 className="font-semibold text-gray-900">Varför välja jobbcoach.ai?</h3>
      </div>

      {/* Trust signals grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {signals.map((signal, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
            className={`flex flex-col items-center text-center p-3 rounded-lg ${signal.bgColor} border border-gray-100`}
          >
            <signal.icon className={`w-6 h-6 ${signal.color} mb-2`} />
            <span className="text-xs font-medium text-gray-700">
              {signal.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Kvalitetsgaranti */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">
            Alla artiklar är <span className="font-semibold text-gray-900">kvalitetssäkrade</span> och följer
            <span className="font-semibold text-pink-600"> Sveriges ledande standarder</span> för karriärrådgivning
          </span>
        </div>
      </div>

      {/* AI-powered badge */}
      <div className="mt-3 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          AI-driven karriärcoaching sedan 2023
        </div>
      </div>
    </motion.div>
  );
}