// Reads the garden map into the things the game needs: walls, bushes, lanterns,
// shards, the gate, the thief's start and the guards' posts.
import { COLS, ROWS, TILE, MAP, ROUTES } from './config.js';

export function parseLevel() {
  const walls = new Set();
  const bushes = new Set();
  const lanterns = [];
  const shards = [];
  let gate = null;
  let playerStart = null;
  const guards = [];
  for (let y = 0; y < ROWS; y += 1) {
    const row = MAP[y];
    if (row.length !== COLS) throw new Error(`map row ${y} is ${row.length} wide, expected ${COLS}`);
    for (let x = 0; x < COLS; x += 1) {
      const key = `${x},${y}`;
      const ch = row[x];
      if (ch === '#') walls.add(key);
      else if (ch === 'B') bushes.add(key);
      else if (ch === 'L') {
        lanterns.push({ x: (x + 0.5) * TILE, y: (y + 0.5) * TILE });
        walls.add(key);
      } else if (ch === 'S') shards.push({ x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, taken: false });
      else if (ch === 'G') gate = { x: (x + 0.5) * TILE, y: (y + 0.5) * TILE };
      else if (ch === 'P') playerStart = { x: (x + 0.5) * TILE, y: (y + 0.5) * TILE };
      else if (ch === '1' || ch === '2' || ch === '3') {
        guards.push({ id: ch, x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, route: ROUTES[ch] });
      }
    }
  }
  if (!gate || !playerStart || guards.length !== 3 || shards.length !== 3) {
    throw new Error('map is missing its gate, thief, guards or shards');
  }
  return { walls, bushes, lanterns, shards, gate, playerStart, guards };
}

export function tileKey(tx, ty) {
  return `${tx},${ty}`;
}

export function solidAt(level, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
  return level.walls.has(tileKey(tx, ty));
}

export function bushAt(level, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return false;
  return level.bushes.has(tileKey(tx, ty));
}

export function tileKindAt(level, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return '#';
  return MAP[ty][tx];
}

export function tileCenter(tx, ty) {
  return { x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE };
}
