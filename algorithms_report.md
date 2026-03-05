# Informe de Algoritmos de Búsqueda - El Mapa de las Emociones

Este informe detalla los algoritmos de búsqueda implementados en la aplicación para guiar a los exploradores a través del mapa de las emociones.

## 1. Algoritmos Existentes

### 1.1. Búsqueda en Anchura (BFS) - Brisa Burbujas
- **Tipo**: Búsqueda no informada.
- **Funcionamiento**: Explora todos los nodos en un nivel antes de pasar al siguiente.
- **Uso**: Ideal cuando se quiere encontrar el camino con la menor cantidad de pasos, sin considerar el costo del terreno.
- **Analogía**: Una red que se expande uniformemente para no dejar a nadie atrás.

### 1.2. Búsqueda en Profundidad (DFS) - Rayo Valiente
- **Tipo**: Búsqueda no informada.
- **Funcionamiento**: Sigue un camino hasta que no puede más o encuentra el objetivo, y luego retrocede.
- **Uso**: Útil para explorar lo más profundo rápidamente, aunque no garantiza el camino más corto.
- **Analogía**: Una linterna que ilumina lo más profundo antes de mirar a los lados.

### 1.3. Búsqueda de Costo Uniforme (UCS) - Abuelo Musguito
- **Tipo**: Búsqueda no informada (pero sensible al costo).
- **Funcionamiento**: Siempre expande el nodo con el menor costo acumulado desde el inicio (Dijkstra).
- **Uso**: Garantiza el camino más barato en términos de esfuerzo o energía.
- **Analogía**: Una tortuga que elige el camino más amable y con menos espinas.

---

## 2. Nuevo Algoritmo: A* (A-Estrella) - Maestro Sabi

### 2.1. Descripción de A*
- **Tipo**: Búsqueda informada (heurística).
- **Heurística**: Distancia Manhattan Adaptada a Hexágonos.
- **Lógica**: Utiliza la función $f(n) = g(n) + h(n)$, donde $g(n)$ es el costo real acumulado y $h(n)$ es la estimación (heurística) hasta el objetivo.
- **Ventaja**: Es mucho más eficiente que los anteriores al "saber" en qué dirección general se encuentra el objetivo, evitando explorar áreas innecesarias.

### 2.2. Avatar: Maestro Sabi (El Búho Sabio)
- **Historia**: El más anciano de los guardianes, protector de la "Biblioteca de los Sentidos". Ha guiado a exploradores por eones, enseñándoles que la sabiduría es la combinación de experiencia (pasado) e intuición (futuro).
- **Lore**: Se dice que sus plumas cambian de color según la emoción que percibe, y que su vista puede ver no solo el camino, sino el destino final desde el primer paso.
- **Técnica**: "El Mapa de la Claridad" - Ayuda a ver el camino directo cuando la niebla emocional es densa.
- **Frase**: *"No busco solo el camino más corto, sino el que nos lleva directos a la verdad del corazón."*
