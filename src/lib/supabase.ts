import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with proper OAuth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// OAuth configuration
export const OAuthConfig = {
  redirectTo: `${window.location.origin}/auth/callback`,
  providers: {
    google: {
      scopes: 'email profile'
    },
    github: {
      scopes: 'user:email'
    }
  }
}

// Helper functions for authentication
export const authHelpers = {
  signInWithGoogle: () => 
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: OAuthConfig.redirectTo,
        scopes: OAuthConfig.providers.google.scopes
      }
    }),

  signInWithGithub: () => 
    supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: OAuthConfig.redirectTo,
        scopes: OAuthConfig.providers.github.scopes
      }
    }),

  signInWithEmail: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signUpWithEmail: (email: string, password: string) =>
    supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    }),

  signOut: () => supabase.auth.signOut(),

  resetPassword: (email: string) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
}