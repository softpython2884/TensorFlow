"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { MainHeader } from '@/components/main-header';
import { MainSidebar } from '@/components/main-sidebar';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";


export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="sr-only">Loading user session...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <MainSidebar />
      <SidebarRail />
      <SidebarInset>
          <MainHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-secondary/30 dark:bg-background">
            {children}
          </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
