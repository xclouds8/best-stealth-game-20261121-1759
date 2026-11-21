# Moonlit Garden Heist

[![make.fun](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/xclouds8/best-stealth-game-20261121-1759/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/xclouds8/best-stealth-game-20261121-1759/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)

A top-down stealth game in a moonlit walled garden. You are a hooded thief:
steal the Moon Pearl — gather three moon shards — and slip through the
garden gate unseen.

## Dossier

**The game.** One walled garden at night, seen from above. Three guards
patrol fixed routes with wide amber vision cones; hedges block their sight,
dark bushes hide you, and paper lanterns pool warm light on the pale stone
paths. Standing in a lit cone fills the detection eye; hide in darkness or
a bush and it drains again. Past half-full the guards abandon their patrols
and hunt the last place they saw you. Get caught and the level restarts with
a graceful "Spotted!" — gather all three shards and the gate opens for the
escape.

**The look.** Deep indigo night, warm amber lantern light, pale stone, dark
hedges, and drifting fireflies. The thief is a small hooded figure with a
faint moonlit rim; guards are dark silhouettes with glowing amber cones, so
danger reads at a glance — a screenshot sells the game in one second.

**How to play.** WASD or arrow keys to move. Stay out of the amber cones,
use bushes as cover, collect 3 moon shards, reach the gate. `R` restarts
after being spotted or winning; `P` pauses. Mouse: click to start or
restart. Everything is drawn in code — no copied art, no network requests.

**Structure.** The source is split by job, each file named for what it does:
`game/src/config.js` (tuning and the garden map), `level.js` (reading the
map), `world.js` (the rules: movement, patrols, detection, alarm, win and
caught), `render.js` (every pixel), `input.js` (keyboard), `audio.js`
(synthesised sounds, no files), `shots.js` (the staged screenshot scenes),
`main.js` (bootstrap and loop). `main.ts` hands the game in with the kit's
vendored `buildDossier`.

## Play it

Serve `game/` with any static server and open `index.html` in desktop
Chrome — for example `python3 -m http.server` from `game/`, then
http://localhost:8000. No build step, no network.

## Screenshots

`1-cover.jpg` (the cover), `2-patrol.jpg`, `3-alarm.jpg`, `4-win.jpg` are
real renders of the game's own code, staged by `game/src/shots.js`
(`?shot=cover|patrol|alarm|win`) and captured in a headless browser.

## License

MIT — see [LICENSE](LICENSE).
