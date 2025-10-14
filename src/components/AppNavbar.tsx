import { Award, Users, LayoutDashboard, BarChart3, Home, Database, UserRound, AppWindow, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { useState } from "react";

const AppNavbar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const [showQuizDropdown, setShowQuizDropdown] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: AppWindow, label: "Practice Dashboard", path: "/practice-dashboard" },
        {
            icon: BarChart3,
            label: "Quiz",
            isDropdown: true,
            dropdownItems: [
                { label: "Practice Questions", path: "https://practice.datasenseai.com/practice-area?subject=sql" },
                { label: "Live Quiz", path: "https://practice.datasenseai.com/live-events" },
                { label: "Custom Test", path: "https://assessment.datasenseai.com/" },
                { label: "Mock Tests", path: "#" },
            ]
        },
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
                        if (item.isDropdown) {
                            return (
                                <div
                                    key="quiz-dropdown"
                                    className="relative group"
                                >
                                    <button
                                        className={cn(
                                            "flex flex-col items-center justify-center rounded-xl transition-all duration-200 p-2 min-w-[60px] group",
                                            showQuizDropdown
                                                ? "bg-[#1f4041] text-white font-bold shadow-lg"
                                                : "hover:bg-dsb-accent/10 hover:text-dsb-accent text-white/70"
                                        )}
                                    >
                                        <item.icon className="size-5 md:size-6 drop-shadow-md" />
                                        <span className="text-xs mt-1 font-medium flex items-center gap-1">
                                            {item.label}
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showQuizDropdown ? 'rotate-180' : ''}`} />
                                        </span>
                                    </button>
                                    
                                    <div className="absolute top-[calc(100%-4px)] left-1/2 transform -translate-x-1/2 pt-4 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="bg-gradient-to-br from-[#1f4041] to-[#008B8B] rounded-xl shadow-lg p-1 backdrop-blur-lg border border-white/10">
                                            {item.dropdownItems.map((dropdownItem) => (
                                                <Link
                                                    key={dropdownItem.path}
                                                    to={dropdownItem.path}
                                                    className="flex items-center gap-2 px-4 py-3 text-sm text-white/90 hover:bg-white/10 rounded-lg transition-all duration-200 group"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-white/30 group-hover:bg-white/90 transition-all duration-200"></div>
                                                    <span className="font-medium">{dropdownItem.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

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
                        // Handle dropdown item differently in mobile view
                        if (item.isDropdown) {
                            return (
                                <div
                                    key="quiz-dropdown"
                                    className="relative"
                                    onClick={() => setShowQuizDropdown(!showQuizDropdown)}
                                >
                                    <button
                                        className={cn(
                                            "flex flex-col items-center justify-center rounded-lg transition-all duration-200 p-1.5 min-w-[40px]",
                                            showQuizDropdown
                                                ? "bg-gradient-to-br from-dsb-accent/30 to-dsb-accent/10 text-dsb-accent"
                                                : "hover:bg-dsb-accent/10 hover:text-dsb-accent text-white/70"
                                        )}
                                    >
                                        <item.icon className="size-4 drop-shadow-md" />
                                    </button>
                                    
                                    {showQuizDropdown && (
                                        <div className="absolute top-full left-0 mt-1 w-48 bg-[#1f4041] rounded-lg shadow-lg py-2 z-50">
                                            {item.dropdownItems.map((dropdownItem) => (
                                                <Link
                                                    key={dropdownItem.path}
                                                    to={dropdownItem.path}
                                                    className="block px-4 py-2 text-sm text-white/70 hover:bg-[#008B8B] hover:text-white transition-colors"
                                                >
                                                    {dropdownItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Regular menu items
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