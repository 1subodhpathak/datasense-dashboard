import React from "react";
import { milestones } from "@/data/sql-journey";
import { useIsMobile } from "@/hooks/use-mobile";

interface SqlJourneyRoadmapProps {
    onMilestoneClick?: (id: string) => void;
}

// Add upper margin by increasing y values
const getNodePositions = (isMobile: boolean) => {
    // Adjust positions for mobile
    if (isMobile) {
        return [
            { x: 150, y: 200 },
            { x: 150, y: 500 },
            { x: 150, y: 800 },
            { x: 150, y: 1100 },
            { x: 150, y: 1400 },
            { x: 150, y: 1700 },
            { x: 150, y: 2000 },
            { x: 150, y: 2300 },
            { x: 150, y: 2650 },
        ];
    }

    // Desktop positions with zigzag pattern
    return [
        { x: 120, y: 200 },
        { x: 680, y: 600 },
        { x: 120, y: 1000 },
        { x: 680, y: 1400 },
        { x: 120, y: 1800 },
        { x: 680, y: 2200 },
        { x: 120, y: 2600 },
        { x: 680, y: 3000 },
        { x: 400, y: 3700 }, // Centered for SQL Lord, closer to bottom
    ];
};

// Responsive sizing based on screen size
const getNodeSize = (isMobile: boolean) => isMobile ? 150 : 210;
const getBadgeSize = (isMobile: boolean) => isMobile ? 30 : 38;

const borderWidth = 4;
const pipeOuter = 28;
const pipeInner = 18;
const pipeHighlight = 6;
const pipeEdge = 2;
const particleRadius = 10;

const BADGE_IMAGE_FILES = [
    '2.png', '3.png', '4.png', '6.png', '7.png', '8.png', '10.png', '11.png', '12.png',
    '14.png', '15.png', '16.png', '18.png', '19.png', '20.png', '22.png', '23.png', '24.png',
    '26.png', '27.png', '28.png', '30.png', '31.png', '32.png', '34.png', '35.png', '36.png',
    '37.png', '38.png', '39.png', '40.png', '41.png', '42.png',
];

// Helper to convert hex color to rgba
function hexToRgba(hex: string, alpha: number) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    if (c.length === 6) {
        return `rgba(${parseInt(c.slice(0, 2), 16)},${parseInt(c.slice(2, 4), 16)},${parseInt(c.slice(4, 6), 16)},${alpha})`;
    }
    return `rgba(0,226,202,${alpha})`; // fallback teal
}

