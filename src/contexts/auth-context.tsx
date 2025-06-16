// src/contexts/auth-context.tsx
"use client";

import type { User, LoginInput } from '@/lib/types'; // LoginInput from types now
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  isCheckingAuthSession: boolean; // New state for initial session check
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // For login/logout operations
  const [isCheckingAuthSession, setIsCheckingAuthSession] = useState(true); // True on initial load
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check session on initial load
    const checkUserSession = async () => {
      setIsCheckingAuthSession(true);
      try {
        const res = await fetch('/api/auth/me'); // BFF endpoint
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        setUser(null);
      } finally {
        setIsCheckingAuthSession(false);
      }
    };
    checkUserSession();
  }, []);

  const login = async (credentials: LoginInput): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { // BFF endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        const userToStore: User = {
            ...data.user,
            name: (data.user.firstName && data.user.lastName) 
                  ? `${data.user.firstName} ${data.user.lastName}` 
                  : data.user.name || data.user.email,
            // lastLogin is now handled by the Pod API upon successful login
        };
        setUser(userToStore);
        setLoading(false);
        router.push('/dashboard');
        return { success: true };
      } else {
        setUser(null);
        setLoading(false);
        toast({
            title: "Login Failed",
            description: data.error || "An unknown error occurred.",
            variant: "destructive",
        });
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login API call failed:", error);
      setUser(null);
      setLoading(false);
      toast({
        title: "Login Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
      return { success: false, error: "Network error or server unavailable" };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // BFF endpoint
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Still proceed with client-side logout
    } finally {
      setUser(null);
      setLoading(false);
      router.push('/login');
    }
  };
  
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated, isCheckingAuthSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
