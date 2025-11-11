import React, { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`lg:relative fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar isSideBar={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto px-4">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
