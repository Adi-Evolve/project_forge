import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/layout/Layout';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import AuthCallback from './components/auth/AuthCallback';
import LandingPage from './components/landing/LandingPage';

// Pages
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import MyProjectsPage from './pages/MyProjectsPage';
import IdeasPage from './pages/IdeasPage';
import IdeaHubPage from './pages/IdeaHubPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import BookmarksPage from './pages/BookmarksPage';
import FollowingPage from './pages/FollowingPage';
import CommunityPage from './pages/CommunityPage';
import MessagesPage from './pages/MessagesPage';
import TrendingPage from './pages/TrendingPage';
import LeaderboardPage from './pages/LeaderboardPage';
import FindCollaboratorsPage from './pages/FindCollaboratorsPage';
import HelpPage from './pages/HelpPage';
import ProjectManagementPage from './pages/ProjectManagementPage';
import TestFundTransferPage from './pages/TestFundTransferPage';
import { TestEscrowPage } from './pages/TestEscrowPage';
import CreateProjectPage from './pages/CreateProjectPage';
import EditProjectPage from './pages/EditProjectPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProjectFundingPage from './pages/ProjectFundingPage';
import UserProfilePage from './pages/UserProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

const LandingPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <LandingPage 
      onLogin={() => navigate('/auth/login')}
      onSignUp={() => navigate('/auth/signup')}
    />
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/projects" element={
          <ProtectedRoute>
            <Layout>
              <ProjectsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/idea-hub" element={
          <ProtectedRoute>
            <Layout>
              <IdeaHubPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/find-collaborators" element={
          <ProtectedRoute>
            <Layout>
              <FindCollaboratorsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/trending" element={
          <ProtectedRoute>
            <Layout>
              <TrendingPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Layout>
              <LeaderboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/my-projects" element={
          <ProtectedRoute>
            <Layout>
              <MyProjectsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/project-management" element={
          <ProtectedRoute>
            <Layout>
              <ProjectManagementPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout>
              <AnalyticsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/messages" element={
          <ProtectedRoute>
            <Layout>
              <MessagesPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Layout>
              <NotificationsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/community" element={
          <ProtectedRoute>
            <Layout>
              <CommunityPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/ideas" element={
          <ProtectedRoute>
            <Layout>
              <IdeasPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/bookmarks" element={
          <ProtectedRoute>
            <Layout>
              <BookmarksPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/following" element={
          <ProtectedRoute>
            <Layout>
              <FollowingPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/help" element={
          <ProtectedRoute>
            <Layout>
              <HelpPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/test-fund-transfer" element={
          <ProtectedRoute>
            <Layout>
              <TestFundTransferPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/test-escrow" element={
          <ProtectedRoute>
            <Layout>
              <TestEscrowPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/create-project" element={
          <ProtectedRoute>
            <Layout>
              <CreateProjectPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/edit-project/:id" element={
          <ProtectedRoute>
            <Layout>
              <EditProjectPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/project/:id" element={
          <ProtectedRoute>
            <Layout>
              <ProjectDetailsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/project/:id/funding" element={
          <ProtectedRoute>
            <Layout>
              <ProjectFundingPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/user/:id" element={
          <ProtectedRoute>
            <Layout>
              <UserProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
      </Routes>
      
      <Toaster />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;





