'use client';

import { motion } from 'framer-motion';
import { Shield, Check, Mail } from 'lucide-react';

export default function AdminGrantedCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative bg-white rounded-3xl border border-blue-100 overflow-hidden"
      style={{ boxShadow: '0 4px 16px -8px rgba(59, 130, 246, 0.18)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #3B82F6, #6366F1)' }}
      />

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div
            className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              boxShadow: '0 6px 14px -4px rgba(59, 130, 246, 0.35)',
            }}
          >
            <Shield className="w-5 h-5" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Premium via Jobbcoach
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Din åtkomst är beviljad av en administratör.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 mb-4">
          <InfoRow text="Aktivt utan slutdatum" />
          <InfoRow text="Inget kort kopplat — ingen fakturering" />
          <InfoRow text="Alla premium-funktioner upplåsta" />
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2.25} />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-1">
                Frågor om din åtkomst? Hör av dig så hjälper vi dig.
              </p>
              <a
                href="mailto:support@jobbcoach.ai"
                className="text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-800 underline underline-offset-2"
              >
                support@jobbcoach.ai
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function InfoRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-700">
      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={3} />
      <span>{text}</span>
    </div>
  );
}
