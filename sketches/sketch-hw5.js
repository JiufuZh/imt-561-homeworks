let data;
let selectedOpponent = null;
let hoveredOpponent = null;
let playerImgs = {};
let particles = [];

const PLAYER_IMAGE_PATHS = {
  chen_long: "images/hwk5/chen_long.png",
  viktor_axelsen: "images/hwk5/viktor_axelsen.png",
  chou_tien_chen: "images/hwk5/chou_tien_chen.png"
};

const PLAYER_IMAGE_ALIASES = {
  "chen_long": "chen_long",
  "chen long": "chen_long",
  "cl": "chen_long",
  "viktor_axelsen": "viktor_axelsen",
  "viktor axelsen": "viktor_axelsen",
  "va": "viktor_axelsen",
  "chou_tien_chen": "chou_tien_chen",
  "chou tien chen": "chou_tien_chen",
  "chou tien-chen": "chou_tien_chen",
  "ctc": "chou_tien_chen"
};

const IMAGE_TUNING = {
  chen_long: { zoom: 1.18, dx: 0, dy: 6 },
  viktor_axelsen: { zoom: 1.24, dx: 0, dy: 10 },
  chou_tien_chen: { zoom: 1.20, dx: 0, dy: 8 }
};

const C = {
  bg: "#06111b",
  card: "#0b1a27",
  cardDeep: "#07131d",
  stroke: "#203a50",
  gold: "#f4c84a",
  gold2: "#ffe27a",
  cyan: "#3fd5ef",
  blue: "#64b2ff",
  pink: "#ff6f91",
  lime: "#d5ff62",
  text: "#f2f6fb",
  muted: "#9fb0bd",
  dim: "#64727d",
  green: "#96f266",
  red: "#ff7d85"
};

const L = {
  header: { x: 44, y: 22 },
  selector: { x: 1050, y: 18, w: 278, h: 88 },
  hero: { x: 42, y: 128, w: 790, h: 506 },
  detail: { x: 858, y: 128, w: 464, h: 506 },
  chenPattern: { x: 42, y: 660, w: 410, h: 168 },
  oppPattern: { x: 478, y: 660, w: 410, h: 168 },
  matchEvidence: { x: 914, y: 660, w: 408, h: 168 }
};

function preload() {
  data = loadJSON("data/chen_long_network_data.json");
  for (const key in PLAYER_IMAGE_PATHS) {
    playerImgs[key] = loadImage(
      PLAYER_IMAGE_PATHS[key],
      () => {},
      () => console.warn("Could not load image: " + PLAYER_IMAGE_PATHS[key])
    );
  }
}

function setup() {
  pixelDensity(2);
  const canvas = createCanvas(1366, 900);
  const holder = document.getElementById("hwk5-canvas-container") || document.getElementById("p5-holder");
  if (holder) canvas.parent(holder);

  textFont("Arial");
  selectedOpponent = (data.opponents && data.opponents.length) ? data.opponents[0] : null;

  for (let i = 0; i < 140; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      s: random(0.45, 1.35),
      a: random(8, 34)
    });
  }
}

function draw() {
  background(C.bg);
  drawBackground();
  drawHeader();
  drawSelector();
  drawHero();
  drawDetail();
  drawPatternCard(L.chenPattern, true);
  drawPatternCard(L.oppPattern, false);
  drawMatchEvidence();
  drawFooter();
}

function drawBackground() {
  noStroke();

  for (const p of particles) {
    fill(255, 255, 255, p.a);
    circle(p.x, p.y, p.s);
  }

  radialGlow(285, 430, 580, color(0, 120, 190, 9));
  radialGlow(345, 448, 360, color(244, 200, 74, 7));
  radialGlow(980, 520, 500, color(40, 170, 220, 5));
}

