import { Award, Users, LayoutDashboard, Database, UserRound, BookOpen, FolderOpen, Map, Trophy, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const [showBattlegroundDropdown, setShowBattlegroundDropdown] = useState(false);

    const handleBackToHome = () => {
        window.location.href = "https://practice.datasenseai.com";
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: UserRound, label: "My Portfolio", path: "/portfolio" },
        { icon: BookOpen, label: "My Learnings", path: "/my-learnings" },
        { icon: FolderOpen, label: "Resources", path: "/resources" },
        { icon: Map, label: "My Journey", path: "/sql-journey" },
        {
            icon: Trophy,
            label: "Battleground",
            isDropdown: true,
            dropdownItems: [
                { label: "Battleground", path: "/battleground" },
                { label: "Leaderboard", path: "/leaderboard" },
            ]
        },
        { icon: Award, label: "Badges & Achievements", path: "/badges" },
        { icon: Users, label: "Community", path: "/community" }
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#008B8B] text-white z-50 flex flex-col">
            {/* Logo Section */}
            <div className="flex items-center justify-center px-6 py-6">
                <img 
                    src="/images/logo.png" 
                    alt="DATASENSE Logo" 
                    onClick={handleBackToHome} 
                    className="h-7 md:h-9 cursor-pointer" 
                />
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto px-5 py-4 space-y-1.5 scrollbar-thin">
                {menuItems.map(item => {
                    if (item.isDropdown) {
                        const isDropdownActive = item.dropdownItems?.some(dropItem => 
                            currentPath === dropItem.path || currentPath === dropItem.path.split('?')[0]
                        );
                        return (
                            <div key="battleground-dropdown" className="mb-2">
                                <button
                                    onClick={() => setShowBattlegroundDropdown(!showBattlegroundDropdown)}
                                    className={cn(
                                        "group w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-200 text-left",
                                        isDropdownActive || showBattlegroundDropdown
                                            ? "bg-white/20 text-white shadow-sm"
                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="flex-1 text-[0.9rem] font-semibold tracking-wide">
                                        {item.label}
                                    </span>
                                    {showBattlegroundDropdown ? (
                                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                    )}
                                </button>
                                
                                {showBattlegroundDropdown && (
                                    <div className="mt-1 ml-3 space-y-1.5">
                                        {item.dropdownItems?.map((dropdownItem) => {
                                            const isActive = currentPath === dropdownItem.path || currentPath === dropdownItem.path.split('?')[0];
                                            return (
                                                <Link
                                                    key={dropdownItem.path}
                                                    to={dropdownItem.path}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200",
                                                        isActive
                                                            ? "bg-white/15 text-white font-medium"
                                                            : "text-white/75 hover:bg-white/10 hover:text-white"
                                                    )}
                                                    onClick={() => setShowBattlegroundDropdown(false)}
                                                >
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        isActive ? "bg-dsb-accent" : "bg-white/35"
                                                    )}></div>
                                                    <span>{dropdownItem.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const isActive = currentPath === item.path || currentPath === item.path.split('?')[0];
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "group w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-200",
                                isActive
                                    ? "bg-white/20 text-white font-semibold shadow-sm"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
                            <span className="text-[0.9rem] font-semibold tracking-wide">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Empty space reserved for future quick actions */}
            <div className="px-5 py-6" />
        </aside>
    );
};

export default Sidebar;
