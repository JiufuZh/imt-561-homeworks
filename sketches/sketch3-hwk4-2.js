let showLabels = true;
let demoMode = false;
let demoIsPM = false;
let sparkles = [];
let hoveredHour = null;
let hoverMessage = "";

function setup() {
  createCanvas(800, 800);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
}

function draw() {
  let realH24 = hour();
  let m = minute();
  let s = second();
  let ms = millis();

  let h24 = demoMode ? (demoIsPM ? 14 : 8) : realH24;

  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  let ampm = h24 >= 12 ? "PM" : "AM";
  let progress = (m + s / 60) / 60;

  hoveredHour = null;
  hoverMessage = "";

  drawBackground();
  drawHeatGlow(h24);
  drawSteam(s, ms);
  drawHourHalo(h12, ms);
  drawRiceCooker(h12, m, s, ms, ampm, progress, h24);

  updateSparkles();
  drawInteractionLabels();
  drawHoverMessage();
}

/* ---------- Background ---------- */

function drawBackground() {
  background(252, 244, 228);

  noStroke();

  fill(255, 226, 178, 65);
  circle(85, 90, 125);

  fill(218, 235, 238, 75);
  circle(715, 95, 135);

  fill(245, 222, 228, 50);
  circle(720, 690, 160);

  fill(235, 244, 220, 50);
  circle(80, 690, 150);

  fill(255, 255, 255, 120);
  textSize(18);
  text("✦", 260, 95);
  text("✦", 540, 95);
}

function drawHeatGlow(h24) {
  noStroke();

  if (h24 < 12) {
    fill(255, 220, 130, 34);
  } else {
    fill(255, 125, 75, 42);
  }

  ellipse(width / 2, 655, 560, 165);
}

/* ---------- Hour: Rice Grains ---------- */

function drawHourHalo(h12, ms) {
  let cx = width / 2;
  let cy = 300;
  let r = 245;
  let pulse = 1 + sin(ms * 0.18) * 0.08;

  noFill();
  stroke(160, 125, 85, 55);
  strokeWeight(3);
  arc(cx, cy, r * 2, r * 2, 205, 335);

  for (let i = 1; i <= 12; i++) {
    let angle = map(i, 1, 12, 205, 335);
    let x = cx + cos(angle) * r;
    let y = cy + sin(angle) * r;

    let d = dist(mouseX, mouseY, x, y);
    let isHover = d < 22;

    if (isHover) {
      hoveredHour = i;
      hoverMessage = "Hour rice grain: " + i;
    }

    push();
    translate(x, y);
    rotate(angle + 90);

    stroke(80, 62, 48);
    strokeWeight(isHover ? 3 : 1.5);

    if (i < h12) {
      fill(248, 214, 145);
      ellipse(0, 0, isHover ? 30 : 24, isHover ? 14 : 11);
    } else if (i === h12) {
      fill(255, 181, 75);
      ellipse(0, 0, 30 * pulse, 14 * pulse);

      noFill();
      stroke(255, 220, 150, 165);
      strokeWeight(3);
      ellipse(0, 0, 42 * pulse, 22 * pulse);
    } else {
      fill(255, 250, 234);
      ellipse(0, 0, isHover ? 30 : 24, isHover ? 14 : 11);
    }

    pop();
  }
}

/* ---------- Seconds: Steam ---------- */

function drawSteam(s, ms) {
  let lift = map(s, 0, 59, 0, -24);
  let sway = sin(ms * 0.08) * 8;

  noFill();

  stroke(245, 213, 170, 120);
  strokeWeight(7);
  drawSteamPuff(250 + sway, 230 + lift, 1);
  drawSteamPuff(550 - sway, 230 + lift, -1);

  stroke(255, 250, 238, 170);
  strokeWeight(4);
  drawSteamPuff(250 + sway, 230 + lift, 1);
  drawSteamPuff(550 - sway, 230 + lift, -1);
}

function drawSteamPuff(x, y, dir) {
  arc(x, y, 34, 70, 115, 300);
  arc(x + dir * 30, y + 35, 44, 78, 115, 300);
  arc(x + dir * 60, y + 78, 32, 62, 115, 300);
}

/* ---------- Main Cooker ---------- */

function drawRiceCooker(h12, m, s, ms, ampm, progress, h24) {
  drawCookerShadow();
  drawHandles();
  drawCookerBody();
  drawLid();
  drawFrontTimePanel(h12, m, ampm);
  drawRiceWindow(progress, m, s, ms);
  drawControlBase(h24);
}