function drawHeader() {
  const { x, y } = L.header;

  noStroke();
  textAlign(LEFT, TOP);

  fill(C.text);
  textStyle(BOLD);
  setLetterSpacing(-0.1);
  textSize(24);
  text("Chen Long's Matchup Network", x, y);

  fill(C.gold);
  setLetterSpacing(-1.0);
  textSize(42);
  text("Winning Pressure by Opponent", x, y + 33);

  fill(C.muted);
  setLetterSpacing(0);
  textStyle(NORMAL);
  textSize(13);
  text("A focused tactical view: one pressure signature, supported by matchup evidence.", x + 2, y + 88);
}

function drawSelector() {
  const { x, y, w, h } = L.selector;
  drawCard(x, y, w, h, "OPPONENT");

  const boxX = x + 16;
  const boxY = y + 40;
  const boxW = w - 32;
  const boxH = 34;

  stroke(255, 255, 255, 26);
  fill(4, 10, 18, 180);
  rect(boxX, boxY, boxW, boxH, 10);

  noStroke();
  fill(C.text);
  textStyle(NORMAL);
  textSize(15);
  textAlign(LEFT, CENTER);
  text(selectedOpponent ? selectedOpponent.name : "None", boxX + 14, boxY + boxH / 2 + 1, boxW - 48, 24);

  fill(C.muted);
  textAlign(RIGHT, CENTER);
  text("▼", boxX + boxW - 14, boxY + boxH / 2 + 1);
}

function drawHero() {
  const { x, y, w, h } = L.hero;
  drawCard(x, y, w, h, "PRESSURE SIGNATURE");
  if (!selectedOpponent) return;

  drawOpponentChips(x + 20, y + 46, w - 40);

  const chen = { x: x + 320, y: y + 360, r: 108 };
  const selected = { x: x + 640, y: y + 356, r: 92 };

  drawMainRead(x + 30, y + 118, 155, selectedOpponent);
  drawConnection(chen, selected, selectedOpponent);
  drawSupportOrbit(x, y, selectedOpponent);

  drawPlayerNode(chen.x, chen.y, chen.r, getPlayerImage({ id: "chen_long", name: "Chen Long" }), "chen_long", C.gold, "Chen Long", `${data.chen.matches} matches / ${data.chen.games}`);
  drawPlayerNode(selected.x, selected.y, selected.r, getPlayerImage(selectedOpponent), getPlayerKey(selectedOpponent), C.cyan, selectedOpponent.name, `${selectedOpponent.chenGamesWon}-${selectedOpponent.opponentGamesWon} games`);

  selectedOpponent._node = selected;
}

function drawMainRead(x, y, w, o) {
  noStroke();

  fill(C.muted);
  textStyle(BOLD);
  textSize(12);
  textAlign(LEFT, TOP);
  text("TACTICAL READ", x, y);

  fill(C.text);
  textSize(24);
  drawWrappedText(`vs ${o.name}`, x, y + 18, w + 10, 2, 28);

  fill(C.gold);
  textSize(36);
  drawWrappedText(o.topChenReason.label, x, y + 98, w, 1, 38);

  fill(C.gold2);
  textSize(28);
  text(`${o.topChenReason.pct}%`, x, y + 145);

  fill(C.muted);
  textStyle(NORMAL);
  textSize(11.5);
  drawWrappedText("Chen Long's most frequent point-winning outcome in this matchup.", x, y + 182, w, 3, 15);
}

function drawConnection(chen, opp, o) {
  for (let i = 16; i >= 3; i -= 3) {
    stroke(244, 200, 74, 7);
    strokeWeight(i);
    line(chen.x, chen.y, opp.x, opp.y);
  }

  stroke(C.gold);
  strokeWeight(5);
  line(chen.x, chen.y, opp.x, opp.y);
}

