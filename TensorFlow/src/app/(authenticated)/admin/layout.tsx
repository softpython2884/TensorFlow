
"use client";
// This layout is now effectively handled by the MainSidebar within the root (authenticated) layout.
// The MainSidebar will show admin-specific links if the user is an admin.
// This file can be simplified or its logic merged if specific admin layout elements are needed beyond sidebar links.

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isCheckingAuthSession, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isCheckingAuthSession) {
      if (!isAuthenticated) {
        router.replace('/login?redirect=/admin'); // Redirect to login if not authenticated
      } else if (user && user.role !== 'Owner' && user.role !== 'ADMIN') {
        router.replace('/dashboard?error=forbidden_admin_layout'); // Redirect if not admin/owner
      }
    }
  }, [isAuthenticated, isCheckingAuthSession, user, router]);

  if (isCheckingAuthSession || !isAuthenticated || (user && user.role !== 'Owner' && user.role !== 'ADMIN')) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">{isCheckingAuthSession ? "Verifying access..." : "Access Denied or Loading..."}</p>
      </div>
    );
  }

  // The MainSidebar in the parent layout already provides navigation.
  // This layout can be used for admin-specific wrappers or context if needed.
  return <div className="w-full">{children}</div>;
}
