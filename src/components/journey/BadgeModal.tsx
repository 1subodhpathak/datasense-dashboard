import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { X, CheckCircle2, Lock, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Milestone, Badge } from "@/data/sql-journey";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface BadgeModalProps {
    open: boolean;
    onClose: () => void;
    milestone: Milestone | null;
}

const BadgeModal: React.FC<BadgeModalProps> = ({ open, onClose, milestone }) => {
    if (!milestone) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto neo-glass-dark bg-black/90 border border-dsb-accent/30">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl text-white">
                        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center border border-dsb-accent">
                            <milestone.icon className="text-dsb-accent" size={24} />
                        </div>
                        <div>
                            <span className="text-dsb-accent">{milestone.title}</span>
                            <p className="text-sm font-normal text-dsb-neutral1 mt-1">{milestone.description}</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex justify-between items-center my-4">
                    <span className="text-white">Milestone Progress</span>
                    <span className="text-dsb-accent font-bold">{milestone.progress}%</span>
                </div>

                <Progress
                    value={milestone.progress}
                    className="h-2 bg-dsb-neutral3/50"
                >
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,rgba(0,226,202,0.8)_0%,transparent_70%)]"></div>
                    </div>
                </Progress>

                <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl text-white font-medium">Available Badges</h3>
                        <Button variant="outline" size="sm" asChild className="border-dsb-accent text-dsb-accent hover:bg-dsb-accent/10">
                            <Link to="/badges" className="flex items-center gap-2">
                                <Award size={16} />
                                See All Badges
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {milestone.badges.map((badge, idx) => (
                            <BadgeCard key={badge.id} badge={badge} idx={idx} />
                        ))}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-dsb-neutral1 hover:text-white"
                >
                    <X size={20} />
                </button>
            </DialogContent>
        </Dialog>
    );
};

