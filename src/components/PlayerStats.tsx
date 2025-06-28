
import React from "react";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface PlayerStatsProps {
  level: number;
  streak: number;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ level, streak }) => {
  // Calculate progress to next level (just for visual demonstration)
  const progress = Math.min(75, Math.random() * 100);
  
  return (
    <div className="space-y-6 relative">
      {/* Decorative elements */}
      <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-dsb-accent/70"></div>
      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-dsb-accent/70"></div>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-dsb-accent/20 rounded-full"></div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-dsb-neutral1 flex items-center">
            <span className="inline-block w-1.5 h-1.5 bg-dsb-accent mr-1.5 rounded-full"></span>
            Level
          </span>
          <div className="bg-black/50 px-3 py-1 rounded-md flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-dsb-accent to-dsb-accentLight bg-clip-text text-transparent">{level}</span>
            {/* XP badge */}
            <div className="ml-1 bg-dsb-accent/20 backdrop-blur-md p-1 rounded-full border border-dsb-accent/30 shadow-lg">
              <div className="text-[10px] font-bold text-dsb-accentLight">XP</div>
            </div>
          </div>
        </div>
        <div className="h-2.5 bg-black/70 rounded-full overflow-hidden backdrop-blur-sm border border-dsb-neutral3/50">
          <div
            className="h-full bg-gradient-to-r from-dsb-accentDark to-dsb-accent shadow-inner relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="w-full h-full opacity-80 animate-scan-line bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
            </div>
            <div className="w-16 absolute inset-0 opacity-50 animate-sparkle-move bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-black/50 backdrop-blur-xl rounded-lg border border-dsb-neutral3/40 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
        <div className="text-sm text-dsb-neutral1 flex items-center">
          <div className="w-1 h-8 bg-gradient-to-t from-dsb-accent/40 to-dsb-accent/70 mr-3 rounded"></div>
          Current streak:
        </div>
        <div className="flex items-center justify-center bg-black/70 px-4 py-1.5 rounded-md border border-dsb-neutral3/50">
          <span className="text-xl font-bold bg-gradient-to-r from-dsb-accent to-dsb-accentLight bg-clip-text text-transparent mr-2">{streak}</span>
          <Flame className="h-5 w-5 text-orange-500 fill-orange-500/30" />
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
