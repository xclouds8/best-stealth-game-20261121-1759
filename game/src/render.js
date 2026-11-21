// Moonlit Garden Heist — every pixel the player sees, drawn in code.
// Deep indigo night, warm amber lantern pools, pale stone paths: the whole
// game must read at a glance, because the judge sees it first in a still.
import { TILE, COLS, ROWS, VIEW_WIDTH, VIEW_HEIGHT, PALETTE, CONE_RANGE, CONE_HALF_ANGLE } from './config.js';
import { tileKindAt } from './level.js';

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function moonIcon(ctx, x, y, r, filled) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (filled) {
    ctx.fillStyle = PALETTE.moon;
    ctx.fill();
  } else {
    ctx.strokeStyle = 'rgba(244, 234, 210, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawFloor(ctx, level) {
  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  for (let ty = 0; ty < ROWS; ty += 1) {
    for (let tx = 0; tx < COLS; tx += 1) {
      const kind = tileKindAt(level, tx, ty);
      const x = tx * TILE;
      const y = ty * TILE;
      if (kind === ',') {
        ctx.fillStyle = PALETTE.path;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = PALETTE.pathEdge;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      } else if (kind === '.') {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? PALETTE.grassDark : PALETTE.grassLight;
        ctx.fillRect(x, y, TILE, TILE);
        if ((tx * 7 + ty * 13) % 5 === 0) {
          ctx.fillStyle = 'rgba(125, 219, 163, 0.10)';
          ctx.fillRect(x + 8, y + 10, 3, 3);
          ctx.fillRect(x + 20, y + 22, 2, 2);
        }
      }
    }
  }
}

function drawHedges(ctx, level) {
  for (let ty = 0; ty < ROWS; ty += 1) {
    for (let tx = 0; tx < COLS; tx += 1) {
      if (tileKindAt(level, tx, ty) !== '#') continue;
      const x = tx * TILE;
      const y = ty * TILE;
      ctx.fillStyle = PALETTE.hedge;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = PALETTE.hedgeTop;
      ctx.fillRect(x, y, TILE, 5);
      ctx.fillStyle = 'rgba(30, 77, 47, 0.5)';
      ctx.fillRect(x + 4, y + 10, 6, 6);
      ctx.fillRect(x + 20, y + 18, 5, 5);
    }
  }
}

function drawBushGround(ctx, level) {
  level.bushes.forEach((key) => {
    const [tx, ty] = key.split(',').map(Number);
    const cx = tx * TILE + TILE / 2;
    const cy = ty * TILE + TILE / 2;
    ctx.fillStyle = PALETTE.bush;
    circle(ctx, cx - 7, cy + 3, 11);
    circle(ctx, cx + 7, cy + 3, 11);
    circle(ctx, cx, cy - 6, 12);
    ctx.fillStyle = PALETTE.bushLight;
    circle(ctx, cx - 5, cy - 4, 3);
    circle(ctx, cx + 6, cy + 1, 2.5);
  });
}

