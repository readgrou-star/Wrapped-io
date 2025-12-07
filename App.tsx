import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Builder } from './pages/Builder';
import { ParticipantView } from './pages/ParticipantView';
import { Analytics } from './pages/Analytics';
import { AuthPage } from './pages/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }: React.PropsWithChildren) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
        <HashRouter>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            
            {/* Builder Routes */}
            <Route path="/builder/create" element={
                <ProtectedRoute>
                    <Navigate to="/builder/build" replace />
                </ProtectedRoute>
            } />
            <Route path="/builder/:step" element={
                <ProtectedRoute>
                    <Builder />
                </ProtectedRoute>
            } />
            <Route path="/analytics/:id" element={
                <ProtectedRoute>
                    <Analytics />
                </ProtectedRoute>
            } />
            
            {/* Public Routes */}
            <Route path="/view/:id" element={<ParticipantView />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </HashRouter>
    </AuthProvider>
  );
}

export default App;