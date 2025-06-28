import { Sidebar, SidebarContent, SidebarFooter, SidebarMenuButton, SidebarMenuItem, SidebarMenu } from "@/components/ui/sidebar";
import { Award, Users, LayoutDashboard, BarChart3, Home, Database, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";

const AppSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const menuItems = [
        { icon: Home, label: "Start", path: "/start" },
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Database, label: "SQL Journey", path: "/sql-journey" },
        { icon: Users, label: "Community", path: "/community" },
        { icon: BarChart3, label: "Leaderboard", path: "/leaderboard" },
        { icon: Award, label: "Badges & Achievements", path: "/badges" }
    ];

    return (
        <Sidebar
            variant="floating"
            collapsible="icon"
            className="group/sidebar transition-all duration-300 z-50 rounded-xl bg-black/80 border border-[#333333] shadow-xl floating-navbar"
            style={{
                "--sidebar-width-icon": "5rem",
                "--sidebar-width": "5.5rem",
                minHeight: '100vh',
                margin: 0,
                padding: 0
            } as React.CSSProperties}
        >
            <SidebarContent>
                <div className="flex flex-col h-full justify-between py-6 bg-transparent">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-2">
                        <img src="/png/logo.png" alt="Logo" className="h-14 w-14 rounded-lg shadow-lg" />
                    </div>

                    {/* Menu */}
                    <SidebarMenu className="flex flex-col gap-8 items-center flex-1 justify-center">
                        {menuItems.map(item => {
                            const isActive = currentPath === item.path || currentPath === item.path.split('?')[0];
                            return (
                                <SidebarMenuItem key={item.path} className="flex justify-center">
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.label}
                                        isActive={isActive}
                                        className={cn(
                                            "!flex !justify-center !items-center !rounded-xl transition-all duration-200 p-0",
                                            isActive
                                                ? "bg-gradient-to-br from-dsb-accent/30 to-dsb-accent/10 text-dsb-accent shadow-lg"
                                                : "hover:bg-dsb-accent/10 hover:text-dsb-accent"
                                        )}
                                    >
                                        <Link to={item.path} className="flex flex-col items-center">
                                            <item.icon className="!size-6 drop-shadow-md" />
                                            <span className="group-data-[collapsible=icon]:hidden group-hover/sidebar:block text-xs mt-1 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300">
                                                {item.label}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>

                    {/* Footer/Profile */}
                    <SidebarFooter>
                        <div className="flex flex-col items-center w-full pb-2">
                            <SignedIn>
                                <UserButton
                                    afterSignOutUrl='/'
                                    appearance={{
                                        elements: {
                                            avatarBox: 'w-11 h-11 border-2 border-dsb-accent shadow-lg bg-black/60'
                                        }
                                    }}
                                />
                            </SignedIn>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button className="w-11 h-11 rounded-full flex items-center justify-center bg-black/60 border-2 border-dsb-accent shadow-lg mt-2" variant="ghost">
                                        <UserRound className="!w-7 !h-7 text-dsb-accent" />
                                    </Button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </SidebarFooter>
                </div>
            </SidebarContent>
        </Sidebar>
    );
};

export default AppSidebar;