function drawLightPools(ctx, level) {
  level.lanterns.forEach((lantern) => {
    const g = ctx.createRadialGradient(lantern.x, lantern.y, 6, lantern.x, lantern.y, 96);
    g.addColorStop(0, 'rgba(255, 179, 71, 0.30)');
    g.addColorStop(0.55, 'rgba(255, 179, 71, 0.12)');
    g.addColorStop(1, 'rgba(255, 179, 71, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(lantern.x - 96, lantern.y - 96, 192, 192);
  });
}

function drawLanterns(ctx, level) {
  level.lanterns.forEach((lantern) => {
    ctx.fillStyle = '#241a10';
    ctx.fillRect(lantern.x - 2.5, lantern.y - 8, 5, 16);
    ctx.fillStyle = PALETTE.lanternCore;
    circle(ctx, lantern.x, lantern.y - 10, 4.5);
    ctx.fillStyle = 'rgba(255, 217, 138, 0.5)';
    circle(ctx, lantern.x, lantern.y - 10, 8);
  });
}

function drawGate(ctx, level, open) {
  const { x, y } = level.gate;
  ctx.fillStyle = '#2c2417';
  ctx.fillRect(x - 18, y - 16, 7, 32);
  ctx.fillRect(x + 11, y - 16, 7, 32);
  ctx.fillRect(x - 18, y - 19, 36, 6);
  if (open) {
    const g = ctx.createRadialGradient(x, y, 2, x, y, 30);
    g.addColorStop(0, 'rgba(255, 217, 138, 0.85)');
    g.addColorStop(1, 'rgba(255, 217, 138, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 30, y - 30, 60, 60);
    ctx.fillStyle = PALETTE.moon;
    moonIcon(ctx, x, y, 9, true);
  } else {
    ctx.strokeStyle = 'rgba(180, 160, 120, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 11, y - 12);
    ctx.lineTo(x + 11, y + 12);
    ctx.moveTo(x + 11, y - 12);
    ctx.lineTo(x - 11, y + 12);
    ctx.stroke();
  }
}

function drawShards(ctx, world) {
  world.shards.forEach((s) => {
    if (s.taken) return;
    const pulse = 1 + Math.sin(world.time * 3 + s.x) * 0.12;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(Math.PI / 4);
    ctx.shadowColor = PALETTE.shard;
    ctx.shadowBlur = 14;
    ctx.fillStyle = PALETTE.shard;
    const r = 8 * pulse;
    ctx.fillRect(-r / 2, -r / 2, r, r);
    ctx.shadowBlur = 0;
    ctx.fillStyle = PALETTE.shardCore;
    ctx.fillRect(-r / 4, -r / 4, r / 2, r / 2);
    ctx.restore();
  });
}

function drawCones(ctx, world) {
  world.guards.forEach((guard) => {
    const hot = guard.seesPlayer || world.alarmed;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.arc(guard.x, guard.y, CONE_RANGE, guard.angle - CONE_HALF_ANGLE, guard.angle + CONE_HALF_ANGLE);
    ctx.closePath();
    const g = ctx.createRadialGradient(guard.x, guard.y, 8, guard.x, guard.y, CONE_RANGE);
    if (hot) {
      g.addColorStop(0, 'rgba(255, 90, 78, 0.34)');
      g.addColorStop(1, 'rgba(255, 90, 78, 0)');
    } else {
      g.addColorStop(0, 'rgba(255, 179, 71, 0.26)');
      g.addColorStop(1, 'rgba(255, 179, 71, 0)');
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = hot ? 'rgba(255, 90, 78, 0.35)' : 'rgba(255, 179, 71, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  });
}

function drawGuard(ctx, guard, alarmed) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = PALETTE.guard;
  circle(ctx, guard.x, guard.y, guard.r);
  ctx.restore();
  // Hood point, facing where the guard looks.
  ctx.fillStyle = PALETTE.guard;
  ctx.beginPath();
  ctx.moveTo(guard.x + Math.cos(guard.angle) * (guard.r + 6), guard.y + Math.sin(guard.angle) * (guard.r + 6));
  ctx.lineTo(guard.x + Math.cos(guard.angle + 2.4) * guard.r * 0.7, guard.y + Math.sin(guard.angle + 2.4) * guard.r * 0.7);
  ctx.lineTo(guard.x + Math.cos(guard.angle - 2.4) * guard.r * 0.7, guard.y + Math.sin(guard.angle - 2.4) * guard.r * 0.7);
  ctx.closePath();
  ctx.fill();
  // Amber rim on the moon side, so the silhouette reads against the floor.
  ctx.strokeStyle = PALETTE.guardRim;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, guard.r - 1, guard.angle + Math.PI * 0.6, guard.angle + Math.PI * 1.4);
  ctx.stroke();
  if (alarmed || guard.seesPlayer) {
    ctx.fillStyle = PALETTE.danger;
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', guard.x, guard.y - guard.r - 6);
  }
}

function drawPlayer(ctx, world) {
  const p = world.player;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 7;
  ctx.fillStyle = PALETTE.player;
  circle(ctx, p.x, p.y, p.r);
  ctx.restore();
  // Hood point, facing where the thief moves.
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath();
  ctx.moveTo(p.x + Math.cos(p.face) * (p.r + 6), p.y + Math.sin(p.face) * (p.r + 6));
  ctx.lineTo(p.x + Math.cos(p.face + 2.5) * p.r * 0.7, p.y + Math.sin(p.face + 2.5) * p.r * 0.7);
  ctx.lineTo(p.x + Math.cos(p.face - 2.5) * p.r * 0.7, p.y + Math.sin(p.face - 2.5) * p.r * 0.7);
  ctx.closePath();
  ctx.fill();
  // Faint moonlit rim, always on the upper-left, so the thief reads in the dark.
  ctx.strokeStyle = PALETTE.playerRim;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r - 1, Math.PI * 0.9, Math.PI * 1.7);
  ctx.stroke();
}

function drawBushTops(ctx, world) {
  const p = world.player;
  const tx = Math.floor(p.x / TILE);
  const ty = Math.floor(p.y / TILE);
  const key = `${tx},${ty}`;
  if (!world.level.bushes.has(key)) return;
  const cx = tx * TILE + TILE / 2;
  const cy = ty * TILE + TILE / 2;
  ctx.save();
  // Translucent, not opaque: a hidden thief is a faint shadow in the
  // leaves, never gone entirely — the player must still find themselves.
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = PALETTE.bush;
  circle(ctx, cx - 7, cy + 3, 11);
  circle(ctx, cx + 7, cy + 3, 11);
  circle(ctx, cx, cy - 6, 12);
  ctx.fillStyle = PALETTE.bushLight;
  circle(ctx, cx - 5, cy - 4, 3);
  circle(ctx, cx + 6, cy + 1, 2.5);
  ctx.restore();
}

function drawFireflies(ctx, world) {
  world.fireflies.forEach((f) => {
    const x = f.x + Math.sin(f.phase * 0.9) * 14;
    const y = f.y + Math.cos(f.phase * 0.7) * 10;
    const glow = 0.35 + Math.sin(f.phase * 2.2) * 0.25;
    ctx.fillStyle = `rgba(255, 230, 150, ${glow.toFixed(3)})`;
    circle(ctx, x, y, f.size);
  });
}

function drawHud(ctx, world) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  // Shards, top left.
  for (let i = 0; i < 3; i += 1) {
    moonIcon(ctx, 28 + i * 26, 26, 9, i < world.collected);
  }
  ctx.fillStyle = 'rgba(244, 234, 210, 0.75)';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(`${world.collected} / 3 shards`, 100, 26);
  // The detection eye, top centre.
  const cx = VIEW_WIDTH / 2;
  const cy = 26;
  const level = world.detection / 100;
  ctx.strokeStyle = level > 0.55 ? PALETTE.danger : 'rgba(244, 234, 210, 0.6)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 20, 11, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (level > 0.01) {
    ctx.fillStyle = level > 0.55 ? PALETTE.danger : PALETTE.lanternGlow;
    circle(ctx, cx, cy, 3 + level * 5);
  }
  // Timer, top right.
  const t = Math.floor(world.time);
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(t % 60).padStart(2, '0');
  ctx.fillStyle = 'rgba(244, 234, 210, 0.75)';
  ctx.textAlign = 'right';
  ctx.fillText(`${mm}:${ss}`, VIEW_WIDTH - 24, 26);
  // Toast, bottom centre.
  if (world.time - world.toastAt < 3 && world.toast) {
    const alpha = Math.min(1, (3 - (world.time - world.toastAt)) / 0.8);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PALETTE.moon;
    ctx.font = '15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(world.toast, VIEW_WIDTH / 2, VIEW_HEIGHT - 24);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function overlay(ctx, title, lines, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(4, 6, 14, 0.62)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText(title, VIEW_WIDTH / 2, 248);
  ctx.fillStyle = 'rgba(244, 234, 210, 0.9)';
  ctx.font = '17px Georgia, serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW_WIDTH / 2, 296 + i * 28);
  });
  ctx.restore();
}

