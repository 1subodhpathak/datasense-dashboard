import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-glow text-base">Your Challenge Calendar</span>
            <span className="text-muted text-xs">Loading...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dsb-accent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-glow text-base">Your Challenge Calendar</span>
          <div className="flex items-center gap-2">
            {currentStreak > 0 && (
              <div className="flex items-center gap-1 bg-dsb-accent/20 px-2 py-1 rounded-full">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-bold text-dsb-accent">{currentStreak}</span>
              </div>
            )}
            <span className="text-muted text-xs">Track Your Progress</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-xs">
            Error loading streak data: {error}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-glow font-medium">{selectedDate}</div>
          <Button
            className="h-7 w-7 p-0 rounded-full bg-dsb-accent/20 hover:bg-dsb-accent/30 backdrop-blur-sm"
            variant="ghost"
          >
            <Pencil className="h-3.5 w-3.5 text-dsb-accent" />
          </Button>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-glow text-sm">{currentMonth}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-dsb-accent/20">
              <ChevronLeft className="h-4 w-4 text-dsb-neutral1" />
            </Button>
            <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-dsb-accent/20">
              <ChevronRight className="h-4 w-4 text-dsb-neutral1" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day, i) => (
            <div key={i} className="text-dsb-neutral1 text-xs py-1">{day}</div>
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
                  isToday && "bg-dsb-accent text-black font-bold animate-pulse-subtle",
                  isPast && !isActive && "text-dsb-neutral1 opacity-60",
                  isPast && isActive && "bg-green-500/30 text-green-300 border border-green-500/50",
                  isFuture && "text-white hover:bg-dsb-neutral3/20 cursor-pointer"
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
        <div className="mt-4 pt-4 border-t border-dsb-neutral3/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-dsb-neutral1">Current Streak</span>
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-dsb-accent font-bold">{currentStreak} days</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeCalendar;