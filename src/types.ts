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
  [TerrainType.MEADOW]: { cost: 1, color: "#A7F3D0", label: "Pradera" }, // Light green
  [TerrainType.FOREST]: { cost: 3, color: "#065F46", label: "Bosque de la Confusión" }, // Dark green
  [TerrainType.WALL]: { cost: Infinity, color: "#4B5563", label: "Muro de Miedo" }, // Gray
};

export interface PredefinedResponse {
  id: string;
  text: string;
  emotion: string;
  targetHex: { q: number; r: number };
}

export const PREDEFINED_RESPONSES: PredefinedResponse[] = [
  { id: "1", text: "Me siento solo", emotion: "sadness", targetHex: { q: 3, r: -3 } },
  { id: "2", text: "¡Estoy muy emocionado!", emotion: "joy", targetHex: { q: 0, r: 3 } },
  { id: "3", text: "Tengo un poco de miedo", emotion: "fear", targetHex: { q: -3, r: 3 } },
  { id: "4", text: "Estoy tranquilo", emotion: "calm", targetHex: { q: 3, r: 0 } },
];
