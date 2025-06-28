
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

interface LeaderboardHighlightsProps {
  leaderboardHighlights: Array<{ 
    rank: number; 
    name: string; 
    points: number; 
    avatar: string 
  }>;
}

const LeaderboardHighlights: React.FC<LeaderboardHighlightsProps> = ({ leaderboardHighlights }) => {
  return (
    <Card className="neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-white text-base glow-text-subtle">Leaderboard Highlights</span>
          <span className="text-dsb-neutral1 text-xs">See Who's on Top!</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboardHighlights.map((user, index) => (
          <div key={index} className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-dsb-neutral1 font-medium w-6">#{user.rank}</span>
              <Avatar className="size-8 border border-dsb-neutral3/50">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white text-sm">{user.name}</p>
                <p className="text-dsb-neutral1 text-xs">{user.points.toLocaleString()} points</p>
              </div>
            </div>
            {index < 3 && (
              <div className="text-yellow-500">
                <Trophy className="size-4" />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LeaderboardHighlights;
