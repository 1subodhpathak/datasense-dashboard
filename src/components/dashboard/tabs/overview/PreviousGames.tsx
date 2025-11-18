import React from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface GameEntry {
  id: number;
  opponent: string;
  result: "win" | "loss";
  score: string;
  date: string;
  avatar: string;
}

const games: GameEntry[] = [
  {
    id: 1,
    opponent: "Sarah Chen",
    result: "win",
    score: "15 - 12",
    date: "2h ago",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    id: 2,
    opponent: "Michael Kim",
    result: "loss",
    score: "8 - 15",
    date: "5h ago",
    avatar: "https://i.pravatar.cc/150?u=michael"
  }
];

const GameEntry = ({ opponent, result, score, date, avatar }: GameEntry) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-4">
      <img src={avatar} alt={opponent} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-100">{opponent}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className={result === "win" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
            {result === "win" ? "Victory" : "Defeat"}
          </span>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span className="text-gray-600 dark:text-gray-300">{score}</span>
        </div>
      </div>
    </div>
    <div className="text-right">
      <span className="text-sm text-gray-600 dark:text-gray-300">{date}</span>
    </div>
  </div>
);

export default function PreviousGames() {
  return (
    <div className="neo-glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your previous games</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {games.length > 0 ? (
          games.map((game) => (
            <GameEntry key={game.id} {...game} />
          ))
        ) : (
          <div className="rounded-xl bg-white dark:bg-[#32363C] p-6 text-center text-sm text-gray-600 shadow-sm dark:text-gray-300">
            No previous games found. Start playing to see your game history!
          </div>
        )}
      </div>
    </div>
  );
}
