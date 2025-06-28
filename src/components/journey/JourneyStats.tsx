
import React from "react";
import { Trophy, Award, Calendar, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface JourneyStatsProps {
  completedMilestones: number;
  totalMilestones: number;
  earnedBadges: number;
  totalBadges: number;
  currentStreak: number;
}

const JourneyStats: React.FC<JourneyStatsProps> = ({
  completedMilestones,
  totalMilestones,
  earnedBadges,
  totalBadges,
  currentStreak
}) => {
  const isMobile = useIsMobile();
  
  const stats = [
    {
      icon: <Trophy className="h-5 w-5 md:h-6 md:w-6 text-[#FFD700]" />,
      label: "Milestones",
      value: `${completedMilestones}/${totalMilestones}`,
      color: "from-[#FFD700]/20 to-[#FFA500]/20"
    },
    {
      icon: <Award className="h-5 w-5 md:h-6 md:w-6 text-[#E44CC3]" />,
      label: "Badges",
      value: `${earnedBadges}/${totalBadges}`,
      color: "from-[#E44CC3]/20 to-[#C71585]/20"
    },
    {
      icon: <Calendar className="h-5 w-5 md:h-6 md:w-6 text-[#00E2CA]" />,
      label: "Current Streak",
      value: `${currentStreak} days`,
      color: "from-[#00E2CA]/20 to-[#00B8AB]/20"
    },
    {
      icon: <Clock className="h-5 w-5 md:h-6 md:w-6 text-[#FFA500]" />,
      label: "Next Badge",
      value: "2 days",
      color: "from-[#FFA500]/20 to-[#FF8C00]/20"
    }
  ];

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10 md:mt-16">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`neo-glass-dark rounded-lg border border-dsb-accent/10 p-4 md:p-5 bg-gradient-to-br ${stat.color}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs md:text-sm text-dsb-neutral1">{stat.label}</p>
              <p className="text-base md:text-lg font-medium text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JourneyStats;
