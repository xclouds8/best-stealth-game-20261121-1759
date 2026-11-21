// Moonlit Garden Heist — hand-in program (Node 22, standard library only).
// The game is plain static files under game/ and the screenshots beside this
// file. This program copies both into the output directory and writes the
// judge's dossier with the kit's vendored library, exactly as the gate
// rebuilds it. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

function main() {
  mkdirSync(outputDir, { recursive: true });
  copyTree(join(repoRoot, 'game'), join(outputDir, 'game'));
  copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

  // The scorer's own caps: only text_max_bytes shapes the dossier's bytes;
  // the rest refuse an entry the scorer would refuse (more than 4 screenshots
  // or one over 256 KiB; more than 993 files in game/ or 48 MiB of game files
  // in all, or a path under game/ over 1000 bytes).
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  // Read the dossier back and report what was handed in, so a bad run
  // is loud instead of silent.
  const written = JSON.parse(readFileSync(join(outputDir, 'dossier.json'), 'utf8'));
  const gameFiles = readdirSync(join(outputDir, 'game'), { recursive: true })
    .filter((f) => statSync(join(outputDir, 'game', f.toString())).isFile());
  const shotFiles = readdirSync(join(outputDir, 'screenshots'))
    .filter((f) => statSync(join(outputDir, 'screenshots', f.toString())).isFile());
  console.log(`dossier.json written: ${dossier.length} bytes into ${outputDir}`);
  console.log(`game files: ${gameFiles.length}, screenshots: ${shotFiles.join(', ')}`);
  console.log(`dossier keys: ${Object.keys(written).join(', ')}`);
}

main();
