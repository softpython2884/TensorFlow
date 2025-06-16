// src/app/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isCheckingAuthSession } = useAuth(); // Use isCheckingAuthSession
  const router = useRouter();

  useEffect(() => {
    if (!isCheckingAuthSession) { // Wait for session check to complete
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isCheckingAuthSession, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="sr-only">Loading application...</p>
    </div>
  );
}
