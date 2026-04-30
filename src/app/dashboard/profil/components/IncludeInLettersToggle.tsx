'use client';

import { motion } from 'framer-motion';

interface IncludeInLettersToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

/**
 * Custom toggle/switch i orange/röd DNA. Off: ljusgrå med orange-ring
 * vid focus. On: orange/röd gradient-fyllning med vit knopp.
 */
export default function IncludeInLettersToggle({
  checked,
  onChange,
  label,
  description,
}: IncludeInLettersToggleProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 mt-0.5"
        style={{
          background: checked
            ? 'linear-gradient(135deg, #F97316, #DC2626)'
            : '#E2E8F0',
          boxShadow: checked
            ? '0 4px 10px -2px rgba(220, 38, 38, 0.4)'
            : 'inset 0 1px 2px rgba(15, 23, 42, 0.06)',
        }}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900 leading-tight">
          {label}
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
