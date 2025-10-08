import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { IconLogicTest } from './IconLogicTest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const metadata: Metadata = {
  title: 'Icon Logic Test | Jobbcoach.ai',
  description: 'Genomför Icon Logic testet'
};

export default async function IconLogicTestPage({
  params
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { sessionId } = await params;

  // Verify session token
  let decoded: any;
  try {
    decoded = jwt.verify(sessionId, JWT_SECRET);
  } catch (error) {
    redirect('/dashboard/tester/icon-logic?error=invalid-session');
  }

  if (decoded.userId !== user.id) {
    redirect('/dashboard/tester/icon-logic?error=unauthorized');
  }

  // Reconstruct session from token
  // In a real app, you might want to store this in Redis or similar
  // For now, we'll start a new session
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/icon-logic/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `sb-access-token=${(await supabase.auth.getSession()).data.session?.access_token}`
    }
  });

  if (!response.ok) {
    redirect('/dashboard/tester/icon-logic?error=session-error');
  }

  const session = await response.json();

  return <IconLogicTest session={session} />;
}
