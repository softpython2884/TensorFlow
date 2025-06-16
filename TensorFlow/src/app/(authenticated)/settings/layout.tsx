
"use client";
// This layout is now effectively handled by the MainSidebar within the root (authenticated) layout.
// The MainSidebar will link to /settings (which can redirect to /settings/profile).
// This file can be simplified if no specific layout elements beyond sidebar links are needed for /settings routes.

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header'; // Keep if you want a consistent header for all settings pages
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isCheckingAuthSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isCheckingAuthSession && !isAuthenticated) {
      router.replace('/login?redirect=/settings/profile'); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, isCheckingAuthSession, router]);

  if (isCheckingAuthSession || !isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">{isCheckingAuthSession ? "Loading settings..." : "Redirecting to login..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 
        The PageHeader could be defined here for all /settings/* routes,
        or each settings page can define its own using the PageHeader component.
        For now, individual pages will define their own PageHeader for flexibility.
      */}
      {/* Example of a shared header for settings pages:
      <PageHeader
        title="Account Settings"
        description="Manage your personal and account-wide preferences."
        icon={SettingsIcon}
      /> 
      */}
      {children}
    </div>
  );
}
