'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Save } from 'lucide-react';

interface SaveBarProps {
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

/**
 * Spara-knapp. Desktop: inline i flow, sticky bottom på mobil ovanför nav.
 * Visas alltid men disabled när inga ändringar finns.
 */
export default function SaveBar({ hasChanges, isSaving, onSave }: SaveBarProps) {
  return (
    <>
      {/* Desktop / inline */}
      <div className="hidden sm:flex items-center justify-end gap-3 pt-2">
        {hasChanges && !isSaving && (
          <span className="text-sm text-orange-700 font-semibold inline-flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
              }}
            />
            Du har osparade ändringar
          </span>
        )}
        <SaveButton hasChanges={hasChanges} isSaving={isSaving} onSave={onSave} />
      </div>

      {/* Mobil — fixed botten ovanför nav. Visas bara när det finns ändringar. */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="sm:hidden fixed left-0 right-0 z-30 px-3"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
            }}
          >
            <div
              className="rounded-2xl bg-white p-2.5 flex items-center gap-3"
              style={{
                border: '1px solid rgba(249, 115, 22, 0.22)',
                boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.18)',
              }}
            >
              <span className="flex-1 text-xs font-semibold text-orange-700 inline-flex items-center gap-1.5 pl-2">
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  }}
                />
                Osparade ändringar
              </span>
              <SaveButton
                hasChanges={hasChanges}
                isSaving={isSaving}
                onSave={onSave}
                compact
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SaveButton({
  hasChanges,
  isSaving,
  onSave,
  compact = false,
}: {
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  compact?: boolean;
}) {
  const disabled = !hasChanges || isSaving;
  return (
    <motion.button
      type="button"
      onClick={onSave}
      disabled={disabled}
      whileHover={!disabled ? { y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold text-white transition-all min-h-[44px] disabled:cursor-not-allowed ${
        compact ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-sm'
      }`}
      style={{
        background: disabled
          ? '#E2E8F0'
          : 'linear-gradient(135deg, #F97316, #DC2626)',
        boxShadow: disabled
          ? 'none'
          : '0 8px 20px -6px rgba(220, 38, 38, 0.45)',
        color: disabled ? '#94A3B8' : 'white',
      }}
    >
      {isSaving ? (
        <>
          <motion.span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
          Sparar
        </>
      ) : hasChanges ? (
        <>
          <Save className="w-4 h-4" strokeWidth={2.5} />
          Spara ändringar
        </>
      ) : (
        <>
          <Check className="w-4 h-4" strokeWidth={2.5} />
          Allt är sparat
        </>
      )}
    </motion.button>
  );
}
