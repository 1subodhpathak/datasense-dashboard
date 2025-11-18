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
        <div className="neo-glass rounded-2xl p-5 flex flex-col gap-2 transition-all duration-300 h-32 justify-center">
            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-1 tracking-wide uppercase">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">{value}</span>
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
        "flex items-center justify-between py-2 px-3 rounded-xl bg-white dark:bg-[#32363C] transition-colors duration-300",
        isCurrentUser ? "bg-cyan-600/10 dark:bg-cyan-500/10 border border-cyan-600/20 dark:border-cyan-500/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
    )}>
        <div className="flex items-center gap-3">
            <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
            <div>
                <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Points: {points.toLocaleString()}</p>
            </div>
        </div>
        <span className={cn(
            "text-sm font-semibold",
            isCurrentUser ? "text-cyan-600 dark:text-cyan-400" : "text-gray-600 dark:text-gray-300"
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
        <div className="neo-glass rounded-3xl p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
                <div className="text-gray-800 dark:text-gray-100 font-semibold text-lg">{currentDay} {currentMonth} {currentYear}</div>
            </div>
            {/* <div className="mb-2 flex items-center justify-between"> */}
                {/* <span className="text-gray-800 dark:text-gray-100 text-sm font-medium">{currentMonth} {currentYear}</span> */}
                {/* <div className="flex items-center gap-1">
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-cyan-600/10 dark:hover:bg-cyan-500/10">
                        <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400" />
                    </Button>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-cyan-600/10 dark:hover:bg-cyan-500/10">
                        <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400" />
                    </Button>
                </div> */}
            {/* </div> */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {days.map((day, i) => (
                    <div key={i} className="text-gray-600 dark:text-gray-300 text-xs py-1 font-semibold">{day}</div>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8 w-8" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <div
                        key={day}
                        className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center text-xs mx-auto transition-all duration-300 font-semibold",
                            day === currentDay && "bg-cyan-600 dark:bg-cyan-500 text-white shadow-lg",
                            day === 2 && "bg-cyan-600/20 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold",
                            day < currentDay && "text-gray-400 dark:text-gray-500",
                            day > currentDay && "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar Section */}
                {/* <Calendar /> */}

                {/* Leaderboard Section */}
                {/* <div className="neo-glass rounded-3xl p-6 flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-gray-800 dark:text-gray-100 text-lg font-semibold">Leaderboard Highlights</h2>
                            <p className="text-gray-600 dark:text-gray-300 text-xs">See Who's on Top!</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {leaderboardHighlights.length > 0 ? (
                            leaderboardHighlights.map((entry, index) => {
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
                            })
                        ) : (
                            <div className="rounded-xl bg-white dark:bg-[#32363C] p-6 text-center text-sm text-gray-600 shadow-sm dark:text-gray-300">
                                No leaderboard data available.
                            </div>
                        )}
                    </div>
                </div> */}
            </div>
        </div>
    );
} 