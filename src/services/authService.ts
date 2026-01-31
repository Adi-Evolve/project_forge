import { supabase } from '../lib/supabase';
import { Provider } from '@supabase/supabase-js';

export interface OAuthProvider {
  name: string;
  provider: Provider;
  icon: string;
  color: string;
  textColor: string;
}

export const oauthProviders: OAuthProvider[] = [
  {
    name: 'Google',
    provider: 'google',
    icon: '🔍',
    color: 'bg-white border border-gray-300',
    textColor: 'text-gray-700'
  },
  {
    name: 'GitHub',
    provider: 'github',
    icon: '⚡',
    color: 'bg-gray-900',
    textColor: 'text-white'
  }
];

export class AuthService {
  
  /**
   * Sign in with OAuth provider
   */
  static async signInWithOAuth(provider: Provider, redirectTo?: string) {
    try {
      console.log('\\n🚀 ===== OAUTH SIGN IN STARTED =====');
      console.log('🔗 Provider:', provider);
      console.log('🎯 Redirect URL:', redirectTo || `${window.location.origin}/auth/callback`);
      console.log('🌐 Current origin:', window.location.origin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      console.log('📊 OAuth response:', { 
        hasData: !!data, 
        hasError: !!error,
        errorMessage: error?.message 
      });

      if (error) {
        console.error('❌ OAuth sign in error:', error);
        throw error;
      }

      console.log('✅ OAuth initiated successfully');
      console.log('=====================================\\n');
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ OAuth sign in failed:', error);
      return { data: null, error };
    }
  }

  /**
   * Get current session
   */
  static async getCurrentSession() {
    try {
      console.log('🔄 AuthService: Getting current session from Supabase...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ AuthService: Get session error:', error);
        return { session: null, error };
      }

      if (session) {
        console.log('✅ AuthService: Session found for user:', session.user?.email);
      } else {
        console.log('ℹ️ AuthService: No active session found');
      }

      return { session, error: null };
    } catch (error: any) {
      console.error('❌ AuthService: Get session failed:', error);
      return { session: null, error };
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Get user error:', error);
        return { user: null, error };
      }

      return { user, error: null };
    } catch (error: any) {
      console.error('Get user failed:', error);
      return { user: null, error };
    }
  }

  /**
   * Sign out
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign out failed:', error);
      return { error };
    }
  }

  /**
   * Refresh session
   */
  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Refresh session error:', error);
        return { session: null, user: null, error };
      }

      return { session: data.session, user: data.user, error: null };
    } catch (error: any) {
      console.error('Refresh session failed:', error);
      return { session: null, user: null, error };
    }
  }

  /**
   * Create or update user profile
   */
  static async createOrUpdateUserProfile(authUser: any) {
    try {
      const userMetadata = authUser.user_metadata || {};
      const userProfile = {
        id: authUser.id,
        email: authUser.email,
        full_name: userMetadata.full_name || userMetadata.name || '',
        username: userMetadata.preferred_username || userMetadata.user_name || userMetadata.login || '',
        avatar_url: userMetadata.avatar_url || userMetadata.picture || '',
        provider: authUser.app_metadata?.provider || 'email',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', fetchError);
        throw fetchError;
      }

      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update({
            email: userProfile.email,
            full_name: userProfile.full_name,
            username: userProfile.username,
            avatar_url: userProfile.avatar_url,
            updated_at: userProfile.updated_at
          })
          .eq('id', authUser.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user profile:', error);
          throw error;
        }

        return { user: data, error: null };
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('users')
          .insert([userProfile])
          .select()
          .single();

        if (error) {
          console.error('Error creating user profile:', error);
          throw error;
        }

        return { user: data, error: null };
      }
    } catch (error: any) {
      console.error('Create/update user profile failed:', error);
      return { user: null, error };
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export default AuthService;