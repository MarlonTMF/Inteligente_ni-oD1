import React from 'react';
import { Group, RegularPolygon, Text, Circle } from 'react-konva';
import { HexCell, TERRAIN_CONFIG, TerrainType } from '../types';
import { hexToPixel, HEX_SIZE } from '../utils/hexUtils';

interface HexMapProps {
    grid: HexCell[];
    visited: Set<string>;
    frontier: { q: number, r: number }[];
    path: { q: number, r: number }[];
    targetPos: { q: number, r: number } | null;
    isTechnicalMode: boolean;
    onCellClick: (q: number, r: number) => void;
}

export const HexGrid: React.FC<HexMapProps> = ({
    grid, visited, frontier, path, targetPos, isTechnicalMode, onCellClick
}) => {
    return (
        <>
            {grid.map((cell) => {
                const { x, y } = hexToPixel(cell.q, cell.r);
                const isVisited = visited.has(`${cell.q},${cell.r}`);
                const isFrontier = frontier.some(f => f.q === cell.q && f.r === cell.r);
                const isInPath = path.some(p => p.q === cell.q && p.r === cell.r);
                const isTarget = targetPos?.q === cell.q && targetPos?.r === cell.r;

                return (
                    <Group
                        key={`${cell.q},${cell.r}`}
                        x={x} y={y}
                        onClick={() => onCellClick(cell.q, cell.r)}
                        onTap={() => onCellClick(cell.q, cell.r)}
                    >
                        <RegularPolygon
                            sides={6}
                            radius={HEX_SIZE - 2}
                            fill={TERRAIN_CONFIG[cell.terrain].color}
                            stroke={isTarget ? "#F59E0B" : "#00000011"}
                            strokeWidth={isTarget ? 4 : 1}
                            opacity={isTechnicalMode ? 0.8 : 1}
                            shadowBlur={isTarget ? 20 : 0}
                            shadowColor="#F59E0B"
                        />

                        {isVisited && !isInPath && (
                            <Circle radius={6} fill="#FFF" opacity={0.4} shadowBlur={10} shadowColor="#FFF" />
                        )}
                        {isFrontier && isTechnicalMode && (
                            <RegularPolygon sides={6} radius={HEX_SIZE - 5} stroke="#3B82F6" strokeWidth={2} dash={[5, 2]} />
                        )}
                        {isInPath && (
                            <Circle radius={10} fill="#FCD34D" shadowBlur={15} shadowColor="#FCD34D" />
                        )}

                        {isTechnicalMode && (
                            <Group>
                                <Text text={`${cell.q},${cell.r}`} fontSize={10} fontFamily="monospace" fill="#064E3B" x={-15} y={-15} />
                                <Text text={`C:${cell.cost === Infinity ? '∞' : cell.cost}`} fontSize={10} fontFamily="monospace" fill="#064E3B" x={-15} y={5} />
                            </Group>
                        )}
                    </Group>
                );
            })}
        </>
    );
};
