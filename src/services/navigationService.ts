import { HexCell, SearchType } from '../types';

export const navigationService = {
    async findPath(params: {
        type: SearchType;
        start: { q: number; r: number };
        target: { q: number; r: number };
        gridCosts: Record<string, number>;
    }) {
        const response = await fetch('http://localhost:5000/find-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        return await response.json();
    },

    async listenVoice() {
        const response = await fetch('http://localhost:5000/listen');
        return await response.json();
    }
};
