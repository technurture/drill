import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, BarChart2, Settings, StickyNote, X, Coins } from "lucide-react";

interface SidebarProps {
  isSideBar?: boolean;
  onClose?: () => void;
}

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/dashboard/inventory", icon: Package, label: "Inventory" },
  { path: "/dashboard/sales", icon: BarChart2, label: "Sales" },
  { path: "/dashboard/finance", icon: Coins, label: "Finance" },
  { path: "/dashboard/settings", icon: Settings, label: "Settings" },
  { path: "/dashboard/notes", icon: StickyNote, label: "Notes" },
];

export const Sidebar = ({ isSideBar, onClose }: SidebarProps) => {
  const location = useLocation();
  return (
    <aside className="sidebar bg-white dark:bg-neutral-900 w-64 h-full flex flex-col p-4 border-r border-gray-100 dark:border-neutral-800 relative">
      {/* Mobile close button */}
      {isSideBar && onClose && (
        <button
          className="absolute top-4 right-4 z-50 lg:hidden text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
      )}
      <div className="mb-8 flex items-center justify-center">
        {/* You can put your logo here if needed */}
      </div>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition-colors font-medium text-base "
            ${location.pathname === item.path
              ? "bg-primary text-white"
              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"}
          `}
          onClick={onClose}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar; 