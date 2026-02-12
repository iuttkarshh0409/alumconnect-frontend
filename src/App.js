import { SignInPage, SignUpPage } from './pages/Auth';
import PostAuth from './pages/PostAuth';
import { ClerkProvider } from '@clerk/clerk-react';
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

import LandingPage from './pages/LandingPage';
import AuthCallback from './pages/AuthCallback';
import SetupProfile from './pages/SetupProfile';
import StudentDashboard from './pages/StudentDashboard';
import AlumniDashboard from './pages/AlumniDashboard';

import AnalyticsDashboard from "./pages/AnalyticsDashboard";



import AdminDashboard from './pages/AdminDashboard';
import AlumniDirectory from './pages/AlumniDirectory';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function AppRouter() {
  const location = useLocation();

 /* if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }*/

  return (
    <Routes>
      {/* Admin-only Analytics */}
      <Route
        path="/admin/analytics/*"
        element={
          <ProtectedRoute>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />

    <Route path="/sign-in" element={<SignInPage />} />
    <Route path="/sign-up" element={<SignUpPage />} />
    <Route path="/post-auth" element={<PostAuth />} />



      {/* Public / Auth */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            <SetupProfile />
          </ProtectedRoute>
        }
      />

      {/* Dashboards */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/dashboard"
        element={
          <ProtectedRoute>
            <AlumniDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Other protected routes */}
      <Route
        path="/directory"
        element={
          <ProtectedRoute>
            <AlumniDirectory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}


function App() {
  return (
    <ClerkProvider publishableKey={process.env.REACT_APP_CLERK_PUBLISHABLE_KEY}>
      <div className="App">
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-right" />
        </BrowserRouter>
      </div>
    </ClerkProvider>
  );
}


export default App;