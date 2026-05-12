const sketch2Hwk4_1 = (p) => {
  let totalTime = 10 * 60;
  let timeLeft = totalTime;
  let running = false;
  let finished = false;

  let startMillis = 0;
  let pausedAt = totalTime;

  let shellOpen = 0;
  let chickPop = 0;
  let burstParticles = [];

  let startBtn;
  let minusBtn;
  let plusBtn;
  let resetBtn;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.angleMode(p.DEGREES);
    p.textAlign(p.CENTER, p.CENTER);

    startBtn = { x: 300, y: 668, w: 200, h: 48 };
    minusBtn = { x: 205, y: 608, w: 110, h: 40 };
    plusBtn = { x: 485, y: 608, w: 110, h: 40 };
    resetBtn = { x: 335, y: 728, w: 130, h: 34 };
  };

  p.draw = function () {
    p.background(246, 241, 232);

    updateTimer();

    drawBackgroundShapes();
    drawTopBar();
    drawArcTimer();
    drawEggStage();
    drawTimerControls();
    drawMainButton();
    drawResetButton();
    updateAndDrawParticles();
  };

  function updateTimer() {
    if (running && !finished) {
      let elapsed = (p.millis() - startMillis) / 1000;
      timeLeft = p.max(0, pausedAt - elapsed);

      if (timeLeft <= 0) {
        timeLeft = 0;
        running = false;
        finished = true;
        createBurst();
      }
    }

    if (finished) {
      shellOpen = p.min(shellOpen + 0.055, 1);
      chickPop = p.min(chickPop + 0.05, 1);
    } else {
      shellOpen = 0;
      chickPop = 0;
    }
  }

  function startPauseTimer() {
    if (finished) {
      resetTimer();
      return;
    }

    if (!running) {
      running = true;
      startMillis = p.millis();
      pausedAt = timeLeft;
    } else {
      running = false;
      pausedAt = timeLeft;
    }
  }

  function resetTimer() {
    timeLeft = totalTime;
    pausedAt = totalTime;
    running = false;
    finished = false;
    shellOpen = 0;
    chickPop = 0;
    burstParticles = [];
  }

  function setTimerMinutes(mins) {
    if (running) return;

    mins = p.constrain(mins, 1, 60);
    totalTime = mins * 60;
    timeLeft = totalTime;
    pausedAt = totalTime;
    finished = false;
    burstParticles = [];
  }

  p.mousePressed = function () {
    if (inside(startBtn)) {
      startPauseTimer();
    }

    if (inside(resetBtn)) {
      resetTimer();
    }

    if (inside(minusBtn)) {
      setTimerMinutes(p.round(totalTime / 60) - 1);
    }

    if (inside(plusBtn)) {
      setTimerMinutes(p.round(totalTime / 60) + 1);
    }
  };

  p.keyPressed = function () {
    if (p.key === " ") {
      startPauseTimer();
    }

    if (p.key === "r" || p.key === "R") {
      resetTimer();
    }

    if (p.keyCode === p.LEFT_ARROW) {
      setTimerMinutes(p.round(totalTime / 60) - 1);
    }

    if (p.keyCode === p.RIGHT_ARROW) {
      setTimerMinutes(p.round(totalTime / 60) + 1);
    }
  };

  function inside(b) {
    return (
      p.mouseX > b.x &&
      p.mouseX < b.x + b.w &&
      p.mouseY > b.y &&
      p.mouseY < b.y + b.h
    );
  }

  function drawBackgroundShapes() {
    p.noStroke();

    p.fill(243, 223, 173, 52);
    p.circle(115, 112, 150);

    p.fill(213, 223, 217, 58);
    p.circle(688, 128, 150);

    p.fill(225, 233, 210, 42);
    p.circle(128, 682, 165);

    p.fill(235, 220, 223, 42);
    p.circle(672, 684, 175);

    p.fill(120, 100, 80, 12);
    p.ellipse(p.width / 2, 590, 360, 40);
  }

  function drawTopBar() {
    drawTitleCard();
    drawRealTimeCard();
  }

  function drawTitleCard() {
    p.noStroke();
    p.fill(255, 250, 241, 238);
    p.rect(52, 44, 205, 60, 21);

    p.fill(244, 173, 73);
    p.circle(82, 74, 28);

    p.fill(58, 45, 35);
    p.textStyle(p.BOLD);
    p.textSize(15);
    p.text("HATCH TIMER", 168, 66);

    p.fill(130, 105, 80);
    p.textStyle(p.NORMAL);
    p.textSize(11);
    p.text("custom egg countdown", 168, 85);
  }

  function drawRealTimeCard() {
    let h24 = p.hour();
    let m = p.minute();
    let s = p.second();

    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;

    let ampm = h24 >= 12 ? "PM" : "AM";
    let realTime =
      p.nf(h12, 2) + ":" + p.nf(m, 2) + ":" + p.nf(s, 2) + " " + ampm;

    p.noStroke();
    p.fill(255, 250, 241, 238);
    p.rect(530, 44, 220, 60, 21);

    p.fill(130, 105, 80);
    p.textStyle(p.NORMAL);
    p.textSize(11);
    p.text("REAL TIME", 640, 61);

    p.fill(58, 45, 35);
    p.textStyle(p.BOLD);
    p.textSize(21);
    p.text(realTime, 640, 82);
  }

  function drawArcTimer() {
    let cx = p.width / 2;
    let cy = 420;
    let r = 255;

    let startA = 205;
    let endA = 335;

    let remainRatio = totalTime === 0 ? 0 : timeLeft / totalTime;
    let progress = 1 - remainRatio;

    let pointerA = p.map(remainRatio, 1, 0, startA, endA);
    let accent = p.lerpColor(
      p.color(241, 170, 67),
      p.color(231, 105, 75),
      progress
    );

    p.noFill();
    p.stroke(218, 207, 184, 115);
    p.strokeWeight(8);
    p.arc(cx, cy, r * 2, r * 2, startA, endA);

    drawTicks(cx, cy, r, startA, endA);

    p.stroke(accent);
    p.strokeWeight(9);
    p.arc(cx, cy, r * 2, r * 2, startA, pointerA);

    drawArcLabels(cx, cy, r, startA, endA);

    let px = cx + p.cos(pointerA) * r;
    let py = cy + p.sin(pointerA) * r;

    p.noStroke();
    p.fill(69, 54, 43);
    p.circle(px, py, 18);

    p.fill(accent);
    p.circle(px, py, 10);
  }

  function drawTicks(cx, cy, r, startA, endA) {
    for (let i = 0; i <= 10; i++) {
      let a = p.map(i, 0, 10, startA, endA);

      let x1 = cx + p.cos(a) * (r - 11);
      let y1 = cy + p.sin(a) * (r - 11);
      let x2 = cx + p.cos(a) * (r + 11);
      let y2 = cy + p.sin(a) * (r + 11);

      p.stroke(82, 68, 55, i === 0 || i === 5 || i === 10 ? 230 : 95);
      p.strokeWeight(i === 0 || i === 5 || i === 10 ? 4 : 2);
      p.line(x1, y1, x2, y2);
    }
  }

  function drawArcLabels(cx, cy, r, startA, endA) {
    let totalMins = p.round(totalTime / 60);
    let halfMins = p.max(1, p.round(totalMins / 2));

    drawArcLabel(cx, cy, r, startA, totalMins + " min");
    drawArcLabel(cx, cy, r, (startA + endA) / 2, halfMins);
    drawArcLabel(cx, cy, r, endA, "0");
  }

  function drawArcLabel(cx, cy, r, angle, label) {
    let lx = cx + p.cos(angle) * (r + 46);
    let ly = cy + p.sin(angle) * (r + 46);

    p.noStroke();
    p.fill(82, 68, 55);
    p.textStyle(p.BOLD);
    p.textSize(18);
    p.text(label, lx, ly);
  }

  function drawEggStage() {
    let cx = p.width / 2;
    let cy = 346;

    let progress = 1 - timeLeft / totalTime;
    let shake = 0;

    if (!finished && progress > 0.82) {
      shake = p.sin(p.frameCount * 20) * p.map(progress, 0.82, 1, 1.5, 7);
    }

    p.push();
    p.translate(cx + shake, cy);

    if (finished) {
      drawHatchedEgg();
    } else {
      drawWholeEgg(progress);
    }

    p.pop();
  }

  function drawWholeEgg(progress) {
    let floatY = p.sin(p.frameCount * 3) * 1.6;

    p.push();
    p.translate(0, floatY);

    p.stroke(64, 52, 43);
    p.strokeWeight(5);
    p.fill(255, 248, 226);
    p.ellipse(0, 0, 150, 205);

    p.noStroke();
    p.fill(255, 255, 255, 95);
    p.ellipse(-30, -28, 28, 75);

    drawTinyBell(0, -76);

    if (progress > 0.6) {
      drawMainCrack(progress);
    }

    if (progress > 0.86) {
      drawSmallCracks(progress);
    }

    p.noStroke();
    p.fill(47, 38, 31);
    p.textStyle(p.BOLD);
    p.textSize(34);
    p.text(formatCountdown(timeLeft), 0, 20);

    if (!running && !finished) {
      p.fill(130, 105, 80);
      p.textSize(12);
      p.text("tap start", 0, 58);
    }

    p.pop();
  }

  function drawMainCrack(progress) {
    let alpha = p.map(progress, 0.6, 1, 50, 255);

    p.stroke(64, 52, 43, alpha);
    p.strokeWeight(4);
    p.noFill();

    p.beginShape();
    p.vertex(-55, -34);
    p.vertex(-36, -22);
    p.vertex(-18, -39);
    p.vertex(0, -18);
    p.vertex(19, -34);
    p.vertex(35, -14);
    p.vertex(55, -28);
    p.endShape();
  }

  function drawSmallCracks(progress) {
    let alpha = p.map(progress, 0.86, 1, 80, 255);

    p.stroke(64, 52, 43, alpha);
    p.strokeWeight(3);
    p.line(-18, -20, -28, 8);
    p.line(20, -18, 31, 12);
    p.line(42, -28, 52, -5);
  }

  function drawTinyBell(x, y) {
    p.push();
    p.translate(x, y);

    p.stroke(64, 52, 43);
    p.strokeWeight(3);
    p.fill(255, 205, 78);

    p.arc(0, 0, 32, 30, 180, 360);
    p.line(-16, 0, 16, 0);

    p.fill(64, 52, 43);
    p.circle(0, 4, 5);

    p.noFill();
    p.strokeWeight(2);
    p.arc(-22, -7, 16, 20, 110, 250);
    p.arc(22, -7, 16, 20, -70, 70);

    p.pop();
  }

  function drawHatchedEgg() {
    let openT = easeOutBack(shellOpen);
    let popT = easeOutBack(chickPop);

    p.noStroke();
    p.fill(255, 213, 90, 42);
    p.ellipse(0, -28, 180, 155);

    drawBottomShell();

    p.push();
    p.translate(-45 - 34 * openT, -58 - 14 * openT);
    p.rotate(-30 * openT);
    drawShellTop();
    p.pop();

    p.push();
    p.translate(45 + 34 * openT, -58 - 14 * openT);
    p.rotate(30 * openT);
    drawShellTop();
    p.pop();

    let chickY = p.lerp(38, -38, popT);
    drawChick(0, chickY);
  }

  function drawBottomShell() {
    p.stroke(64, 52, 43);
    p.strokeWeight(5);
    p.fill(255, 248, 226);

    p.beginShape();
    p.vertex(-74, 10);
    p.vertex(-58, -10);
    p.vertex(-41, 9);
    p.vertex(-24, -11);
    p.vertex(-5, 8);
    p.vertex(12, -12);
    p.vertex(29, 8);
    p.vertex(46, -10);
    p.vertex(60, 8);
    p.vertex(74, -12);
    p.bezierVertex(74, 82, 45, 113, 0, 116);
    p.bezierVertex(-45, 113, -74, 82, -74, 10);
    p.endShape(p.CLOSE);
  }

  function drawShellTop() {
    p.stroke(64, 52, 43);
    p.strokeWeight(5);
    p.fill(255, 248, 226);

    p.beginShape();
    p.vertex(-48, 24);
    p.vertex(-33, 6);
    p.vertex(-18, 24);
    p.vertex(0, 5);
    p.vertex(18, 24);
    p.vertex(34, 6);
    p.vertex(48, 24);
    p.bezierVertex(34, -38, -34, -38, -48, 24);
    p.endShape(p.CLOSE);

    p.noStroke();
    p.fill(255, 255, 255, 90);
    p.ellipse(-16, -5, 18, 30);
  }

  function drawChick(x, y) {
    let flap = p.sin(p.frameCount * 14) * 6;
    let blink = p.frameCount % 120 < 8;

    p.push();
    p.translate(x, y);

    p.noStroke();

    p.fill(255, 214, 78);
    p.ellipse(0, 20, 96, 88);

    p.fill(255, 220, 92);
    p.ellipse(0, -22, 78, 72);

    p.fill(242, 186, 53);
    p.ellipse(-42, 22, 28 + flap, 46);
    p.ellipse(42, 22, 28 + flap, 46);

    p.fill(255, 152, 122, 115);
    p.circle(-27, -10, 13);
    p.circle(27, -10, 13);

    p.stroke(47, 38, 31);
    p.strokeWeight(4);

    if (blink) {
      p.line(-14, -24, -6, -24);
      p.line(6, -24, 14, -24);
    } else {
      p.noStroke();
      p.fill(47, 38, 31);
      p.circle(-10, -24, 8);
      p.circle(10, -24, 8);
    }

    p.noStroke();
    p.fill(239, 123, 56);
    p.triangle(-7, -10, 7, -10, 0, 3);

    p.stroke(47, 38, 31);
    p.strokeWeight(4);
    p.noFill();
    p.arc(-7, -58, 16, 22, 210, 25);
    p.arc(8, -60, 16, 22, 160, 330);

    p.stroke(181, 103, 48);
    p.strokeWeight(4);
    p.line(-14, 62, -25, 75);
    p.line(-14, 62, -6, 75);
    p.line(14, 62, 25, 75);
    p.line(14, 62, 6, 75);

    p.noStroke();
    p.fill(47, 38, 31);
    p.textStyle(p.BOLD);
    p.textSize(16);
    p.text("DONE", 0, 98);

    p.pop();
  }

  function createBurst() {
    burstParticles = [];

    for (let i = 0; i < 38; i++) {
      burstParticles.push({
        x: p.width / 2,
        y: 330,
        vx: p.random(-2.6, 2.6),
        vy: p.random(-4, -1),
        size: p.random(3, 7),
        life: p.random(50, 90),
      });
    }
  }

  function updateAndDrawParticles() {
    p.noStroke();

    for (let i = burstParticles.length - 1; i >= 0; i--) {
      let particle = burstParticles[i];

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.06;
      particle.life--;

      p.fill(247, 183, 70, p.map(particle.life, 0, 90, 0, 180));
      p.circle(particle.x, particle.y, particle.size);

      if (particle.life <= 0) {
        burstParticles.splice(i, 1);
      }
    }
  }

  function drawTimerControls() {
    drawMiniButton(minusBtn, "- 1 min", !running);
    drawMiniButton(plusBtn, "+ 1 min", !running);

    p.noStroke();
    p.fill(255, 250, 241, 238);
    p.rect(p.width / 2 - 86, 608, 172, 42, 18);

    p.fill(130, 105, 80);
    p.textStyle(p.NORMAL);
    p.textSize(11);
    p.text("CUSTOM TIMER", p.width / 2, 621);

    p.fill(58, 45, 35);
    p.textStyle(p.BOLD);
    p.textSize(21);
    p.text(p.round(totalTime / 60) + " min", p.width / 2, 641);
  }

  function drawMiniButton(b, label, active) {
    let hover = inside(b);

    p.noStroke();

    if (!active) {
      p.fill(220, 210, 195, 150);
    } else if (hover) {
      p.fill(244, 173, 73);
    } else {
      p.fill(255, 250, 241, 238);
    }

    p.rect(b.x, b.y, b.w, b.h, 18);

    p.fill(active ? p.color(58, 45, 35) : p.color(130, 120, 110));
    p.textStyle(p.BOLD);
    p.textSize(14);
    p.text(label, b.x + b.w / 2, b.y + b.h / 2 + 1);
  }

  function drawMainButton() {
    let label;

    if (finished) {
      label = "HATCH AGAIN";
    } else if (running) {
      label = "PAUSE";
    } else {
      label = "START";
    }

    let hover = inside(startBtn);

    p.noStroke();
    p.fill(hover ? p.color(244, 173, 73) : p.color(238, 164, 63));
    p.rect(startBtn.x, startBtn.y, startBtn.w, startBtn.h, 24);

    p.fill(255, 247, 238, 70);
    p.rect(startBtn.x + 12, startBtn.y + 8, startBtn.w - 24, 10, 8);

    p.fill(58, 45, 35);
    p.textStyle(p.BOLD);
    p.textSize(18);
    p.text(label, startBtn.x + startBtn.w / 2, startBtn.y + startBtn.h / 2 + 1);
  }

  function drawResetButton() {
    let hover = inside(resetBtn);

    p.noStroke();
    p.fill(hover ? p.color(255, 250, 241, 255) : p.color(255, 250, 241, 215));
    p.rect(resetBtn.x, resetBtn.y, resetBtn.w, resetBtn.h, 17);

    p.fill(110, 88, 68);
    p.textStyle(p.BOLD);
    p.textSize(13);
    p.text("RESET", resetBtn.x + resetBtn.w / 2, resetBtn.y + resetBtn.h / 2 + 1);
  }

  function formatCountdown(t) {
    let totalSeconds = p.ceil(t);
    let mins = p.floor(totalSeconds / 60);
    let secs = totalSeconds % 60;

    return p.nf(mins, 1) + ":" + p.nf(secs, 2);
  }

  function easeOutBack(x) {
    let c1 = 1.70158;
    let c3 = c1 + 1;
    return 1 + c3 * p.pow(x - 1, 3) + c1 * p.pow(x - 1, 2);
  }
};

new p5(sketch2Hwk4_1, "sketch-container-sk2");