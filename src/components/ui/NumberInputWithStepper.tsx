import React from "react";

interface NumberInputWithStepperProps {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (val: number) => void;
    ariaLabel: string;
}

const NumberInputWithStepper: React.FC<NumberInputWithStepperProps> = ({
    label,
    value,
    min,
    max,
    onChange,
    ariaLabel,
}) => {
    return (
        <div className="flex flex-col items-center w-full">
            <label className="text-dsb-neutral1 text-sm mb-1">{label}</label>
            <div className="relative flex items-center gap-1">
                <input
                    aria-label={ariaLabel}
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    onChange={e => onChange(Math.max(min, Math.min(Number(e.target.value), max)))}
                    className="w-16 text-center text-base font-mono rounded-lg border border-dsb-accent/60 bg-black/70 text-white focus:outline-none focus:border-dsb-accent focus:shadow-[0_0_0_1.5px_#00E2CA] transition-all duration-200 placeholder:text-dsb-neutral2 shadow no-spinner py-1 px-2"
                    style={{ MozAppearance: 'textfield' }}
                    onWheel={e => (e.target as HTMLInputElement).blur()}
                    placeholder="0"
                />
                <div className="flex flex-col ml-1 gap-0.5">
                    <button
                        type="button"
                        className={`p-0.5 rounded-t bg-dsb-accent/10 hover:bg-dsb-accent text-dsb-accent hover:text-black transition text-xs h-5 w-5 flex items-center justify-center ${value >= max ? 'opacity-40 cursor-not-allowed' : ''}`}
                        style={{ lineHeight: 1, fontSize: '0.9em' }}
                        onClick={() => value < max && onChange(value + 1)}
                        tabIndex={-1}
                        aria-label={`Increase ${ariaLabel}`}
                        disabled={value >= max}
                    >▲</button>
                    <button
                        type="button"
                        className={`p-0.5 rounded-b bg-dsb-accent/10 hover:bg-dsb-accent text-dsb-accent hover:text-black transition text-xs h-5 w-5 flex items-center justify-center ${value <= min ? 'opacity-40 cursor-not-allowed' : ''}`}
                        style={{ lineHeight: 1, fontSize: '0.9em' }}
                        onClick={() => value > min && onChange(value - 1)}
                        tabIndex={-1}
                        aria-label={`Decrease ${ariaLabel}`}
                        disabled={value <= min}
                    >▼</button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(NumberInputWithStepper); 