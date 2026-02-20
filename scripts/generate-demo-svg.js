#!/usr/bin/env node
/**
 * Generates demo.svg — an animated terminal SVG for the README.
 * Run: node scripts/generate-demo-svg.js > demo.svg
 *
 * Uses SMIL animations so GitHub renders it correctly inside <img> tags.
 */

const WIDTH = 680;
const LINE_H = 19;
const FONT_SIZE = 12.5;
const PAD_LEFT = 20;
const PAD_TOP = 50;   // below window chrome
const TOTAL_DUR = 15; // seconds per loop

// ---------------------------------------------------------------------------
// Colour palette (GitHub dark theme)
// ---------------------------------------------------------------------------
const C = {
  bg:       '#0d1117',
  chrome:   '#161b22',
  border:   '#30363d',
  muted:    '#6e7681',
  dim:      '#8b949e',
  text:     '#c9d1d9',
  blue:     '#58a6ff',
  green:    '#3fb950',
  orange:   '#f0883e',
  red:      '#ff7b72',
  cyan:     '#79c0ff',
  yellow:   '#d29922',
};

// ---------------------------------------------------------------------------
// Script lines: [text, colour, delay (seconds)]
// Empty text = blank spacer line (still occupies vertical space).
// ---------------------------------------------------------------------------
const LINES = [
  // prompt + command
  ['$ node src/cli.js analyze examples/sample-codebase', C.blue,   0.4],

  // build phase
  ['',                                                    '',       0.8],
  ['🍄 Building mycelial network...',                     C.green,  1.1],
  ['',                                                    '',       1.3],
  ['  Found 6 files to analyze',                          C.text,   1.5],
  ['',                                                    '',       1.7],
  ['🔗 Computing semantic similarity...',                  C.cyan,   1.9],
  ['',                                                    '',       2.3],
  ['✓ Network built successfully',                         C.green,  2.6],

  // output header
  ['',                                                    '',       2.9],
  ['═══════════════════════════════════════',             C.muted,  3.1],
  ['   🍄 CODE MYCELIUM NETWORK',                         C.orange, 3.25],
  ['═══════════════════════════════════════',             C.muted,  3.4],

  // stats
  ['',                                                    '',       3.55],
  ['📊 Network Stats:',                                   C.text,   3.65],
  ['   Nodes: 19',                                        C.text,   3.8],
  ['   Connections: 23',                                  C.text,   3.95],

  // hub nodes
  ['',                                                    '',       4.1],
  ['🔥 Hub Nodes (highly connected):',                    C.red,    4.2],
  ['   └─ formatDate (utils/helpers.js)',                 C.text,   4.35],
  ['      3 connections',                                 C.muted,  4.5],
  ['   └─ authenticateUser (auth/login.js)',              C.text,   4.65],
  ['      3 connections',                                 C.muted,  4.8],

  // semantic clusters
  ['',                                                    '',       4.95],
  ['🔗 Semantic Clusters (similar code):',                C.cyan,   5.05],
  ['   ┌─ api/posts.js ↔ api/users.js',                  C.text,   5.2],
  ['   │  fetchPostsFromDatabase ↔ fetchFromDatabase',    C.text,   5.35],
  ['   │  Similarity: 55.6%',                            C.green,  5.5],
  ['   │',                                               C.muted,  5.65],
  ['',                                                    '',       5.75],
  ['   ⚠️  Potential DRY violation detected!',            C.yellow, 5.85],

  // orphans
  ['',                                                    '',       6.0],
  ['👻 Orphaned Code (no connections):',                  C.dim,    6.1],
  ['   └─ legacyLogin (legacy/oldAuth.js:6)',             C.text,   6.25],
  ['   ⚠️  These may be unused or entry points',          C.yellow, 6.4],

  // footer
  ['',                                                    '',       6.6],
  ['═══════════════════════════════════════',             C.muted,  6.7],
];

const CONTENT_H = LINES.length * LINE_H;
const HEIGHT = PAD_TOP + CONTENT_H + 30;

