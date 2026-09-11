/**
 * COSMIC STARFIELD SIMULATION WITH GRAVITATIONAL ATTRACTION & CLICK-AND-HOLD (2s) SUPERNOVA
 * - Organic cosmic drift & twinkling star physics
 * - Cursor gravitational pull (stars are attracted to mouse / touch pointer)
 * - Supernova detonates ONLY when user CLICKS AND HOLDS for 2 seconds on a star
 * - Mobile & dynamic screen resolution responsive
 */

class CosmicStarfield {
  getScreenDimensions() {
    const w = Math.max(
      window.innerWidth || 0,
      document.documentElement.clientWidth || 0,
      window.visualViewport ? Math.round(window.visualViewport.width) : 0
    );
    const h = Math.max(
      window.innerHeight || 0,
      document.documentElement.clientHeight || 0,
      window.visualViewport ? Math.round(window.visualViewport.height) : 0
    );
    return { width: w || 375, height: h || 667 };
  }

  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    const dims = this.getScreenDimensions();
    this.width = dims.width;
    this.height = dims.height;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    // Simulation configuration: Rich & dense cosmic starfield
    const area = this.width * this.height;
    this.starCount = Math.floor(Math.max(650, Math.min(1600, area / 1400)));
    this.stars = [];
    this.debrisParticles = [];
    this.shockwaves = [];
    
    // Pointer state (mouse / touch)
    this.pointer = {
      x: -1000,
      y: -1000,
      active: false,
      isDown: false,
      lastMoveTime: Date.now()
    };

    // Attraction settings
    this.gravityEnabled = true;
    this.attractRadius = Math.min(240, Math.min(this.width, this.height) * 0.35);
    this.attractStrength = 0.38;
    
    // Click-and-Hold Mechanics (2 SECONDS)
    this.hoverLockRadius = 32;
    this.holdRequiredSeconds = 2.0; // 2 seconds click-and-hold for supernova detonation
    this.hoveredStar = null;
    this.lockedStar = null;
    this.isHolding = false;
    this.holdStartTime = null;
    this.holdProgress = 0; // 0.0 to 1.0

    // Milky Way backdrop
    this.milkyWayImg = new Image();
    this.milkyWayLoaded = false;
    this.milkyWayImg.src = 'assets/images/milkyway.jpg';
    this.milkyWayImg.onload = () => {
      this.milkyWayLoaded = true;
    };

    // Global flash effect
    this.flashAlpha = 0;

