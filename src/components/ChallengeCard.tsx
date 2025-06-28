import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TimeOption {
  minutes: number;
  selected: boolean;
}

interface ChallengeCardProps {
  name: string;
  timeOptions: number[];
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  onTimeSelect: (minutes: number) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  name,
  timeOptions,
  icon,
  selected,
  onClick,
  onTimeSelect
}) => {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const handleTimeSelect = (time: number) => {
    setSelectedTime(time);
    onTimeSelect(time);
  };

  return (
    <div
      className={cn(
        "challenge-card relative group overflow-hidden rounded-xl transition-all duration-300 border shadow-lg cursor-pointer select-none",
        selected
          ? "bg-gradient-to-br from-black/80 to-dsb-accent/20 border-dsb-accent shadow-[0_0_30px_rgba(0,226,202,0.2)]"
          : "bg-black/40 border-[#333333] hover:border-dsb-accent/30",
        "backdrop-blur-xl hover:transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,226,202,0.1)]"
      )}
      onClick={onClick}
      style={{ userSelect: 'none' }}
    >
      {/* Cyber grid background when selected */}
      {selected && (
        <div className="absolute inset-0 bg-cyber-grid bg-[size:20px_20px] opacity-5 z-0">
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-dsb-accent/5 animate-pulse-subtle"></div>
        </div>
      )}

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-dsb-accent/40"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-dsb-accent/40"></div>

      {/* Main content */}
      <div className="flex flex-col items-center space-y-6 relative z-10 p-6 select-none">
        <div className={cn(
          "rounded-full p-5 transition-all duration-300 relative cursor-default select-none",
          selected
            ? "bg-gradient-to-br from-dsb-accent/30 to-black/60 shadow-[0_0_20px_rgba(0,226,202,0.2)]"
            : "bg-black/50",
          "group-hover:scale-110 transform transition-transform duration-200"
        )}>
          <div className={cn(
            "text-white scale-125 cursor-default select-none",
            selected ? "text-dsb-accent" : "text-dsb-neutral1 group-hover:text-dsb-accent/80"
          )}>
            <span style={{ userSelect: 'none', cursor: 'default', display: 'inline-block' }}>{icon}</span>
          </div>
        </div>

        <div className="text-center cursor-default select-none">
          <h3 className={cn(
            "text-xl font-bold mb-2 cursor-default select-none",
            selected ? "text-dsb-accent" : "text-white group-hover:text-dsb-accent/80"
          )} style={{ userSelect: 'none' }}>{name}</h3>
        </div>

        {selected && (
          <div className="grid grid-cols-3 gap-2 w-full mt-2">
            {timeOptions.map(time => (
              <button
                key={time}
                className={cn(
                  "py-2 px-1 rounded-md text-sm transition-all relative overflow-hidden border",
                  selectedTime === time
                    ? "bg-dsb-accent/30 text-white border-dsb-accent/70 shadow-[0_0_10px_rgba(0,226,202,0.2)]"
                    : "bg-black/60 text-dsb-neutral1 hover:text-white border-[#333333] hover:border-[#555555]"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTimeSelect(time);
                }}
              >
                {/* Scan line effect for selected time option */}
                {selectedTime === time && (
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-scan-line"></div>
                  </div>
                )}
                {time} min
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;