function drawSupportOrbit(panelX, panelY, selected) {
  const others = (data.opponents || []).filter(o => o.id !== selected.id);
  const positions = [
    { x: panelX + 714, y: panelY + 154 },
    { x: panelX + 126, y: panelY + 438 }
  ];

  for (let i = 0; i < others.length; i++) {
    const o = others[i];
    const p = positions[i % positions.length];
    const r = 45;

    o._node = { x: p.x, y: p.y, r };

    const isHover = hoveredOpponent && hoveredOpponent.id === o.id;
    stroke(isHover ? C.gold : "rgba(255,255,255,0.16)");
    strokeWeight(isHover ? 2 : 1);
    fill(255, 255, 255, 5);
    circle(p.x, p.y, r * 2);

    drawCircularPhoto(getPlayerImage(o), p.x, p.y, r - 5, isHover ? 220 : 125, getPlayerKey(o));

    stroke(isHover ? C.gold : C.stroke);
    strokeWeight(isHover ? 2 : 1.5);
    noFill();
    circle(p.x, p.y, r * 2);

    drawNodeBadge(o.name, p.x, p.y + r + 7, isHover);

    noStroke();
    fill(C.dim);
    textStyle(NORMAL);
    textAlign(CENTER, TOP);
    textSize(10);
    text(`${o.chenGamesWon}-${o.opponentGamesWon} games`, p.x, p.y + r + 41);
  }
}

function drawNodeBadge(label, cx, y, active) {
  const w = min(132, max(86, tw(label, 10.5) + 22));
  noStroke();
  fill(active ? alphaColor(C.gold, 36) : color(5, 13, 21, 180));
  rect(cx - w / 2, y, w, 22, 11);
  stroke(active ? C.gold : C.stroke);
  strokeWeight(1);
  noFill();
  rect(cx - w / 2, y, w, 22, 11);

  noStroke();
  fill(active ? C.gold : C.muted);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  textSize(10.5);
  text(trimLabel(label, 17), cx, y + 11);
}

function drawPlayerNode(x, y, r, img, imgKey, accent, name, sub) {
  glowRing(x, y, r, accent);

  noStroke();
  fill("#04070c");
  circle(x, y, r * 2);

  drawCircularPhoto(img, x, y, r - 6, 255, imgKey);

  stroke(accent);
  strokeWeight(4);
  noFill();
  circle(x, y, r * 2);

  noStroke();
  fill(C.text);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  textSize(15);
  drawWrappedCentered(name, x, y + r + 10, 150, 2, 17);

  fill(C.muted);
  textStyle(NORMAL);
  textSize(11);
  text(sub, x, y + r + 44);
}

function drawDetail() {
  const { x, y, w, h } = L.detail;
  drawCard(x, y, w, h, "MATCHUP DETAIL");
  if (!selectedOpponent) return;

  const o = selectedOpponent;

  noStroke();
  fill(C.text);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  textSize(22);
  drawWrappedText(`Chen Long vs ${o.name}`, x + 20, y + 50, w - 40, 2, 29);

  drawTacticalProfile(x + 20, y + 108, w - 40, o);

  fill(C.muted);
  textStyle(NORMAL);
  textSize(12);
  drawWrappedText(safeNarrative(o), x + 20, y + 302, w - 40, 2, 16);

  drawStatRow(x + 20, y + 350, w - 40, o);

  fill(C.lime);
  textStyle(BOLD);
  textSize(12);
  text("MATCH RESULTS", x + 20, y + 418);

  drawMatchCards(x + 20, y + 438, w - 40, h - 452, o);
}

function drawTacticalProfile(x, y, w, o) {
  const oppTop = (o.opponentScoringReasons && o.opponentScoringReasons.length) ? o.opponentScoringReasons[0] : null;

  noStroke();
  fill(C.lime);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  textSize(12);
  text("TACTICAL PROFILE", x, y);

  const cardY = y + 22;
  const gap = 8;
  const cw = (w - gap * 2) / 3;

  drawMiniMetric(x, cardY, cw, 52, "Chen pressure", o.topChenReason.label, `${o.topChenReason.pct}%`, C.gold);
  drawMiniMetric(x + cw + gap, cardY, cw, 52, "Opponent answer", oppTop ? oppTop.label : "N/A", oppTop ? `${oppTop.pct}%` : "", C.blue);
  drawMiniMetric(x + (cw + gap) * 2, cardY, cw, 52, "Game split", `${o.chenGamesWon}-${o.opponentGamesWon}`, "games", C.lime);

  fill(C.muted);
  textStyle(BOLD);
  textSize(11);
  text("SHOT TYPE PROFILE", x, y + 88);

  drawShotTypeMini(x, y + 112, w, o);
}

