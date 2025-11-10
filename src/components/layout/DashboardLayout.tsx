import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { useTheme } from "@/lib/theme-context";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

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
    <div className="flex min-h-screen w-full overflow-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-[#0d0f10] dark:text-slate-100">
      <Sidebar />
      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-[#008B8B] px-6 text-white">
          <h1 className="text-3xl font-bold tracking-tight text-slate-50 leading-none">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full border border-white/20 text-white hover:bg-white/15"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border border-white/40 bg-[#006f6f]",
                    userButtonPopoverCard: "bg-white dark:bg-slate-900 border border-white/20 dark:border-slate-700",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-white hover:bg-white/15" variant="ghost">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
