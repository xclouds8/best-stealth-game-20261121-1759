// Tiny synthesised sounds — no audio files, everything is an oscillator.
// The context is created on the first user gesture, so the browser allows it.
let ctx = null;

function ensure() {
  if (typeof window === 'undefined') return null;
  if (ctx === null) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq, at, dur, type, vol) {
  const ac = ensure();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ac.currentTime + at);
  gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + at);
  osc.stop(ac.currentTime + at + dur + 0.05);
}

export function unlockAudio() {
  ensure();
}

export function pickupSound() {
  tone(880, 0, 0.12, 'sine', 0.12);
  tone(1318, 0.07, 0.18, 'sine', 0.1);
}

export function alarmSound() {
  tone(220, 0, 0.16, 'sawtooth', 0.07);
  tone(220, 0.18, 0.16, 'sawtooth', 0.07);
}

export function caughtSound() {
  tone(196, 0, 0.3, 'triangle', 0.13);
  tone(147, 0.12, 0.4, 'triangle', 0.13);
}

export function winSound() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.3, 'sine', 0.1));
}
