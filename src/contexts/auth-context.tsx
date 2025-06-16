"use client";

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - in a real app, this would come from an API
const MOCK_USERS: Record<string, User> = {
  "owner@example.com": { id: '1', name: 'Taylor Flow', email: 'owner@example.com', role: 'Owner', avatarUrl: 'https://placehold.co/100x100.png' },
  "manager@example.com": { id: '2', name: 'Morgan Projector', email: 'manager@example.com', role: 'Project Manager', avatarUrl: 'https://placehold.co/100x100.png' },
  "dev@example.com": { id: '3', name: 'Casey Coder', email: 'dev@example.com', role: 'Developer', avatarUrl: 'https://placehold.co/100x100.png' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Try to load user from localStorage (simulate session persistence)
    try {
      const storedUser = localStorage.getItem('tensorflow-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('tensorflow-user');
    }
    setLoading(false);
  }, []);

  const login = (email: string, role?: UserRole) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const foundUser = MOCK_USERS[email] || { 
        id: 'temp-user', 
        name: email.split('@')[0], 
        email, 
        role: role || 'Viewer', 
        avatarUrl: 'https://placehold.co/100x100.png' 
      };
      
      setUser(foundUser);
      try {
        localStorage.setItem('tensorflow-user', JSON.stringify(foundUser));
      } catch (error) {
        console.error("Failed to save user to localStorage", error);
      }
      setLoading(false);
      router.push('/dashboard');
    }, 500);
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
