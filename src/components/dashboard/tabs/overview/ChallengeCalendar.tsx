import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pencil, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";

interface StreakData {
  _id: string;
  activityLog: {
    [year: string]: {
      year: string;
      months: {
        [month: string]: {
          [day: string]: number;
        };
      };
    };
  };
  clerkId: string;
  __v: number;
}

interface ChallengeCalendarProps {
  selectedDate: string;
  currentMonth: string;
  days: string[];
  currentDay: number;
  maxDays: number;
}

const ChallengeCalendar: React.FC<ChallengeCalendarProps> = ({
  selectedDate,
  currentMonth,
  days,
  currentDay,
  maxDays
}) => {
  const { user } = useUser();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current year and month for parsing streak data
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonthNum = String(currentDate.getMonth() + 1).padStart(2, '0');

  useEffect(() => {
    const fetchStreakData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`https://server.datasenseai.com/user-streak/${user.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: StreakData = await response.json();
        setStreakData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch streak data');
        console.error('Error fetching streak data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, [user?.id]);

  // Calculate current streak
  const calculateCurrentStreak = (): number => {
    if (!streakData?.activityLog) return 0;
    
    const yearData = streakData.activityLog[currentYear];
    if (!yearData?.months) return 0;
    
    const monthData = yearData.months[currentMonthNum];
    if (!monthData) return 0;
    
    let streak = 0;
    const today = currentDay;
    
    // Count consecutive days from today backwards
    for (let day = today; day >= 1; day--) {
      if (monthData[day.toString()]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Check if a specific day has activity
  const hasActivity = (day: number): boolean => {
    if (!streakData?.activityLog) return false;
    
    const yearData = streakData.activityLog[currentYear];
    if (!yearData?.months) return false;
    
    const monthData = yearData.months[currentMonthNum];
    if (!monthData) return false;
    
    return Boolean(monthData[day.toString()]);
  };

  const currentStreak = calculateCurrentStreak();

  if (loading) {
    return (
      <div className="neo-glass rounded-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your Challenge Calendar</h3>
          <span className="text-sm text-gray-600 dark:text-gray-300">Loading...</span>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 dark:border-cyan-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-glass rounded-3xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your Challenge Calendar</h3>
        <div className="flex items-center gap-2">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1 bg-cyan-600/15 dark:bg-cyan-500/15 px-2 py-1 rounded-lg">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{currentStreak}</span>
            </div>
          )}
          <span className="text-sm text-gray-600 dark:text-gray-300">Track Your Progress</span>
        </div>
      </div>
      <div>
        {error && (
          <div className="mb-4 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-xs">
            Error loading streak data: {error}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedDate}</div>
          <Button
            className="h-7 w-7 p-0 rounded-lg bg-cyan-600/10 dark:bg-cyan-500/10 hover:bg-cyan-600/20 dark:hover:bg-cyan-500/20"
            variant="ghost"
          >
            <Pencil className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          </Button>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{currentMonth}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-cyan-600/10 dark:hover:bg-cyan-500/10">
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
            <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-cyan-600/10 dark:hover:bg-cyan-500/10">
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day, i) => (
            <div key={i} className="text-xs py-1 text-gray-600 dark:text-gray-300 font-medium">{day}</div>
          ))}
          {Array.from({ length: maxDays }, (_, i) => i + 1).map((day) => {
            const isActive = hasActivity(day);
            const isToday = day === currentDay;
            const isPast = day < currentDay;
            const isFuture = day > currentDay;
            
            return (
              <div
                key={day}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs mx-auto transition-all duration-300 relative",
                  isToday && "bg-cyan-600 dark:bg-cyan-500 text-white font-bold",
                  isPast && !isActive && "text-gray-400 dark:text-gray-500 opacity-60",
                  isPast && isActive && "bg-green-500/30 dark:bg-green-500/30 text-green-600 dark:text-green-400 border border-green-500/50",
                  isFuture && "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                )}
              >
                {day}
                {isActive && (
                  <div className="absolute -top-1 -right-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Streak Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-300">Current Streak</span>
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">{currentStreak} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCalendar;