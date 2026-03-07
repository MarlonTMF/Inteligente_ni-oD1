export const HEX_SIZE = 40;
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
export const HEX_HEIGHT = 2 * HEX_SIZE;

export const hexToPixel = (q: number, r: number) => {
    const x = HEX_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = HEX_SIZE * (3 / 2) * r;
    return { x, y };
};

export const getNeighbors = (q: number, r: number) => {
    const directions = [
        { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
        { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];
    return directions.map(d => ({ q: q + d.q, r: r + d.r }));
};
