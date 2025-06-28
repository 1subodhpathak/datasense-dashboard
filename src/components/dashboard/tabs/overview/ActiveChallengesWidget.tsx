
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActiveChallengesWidgetProps {
  activeChallenges: Array<{ 
    id: number; 
    title: string; 
    progress: number; 
    dueDate: string 
  }>;
}

const ActiveChallengesWidget: React.FC<ActiveChallengesWidgetProps> = ({ activeChallenges }) => {
  return (
    <Card className="neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white text-base glow-text-subtle">Active Challenges Widget</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeChallenges.map(challenge => (
          <div key={challenge.id} className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white text-sm font-medium">{challenge.title}</h4>
                <span className="text-dsb-neutral1 text-xs">{challenge.dueDate}</span>
              </div>
              <div className="w-full bg-dsb-neutral3/30 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-dsb-accent rounded-full"
                  style={{ width: `${challenge.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActiveChallengesWidget;
