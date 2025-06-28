
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  stats: Array<{ title: string; value: string; icon: string | null }>;
}

const StatsCards: React.FC<StatCardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/50 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-dsb-neutral1 flex justify-between">
              {stat.title}
              {index > 0 && index < 4 && (
                <button className="text-dsb-neutral1 hover:text-white">
                  <span className="text-xs">•••</span>
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white glow-text-subtle">{stat.value}</span>
              {stat.title === "Streak" ? (
                <img 
                  src="/lovable-uploads/babead22-5d2b-47b5-8933-3049feeb4e32.png" 
                  alt="Streak" 
                  className="h-6 w-6 ml-2"
                />
              ) : stat.icon && (
                <span className="ml-2">{stat.icon}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
