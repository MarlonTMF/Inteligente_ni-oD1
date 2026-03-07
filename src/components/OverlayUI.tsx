import React from 'react';
import { Terminal, RefreshCcw } from 'lucide-react';
import { SearchType } from '../types';

interface OverlayUIProps {
    isTechnicalMode: boolean;
    setIsTechnicalMode: (val: boolean) => void;
    playerPos: { q: number, r: number };
    frontierCount: number;
    visitedCount: number;
    searchType: SearchType;
    unblockWall: () => void;
    isSequenceActive: boolean;
    currentGuardianIndex: number;
    totalGuardians: number;
}

export const OverlayUI: React.FC<OverlayUIProps> = ({
    isTechnicalMode, setIsTechnicalMode, playerPos, frontierCount, visitedCount,
    searchType, unblockWall, isSequenceActive, currentGuardianIndex, totalGuardians
}) => {
    return (
        <>
            <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none">
                {isTechnicalMode && (
                    <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs border-2 border-emerald-500/30 shadow-2xl pointer-events-auto">
                        <div className="flex items-center gap-2 mb-3 border-b border-emerald-500/20 pb-2">
                            <Terminal size={14} />
                            <span className="font-bold uppercase">Debug Console</span>
                        </div>
                        <p>Posición: ({playerPos.q}, {playerPos.r})</p>
                        <p>Frontera: {frontierCount} nodos</p>
                        <p>Visitados: {visitedCount} nodos</p>
                        <p className="mt-2 text-white">Algoritmo: {searchType}</p>
                    </div>
                )}
            </div>

            <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-auto">
                <button
                    onClick={() => setIsTechnicalMode(!isTechnicalMode)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-900 font-black transition-all shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${isTechnicalMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
                >
                    <Terminal size={20} />
                    {isTechnicalMode ? 'MODO FANTASÍA' : 'MODO TÉCNICO'}
                </button>

                {isSequenceActive && (
                    <div className="bg-white px-4 py-2 rounded-xl border-2 border-slate-900 font-black text-[10px] uppercase shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                        Viaje Actual: {currentGuardianIndex + 1} / {totalGuardians}
                    </div>
                )}

                <button
                    onClick={unblockWall}
                    className="flex items-center gap-2 px-5 py-3 bg-yellow-400 text-slate-900 rounded-2xl border-2 border-slate-900 font-black transition-all shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                    <RefreshCcw size={20} />
                    DISOLVER MURO
                </button>
            </div>
        </>
    );
};
