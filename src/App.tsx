import React, { useState, useEffect } from 'react';
import { Stage, Layer, Circle, Text, Group } from 'react-konva';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

// --- Domain Layers (Clean Architecture) ---
import { TERRAIN_CONFIG, PredefinedResponse } from './types';
import { hexToPixel } from './utils/hexUtils';
import { GUARDIANS, GUARDIAN_SEQUENCE } from './constants/gameConstants';
import { getCocoResponse } from './services/geminiService';
import { speak, startListening } from './services/voiceService';

// --- Hooks ---
import { useHexGrid } from './hooks/useHexGrid';
import { useSearch } from './hooks/useSearch';
import { usePlayer } from './hooks/usePlayer';
import { useJourney } from './hooks/useJourney';

// --- Components ---
import { HexGrid } from './components/HexGrid';
import { CocoChat } from './components/CocoChat';
import { OverlayUI } from './components/OverlayUI';
import { InitialDialog } from './components/InitialDialog';
import { GuardianSidebar } from './components/GuardianSidebar';

export default function App() {
  // --- presentation state ---
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isTechnicalMode, setIsTechnicalMode] = useState(false);
  const [showInitialDialog, setShowInitialDialog] = useState(true);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [cocoMessage, setCocoMessage] = useState('¡Hola! Soy Coco, tu guía emocional. ¿Cómo te sientes hoy?');
  const [userInput, setUserInput] = useState('');
  const [interactionMode, setInteractionMode] = useState<'text' | 'voice'>('text');
  const [isListening, setIsListening] = useState(false);

  // --- Game State hooks ---
  const { grid, updateGrid, unblockWall } = useHexGrid();
  const {
    visited, frontier, path, setPath, setVisited, runSearch
  } = useSearch();
  const {
    playerPos, setPlayerPos, isNavigating, activeGuardian, movePath
  } = usePlayer();
  const {
    currentGuardianIndex, isSequenceActive,
    currentEmotion, startJourney, nextStep
  } = useJourney();

  const [targetPos, setTargetPos] = useState<{ q: number, r: number } | null>(null);
  const [isBlockedByChallenge, setIsBlockedByChallenge] = useState(false);
  const [challengePhrase, setChallengePhrase] = useState('');
  const [isAtCheckpoint, setIsAtCheckpoint] = useState(false);

  // Interaction phases: 'greeting' | 'midway' | 'wall' | 'objective'
  const [interactionPhase, setInteractionPhase] = useState<'greeting' | 'midway' | 'wall' | 'objective'>('greeting');
  const [segments, setSegments] = useState<{ midway: any[], wall: any[], objective: any[] }>({
    midway: [], wall: [], objective: []
  });

  // --- Initialization ---
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

  // --- Voice Synthesis ---
  useEffect(() => {
    if (cocoMessage) {
      speak(cocoMessage);
    }
  }, [cocoMessage]);

  // --- Logic Handlers ---
  const handleChallengeComplete = () => {
    setIsBlockedByChallenge(false);
    setInteractionPhase('objective');

    setCocoMessage(`¡Así es! La verdad ha sido reconocida y el nudo se ha disuelto. El destino nos recibe.`);

    // Final move to objective
    setTimeout(async () => {
      await movePath(segments.objective);

      const advice = activeGuardian?.advice || "Sigue adelante con calma.";
      setCocoMessage(`${activeGuardian?.name} nos deja este último consejo: "${advice}"`);

      setTimeout(() => {
        const nextGuardian = nextStep();
        if (nextGuardian) {
          setInteractionPhase('greeting');
          const nextGuardianType = nextGuardian;
          const guardian = GUARDIANS[nextGuardianType];
          setCocoMessage(`¡Regresemos al centro! Prepárate para conocer a ${guardian.name}. ${guardian.emoji} "${guardian.lore}"`);

          setTimeout(() => {
            setPlayerPos({ q: 0, r: 0 });
            setPath([]);
            setVisited(new Set());
          }, 3000);
        } else {
          setCocoMessage(`¡Lo has logrado! Has integrado las cuatro visiones de los guardianes. Tu corazón está en equilibrio.`);
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          setTimeout(() => setCocoMessage(`Hemos alcanzado la esencia de la ${currentEmotion}. Que esta paz te acompañe siempre.`), 4000);
        }
      }, 4000);
    }, 1000);
  };

  const handlePredefinedSelection = (resp: PredefinedResponse) => {
    setShowInitialDialog(false);
    setTargetPos(resp.targetHex);
    const firstGuardianKey = startJourney(resp.emotion);
    const guardian = GUARDIANS[firstGuardianKey];

    setInteractionPhase('greeting');
    setCocoMessage(`¡Iniciamos el viaje! Soy ${guardian.name}, tu guía. ${guardian.instruction}. ¿Estás listo para empezar?`);
    setIsChatMinimized(false);
  };

  const handleCheckpointReached = () => {
    setIsAtCheckpoint(true);
    setInteractionPhase('midway');
    const advice = activeGuardian?.advice || "Sigue adelante con calma.";
    setCocoMessage(`Nos detenemos un momento. ${activeGuardian?.name} dice: "${advice}" ¿Cómo resuena esto en ti?`);
    setIsChatMinimized(false);
  };

  const handleFinalBlockageReached = () => {
    const emotionChallenges: any = {
      'tristeza': ["Incluso en la noche más larga, el cielo sigue ahí", "Mis lágrimas son ríos que limpian mi mirada"],
      'alegria': ["Mi luz es un regalo que comparto con el mundo", "Celebro el simple hecho de existir y sentir"],
      'miedo': ["Miro al vacío y encuentro mi propias alas", "Mi voluntad es más antigua que mis temores"],
      'calma': ["Soy el silencio entre dos notas musicales", "Fluyo sin resistencia como el agua del manantial"]
    };
    const phrases = emotionChallenges[currentEmotion] || emotionChallenges['calma'];
    const selected = phrases[Math.floor(Math.random() * phrases.length)];
    setChallengePhrase(selected);
    setIsBlockedByChallenge(true);
    setInteractionPhase('wall');
    setCocoMessage(`¡Un instante! Un muro de sombras aparece antes de la meta. Necesitamos tu frase de poder.`);
    setIsChatMinimized(false);
  };

  const splitPathIntoSegments = (fullPath: any[]) => {
    const midIdx = Math.max(1, Math.floor(fullPath.length / 2));
    const midway = fullPath.slice(0, midIdx);
    const wallPlusTarget = fullPath.slice(midIdx);

    // objective is just the last one
    const objective = wallPlusTarget.slice(-1);
    const wall = wallPlusTarget.slice(0, -1);

    return { midway, wall, objective };
  };

  const handleUserText = async (text: string, isFromVoice: boolean = false) => {
    if (!text.trim()) return;
    const lowerText = text.toLowerCase();
    setUserInput('');

    if (isFromVoice) {
      setCocoMessage(`Dijiste: "${text}"`);
      await new Promise(r => setTimeout(r, 1500)); // Pause to show detection
    }

    if (interactionPhase === 'greeting') {
      const gType = GUARDIAN_SEQUENCE[currentGuardianIndex];
      setCocoMessage(`Muy bien. ${activeGuardian?.name || GUARDIANS[gType].name} está trazando el camino...`);
      setIsChatMinimized(true);

      runSearch(gType as any, playerPos, targetPos!, grid, isTechnicalMode, (p) => {
        if (!p || p.length === 0) {
          setCocoMessage("Mis ojos no logran ver un camino claro en este momento. Intentemos de nuevo.");
          setIsChatMinimized(false);
          return;
        }
        const segs = splitPathIntoSegments(p);
        setSegments(segs);
        setTimeout(async () => {
          await movePath(segs.midway, gType as string);
          handleCheckpointReached();
        }, 1000);
      }).catch(err => {
        console.error("Search error:", err);
        setCocoMessage("El tejido del mapa parece estar enredado. (Error de conexión con el servicio de lógica)");
        setIsChatMinimized(false);
      });
      return;
    }

    if (interactionPhase === 'midway' && isAtCheckpoint) {
      setIsAtCheckpoint(false);
      setCocoMessage(`Tu reflexión es valiosa. Sigamos hacia el horizonte.`);
      setIsChatMinimized(true);

      setTimeout(async () => {
        await movePath(segments.wall);
        handleFinalBlockageReached();
      }, 1000);
      return;
    }

    if (interactionPhase === 'wall' && isBlockedByChallenge) {
      if (lowerText.includes(challengePhrase.toLowerCase().split(' ').pop() || "") || lowerText.length > challengePhrase.length * 0.7) {
        handleChallengeComplete();
      } else {
        setCocoMessage(`Deja que estas palabras fluyan de nuevo: "${challengePhrase}"`);
      }
      return;
    }

    try {
      const aiResponse = await getCocoResponse("Mapa de Emociones", "Explorador", text);
      setCocoMessage(aiResponse || `Interesante... dime más sobre eso.`);
    } catch {
      setCocoMessage(`Te escucho con atención.`);
    }
  };

  const handleMicClick = () => {
    if (isListening) return;
    setIsListening(true);

    // Fallback to Web Speech API for better responsiveness if backend is busy
    startListening((text) => {
      setIsListening(false);
      handleUserText(text, true);
    });
  };

  const center = { x: dimensions.width / 2, y: dimensions.height / 2 };

  return (
    <div className="relative w-full h-screen bg-[#F0FDFA] overflow-hidden font-sans text-slate-900">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer x={center.x} y={center.y}>
          <HexGrid
            grid={grid} visited={visited} frontier={frontier} path={path}
            targetPos={targetPos} isTechnicalMode={isTechnicalMode}
            onCellClick={(q, r) => !isSequenceActive && setTargetPos({ q, r })}
          />
          {/* Player Avatar */}
          {(() => {
            const { x, y } = hexToPixel(playerPos.q, playerPos.r);
            return (
              <Group x={x} y={y}>
                <motion.div>
                  <Circle radius={22} fill="#FFF" stroke="#000" strokeWidth={2} />
                  <Text text={activeGuardian?.emoji || "🦖"} fontSize={28} x={-14} y={-16} />
                </motion.div>
              </Group>
            );
          })()}
        </Layer>
      </Stage>

      <OverlayUI
        isTechnicalMode={isTechnicalMode} setIsTechnicalMode={setIsTechnicalMode}
        playerPos={playerPos} frontierCount={frontier.length} visitedCount={visited.size}
        searchType={Object.keys(visited).length > 0 ? "Búsqueda" : ""} unblockWall={unblockWall} isSequenceActive={isSequenceActive}
        currentGuardianIndex={currentGuardianIndex} totalGuardians={GUARDIAN_SEQUENCE.length}
      />

      <CocoChat
        cocoMessage={cocoMessage} isChatMinimized={isChatMinimized} setIsChatMinimized={setIsChatMinimized}
        userInput={userInput} setUserInput={setUserInput} interactionMode={interactionMode}
        toggleInteractionMode={() => setInteractionMode(prev => prev === 'text' ? 'voice' : 'text')}
        isListening={isListening} onMicClick={handleMicClick} handleUserText={handleUserText}
      />

      <GuardianSidebar />

      {showInitialDialog && (
        <InitialDialog
          onSelect={handlePredefinedSelection}
          onSkip={() => setShowInitialDialog(false)}
        />
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 flex gap-4 pointer-events-none">
        {Object.entries(TERRAIN_CONFIG).map(([type, config]) => (
          <div key={type} className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