function drawMiniMetric(x, y, w, h, label, value, pct, accent) {
  stroke(255, 255, 255, 20);
  fill(255, 255, 255, 6);
  rect(x, y, w, h, 10);

  noStroke();
  fill(C.muted);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  textSize(9.2);
  text(label, x + 9, y + 7, w - 18, 12);

  fill(accent);
  textStyle(BOLD);
  textSize(11.8);
  drawWrappedText(value, x + 9, y + 20, w - 18, 1, 14);

  fill(C.text);
  textSize(10.5);
  text(pct, x + 9, y + 35);
}

function drawShotTypeMini(x, y, w, o) {
  const rows = (o.shotTypes || [])
    .slice()
    .sort((a, b) => (b.chen + b.opponent) - (a.chen + a.opponent))
    .slice(0, 3);

  if (!rows.length) {
    fill(C.dim);
    textStyle(NORMAL);
    textSize(11);
    text("No shot type data available.", x, y);
    return;
  }

  const maxVal = max(rows.map(r => max(r.chen, r.opponent)));
  const labelW = 72;
  const barW = w - labelW - 64;

  drawLegend(x, y + 67, C.gold, "Chen");
  drawLegend(x + 60, y + 67, C.blue, "Opp.");

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const yy = y + i * 20;

    noStroke();
    fill(C.muted);
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    textSize(10.2);
    text(trimLabel(r.type, 12), x, yy + 6);

    fill(255, 255, 255, 10);
    rect(x + labelW, yy, barW, 6, 4);
    rect(x + labelW, yy + 8, barW, 6, 4);

    fill(C.gold);
    rect(x + labelW, yy, map(r.chen, 0, maxVal, 0, barW), 6, 4);
    fill(C.blue);
    rect(x + labelW, yy + 8, map(r.opponent, 0, maxVal, 0, barW), 6, 4);

    fill(C.text);
    textAlign(RIGHT, CENTER);
    textSize(9.5);
    text(`${r.chen}/${r.opponent}`, x + w, yy + 7);
  }
}

function drawStatRow(x, y, w, o) {
  const cards = [
    ["Win rate", `${o.chenPointWinRate}%`, C.gold],
    ["Rallies", `${o.observedRallies}`, C.cyan],
    ["Avg rally", `${o.avgRallyLength}`, C.pink],
    ["Shots", `${o.totalShots}`, C.blue]
  ];

  const gap = 8;
  const cw = (w - gap * 3) / 4;
  const h = 46;

  for (let i = 0; i < cards.length; i++) {
    const xx = x + i * (cw + gap);

    stroke(255, 255, 255, 20);
    fill(255, 255, 255, 7);
    rect(xx, y, cw, h, 10);

    noStroke();
    fill(C.muted);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);
    textSize(9.2);
    text(cards[i][0], xx + 9, y + 7, cw - 18, 12);

    fill(cards[i][2]);
    textStyle(BOLD);
    textSize(17);
    text(cards[i][1], xx + 9, y + 23, cw - 18, 18);
  }
}

function drawStatGrid(x, y, w, o) {
  const cards = [
    ["Chen win rate", `${o.chenPointWinRate}%`, C.gold],
    ["Rallies", `${o.observedRallies}`, C.cyan],
    ["Avg rally", `${o.avgRallyLength}`, C.pink],
    ["Shots", `${o.totalShots}`, C.blue]
  ];

  const gap = 10;
  const cw = (w - gap) / 2;
  const ch = 52;

  for (let i = 0; i < cards.length; i++) {
    const xx = x + (i % 2) * (cw + gap);
    const yy = y + floor(i / 2) * (ch + gap);

    stroke(255, 255, 255, 20);
    fill(255, 255, 255, 7);
    rect(xx, yy, cw, ch, 10);

    noStroke();
    fill(C.muted);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);
    textSize(10.5);
    text(cards[i][0], xx + 10, yy + 8, cw - 20, 14);

    fill(cards[i][2]);
    textStyle(BOLD);
    textSize(21);
    text(cards[i][1], xx + 10, yy + 25, cw - 20, 22);
  }
}

