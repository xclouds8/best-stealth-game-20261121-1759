// Moonlit Garden Heist — tuning and the garden itself.
// One tile is 32 px; the garden is 30 by 20 tiles, 960 by 640 px.
export const TILE = 32;
export const COLS = 30;
export const ROWS = 20;
export const VIEW_WIDTH = COLS * TILE;
export const VIEW_HEIGHT = ROWS * TILE;

export const PALETTE = {
  night: '#070a1a',
  grassDark: '#0e1729',
  grassLight: '#111d33',
  path: '#8d86a3',
  pathEdge: '#6a6384',
  hedge: '#0b2117',
  hedgeTop: '#1e4d2f',
  bush: '#102a1a',
  bushLight: '#2e5c38',
  lanternGlow: '#ffb347',
  lanternCore: '#ffd98a',
  shard: '#bfe9ff',
  shardCore: '#eaf7ff',
  guard: '#04060e',
  guardRim: '#ffb347',
  player: '#191d31',
  playerRim: '#cfe4ff',
  gate: '#3a2f1d',
  moon: '#f4ead2',
  danger: '#ff5a4e',
  safe: '#7ddba3',
};

export const PLAYER_SPEED = 168;
export const GUARD_PATROL_SPEED = 72;
export const GUARD_CHASE_SPEED = 118;
export const CONE_RANGE = 155;
export const CONE_HALF_ANGLE = Math.PI / 3.6; // about 50 degrees each side
export const DETECT_RATE = 55; // detection points per second while seen
export const DECAY_RATE = 26; // detection points per second while unseen
export const ALARM_AT = 55; // meter above which the guards hunt
export const CALM_AT = 20; // meter below which the guards go back to patrol
export const HIDE_DISTANCE = 46; // a guard this close still sees you in a bush

// The garden. '#' hedge wall, '.' lawn, ',' pale stone path, 'B' bush cover,
// 'L' lantern post, 'S' moon shard, 'P' the thief, 'G' the garden gate,
// '1' '2' '3' the three patrolling guards.
export const MAP = [
  '##############################',
  '#............,,,,,,..........#',
  '#..BBB.......,,,,,,....BBB...#',
  '#..BBB..1....,,,,,,....BBB...#',
  '#............,,,,,,..........#',
  '#..#####.....,,,,,,....###...#',
  '#..#.........,,,,,,....#.....#',
  '#..#...L.....,,,,,,....#..2..#',
  '#..#.........,,,,,,....#.....#',
  '#..#...S.....,,,,,,....#.....#',
  '#.......,,,,,,,,,,,,,,.......#',
  '#..BBB..,,,,,,,,,,,,,,..BBB..#',
  '#..BBB..,,,,,,..,,,,,,..BBB..#',
  '#......,,,,,,....,,,,,,......#',
  '#..3...,,,,,,.S..,,,,,,......#',
  '#......,,,,,,....,,,,,,......#',
  '#..L...,,,,,,....,,,,,,...L..#',
  '#......,,,,,,....,,,,,,......#',
  '#..P...,,,,,,.S..,,,,,,..G...#',
  '##############################',
];

// Patrol routes: tile waypoints each guard walks, in order, forever.
export const ROUTES = {
  1: [[5, 3], [22, 3], [22, 1], [5, 1]],
  2: [[26, 5], [26, 14], [22, 14], [22, 5]],
  3: [[3, 13], [12, 13], [12, 15], [3, 15]],
};
