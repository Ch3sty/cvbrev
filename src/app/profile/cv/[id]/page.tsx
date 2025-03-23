'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function CVEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unwrap params med React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  // Vi omdirigerar till den nya edit-sidan
  useEffect(() => {
    router.push(`/profile/cv/${id}/edit`);
  }, [id, router]);
  
  return (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
    </div>
  );
}