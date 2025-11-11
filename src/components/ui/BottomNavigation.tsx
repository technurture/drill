import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, BarChart2, Settings, StickyNote } from "lucide-react";

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/dashboard/inventory", icon: Package, label: "Inventory" },
    { path: "/dashboard/sales", icon: BarChart2, label: "Sales" },
    { path: "/dashboard/notes", icon: StickyNote, label: "Notes" },
    { path: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#18191A] border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation; 