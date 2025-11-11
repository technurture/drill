
import React, { useState, useEffect, useReducer } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  UserPlus,
  Zap,
  Shield,
  Rocket,
  Loader2,
  ArrowRight,
  HelpCircle,
  Phone
} from "lucide-react";
import { supabase } from "../integrations/supabase/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { useAgents } from "@/integrations/supabase/hooks/users";
import { validateNigerianPhoneNumber } from "@/utils/validation";


interface State {
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  gender: string;
  ageRange: string;
  isAgent: boolean;
  name: string;
  registeredBy: string;
  loading: boolean;
}

const initialState: State = {
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  gender: "",
  ageRange: "",
  isAgent: false,
  name: "",
  registeredBy: "",
  loading: false,
};

const reducer = (state: State, action: any): State => {
  switch (action.type) {
    case "set-email":
      return { ...state, email: action.data };
    case "set-phone-number":
      return { ...state, phoneNumber: action.data };
    case "set-password":
      return { ...state, password: action.data };
    case "set-confirm-password":
      return { ...state, confirmPassword: action.data };
    case "set-gender":
      return { ...state, gender: action.data };
    case "set-age-range":
      return { ...state, ageRange: action.data };
    case "set-is-agent":
      return { ...state, isAgent: action.data };
    case "set-name":
      return { ...state, name: action.data };
    case "set-registered-by":
      return { ...state, registeredBy: action.data };
    case "set-loading":
      return { ...state, loading: action.data };
    default:
      return state;
  }
};

const Signup = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data: agents } = useAgents();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "set-loading", data: true });
    
    try {
      // Validation
      if (!state.email.trim()) {
        toast.error("Please enter your email address");
        return;
      }
      
      if (!state.phoneNumber.trim()) {
        toast.error("Please enter your phone number");
        return;
      }
      
      // Validate Nigerian phone number
      const phoneValidation = validateNigerianPhoneNumber(state.phoneNumber);
      if (!phoneValidation.isValid) {
        toast.error(phoneValidation.error || "Please enter a valid Nigerian phone number");
        return;
      }
      
      if (state.password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }
      
      if (state.password !== state.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      
      if (!state.gender) {
        toast.error("Please select your gender");
        return;
      }
      
      if (!state.ageRange) {
        toast.error("Please select your age range");
        return;
      }
      
      // Agent name validation
      if (state.isAgent && !state.name.trim()) {
        toast.error("Please enter your agent name");
        return;
      }
      
      // Check if agent name is unique (only if agent toggle is on)
      if (state.isAgent && state.name.trim()) {
        const { data: existingAgent } = await supabase
          .from("users")
          .select("name")
          .eq("name", state.name.trim())
          .single();
        
        if (existingAgent) {
          toast.error("This agent name is already taken. Please choose a different name.");
          return;
        }
      }
      
      await signUp(state.email, state.password, {
        phone_number: state.phoneNumber,
        gender: state.gender,
        age_range: state.ageRange,
        is_agent: state.isAgent,
        name: state.isAgent ? state.name.trim() : null,
        registered_by: state.registeredBy === "none" ? null : state.registeredBy
      });
      
      toast.success("Verification email sent!");
      navigate("/email-verification", {
        state: {
          email: state.email,
          isPasswordReset: false,
        },
      });
    } catch (error: any) {
      // Error message is already handled in AuthContext
      console.error("Signup error:", error);
    } finally {
      dispatch({ type: "set-loading", data: false });
    }
  };

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const logoSrc = "/Shebanlace_favicon.png";

  const features = [
    {
      icon: Zap,
      title: "Quick Setup",
      description: "Get started with your store in under 5 minutes"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security for your business data"
    },
    {
      icon: Rocket,
      title: "Scale Your Business",
      description: "Tools to help your business grow and succeed"
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
                Create Your Account
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Join SheBalance and start managing your business
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                      required
                      value={state.email}
                      onChange={(e) =>
                        dispatch({
                          type: "set-email",
                          data: e.target.value,
                        })
                      }
                      className="pl-10 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Phone Number Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phoneNumber"
                      placeholder="+2348012345678 or 08012345678"
                      type="tel"
                      required
                      value={state.phoneNumber}
                      onChange={(e) =>
                        dispatch({
                          type: "set-phone-number",
                          data: e.target.value,
                        })
                      }
                      className="pl-10 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter Nigerian phone number with country code (+234) or starting with 0
                  </p>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      placeholder="Create a strong password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={state.password}
                      onChange={(e) =>
                        dispatch({
                          type: "set-password",
                          data: e.target.value,
                        })
                      }
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      placeholder="Confirm your password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={state.confirmPassword}
                      onChange={(e) =>
                        dispatch({
                          type: "set-confirm-password",
                          data: e.target.value,
                        })
                      }
                      className="pl-10 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Gender Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gender
                  </label>
                  <Select
                    value={state.gender}
                    onValueChange={(value) =>
                      dispatch({
                        type: "set-gender",
                        data: value,
                      })
                    }
                  >
                    <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Range Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Age Range
                  </label>
                  <Select
                    value={state.ageRange}
                    onValueChange={(value) =>
                      dispatch({
                        type: "set-age-range",
                        data: value,
                      })
                    }
                  >
                    <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400">
                      <SelectValue placeholder="Select your age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-35">18-35</SelectItem>
                      <SelectItem value="35-40">35-40</SelectItem>
                      <SelectItem value="40 above">40 above</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Registered By Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Registered By
                  </label>
                  <Select
                    value={state.registeredBy}
                    onValueChange={(value) =>
                      dispatch({
                        type: "set-registered-by",
                        data: value,
                      })
                    }
                  >
                    <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400">
                      <SelectValue placeholder="Select who registered you" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Self Registration)</SelectItem>
                      {agents?.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name || agent.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Agent Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sign up as an Agent
                    </label>
                    <Switch
                      checked={state.isAgent}
                      onCheckedChange={(checked) =>
                        dispatch({
                          type: "set-is-agent",
                          data: checked,
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable this if you want to sign up as a SheBalance agent
                  </p>
                </div>

                {/* Agent Name Field - Only show when agent toggle is on */}
                {state.isAgent && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Agent Name
                    </label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="name"
                        placeholder="Enter your unique agent name"
                        type="text"
                        required={state.isAgent}
                        value={state.name}
                        onChange={(e) =>
                          dispatch({
                            type: "set-name",
                            data: e.target.value,
                          })
                        }
                        className="pl-10 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This name must be unique and will be used to identify you as an agent
                    </p>
                  </div>
                )}

<div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
    By creating an account, you agree to our{" "}
    <a
      href="/termsandprivacy"
      className="text-green-600 dark:text-green-400 hover:underline font-medium"
    >
      Terms of Service
    </a>{" "}
    and{" "}
    <a
      href="/termsandprivacy"
      className="text-green-600 dark:text-green-400 hover:underline font-medium"
    >
      Privacy Policy
    </a>
  </p>
</div>

              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                {/* Sign Up Button */}
                <Button
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
                  type="submit"
                  disabled={state.loading}
                >
                  {state.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
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
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-purple-600 dark:text-green-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
              >
                Sign in here
              </button>
            </p>
            
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/help")}
                className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Need help?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
