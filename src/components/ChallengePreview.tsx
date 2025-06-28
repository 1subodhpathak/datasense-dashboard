import { Share2 } from "lucide-react";

type ChallengeType = "bullet_surge" | "rapid_sprint" | "daily_dash";
type Difficulty = "beginner" | "intermediate" | "advanced";
type SkillCategory = "sql" | "python" | "non_coding";

interface ChallengePreviewProps {
  selectedChallenge: ChallengeType | null;
  selectedTime: number | null;
  difficulty: Difficulty;
  skillCategories: SkillCategory;
  questionCount: number;
}

const ChallengePreview = ({
  selectedChallenge,
  selectedTime,
  difficulty,
  skillCategories,
  questionCount,
}: ChallengePreviewProps) => {
  if (!selectedChallenge) return null;

  const challenges = [
    { type: "bullet_surge", name: "Bullet Surge" },
    { type: "rapid_sprint", name: "Rapid Sprint" },
    { type: "daily_dash", name: "Daily Dash" }
  ];

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case "beginner":
        return "1-3";
      case "intermediate":
        return "4-6";
      case "advanced":
        return "7-8";
      default:
        return "1-8";
    }
  };

  return (
    <div className="space-y-5 relative border border-dsb-accent/30 rounded-lg p-5 overflow-hidden bg-gradient-to-br from-black/80 to-dsb-accent/10 backdrop-blur-lg shadow-[0_0_15px_rgba(0,226,202,0.1)]">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-40 bg-gradient-to-r from-transparent via-dsb-accent/20 to-transparent -skew-y-12 -translate-y-24 animate-scan-line"></div>
      </div>
      
      <h3 className="text-xl font-bold text-dsb-accent relative z-10 flex items-center">
        <span className="mr-2">⚡</span> 
        Challenge Preview
      </h3>
      
      <div className="space-y-3 text-sm relative z-10">
        <div className="flex items-center p-3 bg-black/40 backdrop-blur-sm rounded-md border border-dsb-neutral3/30">
          <div className="w-1 h-5 bg-dsb-accent/40 mr-3 rounded"></div>
          <span className="text-dsb-neutral1 w-24">Type:</span>
          <span className="text-white font-medium">{challenges.find(c => c.type === selectedChallenge)?.name}</span>
        </div>
        
        {selectedTime && (
          <div className="flex items-center p-3 bg-black/40 backdrop-blur-sm rounded-md border border-dsb-neutral3/30">
            <div className="w-1 h-5 bg-dsb-accent/40 mr-3 rounded"></div>
            <span className="text-dsb-neutral1 w-24">Time:</span>
            <span className="text-white font-medium">{selectedTime} min</span>
          </div>
        )}
        
        <div className="flex items-center p-3 bg-black/40 backdrop-blur-sm rounded-md border border-dsb-neutral3/30">
          <div className="w-1 h-5 bg-dsb-accent/40 mr-3 rounded"></div>
          <span className="text-dsb-neutral1 w-24">Difficulty:</span>
          <span className="text-white font-medium">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ({getDifficultyLabel()})</span>
        </div>
        
        <div className="flex items-center p-3 bg-black/40 backdrop-blur-sm rounded-md border border-dsb-neutral3/30">
          <div className="w-1 h-5 bg-dsb-accent/40 mr-3 rounded"></div>
          <span className="text-dsb-neutral1 w-24">Skills:</span>
          <span className="text-white font-medium">
            {skillCategories.charAt(0).toUpperCase() + skillCategories.slice(1)}
          </span>
        </div>
        
        <div className="flex items-center p-3 bg-black/40 backdrop-blur-sm rounded-md border border-dsb-neutral3/30">
          <div className="w-1 h-5 bg-dsb-accent/40 mr-3 rounded"></div>
          <span className="text-dsb-neutral1 w-24">Questions:</span>
          <span className="text-white font-medium">1</span>
        </div>
      </div>
      
      {/* <div className="text-sm relative z-10 pt-2">
        <button className="text-dsb-accent hover:text-dsb-accentLight flex items-center gap-2 transition-all hover:translate-x-1 group">
          <Share2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          Invite a friend to challenge
        </button>
      </div> */}
    </div>
  );
};

export default ChallengePreview;
