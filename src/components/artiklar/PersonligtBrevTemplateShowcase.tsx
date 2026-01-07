'use client'

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, FileText, Briefcase, GraduationCap, Heart, Building2 } from 'lucide-react';

const PersonligtBrevTemplateShowcase: React.FC = () => {
  const popularExamples = [
    {
      id: 'underskoterska',
      name: 'Undersköterska',
      description: 'Vård och omsorg',
      icon: Heart,
      badge: 'Populärast'
    },
    {
      id: 'larare',
      name: 'Lärare',
      description: 'Utbildning och pedagogik',
      icon: GraduationCap,
      badge: 'Rekommenderad'
    },
    {
      id: 'ekonomiassistent',
      name: 'Ekonomiassistent',
      description: 'Ekonomi och administration',
      icon: Building2,
      badge: 'Heta just nu'
    },
    {
      id: 'saljare',
      name: 'Säljare',
      description: 'Försäljning och kundkontakt',
      icon: Briefcase,
      badge: 'Trendigt'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="my-10 bg-gradient-to-br from-white to-blue-50/50 rounded-xl border border-gray-200 shadow-sm p-6 not-prose"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Populära personligt brev-exempel
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            Se hur andra har skrivit sitt personliga brev – välj mall och typsnitt
          </p>
        </div>
        <TrendingUp className="w-6 h-6 text-blue-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {popularExamples.map((example, index) => {
          const IconComponent = example.icon;
          return (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative"
            >
              <Link
                href={`/personligt-brev-exempel/${example.id}`}
                className="block bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                    {example.badge}
                  </span>
                </div>

                {/* Icon Preview */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-50 to-white overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                      <IconComponent className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>

                  {/* Decorative lines representing text */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Example info */}
                <div className="p-3">
                  <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                    {example.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {example.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-medium">6</span> brevmallar × <span className="font-medium">11</span> typsnitt att välja mellan
        </p>

        <Link
          href="/personligt-brev-exempel"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group"
        >
          Visa alla exempel
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </motion.div>
  );
};

export default PersonligtBrevTemplateShowcase;
