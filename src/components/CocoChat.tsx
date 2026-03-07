import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, ChevronRight, Mic } from 'lucide-react';

interface CocoChatProps {
    cocoMessage: string;
    isChatMinimized: boolean;
    setIsChatMinimized: (val: boolean) => void;
    userInput: string;
    setUserInput: (val: string) => void;
    interactionMode: 'text' | 'voice';
    toggleInteractionMode: () => void;
    isListening: boolean;
    onMicClick: () => void;
    handleUserText: (text: string) => void;
}

export const CocoChat: React.FC<CocoChatProps> = ({
    cocoMessage, isChatMinimized, setIsChatMinimized, userInput, setUserInput,
    interactionMode, toggleInteractionMode, isListening, onMicClick, handleUserText
}) => {
    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 pointer-events-none">
            <motion.div
                layout
                className="bg-white/95 backdrop-blur-lg p-6 rounded-[3rem] shadow-2xl border-4 border-slate-900 pointer-events-auto flex flex-col gap-4 relative z-[1000]"
            >
                <button
                    onClick={() => setIsChatMinimized(!isChatMinimized)}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 p-3 bg-white border-4 border-slate-900 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform z-10"
                >
                    {isChatMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <div className="flex items-center gap-6">
                    <div className="relative shrink-0">
                        <div className={`bg-emerald-400 rounded-2xl border-4 border-slate-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden transition-all ${isChatMinimized ? 'w-16 h-16' : 'w-24 h-24'}`}>
                            <span className={`${isChatMinimized ? 'text-4xl' : 'text-6xl'} animate-bounce`}>🦖</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <h2 className="font-black text-[10px] text-emerald-600 uppercase tracking-[0.3em] mb-1">Coco dice:</h2>
                        <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={cocoMessage}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.4 }}
                                    className={`${isChatMinimized ? 'text-lg line-clamp-1' : 'text-2xl'} font-bold text-slate-800 leading-tight italic`}
                                >
                                    "{cocoMessage}"
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                        <button
                            onClick={toggleInteractionMode}
                            className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 text-[9px] font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 z-[1001] pointer-events-auto ${interactionMode === 'voice' ? 'bg-emerald-400' : 'bg-slate-100'}`}
                        >
                            {interactionMode === 'voice' ? 'MODO VOZ' : 'MODO TEXTO'}
                        </button>
                        <button
                            onClick={onMicClick}
                            disabled={isListening}
                            className={`p-3 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:scale-110 active:scale-90 z-[1001] pointer-events-auto ${isListening ? 'bg-red-400 animate-pulse' : 'bg-slate-100 hover:bg-slate-200'}`}
                        >
                            <Mic size={18} className={isListening ? 'text-white' : 'text-slate-400'} />
                        </button>
                    </div>
                </div>

                {!isChatMinimized && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUserText(userInput)}
                                placeholder={interactionMode === 'voice' ? "Presiona el micro para hablar..." : "Escribe aquí tu mensaje para Coco..."}
                                className="w-full p-4 bg-slate-50 border-4 border-slate-900 rounded-2xl text-lg font-bold focus:outline-none focus:ring-4 ring-emerald-400/30 transition-all"
                                disabled={interactionMode === 'voice'}
                            />
                            <button
                                onClick={() => handleUserText(userInput)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-xl hover:scale-110 transition-transform"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
