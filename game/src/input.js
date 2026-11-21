// Keyboard (and click) state, kept apart from the game rules.
export function createInput() {
  const keys = new Set();
  const pressed = new Set();
  return {
    keys,
    pressed,
    axis() {
      let x = 0;
      let y = 0;
      if (keys.has('ArrowLeft') || keys.has('KeyA')) x -= 1;
      if (keys.has('ArrowRight') || keys.has('KeyD')) x += 1;
      if (keys.has('ArrowUp') || keys.has('KeyW')) y -= 1;
      if (keys.has('ArrowDown') || keys.has('KeyS')) y += 1;
      if (x !== 0 && y !== 0) {
        x *= Math.SQRT1_2;
        y *= Math.SQRT1_2;
      }
      return { x, y };
    },
    wasPressed(code) {
      return pressed.has(code);
    },
    endFrame() {
      pressed.clear();
    },
  };
}

export function attachInput(input, target) {
  target.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (!event.repeat) {
      input.keys.add(event.code);
      input.pressed.add(event.code);
    }
  });
  target.addEventListener('keyup', (event) => {
    input.keys.delete(event.code);
  });
  target.addEventListener('blur', () => {
    input.keys.clear();
  });
}
