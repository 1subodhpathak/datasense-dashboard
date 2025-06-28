
import React from "react";
import { cn } from "@/lib/utils";

interface FinalMilestoneProps {
    badgeImage: string;
    title: string;
    progress: number;
    onClick: () => void;
}

const FinalMilestone: React.FC<FinalMilestoneProps> = ({
    badgeImage,
    title,
    progress,
    onClick
}) => {
    return (
        <div
            className="flex flex-col items-center mb-10 cursor-pointer"
            onClick={onClick}
        >
            <div className="relative w-36 h-36 md:w-48 md:h-48">
                {/* Glow effect */}
                <div
                    className="absolute w-full h-full rounded-full opacity-30"
                    style={{
                        background: "radial-gradient(circle, rgba(255,215,0,0.7) 0%, transparent 70%)",
                        filter: "blur(8px)",
                    }}
                />

                {/* Badge container with golden gradient */}
                <div className="absolute w-full h-full rounded-full p-1.5 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600">
                    {/* Inner black circle with badge image */}
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden p-4">
                        <img
                            src={badgeImage}
                            alt="SQL Lord Badge"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Animated particles around the badge */}
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute"
                            style={{
                                top: `${50 + 45 * Math.sin(i * Math.PI / 6)}%`,
                                left: `${50 + 45 * Math.cos(i * Math.PI / 6)}%`,
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                backgroundColor: i % 2 === 0 ? "#FFD700" : "#FFF",
                                boxShadow: i % 2 === 0 ? "0 0 4px 2px rgba(255, 215, 0, 0.7)" : "0 0 4px 2px rgba(255, 255, 255, 0.7)",
                                transform: "translate(-50%, -50%)",
                                animation: `pulse ${1 + i % 5}s infinite alternate ${i * 0.1}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Badge title with golden text and shadow */}
            <h3
                className={cn(
                    "text-center font-bold mt-3 text-base md:text-xl",
                    progress > 0 ? "text-amber-300" : "text-amber-300"
                )}
                style={{
                    textShadow: "0 0 5px rgba(255, 215, 0, 0.8)"
                }}
            >
                {title}
            </h3>
        </div>
    );
};

export default FinalMilestone;
