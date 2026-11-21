// Moonlit Garden Heist — the rules: move, hide, be seen, get caught, escape.
import {
  TILE, PLAYER_SPEED, GUARD_PATROL_SPEED, GUARD_CHASE_SPEED,
  DETECT_RATE, DECAY_RATE,
  ALARM_AT, CALM_AT,
} from './config.js';
import { parseLevel, solidAt, tileCenter } from './level.js';
import { guardSees } from './vision.js';
import { mulberry32, pick } from './rng.js';
import { pickupSound, alarmSound, caughtSound, winSound } from './audio.js';

const PLAYER_R = 11;
const GUARD_R = 12;
export const STEP = 1 / 60;

export function createWorld(seed = 20261121) {
  const level = parseLevel();
  const rng = mulberry32(seed);
  const fireflies = [];
  for (let i = 0; i < 26; i += 1) {
    fireflies.push({
      x: pick(rng, 40, 920),
      y: pick(rng, 40, 600),
      phase: pick(rng, 0, Math.PI * 2),
      speed: pick(rng, 0.3, 0.9),
      size: pick(rng, 1.2, 2.4),
    });
  }
  return {
    level,
    seed,
    status: 'title', // title | play | caught | win
    paused: false,
    time: 0,
    detection: 0,
    alarmed: false,
    collected: 0,
    toast: '',
    toastAt: -10,
    fireflies,
    player: {
      x: level.playerStart.x,
      y: level.playerStart.y,
      r: PLAYER_R,
      face: -Math.PI / 2,
      moving: false,
    },
    guards: level.guards.map((g) => {
      const first = tileCenter(g.route[0][0], g.route[0][1]);
      return {
        id: g.id,
        x: g.x,
        y: g.y,
        r: GUARD_R,
        // Face the first waypoint, never the thief's start.
        angle: Math.atan2(first.y - g.y, first.x - g.x),
        route: g.route.map(([tx, ty]) => tileCenter(tx, ty)),
        wp: 0,
        mode: 'patrol', // patrol | chase | return
        lastSeen: null,
        seesPlayer: false,
      };
    }),
    shards: level.shards.map((s) => ({ x: s.x, y: s.y, taken: false })),
  };
}

export function resetWorld(world) {
  const fresh = createWorld(world.seed);
  Object.keys(fresh).forEach((k) => {
    world[k] = fresh[k];
  });
  world.status = 'play';
}

function hitsSolid(level, x, y, r) {
  const x0 = Math.floor((x - r) / TILE);
  const x1 = Math.floor((x + r) / TILE);
  const y0 = Math.floor((y - r) / TILE);
  const y1 = Math.floor((y + r) / TILE);
  for (let ty = y0; ty <= y1; ty += 1) {
    for (let tx = x0; tx <= x1; tx += 1) {
      if (!solidAt(level, tx, ty)) continue;
      const cx = Math.max(tx * TILE, Math.min(x, tx * TILE + TILE));
      const cy = Math.max(ty * TILE, Math.min(y, ty * TILE + TILE));
      if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
    }
  }
  return false;
}

function moveCircle(level, body, dx, dy) {
  // Axis-separated, so the thief slides along walls instead of sticking.
  const nx = body.x + dx;
  if (!hitsSolid(level, nx, body.y, body.r)) body.x = nx;
  const ny = body.y + dy;
  if (!hitsSolid(level, body.x, ny, body.r)) body.y = ny;
}

function moveToward(guard, tx, ty, speed, dt) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return true;
  const len = Math.min(dist, speed * dt);
  guard.x += (dx / dist) * len;
  guard.y += (dy / dist) * len;
  guard.angle = Math.atan2(dy, dx);
  return dist - len < 2;
}

function stepGuard(world, guard, dt) {
  if (guard.mode === 'chase' && guard.lastSeen) {
    if (moveToward(guard, guard.lastSeen.x, guard.lastSeen.y, GUARD_CHASE_SPEED, dt)) {
      // Reached the last place you were seen: look around, sweeping.
      guard.angle += dt * 1.4;
    }
    return;
  }
  if (guard.mode === 'return') {
    // Walk back to the nearest waypoint, then patrol again.
    let best = 0;
    let bestD = Infinity;
    guard.route.forEach((wp, i) => {
      const d = Math.hypot(wp.x - guard.x, wp.y - guard.y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    guard.wp = best;
    guard.mode = 'patrol';
    return;
  }
  const wp = guard.route[guard.wp];
  if (moveToward(guard, wp.x, wp.y, GUARD_PATROL_SPEED, dt)) {
    guard.wp = (guard.wp + 1) % guard.route.length;
  }
}

export function step(world, input, dt) {
  // Fireflies always drift, whatever the screen.
  world.fireflies.forEach((f) => {
    f.phase += dt * f.speed;
  });
  if (world.status !== 'play' || world.paused) return;
  world.time += dt;
  const p = world.player;
  const ax = input.axis();
  p.moving = ax.x !== 0 || ax.y !== 0;
  if (p.moving) {
    p.face = Math.atan2(ax.y, ax.x);
    moveCircle(world.level, p, ax.x * PLAYER_SPEED * dt, ax.y * PLAYER_SPEED * dt);
  }
  // Moon shards.
  world.shards.forEach((s) => {
    if (!s.taken && Math.hypot(s.x - p.x, s.y - p.y) < 24) {
      s.taken = true;
      world.collected += 1;
      pickupSound();
      world.toast = world.collected === 3
        ? 'All three shards — the gate is open!'
        : `Moon shard ${world.collected} of 3`;
      world.toastAt = world.time;
    }
  });
  // The gate.
  const gate = world.level.gate;
  if (Math.hypot(gate.x - p.x, gate.y - p.y) < 26) {
    if (world.collected >= 3) {
      world.status = 'win';
      winSound();
    } else if (world.time - world.toastAt > 2) {
      const left = 3 - world.collected;
      world.toast = `The gate is sealed — ${left} shard${left === 1 ? '' : 's'} to go`;
      world.toastAt = world.time;
    }
  }
  // Guards watch, and the eye fills.
  let anyoneSees = false;
  world.guards.forEach((guard) => {
    guard.seesPlayer = guardSees(world, guard);
    if (guard.seesPlayer) {
      anyoneSees = true;
      guard.lastSeen = { x: p.x, y: p.y };
    }
  });
  if (anyoneSees) world.detection = Math.min(100, world.detection + DETECT_RATE * dt);
  else world.detection = Math.max(0, world.detection - DECAY_RATE * dt);
  const wasAlarmed = world.alarmed;
  world.alarmed = world.detection > ALARM_AT;
  if (world.alarmed && !wasAlarmed) alarmSound();
  if (!world.alarmed && world.detection < CALM_AT) {
    world.guards.forEach((guard) => {
      if (guard.mode === 'chase') guard.mode = 'return';
    });
  }
  world.guards.forEach((guard) => {
    if (world.alarmed && guard.lastSeen) guard.mode = 'chase';
    stepGuard(world, guard, dt);
  });
  if (world.detection >= 100) {
    world.status = 'caught';
    caughtSound();
  }
}
