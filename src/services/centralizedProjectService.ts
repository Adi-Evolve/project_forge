import { supabase } from '../lib/supabase';
import { localStorageService, StoredProject } from './localStorage';
import { toast } from 'react-hot-toast';

export interface CentralizedProjectData {
  id?: string;
  creator_id: string;
  title: string;
  description: string;
  summary?: string;
  category: string;
  tags: string[];
  deadline?: string;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled';
  approval_status?: 'pending' | 'approved' | 'rejected';
  cover_image?: string;
  image_urls?: string[];
  video_url?: string;
  website_url?: string;
  github_url?: string;
  roadmap?: any[];
  team_members?: any[];
  requirements?: string;
  featured?: boolean;
  views?: number;
  likes?: number;
  comment_count?: number;
  share_count?: number;
  bookmark_count?: number;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
}

class CentralizedProjectService {
  
  // Save project to both localStorage and Supabase with centralized schema
  async saveProject(projectData: Omit<StoredProject, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'supporters' | 'comments'>): Promise<{
    success: boolean;
    project?: StoredProject;
    error?: string;
    supabaseId?: string;
  }> {
    try {
      console.log('🚀 Starting centralized project save...', { title: projectData.title });

      // Step 1: Save to localStorage for immediate use
      const savedProject = localStorageService.saveProject(projectData);
      
      if (!savedProject) {
        throw new Error('Failed to save project to localStorage');
      }

      console.log('✅ Project saved to localStorage:', savedProject.id);

      // Step 2: Save to Supabase with centralized schema mapping
      try {
        const supabaseId = await this.saveProjectToSupabase(savedProject);
        
        if (supabaseId) {
          console.log('✅ Project successfully synced to database:', supabaseId);
          return {
            success: true,
            project: savedProject,
            supabaseId
          };
        } else {
          console.warn('⚠️ Project saved locally but database sync failed');
          return {
            success: true, // Still successful since localStorage worked
            project: savedProject,
            error: 'Database sync failed but project saved locally'
          };
        }
      } catch (supabaseError) {
        console.error('❌ Database sync error:', supabaseError);
        const message = supabaseError instanceof Error ? supabaseError.message : 'Unknown database error';
        
        return {
          success: true, // Still successful since localStorage worked
          project: savedProject,
          error: `Database sync failed: ${message}`
        };
      }

    } catch (error) {
      console.error('❌ Project save failed:', error);
      toast.error('Failed to save project');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save project'
      };
    }
  }

  // Save project to Supabase with centralized schema
  private async saveProjectToSupabase(project: StoredProject): Promise<string | null> {
    try {
      console.log('📝 SAVE PROJECT TO SUPABASE - Centralized Mode');
      console.log('📝 Project to save:', {
        id: project.id,
        title: project.title,
        creatorId: project.creatorId,
        status: project.status
      });

      // Check if we have a valid creator ID
      if (!project.creatorId || project.creatorId === 'anonymous') {
        console.warn('⚠️ Invalid creator ID, skipping Supabase save');
        return null;
      }

      // Check if project already exists by title (since no blockchain_id)
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('title', project.title)
        .eq('creator_id', project.creatorId)
        .single();

      let supabaseId: string;

      if (existingProject) {
        // Project exists, update it
        console.log('🔄 Project exists, updating:', existingProject.id);

        const supabaseData: Partial<CentralizedProjectData> = {
          title: project.title,
          description: project.description,
          summary: project.longDescription?.substring(0, 500) || project.description.substring(0, 500),
          category: project.category,
          tags: project.tags || [],
          deadline: project.deadline,
          status: (project.status as any) || 'active',
          cover_image: project.imageUrls?.[0],
          image_urls: project.imageUrls || [],
          video_url: project.videoUrl,
          website_url: project.demoUrl,
          github_url: undefined, // No github field in StoredProject
          roadmap: project.roadmap || [],
          team_members: project.fundingTiers || [], // Repurpose for team data
          requirements: project.longDescription,
          views: project.views || 0,
          likes: project.likes || 0,
          comment_count: project.comments || 0,
          updated_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('projects')
          .update(supabaseData)
          .eq('id', existingProject.id)
          .select('id')
          .single();

        if (updateError) {
          console.error('❌ SUPABASE PROJECT UPDATE FAILED!');
          console.error('🔍 Detailed error analysis:', updateError);
          throw new Error(`Database update error: ${updateError.message}`);
        }

        supabaseId = existingProject.id;
        console.log('✅ SUPABASE PROJECT UPDATE SUCCESSFUL!');
        console.log('🆔 Updated project UUID:', supabaseId);

      } else {
        // Project doesn't exist, insert it
        console.log('📝 Project does not exist, inserting new record');

        const supabaseData: CentralizedProjectData = {
          creator_id: project.creatorId,
          title: project.title,
          description: project.description,
          summary: project.longDescription?.substring(0, 500) || project.description.substring(0, 500),
          category: project.category,
          tags: project.tags || [],
          deadline: project.deadline,
          status: (project.status as any) || 'active',
          approval_status: 'pending',
          cover_image: project.imageUrls?.[0],
          image_urls: project.imageUrls || [],
          video_url: project.videoUrl,
          website_url: project.demoUrl,
          github_url: undefined, // No github field in StoredProject
          roadmap: project.roadmap || [],
          team_members: project.fundingTiers || [], // Repurpose for team data
          requirements: project.longDescription,
          featured: false,
          views: project.views || 0,
          likes: project.likes || 0,
          comment_count: project.comments || 0,
          share_count: 0,
          bookmark_count: 0,
          created_at: project.createdAt,
          updated_at: new Date().toISOString()
        };

        console.log('📊 Full Supabase data to insert:', JSON.stringify(supabaseData, null, 2));

        const { data, error } = await supabase
          .from('projects')
          .insert(supabaseData)
          .select('id')
          .single();

        console.log('📊 Supabase insert result:', {
          success: !error,
          data: data,
          error: error ? {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          } : null
        });

        if (error) {
          console.error('❌ SUPABASE PROJECT INSERT FAILED!');
          console.error('🔍 Detailed error analysis:');
          console.error('   - Code:', error.code);
          console.error('   - Message:', error.message);
          console.error('   - Details:', error.details);
          console.error('   - Hint:', error.hint);
          console.error('   - Full error object:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        if (!data) {
          console.error('❌ No data returned from Supabase insert');
          throw new Error('No data returned from Supabase insert');
        }

        supabaseId = data.id;
        console.log('✅ SUPABASE PROJECT INSERT SUCCESSFUL!');
        console.log('🆔 New project UUID:', supabaseId);
      }

      return supabaseId;

    } catch (error) {
      console.error('❌ Supabase save error:', error);
      throw error;
    }
  }

  // Get all projects from Supabase
  async getAllProjects(): Promise<StoredProject[]> {
    try {
      const { data: supabaseProjects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch projects from Supabase:', error);
        return localStorageService.getAllProjects(); // Fallback to localStorage
      }

      // Transform Supabase data to StoredProject format
      const projects: StoredProject[] = (supabaseProjects || []).map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        longDescription: project.summary || project.description,
        category: project.category,
        tags: project.tags || [],
        fundingGoal: 0, // No funding in centralized version
        currentFunding: 0,
        deadline: project.deadline,
        teamSize: project.team_members?.length || 1,
        technologies: [],
        features: [],
        roadmap: project.roadmap || [],
        milestones: [],
        fundingTiers: project.team_members || [],
        creatorId: project.creator_id,
        creatorName: 'Creator', // Would need to join with users table
        creatorAddress: '',
        status: project.status || 'active',
        demoUrl: project.website_url,
        videoUrl: project.video_url,
        imageUrls: project.image_urls || [],
        imageHashes: [],
        views: project.views || 0,
        likes: project.likes || 0,
        supporters: [],
        comments: project.comment_count || 0,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }));

      return projects;

    } catch (error) {
      console.error('Error in getAllProjects:', error);
      return localStorageService.getAllProjects(); // Fallback to localStorage
    }
  }
}

export const centralizedProjectService = new CentralizedProjectService();
export default centralizedProjectService;