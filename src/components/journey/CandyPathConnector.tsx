
import { cn } from "@/lib/utils";

interface CandyPathConnectorProps {
    color: string;
    direction: "left" | "right" | "up" | "down" | "horizontal" | "vertical" | "up-left" | "up-right" | "down-left" | "down-right";
    isActive: boolean;
    hasBadges?: boolean;
    badgeImages?: string[];
}

const CandyPathConnector = ({
    color,
    direction,
    isActive,
    hasBadges = false,
    badgeImages = []
}: CandyPathConnectorProps) => {
    // Define path data based on direction
    const getPathData = () => {
        switch (direction) {
            case "vertical":
                return "M150 0 L150 150";
            case "horizontal":
                return "M0 75 L300 75";
            case "right":
                return "M0 75 L300 75";
            case "left":
                return "M300 75 L0 75";
            case "up":
                return "M150 150 L150 0";
            case "down":
                return "M150 0 L150 150";
            // Diagonal path directions
            case "up-left":
                return "M300 150 L0 0";
            case "up-right":
                return "M0 150 L300 0";
            case "down-left":
                return "M300 0 L0 150";
            case "down-right":
                return "M0 0 L300 150";
            default:
                return "M150 0 L150 150";
        }
    };

    const pathData = getPathData();

    // Define stroke width based on direction for better visual appearance
    const getStrokeWidth = () => {
        return ["horizontal", "left", "right"].includes(direction) ? "30" : "35";
    };

    const isVertical = ["vertical", "up", "down"].includes(direction);

    return (
        <div className="relative z-0 w-full h-full">
            <svg width="300" height="150" viewBox="0 0 300 150" className="w-full h-full">
                <defs>
                    {/* Enhanced glass morphism effect with multiple gradients */}
                    <linearGradient id={`pipe-gradient-${direction}`} gradientUnits="objectBoundingBox"
                        x1={isVertical ? "0" : "0"}
                        y1={isVertical ? "0" : "0"}
                        x2={isVertical ? "1" : "1"}
                        y2={isVertical ? "1" : "1"}>
                        <stop offset="0%" stopColor={isActive ? "rgba(0, 226, 202, 0.9)" : "rgba(100, 100, 100, 0.4)"} />
                        <stop offset="50%" stopColor={isActive ? "rgba(0, 226, 202, 0.5)" : "rgba(80, 80, 80, 0.2)"} />
                        <stop offset="100%" stopColor={isActive ? "rgba(0, 226, 202, 0.9)" : "rgba(100, 100, 100, 0.4)"} />
                    </linearGradient>

                    {/* Highlighted center line for glass tube effect */}
                    <linearGradient id={`center-line-${direction}`} gradientUnits="objectBoundingBox"
                        x1={isVertical ? "0" : "0"}
                        y1={isVertical ? "0" : "0.5"}
                        x2={isVertical ? "1" : "1"}
                        y2={isVertical ? "1" : "0.5"}>
                        <stop offset="0%" stopColor={isActive ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.3)"} />
                        <stop offset="50%" stopColor={isActive ? "rgba(0, 226, 202, 0.6)" : "rgba(150, 150, 150, 0.2)"} />
                        <stop offset="100%" stopColor={isActive ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.3)"} />
                    </linearGradient>

                    {/* Enhanced outer glow filter */}
                    <filter id={`glow-${direction}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Inner highlight for glass effect */}
                    <linearGradient id={`highlight-${direction}`} gradientUnits="objectBoundingBox"
                        x1={isVertical ? "0" : "0"}
                        y1={isVertical ? "0" : "0"}
                        x2={isVertical ? "1" : "0"}
                        y2={isVertical ? "0" : "1"}>
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                        <stop offset="50%" stopColor="rgba(255, 255, 255, 0.3)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                    </linearGradient>

                    {/* Dotted pattern for texture */}
                    <pattern id={`dots-pattern-${direction}`} width="10" height="10" patternUnits="userSpaceOnUse">
                        <circle cx="5" cy="5" r="1" fill={isActive ? "rgba(0, 226, 202, 0.5)" : "rgba(150, 150, 150, 0.3)"} />
                    </pattern>

                    {/* Glass reflection effect */}
                    <mask id={`glass-mask-${direction}`}>
                        <rect x="0" y="0" width="300" height="150" fill="white" />
                        <path
                            d={pathData}
                            stroke="black"
                            strokeWidth={getStrokeWidth()}
                            fill="none"
                            strokeLinecap="round"
                        />
                    </mask>
                </defs>

                {/* Main glass pipe structure with enhanced effects */}
                <g className="glass-pipe">
                    {/* Outer glow effect for active pipes */}
                    {isActive && (
                        <path
                            d={pathData}
                            fill="none"
                            stroke="rgba(0, 226, 202, 0.4)"
                            strokeWidth={parseInt(getStrokeWidth()) + 15}
                            strokeLinecap="round"
                            filter={`url(#glow-${direction})`}
                            className="animate-pulse-subtle"
                        />
                    )}

                    {/* Main pipe structure */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={`url(#pipe-gradient-${direction})`}
                        strokeWidth={getStrokeWidth()}
                        strokeLinecap="round"
                        className={cn(
                            "transition-all duration-500 backdrop-blur-sm",
                            isActive && "filter"
                        )}
                        style={{
                            filter: isActive ? `url(#glow-${direction})` : "none"
                        }}
                    />

                    {/* Inner pipe structure - for dimensional effect */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={isActive ? "rgba(0, 226, 202, 0.6)" : "rgba(120, 120, 120, 0.4)"}
                        strokeWidth={parseInt(getStrokeWidth()) * 0.6}
                        strokeLinecap="round"
                        className="backdrop-blur-sm"
                    />

                    {/* Center bright line - to give tube effect */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={`url(#center-line-${direction})`}
                        strokeWidth={isVertical ? "8" : "5"}
                        strokeLinecap="round"
                        className={cn("opacity-60", isActive && "opacity-90")}
                    />

                    {/* Dotted pattern overlay for texture */}
                    {isVertical && (
                        <path
                            d={pathData}
                            fill="none"
                            stroke={`url(#dots-pattern-${direction})`}
                            strokeWidth={parseInt(getStrokeWidth()) * 0.7}
                            strokeLinecap="round"
                            strokeDasharray={isActive ? "2 5" : "1 10"}
                            className="opacity-30"
                        />
                    )}

                    {/* Light reflection on edges - glass effect */}
                    {isVertical && (
                        <>
                            <path
                                d={pathData}
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.8)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className={cn("opacity-50", isActive && "opacity-80")}
                                style={{ transform: "translateX(-12px)" }}
                            />
                            <path
                                d={pathData}
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.6)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                className={cn("opacity-50", isActive && "opacity-70")}
                                style={{ transform: "translateX(12px)" }}
                            />
                        </>
                    )}
                </g>

                {/* Energy flowing through the pipe when active */}
                {isActive && isVertical && (
                    <>
                        {/* First energy particle */}
                        <circle className="animate-[float-particle_4s_ease-out_infinite_0.5s]" r="8" fill="rgba(0, 255, 230, 0.8)" filter="url(#glow-inner)">
                            <animateMotion
                                dur="4s"
                                repeatCount="indefinite"
                                path={pathData}
                            />
                        </circle>

                        {/* Second energy particle with different timing */}
                        <circle className="animate-[float-particle_4s_ease-out_infinite_2s]" r="5" fill="rgba(0, 255, 230, 0.6)" filter="url(#glow-inner)">
                            <animateMotion
                                dur="6s"
                                repeatCount="indefinite"
                                path={pathData}
                            />
                        </circle>

                        {/* Third energy particle (smaller) */}
                        <circle className="animate-[float-particle_4s_ease-out_infinite_1s]" r="3" fill="rgba(0, 255, 230, 0.5)" filter="url(#glow-inner)">
                            <animateMotion
                                dur="5s"
                                repeatCount="indefinite"
                                path={pathData}
                            />
                        </circle>

                        {/* Small bubbles for additional detail */}
                        <circle className="animate-[float-particle_3s_ease-out_infinite_0.2s]" r="2" fill="rgba(255, 255, 255, 0.7)" filter="url(#glow-inner)">
                            <animateMotion
                                dur="3s"
                                repeatCount="indefinite"
                                path={pathData}
                            />
                        </circle>

                        <circle className="animate-[float-particle_7s_ease-out_infinite_1.5s]" r="2.5" fill="rgba(255, 255, 255, 0.7)" filter="url(#glow-inner)">
                            <animateMotion
                                dur="7s"
                                repeatCount="indefinite"
                                path={pathData}
                            />
                        </circle>

                        {/* Glow filter for particles */}
                        <filter id="glow-inner" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </>
                )}

                {/* Energy pulse along the pipe */}
                {isActive && isVertical && (
                    <path
                        d={pathData}
                        stroke="rgba(0, 255, 230, 0.7)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray="15 200"
                        opacity="0.8"
                        className="animate-pulse"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            from="215"
                            to="0"
                            dur="4s"
                            repeatCount="indefinite"
                        />
                    </path>
                )}

                {/* Glass edge highlights - for more realism */}
                {isVertical && (
                    <>
                        <path
                            d={pathData}
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="1"
                            fill="none"
                            strokeDasharray="3 15"
                            strokeLinecap="round"
                            style={{ transform: "translateX(-15px)" }}
                        />
                        <path
                            d={pathData}
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="1"
                            fill="none"
                            strokeDasharray="3 15"
                            strokeLinecap="round"
                            style={{ transform: "translateX(15px)" }}
                        />
                    </>
                )}
            </svg>
        </div>
    );
};

export default CandyPathConnector;