    // Supernova stats
    this.supernovasTriggered = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.resize(), 100);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this.resize());
    }

    // Pointer events (handles both desktop mouse and mobile touch)
    window.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e));
    window.addEventListener('pointerleave', (e) => this.onPointerUp(e));

    // Initialize stars with stratified vertical distribution across the full screen
    this.createStars();

    // Start animation loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  resize() {
    const dims = this.getScreenDimensions();
    const oldHeight = this.height;
    this.width = dims.width;
    this.height = dims.height;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    this.attractRadius = Math.min(240, Math.min(this.width, this.height) * 0.35);

    const area = this.width * this.height;
    const targetCount = Math.floor(Math.max(650, Math.min(1600, area / 1400)));
    const colors = [
      '#FFFFFF', '#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC', '#FDE047', '#FEF08A'
    ];

    // If mobile viewport height expands, immediately seed stars into the bottom section
    if (this.height > oldHeight && oldHeight > 0) {
      const addedBottomCount = Math.floor(targetCount * ((this.height - oldHeight) / this.height) * 1.5);
      for (let i = 0; i < addedBottomCount; i++) {
        const starY = oldHeight + Math.random() * (this.height - oldHeight);
        this.stars.push(this.createStar(colors, Math.random() * this.width, starY));
      }
    }

    while (this.stars.length < targetCount) {
      this.stars.push(this.createStar(colors));
    }
    if (this.stars.length > targetCount + 150) {
      this.stars.length = targetCount;
    }

    // Keep stars within screen bounds
    for (const star of this.stars) {
      if (star.x > this.width) star.x = Math.random() * this.width;
      if (star.y > this.height) star.y = Math.random() * this.height;
    }
  }

  createStars() {
    this.stars = [];
    const colors = [
      '#FFFFFF', '#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC', '#FDE047', '#FEF08A'
    ];

    // Stratified vertical distribution guarantees stars completely populate top, middle, and bottom
    for (let i = 0; i < this.starCount; i++) {
      const yFraction = (i + Math.random()) / this.starCount;
      const y = Math.max(4, Math.min(this.height - 4, yFraction * this.height));
      const x = Math.random() * this.width;
      this.stars.push(this.createStar(colors, x, y));
    }
  }

  createStar(colors, x, y) {
    const depth = Math.random() * 0.85 + 0.15; // 0.15 to 1.0
    // Multi-tier star distribution: 65% distant micro-stars, 27% midground stars, 8% luminous hero stars
    const typeRoll = Math.random();
    let baseRadius;
    if (typeRoll < 0.65) {
      baseRadius = (Math.random() * 0.8 + 0.35) * depth;
    } else if (typeRoll < 0.92) {
      baseRadius = (Math.random() * 1.2 + 0.75) * depth;
    } else {
      baseRadius = (Math.random() * 1.8 + 1.6) * depth;
    }

    return {
      x: x !== undefined ? x : Math.random() * this.width,
      y: y !== undefined ? y : Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.22 * depth,
      vy: (Math.random() - 0.5) * 0.22 * depth,
      baseRadius: baseRadius,
      radius: baseRadius,
      depth: depth,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.75 + 0.25,
      baseAlpha: Math.random() * 0.75 + 0.25,
      twinkleSpeed: Math.random() * 0.035 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
      isExploding: false,
      jitterX: 0,
      jitterY: 0
    };
  }

  onPointerDown(e) {
    // If user clicked inside planet stage, don't lock onto background stars
    const planetStage = document.getElementById('planet-stage');
    if (planetStage && planetStage.contains(e.target)) {
      return;
    }

    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    this.pointer.active = true;
    this.pointer.isDown = true;

    // Check if clicked directly on / near a star to initiate 2-second hold
    const closest = this.findNearestStar(e.clientX, e.clientY, this.hoverLockRadius);
    if (closest) {
      this.lockedStar = closest;
      this.isHolding = true;
      this.holdStartTime = performance.now();
      this.holdProgress = 0;
    }
  }

  onPointerMove(e) {
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    this.pointer.active = true;
    this.pointer.lastMoveTime = Date.now();

    // Track hovered star for visual reticle hint
    if (!this.isHolding) {
      this.hoveredStar = this.findNearestStar(e.clientX, e.clientY, this.hoverLockRadius);
    }
  }

  onPointerUp(e) {
    this.pointer.isDown = false;
    this.cancelHold();
  }

  cancelHold() {
    if (this.lockedStar) {
      this.lockedStar.radius = this.lockedStar.baseRadius;
      this.lockedStar.jitterX = 0;
      this.lockedStar.jitterY = 0;
      this.lockedStar = null;
    }
    this.isHolding = false;
    this.holdStartTime = null;
    this.holdProgress = 0;
  }

  findNearestStar(px, py, maxRadius) {
    let closestStar = null;
    let closestDistSq = maxRadius * maxRadius;

    for (const star of this.stars) {
      if (star.isExploding) continue;
      const dx = star.x - px;
      const dy = star.y - py;
      const distSq = dx * dx + dy * dy;
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closestStar = star;
      }
    }
    return closestStar;
  }

  update(dt) {
    // Fade screen flash
    if (this.flashAlpha > 0.01) {
      this.flashAlpha *= 0.88;
    } else {
      this.flashAlpha = 0;
    }

    // Handle Active Click-and-Hold Countdown (2 SECONDS)
    if (this.isHolding && this.lockedStar && this.pointer.isDown) {
      // Verify pointer has not drifted too far away from the held star
      const dx = this.lockedStar.x - this.pointer.x;
      const dy = this.lockedStar.y - this.pointer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 50) {
        // User dragged away: cancel hold
        this.cancelHold();
      } else {
        const elapsed = (performance.now() - this.holdStartTime) / 1000;
        this.holdProgress = Math.min(elapsed / this.holdRequiredSeconds, 1.0);

        // Visual charging effects while holding
        const chargeFactor = this.holdProgress;
        this.lockedStar.radius = this.lockedStar.baseRadius * (1 + chargeFactor * 4.0);
        this.lockedStar.jitterX = (Math.random() - 0.5) * chargeFactor * 6;
        this.lockedStar.jitterY = (Math.random() - 0.5) * chargeFactor * 6;

        // Emit pre-supernova corona sparks as it charges under hold
        if (Math.random() < chargeFactor * 0.95) {
          this.emitPreSparks(this.lockedStar.x, this.lockedStar.y, chargeFactor);
        }

        // Detonate when held for full 2 seconds!
        if (this.holdProgress >= 1.0) {
          const detonatedStar = this.lockedStar;
          this.cancelHold();
          this.triggerSupernova(detonatedStar);
        }
      }
    }

    // Update stars physics
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      if (star.isExploding) continue;

      // Cosmic Twinkle
      star.twinklePhase += star.twinkleSpeed;
      star.alpha = star.baseAlpha + Math.sin(star.twinklePhase) * 0.25;

      // Natural cosmic drift
      star.x += star.vx;
      star.y += star.vy;

      // Gravitational attraction towards pointer
      if (this.gravityEnabled && this.pointer.active && (!this.isHolding || star !== this.lockedStar)) {
        const dx = this.pointer.x - star.x;
        const dy = this.pointer.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5 && dist < this.attractRadius) {
          const pull = (1 - dist / this.attractRadius) * this.attractStrength * star.depth;
          const forceX = (dx / dist) * pull;
          const forceY = (dy / dist) * pull;

          star.vx = (star.vx + forceX) * 0.95;
          star.vy = (star.vy + forceY) * 0.95;
        } else {
          star.vx *= 0.985;
          star.vy *= 0.985;
        }
      } else {
        star.vx *= 0.99;
        star.vy *= 0.99;
      }

      // Screen boundary wrapping
      if (star.x < -20) star.x = this.width + 20;
      if (star.x > this.width + 20) star.x = -20;
      if (star.y < -20) star.y = this.height + 20;
      if (star.y > this.height + 20) star.y = -20;
    }

    // Update Debris Particles (Supernova sparks)
    for (let i = this.debrisParticles.length - 1; i >= 0; i--) {
      const p = this.debrisParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= dt * p.decayRate;
      p.currentRadius = p.radius * Math.max(p.life, 0.1);

      if (p.life <= 0) {
        this.debrisParticles.splice(i, 1);
      }
    }

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.expansionSpeed * dt * 60;
      sw.alpha -= sw.decayRate * dt * 60;
      if (sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  emitPreSparks(x, y, factor) {
    const count = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.2 + 0.8;
      this.debrisParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 1.5 + 0.8,
        life: 0.5,
        decayRate: 2.0,
        color: factor > 0.6 ? '#FFD700' : '#00E5FF'
      });
    }
  }

  triggerSupernova(star) {
    this.supernovasTriggered++;
    this.flashAlpha = 0.5;

    const originX = star.x;
    const originY = star.y;

    // 1. Dual Shockwaves
    this.shockwaves.push({
      x: originX,
      y: originY,
      radius: 10,
      expansionSpeed: 8.5,
      alpha: 1.0,
      decayRate: 0.026,
      color: '#FFFFFF'
    });

    this.shockwaves.push({
      x: originX,
      y: originY,
      radius: 6,
      expansionSpeed: 5.5,
      alpha: 0.9,
      decayRate: 0.02,
      color: '#FFD700'
    });

    // 2. Blast wave: Push neighboring stars away
    for (const other of this.stars) {
      if (other === star) continue;
      const dx = other.x - originX;
      const dy = other.y - originY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 190 && dist > 1) {
        const force = (1 - dist / 190) * 9.0;
        other.vx += (dx / dist) * force;
        other.vy += (dy / dist) * force;
      }
    }

    // 3. Supernova Debris Particles (60 glowing sparks)
    const particleColors = [
      '#FFFFFF', '#00E5FF', '#38BDF8', '#FFD700', '#FFAA00', '#FF3D71'
    ];

    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8.5 + 2.5;
      this.debrisParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3.0 + 1.2,
        life: 1.0,
        decayRate: Math.random() * 0.45 + 0.35,
        color: particleColors[Math.floor(Math.random() * particleColors.length)]
      });
    }

    // Vaporize star
    star.isExploding = true;
    star.alpha = 0;
    star.x = -9999;
    star.y = -9999;

    // Toast alert
    this.notifySupernova();

    // Respawn after 3.5 seconds
    setTimeout(() => {
      star.x = Math.random() * this.width;
      star.y = Math.random() * this.height;
      star.vx = (Math.random() - 0.5) * 0.2;
      star.vy = (Math.random() - 0.5) * 0.2;
      star.isExploding = false;
      star.alpha = 0.1;
      star.baseRadius = (Math.random() * 1.6 + 0.6) * star.depth;
      star.radius = star.baseRadius;
    }, 3500);
  }

  notifySupernova() {
    const alertEl = document.getElementById('supernova-alert');
    if (alertEl) {
      alertEl.classList.add('active');
      setTimeout(() => alertEl.classList.remove('active'), 2200);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Milky Way galaxy image backdrop with subtle parallax
    if (this.milkyWayLoaded) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.22;
      const offsetX = (this.pointer.x - this.width / 2) * 0.015;
      const offsetY = (this.pointer.y - this.height / 2) * 0.015;
      this.ctx.drawImage(
        this.milkyWayImg,
        -50 + offsetX,
        -50 + offsetY,
        this.width + 100,
        this.height + 100
      );
      this.ctx.restore();
    }

    // 2. Draw shockwaves
    for (const sw of this.shockwaves) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = sw.color;
      this.ctx.lineWidth = 2.5;
      this.ctx.globalAlpha = sw.alpha;
      this.ctx.shadowBlur = 16;
      this.ctx.shadowColor = sw.color;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 3. Draw Debris Particles
    for (const p of this.debrisParticles) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.currentRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.restore();
    }

    // 4. Draw Stars (Fast batch rendering for high density starfield)
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = 'transparent';

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      if (star.isExploding) continue;

      const posX = star.x + star.jitterX;
      const posY = star.y + star.jitterY;

      this.ctx.beginPath();
      this.ctx.arc(posX, posY, star.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = Math.max(star.alpha, 0.1);

      if (star.depth > 0.82) {
        this.ctx.shadowBlur = star.radius * 3.5;
        this.ctx.shadowColor = star.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      } else {
        this.ctx.fill();
      }
    }
    this.ctx.globalAlpha = 1.0;

    // 5. Draw Reticle: Either Active Click-and-Hold (2s) or Hover Hint
    if (this.isHolding && this.lockedStar) {
      this.drawHoldReticle(this.lockedStar);
    } else if (this.hoveredStar && !this.pointer.isDown) {
      this.drawHoverHint(this.hoveredStar);
    }

    // 6. Draw Global Screen Flash
    if (this.flashAlpha > 0.01) {
      this.ctx.save();
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.globalAlpha = this.flashAlpha;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }
  }

  drawHoverHint(star) {
    const x = star.x;
    const y = star.y;
    const r = 22;

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    this.ctx.lineWidth = 1.2;
    this.ctx.setLineDash([3, 3]);
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
    this.ctx.font = '500 10px Orbitron, sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('CLICK & HOLD', x + r + 6, y + 3);
    this.ctx.restore();
  }

  drawHoldReticle(star) {
    const x = star.x + star.jitterX;
    const y = star.y + star.jitterY;
    const progress = this.holdProgress;
    const remainingSec = Math.max(0, (this.holdRequiredSeconds * (1 - progress))).toFixed(1);
    const reticleRadius = 24 + (1 - progress) * 8;

    this.ctx.save();

    // Corner brackets
    const bracketSize = 7;
    this.ctx.strokeStyle = progress > 0.65 ? '#FF3D71' : '#00E5FF';
    this.ctx.lineWidth = 2.0;
    this.ctx.shadowBlur = 14;
    this.ctx.shadowColor = this.ctx.strokeStyle;

    // Top-Left
    this.ctx.beginPath();
    this.ctx.moveTo(x - reticleRadius, y - reticleRadius + bracketSize);
    this.ctx.lineTo(x - reticleRadius, y - reticleRadius);
    this.ctx.lineTo(x - reticleRadius + bracketSize, y - reticleRadius);
    this.ctx.stroke();

    // Top-Right
    this.ctx.beginPath();
    this.ctx.moveTo(x + reticleRadius - bracketSize, y - reticleRadius);
    this.ctx.lineTo(x + reticleRadius, y - reticleRadius);
    this.ctx.lineTo(x + reticleRadius, y - reticleRadius + bracketSize);
    this.ctx.stroke();

    // Bottom-Left
    this.ctx.beginPath();
    this.ctx.moveTo(x - reticleRadius, y + reticleRadius - bracketSize);
    this.ctx.lineTo(x - reticleRadius, y + reticleRadius);
    this.ctx.lineTo(x - reticleRadius + bracketSize, y + reticleRadius);
    this.ctx.stroke();

    // Bottom-Right
    this.ctx.beginPath();
    this.ctx.moveTo(x + reticleRadius - bracketSize, y + reticleRadius);
    this.ctx.lineTo(x + reticleRadius, y + reticleRadius);
    this.ctx.lineTo(x + reticleRadius, y + reticleRadius - bracketSize);
    this.ctx.stroke();

    // Circular Countdown Progress Bar (2-Second Hold Progress)
    this.ctx.beginPath();
    this.ctx.arc(x, y, reticleRadius + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    this.ctx.strokeStyle = progress > 0.65 ? '#FFD700' : '#00E5FF';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    // Countdown Text HUD
    this.ctx.font = '600 11px Orbitron, sans-serif';
    this.ctx.fillStyle = progress > 0.65 ? '#FF3D71' : '#00E5FF';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`HOLD: ${remainingSec}s`, x + reticleRadius + 10, y + 4);

    this.ctx.restore();
  }

  loop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // Detect mobile viewport changes (address bar expand/collapse)
    const dims = this.getScreenDimensions();
    if (Math.abs(dims.height - this.height) > 8 || Math.abs(dims.width - this.width) > 8) {
      this.resize();
    }

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }
}

window.CosmicStarfield = CosmicStarfield;
