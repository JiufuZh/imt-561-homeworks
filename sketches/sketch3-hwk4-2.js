const sketch3Hwk4_2 = (p) => {
  let showLabels = true;
  let demoMode = false;
  let demoIsPM = false;
  let sparkles = [];
  let hoveredHour = null;
  let hoverMessage = "";

  p.setup = function () {
    p.createCanvas(800, 800);
    p.angleMode(p.DEGREES);
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.draw = function () {
    let realH24 = p.hour();
    let m = p.minute();
    let s = p.second();
    let ms = p.millis();

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
  };

  /* ---------- Background ---------- */

  function drawBackground() {
    p.background(252, 244, 228);

    p.noStroke();

    p.fill(255, 226, 178, 65);
    p.circle(85, 90, 125);

    p.fill(218, 235, 238, 75);
    p.circle(715, 95, 135);

    p.fill(245, 222, 228, 50);
    p.circle(720, 690, 160);

    p.fill(235, 244, 220, 50);
    p.circle(80, 690, 150);

    p.fill(255, 255, 255, 120);
    p.textSize(18);
    p.text("✦", 260, 95);
    p.text("✦", 540, 95);
  }

  function drawHeatGlow(h24) {
    p.noStroke();

    if (h24 < 12) {
      p.fill(255, 220, 130, 34);
    } else {
      p.fill(255, 125, 75, 42);
    }

    p.ellipse(p.width / 2, 655, 560, 165);
  }

  /* ---------- Hour: Rice Grains ---------- */

  function drawHourHalo(h12, ms) {
    let cx = p.width / 2;
    let cy = 300;
    let r = 245;
    let pulse = 1 + p.sin(ms * 0.18) * 0.08;

    p.noFill();
    p.stroke(160, 125, 85, 55);
    p.strokeWeight(3);
    p.arc(cx, cy, r * 2, r * 2, 205, 335);

    for (let i = 1; i <= 12; i++) {
      let angle = p.map(i, 1, 12, 205, 335);
      let x = cx + p.cos(angle) * r;
      let y = cy + p.sin(angle) * r;

      let d = p.dist(p.mouseX, p.mouseY, x, y);
      let isHover = d < 22;

      if (isHover) {
        hoveredHour = i;
        hoverMessage = "Hour rice grain: " + i;
      }

      p.push();
      p.translate(x, y);
      p.rotate(angle + 90);

      p.stroke(80, 62, 48);
      p.strokeWeight(isHover ? 3 : 1.5);

      if (i < h12) {
        p.fill(248, 214, 145);
        p.ellipse(0, 0, isHover ? 30 : 24, isHover ? 14 : 11);
      } else if (i === h12) {
        p.fill(255, 181, 75);
        p.ellipse(0, 0, 30 * pulse, 14 * pulse);

        p.noFill();
        p.stroke(255, 220, 150, 165);
        p.strokeWeight(3);
        p.ellipse(0, 0, 42 * pulse, 22 * pulse);
      } else {
        p.fill(255, 250, 234);
        p.ellipse(0, 0, isHover ? 30 : 24, isHover ? 14 : 11);
      }

      p.pop();
    }
  }

  /* ---------- Seconds: Steam ---------- */

  function drawSteam(s, ms) {
    let lift = p.map(s, 0, 59, 0, -24);
    let sway = p.sin(ms * 0.08) * 8;

    p.noFill();

    p.stroke(245, 213, 170, 120);
    p.strokeWeight(7);
    drawSteamPuff(250 + sway, 230 + lift, 1);
    drawSteamPuff(550 - sway, 230 + lift, -1);

    p.stroke(255, 250, 238, 170);
    p.strokeWeight(4);
    drawSteamPuff(250 + sway, 230 + lift, 1);
    drawSteamPuff(550 - sway, 230 + lift, -1);
  }

  function drawSteamPuff(x, y, dir) {
    p.arc(x, y, 34, 70, 115, 300);
    p.arc(x + dir * 30, y + 35, 44, 78, 115, 300);
    p.arc(x + dir * 60, y + 78, 32, 62, 115, 300);
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
    p.noStroke();
    p.fill(70, 50, 35, 28);
    p.ellipse(p.width / 2, 665, 640, 75);
  }

  function drawHandles() {
    p.noFill();

    p.stroke(63, 50, 40);
    p.strokeWeight(13);
    p.arc(185, 455, 105, 165, 85, 275);
    p.arc(615, 455, 105, 165, -95, 95);

    p.stroke(95, 78, 65);
    p.strokeWeight(6);
    p.arc(185, 455, 88, 145, 85, 275);
    p.arc(615, 455, 88, 145, -95, 95);

    p.stroke(252, 244, 228);
    p.strokeWeight(4);
    p.arc(185, 455, 68, 115, 85, 275);
    p.arc(615, 455, 68, 115, -95, 95);
  }

  function drawCookerBody() {
    p.stroke(55, 45, 38);
    p.strokeWeight(4);
    p.fill(222, 236, 239);
    p.rect(185, 335, 430, 315, 42);

    p.noStroke();
    p.fill(255, 255, 255, 75);
    p.rect(208, 365, 62, 250, 32);

    p.noFill();
    p.stroke(255, 255, 255, 100);
    p.strokeWeight(6);
    p.rect(199, 350, 402, 280, 34);
  }

  function drawLid() {
    p.stroke(55, 45, 38);
    p.strokeWeight(4);
    p.fill(219, 234, 237);
    p.arc(400, 335, 520, 120, 180, 360);
    p.line(140, 335, 660, 335);

    p.noStroke();
    p.fill(255, 255, 255, 100);
    p.arc(400, 330, 470, 84, 185, 350);

    p.fill(255, 252, 235);
    p.ellipse(250, 305, 32, 13);
    p.ellipse(330, 292, 30, 12);
    p.ellipse(410, 305, 32, 13);
    p.ellipse(490, 292, 30, 12);
    p.ellipse(570, 305, 32, 13);

    p.stroke(55, 45, 38);
    p.strokeWeight(4);
    p.fill(145, 115, 88);
    p.arc(400, 280, 105, 48, 180, 360);
    p.line(348, 280, 452, 280);
  }

  /* ---------- Time Display ---------- */

  function drawFrontTimePanel(h, m, ampm) {
    let x = p.width / 2;
    let y = 385;
    let w = 275;
    let hgt = 62;

    p.noStroke();
    p.fill(70, 50, 35, 24);
    p.rect(x - w / 2 + 3, y - hgt / 2 + 5, w, hgt, 22);

    p.fill(255, 248, 232, 248);
    p.stroke(55, 45, 38);
    p.strokeWeight(3);
    p.rect(x - w / 2, y - hgt / 2, w, hgt, 22);

    p.noStroke();
    p.fill(45, 34, 26);
    p.textStyle(p.BOLD);
    p.textSize(42);
    p.text(p.nf(h, 2) + ":" + p.nf(m, 2), x - 16, y + 2);

    p.textSize(16);
    p.text(ampm, x + 105, y + 5);

    if (demoMode) {
      p.textSize(10);
      p.fill(130, 80, 45);
      p.text("DEMO", x + 106, y - 17);
    }
  }

  /* ---------- Minute: Rice Height ---------- */

  function drawRiceWindow(progress, currentMinute, currentSecond, ms) {
    let x = 225;
    let y = 430;
    let w = 350;
    let h = 185;

    let isHover =
      p.mouseX > x &&
      p.mouseX < x + w &&
      p.mouseY > y &&
      p.mouseY < y + h;

    if (isHover) {
      hoverMessage = "Rice height = minute progress";
    }

    p.fill(248, 252, 248);
    p.stroke(isHover ? p.color(210, 145, 70) : p.color(80, 70, 60));
    p.strokeWeight(isHover ? 4 : 3);
    p.rect(x, y, w, h, 30);

    p.noStroke();
    p.fill(255, 249, 225);
    p.rect(x + 12, y + 14, w - 24, h - 28, 22);

    let riceMaxH = h - 36;
    let riceH = p.map(progress, 0, 1, 5, riceMaxH);
    let riceY = y + h - 16 - riceH;

    p.fill(255, 246, 210);
    p.rect(x + 14, riceY, w - 28, riceH, 0, 0, 20, 20);

    p.fill(255, 252, 232);
    p.beginShape();

    for (let i = x + 14; i <= x + w - 14; i += 10) {
      let unevenY = riceY + p.sin(i * 0.12 + ms * 0.03) * 2;
      p.vertex(i, unevenY);
    }

    p.vertex(x + w - 14, y + h - 16);
    p.vertex(x + 14, y + h - 16);
    p.endShape(p.CLOSE);

    drawRiceTexture(x, y, w, h, riceY, riceH);
    drawBubbles(x, y, w, h, progress, currentSecond, ms);
    drawPercentScale(x + w - 42, y + 33, h - 58);
    drawRiceLevelLabel(x, y, w, riceY, currentMinute, progress);

    p.noFill();
    p.stroke(255, 255, 255, 145);
    p.strokeWeight(5);
    p.arc(x + 58, y + 48, 90, 70, 190, 280);
  }

  function drawRiceTexture(x, y, w, h, riceY, riceH) {
    p.noStroke();

    let safeRiceH = p.max(10, riceH - 12);

    p.fill(255, 255, 240, 210);

    for (let i = 0; i < 95; i++) {
      let gx = x + 24 + (i * 23) % (w - 64);
      let gy = riceY + 10 + (i * 17) % safeRiceH;

      if (gy < y + h - 18) {
        p.push();
        p.translate(gx, gy);
        p.rotate((i * 37) % 25 - 12);
        p.ellipse(0, 0, 11, 5);
        p.pop();
      }
    }

    p.fill(235, 195, 115, 80);

    for (let i = 0; i < 35; i++) {
      let gx = x + 30 + (i * 31) % (w - 75);
      let gy = riceY + 14 + (i * 19) % safeRiceH;

      if (gy < y + h - 18) {
        p.ellipse(gx, gy + 2, 9, 2);
      }
    }
  }

  function drawBubbles(x, y, w, h, progress, currentSecond, ms) {
    p.noStroke();

    let riceTop = y + h - 16 - p.map(progress, 0, 1, 5, h - 36);

    for (let i = 0; i < 12; i++) {
      let bx = x + 42 + (i * 48) % (w - 95);
      let by = riceTop - 8 - ((ms * 0.035 + i * 31) % 100);
      let size = 4.5 + p.sin(ms * 0.16 + i * 25) * 2;

      if (by > y + 24 && by < y + h - 20) {
        p.fill(255, 255, 255, 125);
        p.circle(bx, by, size);

        if (currentSecond % 12 === i) {
          p.fill(255, 255, 235, 185);
          p.circle(bx + 3, by - 7, size + 4);
        }
      }
    }
  }

  function drawPercentScale(x, y, h) {
    p.stroke(105, 85, 66);
    p.strokeWeight(2);
    p.line(x, y, x, y + h);

    let labels = [100, 75, 50, 25];

    for (let pct of labels) {
      let yy = p.map(pct, 0, 100, y + h, y);
      p.line(x - 10, yy, x + 10, yy);
    }
  }

  function drawRiceLevelLabel(x, y, w, riceY, currentMinute, progress) {
    let labelX = x + 105;
    let labelY = p.constrain(riceY - 18, y + 22, y + 150);
    let labelText = currentMinute + " min · " + p.floor(progress * 100) + "%";

    p.noStroke();
    p.fill(70, 50, 35, 25);
    p.rect(labelX - 58 + 2, labelY - 15 + 3, 116, 30, 14);

    p.fill(255, 248, 232, 235);
    p.stroke(55, 45, 38);
    p.strokeWeight(2);
    p.rect(labelX - 58, labelY - 15, 116, 30, 14);

    p.noStroke();
    p.fill(55, 45, 38);
    p.textStyle(p.BOLD);
    p.textSize(13);
    p.text(labelText, labelX, labelY);
  }

  /* ---------- AM / PM Control Base ---------- */

  function drawControlBase(h24) {
    let x = 105;
    let y = 638;
    let w = 590;
    let baseH = 96;

    let isPM = h24 >= 12;

    let lowHover = p.dist(p.mouseX, p.mouseY, x + 105, y + 48) < 38;
    let highHover = p.dist(p.mouseX, p.mouseY, x + w - 95, y + 48) < 38;

    if (lowHover) {
      hoverMessage = "Click LOW to preview AM mode";
    }

    if (highHover) {
      hoverMessage = "Click HIGH to preview PM mode";
    }

    p.noStroke();
    p.fill(70, 50, 35, 28);
    p.ellipse(p.width / 2, y + baseH + 14, 540, 35);

    p.fill(244, 236, 222);
    p.stroke(55, 45, 38);
    p.strokeWeight(4);
    p.rect(x, y, w, baseH, 30);

    p.fill(255, 251, 244);
    p.stroke(65, 55, 48);
    p.strokeWeight(3);
    p.rect(x + 38, y + 20, w - 76, 54, 24);

    p.noStroke();
    p.textStyle(p.BOLD);
    p.textSize(15);

    p.fill(!isPM ? p.color(120, 75, 20) : p.color(95, 85, 75));
    p.text("LOW", x + 150, y + 48);

    p.fill(isPM ? p.color(150, 55, 35) : p.color(95, 85, 75));
    p.text("HIGH", x + w - 145, y + 48);

    if (!isPM) {
      p.fill(255, 205, 90);
      p.circle(x + 105, y + 48, lowHover ? 22 : 18);

      p.fill(255, 220, 130, 80);
      p.circle(x + 105, y + 48, lowHover ? 42 : 34);
    } else {
      p.fill(190, 180, 165);
      p.circle(x + 105, y + 48, lowHover ? 18 : 14);
    }

    if (isPM) {
      p.fill(255, 120, 70);
      p.circle(x + w - 95, y + 48, highHover ? 22 : 18);

      p.fill(255, 135, 90, 80);
      p.circle(x + w - 95, y + 48, highHover ? 42 : 34);
    } else {
      p.fill(190, 180, 165);
      p.circle(x + w - 95, y + 48, highHover ? 18 : 14);
    }

    drawDial(p.width / 2, y + 56, h24);
  }

  function drawDial(cx, cy, h24) {
    let isPM = h24 >= 12;

    p.stroke(95, 80, 68);
    p.strokeWeight(4);
    p.strokeCap(p.ROUND);

    let tickAngles = [-130, -90, -50];

    for (let i = 0; i < tickAngles.length; i++) {
      let a = tickAngles[i];

      let x1 = cx + p.cos(a) * 54;
      let y1 = cy + p.sin(a) * 54;
      let x2 = cx + p.cos(a) * 64;
      let y2 = cy + p.sin(a) * 64;

      p.line(x1, y1, x2, y2);
    }

    p.fill(220, 210, 194);
    p.stroke(55, 45, 38);
    p.strokeWeight(4);
    p.circle(cx, cy, 78);

    p.fill(255, 250, 240);
    p.stroke(120, 105, 90);
    p.strokeWeight(2);
    p.circle(cx, cy, 54);

    let angle = isPM ? -50 : -130;

    let px = cx + p.cos(angle) * 25;
    let py = cy + p.sin(angle) * 25;

    p.stroke(55, 45, 38);
    p.strokeWeight(5);
    p.line(cx, cy, px, py);

    p.noStroke();
    p.fill(55, 45, 38);
    p.circle(cx, cy, 7);

    p.strokeCap(p.SQUARE);
  }

  /* ---------- Interaction Layer ---------- */

  p.mousePressed = function () {
    let riceX = 225;
    let riceY = 430;
    let riceW = 350;
    let riceH = 185;

    if (
      p.mouseX > riceX &&
      p.mouseX < riceX + riceW &&
      p.mouseY > riceY &&
      p.mouseY < riceY + riceH
    ) {
      addSparkles(p.mouseX, p.mouseY);
    }

    let baseX = 105;
    let baseY = 638;
    let baseW = 590;

    if (p.dist(p.mouseX, p.mouseY, baseX + 105, baseY + 48) < 42) {
      demoMode = true;
      demoIsPM = false;
    }

    if (p.dist(p.mouseX, p.mouseY, baseX + baseW - 95, baseY + 48) < 42) {
      demoMode = true;
      demoIsPM = true;
    }
  };

  p.keyPressed = function () {
    if (p.key === "l" || p.key === "L") {
      showLabels = !showLabels;
    }

    if (p.key === "r" || p.key === "R") {
      demoMode = false;
    }
  };

  function addSparkles(x, y) {
    for (let i = 0; i < 12; i++) {
      sparkles.push({
        x: x,
        y: y,
        vx: p.random(-1.6, 1.6),
        vy: p.random(-2.3, -0.5),
        size: p.random(4, 9),
        life: 60,
      });
    }
  }

  function updateSparkles() {
    p.noStroke();

    for (let i = sparkles.length - 1; i >= 0; i--) {
      let particle = sparkles[i];

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.035;
      particle.life--;

      p.fill(255, 240, 180, p.map(particle.life, 0, 60, 0, 180));
      p.circle(particle.x, particle.y, particle.size);

      if (particle.life <= 0) {
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
    p.noStroke();
    p.fill(255, 248, 232, 230);
    p.rect(
      x - p.textWidth(label) / 2 - 12,
      y - 13,
      p.textWidth(label) + 24,
      26,
      13
    );

    p.fill(70, 55, 42);
    p.textStyle(p.BOLD);
    p.textSize(12);
    p.text(label, x, y);
  }

  function drawHoverMessage() {
    if (hoverMessage === "") return;

    let x = p.mouseX;
    let y = p.mouseY - 32;

    p.textSize(12);
    p.textStyle(p.BOLD);

    let tw = p.textWidth(hoverMessage);

    p.noStroke();
    p.fill(55, 42, 32, 220);
    p.rect(x - tw / 2 - 10, y - 13, tw + 20, 26, 13);

    p.fill(255, 248, 232);
    p.text(hoverMessage, x, y);
  }
};

new p5(sketch3Hwk4_2, "sketch-container-sk3");