import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import { useAuth } from '../contexts/AuthContext';

const LandingPageWrapper = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shouldShowLanding, setShouldShowLanding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstVisit = () => {
      // If user is logged in, redirect to dashboard
      if (user) {
        setShouldShowLanding(false);
        navigate('/dashboard', { replace: true });
        return;
      }

      // Check if user has visited before
      const hasVisited = localStorage.getItem('shebalance-has-visited');
      
      // Check if PWA is installed
      const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                            (window.navigator as any).standalone === true ||
                            document.referrer.includes('android-app://');

      if (isPWAInstalled) {
        // PWA is installed, redirect to login
        setShouldShowLanding(false);
        navigate('/login', { replace: true });
      } else if (hasVisited) {
        // User has visited before, show landing page (they can navigate to login from there)
        setShouldShowLanding(true);
      } else {
        // First time visit, show landing page
        setShouldShowLanding(true);
        // Mark as visited
        localStorage.setItem('shebalance-has-visited', 'true');
      }
    };

    checkFirstVisit();
  }, [navigate, user]);

  // Show loading while checking
  if (shouldShowLanding === null) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#18191A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if it's first visit and not PWA
  if (shouldShowLanding) {
    return <Landing />;
  }

  // This should not be reached, but just in case
  return null;
};

export default LandingPageWrapper;
