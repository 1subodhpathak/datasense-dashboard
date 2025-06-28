import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <img src={avatar} alt={opponent} className="w-10 h-10 rounded-full bg-dsb-neutral3/30" />
      <div>
        <p className="font-medium text-glow">{opponent}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className={result === "win" ? "text-green-400" : "text-red-400"}>
            {result === "win" ? "Victory" : "Defeat"}
          </span>
          <span className="text-muted">•</span>
          <span className="text-muted">{score}</span>
        </div>
      </div>
    </div>
    <div className="text-right">
      <span className="text-sm text-muted">{date}</span>
    </div>
  </div>
);

export default function PreviousGames() {
  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            <span className="text-glow">Your previous games</span>
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-dsb-neutral1 hover:text-white">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {games.map((game) => (
            <GameEntry key={game.id} {...game} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
