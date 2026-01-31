import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { StoredProject, localStorageService } from '../services/localStorage';
import { centralizedProjectService } from '../services/centralizedProjectService';
import { getImageList, getPrimaryImage } from '../utils/image';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  TagIcon,
  PlayIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  StarIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  CheckBadgeIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  PhotoIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const ProjectDetailsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState<StoredProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        navigate('/');
        return;
      }
      
      try {
        // Try localStorage first
        let data = await localStorageService.getProjectById(projectId);

        // If not found, try centralized service
        if (!data) {
          const allProjects = await centralizedProjectService.getAllProjects();
          const fetched = allProjects.find(p => p.id === projectId);
          if (fetched) data = fetched;
        }

        setProject(data);
        // ownership will be computed in separate effect when auth and project are available
      } catch (error) {
        console.error(error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [projectId, navigate]);

  const { user } = useAuth();

  // Compute ownership when project or auth user changes
  useEffect(() => {
    if (!project) {
      setIsOwner(false);
      return;
    }

    // If auth user has a UUID (id) compare to creatorId
    const authId = (user && (user.id || user.user_metadata?.username || user.user_metadata?.wallet_address)) || null;

    let owner = false;
    try {
      if (user && user.id && project.creatorId) {
        owner = String(project.creatorId) === String(user.id);
      }

      // Also allow matching by wallet address (creatorAddress)
      if (!owner && user && user.user_metadata?.wallet_address && (project as any).creatorAddress) {
        owner = String((project as any).creatorAddress).toLowerCase() === String(user.user_metadata.wallet_address).toLowerCase();
      }

      setIsOwner(owner);
    } catch (e) {
      console.warn('Failed to compute ownership', e);
      setIsOwner(false);
    }
  }, [project, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RocketLaunchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Browse Projects
          </button>
        </div>
      </div>
    );
  }



  
  const galleryUrls = getImageList(project) || [];
  const projectImage = galleryUrls.length > 0
    ? (galleryUrls[selectedImageIndex] || galleryUrls[0])
    : (getPrimaryImage(project) || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LightBulbIcon },
    { id: 'details', label: 'Details', icon: CodeBracketIcon },
    { id: 'roadmap', label: 'Roadmap', icon: ChartBarIcon },
    { id: 'team', label: 'Team', icon: UserGroupIcon },
    { id: 'reviews', label: 'Reviews', icon: ChatBubbleLeftRightIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Projects</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-red-300 transition-colors"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-500" />
                )}
                <span className="text-sm text-gray-600">{project.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <button
                onClick={() => setIsStarred(!isStarred)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-yellow-300 transition-colors"
              >
                {isStarred ? (
                  <StarSolidIcon className="w-5 h-5 text-yellow-500" />
                ) : (
                  <StarIcon className="w-5 h-5 text-gray-500" />
                )}
                <span className="text-sm text-gray-600">Star</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-300 transition-colors">
                <ShareIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 mb-8"
        >
          {/* Project Banner */}
          <div className="relative h-80 bg-gradient-to-r from-blue-600 to-purple-600">
            <img
              src={projectImage}
              alt={project.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/70 to-purple-600/70" />
            
            {/* Project Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={`https://ui-avatars.io/api/?name=${project.creatorName || 'Creator'}&background=ffffff&color=6366f1&size=48`}
                  alt={project.creatorName || 'Creator'}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                />
                <div>
                  <p className="font-semibold text-lg">{project.creatorName || 'Anonymous Creator'}</p>
                  <p className="text-white/80 text-sm">Project Creator</p>
                </div>
                {isOwner ? (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full bg-white/20 text-white text-sm">
                    <CheckBadgeIcon className="w-4 h-4 mr-1" /> Owner
                  </span>
                ) : (
                  <CheckBadgeIcon className="w-6 h-6 text-white" />
                )}
              </div>
              
              <h1 className="text-5xl font-bold mb-4 leading-tight">{project.title}</h1>
              <p className="text-xl opacity-90 max-w-3xl mb-6">{project.description}</p>
              
              <div className="flex flex-wrap items-center gap-4">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {project.category}
                </span>
                <div className="flex items-center space-x-2">
                  <EyeIcon className="w-4 h-4" />
                  <span className="text-sm">{project.views || 0} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span className="text-sm">Created {new Date(project.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {/* Thumbnails */}
            {galleryUrls.length > 1 && (
              <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center space-x-3 overflow-x-auto">
                {galleryUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedImageIndex(idx); }}
                    className={`w-20 h-12 rounded-lg overflow-hidden border ${selectedImageIndex === idx ? 'ring-2 ring-blue-500' : 'border-gray-200'}`}
                  >
                    <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Simple Lightbox */}
            {lightboxOpen && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
                <img src={projectImage} alt="Full" className="max-h-full max-w-full rounded-lg shadow-2xl" />
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
            >
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-white shadow-sm text-blue-600 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Overview</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {project.longDescription || project.description}
                    </p>
                  </div>

                  {/* Demo and Video Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <GlobeAltIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Live Demo</h4>
                          <p className="text-sm text-gray-600">Try the project live</p>
                        </div>
                      </a>
                    )}
                    
                    {project.videoUrl && (
                      <a
                        href={project.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-4 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <PlayIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Video Demo</h4>
                          <p className="text-sm text-gray-600">Watch project demo</p>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Milestones */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Project Milestones</h3>
                    {project.milestones && project.milestones.length > 0 ? (
                      <div className="space-y-4">
                        {project.milestones.map((milestone: any, index: number) => (
                          <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex-shrink-0 mt-1">
                              {milestone.approved ? (
                                <CheckCircleIcon className="w-6 h-6 text-green-500" />
                              ) : (
                                <ClockIcon className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                              <p className="text-gray-600 text-sm mt-1">{milestone.description}</p>
                              {milestone.deadline && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Deadline: {new Date(milestone.deadline).toLocaleDateString()}
                                </p>
                              )}
                              {milestone.approved && (
                                <div className="flex items-center mt-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                    Approved by Reviewer
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <ClockIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">No milestones defined for this project yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Details</h2>
                  
                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Technologies Used</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {project.features && project.features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                      <div className="space-y-3">
                        {project.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <CheckBadgeIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'roadmap' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Roadmap</h2>
                  
                  {project.roadmap && project.roadmap.length > 0 ? (
                    <div className="space-y-6">
                      {project.roadmap.map((item, index) => (
                        <div key={item.id || index} className="relative">
                          {index !== project.roadmap.length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                          )}
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              <CheckBadgeIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                <span className="text-sm text-gray-500">{item.timeline}</span>
                              </div>
                              <p className="text-gray-700">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ChartBarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No roadmap available for this project.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Team</h2>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center space-x-4">
                      <img
                        src={`https://ui-avatars.io/api/?name=${project.creatorName || 'Creator'}&background=6366f1&color=fff&size=80`}
                        alt={project.creatorName || 'Creator'}
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{project.creatorName || 'Anonymous Creator'}</h3>
                        <p className="text-blue-600 font-medium">Project Lead & Founder</p>
                        <p className="text-gray-600 mt-1">Team size: {project.teamSize || 1} member{(project.teamSize || 1) !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Reviews</h2>
                  
                  {/* Add Review Form */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a Review</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className={`w-8 h-8 ${
                                star <= rating ? 'text-yellow-400' : 'text-gray-300'
                              } hover:text-yellow-400 transition-colors`}
                            >
                              <StarIcon className="w-full h-full fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                        <textarea
                          value={newReview}
                          onChange={(e) => setNewReview(e.target.value)}
                          placeholder="Share your thoughts about this project..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (newReview.trim()) {
                            const review = {
                              id: Date.now(),
                              user: user?.user_metadata?.full_name || 'Anonymous',
                              rating,
                              comment: newReview,
                              date: new Date().toISOString()
                            };
                            setReviews([...reviews, review]);
                            setNewReview('');
                            setRating(5);
                          }
                        }}
                        disabled={!newReview.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {review.user.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{review.user}</h4>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <ChatBubbleLeftRightIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">No reviews yet. Be the first to review this project!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <TagIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:from-blue-100 hover:to-purple-100 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Project Gallery</h3>
              
              {galleryUrls.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative">
                    <img
                      src={galleryUrls[selectedImageIndex] || galleryUrls[0]}
                      alt="Project image"
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setLightboxOpen(true)}
                    />
                    <button
                      onClick={() => setLightboxOpen(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg"
                    >
                      <MagnifyingGlassIcon className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                  
                  {/* Thumbnail Strip */}
                  {galleryUrls.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {galleryUrls.slice(0, 8).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Project image ${index + 1}`}
                          className={`w-full h-16 object-cover rounded cursor-pointer border-2 transition-all ${
                            selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                  
                  {galleryUrls.length > 8 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{galleryUrls.length - 8} more images
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <PhotoIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No images available for this project.</p>
                </div>
              )}
            </motion.div>

            {/* Project Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
              <div className="space-y-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status === 'active' && '🟢'}
                  {project.status === 'completed' && '✅'}
                  {project.status === 'cancelled' && '❌'}
                  {project.status === 'draft' && '📝'}
                  <span className="ml-2 capitalize">{project.status}</span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div>Created: {new Date(project.createdAt || Date.now()).toLocaleDateString()}</div>
                  <div>Updated: {new Date(project.updatedAt || Date.now()).toLocaleDateString()}</div>
                  {project.deadline && (
                    <div>Deadline: {new Date(project.deadline).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
