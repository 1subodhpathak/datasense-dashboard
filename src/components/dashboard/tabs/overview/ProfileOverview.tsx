import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { FaFire } from "react-icons/fa";

interface StatsCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
}

const StatsCard = ({ label, value, icon }: StatsCardProps) => {
    let displayIcon = icon;
    if (label.toLowerCase() === 'streak') {
        displayIcon = <img src="/png/streak.png" alt="Streak" className="h-7 w-7" />;
    }
    return (
        <div className="neo-glass-dark border border-white/20 rounded-xl p-5 flex flex-col gap-2 shadow-md transition-all duration-300 h-32 justify-center">
            <span className="text-xs text-dsb-neutral2 font-medium mb-1 tracking-wide uppercase">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-4xl font-extrabold text-white">{value}</span>
                {displayIcon && <div>{displayIcon}</div>}
            </div>
        </div>
    );
};

interface LeaderboardEntryProps {
    rank: number;
    name: string;
    points: number;
    avatar: string;
    isCurrentUser?: boolean;
}

const LeaderboardEntry = ({ rank, name, points, avatar, isCurrentUser }: LeaderboardEntryProps) => (
    <div className={cn(
        "flex items-center justify-between py-2 px-3 rounded-lg",
        isCurrentUser ? "bg-[#00E2CA]/5 border border-[#00E2CA]/10" : "hover:bg-[#1e2435]/90 transition-colors duration-300"
    )}>
        <div className="flex items-center gap-3">
            <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
            <div>
                <p className="font-medium text-white text-sm">{name}</p>
                <p className="text-xs text-gray-400">Points: {points.toLocaleString()}</p>
            </div>
        </div>
        <span className={cn(
            "text-sm",
            isCurrentUser ? "text-[#00E2CA]/80" : "text-gray-400"
        )}>#{rank}</span>
    </div>
);

const Calendar = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();

    return (
        <div className="neo-glass-dark border border-white/20 rounded-xl p-6 flex flex-col gap-2 shadow-md">
            <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold text-lg">Mon, Aug 17</div>
            </div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-white text-sm font-medium">{currentMonth} {currentYear}</span>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-dsb-accent/10">
                        <ChevronLeft className="h-4 w-4 text-dsb-neutral2 hover:text-dsb-accent" />
                    </Button>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-dsb-accent/10">
                        <ChevronRight className="h-4 w-4 text-dsb-neutral2 hover:text-dsb-accent" />
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {days.map((day, i) => (
                    <div key={i} className="text-dsb-neutral2 text-xs py-1 font-semibold">{day}</div>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8 w-8" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <div
                        key={day}
                        className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center text-xs mx-auto transition-all duration-300 font-semibold",
                            day === currentDay && "bg-dsb-accent text-black shadow-lg",
                            day === 2 && "bg-dsb-accent/20 text-dsb-accent font-bold",
                            day < currentDay && "text-dsb-neutral3",
                            day > currentDay && "text-white hover:bg-dsb-accent/10 cursor-pointer"
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
};

interface ProfileOverviewProps {
    stats: Array<{ title: string; value: string; icon: string | null }>;
    leaderboardHighlights: Array<{
        rank: number;
        name: string;
        points: number;
        avatar: string;
    }>;
}

export function ProfileOverview({ stats, leaderboardHighlights }: ProfileOverviewProps) {
    // Debug logging
    console.log("ProfileOverview rendering with stats:", stats);
    console.log("ProfileOverview rendering with leaderboard:", leaderboardHighlights);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                {stats.map((stat, index) => {
                    console.log("Rendering stat:", stat);
                    return (
                        <StatsCard
                            key={index}
                            label={stat.title}
                            value={stat.value}
                            icon={stat.icon ? <FaFire /> : undefined}
                        />
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {/* Calendar Section */}
                <Calendar />

                {/* Leaderboard Section */}
                <div className="neo-glass-dark border border-white/20 rounded-xl p-6 flex flex-col gap-2 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-white text-lg font-semibold">Leaderboard Highlights</h2>
                            <p className="text-dsb-neutral2 text-xs">See Who's on Top!</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {leaderboardHighlights.map((entry, index) => {
                            console.log("Rendering leaderboard entry:", entry);
                            return (
                                <LeaderboardEntry
                                    key={index}
                                    rank={entry.rank}
                                    name={entry.name}
                                    points={entry.points}
                                    avatar={entry.avatar}
                                    isCurrentUser={entry.name === "You"}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
} 