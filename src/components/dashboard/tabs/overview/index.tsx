import React from "react";
import { ProfileOverview } from "./ProfileOverview";
import ChallengeCalendar from "./ChallengeCalendar";
import ActiveChallengesWidget from "./ActiveChallengesWidget";
import PreviousGames from "./PreviousGames";
import BadgesShowcase from "./BadgesShowcase";
interface DashboardOverviewProps {
  stats: Array<{
    title: string;
    value: string;
    icon: string | null;
  }>;
  leaderboardHighlights: Array<{
    rank: number;
    name: string;
    points: number;
    avatar: string;
  }>;
  activeChallenges: Array<{
    id: number;
    title: string;
    progress: number;
    dueDate: string;
  }>;
  badges: Array<{
    id: number;
    name: string;
    description: string;
    progress: number;
    status: "locked" | "in-progress" | "complete";
    type: "gold" | "silver" | "bronze";
    imagePath?: string;
  }>;
  selectedDate: string;
  currentMonth: string;
  days: string[];
  currentDay: number;
  maxDays: number;
}
export function DashboardOverview({
  stats,
  leaderboardHighlights,
  activeChallenges,
  badges,
  selectedDate,
  currentMonth,
  days,
  currentDay,
  maxDays
}: DashboardOverviewProps) {
  return <div className=" pt-6 bg-transparent mb-10">
    <div className="mx-auto space-y-6">
      {/* Profile Overview Section */}
      <ProfileOverview stats={stats} leaderboardHighlights={leaderboardHighlights} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <ChallengeCalendar selectedDate={selectedDate} currentMonth={currentMonth} days={days} currentDay={currentDay} maxDays={maxDays} />
          <PreviousGames />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ActiveChallengesWidget activeChallenges={activeChallenges} />
          <BadgesShowcase badges={badges} />
        </div>
      </div>
    </div>
  </div>;
}