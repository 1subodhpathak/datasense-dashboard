import { Settings, Volume2, VolumeX, Share2, Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import NumberInputWithStepper from "@/components/ui/NumberInputWithStepper";
import { useDifficultyDistribution } from "@/hooks/useDifficultyDistribution";

interface CustomizeOptionsProps {
  questionCount: number;
  timer: number;
  soundEnabled: boolean;
  showCustomize: boolean;
  onQuestionCountChange: (count: number) => void;
  onTimerChange: (minutes: number) => void;
  onSoundEnabledChange: (enabled: boolean) => void;
  onShowCustomizeChange: (show: boolean) => void;
}

const CustomizeOptions = ({
  questionCount,
  timer,
  soundEnabled,
  showCustomize,
  onQuestionCountChange,
  onTimerChange,
  onSoundEnabledChange,
  onShowCustomizeChange
}: CustomizeOptionsProps) => {
  const [showBubbleQ, setShowBubbleQ] = useState(false);
  const [showBubbleT, setShowBubbleT] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);

  // Replace the difficulty state and logic with the custom hook
  const {
    easyCount,
    setEasyCount,
    mediumCount,
    setMediumCount,
    hardCount,
    setHardCount,
    isValid,
    getMaxForField,
    setBalanced,
    setEasyFocused,
    setHardcore
  } = useDifficultyDistribution(questionCount);

  const handleEasyChange = (val: number) => {
    let max = getMaxForField('easy');
    let easy = Math.max(0, Math.min(val, max));
    setEasyCount(easy);
  };
  const handleMediumChange = (val: number) => {
    let max = getMaxForField('medium');
    let medium = Math.max(0, Math.min(val, max));
    setMediumCount(medium);
  };
  const handleHardChange = (val: number) => {
    let max = getMaxForField('hard');
    let hard = Math.max(0, Math.min(val, max));
    setHardCount(hard);
  };

  return (
    <Collapsible open={showCustomize} onOpenChange={onShowCustomizeChange}>
      <CollapsibleTrigger className="flex items-center gap-2 text-dsb-neutral1 text-lg font-semibold hover:text-dsb-accent transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dsb-accent mb-4">
        <span>Advanced options</span>
        <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
        {showCustomize && (
          <span className="text-dsb-accent text-xs ml-2">Enabled</span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="rounded-2xl bg-black/60 border border-dsb-accent/30 shadow-xl p-8 max-w-xl mx-auto backdrop-blur-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4 group">
            <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
            <span className="font-bold text-lg text-white">Customize</span>
          </div>
          {/* Question Quantity always visible */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-dsb-neutral1 text-sm font-semibold">Question Quantity</label>
              <Info className="h-4 w-4 text-dsb-accent" aria-label="Set how many questions you want in your challenge." tabIndex={0} />
            </div>
            <div className="relative">
              <Slider
                defaultValue={[questionCount]}
                max={100}
                step={1}
                onValueChange={value => onQuestionCountChange(value[0])}
                onPointerDown={() => setShowBubbleQ(true)}
                onPointerUp={() => setShowBubbleQ(false)}
                className="[&_.rt-SliderRange]:bg-dsb-accent [&_.rt-SliderThumb]:bg-dsb-accent [&_.rt-SliderThumb]:border-dsb-accent transition-all duration-300"
                aria-label="Question Quantity"
              />
              {showBubbleQ && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-dsb-accent text-black px-3 py-1 rounded shadow text-xs font-bold animate-fade-in">
                  {questionCount}
                </div>
              )}
            </div>
            <div className="flex justify-end text-white text-sm mt-1">{questionCount}</div>
          </div>
          {/* Advanced options dropdown */}
          <Collapsible open={difficultyOpen} onOpenChange={setDifficultyOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-dsb-neutral1 text-sm hover:text-dsb-accent transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dsb-accent">
              <span>Distribute Questions by Difficulty</span>
              <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="rounded-xl bg-black/60 border border-dsb-neutral3 p-4 shadow-md transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col items-center w-full md:w-1/3">
                    <label htmlFor="easy-input" className="text-dsb-neutral1 text-sm mb-1">Easy</label>
                    <div className="relative flex items-center gap-1">
                      <NumberInputWithStepper
                        label="Easy"
                        value={easyCount}
                        min={0}
                        max={getMaxForField('easy')}
                        onChange={setEasyCount}
                        ariaLabel="Easy questions"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-full md:w-1/3">
                    <label htmlFor="medium-input" className="text-dsb-neutral1 text-sm mb-1">Medium</label>
                    <div className="relative flex items-center gap-1">
                      <NumberInputWithStepper
                        label="Medium"
                        value={mediumCount}
                        min={0}
                        max={getMaxForField('medium')}
                        onChange={setMediumCount}
                        ariaLabel="Medium questions"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-full md:w-1/3">
                    <label htmlFor="hard-input" className="text-dsb-neutral1 text-sm mb-1">Hard</label>
                    <div className="relative flex items-center gap-1">
                      <NumberInputWithStepper
                        label="Hard"
                        value={hardCount}
                        min={0}
                        max={getMaxForField('hard')}
                        onChange={setHardCount}
                        ariaLabel="Hard questions"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 justify-center">
                  <button type="button" onClick={setBalanced} className="px-3 py-1 rounded bg-dsb-accent/20 text-dsb-accent hover:bg-dsb-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-dsb-accent transition-all">Balanced</button>
                  <button type="button" onClick={setEasyFocused} className="px-3 py-1 rounded bg-dsb-accent/20 text-dsb-accent hover:bg-dsb-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-dsb-accent transition-all">Easy Focused</button>
                  <button type="button" onClick={setHardcore} className="px-3 py-1 rounded bg-dsb-accent/20 text-dsb-accent hover:bg-dsb-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-dsb-accent transition-all">Hardcore</button>
                </div>
                <div className={`mt-4 text-xs font-semibold transition-colors duration-300 ${isValid ? 'text-green-400' : 'text-red-400 animate-pulse'}`} aria-live="polite">
                  Total: {easyCount + mediumCount + hardCount} / {questionCount}
                  {!isValid && <span className="ml-2">Sum must match!</span>}
                </div>
                <div className="text-dsb-neutral2 text-xs mt-2">Distribute your questions by difficulty. The total must match your selected question count.</div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          {/* Timer */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-dsb-neutral1 text-sm font-semibold">Timer (minutes)</label>
              <Info className="h-4 w-4 text-dsb-accent" aria-label="Set the total time for your challenge." tabIndex={0} />
            </div>
            <div className="relative flex items-center gap-4">
              <Slider
                defaultValue={[timer]}
                min={1}
                max={1200}
                step={1}
                value={[timer]}
                onValueChange={value => onTimerChange(value[0])}
                onPointerDown={() => setShowBubbleT(true)}
                onPointerUp={() => setShowBubbleT(false)}
                className="flex-1 [&_.rt-SliderRange]:bg-dsb-accent [&_.rt-SliderThumb]:bg-dsb-accent [&_.rt-SliderThumb]:border-dsb-accent transition-all duration-300"
                aria-label="Timer (minutes)"
              />
              <div className="relative flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={1200}
                  value={timer}
                  onChange={e => onTimerChange(Number(e.target.value))}
                  aria-label="Timer input (minutes)"
                  className="w-16 text-center text-base font-mono rounded-lg border border-dsb-accent/60 bg-black/70 text-white focus:outline-none focus:border-dsb-accent focus:shadow-[0_0_0_1.5px_#00E2CA] transition-all duration-200 placeholder:text-dsb-neutral2 shadow no-spinner py-1 px-2"
                  style={{ MozAppearance: 'textfield' }}
                  onWheel={e => (e.target as HTMLInputElement).blur()}
                  placeholder="min"
                />
                <div className="flex flex-col ml-1 gap-0.5">
                  <button
                    type="button"
                    className="p-0.5 rounded-t bg-dsb-accent/10 hover:bg-dsb-accent text-dsb-accent hover:text-black transition text-xs h-5 w-5 flex items-center justify-center"
                    style={{ lineHeight: 1, fontSize: '0.9em' }}
                    onClick={() => onTimerChange(Math.min(timer + 1, 1200))}
                    tabIndex={-1}
                    aria-label="Increase timer"
                  >▲</button>
                  <button
                    type="button"
                    className="p-0.5 rounded-b bg-dsb-accent/10 hover:bg-dsb-accent text-dsb-accent hover:text-black transition text-xs h-5 w-5 flex items-center justify-center"
                    style={{ lineHeight: 1, fontSize: '0.9em' }}
                    onClick={() => onTimerChange(Math.max(timer - 1, 1))}
                    tabIndex={-1}
                    aria-label="Decrease timer"
                  >▼</button>
                </div>
                <style>{`
                  input.no-spinner::-webkit-inner-spin-button,
                  input.no-spinner::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                  }
                  input.no-spinner {
                    -moz-appearance: textfield;
                  }
                `}</style>
              </div>
              {showBubbleT && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-dsb-accent text-black px-3 py-1 rounded shadow text-xs font-bold animate-fade-in">
                  {timer}
                </div>
              )}
            </div>
          </div>
          {/* Sound Toggle */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-dsb-neutral1 text-sm">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Sound Effects
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={onSoundEnabledChange}
              className="data-[state=checked]:bg-dsb-accent transition-all duration-300"
              aria-label="Sound Effects"
            />
          </div>
          {/* Share Feature */}
          <button className="text-dsb-neutral1 text-sm flex items-center gap-2 hover:text-dsb-accent transition-colors">
            <Share2 className="h-4 w-4" />
            Generate Challenge Link
          </button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CustomizeOptions;
