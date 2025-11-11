import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('adminAuthenticated');
      const adminEmail = localStorage.getItem('adminEmail');
      
      if (adminAuth === 'true' && adminEmail === 'admin@tacommunity.org') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate('/admin');
      }
    };

    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to admin login
  }

  return <>{children}</>;
};

export default AdminProtectedRoute; 