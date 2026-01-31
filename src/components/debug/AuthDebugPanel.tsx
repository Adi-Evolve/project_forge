import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const AuthDebugPanel: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<any>({});

  useEffect(() => {
    const checkSupabaseSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSupabaseSession(session);
    };
    
    const checkLocalStorage = () => {
      setLocalStorageData({
        user: localStorage.getItem('projectforge_user'),
        session: localStorage.getItem('projectforge_session'),
        supabaseSession: localStorage.getItem('supabase_session'),
        lastLogin: localStorage.getItem('auth_last_login')
      });
    };
    
    checkSupabaseSession();
    checkLocalStorage();
    
    // Update every 2 seconds
    const interval = setInterval(() => {
      checkSupabaseSession();
      checkLocalStorage();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  if (window.location.pathname !== '/auth/callback') {
    return null; // Only show on callback page
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg max-w-md text-xs font-mono z-50 max-h-96 overflow-auto">
      <h3 className="font-bold mb-2 text-yellow-400">🔍 AUTH DEBUG PANEL</h3>
      
      <div className="mb-2">
        <div className="text-green-400">AuthContext State:</div>
        <div>• isAuthenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>• isLoading: {isLoading ? '⏳' : '✅'}</div>
        <div>• hasUser: {user ? '✅' : '❌'}</div>
        <div>• userEmail: {user?.email || 'none'}</div>
        <div>• userId: {user?.id || 'none'}</div>
      </div>
      
      <div className="mb-2">
        <div className="text-blue-400">Supabase Session:</div>
        <div>• hasSession: {supabaseSession ? '✅' : '❌'}</div>
        <div>• userEmail: {supabaseSession?.user?.email || 'none'}</div>
        <div>• provider: {supabaseSession?.user?.app_metadata?.provider || 'none'}</div>
      </div>
      
      <div className="mb-2">
        <div className="text-purple-400">LocalStorage:</div>
        <div>• user: {localStorageData.user ? '✅' : '❌'}</div>
        <div>• session: {localStorageData.session ? '✅' : '❌'}</div>
        <div>• supabaseSession: {localStorageData.supabaseSession ? '✅' : '❌'}</div>
      </div>
      
      <div className="text-orange-400">
        Current URL: {window.location.pathname}
      </div>
    </div>
  );
};

export default AuthDebugPanel;