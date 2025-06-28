
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    if (status === "locked") return <Lock className="size-8 text-gray-500" />;
    
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
    <Card className="neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-white text-base glow-text-subtle">Your Badges and Achievements</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-dsb-neutral1 hover:text-white h-7"
            onClick={handleViewAllBadges}
          >
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {badges.slice(0, 3).map((badge) => (
          <div key={badge.id} className="flex items-center gap-3">
            {renderBadgeIcon(badge.status, badge.type, badge.imagePath)}
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{badge.name}</p>
              <div className="mt-1 h-1 w-full bg-dsb-neutral3/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-dsb-accent/80 rounded-full" 
                  style={{ width: `${badge.progress}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BadgesShowcase;
