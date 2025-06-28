import { useState } from "react";
import ChallengeCard from "@/components/ChallengeCard";

type ChallengeType = "bullet_surge" | "rapid_sprint" | "daily_dash";

interface ChallengeOptionsProps {
  selectedChallenge: ChallengeType | null;
  onChallengeSelect: (type: ChallengeType) => void;
  onTimeSelect: (minutes: number) => void;
}

const ChallengeOptions = ({
  selectedChallenge,
  onChallengeSelect,
  onTimeSelect,
}: ChallengeOptionsProps) => {
  const challenges = [
    {
      type: "bullet_surge",
      name: "Bullet Surge",
      timeOptions: [10, 15, 30],
      icon: <img src="/png/Bullet Surge.png" alt="Bullet Surge" className="h-8 w-8" />
    },
    {
      type: "rapid_sprint",
      name: "Rapid Sprint",
      timeOptions: [45, 60, 120],
      icon: <img src="/png/Rapid Sprint.png" alt="Rapid Sprint" className="h-8 w-8" />
    },
    {
      type: "daily_dash",
      name: "Daily Dash",
      timeOptions: [90, 180, 240],
      icon: <img src="/png/Daily Dash.png" alt="Daily Dash" className="h-8 w-8" />
    }
  ];

  const handleChallengeSelect = (type: ChallengeType) => {
    onChallengeSelect(type);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {challenges.map(challenge => (
        <ChallengeCard
          key={challenge.type}
          name={challenge.name}
          timeOptions={challenge.timeOptions}
          icon={challenge.icon}
          selected={selectedChallenge === challenge.type}
          onClick={() => handleChallengeSelect(challenge.type as ChallengeType)}
          onTimeSelect={onTimeSelect}
        />
      ))}
    </div>
  );
};

export default ChallengeOptions;
