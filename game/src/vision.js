// Moonlit Garden Heist — what a guard can see: the cone, the hedge walls
// that block it, and the bushes that hide the thief. Kept apart from the
// rules so the sight test can be read, and trusted, on its own.
import { TILE, CONE_RANGE, CONE_HALF_ANGLE, HIDE_DISTANCE } from './config.js';
import { solidAt, bushAt } from './level.js';

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Line of sight: step along the ray; a hedge wall anywhere between blocks it.
export function lineOfSight(level, ax, ay, bx, by) {
  const dist = Math.hypot(bx - ax, by - ay);
  const steps = Math.ceil(dist / 8);
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const tx = Math.floor((ax + (bx - ax) * t) / TILE);
    const ty = Math.floor((ay + (by - ay) * t) / TILE);
    if (solidAt(level, tx, ty)) return false;
  }
  return true;
}

// Does this guard see the thief right now? Range, cone, a clear line, and
// the bush rule: deep in a bush you are a shadow, unless the guard is
// right on top of you.
export function guardSees(world, guard) {
  const p = world.player;
  const dx = p.x - guard.x;
  const dy = p.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CONE_RANGE) return false;
  const toPlayer = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(toPlayer, guard.angle)) > CONE_HALF_ANGLE) return false;
  if (!lineOfSight(world.level, guard.x, guard.y, p.x, p.y)) return false;
  const inBush = bushAt(world.level, Math.floor(p.x / TILE), Math.floor(p.y / TILE));
  if (inBush && dist > HIDE_DISTANCE) return false;
  return true;
}