function drawCookerShadow() {
  noStroke();
  fill(70, 50, 35, 28);
  ellipse(width / 2, 665, 640, 75);
}

function drawHandles() {
  noFill();

  stroke(63, 50, 40);
  strokeWeight(13);
  arc(185, 455, 105, 165, 85, 275);
  arc(615, 455, 105, 165, -95, 95);

  stroke(95, 78, 65);
  strokeWeight(6);
  arc(185, 455, 88, 145, 85, 275);
  arc(615, 455, 88, 145, -95, 95);

  stroke(252, 244, 228);
  strokeWeight(4);
  arc(185, 455, 68, 115, 85, 275);
  arc(615, 455, 68, 115, -95, 95);
}

function drawCookerBody() {
  stroke(55, 45, 38);
  strokeWeight(4);
  fill(222, 236, 239);
  rect(185, 335, 430, 315, 42);

  noStroke();
  fill(255, 255, 255, 75);
  rect(208, 365, 62, 250, 32);

  noFill();
  stroke(255, 255, 255, 100);
  strokeWeight(6);
  rect(199, 350, 402, 280, 34);
}

function drawLid() {
  stroke(55, 45, 38);
  strokeWeight(4);
  fill(219, 234, 237);
  arc(400, 335, 520, 120, 180, 360);
  line(140, 335, 660, 335);

  noStroke();
  fill(255, 255, 255, 100);
  arc(400, 330, 470, 84, 185, 350);

  fill(255, 252, 235);
  ellipse(250, 305, 32, 13);
  ellipse(330, 292, 30, 12);
  ellipse(410, 305, 32, 13);
  ellipse(490, 292, 30, 12);
  ellipse(570, 305, 32, 13);

  stroke(55, 45, 38);
  strokeWeight(4);
  fill(145, 115, 88);
  arc(400, 280, 105, 48, 180, 360);
  line(348, 280, 452, 280);
}

/* ---------- Time Display ---------- */

function drawFrontTimePanel(h, m, ampm) {
  let x = width / 2;
  let y = 385;
  let w = 275;
  let hgt = 62;

  noStroke();
  fill(70, 50, 35, 24);
  rect(x - w / 2 + 3, y - hgt / 2 + 5, w, hgt, 22);

  fill(255, 248, 232, 248);
  stroke(55, 45, 38);
  strokeWeight(3);
  rect(x - w / 2, y - hgt / 2, w, hgt, 22);

  noStroke();
  fill(45, 34, 26);
  textStyle(BOLD);
  textSize(42);
  text(nf(h, 2) + ":" + nf(m, 2), x - 16, y + 2);

  textSize(16);
  text(ampm, x + 105, y + 5);

  if (demoMode) {
    textSize(10);
    fill(130, 80, 45);
    text("DEMO", x + 106, y - 17);
  }
}

/* ---------- Minute: Rice Height ---------- */

function drawRiceWindow(progress, currentMinute, currentSecond, ms) {
  let x = 225;
  let y = 430;
  let w = 350;
  let h = 185;

  let isHover = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

  if (isHover) {
    hoverMessage = "Rice height = minute progress";
  }

  fill(248, 252, 248);
  stroke(isHover ? color(210, 145, 70) : color(80, 70, 60));
  strokeWeight(isHover ? 4 : 3);
  rect(x, y, w, h, 30);

  noStroke();
  fill(255, 249, 225);
  rect(x + 12, y + 14, w - 24, h - 28, 22);

  let riceMaxH = h - 36;
  let riceH = map(progress, 0, 1, 5, riceMaxH);
  let riceY = y + h - 16 - riceH;

  fill(255, 246, 210);
  rect(x + 14, riceY, w - 28, riceH, 0, 0, 20, 20);

  fill(255, 252, 232);
  beginShape();

  for (let i = x + 14; i <= x + w - 14; i += 10) {
    let unevenY = riceY + sin(i * 0.12 + ms * 0.03) * 2;
    vertex(i, unevenY);
  }

  vertex(x + w - 14, y + h - 16);
  vertex(x + 14, y + h - 16);
  endShape(CLOSE);

  drawRiceTexture(x, y, w, h, riceY, riceH);
  drawBubbles(x, y, w, h, progress, currentSecond, ms);
  drawPercentScale(x + w - 42, y + 33, h - 58);
  drawRiceLevelLabel(x, y, w, riceY, currentMinute, progress);

  noFill();
  stroke(255, 255, 255, 145);
  strokeWeight(5);
  arc(x + 58, y + 48, 90, 70, 190, 280);
}

