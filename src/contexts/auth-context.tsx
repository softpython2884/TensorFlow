"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateUser } from '@/lib/auth.actions'; 

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
    // Tente de charger l'utilisateur depuis localStorage au démarrage
    try {
      const storedUser = localStorage.getItem('tensorflow-user');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Erreur lors de la lecture de l'utilisateur depuis localStorage", error);
      localStorage.removeItem('tensorflow-user');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const result = await authenticateUser(email, password); 
    
    if (result.user) {
      // Assure que le nom est correctement formaté et lastLogin est mis à jour
      const userToStore: User = {
        ...result.user,
        name: (result.user.firstName && result.user.lastName) 
              ? `${result.user.firstName} ${result.user.lastName}` 
              : result.user.name || result.user.email,
        lastLogin: new Date().toISOString() // Mettre à jour lastLogin ici aussi pour le contexte
      };
      
      setUser(userToStore);
      try {
        localStorage.setItem('tensorflow-user', JSON.stringify(userToStore));
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'utilisateur dans localStorage", error);
      }
      setLoading(false);
      router.push('/dashboard');
      return { success: true };
    } else {
      setUser(null);
      try {
        localStorage.removeItem('tensorflow-user');
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur de localStorage après échec de connexion", error);
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
      console.error("Erreur lors de la suppression de l'utilisateur de localStorage", error);
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
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}