function drawMatchCards(x, y, w, maxH, o) {
  const list = o.matchesDetail || [];
  const cardH = list.length <= 1 ? 52 : (list.length === 2 ? 44 : 36);
  let yy = y;

  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    if (yy + cardH > y + maxH) break;

    stroke(255, 255, 255, 20);
    fill(255, 255, 255, 6);
    rect(x, yy, w, cardH, 10);

    noStroke();
    fill(C.text);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    textSize(12);
    text(trimLabel(m.match_label, 34), x + 12, yy + 7, w - 120, 16);

    fill(C.muted);
    textStyle(NORMAL);
    textSize(10.5);
    text(trimLabel(m.scoreline || "", 30), x + 12, yy + (cardH > 40 ? 24 : 20));

    fill(m.chen_match_won ? C.green : C.red);
    textStyle(BOLD);
    textAlign(RIGHT, CENTER);
    text(m.chen_match_won ? "Chen won" : "Chen lost", x + w - 12, yy + cardH / 2);

    yy += cardH + 8;
  }
}

function drawPatternCard(bounds, isChen) {
  const { x, y, w, h } = bounds;
  const o = selectedOpponent;
  drawCard(x, y, w, h, isChen ? "CHEN POINTS WON BY" : "OPPONENT POINTS WON BY");
  if (!o) return;

  const rows = isChen ? (o.chenScoringReasons || []).slice(0, 4) : (o.opponentScoringReasons || []).slice(0, 4);
  const accent = isChen ? C.gold : C.blue;

  drawRankBars(x + 18, y + 56, w - 36, rows, accent);
}

function drawRankBars(x, y, w, rows, accent) {
  let maxPct = max(rows.map(r => r.pct));
  if (!isFinite(maxPct) || maxPct <= 0) maxPct = 1;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const yy = y + i * 25;

    noStroke();
    fill(C.text);
    textStyle(i === 0 ? BOLD : NORMAL);
    textSize(11.5);
    textAlign(LEFT, CENTER);
    text(trimLabel(r.label, 23), x, yy);

    fill(255, 255, 255, 10);
    rect(x + 170, yy - 5, w - 232, 9, 5);

    fill(accent);
    rect(x + 170, yy - 5, map(r.pct, 0, maxPct, 0, w - 232), 9, 5);

    fill(i === 0 ? accent : C.muted);
    textAlign(RIGHT, CENTER);
    text(`${r.pct}%`, x + w, yy);
  }
}

