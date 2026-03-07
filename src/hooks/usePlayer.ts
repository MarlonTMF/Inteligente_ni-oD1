import { useState } from 'react';
import { Guardian } from '../types';
import { GUARDIANS } from '../constants/gameConstants';

export function usePlayer() {
    const [playerPos, setPlayerPos] = useState({ q: 0, r: 0 });
    const [isNavigating, setIsNavigating] = useState(false);
    const [activeGuardian, setActiveGuardian] = useState<Guardian | null>(null);

    const movePath = async (
        pathNodes: { q: number, r: number }[],
        guardianKey?: string
    ) => {
        if (guardianKey && GUARDIANS[guardianKey]) {
            setActiveGuardian(GUARDIANS[guardianKey]);
        }

        setIsNavigating(true);
        for (const node of pathNodes) {
            setPlayerPos(node);
            await new Promise(r => setTimeout(r, 300));
        }
        setIsNavigating(false);
    };

    return {
        playerPos,
        setPlayerPos,
        isNavigating,
        setIsNavigating,
        activeGuardian,
        setActiveGuardian,
        movePath
    };
}
