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

    // Black Hole Singularity Event State (Triggers on 2nd Supernova)
    this.blackHoleActive = false;
    this.blackHole = null;

    // Distant Galaxy Background Planets
    this.distantPlanets = [];
    this.hoveredPlanet = null;
    this.planetWarpPulses = [];

    window.cosmicStarfield = this;

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

    // Initialize distant background galaxy planets
    this.createDistantPlanets();

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

    // Keep distant background planets within screen bounds
    if (this.distantPlanets && this.distantPlanets.length > 0) {
      for (const p of this.distantPlanets) {
        p.anchorX = Math.max(45, Math.min(this.width - 45, p.anchorX || p.x));
        p.anchorY = Math.max(45, Math.min(this.height - 45, p.anchorY || p.y));
        p.x = Math.max(45, Math.min(this.width - 45, p.x));
        p.y = Math.max(45, Math.min(this.height - 45, p.y));
        if (!p.isMoving) {
          p.targetX = p.anchorX;
          p.targetY = p.anchorY;
        }
      }
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
    if (this.blackHoleActive) return;

    // If user clicked inside planet stage, query form, or active modal, don't lock onto background stars
    const planetStage = document.getElementById('planet-stage');
    const queryForm = document.getElementById('query-form');
    const activeModal = document.querySelector('.cosmic-modal.active');
    if ((planetStage && planetStage.contains(e.target)) ||
        (queryForm && queryForm.contains(e.target)) ||
        (activeModal && activeModal.contains(e.target))) {
      return;
    }

    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    this.pointer.active = true;
    this.pointer.isDown = true;

    // 1. Check if clicked directly on a distant background galaxy planet
    const clickedPlanet = this.findClickedDistantPlanet(e.clientX, e.clientY);
    if (clickedPlanet) {
      this.moveDistantPlanet(clickedPlanet);
      return;
    }

    // 2. Check if clicked directly on / near a star to initiate 2-second hold (up to 55px radius)
    let closest = this.findNearestStar(e.clientX, e.clientY, this.hoverLockRadius);
    if (!closest) {
      closest = this.findNearestStar(e.clientX, e.clientY, 55);
    }
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

    // Check hover over distant background planets
    const prevHover = this.hoveredPlanet;
    this.hoveredPlanet = this.findClickedDistantPlanet(e.clientX, e.clientY);
    if (this.hoveredPlanet) {
      this.canvas.style.cursor = 'pointer';
    } else if (prevHover && !this.hoveredPlanet) {
      this.canvas.style.cursor = 'default';
    }

    // Track hovered star for visual reticle hint (only if not hovering a planet)
    if (!this.isHolding) {
      this.hoveredStar = this.hoveredPlanet ? null : this.findNearestStar(e.clientX, e.clientY, this.hoverLockRadius);
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

    // Update Distant Background Galaxy Planets
    this.updateDistantPlanets(dt);

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
    if (this.blackHoleActive && this.blackHole) {
      this.updateBlackHole(dt);
    } else {
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
    if (this.blackHoleActive) return;

    this.supernovasTriggered++;
    this.flashAlpha = 0.55;

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

    // Toast alert notification
    this.notifySupernova();

    // Check for 2nd Supernova: Launch Black Hole Singularity Event!
    if (this.supernovasTriggered >= 2) {
      this.triggerBlackHole(originX, originY);
      return;
    }

    // Respawn after 3.5 seconds
    setTimeout(() => {
      if (this.blackHoleActive) return;
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
    if (!alertEl) return;

    if (this.supernovasTriggered === 1) {
      alertEl.innerHTML = '⚡ SUPERNOVA (1/2) DETONATED // STELLAR REBIRTH INITIATED';
      alertEl.classList.remove('black-hole-alert');
      alertEl.classList.add('active');
      setTimeout(() => {
        if (!this.blackHoleActive) alertEl.classList.remove('active');
      }, 2400);
    } else if (this.supernovasTriggered >= 2) {
      alertEl.innerHTML = '🕳️ 2ND SUPERNOVA COLLAPSE: BLACK HOLE SPAWNED // DEVOURING UNIVERSE...';
      alertEl.classList.add('active', 'black-hole-alert');
    }
  }

  triggerBlackHole(originX, originY) {
    this.blackHoleActive = true;
    this.cancelHold();
    this.gravityEnabled = false;

    this.blackHole = {
      x: originX,
      y: originY,
      radius: 6,
      targetRadius: Math.min(this.width, this.height) * 0.42,
      eventHorizonRadius: 4,
      targetEventHorizon: Math.min(this.width, this.height) * 0.20,
      accretionAngle: 0,
      intensity: 0,
      startTime: performance.now(),
      collapseTriggered: false,
      accretionSparks: []
    };

    // Trigger cosmic screen shake
    document.body.classList.add('black-hole-active');

    // Sucking targets: Title, Floating Planetary System, 3D Planet, Orbiting Satellites, AI Query Bar, Modals
    const elementsToSuck = [
      document.getElementById('cosmic-title-container'),
      document.getElementById('planetary-system'),
      document.getElementById('planet-stage'),
      document.getElementById('orbital-system'),
      document.getElementById('ai-query-section'),
      document.querySelector('.space-vignette'),
      document.getElementById('cosmic-modal'),
      document.getElementById('ai-response-modal')
    ];

    elementsToSuck.forEach(el => {
      if (!el) return;
      el.style.animation = 'none';
      const rect = el.getBoundingClientRect();
      const elCenterX = rect.left + rect.width / 2;
      const elCenterY = rect.top + rect.height / 2;
      const dx = Math.round(originX - elCenterX);
      const dy = Math.round(originY - elCenterY);

      el.style.setProperty('--vortex-dx', `${dx}px`);
      el.style.setProperty('--vortex-dy', `${dy}px`);
      el.style.translate = `${dx}px ${dy}px`;
      el.style.scale = '0.001';
      el.style.rotate = '1440deg';
      el.style.opacity = '0';
      el.style.filter = 'blur(12px) brightness(3) hue-rotate(180deg)';
      el.style.pointerEvents = 'none';
      el.classList.add('sucked-into-blackhole');
    });

    // Also pull the alert notification after 1.8s
    setTimeout(() => {
      const alertEl = document.getElementById('supernova-alert');
      if (alertEl) {
        const rect = alertEl.getBoundingClientRect();
        const dx = Math.round(originX - (rect.left + rect.width / 2));
        const dy = Math.round(originY - (rect.top + rect.height / 2));
        alertEl.style.setProperty('--vortex-dx', `${dx}px`);
        alertEl.style.setProperty('--vortex-dy', `${dy}px`);
        alertEl.classList.add('sucked-into-blackhole');
      }
    }, 1800);
  }

  updateBlackHole(dt) {
    if (!this.blackHole) return;
    const bh = this.blackHole;
    const elapsed = (performance.now() - bh.startTime) / 1000;
    bh.intensity = Math.min(1.0, elapsed / 2.4);

    // Expand event horizon and photon sphere
    bh.radius += (bh.targetRadius - bh.radius) * 0.045;
    bh.eventHorizonRadius += (bh.targetEventHorizon - bh.eventHorizonRadius) * 0.038;
    bh.accretionAngle += 0.06 + bh.intensity * 0.12;

    // Migrate smoothly toward center of viewport
    bh.x += (this.width / 2 - bh.x) * 0.015;
    bh.y += (this.height / 2 - bh.y) * 0.015;

    // Gravitational vortex pull on all stars
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      if (star.isConsumed) continue;

      const dx = bh.x - star.x;
      const dy = bh.y - star.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= bh.eventHorizonRadius + 6) {
        star.isConsumed = true;
        star.alpha = 0;
        star.x = -99999;
        star.y = -99999;
        if (Math.random() < 0.3) {
          this.spawnAccretionSpark(bh.x, bh.y, bh.eventHorizonRadius);
        }
      } else {
        const pull = Math.min(42, (950 / (dist + 15)) * (1 + bh.intensity * 3.5));
        const swirl = pull * 1.35;
        const angle = Math.atan2(dy, dx);

        star.x += Math.cos(angle) * pull - Math.sin(angle) * swirl;
        star.y += Math.sin(angle) * pull + Math.cos(angle) * swirl;

        if (dist < 220) {
          star.radius = Math.max(0.6, star.baseRadius * (1 + (220 - dist) / 45));
          star.color = '#38BDF8';
          star.alpha = 1.0;
        }
      }
    }

    // Gravitational suction of distant background planets
    if (this.distantPlanets) {
      for (const p of this.distantPlanets) {
        if (p.isConsumed) continue;
        const dx = bh.x - p.x;
        const dy = bh.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= bh.eventHorizonRadius + 15) {
          p.isConsumed = true;
          this.spawnAccretionSpark(bh.x, bh.y, bh.eventHorizonRadius);
        } else {
          const pull = Math.min(35, (750 / (dist + 25)) * (1 + bh.intensity * 3.0));
          const swirl = pull * 1.2;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * pull - Math.sin(angle) * swirl;
          p.y += Math.sin(angle) * pull + Math.cos(angle) * swirl;
          p.radius = Math.max(2, p.radius * 0.985);
        }
      }
    }

    // Update infalling accretion sparks
    for (let i = bh.accretionSparks.length - 1; i >= 0; i--) {
      const spark = bh.accretionSparks[i];
      spark.dist -= (spark.dist - bh.eventHorizonRadius) * 0.08 + 1.2;
      spark.angle += spark.speed;
      spark.x = bh.x + Math.cos(spark.angle) * spark.dist;
      spark.y = bh.y + Math.sin(spark.angle) * spark.dist;
      spark.alpha -= 0.018;
      spark.radius *= 0.96;
      if (spark.dist <= bh.eventHorizonRadius || spark.alpha <= 0.02) {
        bh.accretionSparks.splice(i, 1);
      }
    }

    // Total Singularity Collapse: Flash and Reload Page!
    if (elapsed >= 3.2 && !bh.collapseTriggered) {
      bh.collapseTriggered = true;
      this.flashAlpha = 1.0; // Blinding flash
      const alertEl = document.getElementById('supernova-alert');
      if (alertEl) {
        alertEl.innerHTML = '⚡ UNIVERSE COLLAPSED // REFRESHING REALITY...';
      }
      setTimeout(() => {
        window.location.reload();
      }, 450);
    }
  }

  spawnAccretionSpark(bhX, bhY, eventRadius) {
    if (!this.blackHole) return;
    const angle = Math.random() * Math.PI * 2;
    const dist = eventRadius * (1.1 + Math.random() * 0.8);
    const colors = ['#00E5FF', '#38BDF8', '#A855F7', '#FFD700', '#FFFFFF'];
    this.blackHole.accretionSparks.push({
      x: bhX + Math.cos(angle) * dist,
      y: bhY + Math.sin(angle) * dist,
      angle: angle,
      dist: dist,
      speed: Math.random() * 0.12 + 0.08,
      radius: Math.random() * 2.5 + 1.0,
      alpha: 1.0,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  drawBlackHole() {
    if (!this.blackHole) return;
    const { x, y, radius, eventHorizonRadius, accretionAngle, accretionSparks } = this.blackHole;

    this.ctx.save();

    // 1. Deep Space Gravitational Lensing Distortions & Accretion Glow
    const glowRadius = Math.max(10, radius * 1.8);
    const grad = this.ctx.createRadialGradient(x, y, Math.max(1, eventHorizonRadius * 0.8), x, y, glowRadius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.18, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.32, 'rgba(56, 189, 248, 0.85)');
    grad.addColorStop(0.55, 'rgba(168, 85, 247, 0.65)');
    grad.addColorStop(0.78, 'rgba(255, 61, 113, 0.35)');
    grad.addColorStop(1, 'transparent');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Rotating Relativistic Accretion Disk (Tilted Ellipses)
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(accretionAngle);

    const ringCount = 7;
    for (let r = 0; r < ringCount; r++) {
      const ringRadius = eventHorizonRadius + (radius - eventHorizonRadius) * (r / (ringCount - 1));
      if (ringRadius <= 0) continue;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, ringRadius * 1.45, ringRadius * 0.42, 0, 0, Math.PI * 2);
      this.ctx.strokeStyle = r % 2 === 0 ? 'rgba(56, 189, 248, 0.85)' : 'rgba(255, 215, 0, 0.75)';
      this.ctx.lineWidth = 2.5 + r * 0.6;
      this.ctx.shadowBlur = 18;
      this.ctx.shadowColor = r % 2 === 0 ? '#38BDF8' : '#FFD700';
      this.ctx.stroke();
    }
    this.ctx.restore();

    // 3. Accretion Sparks (Infalling matter streams)
    for (const spark of accretionSparks) {
      this.ctx.beginPath();
      this.ctx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = spark.color;
      this.ctx.globalAlpha = Math.max(0, spark.alpha);
      this.ctx.shadowBlur = 14;
      this.ctx.shadowColor = spark.color;
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;

    // 4. Photon Sphere (Intense luminous white/cyan perimeter)
    this.ctx.beginPath();
    this.ctx.arc(x, y, eventHorizonRadius + 3, 0, Math.PI * 2);
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 3.5;
    this.ctx.shadowBlur = 24;
    this.ctx.shadowColor = '#00E5FF';
    this.ctx.stroke();

    // 5. Pitch-black Event Horizon (Absolute Singularity Void)
    this.ctx.beginPath();
    this.ctx.arc(x, y, eventHorizonRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#000000';
    this.ctx.shadowBlur = 0;
    this.ctx.fill();

    this.ctx.restore();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Milky Way galaxy image backdrop with subtle parallax
    if (this.milkyWayLoaded) {
      this.ctx.save();
      const mwAlpha = (this.blackHoleActive && this.blackHole) ? Math.max(0, 0.22 * (1 - this.blackHole.intensity)) : 0.22;
      this.ctx.globalAlpha = mwAlpha;
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

    // 4. Draw Distant Background Galaxy Planets
    this.drawDistantPlanets();

    // 5. Draw Stars (Fast batch rendering for high density starfield)
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = 'transparent';

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      if (star.isExploding || star.isConsumed) continue;

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

    // 5. Draw Black Hole Singularity if active
    if (this.blackHoleActive && this.blackHole) {
      this.drawBlackHole();
    }

    // 6. Draw Reticle: Either Active Click-and-Hold (2s) or Hover Hint (only if black hole is not active)
    if (!this.blackHoleActive) {
      if (this.isHolding && this.lockedStar) {
        this.drawHoldReticle(this.lockedStar);
      } else if (this.hoveredStar && !this.pointer.isDown) {
        this.drawHoverHint(this.hoveredStar);
      }
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

  createDistantPlanets() {
    this.distantPlanets = [
      {
        id: 'jupiter',
        name: 'Jupiter',
        subtitle: 'GAS GIANT',
        type: 'jupiter',
        anchorX: this.width * 0.82,
        anchorY: this.height * 0.18,
        x: this.width * 0.82,
        y: this.height * 0.18,
        startX: this.width * 0.82,
        startY: this.height * 0.18,
        targetX: this.width * 0.82,
        targetY: this.height * 0.18,
        radius: 25,
        depth: 0.22,
        orbitRadiusX: 22,
        orbitRadiusY: 13,
        orbitSpeed: 0.035,
        orbitAngle: 0.6,
        orbitTilt: -0.22,
        axialRotation: 0,
        rotationSpeed: 0.06,
        colorLight: '#FEF3C7',
        colorMid: '#D97706',
        colorDark: '#78350F',
        hasRings: false,
        glowColor: 'rgba(245, 158, 11, 0.38)',
        isMoving: false,
        moveProgress: 1.0,
        moveDuration: 2.2,
        moveStartTime: 0,
        trail: [],
        twinklePhase: Math.random() * Math.PI * 2
      },
      {
        id: 'saturn',
        name: 'Saturn',
        subtitle: 'RINGED PLANET',
        type: 'saturn',
        anchorX: this.width * 0.16,
        anchorY: this.height * 0.22,
        x: this.width * 0.16,
        y: this.height * 0.22,
        startX: this.width * 0.16,
        startY: this.height * 0.22,
        targetX: this.width * 0.16,
        targetY: this.height * 0.22,
        radius: 21,
        depth: 0.20,
        orbitRadiusX: 25,
        orbitRadiusY: 15,
        orbitSpeed: 0.028,
        orbitAngle: 2.3,
        orbitTilt: -0.35,
        axialRotation: 0,
        rotationSpeed: 0.04,
        colorLight: '#FEF9C3',
        colorMid: '#EAB308',
        colorDark: '#713F12',
        ringColor: 'rgba(234, 179, 8, 0.55)',
        ringTilt: -0.44,
        hasRings: true,
        glowColor: 'rgba(234, 179, 8, 0.34)',
        isMoving: false,
        moveProgress: 1.0,
        moveDuration: 2.3,
        moveStartTime: 0,
        trail: [],
        twinklePhase: Math.random() * Math.PI * 2
      },
      {
        id: 'mars',
        name: 'Mars',
        subtitle: 'THE RED PLANET',
        type: 'mars',
        anchorX: this.width * 0.85,
        anchorY: this.height * 0.72,
        x: this.width * 0.85,
        y: this.height * 0.72,
        startX: this.width * 0.85,
        startY: this.height * 0.72,
        targetX: this.width * 0.85,
        targetY: this.height * 0.72,
        radius: 15,
        depth: 0.28,
        orbitRadiusX: 19,
        orbitRadiusY: 12,
        orbitSpeed: 0.065,
        orbitAngle: 4.1,
        orbitTilt: 0.28,
        axialRotation: 0,
        rotationSpeed: 0.08,
        colorLight: '#FECACA',
        colorMid: '#DC2626',
        colorDark: '#7F1D1D',
        hasRings: false,
        glowColor: 'rgba(239, 68, 68, 0.42)',
        isMoving: false,
        moveProgress: 1.0,
        moveDuration: 2.0,
        moveStartTime: 0,
        trail: [],
        twinklePhase: Math.random() * Math.PI * 2
      },
      {
        id: 'venus',
        name: 'Venus',
        subtitle: 'VEILED WORLD',
        type: 'venus',
        anchorX: this.width * 0.18,
        anchorY: this.height * 0.76,
        x: this.width * 0.18,
        y: this.height * 0.76,
        startX: this.width * 0.18,
        startY: this.height * 0.76,
        targetX: this.width * 0.18,
        targetY: this.height * 0.76,
        radius: 17,
        depth: 0.25,
        orbitRadiusX: 20,
        orbitRadiusY: 14,
        orbitSpeed: 0.075,
        orbitAngle: 1.2,
        orbitTilt: -0.16,
        axialRotation: 0,
        rotationSpeed: 0.03,
        colorLight: '#FFFBEB',
        colorMid: '#F59E0B',
        colorDark: '#92400E',
        hasRings: false,
        glowColor: 'rgba(251, 191, 36, 0.45)',
        isMoving: false,
        moveProgress: 1.0,
        moveDuration: 2.1,
        moveStartTime: 0,
        trail: [],
        twinklePhase: Math.random() * Math.PI * 2
      },
      {
        id: 'neptune',
        name: 'Neptune',
        subtitle: 'ICE GIANT',
        type: 'neptune',
        anchorX: this.width * 0.62,
        anchorY: this.height * 0.12,
        x: this.width * 0.62,
        y: this.height * 0.12,
        startX: this.width * 0.62,
        startY: this.height * 0.12,
        targetX: this.width * 0.62,
        targetY: this.height * 0.12,
        radius: 18,
        depth: 0.18,
        orbitRadiusX: 24,
        orbitRadiusY: 13,
        orbitSpeed: 0.024,
        orbitAngle: 3.2,
        orbitTilt: 0.32,
        axialRotation: 0,
        rotationSpeed: 0.05,
        colorLight: '#BAE6FD',
        colorMid: '#2563EB',
        colorDark: '#1E3A8A',
        hasRings: false,
        glowColor: 'rgba(37, 99, 235, 0.44)',
        isMoving: false,
        moveProgress: 1.0,
        moveDuration: 2.4,
        moveStartTime: 0,
        trail: [],
        twinklePhase: Math.random() * Math.PI * 2
      },
      {
        id: 'uranus',
        name: 'Uranus',
        subtitle: 'AQUAMARINE GIANT',
        type: 'uranus',
        anchorX: this.width * 0.38,
        anchorY: this.height * 0.84,
        x: this.width * 0.38,
        y: this.height * 0.84,
        startX: this.width * 0.38,
        startY: this.height * 0.84,
        targetX: this.width * 0.38,
        targetY: this.height * 0.84,
        radius: 17,
        depth: 0.19,
        orbitRadiusX: 23,
        orbitRadiusY: 14,
        orbitSpeed: 0.026,
        orbitAngle: 5.1,
        orbitTilt: 0.45,
        axialRotation: 0,
        rotationSpeed: 0.04,
        colorLight: '#CFFAFE',
        colorMid: '#06B6D4',
        colorDark: '#155E75',
        ringColor: 'rgba(165, 243, 252, 0.45)',
        ringTilt: 1.48,
        hasRings: true,
        glowColor: 'rgba(6, 182, 212, 0.38)',
        isMoving: false,
        moveProgress: 1.0,
        moveDuration: 2.2,
        moveStartTime: 0,
        trail: [],
        twinklePhase: Math.random() * Math.PI * 2
      },
      {
        id: 'mercury',
        name: 'Mercury',
        subtitle: 'CRATERED WORLD',
        type: 'mercury',
        anchorX: this.width * 0.36,
        anchorY: this.height * 0.16,
        x: this.width * 0.36,
        y: this.height * 0.16,
        startX: this.width * 0.36,
        startY: this.height * 0.16,
        targetX: this.width * 0.36,
        targetY: this.height * 0.16,
        radius: 12,
        depth: 0.30,
        orbitRadiusX: 16,
        orbitRadiusY: 10,
        orbitSpeed: 0.092,
        orbitAngle: 0.2,
        orbitTilt: 0.38,
        axialRotation: 0,
        rotationSpeed: 0.09,
        colorLight: '#F1F5F9',
        colorMid: '#94A3B8',
        colorDark: '#334155',
        hasRings: false,
        glowColor: 'rgba(148, 163, 184, 0.32)',
        isMoving: false,
        moveProgress: 1.0,
        moveDuration: 1.8,
        moveStartTime: 0,
        trail: [],
        twinklePhase: Math.random() * Math.PI * 2
      }
    ];
  }

  findClickedDistantPlanet(px, py) {
    if (!this.distantPlanets) return null;
    for (const p of this.distantPlanets) {
      if (p.isConsumed) continue;
      const hitRadius = p.radius + 18;
      const dx = px - p.x;
      const dy = py - p.y;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        return p;
      }
    }
    return null;
  }

  moveDistantPlanet(planet) {
    if (planet.isMoving || planet.isConsumed) return;

    // 1. Departure warp pulse
    this.planetWarpPulses.push({
      x: planet.x,
      y: planet.y,
      radius: planet.radius,
      maxRadius: planet.radius * 3.6,
      alpha: 1.0,
      color: planet.colorMid
    });

    // 2. Safe location selection
    const newPos = this.pickSafePlanetLocation(planet);
    planet.startX = planet.x;
    planet.startY = planet.y;
    planet.targetX = newPos.x;
    planet.targetY = newPos.y;
    planet.isMoving = true;
    planet.moveProgress = 0;
    planet.moveDuration = 1.9 + Math.random() * 0.5;
    planet.moveStartTime = performance.now();
  }

  pickSafePlanetLocation(currentPlanet) {
    const pad = Math.min(85, this.width * 0.12);
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const minCenterDist = Math.min(220, Math.min(this.width, this.height) * 0.35);

    for (let attempts = 0; attempts < 40; attempts++) {
      const candidateX = pad + Math.random() * (this.width - pad * 2);
      const candidateY = pad + Math.random() * (this.height - pad * 2);

      const distFromCenter = Math.hypot(candidateX - centerX, candidateY - centerY);
      if (distFromCenter < minCenterDist) continue;

      const distFromCurrent = Math.hypot(candidateX - currentPlanet.x, candidateY - currentPlanet.y);
      if (distFromCurrent < 130) continue;

      let tooCloseToOther = false;
      for (const other of this.distantPlanets) {
        if (other === currentPlanet) continue;
        const otherRefX = other.targetX || other.anchorX || other.x;
        const otherRefY = other.targetY || other.anchorY || other.y;
        if (Math.hypot(candidateX - otherRefX, candidateY - otherRefY) < 80) {
          tooCloseToOther = true;
          break;
        }
      }
      if (tooCloseToOther) continue;

      return { x: candidateX, y: candidateY };
    }

    return {
      x: Math.random() > 0.5 ? this.width * 0.18 : this.width * 0.82,
      y: Math.random() > 0.5 ? this.height * 0.22 : this.height * 0.78
    };
  }

  updateDistantPlanets(dt) {
    if (!this.distantPlanets || this.blackHoleActive) return;
    const now = performance.now();

    for (const p of this.distantPlanets) {
      if (p.isConsumed) continue;

      p.twinklePhase += 0.015;
      p.axialRotation += p.rotationSpeed * dt;

      if (p.isMoving) {
        const elapsed = (now - p.moveStartTime) / 1000;
        p.moveProgress = Math.min(1.0, elapsed / p.moveDuration);

        const t = p.moveProgress;
        const ease = t * t * (3 - 2 * t);

        p.x = p.startX + (p.targetX - p.startX) * ease;
        p.y = p.startY + (p.targetY - p.startY) * ease;

        if (Math.random() < 0.65) {
          p.trail.push({
            x: p.x + (Math.random() - 0.5) * p.radius * 0.6,
            y: p.y + (Math.random() - 0.5) * p.radius * 0.6,
            radius: Math.random() * 2.2 + 0.8,
            alpha: 0.85,
            color: p.colorLight
          });
        }

        if (p.moveProgress >= 1.0) {
          p.isMoving = false;
          p.anchorX = p.targetX;
          p.anchorY = p.targetY;
          p.x = p.targetX;
          p.y = p.targetY;
          this.planetWarpPulses.push({
            x: p.x,
            y: p.y,
            radius: p.radius * 0.8,
            maxRadius: p.radius * 3.0,
            alpha: 0.95,
            color: p.colorLight
          });
        }
      } else {
        // Continuous, subtle, organic orbital motion in space
        p.orbitAngle += p.orbitSpeed * dt;
        const cosA = Math.cos(p.orbitAngle);
        const sinA = Math.sin(p.orbitAngle);
        const cosT = Math.cos(p.orbitTilt);
        const sinT = Math.sin(p.orbitTilt);
        const rawX = cosA * p.orbitRadiusX;
        const rawY = sinA * p.orbitRadiusY;
        const offX = rawX * cosT - rawY * sinT;
        const offY = rawX * sinT + rawY * cosT;
        p.x = p.anchorX + offX;
        p.y = p.anchorY + offY;
      }

      // Fade stardust trails
      for (let i = p.trail.length - 1; i >= 0; i--) {
        const tr = p.trail[i];
        tr.alpha -= dt * 1.3;
        tr.radius *= 0.96;
        if (tr.alpha <= 0.04) {
          p.trail.splice(i, 1);
        }
      }
    }

    // Update warp expansion pulses
    for (let i = this.planetWarpPulses.length - 1; i >= 0; i--) {
      const wp = this.planetWarpPulses[i];
      wp.radius += (wp.maxRadius - wp.radius) * dt * 5.2 + 0.8;
      wp.alpha -= dt * 1.5;
      if (wp.alpha <= 0.02) {
        this.planetWarpPulses.splice(i, 1);
      }
    }
  }

  drawDistantPlanets() {
    if (!this.distantPlanets) return;

    // 1. Draw Warp Pulses
    for (const wp of this.planetWarpPulses) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(wp.x, wp.y, wp.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = wp.color;
      this.ctx.lineWidth = 2.2;
      this.ctx.globalAlpha = Math.max(0, wp.alpha);
      this.ctx.shadowBlur = 14;
      this.ctx.shadowColor = wp.color;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 2. Draw Each Planet
    for (const p of this.distantPlanets) {
      if (p.isConsumed) continue;

      const parallaxX = (this.pointer.x - this.width / 2) * p.depth * 0.03;
      const parallaxY = (this.pointer.y - this.height / 2) * p.depth * 0.03;
      const px = p.x + parallaxX;
      const py = p.y + parallaxY;
      const r = p.radius;

      this.ctx.save();

      // Trail
      for (const tr of p.trail) {
        this.ctx.beginPath();
        this.ctx.arc(tr.x, tr.y, tr.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = tr.color;
        this.ctx.globalAlpha = tr.alpha;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = tr.color;
        this.ctx.fill();
      }

      // Atmospheric Backglow
      const glowMultiplier = p.type === 'venus' ? 2.2 : (p.type === 'jupiter' ? 2.0 : 1.7);
      const glowGrad = this.ctx.createRadialGradient(px, py, r * 0.5, px, py, r * glowMultiplier);
      glowGrad.addColorStop(0, p.glowColor);
      glowGrad.addColorStop(0.55, p.glowColor.replace(/0\.\d+/, '0.12'));
      glowGrad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glowGrad;
      this.ctx.beginPath();
      this.ctx.arc(px, py, r * glowMultiplier, 0, Math.PI * 2);
      this.ctx.fill();

      // Backside Rings (for Saturn and Uranus)
      if (p.hasRings) {
        this.drawPlanetRings(p, px, py, r, Math.PI, Math.PI * 2);
      }

      // 3D Spherical Planet Body with Realistic Surface Details (clipped)
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(px, py, r, 0, Math.PI * 2);
      this.ctx.clip();

      // Planet-specific realistic surface rendering
      this.drawRealisticPlanetSurface(p, px, py, r);

      // 3D Spherical Volume Shading Overlay (curved terminator & crescent shadow)
      const sphereShade = this.ctx.createRadialGradient(
        px - r * 0.38, py - r * 0.38, r * 0.05,
        px, py, r
      );
      sphereShade.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
      sphereShade.addColorStop(0.35, 'rgba(255, 255, 255, 0.0)');
      sphereShade.addColorStop(0.62, 'rgba(5, 5, 15, 0.28)');
      sphereShade.addColorStop(0.88, 'rgba(2, 6, 23, 0.82)');
      sphereShade.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
      this.ctx.fillStyle = sphereShade;
      this.ctx.fillRect(px - r, py - r, r * 2, r * 2);

      this.ctx.restore(); // end clip

      // Frontside Rings (drawn across front of planet)
      if (p.hasRings) {
        this.drawPlanetRings(p, px, py, r, 0, Math.PI);
      }

      // Sunlit Atmospheric Limb Rim
      this.ctx.beginPath();
      this.ctx.arc(px, py, r, -Math.PI * 0.8, Math.PI * 0.2);
      this.ctx.strokeStyle = p.colorLight;
      this.ctx.lineWidth = 1.5;
      this.ctx.globalAlpha = 0.55;
      this.ctx.stroke();

      // Hover Indicator Ring & Reticle HUD
      if (this.hoveredPlanet === p && !p.isMoving) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(px, py, r + 8, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        this.ctx.lineWidth = 1.6;
        this.ctx.setLineDash([3, 3]);
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00E5FF';
        this.ctx.stroke();

        this.ctx.setLineDash([]);
        this.ctx.font = '700 9px Orbitron, sans-serif';
        this.ctx.fillStyle = '#BAE6FD';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillText(`${p.name.toUpperCase()} • ${p.subtitle}`, px, py + r + 18);
        this.ctx.font = '500 8px Orbitron, sans-serif';
        this.ctx.fillStyle = 'rgba(186, 230, 253, 0.75)';
        this.ctx.fillText('CLICK TO RELOCATE', px, py + r + 29);
        this.ctx.restore();
      }

      this.ctx.restore();
    }
  }

  drawPlanetRings(p, px, py, r, startAngle, endAngle) {
    this.ctx.save();
    this.ctx.translate(px, py);
    this.ctx.rotate(p.ringTilt);

    if (p.type === 'saturn') {
      // Ring C (Innermost faint crepe ring)
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, r * 1.45, r * 0.44, 0, startAngle, endAngle);
      this.ctx.strokeStyle = 'rgba(180, 140, 75, 0.28)';
      this.ctx.lineWidth = 2.0;
      this.ctx.stroke();

      // Ring B (Main dense bright golden ring)
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, r * 1.82, r * 0.55, 0, startAngle, endAngle);
      this.ctx.strokeStyle = 'rgba(245, 215, 130, 0.75)';
      this.ctx.lineWidth = 4.2;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = 'rgba(234, 179, 8, 0.5)';
      this.ctx.stroke();

      // Cassini Division (Dark gap)
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, r * 2.02, r * 0.61, 0, startAngle, endAngle);
      this.ctx.strokeStyle = 'rgba(5, 5, 12, 0.65)';
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();

      // Ring A (Outer golden band)
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, r * 2.22, r * 0.67, 0, startAngle, endAngle);
      this.ctx.strokeStyle = 'rgba(225, 185, 95, 0.50)';
      this.ctx.lineWidth = 2.8;
      this.ctx.stroke();
    } else if (p.type === 'uranus') {
      // Uranus near-vertical thin icy ring
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, r * 1.95, r * 0.32, 0, startAngle, endAngle);
      this.ctx.strokeStyle = p.ringColor;
      this.ctx.lineWidth = 1.8;
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = p.ringColor;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawRealisticPlanetSurface(p, px, py, r) {
    const ctx = this.ctx;

    if (p.type === 'jupiter') {
      // 1. Jovian banded atmospheric cloud layers
      const bgGrad = ctx.createLinearGradient(px, py - r, px, py + r);
      bgGrad.addColorStop(0, '#B45309');    // North polar haze
      bgGrad.addColorStop(0.18, '#FDE68A'); // North temperate zone
      bgGrad.addColorStop(0.32, '#9A3412'); // North equatorial belt
      bgGrad.addColorStop(0.48, '#FEF3C7'); // Equatorial zone
      bgGrad.addColorStop(0.64, '#7C2D12'); // South equatorial belt
      bgGrad.addColorStop(0.82, '#F59E0B'); // South temperate zone
      bgGrad.addColorStop(1, '#78350F');    // South polar haze
      ctx.fillStyle = bgGrad;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);

      // Atmospheric wavy turbulence
      const bandOffset = Math.sin(p.axialRotation) * 3;
      ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
      ctx.fillRect(px - r, py - r * 0.42 + bandOffset * 0.2, r * 2, r * 0.12);
      ctx.fillRect(px - r, py + r * 0.12 - bandOffset * 0.2, r * 2, r * 0.15);
      ctx.fillRect(px - r, py + r * 0.45, r * 2, r * 0.09);

      // Great Red Spot (GRS) rotating in South Equatorial Belt
      const grsPhase = Math.sin(p.axialRotation);
      if (Math.cos(p.axialRotation) > -0.25) {
        const grsX = px + grsPhase * (r * 0.65);
        const grsY = py + r * 0.26;
        ctx.beginPath();
        ctx.ellipse(grsX, grsY, r * 0.34, r * 0.19, 0.05, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(grsX, grsY, r * 0.22, r * 0.11, 0.05, 0, Math.PI * 2);
        ctx.fillStyle = '#991B1B';
        ctx.fill();
      }
    } else if (p.type === 'saturn') {
      // Golden butterscotch sphere with gentle cloud bands
      const satGrad = ctx.createLinearGradient(px, py - r, px, py + r);
      satGrad.addColorStop(0, '#A16207');
      satGrad.addColorStop(0.25, '#FEF08A');
      satGrad.addColorStop(0.50, '#FACC15');
      satGrad.addColorStop(0.75, '#CA8A04');
      satGrad.addColorStop(1, '#713F12');
      ctx.fillStyle = satGrad;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);

      ctx.fillStyle = 'rgba(161, 98, 7, 0.35)';
      ctx.fillRect(px - r, py - r * 0.25, r * 2, r * 0.12);
      ctx.fillRect(px - r, py + r * 0.15, r * 2, r * 0.10);

      // Ring shadow on the planet globe
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.ringTilt);
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.10, r * 1.1, r * 0.22, 0, 0, Math.PI);
      ctx.fillStyle = 'rgba(15, 10, 5, 0.55)';
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'mars') {
      // Rusty red-orange iron oxide surface
      const marsGrad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, r * 0.1, px, py, r);
      marsGrad.addColorStop(0, '#F97316');
      marsGrad.addColorStop(0.5, '#EA580C');
      marsGrad.addColorStop(0.85, '#9A3412');
      marsGrad.addColorStop(1, '#431407');
      ctx.fillStyle = marsGrad;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);

      // Dark basaltic volcanic maria (Syrtis Major, Sinus Meridiani) rotating
      const rotShift = Math.sin(p.axialRotation) * (r * 0.45);
      ctx.fillStyle = 'rgba(67, 20, 7, 0.65)';
      ctx.beginPath();
      ctx.ellipse(px + rotShift, py + r * 0.1, r * 0.45, r * 0.25, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(px - rotShift * 0.7, py + r * 0.35, r * 0.35, r * 0.18, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Northern Polar Ice Cap (glistening ice)
      ctx.beginPath();
      ctx.ellipse(px, py - r * 0.82, r * 0.42, r * 0.18, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (p.type === 'venus') {
      // Veiled dense sulfuric acid cloud canopy
      const venGrad = ctx.createLinearGradient(px - r, py - r, px + r, py + r);
      venGrad.addColorStop(0, '#FFFBEB');
      venGrad.addColorStop(0.35, '#FEF08A');
      venGrad.addColorStop(0.70, '#F59E0B');
      venGrad.addColorStop(1, '#92400E');
      ctx.fillStyle = venGrad;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);

      // High-altitude cloud chevron bands
      ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.beginPath();
      ctx.ellipse(px, py - r * 0.2, r * 0.85, r * 0.30, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(217, 119, 6, 0.25)';
      ctx.beginPath();
      ctx.ellipse(px, py + r * 0.25, r * 0.75, r * 0.28, -0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'neptune') {
      // Deep cobalt/ultramarine blue ice giant
      const nepGrad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, r * 0.1, px, py, r);
      nepGrad.addColorStop(0, '#38BDF8');
      nepGrad.addColorStop(0.35, '#2563EB');
      nepGrad.addColorStop(0.75, '#1D4ED8');
      nepGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = nepGrad;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);

      // High-altitude methane cirrus cloud streaks ("Scooter")
      const cloudShift = Math.sin(p.axialRotation) * (r * 0.5);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(px + cloudShift * 0.5, py - r * 0.15, r * 0.6, 0.2, 1.2);
      ctx.stroke();

      ctx.strokeStyle = '#67E8F9';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(px - cloudShift * 0.4, py + r * 0.28, r * 0.55, 0.4, 1.6);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Great Dark Spot
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.beginPath();
      ctx.ellipse(px + cloudShift * 0.6, py + r * 0.18, r * 0.28, r * 0.16, 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'uranus') {
      // Aquamarine / cyan-teal gas giant
      const urGrad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, r * 0.1, px, py, r);
      urGrad.addColorStop(0, '#CFFAFE');
      urGrad.addColorStop(0.40, '#22D3EE');
      urGrad.addColorStop(0.80, '#0891B2');
      urGrad.addColorStop(1, '#164E63');
      ctx.fillStyle = urGrad;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);

      // Soft serene atmospheric zone
      ctx.fillStyle = 'rgba(207, 250, 254, 0.25)';
      ctx.fillRect(px - r, py - r * 0.2, r * 2, r * 0.3);
    } else if (p.type === 'mercury') {
      // Cratered airless rocky world
      const mercGrad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, r * 0.1, px, py, r);
      mercGrad.addColorStop(0, '#F1F5F9');
      mercGrad.addColorStop(0.45, '#94A3B8');
      mercGrad.addColorStop(0.80, '#475569');
      mercGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = mercGrad;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);

      // Impact Craters with sunlit rims
      const craters = [
        { x: -0.3, y: -0.2, rad: 0.24 },
        { x: 0.25, y: 0.15, rad: 0.20 },
        { x: -0.15, y: 0.35, rad: 0.18 },
        { x: 0.2, y: -0.35, rad: 0.15 }
      ];
      for (const cr of craters) {
        const cx = px + cr.x * r;
        const cy = py + cr.y * r;
        const crad = cr.rad * r;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.beginPath();
        ctx.arc(cx, cy, crad, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.65)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(cx, cy, crad, -Math.PI * 0.7, 0);
        ctx.stroke();
      }

      // Bright ray crater (Kuiper crater)
      const kx = px + r * 0.15;
      const ky = py - r * 0.15;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(kx, ky);
        ctx.lineTo(kx + Math.cos(angle) * r * 0.6, ky + Math.sin(angle) * r * 0.6);
        ctx.stroke();
      }
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

// Developer testing helpers (can be called in browser console)
window.triggerSupernova = () => {
  if (window.cosmicStarfield && window.cosmicStarfield.stars.length > 0) {
    const s = window.cosmicStarfield.stars[0];
    window.cosmicStarfield.triggerSupernova(s);
  }
};

window.triggerBlackHole = () => {
  if (window.cosmicStarfield) {
    window.cosmicStarfield.supernovasTriggered = 1;
    const s = window.cosmicStarfield.stars[0] || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    window.cosmicStarfield.triggerSupernova(s);
  }
};
