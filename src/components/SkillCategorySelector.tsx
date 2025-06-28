import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

type SkillCategory = "sql" | "python" | "non_coding";

interface SkillCategorySelectorProps {
  skillCategory: SkillCategory; // changed from skillCategories: SkillCategory[]
  onChange: (category: SkillCategory) => void; // changed from array to single value
}

const SkillCategorySelector = ({ skillCategory, onChange }: SkillCategorySelectorProps) => {
  const handleSkillCategoryChange = (category: string) => {
    onChange(category as SkillCategory);
  };

  return (
    <div className="space-y-2">
      <label className="text-white text-sm flex items-center gap-2">
        <span className="text-dsb-accent">🧠</span>
        Skill Category
      </label>
      <TooltipProvider>
        <ToggleGroup
          type="single" // changed from "multiple"
          value={skillCategory}
          onValueChange={handleSkillCategoryChange}
          className="justify-start"
          variant="outline"
        >
          <ToggleGroupItem
            value="sql"
            className="border-[#333333] data-[state=on]:bg-dsb-accent/40 data-[state=on]:border-dsb-accent/50 data-[state=on]:shadow-sm text-white relative overflow-hidden backdrop-blur-sm"
          >
            <span className="relative z-10">SQL</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dsb-accent/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"></div>
          </ToggleGroupItem>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ToggleGroupItem
                  value="python"
                  disabled
                  tabIndex={-1}
                  aria-disabled="true"
                  className="border-[#333333] opacity-60 cursor-not-allowed data-[state=on]:bg-dsb-accent/40 data-[state=on]:border-dsb-accent/50 data-[state=on]:shadow-sm text-white relative overflow-hidden backdrop-blur-sm"
                >
                  <span className="relative z-10">Python</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dsb-accent/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"></div>
                </ToggleGroupItem>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">Coming soon!</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ToggleGroupItem
                  value="non_coding"
                  disabled
                  tabIndex={-1}
                  aria-disabled="true"
                  className="border-[#333333] opacity-60 cursor-not-allowed data-[state=on]:bg-dsb-accent/40 data-[state=on]:border-dsb-accent/50 data-[state=on]:shadow-sm text-white relative overflow-hidden backdrop-blur-sm"
                >
                  <span className="relative z-10">Non-coding</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dsb-accent/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"></div>
                </ToggleGroupItem>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">Coming soon!</TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </TooltipProvider>
    </div>
  );
};

export default SkillCategorySelector;
