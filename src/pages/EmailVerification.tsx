import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { 
  Loader2, 
  Mail, 
  ShieldCheck, 
  Timer, 
  ArrowRight,
  RotateCcw,
  CheckCircle,
  Inbox
} from "lucide-react";
import { supabase } from "@/integrations/supabase/supabase";
import { useTheme } from "@/contexts/ThemeContext";

const EmailVerification = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const isPasswordReset = location.state?.isPasswordReset || false;
  const { theme } = useTheme();



  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  // Resend OTP handler
  const handleResendOTP = async () => {
    if (!email || resendDisabled) return;

    setResendDisabled(true);
    setCountdown(30); // 30 seconds cooldown

    try {
      if (isPasswordReset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: email,
        });
        if (error) throw error;
      }
      toast.success("New verification code sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification code");
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  // Verify OTP handler
  const handleVerification = async () => {
    if (!email || !otp) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    try {
      if (isPasswordReset) {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: "recovery",
        });
        if (error) throw error;
        toast.success("Email verified successfully");
        navigate("/reset-password", { state: { email } });
      } else {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: "signup",
        });
        if (error) throw error;
        toast.success("Email verified successfully");
        navigate("/create-store");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const logoSrc = "/Shebanlace_favicon.png";

  const verificationSteps = [
    {
      icon: Mail,
      title: "Email Sent",
      description: "We've sent a verification code to your email"
    },
    {
      icon: ShieldCheck,
      title: "Enter Code",
      description: "Check your inbox and enter the 6-digit code"
    },
    {
      icon: CheckCircle,
      title: "Verified",
      description: "Your email will be verified and you can proceed"
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
                Check Your Email
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                We've sent a verification link to your email
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Email Display */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Code sent to:
                </p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {email}
                </p>
              </div>

              {/* OTP Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Verification Code
                </label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit code"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="h-12 text-center text-lg font-mono tracking-widest bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Check your email inbox and spam folder
                </p>
              </div>

              {/* Resend Section */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={resendDisabled}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  {resendDisabled ? (
                    <>
                      <Timer className="w-3 h-3 mr-1" />
                      {countdown}s
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Resend
                    </>
                  )}
                </Button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              {/* Verify Button */}
              <Button
                className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium"
                onClick={handleVerification}
                disabled={isLoading || !otp || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    {isPasswordReset ? "Verify & Reset" : "Verify Email"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Bottom Notice */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Wrong email address?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
              >
                Go back and try again
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
