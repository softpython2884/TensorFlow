
"use client";
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout can be used for styling or context specific to auth pages
  return (
    <div>
      {children}
    </div>
  );
}
