import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Info, Share2, Lock } from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: "locked" | "in-progress" | "complete";
  type: "gold" | "silver" | "bronze";
  imagePath?: string;
}

interface BadgesTabProps {
  badges: Badge[];
  badgeType: "badges" | "certificates";
  setBadgeType: (type: "badges" | "certificates") => void;
}

const BadgesTab: React.FC<BadgesTabProps> = ({ badges, badgeType, setBadgeType }) => {
  const navigate = useNavigate();

  const handleViewAllBadges = () => {
    navigate("/badges");
  };

  const renderBadgeIcon = (status: string, type: string, imagePath?: string) => {
    // Always show a large badge image (with fallback if missing)
    return (
      <div className={cn(
        "w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full bg-black/40 border-4 border-dsb-accent/30 flex items-center justify-center overflow-hidden transition-transform duration-300",
        status === "locked" ? "opacity-50 grayscale" : "hover:scale-105"
      )}>
        {imagePath ? (
          <img src={imagePath} alt="Badge" className="w-5/6 h-5/6 object-contain" />
        ) : (
          <Lock className="w-12 h-12 text-gray-500" />
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 neo-glass-dark border-dsb-neutral3/30 rounded-xl backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium text-[#00ffff] mb-2 glow-text">Your Badges and Achievements</h1>
          <p className="text-dsb-neutral1 text-sm">Progress: 0/33 completed</p>
        </div>
        <Button
          onClick={handleViewAllBadges}
          className="bg-dsb-accent hover:bg-dsb-accent/80 text-white"
        >
          View All Badges
        </Button>
      </div>

      <Tabs value={badgeType} onValueChange={(v) => setBadgeType(v as "badges" | "certificates")} className="w-full">
        <TabsList className="neo-glass-dark w-full justify-start mb-6">
          <TabsTrigger value="badges" className="data-[state=active]:text-white">
            Badges
          </TabsTrigger>
          <TabsTrigger value="certificates" className="data-[state=active]:text-white">
            Certificates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {badges.map((badge) => (
              <div key={badge.id} className={cn(
                "neo-glass-dark flex flex-col items-center p-8 rounded-2xl transition-all duration-300 relative group overflow-hidden min-h-[370px]",
                badge.status === "locked" ? "opacity-60" : "hover:shadow-glow-subtle"
              )}>
                {/* Large badge image */}
                {renderBadgeIcon(badge.status, badge.type, badge.imagePath)}
                <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-between">
                  <h3 className="text-white text-xl font-bold mb-2 text-center">{badge.name}</h3>
                  <p className="text-dsb-neutral1 text-base mb-4 text-center">{badge.description}</p>
                  <div className="w-full mt-auto">
                    <div className="h-2 bg-dsb-neutral3/50 rounded-full overflow-hidden mb-2">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          badge.status === "complete" ? "bg-green-500/90" : "bg-dsb-accent/80"
                        )}
                        style={{ width: `${badge.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-dsb-neutral1">Progress</span>
                      <span className={badge.status === "locked" ? "text-dsb-neutral2" : "text-white"}>{badge.progress}%</span>
                    </div>
                  </div>
                </div>
                <button className="absolute top-4 right-4 text-dsb-neutral2 hover:text-dsb-neutral1 transition-all z-20">
                  <Share2 className="size-5" />
                </button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="mt-0">
          <div className="neo-glass-dark p-8 rounded-xl flex flex-col items-center justify-center text-center">
            <Info className="size-12 text-dsb-neutral1 mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No Certificates Yet</h3>
            <p className="text-dsb-neutral1 max-w-md mb-6">Complete challenges and earn badges to unlock certificates that showcase your SQL mastery.</p>
            <Button className="bg-dsb-accent/60 hover:bg-dsb-accent/90 text-white">
              Start Learning
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="neo-glass-dark mt-8 p-6 rounded-xl">
        <h3 className="text-white text-lg font-medium mb-4">Achievements Summary</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-white mb-1">0/33</div>
            <div className="text-dsb-neutral1 text-sm">Badges Earned</div>
          </div>

          <div className="bg-black/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-white mb-1">2/4</div>
            <div className="text-dsb-neutral1 text-sm">Skill Paths Started</div>
          </div>

          <div className="bg-black/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-dsb-accent mb-1">450</div>
            <div className="text-dsb-neutral1 text-sm">Achievement Points</div>
          </div>

          <div className="bg-black/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">33%</div>
            <div className="text-dsb-neutral1 text-sm">Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgesTab;
