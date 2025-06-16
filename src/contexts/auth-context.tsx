"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateUser } from '@/lib/auth.actions'; // Import the Server Action

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('tensorflow-user');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('tensorflow-user');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const result = await authenticateUser(email, password); // Call the Server Action
    
    if (result.user) {
      const userWithLastLogin = { ...result.user, lastLogin: new Date().toISOString() };
      setUser(userWithLastLogin);
      try {
        localStorage.setItem('tensorflow-user', JSON.stringify(userWithLastLogin));
      } catch (error) {
        console.error("Failed to save user to localStorage", error);
      }
      setLoading(false);
      router.push('/dashboard');
      return { success: true };
    } else {
      setUser(null);
      try {
        localStorage.removeItem('tensorflow-user');
      } catch (error) {
        console.error("Failed to remove user from localStorage during failed login", error);
      }
      setLoading(false);
      return { success: false, error: result.error };
    }
  };

  const logout = () => {
    setLoading(true);
    setUser(null);
    try {
      localStorage.removeItem('tensorflow-user');
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
    setLoading(false);
    router.push('/login');
  };
  
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>
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
