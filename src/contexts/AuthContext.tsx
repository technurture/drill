import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/supabase";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";
import { toast } from "sonner";

import { SupabaseAuthProvider } from "@/integrations/supabase";
import { useStores } from "@/integrations/supabase/hooks/stores";
import { cache } from "@/utils/cacheUtils";
import { User } from "@/types/database.types";
import { validateNigerianPhoneNumber, formatNigerianPhoneNumber } from "@/utils/validation";

interface AuthContextType {
  user: (SupabaseUser & Partial<User>) | null;
  setUser: any;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  loginState: boolean;
  setLoginState: any;
  checkUserStore: (userData: any) => Promise<boolean>;
  isOnline: boolean;
  pendingSync: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signInWithOtp: async () => {},
  verifyOtp: async () => {},
  signOut: async () => {},
  loading: true,
  loginState: false,
  setLoginState: "",
  checkUserStore: async (userData: any) => false,
  isOnline: true,
  pendingSync: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(SupabaseUser & Partial<User>) | null>(null);
  const { data: stores } = useStores(user?.id);
  const [loginState, setLoginState] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (localStorage.getItem("pendingSync")) {
        setPendingSync(true);
        showSuccessToast.connectionRestored();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showErrorToast.offlineMode();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Cache user data when they're online and have data
  useEffect(() => {
    if (user && isOnline && stores) {
      // Cache stores data
      cache.set(`stores_${user.id}`, stores);
      
      // Cache user data
      cache.set(`user_${user.id}`, user);
    }
  }, [user, stores, isOnline]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        setUser(session?.user ?? null);

        // If offline and no session, try to load cached user data
        if (!session && !isOnline && session?.user) {
          const cachedUser = cache.get(`user_${session.user.id}`);
          if (cachedUser) {
            setUser(cachedUser);
            toast.success("Loaded cached data for offline access");
          }
        }

        // Only clear localStorage if there's no session and we're online
        // Don't clear if user is logged in
        if (!session && isOnline) {
          // Only clear auth-related items, not all localStorage
          localStorage.removeItem("userType");
          localStorage.removeItem("pendingSync");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Don't clear localStorage on error, just log it
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Only clear auth-related localStorage items when user logs out
      if (!session && isOnline) {
        localStorage.removeItem("userType");
        localStorage.removeItem("pendingSync");
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isOnline]);

  const checkForStore = async (user_id: any) => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user_id);
      
      if (error) {
        console.error("Error checking store:", error);
        // If there's an error, still navigate to dashboard as fallback
        navigate("/dashboard");
        return;
      }
      
      if (data && data.length > 0) {
        navigate("/dashboard");
      } else {
        navigate("/create-store");
      }
    } catch (error) {
      console.error("Error in checkForStore:", error);
      // Fallback to dashboard
      navigate("/dashboard");
    }
  };



  const checkUserStore = async (userData: any) => {
    if (!userData) return false;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("created_store")
        .eq("id", userData.id)
        .single();
      if (error) {
        showErrorToast.dataLoadFailed();
        return false;
      }
      return data?.created_store;
    } catch (error) {
      console.error("Error checking user store:", error);
      return false;
    }
  };





  const signIn = async (email: string, password: string) => {
    try {
      const response = await supabase.auth.signInWithPassword({
        email: email,
        password,
      });
      
      if (response.error) {
        // Provide user-friendly error messages
        let errorMessage = "Login failed. Please try again.";
        
        switch (response.error.message) {
          case "Invalid login credentials":
            showErrorToast.invalidCredentials();
            break;
          case "Email not confirmed":
            showErrorToast.emailNotVerified();
            break;
          case "User not found":
            showErrorToast.accountNotFound();
            break;
          case "Too many requests":
            showErrorToast.tooManyAttempts();
            break;
          default:
            if (response.error.message.includes("Invalid login credentials")) {
              showErrorToast.invalidCredentials();
            } else if (response.error.message.includes("User not found")) {
              showErrorToast.accountNotFound();
            } else {
              showErrorToast.loginFailed(response.error.message);
            }
        }
        throw response.error;
      }
      
      if (response.data.session !== null && response.data.user !== null) {
        toast.success("Welcome back!");
        checkForStore(response?.data?.user?.id);
        localStorage.setItem("userType", "admin");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (!error.message) {
        toast.error("An unexpected error occurred. Please try again.");
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      // Validate email format
      if (!email || !email.includes("@") || !email.includes(".")) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Use email authentication
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/email-verification`,
        }
      });
      
      if (error) {
        // Provide user-friendly error messages
        let errorMessage = "Sign up failed. Please try again.";
        
        switch (error.message) {
          case "User already registered":
            errorMessage = "An account with this email already exists. Please try logging in instead.";
            break;
          case "Password should be at least 6 characters":
            errorMessage = "Password must be at least 6 characters long.";
            break;
          case "Invalid email":
            errorMessage = "Please enter a valid email address.";
            break;
          case "Signup is disabled":
            errorMessage = "Account creation is currently disabled. Please contact support.";
            break;
          default:
            if (error.message.includes("already registered")) {
              errorMessage = "An account with this email already exists. Please try logging in instead.";
            } else if (error.message.includes("password")) {
              errorMessage = "Password must be at least 6 characters long.";
            } else if (error.message.includes("email")) {
              errorMessage = "Please enter a valid email address.";
            } else {
              errorMessage = error.message;
            }
        }
        
        toast.error(errorMessage);
        throw error;
      }
      
      // Explicitly insert user data into the users table
      if (data.user) {
        const { error: userUpsertError } = await supabase
          .from('users')
          .upsert([
            {
              id: data.user.id,
              email: email,
              gender: metadata?.gender,
              age_range: metadata?.age_range,
              is_agent: metadata?.is_agent || false,
              name: metadata?.name || null,
              registered_by: metadata?.registered_by || null,
              created_store: false
            }
          ], {
            onConflict: 'id',
            ignoreDuplicates: false
          });
        
        if (userUpsertError) {
          console.error("Error upserting user data:", userUpsertError);
          // Don't throw error here as auth signup was successful
          // The user can still verify their phone and complete setup
        }
      }
      
              // Success message
        if (data.user && !data.session) {
          toast.success("Account created successfully! Please check your email for verification link.");
        }
      
    } catch (error: any) {
      console.error("Sign up error:", error);
      // Error message already shown above, so we don't need to show it again
      throw error;
    }
  };

  const signInWithOtp = async (email: string) => {
    try {
      if (!email || !email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }
      // Send email OTP (magic link or 6-digit depending on Supabase settings)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          shouldCreateUser: true,
        },
      });
      
      if (error) {
        toast.error(error.message || "Failed to send verification email");
        throw error;
      }
      
      toast.success("Verification email sent! Please check your inbox (and spam). ");
    } catch (error: any) {
      console.error("Email OTP sign in error:", error);
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      
      if (error) {
        toast.error(error.message || "Invalid or expired code");
        throw error;
      }
      
      if (data.session && data.user) {
        checkForStore(data.user.id);
        localStorage.setItem("userType", "admin");
        toast.success("Email verified! Login successful.");
      }
    } catch (error: any) {
      console.error("Email OTP verification error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear cache on logout
      cache.clear();
      // Only clear auth-related localStorage items
      localStorage.removeItem("userType");
      localStorage.removeItem("pendingSync");
      localStorage.removeItem("stockwise-auth-token");
      sessionStorage.clear();
      await supabase.auth.signOut().then(() => {
        setUser(null);
        setSession(null);
        window.location.assign("/login");
        toast.success("Logged out successfully");
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signInWithOtp,
    verifyOtp,
    signOut,
    loading,
    loginState,
    setLoginState,
    checkUserStore,
    isOnline,
    pendingSync,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
