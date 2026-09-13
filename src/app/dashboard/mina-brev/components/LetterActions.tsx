'use client';

/**
 * Mer-menyn för ett brev, delad mellan rutnätskortet och listraden.
 * Popover på desktop (svävande, får skugga), Sheet på mobil. Raderna är
 * text, inte ikoner. Ta bort i fel-färg, aldrig som fylld knapp.
 */

import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { MoreHorizontal } from 'lucide-react';
import Sheet from '@/components/shell/Sheet';

export interface LetterActionsProps {
  letterId: string;
  /** Tillgängligt namn på brevet, för knappens etikett. */
  letterName: string;
  isLocked: boolean;
  isDeleting: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  /** Öppnar brevet, där nedladdningen bor (formaten kan gå i betalvägg). */
  onDownload: (id: string) => void;
  onMarkApplied?: (id: string) => void;
  /** 'panel' ligger ovanpå miniatyren och får ram, 'plain' står i en rad. */
  variant?: 'panel' | 'plain';
}

interface Item {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'fel';
  mobileOnly?: boolean;
}

export default function LetterActions({
  letterId,
  letterName,
  isLocked,
  isDeleting,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onMarkApplied,
  variant = 'panel',
}: LetterActionsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const close = () => {
    setSheetOpen(false);
    setPopoverOpen(false);
  };

  const items: Item[] = [
    { label: 'Visa brev', onClick: () => onView(letterId), mobileOnly: true },
    { label: 'Redigera', onClick: () => onEdit(letterId), disabled: isLocked },
    { label: 'Ladda ner', onClick: () => onDownload(letterId) },
    ...(onMarkApplied
      ? [{ label: 'Markera som sökt', onClick: () => onMarkApplied(letterId) }]
      : []),
    {
      label: isDeleting ? 'Tar bort' : 'Ta bort',
      onClick: () => onDelete(letterId),
      disabled: isDeleting,
      tone: 'fel' as const,
    },
  ];

  const trigger =
    variant === 'panel'
      ? 'inline-flex h-11 w-11 items-center justify-center rounded-lg border border-kant bg-panel text-ink-2 transition-[border-color] duration-[120ms] hover:border-kant-stark hover:text-ink-1'
      : 'inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-insunken hover:text-ink-1';

  const run = (item: Item) => {
    close();
    item.onClick();
  };

  return (
    <>
      {/* Desktop: popover */}
      <div className="hidden lg:block">
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className={trigger}
              aria-label={`Fler alternativ för ${letterName}`}
            >
              <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-[200px] rounded-xl border border-kant bg-panel py-1.5 shadow-svav"
            >
              {items
                .filter((item) => !item.mobileOnly)
                .map((item, i) => (
                  <div key={item.label}>
                    {item.tone === 'fel' && i > 0 ? (
                      <div className="my-1 h-px bg-kant" aria-hidden="true" />
                    ) : null}
                    <button
                      type="button"
                      disabled={item.disabled}
                      onClick={() => run(item)}
                      className={`flex min-h-11 w-full items-center px-3 text-left text-sm transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${
                        item.tone === 'fel' ? 'text-fel' : 'text-ink-1'
                      }`}
                    >
                      {item.label}
                    </button>
                  </div>
                ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Mobil: bottenark */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setSheetOpen(true);
        }}
        className={`${trigger} lg:hidden`}
        aria-label={`Fler alternativ för ${letterName}`}
      >
        <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={letterName} bare>
        <ul>
          {items.map((item) => (
            <li key={item.label} className="border-b border-kant last:border-b-0">
              <button
                type="button"
                disabled={item.disabled}
                onClick={() => run(item)}
                className={`flex h-14 w-full items-center px-4 text-left text-sm font-medium transition-colors active:bg-insunken disabled:cursor-not-allowed disabled:opacity-40 ${
                  item.tone === 'fel' ? 'text-fel' : 'text-ink-1'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}