const SqlJourneyRoadmap: React.FC<SqlJourneyRoadmapProps> = ({ onMilestoneClick }) => {
    const isMobile = useIsMobile();
    const nodePositions = getNodePositions(isMobile);
    const nodeSize = getNodeSize(isMobile);
    const badgeSize = getBadgeSize(isMobile);

    // Calculate height based on positions
    const svgHeight = isMobile ? 3000 : 4000;
    const svgWidth = isMobile ? 300 : 800;

    const nodes = milestones.slice(0, nodePositions.length).map((milestone, i) => ({
        ...milestone,
        ...nodePositions[i],
    }));

    // Generate a smooth SVG path connecting all nodes
    const pathData = nodes.reduce((acc, node, i, arr) => {
        if (i === 0) return `M ${node.x} ${node.y}`;
        const prev = arr[i - 1];
        // Control points for smoother curves
        const midY = (prev.y + node.y) / 2;
        const c1x = prev.x;
        const c1y = midY;
        const c2x = node.x;
        const c2y = midY;
        return acc + ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${node.x} ${node.y}`;
    }, "");

    // Gradient id for border
    const borderGradientId = "circle-border-gradient";

    return (
        <div className="relative w-full h-full min-h-[2900px] md:min-h-[4000px] pt-8 pb-16 md:pb-96" style={{ overflow: 'visible' }}>
            <svg
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="absolute left-1/2 -translate-x-1/2"
                style={{}}
            >
                <defs>
                    {/* Gradients for pipe and highlight remain unchanged */}
                    {/* Dynamically create a gradient for each milestone node border */}
                    {nodes.map((node, i) => (
                        <linearGradient key={node.id} id={`node-border-gradient-${node.id}`} x1="0" y1="0" x2="1" y2="1">
                            {/* Parse the gradient string and create stops */}
                            {/* This is a hack: we use the same color stops as in the data file */}
                            {node.gradient?.includes('#') ? (
                                node.gradient.match(/#([0-9a-fA-F]{6,8})/g)?.map((color, idx, arr) => (
                                    <stop key={color} offset={`${(idx / (arr.length - 1)) * 100}%`} stopColor={color} />
                                ))
                            ) : null}
                        </linearGradient>
                    ))}
                    {/* Enhanced gradients and shimmer for the pipe */}
                    <linearGradient id="glass-pipe-base" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0a1a2f" stopOpacity="0.32" />
                        <stop offset="50%" stopColor="#112233" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#23272f" stopOpacity="0.22" />
                    </linearGradient>
                    <linearGradient id="glass-pipe-highlight" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1a2a3a" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#0ff0fc" stopOpacity="0.3">
                            <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#1a2a3a" stopOpacity="0.2" />
                    </linearGradient>
                    {/* New: White shimmer highlight */}
                    <linearGradient id="glass-pipe-white-shimmer" x1="1" y1="0" x2="0" y2="0">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="#fff" stopOpacity="0.7">
                            <animate attributeName="offset" values="1;0;1" dur="2.2s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#fff" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="glass-pipe-edge" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1a2a3a" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#0ff0fc" stopOpacity="0.08" />
                    </linearGradient>
                    <filter id="glass-blur" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="10" />
                    </filter>
                    <radialGradient id="particle-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#0ff0fc" stopOpacity="0.7" />
                        <stop offset="60%" stopColor="#0a1a2f" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#0a1a2f" stopOpacity="0" />
                    </radialGradient>
                    {/* New: White particle glow */}
                    <radialGradient id="white-particle-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                        <stop offset="80%" stopColor="#fff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </radialGradient>
                    {/* Gradient for node borders */}
                    <linearGradient id={borderGradientId} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#00e2ca" />
                        <stop offset="50%" stopColor="#3be6ff" />
                        <stop offset="100%" stopColor="#bafffa" />
                    </linearGradient>
                    <filter id="pipe-3d-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.25" />
                    </filter>
                </defs>
                {/* 1. Glassy base (frosted, semi-transparent, dark) with 3D shadow on mobile */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="url(#glass-pipe-base)"
                    strokeWidth={pipeOuter}
                    strokeLinecap="round"
                    style={{ filter: `url(#glass-blur) ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'url(#pipe-3d-shadow)' : ''}` }}
                />
                {/* 1b. 3D highlight for mobile */}
                {typeof window !== 'undefined' && window.innerWidth < 768 && (
                    <path
                        d={pathData}
                        fill="none"
                        stroke="#fff"
                        strokeWidth={pipeOuter * 0.18}
                        strokeLinecap="round"
                        opacity={0.18}
                    />
                )}
                {/* 2. Inner pipe (darker, for depth) */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="#10181e"
                    strokeWidth={pipeInner}
                    strokeLinecap="round"
                    opacity={0.85}
                />
                {/* 3. Animated shimmer highlight */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="url(#glass-pipe-highlight)"
                    strokeWidth={pipeHighlight}
                    strokeLinecap="round"
                    opacity={0.7}
                    style={{ filter: "blur(2.5px)" }}
                />
                {/* 3b. White shimmer highlight */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="url(#glass-pipe-white-shimmer)"
                    strokeWidth={pipeHighlight}
                    strokeLinecap="round"
                    opacity={0.5}
                    style={{ filter: "blur(2.5px)" }}
                />
                {/* 4. Edge highlight for glass effect */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="url(#glass-pipe-edge)"
                    strokeWidth={pipeEdge}
                    strokeLinecap="round"
                    opacity={0.5}
                />
                {/* 5. Multiple animated data particles (space/data theme) */}
                {[...Array(10)].map((_, idx) => (
                    <circle key={"c" + idx} r={particleRadius / 1.2} fill="url(#particle-glow)">
                        <animateMotion dur="18s" repeatCount="indefinite" rotate="auto" keyPoints={`${(idx / 10)};${1 + (idx / 10)}`} keyTimes="0;1">
                            <mpath xlinkHref="#thePipePath" />
                        </animateMotion>
                    </circle>
                ))}
                {/* New: More slow-moving white data particles */}
                {[...Array(8)].map((_, idx) => (
                    <circle key={"w" + idx} r={particleRadius / 1.5} fill="url(#white-particle-glow)">
                        <animateMotion dur="8s" repeatCount="indefinite" rotate="auto" keyPoints={`${(idx / 8)};${1 + (idx / 8)}`} keyTimes="0;1">
                            <mpath xlinkHref="#thePipePath" />
                        </animateMotion>
                    </circle>
                ))}
                {/* New: Many small animated particles for a data stream effect */}
                {Array.from({ length: 60 }).map((_, i) => {
                    // Emit one particle every 0.2s, each takes 12s to complete the path
                    const offset = i / 60;
                    const dur = 12; // 12 seconds for a full loop
                    return (
                        <circle key={"s" + i} r={3} fill="#fff" opacity="0.7">
                            <animateMotion dur={`${dur}s`} repeatCount="indefinite" rotate="auto" keyPoints={`${offset};${1 + offset}`} keyTimes="0;1">
                                <mpath xlinkHref="#thePipePath" />
                            </animateMotion>
                        </circle>
                    );
                })}
                {/* Hidden path for animateMotion reference */}
                <path id="thePipePath" d={pathData} fill="none" />
            </svg>

            {/* Render nodes */}
            {nodes.map((node, i) => {
                const isSqlLord = i === nodes.length - 1;
                const thisNodeSize = isSqlLord ? nodeSize * 1.18 : nodeSize;
                return (
                    <div
                        key={node.id}
                        onClick={() => onMilestoneClick?.(node.id)}
                        className={
                            "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-300 hover:scale-105"
                        }
                        style={{
                            left: `calc(50% + ${node.x - svgWidth / 2}px)`,
                            top: node.y,
                            width: thisNodeSize,
                            zIndex: 10,
                            overflow: 'visible',
                        }}
                    >
                        <div className="flex flex-col items-center gap-2 md:gap-3">
                            <div
                                className="flex items-center justify-center relative"
                                style={{
                                    width: thisNodeSize,
                                    height: thisNodeSize,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${node.gradient?.match(/#([0-9a-fA-F]{6,8})/g)?.[0] || '#00e2ca'}, #222 100%)`,
                                    padding: 6,
                                    overflow: 'visible',
                                    filter: node.progress === 0 ? 'grayscale(0.5) brightness(0.5)' : undefined,
                                }}
                            >
                                {/* Circular glow */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        zIndex: 0,
                                        pointerEvents: 'none',
                                        background: `radial-gradient(circle, ${(node.gradient?.match(/#([0-9a-fA-F]{6,8})/g)?.[0] || '#00e2ca')}55 0%, transparent 70%)`,
                                        filter: 'blur(8px)',
                                    }}
                                />
                                <img
                                    src={node.badgeImage}
                                    alt={node.title}
                                    className="transition-transform duration-300 hover:scale-110"
                                    style={{
                                        width: '80%',
                                        height: '80%',
                                        objectFit: 'contain',
                                        display: 'block',
                                        background: 'transparent',
                                        position: 'relative',
                                        zIndex: 1,
                                        filter: node.progress === 0 ? 'grayscale(0.5) brightness(0.5)' : undefined,
                                    }}
                                />
                            </div>
                            <div className="text-center">
                                <span className="text-sm md:text-2xl font-bold text-white drop-shadow-lg whitespace-nowrap">{node.title}</span>
                            </div>
                            {/* Badges */}
                            <div className="flex gap-1 md:gap-2 mt-1 md:mt-2">
                                {node.badges?.map((badge: any, idx: number) => {
                                    // Calculate global badge index
                                    const globalBadgeIdx = milestones.slice(0, i).reduce((acc, m) => acc + m.badges.length, 0) + idx;
                                    const badgeImage = BADGE_IMAGE_FILES[globalBadgeIdx]
                                        ? `/badge final png/${BADGE_IMAGE_FILES[globalBadgeIdx]}`
                                        : undefined;
                                    return (
                                        <div key={badge.id} className="flex flex-col items-center">
                                            <span
                                                title={badge.name}
                                                className="inline-block bg-[#0e1a2b] border border-[#00e2ca] rounded-full p-1 transition-colors duration-300 hover:bg-[#162635]"
                                                style={{ width: badgeSize, height: badgeSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                {badgeImage && (
                                                    <img
                                                        src={badgeImage}
                                                        alt={badge.name}
                                                        style={{ width: '80%', height: '80%', objectFit: 'contain', display: 'block' }}
                                                    />
                                                )}
                                            </span>
                                            <span className="text-xs text-dsb-accent mt-1" style={{ lineHeight: 1 }}>{badge.progress}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SqlJourneyRoadmap;