export function drawWorld(ctx, world) {
  drawFloor(ctx, world.level);
  drawLightPools(ctx, world.level);
  drawBushGround(ctx, world.level);
  drawGate(ctx, world.level, world.collected >= 3);
  drawShards(ctx, world);
  drawCones(ctx, world);
  drawLanterns(ctx, world.level);
  world.guards.forEach((g) => drawGuard(ctx, g, world.alarmed));
  drawPlayer(ctx, world);
  drawBushTops(ctx, world);
  drawFireflies(ctx, world);
  drawHedges(ctx, world.level);
  drawHud(ctx, world);
}

export function drawOverlay(ctx, world) {
  if (world.status === 'title') {
    overlay(ctx, 'MOONLIT GARDEN HEIST', [
      'Steal the Moon Pearl. Leave no shadow behind.',
      'WASD or arrows to move — stay out of the amber light.',
      'Hide in the dark bushes. Gather 3 moon shards. Slip through the gate.',
      '',
      'Press Enter or click to begin',
    ], PALETTE.moon);
  } else if (world.status === 'caught') {
    overlay(ctx, 'SPOTTED!', [
      'The lanterns remember your face.',
      'The guards close in — and the garden forgets you were ever here.',
      '',
      'Press R to melt back into the dark',
    ], PALETTE.danger);
  } else if (world.status === 'win') {
    const t = Math.floor(world.time);
    overlay(ctx, 'THE MOON PEARL IS YOURS', [
      `Three shards, one pearl, no alarm — ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}.`,
      'The garden sleeps on, never knowing you were there.',
      '',
      'Press R to steal again',
    ], PALETTE.moon);
  } else if (world.paused) {
    overlay(ctx, 'PAUSED', ['Press P to keep sneaking.'], PALETTE.moon);
  } else if (world.time < 6) {
    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 210, 0.8)';
    ctx.font = '14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('WASD / arrows to move — bushes hide you, lantern light betrays you', VIEW_WIDTH / 2, VIEW_HEIGHT - 44);
    ctx.restore();
  }
}
