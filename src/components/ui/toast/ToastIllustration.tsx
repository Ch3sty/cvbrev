'use client';

import {
  TOAST_ILLUSTRATIONS,
  resolveToastScenario,
  type ToastScenario,
} from './illustrations';

interface ToastIllustrationProps {
  scenario: string | ToastScenario | undefined;
  size?: number;
}

/**
 * Renderar ratt inline-SVG baserat pa scenario-key. Tar bade nya keys
 * ('jobs-found') och gamla maskot-sokvagar ('/images/maskot/success-jobs-found.svg')
 * for bakatkompabilitet under migration.
 */
export default function ToastIllustration({
  scenario,
  size = 64,
}: ToastIllustrationProps) {
  const key = resolveToastScenario(scenario);
  const Component = TOAST_ILLUSTRATIONS[key];

  return (
    <div
      className="flex-shrink-0 rounded-2xl flex items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        background: 'rgba(249, 115, 22, 0.08)',
      }}
    >
      <div style={{ width: size - 8, height: size - 8 }}>
        <Component width="100%" height="100%" />
      </div>
    </div>
  );
}
