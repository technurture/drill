import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import { 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Loader2, 
  Mail, 
  Lock, 
  ArrowRight,
  Shield,
  Sparkles,
  Users,
  User
} from "lucide-react";
import { supabase } from "../integrations/supabase/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";



const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState({
    normal: false,
    passwordReset: false,
  });
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation(['auth', 'notifications']);





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading((prev) => ({ ...prev, normal: true }));
    try {
      await signIn(email, password);
      // Success message and navigation are handled in AuthContext
      // No need to navigate here as checkForStore will handle it
    } catch (error: any) {
      // Error message is already handled in AuthContext
      console.error("Login error:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, normal: false }));
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error(t('notifications:auth.enterEmailFirst'));
      return;
    }
    setIsLoading((prev) => ({ ...prev, passwordReset: true }));
    try {
      // Send OTP for password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      toast.success(t('notifications:auth.verificationCodeSent'));
      // Navigate to email verification with password reset flag
      navigate("/email-verification", {
        state: {
          email: email,
          isPasswordReset: true,
        },
      });
    } catch (error: any) {
      toast.error(error?.message || t('notifications:auth.failedResetEmail'));
    } finally {
      setIsLoading((prev) => ({ ...prev, passwordReset: false }));
    }
  };

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const logoSrc = "/Shebanlace_favicon.png";

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
                {t('login.title')}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {t('login.subtitle')}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('login.emailLabel')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      placeholder={t('login.emailPlaceholder')}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('login.passwordLabel')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      placeholder={t('login.passwordPlaceholder')}
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
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
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-0 h-auto"
                    onClick={handlePasswordReset}
                    disabled={isLoading.passwordReset}
                  >
                    {isLoading.passwordReset && (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    )}
                    {t('login.forgotPassword')}
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                {/* Sign In Button */}
                <Button
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
                  type="submit"
                  disabled={isLoading.normal}
                >
                  {isLoading.normal ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('login.signingIn')}
                    </>
                  ) : (
                    <>
                      {t('login.signInButton')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>




              </CardFooter>
            </form>
          </Card>

          {/* Bottom Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('login.noAccount')}{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
              >
                {t('login.signUpLink')}
              </button>
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate("/help")}
                className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                {t('auth:login.needHelp')}
              </button>
              <button
                onClick={() => navigate("/landing")}
                className="flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t('auth:login.learnMore')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
