export enum TerrainType {
  MEADOW = "meadow",
  FOREST = "forest",
  WALL = "wall",
}

export interface HexCell {
  q: number;
  r: number;
  terrain: TerrainType;
  cost: number;
  isTarget?: boolean;
  isStart?: boolean;
}

export const TERRAIN_CONFIG = {
  [TerrainType.MEADOW]: { cost: 1, color: "#A7F3D0", label: "Pradera" },
  [TerrainType.FOREST]: { cost: 3, color: "#065F46", label: "Bosque de la Confusión" },
  [TerrainType.WALL]: { cost: Infinity, color: "#4B5563", label: "Muro de Miedo" },
};

export interface PredefinedResponse {
  id: string;
  text: string;
  emotion: string;
  targetHex: { q: number; r: number };
}

export interface Guardian {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  lore: string;
  technique: string;
  instruction: string;
  strategy: string;
  advice: string;
}

export type SearchType = 'BFS' | 'DFS' | 'UNIFORM' | 'ASTAR';
