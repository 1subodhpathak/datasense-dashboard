
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type Difficulty = "beginner" | "intermediate" | "advanced";

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

const DifficultySelector = ({ difficulty, onChange }: DifficultySelectorProps) => {
  const isMobile = useIsMobile();
  
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
    <div className="space-y-2">
      <label className="text-white text-sm flex items-center gap-2">
        <span className="text-dsb-accent">🎯</span>
        Difficulty ({getDifficultyLabel()})
      </label>
      <div className={cn("flex gap-2", isMobile ? "grid grid-cols-3" : "")}>
        {["beginner", "intermediate", "advanced"].map(level => (
          <button 
            key={level} 
            className={cn(
              "text-xs md:text-sm py-2 w-full rounded-md transition-all relative overflow-hidden border shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md group", 
              difficulty === level 
                ? "bg-dsb-accent/30 text-white border-dsb-accent/50 shadow-[0_0_15px_rgba(0,226,202,0.2)]" 
                : "text-white bg-black/30 border-[#333333] hover:border-[#555555] hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
            )} 
            onClick={() => onChange(level as Difficulty)}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
            
            {difficulty === level ? (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dsb-accent/10 to-transparent"></div>
            ) : (
              <div className="absolute -left-[100%] top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-dsb-accent/10 to-transparent transform group-hover:translate-x-[300%] transition-transform duration-1500 ease-in-out"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;
