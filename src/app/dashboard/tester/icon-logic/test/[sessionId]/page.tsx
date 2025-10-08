'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { IconLogicTest } from './IconLogicTest';
import type { IconLogicTestSession } from '@/lib/tester/iconLogicTypes';

export default function IconLogicTestPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<IconLogicTestSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch('/api/icon-logic/validate-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken: sessionId })
        });

        if (!response.ok) {
          throw new Error('Ogiltig session');
        }

        const sessionData = await response.json();
        setSession(sessionData);
      } catch (err) {
        setError('Kunde inte ladda testet. Vänligen starta om.');
        setTimeout(() => {
          router.push('/dashboard/tester/icon-logic?error=session-error');
        }, 2000);
      }
    }

    loadSession();
  }, [sessionId, router]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Ett fel uppstod</h2>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-2">Omdirigerar...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Laddar testet...</p>
      </div>
    );
  }

  return <IconLogicTest session={session} />;
}
