import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center w-full justify-center p-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
    </div>;
  }

  // Require authenticated user
  if (!user) {
    // Only clear auth-related items, not all localStorage
    localStorage.removeItem("userType");
    localStorage.removeItem("pendingSync");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
