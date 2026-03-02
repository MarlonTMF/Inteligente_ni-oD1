import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Stage, Layer, RegularPolygon, Text, Group, Circle, Line } from 'react-konva';
import { TerrainType, HexCell, TERRAIN_CONFIG, PREDEFINED_RESPONSES, PredefinedResponse } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Map as MapIcon, Play, RefreshCcw, MessageSquare, Mic, Info, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { getCocoResponse } from './services/geminiService';
import confetti from 'canvas-confetti';

// --- Hex Math Helpers ---
const HEX_SIZE = 40;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;

const hexToPixel = (q: number, r: number) => {
  const x = HEX_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = HEX_SIZE * (3 / 2) * r;
  return { x, y };
};

const getNeighbors = (q: number, r: number) => {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];
  return directions.map(d => ({ q: q + d.q, r: r + d.r }));
};

export default function App() {
  // --- State ---
  const [grid, setGrid] = useState<HexCell[]>([]);
  const [playerPos, setPlayerPos] = useState({ q: 0, r: 0 });
  const [targetPos, setTargetPos] = useState<{ q: number, r: number } | null>(null);
  const [isTechnicalMode, setIsTechnicalMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [frontier, setFrontier] = useState<{ q: number, r: number }[]>([]);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<{ q: number, r: number }[]>([]);
  const [cocoMessage, setCocoMessage] = useState('¡Hola! Soy Coco, tu guía emocional. ¿Cómo te sientes hoy?');
  const [showInitialDialog, setShowInitialDialog] = useState(true);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [searchType, setSearchType] = useState<'BFS' | 'DFS' | 'UNIFORM'>('BFS');
  const [userInput, setUserInput] = useState('');
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  // --- Initialization ---
  useEffect(() => {
    const newGrid: HexCell[] = [];
    const range = 4;
    for (let q = -range; q <= range; q++) {
      for (let r = -range; r <= range; r++) {
        if (Math.abs(q + r) <= range) {
          let terrain = TerrainType.MEADOW;
          // Add some forests and walls for variety
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
  }, []);

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setIsTechnicalMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Search Algorithms ---
  const runSearch = async (type: 'BFS' | 'DFS' | 'UNIFORM', forcedTarget?: { q: number, r: number }) => {
    const target = forcedTarget || targetPos;
    if (!target || isSearching) return;
    
    setIsSearching(true);
    setSearchType(type);
    setVisited(new Set());
    setFrontier([]);
    setPath([]);

    const startKey = `0,0`;
    const targetKey = `${target.q},${target.r}`;
    
    // For Uniform Cost (Dijkstra)
    const costs: Record<string, number> = { [startKey]: 0 };
    const parent: Record<string, string | null> = { [startKey]: null };
    
    // Frontier management
    let currentFrontier: { q: number, r: number, priority: number }[] = [{ q: 0, r: 0, priority: 0 }];
    const visitedSet = new Set<string>();

    const step = async () => {
      if (currentFrontier.length === 0) {
        setIsSearching(false);
        return;
      }

      // Sort for Uniform Cost or pick based on BFS/DFS
      let currentIdx = 0;
      if (type === 'BFS') currentIdx = 0;
      else if (type === 'DFS') currentIdx = currentFrontier.length - 1;
      else if (type === 'UNIFORM') {
        currentIdx = currentFrontier.reduce((minIdx, cell, idx, arr) => 
          cell.priority < arr[minIdx].priority ? idx : minIdx, 0);
      }

      const current = currentFrontier.splice(currentIdx, 1)[0];
      const key = `${current.q},${current.r}`;

      if (visitedSet.has(key)) {
        await step();
        return;
      }

      visitedSet.add(key);
      setVisited(new Set(visitedSet));
      setFrontier([...currentFrontier]);

      if (key === targetKey) {
        // Reconstruct path
        const resultPath = [];
        let curr: string | null = targetKey;
        while (curr) {
          const [q, r] = curr.split(',').map(Number);
          resultPath.unshift({ q, r });
          curr = parent[curr];
        }
        setPath(resultPath);
        setIsSearching(false);
        
        const msg = type === 'BFS' ? "He buscado por todos los caminos cercanos al mismo tiempo, ¡así no nos saltaremos ninguna flor de alegría!" :
                    type === 'DFS' ? "He ido muy al fondo de este pensamiento para ver a dónde nos lleva, ¡sujétate fuerte!" :
                    "He buscado el camino que requiere menos esfuerzo emocional, ¡esquivando los bosques pesados!";
        setCocoMessage(msg);
        
        // Animate player along path
        animatePlayer(resultPath);
        return;
      }

      const neighbors = getNeighbors(current.q, current.r);
      for (const n of neighbors) {
        const nKey = `${n.q},${n.r}`;
        const cell = grid.find(c => c.q === n.q && c.r === n.r);
        
        if (cell && cell.terrain !== TerrainType.WALL && !visitedSet.has(nKey)) {
          const newCost = (costs[key] || 0) + cell.cost;
          if (!(nKey in costs) || newCost < costs[nKey]) {
            costs[nKey] = newCost;
            parent[nKey] = key;
            currentFrontier.push({ ...n, priority: type === 'UNIFORM' ? newCost : 0 });
          }
        }
      }

      setTimeout(step, isTechnicalMode ? 100 : 50);
    };

    step();
  };

  const animatePlayer = async (pathNodes: { q: number, r: number }[]) => {
    for (const node of pathNodes) {
      setPlayerPos(node);
      await new Promise(r => setTimeout(r, 300));
    }
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    const finalMsg = "¡Lo logramos! Hemos encontrado el camino hacia la calma. Respira profundo conmigo.";
    setCocoMessage(finalMsg);
  };

  const handlePredefinedSelection = (resp: PredefinedResponse) => {
    // 1. Close dialog immediately and update target
    setShowInitialDialog(false);
    setTargetPos(resp.targetHex);
    
    // 2. Update message
    const msg = `¡Vamos a la zona de ${resp.emotion}!`;
    setCocoMessage(msg);
    
    // 3. Start search passing the target directly to avoid state race
    runSearch('BFS', resp.targetHex);

    // Minimize chat to show the board
    setIsChatMinimized(true);
  };

  const handleCellClick = (q: number, r: number) => {
    if (isSearching || showInitialDialog) return;
    const cell = grid.find(c => c.q === q && c.r === r);
    if (cell && cell.terrain !== TerrainType.WALL) {
      setTargetPos({ q, r });
      runSearch('BFS');
    }
  };

  const unblockWall = () => {
    // CU-03: Superando un bloqueo
    const walls = grid.filter(c => c.terrain === TerrainType.WALL);
    if (walls.length > 0) {
      const randomWall = walls[Math.floor(Math.random() * walls.length)];
      setGrid(prev => prev.map(c => c.q === randomWall.q && c.r === randomWall.r ? { ...c, terrain: TerrainType.MEADOW, cost: 1 } : c));
      const msg = "¡Tu mensaje positivo ha disuelto la nube de miedo! El camino ahora está libre.";
      setCocoMessage(msg);
    }
  };

  const handleUserText = async (text: string) => {
    if (!text.trim()) return;
    
    // If the initial dialog is open, close it and start search
    if (showInitialDialog) {
      setShowInitialDialog(false);
      // Try to find a target based on text or just pick a random one if not found
      const randomTarget = PREDEFINED_RESPONSES[Math.floor(Math.random() * PREDEFINED_RESPONSES.length)].targetHex;
      setTargetPos(randomTarget);
      runSearch('BFS', randomTarget);
      setIsChatMinimized(true);
    }

    const lowerText = text.toLowerCase();
    
    // Check for unblocking keywords
    if (lowerText.includes("todo va a estar bien") || lowerText.includes("puedo") || lowerText.includes("valiente")) {
      unblockWall();
      setUserInput('');
      setIsChatMinimized(true);
      return;
    }

    // Use AI to generate a response if it's not a keyword
    try {
      const aiResponse = await getCocoResponse("Mapa de Emociones", "Explorador", text);
      if (aiResponse) {
        setCocoMessage(aiResponse);
      }
    } catch (error) {
      const fallbackMsg = `Me has dicho: "${text}". ¡Qué interesante! Sigamos explorando este mapa de sentimientos.`;
      setCocoMessage(fallbackMsg);
    }
    
    setUserInput('');
    setIsChatMinimized(true);
  };

  // --- Render ---
  const center = { x: dimensions.width / 2, y: dimensions.height / 2 };

  return (
    <div className="relative w-full h-screen bg-[#F0FDFA] overflow-hidden font-sans text-slate-900">
      {/* --- Hex Map --- */}
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer x={center.x} y={center.y}>
          {/* Grid Cells */}
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
                onClick={() => handleCellClick(cell.q, cell.r)}
                onTap={() => handleCellClick(cell.q, cell.r)}
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
                
                {/* Search Visuals (Huellas de Luz) */}
                {isVisited && !isInPath && (
                  <Circle 
                    radius={6} 
                    fill="#FFF" 
                    opacity={0.4} 
                    shadowBlur={10} 
                    shadowColor="#FFF"
                  />
                )}
                {isFrontier && isTechnicalMode && (
                  <RegularPolygon 
                    sides={6} 
                    radius={HEX_SIZE - 5} 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dash={[5, 2]} 
                  />
                )}
                {isInPath && (
                  <Circle 
                    radius={10} 
                    fill="#FCD34D" 
                    shadowBlur={15} 
                    shadowColor="#FCD34D" 
                  />
                )}

                {/* Technical Info */}
                {isTechnicalMode && (
                  <Group>
                    <Text
                      text={`${cell.q},${cell.r}`}
                      fontSize={10}
                      fontFamily="monospace"
                      fill="#064E3B"
                      x={-15}
                      y={-15}
                    />
                    <Text
                      text={`C:${cell.cost === Infinity ? '∞' : cell.cost}`}
                      fontSize={10}
                      fontFamily="monospace"
                      fill="#064E3B"
                      x={-15}
                      y={5}
                    />
                  </Group>
                )}
              </Group>
            );
          })}

          {/* Player Avatar */}
          {(() => {
            const { x, y } = hexToPixel(playerPos.q, playerPos.r);
            return (
              <Group x={x} y={y}>
                <motion.div>
                  <Circle radius={22} fill="#FFF" stroke="#000" strokeWidth={2} />
                  <Text text="🦖" fontSize={28} x={-14} y={-16} />
                </motion.div>
              </Group>
            );
          })()}
        </Layer>
      </Stage>

      {/* --- UI Overlays --- */}

      {/* Top Left: Status */}
      <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none">
        {isTechnicalMode && (
          <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs border-2 border-emerald-500/30 shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-2 mb-3 border-b border-emerald-500/20 pb-2">
              <Terminal size={14} />
              <span className="font-bold uppercase">Debug Console</span>
            </div>
            <p>Posición: ({playerPos.q}, {playerPos.r})</p>
            <p>Frontera: {frontier.length} nodos</p>
            <p>Visitados: {visited.size} nodos</p>
            <p className="mt-2 text-white">Algoritmo: {searchType}</p>
          </div>
        )}
      </div>

      {/* Top Right: Algorithm Selection */}
      <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-auto">
        <button 
          onClick={() => setIsTechnicalMode(!isTechnicalMode)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-900 font-black transition-all shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${isTechnicalMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
        >
          <Terminal size={20} />
          {isTechnicalMode ? 'MODO FANTASÍA' : 'MODO TÉCNICO'}
        </button>

        {targetPos && !isSearching && (
          <div className="bg-white p-4 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col gap-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selecciona Algoritmo</p>
            <button onClick={() => runSearch('BFS')} className="flex items-center justify-between w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-blue-200 text-blue-700 font-bold text-sm transition-colors">
              BFS (Onda) <Play size={14} />
            </button>
            <button onClick={() => runSearch('DFS')} className="flex items-center justify-between w-full px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-xl border-2 border-purple-200 text-purple-700 font-bold text-sm transition-colors">
              DFS (Profundo) <Play size={14} />
            </button>
            <button onClick={() => runSearch('UNIFORM')} className="flex items-center justify-between w-full px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl border-2 border-emerald-200 text-emerald-700 font-bold text-sm transition-colors">
              Uniforme (Costo) <Play size={14} />
            </button>
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

      {/* Bottom: Coco Dialogue & Text Input */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 pointer-events-none">
        <motion.div 
          layout
          animate={{ height: isChatMinimized ? 'auto' : 'auto' }}
          className="bg-white/95 backdrop-blur-lg p-6 rounded-[3rem] shadow-2xl border-4 border-slate-900 pointer-events-auto flex flex-col gap-4 relative"
        >
          {/* Toggle Button */}
          <button 
            onClick={() => setIsChatMinimized(!isChatMinimized)}
            className="absolute -top-6 left-1/2 -translate-x-1/2 p-3 bg-white border-4 border-slate-900 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform z-10"
          >
            {isChatMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <div className="flex items-center gap-6">
            {/* Coco Avatar */}
            <div className="relative shrink-0">
              <div className={`bg-emerald-400 rounded-2xl border-4 border-slate-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden transition-all ${isChatMinimized ? 'w-16 h-16' : 'w-24 h-24'}`}>
                <span className={`${isChatMinimized ? 'text-4xl' : 'text-6xl'} animate-bounce`}>🦖</span>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="font-black text-[10px] text-emerald-600 uppercase tracking-[0.3em] mb-1">Coco dice:</h2>
              <p className={`${isChatMinimized ? 'text-lg' : 'text-2xl'} font-bold text-slate-800 leading-tight italic line-clamp-2`}>"{cocoMessage}"</p>
            </div>
          </div>

          {!isChatMinimized && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 items-center"
            >
              <div className="relative flex-1">
                <input 
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUserText(userInput)}
                  placeholder="Escribe aquí tu mensaje para Coco..."
                  className="w-full p-4 bg-slate-50 border-4 border-slate-900 rounded-2xl text-lg font-bold focus:outline-none focus:ring-4 ring-emerald-400/30 transition-all"
                />
                <button 
                  onClick={() => handleUserText(userInput)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-xl hover:scale-110 transition-transform"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <button className="p-4 bg-slate-100 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-200 transition-colors">
                <Mic size={20} className="text-slate-400" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Initial Selection Dialog - Simplified for reliability */}
      {showInitialDialog && (
        <div 
          style={{ zIndex: 9999 }}
          className="fixed inset-0 flex items-center justify-center bg-emerald-900/80 backdrop-blur-xl p-6"
        >
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
                    onClick={() => handlePredefinedSelection(resp)}
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
                onClick={() => setShowInitialDialog(false)}
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-xs font-black border-2 border-slate-900 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                SALTAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 flex gap-4 pointer-events-none">
        {Object.entries(TERRAIN_CONFIG).map(([type, config]) => (
          <div key={type} className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: config.color }} />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{config.label} (C:{config.cost === Infinity ? '∞' : config.cost})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