function drawRiceTexture(x, y, w, h, riceY, riceH) {
  noStroke();

  let safeRiceH = max(10, riceH - 12);

  fill(255, 255, 240, 210);

  for (let i = 0; i < 95; i++) {
    let gx = x + 24 + (i * 23) % (w - 64);
    let gy = riceY + 10 + (i * 17) % safeRiceH;

    if (gy < y + h - 18) {
      push();
      translate(gx, gy);
      rotate((i * 37) % 25 - 12);
      ellipse(0, 0, 11, 5);
      pop();
    }
  }

  fill(235, 195, 115, 80);

  for (let i = 0; i < 35; i++) {
    let gx = x + 30 + (i * 31) % (w - 75);
    let gy = riceY + 14 + (i * 19) % safeRiceH;

    if (gy < y + h - 18) {
      ellipse(gx, gy + 2, 9, 2);
    }
  }
}

function drawBubbles(x, y, w, h, progress, currentSecond, ms) {
  noStroke();

  let riceTop = y + h - 16 - map(progress, 0, 1, 5, h - 36);

  for (let i = 0; i < 12; i++) {
    let bx = x + 42 + (i * 48) % (w - 95);
    let by = riceTop - 8 - ((ms * 0.035 + i * 31) % 100);
    let size = 4.5 + sin(ms * 0.16 + i * 25) * 2;

    if (by > y + 24 && by < y + h - 20) {
      fill(255, 255, 255, 125);
      circle(bx, by, size);

      if (currentSecond % 12 === i) {
        fill(255, 255, 235, 185);
        circle(bx + 3, by - 7, size + 4);
      }
    }
  }
}

function drawPercentScale(x, y, h) {
  stroke(105, 85, 66);
  strokeWeight(2);
  line(x, y, x, y + h);

  let labels = [100, 75, 50, 25];

  for (let p of labels) {
    let yy = map(p, 0, 100, y + h, y);
    line(x - 10, yy, x + 10, yy);
  }
}

function drawRiceLevelLabel(x, y, w, riceY, currentMinute, progress) {
  let labelX = x + 105;
  let labelY = constrain(riceY - 18, y + 22, y + 150);
  let labelText = currentMinute + " min · " + floor(progress * 100) + "%";

  noStroke();
  fill(70, 50, 35, 25);
  rect(labelX - 58 + 2, labelY - 15 + 3, 116, 30, 14);

  fill(255, 248, 232, 235);
  stroke(55, 45, 38);
  strokeWeight(2);
  rect(labelX - 58, labelY - 15, 116, 30, 14);

  noStroke();
  fill(55, 45, 38);
  textStyle(BOLD);
  textSize(13);
  text(labelText, labelX, labelY);
}

/* ---------- AM / PM Control Base ---------- */

function drawControlBase(h24) {
  let x = 105;
  let y = 638;
  let w = 590;
  let baseH = 96;

  let isPM = h24 >= 12;

  let lowHover = dist(mouseX, mouseY, x + 105, y + 48) < 38;
  let highHover = dist(mouseX, mouseY, x + w - 95, y + 48) < 38;

  if (lowHover) {
    hoverMessage = "Click LOW to preview AM mode";
  }

  if (highHover) {
    hoverMessage = "Click HIGH to preview PM mode";
  }

  noStroke();
  fill(70, 50, 35, 28);
  ellipse(width / 2, y + baseH + 14, 540, 35);

  fill(244, 236, 222);
  stroke(55, 45, 38);
  strokeWeight(4);
  rect(x, y, w, baseH, 30);

  fill(255, 251, 244);
  stroke(65, 55, 48);
  strokeWeight(3);
  rect(x + 38, y + 20, w - 76, 54, 24);

  noStroke();
  textStyle(BOLD);
  textSize(15);

  fill(!isPM ? color(120, 75, 20) : color(95, 85, 75));
  text("LOW", x + 150, y + 48);

  fill(isPM ? color(150, 55, 35) : color(95, 85, 75));
  text("HIGH", x + w - 145, y + 48);

  if (!isPM) {
    fill(255, 205, 90);
    circle(x + 105, y + 48, lowHover ? 22 : 18);

    fill(255, 220, 130, 80);
    circle(x + 105, y + 48, lowHover ? 42 : 34);
  } else {
    fill(190, 180, 165);
    circle(x + 105, y + 48, lowHover ? 18 : 14);
  }

  if (isPM) {
    fill(255, 120, 70);
    circle(x + w - 95, y + 48, highHover ? 22 : 18);

    fill(255, 135, 90, 80);
    circle(x + w - 95, y + 48, highHover ? 42 : 34);
  } else {
    fill(190, 180, 165);
    circle(x + w - 95, y + 48, highHover ? 18 : 14);
  }

  drawDial(width / 2, y + 56, h24);
}

