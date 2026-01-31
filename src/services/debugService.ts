// Debug service to test Supabase connectivity and user operations
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export class DebugService {
  
  // Test basic Supabase connectivity
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Supabase connection...');
      const { data, error } = await supabase.from('projects').select('count').limit(1);
      
      if (error) {
        console.error('❌ Supabase connection failed:', error);
        return false;
      }
      
      console.log('✅ Supabase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }
  }

  // Get current authenticated user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Failed to get current user:', error);
        return null;
      }
      
      console.log('👤 Current authenticated user:', {
        id: user?.id,
        email: user?.email,
        role: user?.role
      });
      
      return user;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  // Check if user exists in users table
  static async checkUserInDatabase(userId: string) {
    try {
      console.log('🔍 Checking if user exists in database:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('❌ User not found in database:', error);
        return null;
      }
      
      console.log('✅ User found in database:', data);
      return data;
    } catch (error) {
      console.error('❌ Error checking user in database:', error);
      return null;
    }
  }

  // Create user in users table if not exists
  static async ensureUserInDatabase(user: any) {
    try {
      console.log('🔍 Ensuring user exists in database...');
      
      // Check if user already exists
      const existingUser = await this.checkUserInDatabase(user.id);
      if (existingUser) {
        console.log('✅ User already exists in database');
        return existingUser;
      }
      
      // Create user in database
      const userData = {
        id: user.id,
        email: user.email,
        username: user.email?.split('@')[0] || 'user',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || '',
        email_verified: user.email_confirmed_at ? true : false,
        is_active: true
      };
      
      console.log('📝 Creating user in database:', userData);
      
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to create user in database:', error);
        return null;
      }
      
      console.log('✅ User created in database:', data);
      return data;
    } catch (error) {
      console.error('❌ Error ensuring user in database:', error);
      return null;
    }
  }

  // Test project creation with current user
  static async testProjectCreation() {
    try {
      console.log('🧪 Testing project creation...');
      
      // Get current user
      const authUser = await this.getCurrentUser();
      if (!authUser) {
        toast.error('No authenticated user found');
        return false;
      }
      
      // Ensure user exists in database
      const dbUser = await this.ensureUserInDatabase(authUser);
      if (!dbUser) {
        toast.error('Failed to ensure user exists in database');
        return false;
      }
      
      // Test project creation
      const testProject = {
        title: `Test Project ${Date.now()}`,
        description: 'This is a test project created by the debug service',
        category: 'Technology',
        tags: ['test'],
        status: 'active',
        creator_id: authUser.id
      };
      
      console.log('📝 Creating test project:', testProject);
      
      const { data, error } = await supabase
        .from('projects')
        .insert(testProject)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to create test project:', error);
        toast.error(`Failed to create test project: ${error.message}`);
        return false;
      }
      
      console.log('✅ Test project created successfully:', data);
      toast.success('Test project created successfully!');
      return true;
      
    } catch (error) {
      console.error('❌ Error in test project creation:', error);
      toast.error('Error in test project creation');
      return false;
    }
  }

  // Run full debug suite
  static async runFullDebug() {
    console.log('🚀 Running full debug suite...');
    
    const connectionOk = await this.testConnection();
    if (!connectionOk) {
      toast.error('Supabase connection failed');
      return;
    }
    
    const user = await this.getCurrentUser();
    if (!user) {
      toast.error('No authenticated user');
      return;
    }
    
    const dbUser = await this.ensureUserInDatabase(user);
    if (!dbUser) {
      toast.error('Failed to ensure user in database');
      return;
    }
    
    const projectCreated = await this.testProjectCreation();
    if (!projectCreated) {
      toast.error('Project creation failed');
      return;
    }
    
    toast.success('All debug tests passed!');
    console.log('🎉 Full debug suite completed successfully');
  }
}

export default DebugService;