function drawMatchEvidence() {
  const { x, y, w, h } = L.matchEvidence;
  const o = selectedOpponent;
  drawCard(x, y, w, h, "SHOT TYPE MIX");
  if (!o) return;

  const shotRows = (o.shotTypes || []).slice().sort((a, b) => b.chen - a.chen);
  if (!shotRows.length) {
    noStroke();
    fill(C.muted);
    textSize(12);
    text("No shot-type data available.", x + 18, y + 54);
    return;
  }

  const total = shotRows.reduce((s, r) => s + Number(r.chen || 0), 0) || 1;
  const top = shotRows.slice(0, 4).map(r => ({ label: r.type, value: Number(r.chen || 0) }));
  const rest = shotRows.slice(4).reduce((s, r) => s + Number(r.chen || 0), 0);
  if (rest > 0) top.push({ label: 'Other', value: rest });

  const palette = [C.gold, C.cyan, C.blue, C.pink, C.lime];
  const cx = x + 98;
  const cy = y + 92;
  const outerR = 46;
  const innerR = 24;

  let start = -HALF_PI;
  noStroke();
  for (let i = 0; i < top.length; i++) {
    const frac = top[i].value / total;
    const end = start + frac * TWO_PI;
    fill(palette[i % palette.length]);
    arc(cx, cy, outerR * 2, outerR * 2, start, end, PIE);
    start = end;
  }
  fill(C.card);
  circle(cx, cy, innerR * 2);

  fill(C.text);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(13);
  text('Chen', cx, cy - 7);
  textStyle(NORMAL);
  textSize(10);
  text('shot mix', cx, cy + 9);

  let ly = y + 52;
  const lx = x + 188;
  for (let i = 0; i < top.length; i++) {
    const item = top[i];
    const pct = (item.value / total * 100).toFixed(1);
    noStroke();
    fill(palette[i % palette.length]);
    rect(lx, ly + i * 20, 10, 10, 2);
    fill(C.text);
    textAlign(LEFT, CENTER);
    textStyle(i === 0 ? BOLD : NORMAL);
    textSize(10.5);
    text(trimLabel(item.label, 15), lx + 16, ly + 5 + i * 20);
    fill(C.muted);
    textAlign(RIGHT, CENTER);
    text(`${pct}%`, x + w - 18, ly + 5 + i * 20);
  }
}

function drawFooter() {
  noStroke();
  fill(C.dim);
  textAlign(LEFT, BOTTOM);
  textStyle(NORMAL);
  textSize(10.5);
  text(`Dataset: ${data.datasetNote || "Chen Long matchup dataset"} • Click opponent chips or smaller nodes to update the view.`, 42, 884);
}

function drawOpponentChips(startX, startY, availableW) {
  let x = startX;
  let y = startY;
  const gap = 10;

  for (const o of data.opponents || []) {
    const isSel = selectedOpponent && selectedOpponent.id === o.id;
    const chipW = constrain(50 + tw(o.name, 12), 128, 188);

    if (x + chipW > startX + availableW) {
      x = startX;
      y += 36;
    }

    stroke(isSel ? C.gold : C.stroke);
    strokeWeight(isSel ? 1.5 : 1);
    fill(isSel ? alphaColor(C.gold, 30) : color(255, 255, 255, 6));
    rect(x, y, chipW, 27, 14);

    noStroke();
    fill(isSel ? C.gold : C.text);
    textStyle(isSel ? BOLD : NORMAL);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(o.name, x + chipW / 2, y + 13.5);

    o._chip = { x, y, w: chipW, h: 27 };
    x += chipW + gap;
  }
}

function mouseMoved() {
  hoveredOpponent = null;
  for (const o of data.opponents || []) {
    if (o._node && dist(mouseX, mouseY, o._node.x, o._node.y) <= o._node.r) {
      hoveredOpponent = o;
      return;
    }
    if (o._chip && pointInRect(mouseX, mouseY, o._chip)) {
      hoveredOpponent = o;
      return;
    }
  }
}

function mousePressed() {
  for (const o of data.opponents || []) {
    if (o._chip && pointInRect(mouseX, mouseY, o._chip)) {
      selectedOpponent = o;
      return;
    }
    if (o._node && dist(mouseX, mouseY, o._node.x, o._node.y) <= o._node.r + 4) {
      selectedOpponent = o;
      return;
    }
  }
}

function drawCard(x, y, w, h, title) {
  stroke(255, 255, 255, 22);
  strokeWeight(1);
  fill(C.card);
  rect(x, y, w, h, 16);

  noStroke();
  fill(C.text);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  textSize(15.5);
  text(title, x + 18, y + 16);
}

function drawLegend(x, y, col, label) {
  noStroke();
  fill(col);
  rect(x, y, 10, 10, 2);
  fill(C.muted);
  textAlign(LEFT, CENTER);
  textSize(11);
  text(label, x + 15, y + 5);
}

