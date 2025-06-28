
import React from "react";

const JourneyBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
            {/* Dark gradient background with depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-dsb-neutral3/10 opacity-80"></div>

            {/* Enhanced grid pattern with subtle animation */}
            <div className="absolute inset-0 cyber-grid animate-grid-flow opacity-20"></div>

            {/* More stars/particles for a richer starry background */}
            {[...Array(150)].map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-sparkle"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${Math.max(Math.random() * 3 + 0.5, 0.8)}px`,
                        height: `${Math.max(Math.random() * 3 + 0.5, 0.8)}px`,
                        backgroundColor: i % 5 === 0 ? 'rgba(0, 226, 202, 0.9)' : 'white',
                        borderRadius: '50%',
                        opacity: Math.random() * 0.8,
                        animationDelay: `${Math.random() * 10}s`,
                        animationDuration: `${Math.random() * 6 + 2}s`
                    }}
                />
            ))}

            {/* Enhanced nebula effects with glass morphism */}
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-teal-glow opacity-20 blur-3xl"></div>
            <div className="absolute bottom-1/3 right-1/4 w-1/4 h-1/4 bg-teal-glow opacity-20 blur-3xl"></div>
            <div className="absolute top-1/6 right-1/6 w-1/5 h-1/5 rounded-full bg-blue-500/10 blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/5 w-1/3 h-1/3 rounded-full bg-teal-500/10 blur-3xl"></div>

            {/* Dynamic light rays */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-dsb-accent via-transparent to-transparent"></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-1 bg-gradient-to-r from-transparent via-dsb-accent/30 to-transparent"></div>
            </div>

            {/* Subtle glow points */}
            <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-dsb-accent/80 blur-md animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-dsb-accent/80 blur-md animate-pulse"
                style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-dsb-accent/80 blur-md animate-pulse"
                style={{ animationDelay: '2s' }}></div>
        </div>
    );
};

export default JourneyBackground;
