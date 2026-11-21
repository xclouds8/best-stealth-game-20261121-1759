// Staged scenes for the screenshots: each one really plays the game forward
// from a fresh world with a scripted thief, so every frame is a real render
// of the game's own code and the same seed always stages the same frame.
import { STEP, step, createWorld } from './world.js';
import { TILE } from './config.js';

function pilotTo(waypoints) {
  let index = 0;
  return {
    axis(world) {
      if (index >= waypoints.length) return { x: 0, y: 0 };
      const [tx, ty] = waypoints[index];
      const cx = (tx + 0.5) * TILE;
      const cy = (ty + 0.5) * TILE;
      const dx = cx - world.player.x;
      const dy = cy - world.player.y;
      if (Math.hypot(dx, dy) < 10) {
        index += 1;
        return { x: 0, y: 0 };
      }
      const len = Math.hypot(dx, dy);
      return { x: dx / len, y: dy / len };
    },
  };
}

function run(world, pilot, seconds, stopWhen) {
  const input = { axis: () => pilot.axis(world) };
  const limit = Math.round(seconds / STEP);
  for (let i = 0; i < limit; i += 1) {
    step(world, input, STEP);
    if (stopWhen && stopWhen(world)) break;
  }
}

// The cover: the thief slips east along the south path, pockets the middle
// shard, and pauses on the pale stone — one shard in hand, a guard's cone
// sweeping the lantern light just below.
function stageCover(world) {
  run(world, pilotTo([[3, 17], [8, 18], [12, 18], [12, 16], [14, 14], [14, 12], [12, 8]]), 16);
  return 'play';
}

// Hidden in the top-west bushes while a guard patrols past with his cone.
// The thief comes up the middle path, not the west wall, so it never walks
// head-on into the west guard's patrol.
function stagePatrol(world) {
  run(world, pilotTo([[3, 17], [8, 18], [12, 18], [14, 18], [14, 12], [14, 8], [14, 4], [8, 4], [4, 4], [4, 3]]), 15);
  return 'play';
}

// The near miss: the thief crosses the east guard's patrol and the eye
// is almost full — guards converging, one heartbeat from spotted.
function stageAlarm(world) {
  run(
    world,
    pilotTo([[3, 17], [8, 17], [14, 17], [20, 17], [24, 17], [26, 16]]),
    22,
    (w) => w.detection >= 80 || w.status !== 'play',
  );
  return world.status === 'play' ? 'play' : world.status;
}

// The escape: all three shards gathered, the thief at the open gate.
// This pilot plays like a cautious thief: it walks its waypoints, but when
// the eye is filling and a guard is close it backs off to the last waypoint
// and waits for the cone to pass before trying again.
function cautiousPilot(waypoints) {
  let index = 0;
  return {
    axis(world) {
      if (index >= waypoints.length) return { x: 0, y: 0 };
      const [tx, ty] = waypoints[index];
      const cx = (tx + 0.5) * TILE;
      const cy = (ty + 0.5) * TILE;
      const dx = cx - world.player.x;
      const dy = cy - world.player.y;
      if (Math.hypot(dx, dy) < 10) {
        index += 1;
        return { x: 0, y: 0 };
      }
      const nearGuard = world.guards.some(
        (g) => Math.hypot(g.x - world.player.x, g.y - world.player.y) < 120,
      );
      if (world.detection > 40 && nearGuard && index > 0) {
        // Retreat to the previous waypoint until the eye drains.
        const [px, py] = waypoints[index - 1];
        const rx = (px + 0.5) * TILE - world.player.x;
        const ry = (py + 0.5) * TILE - world.player.y;
        const len = Math.hypot(rx, ry) || 1;
        return { x: rx / len, y: ry / len };
      }
      const len = Math.hypot(dx, dy);
      return { x: dx / len, y: dy / len };
    },
  };
}

function stageWin(world) {
  run(
    world,
    cautiousPilot([
      [3, 17], [7, 16], [7, 10], [7, 9],
      [10, 10], [10, 17], [14, 17], [14, 18],
      [16, 18], [16, 14], [14, 14],
      [20, 18], [25, 18],
    ]),
    60,
    (w) => w.status !== 'play',
  );
  return world.status;
}

export function stageShot(name, seed = 20261121) {
  const world = createWorld(seed);
  world.status = 'play';
  if (name === 'patrol') return { world, screen: stagePatrol(world) };
  if (name === 'alarm') return { world, screen: stageAlarm(world) };
  if (name === 'win') return { world, screen: stageWin(world) };
  return { world, screen: stageCover(world) };
}
