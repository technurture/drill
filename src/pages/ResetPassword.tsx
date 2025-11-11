import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock, 
  Shield, 
  CheckCircle,
  Key,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const logoSrc = "/Shebanlace_favicon.png";

  const securityFeatures = [
    {
      icon: Shield,
      title: "Secure Encryption",
      description: "Your password is encrypted with industry-standard security"
    },
    {
      icon: Lock,
      title: "Account Protection",
      description: "Enhanced security measures protect your business data"
    },
    {
      icon: CheckCircle,
      title: "Verified Access",
      description: "Only you can access and modify your account credentials"
    }
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#18191A]">
      {/* Single Column Layout */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-white dark:bg-[#18191A]">
            <CardHeader className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <img src="/Shebanlace_favicon.png" alt="SheBalance" className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Reset Password
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enter your email to receive a reset link
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    placeholder="Enter your new password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Password Strength Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Password Strength</span>
                  <span className={`font-medium ${
                    newPassword.length >= 8 
                      ? newPassword.length >= 12 
                        ? "text-green-600" 
                        : "text-yellow-600"
                      : "text-red-600"
                  }`}>
                    {newPassword.length >= 12 ? "Strong" : newPassword.length >= 8 ? "Medium" : "Weak"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      newPassword.length >= 8 
                        ? newPassword.length >= 12 
                          ? "bg-green-500 w-full" 
                          : "bg-yellow-500 w-2/3"
                        : "bg-red-500 w-1/3"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800/30">
                <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                  <strong>Security Notice:</strong> After updating your password, you'll be redirected to the login page to sign in with your new credentials.
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium"
                onClick={handleResetPassword}
                disabled={isLoading || !newPassword || newPassword.length < 8}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Bottom Notice */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Remember your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
              >
                Sign in instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
