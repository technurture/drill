import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, ArrowLeft, Shield, Scale } from "lucide-react";

const TermsHeader = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 border-b border-green-400/20 backdrop-blur">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 border-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white">Legal Center</h1>
              <p className="text-xs text-blue-100">Terms & Privacy Policy</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-2 text-white/90 text-sm">
            <Scale className="w-4 h-4" />
            <span>Last updated: September 2025</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="text-white hover:bg-white/20 border-white/20"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsHeader;
