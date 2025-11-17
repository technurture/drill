import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, BellRing, Crown, Search, User, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { StoreContext } from "@/contexts/StoreContext";
import { useUnreadNotificationsCount } from "@/integrations/supabase/hooks/notifications";
import { Badge } from "@/components/ui/badge";
import { SubscriptionContext } from "@/contexts/SubscriptionContext";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeSelector } from "./ThemeSelector";
import { useCurrentUser } from "@/integrations/supabase/hooks/users";
import { useTranslation } from "react-i18next";

interface TopBarProps {
  onMenuClick?: () => void;
}

const TopBar = ({ onMenuClick }: TopBarProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data: currentUser } = useCurrentUser(user?.id || "");
  const theStore = useContext(StoreContext);
  
  // Debug logging
  console.log("TopBar - user:", user);
  console.log("TopBar - currentUser:", currentUser);
  console.log("TopBar - is_agent:", currentUser?.is_agent);
  console.log("TopBar - user ID:", user?.id);
  console.log("TopBar - currentUser ID:", currentUser?.id);
  console.log("TopBar - Should show agent badge:", Boolean(currentUser?.is_agent));
  const { data: unreadCount } = useUnreadNotificationsCount(
    user?.id || "",
    theStore?.id || "",
  );
  const subscriptionData = useContext(SubscriptionContext);
  const navigate = useNavigate();
  const route = useLocation();
  const [notifications, setNotifications] = useState([]);
  
  const {
    permission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
  } = usePushNotifications();

  const getLogoSrc = () => {
    if (theme === "dark") {
      return "/Shebanlace_favicon.png";
    } else if (theme === "light") {
      return "/Shebanlace_favicon.png";
    } else if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (mediaQuery.matches) {
        return "/Shebanlace_favicon.png";
      } else {
        return "/Shebanlace_favicon.png";
      }
    }
  };

  const getAppName = () => {
    return 'SheBalance';
  };

  const fetchNotifications = async () => {
    if (!user?.id || !theStore?.id) return;
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("store_id", theStore.id)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setNotifications(data);
    }
  };

  const handlePushNotifications = async () => {
    if (permission === "granted") {
      await unsubscribeFromPushNotifications();
    } else {
      await subscribeToPushNotifications();
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id, theStore?.id]);

  const getPageTitle = () => {
    const path = route.pathname;
    if (path.includes('/dashboard/inventory')) return t('pages:inventory.inventoryManagement');
    if (path.includes('/dashboard/sales')) return t('pages:sales.salesOverview');
    if (path.includes('/dashboard/finance')) return t('pages:finance.financeManagement');
    if (path.includes('/dashboard/notes')) return t('pages:notesAlerts');
    if (path.includes('/dashboard/settings')) return t('pages:settings.title');
    if (path.includes('/add-sales')) return t('pages:pointOfSale');
    if (path === '/dashboard') return t('pages:dashboard.title');
    return 'SheBalance';
  };

  return (
    <div className="bg-white dark:bg-[#18191A] border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {route.pathname !== "/add-sales" && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Logo and Store Info */}
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => navigate("/")} 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src={getLogoSrc()}
                alt="SheBalance Logo"
                className="w-[40px] lg:w-[30px] h-auto"
              />
              <span className="hidden lg:block text-lg font-bold text-gray-900 dark:text-white ml-2">
                {getAppName()}
              </span>
              {subscriptionData?.userSub?.userSub?.plan_type && (
                <div className="hidden sm:flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 rounded-full text-xs font-semibold">
                  <Crown className="h-3 w-3" />
                  <span>{subscriptionData.userSub.userSub.plan_type}</span>
                </div>
              )}
            </div>
            
            {/* Page Title */}
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
              
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Agent Status Badge */}
          {currentUser?.is_agent && (
            <div className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              <UserPlus className="h-3 w-3" />
              <span>{t('common:agent')}</span>
            </div>
          )}

          {/* Notifications */}
          {
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/notifications")}
              className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {(unreadCount > 0 || notifications.length > 0) && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 hover:bg-red-500 text-white text-xs border-2 border-white dark:border-gray-900"
                  variant="destructive"
                >
                  {unreadCount || notifications.length}
                </Badge>
              )}
              <Bell className="h-5 w-5" />
            </Button>
          }

          {/* Theme Selector */}
          <ThemeSelector />

          {/* Crown for mobile premium users */}
          {subscriptionData?.userSub?.userSub?.plan_type && (
            <div className="sm:hidden">
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
