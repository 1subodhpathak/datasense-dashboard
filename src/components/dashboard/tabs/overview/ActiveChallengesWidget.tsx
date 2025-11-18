
import React from "react";

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
    <div className="neo-glass rounded-3xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Active Challenges Widget</h3>
      <div className="space-y-4">
        {activeChallenges.length > 0 ? (
          activeChallenges.map(challenge => (
            <div key={challenge.id} className="flex items-center justify-between bg-white dark:bg-[#32363C] p-3 rounded-xl">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">{challenge.title}</h4>
                  <span className="text-xs text-gray-600 dark:text-gray-300">{challenge.dueDate}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-600 dark:bg-cyan-500 rounded-full"
                    style={{ width: `${challenge.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl bg-white dark:bg-[#32363C] p-6 text-center text-sm text-gray-600 shadow-sm dark:text-gray-300">
            No active challenges at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveChallengesWidget;
