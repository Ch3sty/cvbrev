'use client';

import * as React from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [onOpenChange]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleOpenChange]);

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

/** Maste matcha langden pa dialogOut/backdropOut nedan. */
const EXIT_MS = 180;

export function DialogContent({ className, children }: DialogContentProps) {
  const { open, onOpenChange } = useDialog();

  // Dialogen maste ligga kvar i DOM:en medan ut-animationen kor, annars finns
  // inget att animera. `leaving` valjer keyframe och en timer pa exakt samma
  // langd avmonterar efterat, sa ingen dialog kan fastna pa skarmen.
  const [mounted, setMounted] = useState(open);
  const [leaving, setLeaving] = useState(false);
  const mountedRef = React.useRef(open);

  useEffect(() => {
    if (open) {
      mountedRef.current = true;
      setLeaving(false);
      setMounted(true);
      return;
    }
    // Ingen ut-animation behovs om den aldrig var monterad.
    if (!mountedRef.current) return;
    setLeaving(true);
    const timer = setTimeout(() => {
      mountedRef.current = false;
      setMounted(false);
      setLeaving(false);
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (prefers-reduced-motion: no-preference) {
          .dialog-backdrop-enter { animation: dialogBackdropIn 200ms ease-out both; }
          .dialog-backdrop-leave { animation: dialogBackdropOut ${EXIT_MS}ms ease-in both; }
          .dialog-panel-enter { animation: dialogIn 220ms cubic-bezier(0.22, 1, 0.36, 1) both; }
          .dialog-panel-leave { animation: dialogOut ${EXIT_MS}ms ease-in both; }
          @keyframes dialogBackdropIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes dialogBackdropOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes dialogIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes dialogOut {
            from { opacity: 1; transform: translateY(0) scale(1); }
            to { opacity: 0; transform: translateY(20px) scale(0.95); }
          }
        }
      `,
        }}
      />

      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/20 backdrop-blur-sm',
          leaving ? 'dialog-backdrop-leave' : 'dialog-backdrop-enter'
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            'pointer-events-auto relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/80',
            'max-h-[90vh] overflow-hidden flex flex-col',
            leaving ? 'dialog-panel-leave' : 'dialog-panel-enter',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogHeader({ className, children }: DialogHeaderProps) {
  const { onOpenChange } = useDialog();

  return (
    <div className={cn("flex items-start justify-between p-6 pb-4", className)}>
      <div className="flex-1">{children}</div>
      <button
        onClick={() => onOpenChange(false)}
        className="ml-4 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-colors duration-200"
        aria-label="Stäng"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogTitle({ className, children }: DialogTitleProps) {
  return (
    <h2 className={cn("text-xl font-semibold leading-none tracking-tight text-gray-900", className)}>
      {children}
    </h2>
  );
}

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogDescription({ className, children }: DialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-600 mt-2", className)}>
      {children}
    </p>
  );
}

interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <div className={cn("flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-200", className)}>
      {children}
    </div>
  );
}
