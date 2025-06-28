
import React, { useState } from "react";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Milestone } from "@/data/sql-journey";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CandyMilestoneProps {
  milestone: Milestone;
  index: number;
  onClick: (id: string) => void;
  totalMilestones: number;
  style?: React.CSSProperties;
}

const CandyMilestone = ({ milestone, index, onClick, totalMilestones, style }: CandyMilestoneProps) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const isCompleted = milestone.progress >= 100;
  const isActive = milestone.progress > 0 && milestone.progress < 100;
  const isLocked = milestone.progress === 0;
  
  const milestoneColors = [
    "from-pink-500 to-purple-500",  // Pink-purple
    "from-blue-500 to-cyan-400",    // Blue-cyan
    "from-amber-500 to-orange-500", // Amber-orange  
    "from-green-500 to-emerald-400", // Green-emerald
    "from-red-500 to-rose-400",     // Red-rose
    "from-violet-500 to-indigo-500", // Violet-indigo
    "from-yellow-400 to-amber-500",  // Yellow-amber
    "from-emerald-500 to-teal-400",  // Emerald-teal
    "from-rose-500 to-pink-400"      // Rose-pink
  ];
  
  // Use modulo to cycle through colors
  const colorClass = milestoneColors[index % milestoneColors.length];
  
  return (
    <div 
      className="relative"
      style={style}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onClick(milestone.id)}
              disabled={isLocked}
              className={cn(
                "relative group w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center",
                "transition-all duration-300 shadow-lg hover:scale-110 active:scale-95",
                isLocked ? "bg-gray-800 border-2 border-gray-700" :
                `bg-gradient-to-br ${colorClass} border-2`,
                isCompleted ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : 
                isActive ? "border-white/70" : "border-gray-700"
              )}
            >
              <div 
                className={cn(
                  "absolute inset-0 rounded-full",
                  !isLocked && "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhciIgdmlld0JveD0iMCAwIDEwIDEwIiB3aWR0aD0iMTAlIiBoZWlnaHQ9IjEwJSI+PHBhdGggZD0iTTUgOGwyLTUgNSAyLTUgMi0yIDUtMi01LTUgLTIgNSAtMnoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFyKSIvPjwvc3ZnPg==')]"
                )}
              />
              
              <div className="absolute inset-2 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <milestone.icon 
                  size={isLocked ? 20 : 24} 
                  className={cn(
                    "z-10 transition-all",
                    isLocked ? "text-gray-500" : 
                    isCompleted ? "text-white" : "text-white/80"
                  )} 
                />
              </div>
              
              {isActive && !isHovering && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="47%"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="100"
                    strokeDashoffset={100 - milestone.progress}
                    strokeLinecap="round"
                  />
                </svg>
              )}
              
              {isHovering && !isLocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all animate-fade-in">
                  <div className="text-white font-bold text-lg">
                    {milestone.progress}%
                  </div>
                </div>
              )}
              
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-20">
                  <Check size={14} className="text-white" />
                </div>
              )}
              
              {isLocked && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center z-20">
                  <Lock size={14} className="text-gray-400" />
                </div>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent className="neo-glass-dark border border-white/10 text-white">
            <p className="font-medium">{milestone.title}</p>
            <p className="text-xs text-gray-300">{milestone.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="text-center mt-2">
        <h3 className={cn(
          "font-medium text-sm",
          isCompleted ? "text-white" : 
          isActive ? "text-gray-200" : "text-gray-400"
        )}>
          {milestone.title}
        </h3>
        <Badge className={cn(
          "mt-1 bg-black/40 border",
          isCompleted ? "border-white/60 text-white" : 
          isActive ? "border-white/30 text-gray-300" : 
          "border-gray-700 text-gray-500"
        )}>
          {milestone.badges.length} Badges
        </Badge>
      </div>
    </div>
  );
};

export default CandyMilestone;
