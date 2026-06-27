import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";

interface LayoutProps {
  showSidebar?: boolean;
}

export default function Layout({ showSidebar = false }: LayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {showSidebar && (
        <Sidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar 
          showSidebar={showSidebar} 
          onMenuClick={() => setIsMobileSidebarOpen(true)} 
        />
        <main className="flex-1 px-4 py-8 sm:px-6 overflow-x-hidden">
          <div className="mx-auto max-w-7xl w-full h-full">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
