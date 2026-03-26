'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QuickInviteFormProps {
  onSubmit: (email: string) => Promise<void>;
  remainingQuota: number;
  totalQuota: number;
  resetAt?: string | null;
}

export default function QuickInviteForm({
  onSubmit,
  remainingQuota,
  totalQuota,
  resetAt
}: QuickInviteFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Ange en giltig e-postadress');
      return;
    }

    if (remainingQuota <= 0) {
      setError('Du har inga inbjudningar kvar denna vecka');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(email);
      setEmail('');
    } catch (err) {
      setError('Något gick fel. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const baseUrl = window.location.origin;
      const demoLink = `${baseUrl}/invite/DEMO-CODE`; // You'll need to generate actual invite link
      await navigator.clipboard.writeText(demoLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const quotaPercentage = (remainingQuota / totalQuota) * 100;

  const getDaysUntilReset = () => {
    if (!resetAt) return null;
    const now = new Date();
    const reset = new Date(resetAt);
    const diffMs = reset.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilReset = getDaysUntilReset();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 flex items-center">
          <Mail className="w-6 h-6 mr-2 text-purple-600" />
          Skicka inbjudan
        </h3>
        <p className="text-sm text-slate-600">
          Det tar 10 sekunder. Vi skickar ett mejl, inget mer.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="exempel@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 sm:h-14 text-base"
            disabled={isLoading || remainingQuota <= 0}
          />
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={isLoading || remainingQuota <= 0}
            className="flex-1 h-12 sm:h-14 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Skickar...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Skicka inbjudan
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className="h-12 sm:h-14 text-base border-2"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2 text-green-600" />
                Kopierad!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                Kopiera länk
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Quota indicator */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            {remainingQuota} av {totalQuota} inbjudningar kvar
          </span>
          {daysUntilReset !== null && (
            <span className="text-xs text-slate-500">
              Reset om {daysUntilReset} {daysUntilReset === 1 ? 'dag' : 'dagar'}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${quotaPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {remainingQuota === 0 && (
          <p className="text-sm text-orange-600 mt-2">
            Du har använt alla dina inbjudningar denna vecka. {daysUntilReset && `Fler blir tillgängliga om ${daysUntilReset} ${daysUntilReset === 1 ? 'dag' : 'dagar'}.`}
          </p>
        )}
      </div>

      {/* Reassurance */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-start space-x-2 text-xs text-slate-600">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>✓ Ingen spam – vi skickar ett mejl, punkt</p>
            <p>✓ 0 kr under provperioden</p>
            <p>✓ Dina vänner ser ett proffsigt erbjudande från oss</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
