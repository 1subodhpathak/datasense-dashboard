import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/lib/theme-context";
import { useSidebar } from "@/lib/sidebar-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/profile": "My Portfolio",
  "/profile-edit": "Profile Settings",
  "/my-learnings": "My Learnings",
  "/resources": "Resources",
  "/sql-journey": "My Journey",
  "/battleground": "Battleground",
  "/leaderboard": "Leaderboard",
  "/badges": "Badges & Achievements",
  "/community": "Community",
  "/challenge": "Challenge Arena",
  "/practice-dashboard": "Practice Analytics",
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isCollapsed } = useSidebar();

  const pageTitle = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (ROUTE_TITLES[path]) return ROUTE_TITLES[path];

    const segments = path.split("/").filter(Boolean);
    if (!segments.length) return "Dashboard";

    return segments[segments.length - 1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [location.pathname]);

  const isDark = theme === "dark";

  return (
    <div className={`flex min-h-screen w-full flex-col overflow-hidden transition-colors duration-300 font-sans ${
      isDark ? "bg-[#1D1E23] text-gray-100" : "bg-gray-100 text-gray-900"
    }`}>
      <Navbar />
      <div className="flex w-full flex-1 pt-16">
        <Sidebar />
        <div className={`flex min-h-[calc(100vh-4rem)] flex-1 flex-col transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-64"
        }`}>
          {/* <header className={`sticky top-16 z-30 flex h-20 items-center justify-between px-6 transition-colors duration-300 ${
            isDark ? "text-white" : " text-gray-900"
          }`}>
            <h1 className={`text-3xl font-bold tracking-tight leading-none ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              {pageTitle}
            </h1>
          </header> */}

          <main className={`flex-1 overflow-y-auto ${
            location.pathname === "/sql-journey" 
              ? "bg-[#1D1E23]" 
              : isDark ? "bg-[#1D1E23]" : "bg-gray-100"
          }`}>
            <div className={`mx-auto w-full max-w-7xl px-6 py-6 md:px-8 md:py-8 ${
              location.pathname === "/sql-journey" ? "!bg-[#1D1E23] !text-gray-100" : ""
            }`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
