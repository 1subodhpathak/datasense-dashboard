import React from "react";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { milestones } from "@/data/sql-journey";

interface MilestoneRowProps {
    position: "left" | "right" | "center";
    badgeImage: string;
    title: string;
    progress: number;
    isActive: boolean;
    isLast?: boolean;
    id: string;
    onClick: (id: string) => void;
}

const MilestoneRow = ({
    position,
    badgeImage,
    title,
    progress,
    isActive,
    isLast = false,
    id,
    onClick
}: MilestoneRowProps) => {
    const isLeft = position === "left";
    const isCenter = position === "center";
    const completionText = progress === 0
        ? "Locked"
        : progress === 100
            ? "100% Complete"
            : `${progress}% Complete`;

    // Find the milestone data to get its badges
    const milestone = milestones.find(m => m.id === id);
    const badges = milestone ? milestone.badges : [];

    const hoverCardSide = isCenter ? "bottom" : isLeft ? "right" : "left";

    const handleMilestoneClick = () => {
        onClick(id);
    };

    return (
        <div className={cn(
            "grid w-full",
            isCenter
                ? "grid-cols-1 place-items-center mb-6 md:mb-8"
                : "grid-cols-1 md:grid-cols-12 mb-6 md:mb-8"
        )}>
            {isCenter ? (
                <div className="flex justify-center">
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <div
                                className="relative cursor-pointer"
                                onClick={handleMilestoneClick}
                            >
                                <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 mx-auto">
                                    {/* Circular progress bar */}
                                    {progress > 0 && progress < 100 && (
                                        <svg className="absolute w-full h-full -rotate-90">
                                            <circle
                                                cx="50%"
                                                cy="50%"
                                                r="48%"
                                                stroke="rgba(0, 226, 202, 0.7)"
                                                strokeWidth="4"
                                                fill="none"
                                                strokeDasharray={`${progress * 3.02} ${(100 - progress) * 3.02}`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    )}

                                    {/* Complete milestone - full circle */}
                                    {progress === 100 && (
                                        <svg className="absolute w-full h-full -rotate-90">
                                            <circle
                                                cx="50%"
                                                cy="50%"
                                                r="48%"
                                                stroke="rgba(255, 170, 0, 0.7)"
                                                strokeWidth="4"
                                                fill="none"
                                                strokeDasharray="302"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    )}

                                    <div className={cn(
                                        "absolute w-full h-full rounded-full",
                                        "p-1 shadow-lg transform hover:scale-105 transition-all duration-300",
                                        progress > 0
                                            ? progress === 100
                                                ? "bg-gradient-to-br from-amber-400 to-orange-600"
                                                : "bg-gradient-to-br from-blue-400 to-cyan-600"
                                            : "bg-gradient-to-br from-gray-600 to-gray-800 opacity-70"
                                    )}>
                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden p-3">
                                            <img
                                                src={badgeImage}
                                                alt={`${title} Badge`}
                                                className={cn(
                                                    "w-full h-full object-contain",
                                                    progress === 0 && "opacity-50"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <h3 className={cn(
                                    "text-center font-bold mt-3",
                                    "text-sm md:text-base",
                                    progress > 0 ? "text-white" : "text-gray-500"
                                )}>
                                    {title}
                                </h3>
                                <div className="text-center text-dsb-neutral1 text-xs md:text-sm">
                                    {completionText}
                                </div>
                            </div>
                        </HoverCardTrigger>
                        <HoverCardContent side={hoverCardSide} className="neo-glass-dark border border-white/10 w-64 md:w-80 p-4">
                            <h3 className="text-white font-bold mb-2">{title}</h3>
                            <div className="text-dsb-neutral1 mb-4">
                                {milestone?.description}
                            </div>
                            <div className="space-y-3">
                                {badges.map((badge) => (
                                    <div key={badge.id} className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-black/60 flex items-center justify-center">
                                            <badge.icon size={16} className="text-dsb-neutral1" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-white">{badge.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Progress value={badge.progress} className="h-1 flex-1 bg-dsb-neutral3/50" />
                                                <span className="text-xs text-dsb-neutral1">
                                                    {badge.currentValue}/{badge.requiredValue}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>
            ) : isLeft ? (
                <>
                    <div className="col-span-6 md:col-span-4 flex justify-center md:justify-end order-1 md:order-1">
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <div
                                    className="relative cursor-pointer"
                                    onClick={handleMilestoneClick}
                                >
                                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 mx-auto">
                                        {/* Circular progress bar */}
                                        {progress > 0 && progress < 100 && (
                                            <svg className="absolute w-full h-full -rotate-90">
                                                <circle
                                                    cx="50%"
                                                    cy="50%"
                                                    r="48%"
                                                    stroke="rgba(0, 226, 202, 0.7)"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeDasharray={`${progress * 3.02} ${(100 - progress) * 3.02}`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        )}

                                        {/* Complete milestone - full circle */}
                                        {progress === 100 && (
                                            <svg className="absolute w-full h-full -rotate-90">
                                                <circle
                                                    cx="50%"
                                                    cy="50%"
                                                    r="48%"
                                                    stroke="rgba(255, 170, 0, 0.7)"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeDasharray="302"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        )}

                                        <div className={cn(
                                            "absolute w-full h-full rounded-full",
                                            "p-1 shadow-lg transform hover:scale-105 transition-all duration-300",
                                            progress > 0
                                                ? progress === 100
                                                    ? "bg-gradient-to-br from-amber-400 to-orange-600"
                                                    : "bg-gradient-to-br from-blue-400 to-cyan-600"
                                                : "bg-gradient-to-br from-gray-600 to-gray-800 opacity-70"
                                        )}>
                                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden p-3">
                                                <img
                                                    src={badgeImage}
                                                    alt={`${title} Badge`}
                                                    className={cn(
                                                        "w-full h-full object-contain",
                                                        progress === 0 && "opacity-50"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className={cn(
                                        "text-center font-bold mt-3",
                                        "text-sm md:text-base",
                                        progress > 0 ? "text-white" : "text-gray-500"
                                    )}>
                                        {title}
                                    </h3>
                                    <div className="text-center text-dsb-neutral1 text-xs md:text-sm">
                                        {completionText}
                                    </div>
                                </div>
                            </HoverCardTrigger>
                            <HoverCardContent side={hoverCardSide} className="neo-glass-dark border border-white/10 w-64 md:w-80 p-4">
                                <h3 className="text-white font-bold mb-2">{title}</h3>
                                <div className="text-dsb-neutral1 mb-4">
                                    {milestone?.description}
                                </div>
                                <div className="space-y-3">
                                    {badges.map((badge) => (
                                        <div key={badge.id} className="flex items-center gap-2">
                                            <div className="size-8 rounded-full bg-black/60 flex items-center justify-center">
                                                <badge.icon size={16} className="text-dsb-neutral1" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-white">{badge.name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Progress value={badge.progress} className="h-1 flex-1 bg-dsb-neutral3/50" />
                                                    <span className="text-xs text-dsb-neutral1">
                                                        {badge.currentValue}/{badge.requiredValue}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    </div>

                    <div className="col-span-6 md:col-span-8 order-2 md:order-2">
                        {/* Path connector removed */}
                    </div>
                </>
            ) : (
                <>
                    <div className="col-span-6 md:col-span-8 order-2 md:order-1">
                        {/* Path connector removed */}
                    </div>

                    <div className="col-span-6 md:col-span-4 flex justify-center md:justify-start order-1 md:order-2">
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <div
                                    className="relative cursor-pointer"
                                    onClick={handleMilestoneClick}
                                >
                                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 mx-auto">
                                        {/* Circular progress bar */}
                                        {progress > 0 && progress < 100 && (
                                            <svg className="absolute w-full h-full -rotate-90">
                                                <circle
                                                    cx="50%"
                                                    cy="50%"
                                                    r="48%"
                                                    stroke="rgba(0, 226, 202, 0.7)"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeDasharray={`${progress * 3.02} ${(100 - progress) * 3.02}`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        )}

                                        {/* Complete milestone - full circle */}
                                        {progress === 100 && (
                                            <svg className="absolute w-full h-full -rotate-90">
                                                <circle
                                                    cx="50%"
                                                    cy="50%"
                                                    r="48%"
                                                    stroke="rgba(255, 170, 0, 0.7)"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeDasharray="302"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        )}

                                        <div className={cn(
                                            "absolute w-full h-full rounded-full",
                                            "p-1 shadow-lg transform hover:scale-105 transition-all duration-300",
                                            progress > 0
                                                ? progress === 100
                                                    ? "bg-gradient-to-br from-amber-400 to-orange-600"
                                                    : "bg-gradient-to-br from-blue-400 to-cyan-600"
                                                : "bg-gradient-to-br from-gray-600 to-gray-800 opacity-70"
                                        )}>
                                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden p-3">
                                                <img
                                                    src={badgeImage}
                                                    alt={`${title} Badge`}
                                                    className={cn(
                                                        "w-full h-full object-contain",
                                                        progress === 0 && "opacity-50"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className={cn(
                                        "text-center font-bold mt-3",
                                        "text-sm md:text-base",
                                        progress > 0 ? "text-white" : "text-gray-500"
                                    )}>
                                        {title}
                                    </h3>
                                    <div className="text-center text-dsb-neutral1 text-xs md:text-sm">
                                        {completionText}
                                    </div>
                                </div>
                            </HoverCardTrigger>
                            <HoverCardContent side={hoverCardSide} className="neo-glass-dark border border-white/10 w-64 md:w-80 p-4">
                                <h3 className="text-white font-bold mb-2">{title}</h3>
                                <div className="text-dsb-neutral1 mb-4">
                                    {milestone?.description}
                                </div>
                                <div className="space-y-3">
                                    {badges.map((badge) => (
                                        <div key={badge.id} className="flex items-center gap-2">
                                            <div className="size-8 rounded-full bg-black/60 flex items-center justify-center">
                                                <badge.icon size={16} className="text-dsb-neutral1" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-white">{badge.name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Progress value={badge.progress} className="h-1 flex-1 bg-dsb-neutral3/50" />
                                                    <span className="text-xs text-dsb-neutral1">
                                                        {badge.currentValue}/{badge.requiredValue}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    </div>
                </>
            )}
        </div>
    );
};

export default MilestoneRow;
