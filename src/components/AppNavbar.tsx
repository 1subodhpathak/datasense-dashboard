import { Award, Users, LayoutDashboard, BarChart3, Home, Database, UserRound, AppWindow } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";

const AppNavbar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: AppWindow, label: "Practice Dashboard", path: "/practice-dashboard" },
        { icon: Database, label: "SQL Journey", path: "/sql-journey" },
        { icon: Users, label: "Community", path: "/community" },
        { icon: BarChart3, label: "Leaderboard", path: "/leaderboard" },
        { icon: Award, label: "Badges & Achievements", path: "/badges" }
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#008B8B] backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between px-6 h-20">
                {/* Logo - Left */}
                <div className="flex items-center">
                    <img src="/images/logo.png" alt="Logo" className="h-7 md:h-9 " />
                </div>

                {/* Navigation Links - Center */}
                <div className="hidden md:flex items-center gap-2 lg:gap-4">
                    {menuItems.map(item => {
                        const isActive = currentPath === item.path || currentPath === item.path.split('?')[0];
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-xl transition-all duration-200 p-2 min-w-[60px] group",
                                    isActive
                                        ? "bg-[#1f4041] text-white font-bold shadow-lg"
                                        : "hover:bg-dsb-accent/10 hover:text-dsb-accent text-white/70"
                                )}
                            >
                                <item.icon className="size-5 md:size-6 drop-shadow-md" />
                                <span className="text-xs mt-1 font-medium">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Navigation - Center (when desktop nav is hidden) */}
                <div className="flex md:hidden items-center gap-1">
                    {menuItems.slice(0, 4).map(item => {
                        const isActive = currentPath === item.path || currentPath === item.path.split('?')[0];
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-lg transition-all duration-200 p-1.5 min-w-[40px]",
                                    isActive
                                        ? "bg-gradient-to-br from-dsb-accent/30 to-dsb-accent/10 text-dsb-accent"
                                        : "hover:bg-dsb-accent/10 hover:text-dsb-accent text-white/70"
                                )}
                            >
                                <item.icon className="size-4 drop-shadow-md" />
                            </Link>
                        );
                    })}
                </div>

                {/* Profile - Right */}
                <div className="flex items-center">
                    <SignedIn>
                        <UserButton
                            afterSignOutUrl='/'
                            appearance={{
                                elements: {
                                    avatarBox: 'w-9 h-9 md:w-11 md:h-11 border-2 border-dsb-accent shadow-lg bg-black/60'
                                }
                            }}
                        />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-black/60 border-2 border-dsb-accent shadow-lg" variant="ghost">
                                <UserRound className="w-5 h-5 md:w-7 md:h-7 text-dsb-accent" />
                            </Button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>
        </nav>
    );
};

export default AppNavbar; 