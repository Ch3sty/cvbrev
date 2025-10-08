import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import IconLogicLanding from './components/IconLogicLanding';

export const metadata: Metadata = {
  title: 'Icon Logic Test | Jobbcoach.ai',
  description: 'Testa din logiska förmåga med minimalistiska ikonmönster'
};

export default async function IconLogicPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's previous attempts
  const { data: attempts } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('user_id', user.id)
    .eq('test_type', 'icon-logic')
    .order('completed_at', { ascending: false })
    .limit(5);

  const bestScore = attempts && attempts.length > 0
    ? Math.max(...attempts.map(a => a.score_raw))
    : null;

  return <IconLogicLanding bestScore={bestScore} attempts={attempts || []} />;
}
