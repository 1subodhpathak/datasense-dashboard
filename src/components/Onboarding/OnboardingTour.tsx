import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface OnboardingStep {
    target: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const steps: OnboardingStep[] = [
    {
        target: '[data-tour="challenges"]',
        title: "Choose Your Battle",
        description: "Select from various challenge types: Bullet Surge for quick matches, Rapid Sprint for speed challenges, or Daily Dash for consistent practice.",
        position: 'bottom'
    },
    {
        target: '[data-tour="difficulty"]',
        title: "Set Your Level",
        description: "Choose your difficulty level. Start with beginner and work your way up as you improve your skills.",
        position: 'top'
    },
    {
        target: '[data-tour="skills"]',
        title: "Pick Your Skills",
        description: "Select the skills you want to focus on. Master SQL queries, Python programming, or try non-coding challenges.",
        position: 'top'
    },
    {
        target: '[data-tour="customize"]',
        title: "Customize Your Experience",
        description: "Fine-tune your challenge settings, including question count and sound preferences.",
        position: 'left'
    }
];

interface TooltipProps {
    step: OnboardingStep;
    onNext: () => void;
    onPrevious: () => void;
    onClose: () => void;
    currentStep: number;
    totalSteps: number;
}

const Tooltip: React.FC<TooltipProps> = ({
    step,
    onNext,
    onPrevious,
    onClose,
    currentStep,
    totalSteps
}) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    const margin = 24; // Increased margin for safety

    useEffect(() => {
        const target = document.querySelector(step.target);
        const sidebar = document.querySelector('[data-sidebar="sidebar"]');
        if (target) {
            const rect = target.getBoundingClientRect();
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            // Get sidebar bounding box (if present)
            let sidebarRect = null;
            if (sidebar) {
                sidebarRect = sidebar.getBoundingClientRect();
            }

            function isOverlappingSidebar(top: number, left: number) {
                if (!sidebarRect) return false;
                // Check if tooltip box would overlap sidebar box
                const tooltipBox = {
                    left,
                    right: left + tooltipWidth,
                    top,
                    bottom: top + tooltipHeight
                };
                return !(
                    tooltipBox.right < sidebarRect.left ||
                    tooltipBox.left > sidebarRect.right ||
                    tooltipBox.bottom < sidebarRect.top ||
                    tooltipBox.top > sidebarRect.bottom
                );
            }

            function isWithinViewportAndNotSidebar(top: number, left: number) {
                return (
                    left >= margin &&
                    left + tooltipWidth <= viewport.width - margin &&
                    top >= scrollY + margin &&
                    top + tooltipHeight <= scrollY + viewport.height - margin &&
                    !isOverlappingSidebar(top, left)
                );
            }

            // Try all positions in order of preference
            const positions: ('top' | 'bottom' | 'left' | 'right')[] = [
                step.position,
                step.position === 'left' ? 'right' : step.position === 'right' ? 'left' : step.position === 'top' ? 'bottom' : 'top',
                'top',
                'bottom',
                'left',
                'right'
            ];
            let found = false;
            let top = 0;
            let left = 0;
            for (const pos of positions) {
                switch (pos) {
                    case 'top':
                        top = rect.top + scrollY - tooltipHeight - 12;
                        left = rect.left + scrollX + (rect.width - tooltipWidth) / 2;
                        break;
                    case 'bottom':
                        top = rect.bottom + scrollY + 12;
                        left = rect.left + scrollX + (rect.width - tooltipWidth) / 2;
                        break;
                    case 'left':
                        top = rect.top + scrollY + (rect.height - tooltipHeight) / 2;
                        left = rect.left + scrollX - tooltipWidth - 12;
                        break;
                    case 'right':
                        top = rect.top + scrollY + (rect.height - tooltipHeight) / 2;
                        left = rect.right + scrollX + 12;
                        break;
                }
                if (isWithinViewportAndNotSidebar(top, left)) {
                    found = true;
                    break;
                }
            }
            // Clamp to viewport and avoid sidebar if no position fits
            if (!found) {
                // Default to right of sidebar if possible
                if (sidebarRect) {
                    left = sidebarRect.right + 16;
                    top = rect.top + scrollY;
                    // Clamp to viewport
                    if (left + tooltipWidth > viewport.width - margin) left = viewport.width - tooltipWidth - margin;
                    if (top + tooltipHeight > scrollY + viewport.height - margin) top = scrollY + viewport.height - tooltipHeight - margin;
                    if (top < scrollY + margin) top = scrollY + margin;
                } else {
                    if (left < margin) left = margin;
                    if (left + tooltipWidth > viewport.width - margin) left = viewport.width - tooltipWidth - margin;
                    if (top < scrollY + margin) top = scrollY + margin;
                    if (top + tooltipHeight > scrollY + viewport.height - margin) top = scrollY + viewport.height - tooltipHeight - margin;
                }
            }
            setPosition({ top, left });

            // Ensure target element is in view
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }, [step]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50"
            style={{
                top: position.top,
                left: position.left,
                width: 320
            }}
        >
            <div className="relative bg-[#1a1f2e]/90 border border-[#00E2CA]/20 rounded-xl p-4 shadow-[0_8px_32px_rgba(0,226,202,0.1)]">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00E2CA]/5 to-transparent opacity-50" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>

                {/* Content */}
                <div className="relative z-10">
                    <h3 className="text-lg font-semibold mb-2 text-[#00E2CA]">
                        {step.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                        {step.description}
                    </p>

                    {/* Progress and navigation */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-300 ${i === currentStep
                                        ? 'w-4 bg-[#00E2CA]'
                                        : 'w-2 bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            {currentStep > 0 && (
                                <button
                                    onClick={onPrevious}
                                    className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={currentStep === totalSteps - 1 ? onClose : onNext}
                                className="px-4 py-1 rounded-full bg-[#00E2CA]/20 border border-[#00E2CA]/30 text-white text-sm hover:bg-[#00E2CA]/30 transition-all duration-300"
                            >
                                {currentStep === totalSteps - 1 ? "Get Started" : "Next"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

interface OnboardingTourProps {
    isOpen: boolean;
    onClose: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            // Add highlight effect to the current target
            const target = document.querySelector(steps[currentStep].target);
            if (target) {
                target.classList.add('ring-2', 'ring-[#00E2CA]', 'ring-offset-2', 'ring-offset-[#0D1219]');
            }

            return () => {
                // Clean up highlight effect
                const target = document.querySelector(steps[currentStep].target);
                if (target) {
                    target.classList.remove('ring-2', 'ring-[#00E2CA]', 'ring-offset-2', 'ring-offset-[#0D1219]');
                }
            };
        }
    }, [currentStep, isOpen]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setCurrentStep(0);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

            {/* Tooltip */}
            <AnimatePresence>
                <Tooltip
                    key={currentStep}
                    step={steps[currentStep]}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onClose={handleClose}
                    currentStep={currentStep}
                    totalSteps={steps.length}
                />
            </AnimatePresence>
        </>
    );
};

export default OnboardingTour; 