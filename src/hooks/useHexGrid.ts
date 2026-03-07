import React, { useState, useEffect } from 'react';
import { HexCell, TerrainType, TERRAIN_CONFIG } from '../types';

export function useHexGrid(range: number = 4) {
    const [grid, setGrid] = useState<HexCell[]>([]);

    useEffect(() => {
        const newGrid: HexCell[] = [];
        for (let q = -range; q <= range; q++) {
            for (let r = -range; r <= range; r++) {
                if (Math.abs(q + r) <= range) {
                    let terrain = TerrainType.MEADOW;
                    const dist = Math.sqrt(q * q + r * r);
                    if (dist > 2 && Math.random() > 0.6) terrain = TerrainType.FOREST;
                    if (dist > 1 && Math.random() > 0.85) terrain = TerrainType.WALL;

                    newGrid.push({
                        q, r,
                        terrain,
                        cost: TERRAIN_CONFIG[terrain].cost,
                        isStart: q === 0 && r === 0
                    });
                }
            }
        }
        setGrid(newGrid);
    }, [range]);

    const unblockWall = () => {
        const walls = grid.filter(c => c.terrain === TerrainType.WALL);
        if (walls.length > 0) {
            const randomWall = walls[Math.floor(Math.random() * walls.length)];
            setGrid(prev => prev.map(c =>
                c.q === randomWall.q && c.r === randomWall.r
                    ? { ...c, terrain: TerrainType.MEADOW, cost: 1 }
                    : c
            ));
            return true;
        }
        return false;
    };

    return { grid, updateGrid: setGrid, unblockWall };
}