function drawDial(cx, cy, h24) {
  let isPM = h24 >= 12;

  stroke(95, 80, 68);
  strokeWeight(4);
  strokeCap(ROUND);

  let tickAngles = [-130, -90, -50];

  for (let i = 0; i < tickAngles.length; i++) {
    let a = tickAngles[i];

    let x1 = cx + cos(a) * 54;
    let y1 = cy + sin(a) * 54;
    let x2 = cx + cos(a) * 64;
    let y2 = cy + sin(a) * 64;

    line(x1, y1, x2, y2);
  }

  fill(220, 210, 194);
  stroke(55, 45, 38);
  strokeWeight(4);
  circle(cx, cy, 78);

  fill(255, 250, 240);
  stroke(120, 105, 90);
  strokeWeight(2);
  circle(cx, cy, 54);

  let angle = isPM ? -50 : -130;

  let px = cx + cos(angle) * 25;
  let py = cy + sin(angle) * 25;

  stroke(55, 45, 38);
  strokeWeight(5);
  line(cx, cy, px, py);

  noStroke();
  fill(55, 45, 38);
  circle(cx, cy, 7);

  strokeCap(SQUARE);
}

/* ---------- Interaction Layer ---------- */

function mousePressed() {
  let riceX = 225;
  let riceY = 430;
  let riceW = 350;
  let riceH = 185;

  if (
    mouseX > riceX &&
    mouseX < riceX + riceW &&
    mouseY > riceY &&
    mouseY < riceY + riceH
  ) {
    addSparkles(mouseX, mouseY);
  }

  let baseX = 105;
  let baseY = 638;
  let baseW = 590;

  if (dist(mouseX, mouseY, baseX + 105, baseY + 48) < 42) {
    demoMode = true;
    demoIsPM = false;
  }

  if (dist(mouseX, mouseY, baseX + baseW - 95, baseY + 48) < 42) {
    demoMode = true;
    demoIsPM = true;
  }
}

function keyPressed() {
  if (key === "l" || key === "L") {
    showLabels = !showLabels;
  }

  if (key === "r" || key === "R") {
    demoMode = false;
  }
}

function addSparkles(x, y) {
  for (let i = 0; i < 12; i++) {
    sparkles.push({
      x: x,
      y: y,
      vx: random(-1.6, 1.6),
      vy: random(-2.3, -0.5),
      size: random(4, 9),
      life: 60
    });
  }
}

function updateSparkles() {
  noStroke();

  for (let i = sparkles.length - 1; i >= 0; i--) {
    let p = sparkles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.035;
    p.life--;

    fill(255, 240, 180, map(p.life, 0, 60, 0, 180));
    circle(p.x, p.y, p.size);

    if (p.life <= 0) {
      sparkles.splice(i, 1);
    }
  }
}

function drawInteractionLabels() {
  if (!showLabels) return;

  drawSmallTag("hover rice grains = hour", 400, 138);
  drawSmallTag("click rice window = bubble effect", 400, 625);
  drawSmallTag("click LOW/HIGH = demo AM/PM", 400, 748);
  drawSmallTag("press L hide labels · press R real time", 400, 775);
}

function drawSmallTag(label, x, y) {
  noStroke();
  fill(255, 248, 232, 230);
  rect(x - textWidth(label) / 2 - 12, y - 13, textWidth(label) + 24, 26, 13);

  fill(70, 55, 42);
  textStyle(BOLD);
  textSize(12);
  text(label, x, y);
}

function drawHoverMessage() {
  if (hoverMessage === "") return;

  let x = mouseX;
  let y = mouseY - 32;

  textSize(12);
  textStyle(BOLD);

  let tw = textWidth(hoverMessage);

  noStroke();
  fill(55, 42, 32, 220);
  rect(x - tw / 2 - 10, y - 13, tw + 20, 26, 13);

  fill(255, 248, 232);
  text(hoverMessage, x, y);
}