import { useState, useEffect } from "react";

export function useDifficultyDistribution(questionCount: number) {
    const [easyCount, setEasyCount] = useState(Math.round(questionCount * 0.4));
    const [mediumCount, setMediumCount] = useState(Math.round(questionCount * 0.35));
    const [hardCount, setHardCount] = useState(
        questionCount - Math.round(questionCount * 0.4) - Math.round(questionCount * 0.35)
    );

    // Reset to default distribution when questionCount changes
    useEffect(() => {
        setEasyCount(Math.round(questionCount * 0.4));
        setMediumCount(Math.round(questionCount * 0.35));
        setHardCount(
            questionCount - Math.round(questionCount * 0.4) - Math.round(questionCount * 0.35)
        );
        // eslint-disable-next-line
    }, [questionCount]);

    const isValid = easyCount + mediumCount + hardCount === questionCount;

    const getMaxForField = (field: 'easy' | 'medium' | 'hard') => {
        if (field === 'easy') return questionCount - mediumCount - hardCount + easyCount;
        if (field === 'medium') return questionCount - easyCount - hardCount + mediumCount;
        if (field === 'hard') return questionCount - easyCount - mediumCount + hardCount;
        return questionCount;
    };

    const setBalanced = () => {
        setEasyCount(Math.round(questionCount * 0.4));
        setMediumCount(Math.round(questionCount * 0.35));
        setHardCount(
            questionCount - Math.round(questionCount * 0.4) - Math.round(questionCount * 0.35)
        );
    };
    const setEasyFocused = () => {
        setEasyCount(Math.round(questionCount * 0.7));
        setMediumCount(Math.round(questionCount * 0.2));
        setHardCount(
            questionCount - Math.round(questionCount * 0.7) - Math.round(questionCount * 0.2)
        );
    };
    const setHardcore = () => {
        setEasyCount(Math.round(questionCount * 0.1));
        setMediumCount(Math.round(questionCount * 0.3));
        setHardCount(
            questionCount - Math.round(questionCount * 0.1) - Math.round(questionCount * 0.3)
        );
    };

    return {
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
        setHardcore,
    };
} 