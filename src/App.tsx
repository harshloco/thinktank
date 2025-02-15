// src/App.tsx
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { signInAnon, getCurrentUserId } from './services/firebase/auth';
import { RocketIcon, SparklesIcon } from 'lucide-react';
import { DarkModeProvider } from './context/DarkModeContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';


// Lazy load components
const UnifiedLanding = lazy(() => import('./components/Landing/UnifiedLanding'));
const LandingPage = lazy(() => import('./components/Landing/LandingPage'));
const Board = lazy(() => import('./components/Board/Board'));
const PlanningPokerLanding = lazy(() => import('./components/Landing/PlanningPokerLanding'));
const PlanningPoker = lazy(() => import('./components/PlanningPoker'));

// Loading component
const AuthLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <RocketIcon 
            className="text-blue-500 mr-3 animate-bounce" 
            size={40} 
          />
          <h1 className="text-4xl font-bold text-gray-800">ThinkTank</h1>
        </div>
        <div className="flex justify-center items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-150"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-300"></div>
        </div>
        <p className="mt-4 text-gray-600 animate-fade-in">
          Preparing your collaborative space
          <SparklesIcon 
            className="inline-block ml-2 text-yellow-500" 
            size={20} 
          />
        </p>
      </div>
    </div>
  );
};

// Fallback loading component for Suspense
const GlobalLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-150"></div>
      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-300"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(getCurrentUserId());
  const [isAuthenticating, setIsAuthenticating] = useState(!userId);

  useEffect(() => {
    const initAuth = async () => {
      if (!userId) {
        try {
          const uid = await signInAnon();
          setUserId(uid);
          setIsAuthenticating(false);
        } catch (error) {
          console.error('Authentication failed:', error);
          setIsAuthenticating(false);
        }
      }
    };

    initAuth();
  }, [userId]);

  if (isAuthenticating) {
    return <AuthLoader />;
  }

  return (
    <DarkModeProvider>
      <Router>
        <Suspense fallback={<GlobalLoadingFallback />}>
          <Routes>
            <Route path="/" element={<UnifiedLanding userId={userId!} />} />
            <Route path="/boards" element={<LandingPage userId={userId!} />} />
            <Route path="/board/:boardId" element={<Board />} />
            <Route path="/poker" element={<PlanningPokerLanding userId={userId!} />} />
            <Route path="/poker/:roomId" element={<PlanningPoker userId={userId!} />} />
          </Routes>
        </Suspense>
      </Router>
      <Analytics/>
      <SpeedInsights />
    </DarkModeProvider>
  );
};

export default App;