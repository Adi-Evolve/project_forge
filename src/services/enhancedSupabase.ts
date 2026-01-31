import { supabase } from '../lib/supabase';

export interface UserData {
  id?: string;
  wallet_address?: string;
  email?: string;
  full_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  is_verified?: boolean;
  reputation_score?: number;
  skills?: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  created_at?: string;
  updated_at?: string;
}

class EnhancedSupabaseService {
  async createUser(userData: UserData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Unexpected error creating user:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserByWallet(walletAddress: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user by wallet:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || null };
    } catch (error: any) {
      console.error('Unexpected error fetching user by wallet:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserById(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user by ID:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || null };
    } catch (error: any) {
      console.error('Unexpected error fetching user by ID:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUser(userId: string, updates: Partial<UserData>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Unexpected error updating user:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected error deleting user:', error);
      return { success: false, error: error.message };
    }
  }

  // Project-related methods
  async createProject(projectData: any) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Unexpected error creating project:', error);
      return { success: false, error: error.message };
    }
  }

  async getProjectsByUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user projects:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Unexpected error fetching user projects:', error);
      return { success: false, error: error.message };
    }
  }

  // Generic database operations
  async query(table: string, options: any = {}) {
    try {
      let query = supabase.from(table).select(options.select || '*');

      if (options.eq) {
        for (const [column, value] of Object.entries(options.eq)) {
          query = query.eq(column, value);
        }
      }

      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error querying ${table}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error(`Unexpected error querying ${table}:`, error);
      return { success: false, error: error.message };
    }
  }
}

export const enhancedSupabaseService = new EnhancedSupabaseService();
export default EnhancedSupabaseService;