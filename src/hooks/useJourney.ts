import { useState } from 'react';
import { GUARDIAN_SEQUENCE, GUARDIANS } from '../constants/gameConstants';
import { SearchType } from '../types';

export function useJourney() {
    const [currentGuardianIndex, setCurrentGuardianIndex] = useState(-1);
    const [isSequenceActive, setIsSequenceActive] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState<string>('tranquilidad');

    const startJourney = (emotion: string) => {
        setIsSequenceActive(true);
        setCurrentGuardianIndex(0);
        setCurrentEmotion(emotion);
        return GUARDIAN_SEQUENCE[0] as SearchType;
    };

    const nextStep = () => {
        if (currentGuardianIndex < GUARDIAN_SEQUENCE.length - 1) {
            const nextIdx = currentGuardianIndex + 1;
            setCurrentGuardianIndex(nextIdx);
            return GUARDIAN_SEQUENCE[nextIdx] as SearchType;
        }
        setIsSequenceActive(false);
        setCurrentGuardianIndex(-1);
        return null;
    };

    return {
        currentGuardianIndex,
        isSequenceActive,
        setIsSequenceActive,
        currentEmotion,
        setCurrentEmotion,
        startJourney,
        nextStep
    };
}