// SMIL fade-out window
const HOLD_UNTIL  = 11.5;  // hold fully visible until this time
const FADE_START  = 12.0;  // start fading out
const FADE_END    = 12.8;  // fully invisible
// From FADE_END → TOTAL_DUR: blank pause before loop restart

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function kt(t) {
  return (t / TOTAL_DUR).toFixed(5);
}

/**
 * Returns a SMIL <animate> that makes the element appear at `delay` seconds,
 * stay visible until HOLD_UNTIL, then fade out, then reset for loop.
 */
function appear(delay) {
  const d0   = kt(0);
  const dPre = kt(Math.max(0, delay - 0.001));
  const dOn  = kt(delay);
  const dHold = kt(HOLD_UNTIL);
  const dFadeEnd = kt(FADE_END);
  const d1   = kt(TOTAL_DUR);

  return `<animate attributeName="opacity" ` +
    `values="0;0;1;1;0;0" ` +
    `keyTimes="${d0};${dPre};${dOn};${dHold};${dFadeEnd};${d1}" ` +
    `dur="${TOTAL_DUR}s" repeatCount="indefinite" calcMode="linear"/>`;
}

// ---------------------------------------------------------------------------
// Build SVG elements
// ---------------------------------------------------------------------------
const textEls = LINES.map(([text, color, delay], i) => {
  const y = PAD_TOP + (i + 1) * LINE_H;
  const fill = color || C.text;
  const content = text ? esc(text) : '&#160;'; // non-breaking space for blank lines

  return [
    `  <text x="${PAD_LEFT}" y="${y}" fill="${fill}"`,
    `        font-family="'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace"`,
    `        font-size="${FONT_SIZE}" opacity="0" xml:space="preserve">`,
    `    ${appear(delay)}`,
    `    ${content}`,
    `  </text>`,
  ].join('\n');
}).join('\n');

// Blinking cursor after the last line of the command (shows while "running")
const cursorY = PAD_TOP + LINE_H; // same line as the command
const cmdWidth = LINES[0][0].length * 7.5; // rough estimate
const cursorX = PAD_LEFT + cmdWidth + 2;
const cursor = [
  `  <!-- blinking cursor (visible while command "runs") -->`,
  `  <rect x="${cursorX}" y="${cursorY - 13}" width="7" height="14" fill="${C.blue}" opacity="0">`,
  `    <!-- appear with command, blink, then hide when output starts -->`,
  `    <animate attributeName="opacity"`,
  `             values="0;0;1;1;1;0;1;0;1;0;0;0"`,
  `             keyTimes="0;${kt(0.39)};${kt(0.4)};${kt(0.7)};${kt(0.8)};${kt(0.9)};${kt(1.0)};${kt(1.1)};${kt(1.2)};${kt(1.3)};${kt(1.4)};1"`,
  `             dur="${TOTAL_DUR}s" repeatCount="indefinite" calcMode="discrete"/>`,
  `  </rect>`,
].join('\n');

// ---------------------------------------------------------------------------
// Assemble SVG
// ---------------------------------------------------------------------------
const svg = `\
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"
     xmlns="http://www.w3.org/2000/svg">

  <!-- ── Window chrome ─────────────────────────────────── -->
  <rect width="${WIDTH}" height="${HEIGHT}" rx="10" fill="${C.bg}"/>
  <rect width="${WIDTH}" height="36" rx="10" fill="${C.chrome}"/>
  <rect width="${WIDTH}" height="8" y="28" fill="${C.chrome}"/>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="9.5"
        fill="none" stroke="${C.border}" stroke-width="1"/>

  <!-- traffic lights -->
  <circle cx="18" cy="18" r="6" fill="#ff5f56"/>
  <circle cx="38" cy="18" r="6" fill="#ffbd2e"/>
  <circle cx="58" cy="18" r="6" fill="#27c93f"/>

  <!-- window title -->
  <text x="${WIDTH / 2}" y="23" fill="${C.muted}"
        font-family="'SFMono-Regular',Consolas,monospace" font-size="12"
        text-anchor="middle">bash — code-mycelium</text>

  <!-- ── Terminal content ───────────────────────────────── -->
${textEls}

${cursor}

</svg>
`;

process.stdout.write(svg);
