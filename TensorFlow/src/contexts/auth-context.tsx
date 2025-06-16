
"use client";

import type { User, LoginInput } from '@/lib/types';
import type { UserRegistrationInput } from '@/lib/schemas';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (userData: UserRegistrationInput) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>; // To manually refetch user data
  loading: boolean; // For login/register/logout operations
  isAuthenticated: boolean;
  isCheckingAuthSession: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingAuthSession, setIsCheckingAuthSession] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchUser = useCallback(async (isInitialCheck = false) => {
    if (isInitialCheck) {
      setIsCheckingAuthSession(true);
    }
    try {
      const res = await fetch('/api/auth/me'); 
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        if (res.status === 401 && !isInitialCheck && !['/login', '/register', '/setup-initial-admin'].some(p => pathname.startsWith(p))) {
          // If session becomes invalid during app use, redirect to login
          router.push('/login');
        }
      }
    } catch (error) {
      console.error("Error checking user session:", error);
      setUser(null);
    } finally {
      if (isInitialCheck) {
        setIsCheckingAuthSession(false);
      }
    }
  }, [router, pathname]); // Added pathname to deps

  useEffect(() => {
    fetchUser(true); // Initial session check
  }, [fetchUser]);

  const login = async (credentials: LoginInput): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setLoading(false);
        toast({ title: "Login Successful", description: `Welcome back, ${data.user.name || data.user.username}!`});
        
        const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
        router.push(redirectPath);
        return { success: true };
      } else {
        setUser(null);
        setLoading(false);
        toast({ title: "Login Failed", description: data.error || "Invalid credentials", variant: "destructive" });
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      setUser(null);
      setLoading(false);
      toast({ title: "Login Error", description: "Could not connect to the server.", variant: "destructive" });
      return { success: false, error: "Network error or server unavailable" };
    }
  };

  const register = async (userData: UserRegistrationInput): Promise<{ success: boolean; error?: string; user?: User }> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', { // BFF endpoint for registration
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user); // Auto-login after registration
        setLoading(false);
        toast({ title: "Registration Successful", description: `Welcome, ${data.user.name || data.user.username}! You are now logged in.` });
        router.push('/dashboard');
        return { success: true, user: data.user };
      } else {
        setLoading(false);
        toast({ title: "Registration Failed", description: data.error || "Could not register user.", variant: "destructive" });
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      setLoading(false);
      toast({ title: "Registration Error", description: "An unexpected error occurred.", variant: "destructive" });
      return { success: false, error: "Network error or server unavailable" };
    }
  };


  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setUser(null);
      setLoading(false);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    }
  };
  
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, fetchUser, loading, isAuthenticated, isCheckingAuthSession }}>
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
