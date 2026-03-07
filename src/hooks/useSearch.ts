import { useState } from 'react';
import { HexCell, SearchType } from '../types';
import { navigationService } from '../services/navigationService';

export function useSearch() {
    const [isSearching, setIsSearching] = useState(false);
    const [searchType, setSearchType] = useState<SearchType>('BFS');
    const [visited, setVisited] = useState<Set<string>>(new Set());
    const [frontier, setFrontier] = useState<{ q: number, r: number }[]>([]);
    const [path, setPath] = useState<{ q: number, r: number }[]>([]);

    const runSearch = async (
        type: SearchType,
        start: { q: number, r: number },
        target: { q: number, r: number },
        grid: HexCell[],
        isTechnicalMode: boolean,
        onPathFound?: (resultPath: { q: number, r: number }[]) => void
    ) => {
        if (isSearching) return;

        setIsSearching(true);
        setSearchType(type);
        setVisited(new Set());
        setFrontier([]);
        setPath([]);

        const gridCosts: Record<string, number> = {};
        grid.forEach(cell => {
            gridCosts[`${cell.q},${cell.r}`] = cell.cost;
        });

        try {
            const data = await navigationService.findPath({
                type,
                start,
                target,
                gridCosts
            });

            if (data.status === 'success') {
                const { path: resultPath, explored } = data;

                const visitedSet = new Set<string>();
                for (const step of explored) {
                    visitedSet.add(`${step.q},${step.r}`);
                    setVisited(new Set(visitedSet));
                    await new Promise(r => setTimeout(r, isTechnicalMode ? 50 : 20));
                }

                setPath(resultPath);
                if (onPathFound) onPathFound(resultPath);
            }
            return data;
        } catch (error) {
            console.error("Error in runSearch:", error);
            throw error;
        } finally {
            setIsSearching(false);
        }
    };

    return {
        isSearching,
        searchType,
        visited,
        frontier,
        path,
        setPath,
        setVisited,
        runSearch
    };
}
