import React from 'react';
import { MessageSquare, ChevronRight, Info } from 'lucide-react';
import { PredefinedResponse } from '../types';
import { PREDEFINED_RESPONSES } from '../constants/gameConstants';

interface InitialDialogProps {
    onSelect: (resp: PredefinedResponse) => void;
    onSkip: () => void;
}

export const InitialDialog: React.FC<InitialDialogProps> = ({ onSelect, onSkip }) => {
    return (
        <div style={{ zIndex: 9999 }} className="fixed inset-0 flex items-center justify-center bg-emerald-900/80 backdrop-blur-xl p-6">
            <div className="bg-white w-full max-w-xl rounded-[3rem] border-8 border-slate-900 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-emerald-100 rounded-3xl border-4 border-slate-900">
                            <MessageSquare size={32} className="text-emerald-600" />
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tight">¿Cómo te sientes?</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {PREDEFINED_RESPONSES.map((resp) => (
                            <button
                                key={resp.id}
                                onClick={() => onSelect(resp)}
                                className="group flex items-center justify-between p-6 bg-slate-50 hover:bg-emerald-50 border-4 border-slate-900 rounded-2xl transition-all active:translate-y-1"
                            >
                                <span className="text-xl font-black text-slate-800">"{resp.text}"</span>
                                <ChevronRight className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-50 p-6 border-t-8 border-slate-900 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Info size={18} className="text-slate-400" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Elige una emoción</span>
                    </div>
                    <button
                        onClick={onSkip}
                        className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-xs font-black border-2 border-slate-900 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        SALTAR
                    </button>
                </div>
            </div>
        </div>
    );
};