interface BadgeCardProps {
    badge: Badge;
    idx?: number;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, idx }) => {
    const isLocked = badge.progress === 0;
    const isComplete = badge.progress === 100;
    // Use badge image for the first three badges
    const badgeIdx = idx ?? 0;
    const badgeImage = badgeIdx < 3 ? `/badge final png/${2 + badgeIdx}.png` : undefined;

    return (
        <div className={cn(
            "flex flex-col items-center p-4 rounded-lg",
            "border transition-all relative overflow-hidden",
            isComplete
                ? "border-amber-500/60 neo-glass"
                : isLocked
                    ? "border-gray-700 bg-black/40"
                    : "border-dsb-accent/40 neo-glass"
        )}>
            <div className="relative mb-4 w-28 h-28">
                <div className={cn(
                    "w-full h-full rounded-full flex items-center justify-center overflow-hidden",
                    isComplete
                        ? "border-2 border-amber-500"
                        : isLocked
                            ? "border-2 border-gray-600"
                            : "border-2 border-dsb-accent/80"
                )}>
                    {badgeImage ? (
                        <img src={badgeImage} alt={badge.name} className={cn(
                            "w-full h-full object-contain",
                            isLocked && "opacity-50 grayscale"
                        )} />
                    ) : (
                        <div className={cn(
                            "w-full h-full rounded-full bg-gradient-to-br flex items-center justify-center",
                            isComplete
                                ? "from-amber-500 to-orange-600"
                                : isLocked
                                    ? "from-gray-700 to-gray-800"
                                    : "from-blue-400 to-cyan-600"
                        )}>
                            <badge.icon size={36} className={cn(
                                isComplete
                                    ? "text-white"
                                    : isLocked
                                        ? "text-gray-500"
                                        : "text-white"
                            )} />
                        </div>
                    )}
                    {/* Badge status indicator */}
                    {isComplete ? (
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                            <CheckCircle2 size={18} />
                        </div>
                    ) : isLocked ? (
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <Lock size={18} className="text-gray-400" />
                        </div>
                    ) : null}
                    {/* Progress circle for in-progress badges */}
                    {!isComplete && !isLocked && (
                        <svg className="absolute w-full h-full -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="48%"
                                stroke="rgba(0, 226, 202, 0.7)"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${badge.progress * 3.02} ${(100 - badge.progress) * 3.02}`}
                                strokeLinecap="round"
                            />
                        </svg>
                    )}
                </div>
            </div>
            <h4 className={cn(
                "text-center font-medium text-base",
                isComplete ? "text-amber-400" : isLocked ? "text-gray-500" : "text-white"
            )}>
                {badge.name}
            </h4>
            <p className={cn(
                "text-center text-sm mt-2 mb-3",
                isLocked ? "text-gray-600" : "text-dsb-neutral1"
            )}>
                {badge.condition}
            </p>
            <div className="w-full mt-auto">
                <div className="flex items-center justify-between text-xs text-dsb-neutral1 mb-1">
                    <span>{badge.currentValue}</span>
                    <span>{badge.requiredValue}</span>
                </div>
                <Progress
                    value={badge.progress}
                    className={cn(
                        "h-1.5 bg-dsb-neutral3/30",
                        isComplete && "bg-amber-900/30"
                    )}
                    indicatorClassName={isComplete ? "bg-amber-500" : undefined}
                />
            </div>
            {/* Locked overlay */}
            {isLocked && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="text-center">
                        <Lock size={30} className="mx-auto mb-2 text-gray-500" />
                        <p className="text-sm text-gray-400">Complete previous badges first</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to map badge IDs to images - updated with newly uploaded CTE Master badge images
const getBadgeImagePath = (badge: Badge): string => {
    const badgeImageMap: Record<string, string> = {
        // Query Explorer - keep these as they are
        "sql-freshman": "/lovable-uploads/5a5c8059-fada-4396-93e4-07063e40a868.png",
        "battle-beginner": "/lovable-uploads/b2c0d5dd-de06-4329-9ccf-7bf284ef14a6.png",
        "sql-streak-5": "/lovable-uploads/f1df1141-d094-4b30-bcc0-8bc525e94692.png",

        // Filter Freak - keep these as they are
        "pro-finder": "/lovable-uploads/4b38675f-1213-421a-beed-8ffdf3e68f61.png",
        "battle-challenger": "/lovable-uploads/57ce37d6-668e-416f-9945-b029156a1850.png",
        "fast-hands": "/lovable-uploads/a8425f1e-e7ef-4951-b575-64f2bbf7c4cd.png",

        // Aggregation Guru - keep these as they are
        "aggregation-pro": "/lovable-uploads/78590513-d4e0-4196-b5c4-08960c772333.png",
        "warrior": "/lovable-uploads/d461f0f9-3b4d-4743-8473-ad433b8ff309.png",
        "sql-streak-10": "/lovable-uploads/10a9dc4e-2fba-40d3-943b-674620cde924.png",

        // Join Ninja - keep these as they are
        "joins-samurai": "/lovable-uploads/4b67d408-4c54-40f9-94df-f4ce1cf10382.png",
        "join-combatant": "/lovable-uploads/eb20871f-ee24-4807-9c03-9fc985fc8482.png",
        "join-grandmaster": "/lovable-uploads/58bb3ea6-38b8-4dc8-b824-cb2a3080fb8f.png",

        // Subquery Slayer - keep these as they are
        "battle-commander": "/lovable-uploads/974d6f75-93cd-4d6d-b6b3-fcec1a624ca4.png",
        "social-person": "/lovable-uploads/c74fa920-f653-4d87-9e1e-b756edff7b39.png",
        "deep-thinker": "/lovable-uploads/577cc006-0c15-4dd5-a8bf-ff589a8b4e18.png",

        // Case Solver - keep these as they are
        "gladiator": "/lovable-uploads/ebfd1079-d6bb-47de-8f56-e1b2733548bc.png",
        "conditional-thinker": "/lovable-uploads/da799a38-d6ad-4803-b5d1-a8fb73d36ff5.png",
        "veteran": "/lovable-uploads/b34d98e4-f6fd-417c-b1c3-1b9543f16035.png",

        // Window Wizard - keep these as they are
        "rank-ruler": "/lovable-uploads/9af4aee2-dca1-4e2e-8ca8-08af5bc9a88e.png",
        "window-watcher": "/lovable-uploads/bb22d758-3765-4c16-8aa0-7f4c1a3e43ec.png",
        "sql-streak-15": "/lovable-uploads/a2c4f1cc-59f1-4bae-95a5-997c57626b46.png",

        // CTE Master - updated with the newly uploaded images
        "architect": "/lovable-uploads/fb5c77f9-25bf-495c-b5fa-b0fc722b1845.png",
        "with-wizard": "/lovable-uploads/100671b8-e24a-4c08-b345-8293bd646a35.png",
        "sql-streak-25": "/lovable-uploads/f655e7d2-311d-48c8-a3a8-b00ef8b5dccc.png",

        // SQL Lord - keep these as they are
        "battle-titan": "/lovable-uploads/928f98cd-d834-4e90-b8b8-b0fae004440b.png",
        "sql-marathoner": "/lovable-uploads/706d8e6a-8edc-4099-93a2-aedd3d872ff9.png",
        "sql-slayer": "/lovable-uploads/fe08b307-2a8a-4f2f-a0df-c3155261425d.png",
        "database-warrior": "/lovable-uploads/62267e1b-3b68-4c58-8efb-857170f3e2ab.png",
        "data-overlord": "/lovable-uploads/8154fb29-6592-491a-8b34-adc7001794ef.png",
        "mastermind": "/lovable-uploads/13955302-a4fe-4ac8-aeec-6e8c92fb0677.png",
        "game-changer": "/lovable-uploads/4501a58a-9837-46ed-9695-42eb4ebf5f8e.png",
        "cult": "/lovable-uploads/44a4310d-1d7e-4f5a-b63a-b623b3da4822.png",
        "influencer": "/lovable-uploads/5e0faec3-6b54-4a91-ba7f-8bd11e5eb601.png",
    };

    return badgeImageMap[badge.id] || "";
};

export default BadgeModal;
