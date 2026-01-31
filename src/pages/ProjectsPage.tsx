import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ListBulletIcon,
  Squares2X2Icon,
  TagIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import { toast } from 'react-hot-toast';
import { localStorageService } from '../services/localStorage';
import { centralizedProjectService } from '../services/centralizedProjectService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getImageList, getPrimaryImage } from '../utils/image';
import { Project } from '../types';

const PROJECT_CATEGORIES = [
  'All', 'Technology', 'Healthcare', 'Education', 'Environment', 'Gaming',
  'AI/ML', 'Blockchain', 'IoT', 'Mobile App', 'Web Development',
  'Hardware', 'Research', 'Social Impact', 'Entertainment', 'Other'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'funding', label: 'Most Funded' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'deadline', label: 'Deadline Soon' },
  { value: 'team-size', label: 'Team Size' }
];

const ProjectsPage: React.FC = () => {
  // const { isAuthenticated } = useAuth(); // Will be used for authentication checks later
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'discovery' | 'classic'>('discovery');
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    teamSizeMin: 1,
    teamSizeMax: 50
  });




  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);

      console.log('🔍 Loading projects from both localStorage and Supabase...');

      // Step 1: Get projects from localStorage (immediate)
      const localProjects = localStorageService.getAllProjects();
      console.log('📱 LocalStorage projects found:', localProjects.length);

      // Step 2: Get projects from Supabase using centralized service
      const supabaseProjects = await centralizedProjectService.getAllProjects();
      console.log('☁️ Supabase projects found:', supabaseProjects.length);

      // Step 3: Merge projects (prioritize Supabase, add localStorage only if not in Supabase)
      const allProjects = [...supabaseProjects];
      const supabaseTitles = new Set(supabaseProjects.map(p => p.title.toLowerCase()));
      
      localProjects.forEach(localProject => {
        if (!supabaseTitles.has(localProject.title.toLowerCase())) {
          allProjects.push(localProject);
        }
      });

      console.log('🔗 Total merged projects:', allProjects.length);

      // Step 4: Transform projects for UI
      const transformedProjects = allProjects.map((project: any) => {
        return {
          id: project.id,
          creator_id: project.creatorId || project.creator_id,
          title: project.title,
          description: project.description,
          shortDescription: project.description?.substring(0, 150) + '...' || '',
          summary: project.longDescription || project.summary,
          category: project.category || 'General',
          tags: project.tags || [],
          deadline: project.deadline,
          status: (project.status as 'draft' | 'pending' | 'active' | 'completed' | 'cancelled') || 'active',
          approval_status: 'approved' as const,
          cover_image: project.imageUrls?.[0],
          image_urls: project.imageUrls || [],
          images: project.imageUrls || [],
          video_url: project.videoUrl,
          website_url: project.demoUrl,
          github_url: undefined,
          roadmap: project.roadmap || [],
          team_members: project.fundingTiers || [],
          requirements: project.longDescription,
          featured: false,
          views: project.views || 0,
          likes: project.likes || 0,
          like_count: project.likes || 0,
          comment_count: project.comments || 0,
          share_count: 0,
          bookmark_count: 0,
          created_at: project.createdAt || project.created_at || new Date().toISOString(),
          updated_at: project.updatedAt || project.updated_at || new Date().toISOString(),
          // Legacy camelCase aliases used by UI
          createdAt: project.createdAt || project.created_at || new Date().toISOString(),
          updatedAt: project.updatedAt || project.updated_at || new Date().toISOString(),
          // Voting / engagement
          upvotes: project.likes || 0,
          downvotes: 0,
          bookmarks: 0,
          // Team sizing
          teamSize: project.teamSize || 1,
          currentTeamSize: 1,
          // Owner / creator quick view used by frontend
          owner: {
            id: project.creatorId || project.creator_id,
            email: '',
            username: project.creatorName || 'Unknown Creator',
            fullName: project.creatorName || 'Unknown Creator',
            avatar: '',
            avatarUrl: '',
            bio: '',
            location: '',
            website: '',
            skills: [],
            fieldsOfInterest: [],
            reputation: 0,
            verified: false,
            githubProfile: '',
            linkedinProfile: '',
            portfolioUrl: '',
            createdAt: project.createdAt || project.created_at,
            updatedAt: project.updatedAt || project.updated_at
          },
          // Compatibility fields used throughout the UI
          endDate: project.deadline,
          startDate: project.createdAt || project.created_at,
          fundingGoal: 0,
          fundingRaised: 0,
          targetAmount: 0,
          currentAmount: 0,
          skillsNeeded: [],
          comments: [],
          // Legacy UI fields
          visibility: 'public' as const,
          collaborators: [],
          updates: [],
          currency: 'USD' as const,
          location: '',
          remote: false
        };
      }) as Project[];

      // Filter only active projects
      const activeProjects = transformedProjects.filter((p: any) => p.status === 'active');

      setProjects(activeProjects);
      setFilteredProjects(activeProjects);

      if (activeProjects.length === 0) {
        toast.success('📝 No active projects found. Be the first to create one!', { duration: 3000 });
      } else {
        toast.success(`📊 Loaded ${activeProjects.length} active projects successfully!`, { duration: 2000 });
      }

    } catch (error) {
      console.error('Error in loadProjects:', error);
      toast.error('Failed to load projects from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterAndSortProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, searchQuery, selectedCategory, sortBy, filters]);

  const handleLikeProject = async (projectId: string) => {
    if (!user) {
      toast.error('Please log in to like projects');
      return;
    }

    try {
      // Update upvotes in local state (no user-specific tracking in centralized version)
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              upvotes: (project.upvotes || project.likes || 0) + 1
            }
          : project
      ));

      // Update filtered projects as well
      setFilteredProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              upvotes: (project.upvotes || project.likes || 0) + 1
            }
          : project
      ));

      toast.success('Project liked successfully! 👍');

    } catch (error) {
      console.error('Error in handleLikeProject:', error);
      toast.error('Failed to update like status');
      
      // Revert the optimistic update on error
      loadProjects();
    }
  };

  const handleRefreshProjects = () => {
    loadProjects();
    toast.success('Projects refreshed');
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query)) ||
                project.owner.username.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Additional filters
    filtered = filtered.filter(project => {
      if (filters.status !== 'all' && project.status !== (filters.status as any)) return false;
      const teamSize = project.teamSize || project.currentTeamSize || 1;
      if (teamSize < filters.teamSizeMin || teamSize > filters.teamSizeMax) return false;
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.created_at || Date.now()).getTime() - new Date(a.createdAt || a.created_at || Date.now()).getTime();
        case 'oldest':
          return new Date(a.createdAt || a.created_at || Date.now()).getTime() - new Date(b.createdAt || b.created_at || Date.now()).getTime();
        // case 'funding':
        //   return b.fundingRaised - a.fundingRaised;
        case 'popular':
          return (b.upvotes || b.likes || 0) - (a.upvotes || a.likes || 0);
        case 'deadline':
          return new Date(a.endDate || a.deadline || Date.now()).getTime() - new Date(b.endDate || b.deadline || Date.now()).getTime();
        case 'team-size':
          return (b.teamSize || b.currentTeamSize || 1) - (a.teamSize || a.currentTeamSize || 1);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleProjectCreate = async (newProject: Project) => {
    // Reload projects to get the latest data including the new project
    await loadProjects();
    toast.success('Project created successfully!');
    setShowCreateForm(false);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleComment = (projectId: string) => {
    // Navigate to project detail page with comments section
    toast('Opening project comments...');
  };

  const handleShare = (projectId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/projects/${projectId}`);
    toast.success('Project link copied to clipboard!');
  };

  const handleUpvote = (projectId: string) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            // Add upvote tracking if needed
          }
        : project
    ));
    toast.success('Project upvoted!');
  };

  const handleDownvote = (projectId: string) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            // Add downvote tracking if needed
          }
        : project
    ));
    toast('Project downvoted');
  };

  const handleRate = (projectId: string, rating: number) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            // Add rating logic if needed
          }
        : project
    ));
    toast.success(`Rated ${rating} stars!`);
  };

  const handleBookmark = (projectId: string) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            bookmarks: (project.bookmarks || 0) + 1 // Since we don't track user-specific bookmarks in centralized version
          }
        : project
    ));
    toast.success('Project bookmarked!');
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      teamSizeMin: 1,
      teamSizeMax: 50
    });
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary-800/50 backdrop-blur-xl border-b border-secondary-700/50 sticky top-16 z-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">Discover Projects</h1>
              <p className="text-gray-400 text-lg">
                Find innovative projects, collaborate with creators, and bring ideas to life
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-pink text-white rounded-xl hover:from-primary-400 hover:to-accent-pink/80 transition-all duration-200 flex items-center space-x-3 font-medium shadow-lg shadow-primary-500/25"
            >
              <PlusIcon className="w-6 h-6" />
              <span>Create Project</span>
            </motion.button>
          </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-secondary-800/30 backdrop-blur-xl rounded-2xl border border-secondary-700/50 p-8 mb-8 shadow-xl">
          {/* Search Bar */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, tags, or creators..."
              className="w-full pl-12 pr-6 py-4 bg-secondary-700 border border-secondary-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 text-lg"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {PROJECT_CATEGORIES.map(category => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600 hover:text-white'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-gray-300 hover:text-white hover:border-secondary-500 transition-all duration-200"
              >
                <FunnelIcon className="w-4 h-4" />
                <span className="text-sm">Filters</span>
              </button>

              <button
                onClick={resetFilters}
                className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span className="text-sm">Reset</span>
              </button>
              
              <button
                onClick={handleRefreshProjects}
                className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white transition-colors duration-200"
                disabled={loading}
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
              </span>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setViewMode('discovery')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'discovery' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Discovery Feed"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('classic')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'classic' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Classic Grid"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-secondary-700/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">


                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="funded">Funded</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>


                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Projects Feed */}
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
                className="text-center py-16"
              >
                <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search criteria or create a new project
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-pink text-white rounded-xl hover:from-primary-400 hover:to-accent-pink/80 transition-all duration-200 flex items-center space-x-2 font-medium mx-auto"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Create First Project</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProjectCard
                      project={{
                        // Transform imported Project type to ProjectCard interface
                        id: project.id,
                        title: project.title,
                        description: project.description,
                        category: project.category,
                        tags: project.tags,
                        fundingGoal: project.targetAmount || 0,
                        fundingRaised: project.currentAmount || 0,
                        deadline: project.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        teamSize: project.teamSize || project.currentTeamSize || 1,
                        skillsNeeded: project.skillsNeeded || [],
         createdBy: project.owner?.id || project.creator_id || 'unknown',
         createdAt: project.createdAt || project.created_at || new Date().toISOString(),
         status: project.status === 'completed' ? 'funded' : (project.status === 'active' ? 'active' : 'expired'),
                        supporters: [],
                        comments: project.comments?.length || 0,
                        likes: project.upvotes || 0,
                        views: project.views || 0,
                        bookmarks: project.bookmarks || 0,
                        shares: 0,
                        upvotes: project.upvotes || 0,
                        downvotes: project.downvotes || 0,
                        rating: 0,
                        totalRatings: 0,
                        isLiked: false,
                        isBookmarked: false,
                        hasUpvoted: false,
                        hasDownvoted: false,
                        hasRated: false,
                        userRating: 0,
                        creator: {
                          id: project.owner.id,
                          username: project.owner.username || project.owner.fullName || 'Unknown',
                          avatar: project.owner.avatarUrl || '/avatars/default.jpg',
                          verified: project.owner.verified || false
                        },
                        images: project.images || []
                      }}
                      onLike={handleLikeProject}
                      onComment={handleComment}
                      onShare={handleShare}
                      onClick={handleProjectClick}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <ProjectForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={handleProjectCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;