function radialGlow(x, y, maxR, c) {
  noStroke();
  for (let r = maxR; r > 0; r -= 18) {
    fill(red(c), green(c), blue(c), map(r, 0, maxR, 0, alpha(c)));
    circle(x, y, r * 2);
  }
}

function glowRing(x, y, r, hex) {
  const c = color(hex);
  noStroke();
  for (let i = 4; i >= 1; i--) {
    c.setAlpha(10 * i);
    fill(c);
    circle(x, y, r * 2 + i * 14);
  }
}

function drawCircularPhoto(img, x, y, r, alpha = 255, imgKey = null) {
  if (!img || img.width === 0) return;

  const tuning = IMAGE_TUNING[imgKey] || { zoom: 1, dx: 0, dy: 0 };

  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(x, y, r, 0, TWO_PI);
  drawingContext.closePath();
  drawingContext.clip();

  imageMode(CENTER);
  if (alpha < 255) tint(255, alpha);

  const scale = max((r * 2) / img.width, (r * 2) / img.height) * tuning.zoom;
  image(img, x + tuning.dx, y + tuning.dy, img.width * scale, img.height * scale);

  noTint();
  drawingContext.restore();
  pop();
}

function getPlayerImage(player) {
  const key = getPlayerKey(player);
  return key ? playerImgs[key] : null;
}

function getPlayerKey(player) {
  const candidates = [player?.id, player?.name, initials(player?.name)].filter(Boolean);

  for (const raw of candidates) {
    const base = normalizeKey(raw);
    const key1 = base.replace(/\s+/g, "_");
    const key2 = base.replace(/[\s-]+/g, "_");
    const alias = PLAYER_IMAGE_ALIASES[base] || PLAYER_IMAGE_ALIASES[key1] || PLAYER_IMAGE_ALIASES[key2];

    if (alias && playerImgs[alias]) return alias;
    if (playerImgs[key1]) return key1;
    if (playerImgs[key2]) return key2;
  }

  return null;
}

function safeNarrative(o) {
  const txt = String(o?.narrative || "");
  if (!txt) return "The selected opponent changes which pressure pattern becomes most important.";
  return txt;
}

function normalizeKey(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function shortName(name) {
  if (!name) return "this opponent";
  const parts = name.split(" ");
  return parts.length > 1 ? parts.slice(-2).join(" ") : name;
}

function trimLabel(str, maxChars) {
  str = String(str || "");
  if (str.length <= maxChars) return str;
  return str.slice(0, maxChars - 1) + "…";
}

function drawWrappedCentered(str, cx, y, w, maxLines, lineH) {
  const lines = makeLines(str, w, maxLines);
  textAlign(CENTER, TOP);
  for (let i = 0; i < lines.length; i++) text(lines[i], cx, y + i * lineH);
}

function drawWrappedText(str, x, y, w, maxLines, lineH) {
  const lines = makeLines(str, w, maxLines);
  textAlign(LEFT, TOP);
  for (let i = 0; i < lines.length; i++) text(lines[i], x, y + i * lineH);
}

function makeLines(str, w, maxLines) {
  const words = String(str || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const test = current ? current + " " + word : word;

    if (textWidth(test) <= w || !current) {
      current = test;
    } else {
      lines.push(current);
      current = word;
    }

    if (lines.length === maxLines) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (words.length && lines.length === maxLines) {
    const used = lines.join(" ").split(/\s+/).length;
    if (used < words.length) {
      let last = lines[lines.length - 1];
      while (textWidth(last + "…") > w && last.length > 4) last = last.slice(0, -1);
      lines[lines.length - 1] = last + "…";
    }
  }

  return lines;
}

function tw(str, size = 12) {
  push();
  textSize(size);
  const w = textWidth(str || "");
  pop();
  return w;
}

function alphaColor(hex, a) {
  const c = color(hex);
  c.setAlpha(a);
  return c;
}

function setLetterSpacing(px = 0) {
  if (drawingContext && "letterSpacing" in drawingContext) {
    drawingContext.letterSpacing = `${px}px`;
  }
}

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function windowResized() {}
