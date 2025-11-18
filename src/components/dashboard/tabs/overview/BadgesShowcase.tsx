
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgesShowcaseProps {
  badges: Array<{
    id: number;
    name: string;
    description: string;
    progress: number;
    status: "locked" | "in-progress" | "complete";
    type: "gold" | "silver" | "bronze";
    imagePath?: string;
  }>;
}

const BadgesShowcase: React.FC<BadgesShowcaseProps> = ({ badges }) => {
  const navigate = useNavigate();
  
  const handleViewAllBadges = () => {
    navigate("/badges");
  };
  
  const renderBadgeIcon = (status: string, type: string, imagePath?: string) => {
    if (status === "locked") return <Lock className="size-8 text-gray-400 dark:text-gray-500" />;
    
    if (imagePath) {
      return (
        <div className={cn(
          "size-10 rounded-full overflow-hidden flex items-center justify-center",
          status === "locked" ? "opacity-50 grayscale" : ""
        )}>
          <img src={imagePath} alt="Badge" className="w-full h-full object-contain" />
        </div>
      );
    }
    
    if (type === "gold") return <div className="size-10 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center">🏅</div>;
    if (type === "silver") return <div className="size-10 rounded-full bg-gray-300/20 border border-gray-300 flex items-center justify-center">🥈</div>;
    return <div className="size-10 rounded-full bg-amber-700/20 border border-amber-700 flex items-center justify-center">🥉</div>;
  };

  return (
    <div className="neo-glass rounded-3xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your Badges and Achievements</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white h-7"
          onClick={handleViewAllBadges}
        >
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {badges.length > 0 ? (
          badges.slice(0, 3).map((badge) => (
            <div key={badge.id} className="flex items-center gap-3">
              {renderBadgeIcon(badge.status, badge.type, badge.imagePath)}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{badge.name}</p>
                <div className="mt-1 h-1 w-full bg-gray-200 dark:bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-600 dark:bg-cyan-500 rounded-full" 
                    style={{ width: `${badge.progress}%` }} 
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl bg-white dark:bg-[#32363C] p-6 text-center text-sm text-gray-600 shadow-sm dark:text-gray-300">
            No badges earned yet. Keep practicing to unlock achievements!
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesShowcase;
