import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, authHelpers } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateUser: (updates: any) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await authHelpers.signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign-in error:', error.message);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      const { error } = await authHelpers.signInWithGithub();
      if (error) throw error;
    } catch (error: any) {
      console.error('GitHub sign-in error:', error.message);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await authHelpers.signInWithEmail(email, password);
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await authHelpers.signUpWithEmail(email, password);
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await authHelpers.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authHelpers.resetPassword(email);
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateUser = async (updates: any) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  // Alias for signOut to maintain compatibility
  const logout = signOut;

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    logout,
    resetPassword,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
