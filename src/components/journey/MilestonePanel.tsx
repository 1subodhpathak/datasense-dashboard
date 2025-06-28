import React from "react";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Milestone } from "@/data/sql-journey";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MilestonePanelProps {
  milestone: Milestone;
  onClose: () => void;
  allMilestones: Milestone[];
}

const BADGE_IMAGE_FILES = [
  '2.png', '3.png', '4.png', '6.png', '7.png', '8.png', '10.png', '11.png', '12.png',
  '14.png', '15.png', '16.png', '18.png', '19.png', '20.png', '22.png', '23.png', '24.png',
  '26.png', '27.png', '28.png', '30.png', '31.png', '32.png', '34.png', '35.png', '36.png',
  '37.png', '38.png', '39.png', '40.png', '41.png', '42.png',
];

const MilestonePanel: React.FC<MilestonePanelProps> = ({ milestone, onClose, allMilestones }) => {
  const navigate = useNavigate();
  // Calculate the global badge start index for this milestone
  const milestoneIdx = allMilestones.findIndex(m => m.id === milestone.id);
  const globalBadgeStartIndex = allMilestones.slice(0, milestoneIdx).reduce((acc, m) => acc + m.badges.length, 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50 backdrop-blur-sm">
      <div
        className="neo-glass-dark rounded-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto border-2 border-black"
      >
        <div className="p-4 md:p-8">
          <div className="flex items-center gap-4 mb-4">
            {milestone.badgeImage ? (
              <img
                src={milestone.badgeImage}
                alt={milestone.title}
                className="h-14 w-14 md:h-20 md:w-20 rounded-full object-contain bg-black/80 border border-dsb-accent"
              />
            ) : (
              milestone.icon && <milestone.icon className="h-6 w-6 text-white" />
            )}
            <h3 className="text-lg md:text-2xl font-bold text-white flex-1 flex items-center">{milestone.title}</h3>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center bg-dsb-neutral3/50 hover:bg-dsb-neutral3 transition-colors"
            >
              <X className="h-4 w-4 text-dsb-neutral1" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Overall milestone progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-dsb-neutral1">{milestone.description}</span>
                <span className="text-sm font-medium text-dsb-accent">{milestone.progress}%</span>
              </div>
              <Progress value={milestone.progress} className="h-2" />
            </div>

            {/* Badge list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md md:text-lg font-semibold text-dsb-neutral1">Badges to Earn</h4>
                <button
                  className="text-dsb-neutral1 border border-dsb-neutral3 rounded px-3 py-1 text-xs hover:bg-dsb-neutral3/20 transition-colors"
                  onClick={() => navigate('/badges')}
                >
                  View All Badges
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                {milestone.badges.map((badge, idx) => {
                  const isLocked = badge.progress === 0;
                  const isComplete = badge.progress === 100;
                  // Use badge image for the correct global badge index
                  const globalBadgeIdx = globalBadgeStartIndex + idx;
                  const badgeImage = BADGE_IMAGE_FILES[globalBadgeIdx]
                    ? `/badge final png/${BADGE_IMAGE_FILES[globalBadgeIdx]}`
                    : undefined;
                  const accentColor = milestone.gradient?.match(/#([0-9a-fA-F]{6,8})/g)?.[0] || '#00e2ca';
                  return (
                    <div
                      key={badge.id}
                      className={cn(
                        "flex flex-col items-center w-56 min-h-[260px] p-4 rounded-lg border transition-all relative overflow-hidden bg-black/80 hover:scale-105 hover:shadow-lg duration-200 cursor-pointer"
                      )}
                      style={{
                        border: `2px solid ${accentColor}`,
                      }}
                      onClick={() => navigate(`/badges/${badge.id}`)}
                    >
                      <div className="relative mb-2 w-20 h-20 flex items-center justify-center">
                        <div
                          className={cn(
                            "w-full h-full rounded-full flex items-center justify-center overflow-hidden border-2",
                          )}
                          style={{
                            borderColor: accentColor,
                          }}
                        >
                          {badgeImage ? (
                            <img
                              src={badgeImage}
                              alt={badge.name}
                              className={cn(
                                "w-full h-full object-contain",
                                isLocked && "opacity-50 grayscale"
                              )}
                            />
                          ) : (
                            badge.icon && (
                              <badge.icon
                                size={40}
                                className={cn(
                                  isComplete
                                    ? "text-white"
                                    : isLocked
                                      ? "text-black opacity-60 grayscale"
                                      : "text-dsb-accent"
                                )}
                              />
                            )
                          )}
                        </div>
                        {/* Locked icon overlay */}
                        {isLocked && (
                          <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 11V7a5 5 0 00-10 0v4M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" /></svg>
                          </div>
                        )}
                      </div>
                      <h5
                        className={cn(
                          "text-center font-medium text-base mb-1"
                        )}
                        style={{ color: accentColor }}
                      >
                        {badge.name}
                      </h5>
                      <p className={cn(
                        "text-center text-xs mb-2",
                        isLocked ? "text-black/50" : "text-dsb-neutral1"
                      )}>{badge.condition}</p>
                      <div className="w-full mt-auto">
                        <div className="flex items-center justify-between text-xs text-dsb-neutral1 mb-1">
                          <span>{badge.currentValue}</span>
                          <span>{badge.requiredValue}</span>
                        </div>
                        <Progress
                          value={badge.progress}
                          className={cn(
                            "h-1.5 bg-dsb-neutral3/30"
                          )}
                          indicatorClassName={cn('h-full', {
                            // Use Tailwind if the color is a known class, otherwise fallback to inline style
                          })}
                          style={{
                            backgroundColor: 'transparent',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestonePanel;
