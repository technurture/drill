import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  BarChart2,
  Settings,
  LogOut,
  StickyNote,
  X,
  Crown,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  QrCode,
  User,
  ShoppingCart,
  TrendingUp,
  Bell,
  Calendar,
  Coins,
  PiggyBank,
  Banknote,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import Logo from "./sidebar/Logo";
import { StoreSelector } from "./sidebar/StoreSelector";
import { SubscriptionContext } from "@/contexts/SubscriptionContext";
import LogoutModal from "./ui/modals/LogoutModal";
import { requestNotificationPermission } from "@/integrations/firebase/firebase";
import favicon from "../../public/favicon.png";

const Sidebar = ({ onClose, isSideBar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const subscription = useContext(SubscriptionContext);
  const [isLogoutModal, setLogoutModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (user?.id) {
      requestNotificationPermission(user?.id);
    }
  }, [user]);

  const navItems = [
    { 
      path: "/dashboard", 
      icon: LayoutDashboard, 
      label: "Dashboard",
      color: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      activeColor: "bg-green-500 text-white"
    },
    { 
      path: "/dashboard/inventory", 
      icon: Package, 
      label: "Inventory",
      color: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      activeColor: "bg-green-500 text-white"
    },
    { 
      path: "/dashboard/sales", 
      icon: BarChart2, 
      label: "Sales",
      color: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      activeColor: "bg-green-500 text-white"
    },
    { 
      path: "/dashboard/finance", 
      icon: Coins, 
      label: "Finance",
      color: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      activeColor: "bg-green-500 text-white"
    },
    { 
      path: "/dashboard/savings", 
      icon: PiggyBank, 
      label: "Savings",
      color: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      activeColor: "bg-green-500 text-white"
    },
    { 
      path: "/dashboard/loans", 
      icon: Banknote, 
      label: "Loans",
      color: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      activeColor: "bg-green-500 text-white"
    },
    { 
      path: "/dashboard/settings", 
      icon: Settings, 
      label: "Settings",
      color: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      activeColor: "bg-green-500 text-white"
    },
  ];

  return (
    <div className={`${isSideBar && "bg-transparent w-screen"}`} onClick={onClose}>
      <aside
          className={`bg-white dark:bg-[#18191A] h-screen flex-shrink-0 flex flex-col justify-between transition-all duration-300 relative lg:static z-50 border-r border-gray-200 dark:border-gray-800 ${
            collapsed ? "w-[80px]" : "w-[280px]"
          }`}
        >
          {/* Collapse/Expand button for desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 hidden lg:flex hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed((prev) => !prev);
            }}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex flex-col flex-grow overflow-y-auto">
            {/* Logo: favicon when collapsed, full logo when expanded */}
            {collapsed ? (
              <div className="flex justify-center pt-8 p-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <img src="/Shebanlace_favicon.png" alt="SheBalance Logo" className="w-8 h-8 object-contain" />
                </div>
              </div>
            ) : (
              <Logo />
            )}
            
            {/* StoreSelector: show active store */}
            {!collapsed && (
              <>
                <div className="px-4 mb-4">
                  <Separator className="bg-gray-200 dark:bg-gray-800" />
                </div>
                <StoreSelector onClose={onClose} />
              </>
            )}
            
            {collapsed && (
              <>
                <div className="px-4 mb-4 mt-4">
                  <Separator className="bg-gray-200 dark:bg-gray-800" />
                </div>
                {/* Collapsed store display */}
                <div className="px-4 mb-4">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-lg flex items-center justify-center">
                      <User size={12} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Nav items */}
            <nav className={`px-4 ${collapsed ? 'space-y-3' : 'space-y-2'}`}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`group relative flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      isActive 
                        ? "bg-gray-100 dark:bg-gray-800 shadow-sm" 
                        : ""
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? item.activeColor : item.color
                    }`}>
                      <Icon size={16} />
                    </div>
                    {!collapsed && (
                      <span className={`font-medium text-sm ${
                        isActive 
                          ? "text-gray-900 dark:text-white" 
                          : "text-gray-600 dark:text-gray-300"
                      }`}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Current plan section: hide when collapsed */}
            {!collapsed && subscription?.userSub.userSub?.plan_type && (
              <div className="p-4 mt-auto">
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800 p-4 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {subscription?.userSub.userSub.plan_type ? `${subscription.userSub.userSub.plan_type} Plan` : "Free Plan"}
                      </p>
                      {subscription.userSub.userSub.end_date && (
                        <p className="text-xs text-violet-600 dark:text-violet-400 flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          Expires: {format(subscription?.userSub?.userSub?.end_date, "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom section */}
          <div className={`p-4 border-t border-gray-200 dark:border-gray-800 space-y-2`}>
            <Link
              to="/dashboard/help"
              onClick={onClose}
              className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group`}
              title={collapsed ? "Help" : undefined}
            >
              <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                <HelpCircle size={16} />
              </div>
              {!collapsed && (
                <span className="font-medium text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  Help
                </span>
              )}
            </Link>
            
            <Button
              onClick={() => setLogoutModal(true)}
              variant="ghost"
              className={`w-full ${collapsed ? 'justify-center p-3' : 'justify-start space-x-3 p-3'} rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 group`}
              title={collapsed ? "Sign Out" : undefined}
            >
              <div className="w-8 h-8 bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-lg flex items-center justify-center">
                <LogOut size={16} />
              </div>
              {!collapsed && (
                <span className="font-medium text-sm text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">
                  Sign Out
                </span>
              )}
            </Button>
          </div>
        </aside>
      
      {isLogoutModal && (
        <LogoutModal isOpen={isLogoutModal} setOpen={setLogoutModal} />
      )}
    </div>
  );
};

export default Sidebar;
