import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GUARDIANS } from '../constants/gameConstants';

export function GuardianSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white/90 border-y border-l border-slate-200 p-3 rounded-l-2xl shadow-lg hover:bg-white transition-colors flex flex-col gap-2 items-center"
            >
                <span className="text-xl">🛡️</span>
                <div className="[writing-mode:vertical-lr] font-bold text-xs text-slate-500 uppercase tracking-[0.2em] py-2">
                    Guardianes
                </div>
            </button>

            {/* Sidebar Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="w-80 h-[85vh] bg-white/95 backdrop-blur-md border-l border-slate-200 shadow-2xl overflow-y-auto p-6 flex flex-col gap-6"
                    >
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <h2 className="text-xl font-bold text-slate-800">Códice de Guardianes</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-8">
                            {Object.values(GUARDIANS).map((g) => (
                                <div key={g.id} className="relative group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-slate-100"
                                            style={{ backgroundColor: `${g.color}33` }}
                                        >
                                            {g.emoji}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{g.name}</h3>
                                            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: g.color }}>
                                                {g.role}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pl-2 border-l-2 border-slate-100 ml-5">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Algoritmo</span>
                                            <p className="text-sm font-medium text-slate-700">{g.id === 'UNIFORM' ? 'Uniform Cost Search' : g.id === 'ASTAR' ? 'A*' : g.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Esencia</span>
                                            <p className="text-xs text-slate-600 italic">"{g.lore}"</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Estrategia Técnica</span>
                                            <p className="text-[11px] text-slate-500">{g.strategy}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                                Cada guardián representa una forma de procesar la información y las emociones.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
