// Moonlit Garden Heist — bootstrap: canvas, loop, screens, screenshot mode.
// Open game/index.html in a desktop browser to play. Add ?shot=cover|patrol|
// alarm|win to stage one real scene and draw it once for a screenshot.
import { VIEW_WIDTH, VIEW_HEIGHT } from './config.js';
import { createWorld, resetWorld, step, STEP } from './world.js';
import { drawWorld, drawOverlay } from './render.js';
import { createInput, attachInput } from './input.js';
import { stageShot } from './shots.js';
import { unlockAudio } from './audio.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || 20261121);

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_WIDTH;
canvas.height = VIEW_HEIGHT;

function render(world) {
  drawWorld(ctx, world);
  drawOverlay(ctx, world);
}

if (shotName) {
  // Screenshot mode: stage one real scene, draw it once, and tell the
  // screenshot tool the frame is ready.
  const staged = stageShot(shotName, seed);
  render(staged.world);
  document.title = `Moonlit Garden Heist — ${shotName}`;
  window.__shotReady = true;
  window.__game = staged.world;
} else {
  const world = createWorld(seed);
  const input = createInput();
  attachInput(input, window);

  canvas.addEventListener('click', () => {
    unlockAudio();
    if (world.status === 'title') world.status = 'play';
    else if (world.status === 'caught' || world.status === 'win') resetWorld(world);
  });

  function handleKeys() {
    if (input.wasPressed('Enter') || input.wasPressed('Space')) {
      if (world.status === 'title') {
        world.status = 'play';
        unlockAudio();
      }
    }
    if (input.wasPressed('KeyR') && (world.status === 'caught' || world.status === 'win')) {
      resetWorld(world);
    }
    if (input.wasPressed('KeyP') && world.status === 'play') {
      world.paused = !world.paused;
    }
  }

  let last = performance.now();
  let acc = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    handleKeys();
    acc += dt;
    while (acc >= STEP) {
      step(world, input, STEP);
      acc -= STEP;
    }
    render(world);
    input.endFrame();
    requestAnimationFrame(frame);
  }
  window.__game = world;
  requestAnimationFrame(frame);
}
