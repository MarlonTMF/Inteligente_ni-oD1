import { PredefinedResponse, Guardian } from '../types';

export const PREDEFINED_RESPONSES: PredefinedResponse[] = [
    { id: "1", text: "Me siento solo", emotion: "tristeza", targetHex: { q: 3, r: -3 } },
    { id: "2", text: "¡Estoy muy emocionado!", emotion: "alegria", targetHex: { q: 0, r: 3 } },
    { id: "3", text: "Tengo un poco de miedo", emotion: "miedo", targetHex: { q: -3, r: 3 } },
    { id: "4", text: "Estoy tranquilo", emotion: "calma", targetHex: { q: 3, r: 0 } },
];

export const GUARDIANS: Record<string, Guardian> = {
    BFS: {
        id: 'BFS',
        name: 'Brisa Burbujas',
        role: 'Guardiana de la Interconexión',
        emoji: '🫧',
        color: '#60A5FA',
        lore: 'Nació del suspiro de alivio colectivo. Ella entiende que cada punto en el mapa es un latido que resuena en el Gran Todo.',
        technique: 'La Trama del Todo (Cosmología Personal)',
        instruction: 'Observa estas burbujas. Cada una es un ser, un momento, una estrella. No estás solo, eres parte del tejido infinito.',
        strategy: 'No deja a nadie atrás porque en el Todo, cada parte es esencial.',
        advice: 'Recuerda: expandir tu mirada te permite ver que cada pequeña ayuda cuenta. No caminas solo.'
    },
    DFS: {
        id: 'DFS',
        name: 'Rayo Valiente',
        role: 'Guardián de la Verdad Interior',
        emoji: '⚡',
        color: '#FBBF24',
        lore: 'Habita en el núcleo donde nacen los relámpagos del alma. Enseña que la verdad no se encuentra huyendo, sino descendiendo.',
        technique: 'El Descenso al Origen (Introspección)',
        instruction: 'Mira el abismo sin parpadear. Lo que parece un monstruo es solo tu propio poder pidiendo ser reconocido.',
        strategy: 'Sumerge su luz hasta lo más hondo para que nada permanezca oculto.',
        advice: 'A veces, ir directo al centro del miedo es la única forma de encontrar la verdadera luz.'
    },
    UNIFORM: {
        id: 'UNIFORM',
        name: 'Abuelo Musguito',
        role: 'Guardián del Fluir',
        emoji: '🐢',
        color: '#34D399',
        lore: 'Sus pasos han pulido piedras por eones. Comprende que el universo no tiene prisa; la verdadera fuerza es la persistencia amable.',
        technique: 'El Ritmo de la Piedra (Paciencia Existencial)',
        instruction: 'Siente el peso de tus pies. El camino no es algo que se conquista, es un baile entre tú y el suelo que te sostiene.',
        strategy: 'Elige la vereda que respeta la energía vital, pues el sacrificio innecesario es ceguera.',
        advice: 'No siempre el camino más rápido es el mejor. Cuidar tu energía es un acto de sabiduría suprema.'
    },
    ASTAR: {
        id: 'ASTAR',
        name: 'Maestro Sabi',
        role: 'Guardián del Propósito',
        emoji: '🦉',
        color: '#A78BFA',
        lore: 'Custodio del Tiempo Atemporal. Ve el fin en el principio y el principio en el fin, enseñando que la claridad es el premio del buscador.',
        technique: 'La Visión de las Alturas (Perspectiva)',
        instruction: 'No cuentes los pasos que faltan, observa la armonía del destino. Tu intención es la brújula que ya te ha llevado a casa.',
        strategy: 'Combina la memoria del pasado con la intuición del futuro para trazar el sendero de la sabiduría.',
        advice: 'Usa tu intuición y tu experiencia. Cuando sabes a dónde vas, el universo conspira para que llegues pronto.'
    }
};

export const GUARDIAN_SEQUENCE: string[] = ['BFS', 'DFS', 'UNIFORM', 'ASTAR'];
