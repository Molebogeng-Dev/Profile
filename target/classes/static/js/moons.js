/**
 * 3D ORBITING SATELLITE MOON ENGINE & COSMIC MODAL MANAGER
 * - Revolves satellite moons around the central Earth planet in 3D
 * - True depth sorting: passes in front of Earth (z > 0) and behind Earth (z < 0)
 * - Clickable moons trigger high-tech cosmic modal overlays
 * - Pre-configured for LinkedIn, GitHub, YouTube, Developer CV, About Me, Projects
 */

class CosmicOrbitSystem {
  constructor(containerId, modalId) {
    this.container = document.getElementById(containerId);
    this.modal = document.getElementById(modalId);
    
    if (!this.container) {
      console.error('Orbital container element not found:', containerId);
      return;
    }

    // Modal elements
    this.modalTitle = document.getElementById('modal-title');
    this.modalBadge = document.getElementById('modal-badge');
    this.modalBody = document.getElementById('modal-body');
    this.modalExternalLink = document.getElementById('modal-external-link');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.modalBackdrop = document.getElementById('modal-backdrop');

    this.isPaused = false;
    this.activeMoon = null;

    // UNIFIED HARMONIC ORBITAL CONSTELLATION PARAMETERS
    // All 7 satellites share a synchronized base speed and are phase-locked at exactly (2π / 7) ≈ 51.4° intervals.
    // They can NEVER drift closer, catch up, or clash in orbit.
    this.baseSpeed = 0.0026;             // Calm, majestic orbital cruising velocity
    this.inclination = -0.24;            // 3D orbital tilt (~ -13.8°)
    this.orbitRadiusXMultiplier = 1.82;  // Major axis multiplier relative to planet radius
    this.orbitRadiusYMultiplier = 0.68;  // Minor axis multiplier for 3D perspective
    this.globalPhase = 0.0;              // Master system orbital clock
    this.currentSpeedMultiplier = 1.0;   // Interpolated system speed multiplier
    this.targetSpeedMultiplier = 1.0;    // Target system speed (drops smoothly on hover)
    this.hoveredMoon = null;             // Currently hovered satellite
    this.minSeparationPx = 82;           // Active screen-space collision guard distance (px)

    // Satellite Moon Definitions (Unique branding, icons, colors, descriptions)
    this.moons = [
      {
        id: 'linkedin',
        title: 'LinkedIn',
        subtitle: 'Molebogeng Selahle',
        accentColor: '#0A66C2',
        url: 'https://www.linkedin.com/in/molebogeng-selahle-755b30385?utm_source=share_via&utm_content=profile&utm_medium=member_android',
        description: 'Connect with me professionally, view endorsements, career history, software engineering achievements, and industry network.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V9.92H5.06v8.58h2.8z"/></svg>`,
        size: 46
      },
      {
        id: 'github',
        title: 'GitHub',
        subtitle: '@Molebogeng-Dev',
        accentColor: '#8957E5',
        url: 'https://github.com/Molebogeng-Dev',
        description: 'Browse open-source contributions, repositories, algorithms, system architectures, and commits.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>`,
        size: 46
      },
      {
        id: 'tiktok',
        title: 'TikTok',
        subtitle: '@import_podcast',
        accentColor: '#FE2C55',
        url: 'https://www.tiktok.com/@import_podcast?_r=1&_t=ZS-99hnK47pMr2',
        description: 'Watch quick programming tips, developer humor, technology breakdowns, and coding shorts on Import Podcast.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
        size: 44
      },
      {
        id: 'youtube',
        title: 'YouTube',
        subtitle: '@import_podcast',
        accentColor: '#FF0000',
        url: 'https://youtube.com/@import_podcast?si=5v8J7gf7GH5CJ1H1',
        description: 'Stream full video episodes, coding tutorials, live architecture walkthroughs, and developer tech talks.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/></svg>`,
        size: 44
      },
      {
        id: 'cv',
        title: 'Developer CV',
        subtitle: 'Molebogeng Selahle',
        accentColor: '#10B981',
        url: '#cv-preview',
        description: 'Official Developer CV — Junior Developer proficient in Python, Java, C, SQL, and Linux Mint. WeThinkCode_ software engineering candidate.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 12h8v2H8v-2zm0 4h5v2H8v-2z"/></svg>`,
        size: 46
      },
      {
        id: 'about',
        title: 'About Me',
        subtitle: 'Junior Developer & WeThinkCode_',
        accentColor: '#FFD700',
        url: '#about-preview',
        description: 'Resourceful Junior Developer focused on robust applications, Linux Mint optimization, Python, Java, C, SQL, and host of Import Podcast.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z"/></svg>`,
        size: 44
      },
      {
        id: 'projects',
        title: 'Projects & Apps',
        subtitle: 'iSgela & Software Portfolio',
        accentColor: '#00E5FF',
        url: '#projects-preview',
        description: 'Explore iSgela (Flagship AI Educational Platform for Africa), 3D Cosmic Portfolio Website, and Koko Web App.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm2 0v2h12V6H6zm0 4v8h12v-8H6zm2 2h3v4H8v-4zm5 0h3v2h-3v-2zm0 3h3v1h-3v-1z"/></svg>`,
        size: 48
      }
    ];

    this.domElements = [];
    this.planetStage = document.getElementById('planet-stage');

    this.init();
  }

  init() {
    this.createMoonElements();
    this.bindModalEvents();
    
    // Start animation loop
    requestAnimationFrame(() => this.updateOrbits());
  }

  createMoonElements() {
    this.container.innerHTML = '';
    this.domElements = [];

    this.moons.forEach((moon) => {
      const isExternal = moon.url && moon.url.startsWith('http');
      // Create element: anchor for external links (direct redirect in new tab), button for modal triggers
      const el = document.createElement(isExternal ? 'a' : 'button');
      el.className = 'satellite-moon';
      el.id = `moon-${moon.id}`;
      el.setAttribute('aria-label', `${moon.title}: ${moon.subtitle}`);
      el.title = `${moon.title} (${moon.subtitle})`;

      if (isExternal) {
        el.href = moon.url;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      }

      // Inner dish ball sphere
      el.innerHTML = `
        <div class="dish-ball" style="--moon-accent: ${moon.accentColor};">
          <div class="dish-glow"></div>
          <div class="dish-icon">${moon.iconSvg}</div>
          <div class="dish-ring"></div>
        </div>
        <div class="moon-tooltip">// ${moon.title.toUpperCase()}</div>
      `;

      // Event listeners: hovering decelerates the entire constellation synchronously
      el.addEventListener('pointerenter', () => {
        el.classList.add('hovered');
        this.hoveredMoon = moon;
        this.targetSpeedMultiplier = 0.10; // Slows entire orbital system to near-stop for effortless selection
      });

      el.addEventListener('pointerleave', () => {
        el.classList.remove('hovered');
        if (this.hoveredMoon === moon) {
          this.hoveredMoon = null;
          this.targetSpeedMultiplier = 1.0; // Smoothly resumes normal cruising speed
        }
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isExternal) {
          // Direct native redirect to the external platform in new tab!
          const alertEl = document.getElementById('supernova-alert');
          if (alertEl && !window.cosmicStarfield?.blackHoleActive) {
            alertEl.innerHTML = `🚀 REDIRECTING TO ${moon.title.toUpperCase()} // ${moon.subtitle.toUpperCase()}`;
            alertEl.classList.remove('black-hole-alert');
            alertEl.classList.add('active');
            setTimeout(() => {
              if (!window.cosmicStarfield?.blackHoleActive) {
                alertEl.classList.remove('active');
              }
            }, 2400);
          }
        } else {
          e.preventDefault();
          this.openModal(moon);
        }
      });

      this.container.appendChild(el);
      this.domElements.push({ moon, el });
    });
  }

  getPlanetRadius() {
    if (this.planetStage) {
      const rect = this.planetStage.getBoundingClientRect();
      return Math.min(rect.width, rect.height) / 2;
    }
    return 130;
  }

  /**
   * Screen-Space Anti-Collision Guard:
   * Enforces that no two satellite dish balls ever overlap or clash in projected 2D space.
   */
  enforceSafeSeparation(positions, minDistance) {
    const len = positions.length;
    for (let iter = 0; iter < 2; iter++) {
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const p1 = positions[i];
          const p2 = positions[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distSq = dx * dx + dy * dy;
          const minDistSq = minDistance * minDistance;

          if (distSq < minDistSq && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const overlap = (minDistance - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            p1.x -= nx * overlap;
            p1.y -= ny * overlap;
            p2.x += nx * overlap;
            p2.y += ny * overlap;
          }
        }
      }
    }
  }

  updateOrbits() {
    if (!this.isPaused) {
      const planetR = this.getPlanetRadius();

      // Smoothly interpolate speed multiplier for organic deceleration & acceleration
      this.currentSpeedMultiplier += (this.targetSpeedMultiplier - this.currentSpeedMultiplier) * 0.08;
      const deltaSpeed = this.baseSpeed * this.currentSpeedMultiplier;
      this.globalPhase = (this.globalPhase + deltaSpeed) % (Math.PI * 2);

      // Responsive orbit radii clamped so satellites never clip beyond viewport on mobile
      const maxAllowedRx = window.innerWidth * 0.45;
      const rx = Math.min(planetR * this.orbitRadiusXMultiplier, maxAllowedRx);
      const ry = rx * (this.orbitRadiusYMultiplier / this.orbitRadiusXMultiplier);

      const cosInc = Math.cos(this.inclination);
      const sinInc = Math.sin(this.inclination);
      const totalMoons = this.domElements.length;

      // 1. Calculate projected 3D & 2D coordinates with phase-locked uniform constellation spacing
      const positions = this.domElements.map((item, idx) => {
        // Uniform phase separation: each satellite is permanently locked at (idx * 2π / N)
        const theta = (this.globalPhase + (idx * Math.PI * 2) / totalMoons) % (Math.PI * 2);

        const xOrb = Math.cos(theta) * rx;
        const yOrb = Math.sin(theta) * ry;
        const zOrb = Math.sin(theta) * rx;

        // Apply inclination tilt around Z-axis
        let x = xOrb * cosInc - yOrb * sinInc;
        let y = xOrb * sinInc + yOrb * cosInc;
        const z = zOrb;

        return { item, x, y, z, rx };
      });

      // 2. Active Screen-Space Anti-Collision Guard
      // Enforces minimum separation distance under all responsive conditions
      this.enforceSafeSeparation(positions, Math.min(this.minSeparationPx, rx * 0.44));

      // 3. Render and apply depth sorting styles
      positions.forEach((pos) => {
        const { item, x, y, z, rx } = pos;
        const { el } = item;
        const isHovered = (this.hoveredMoon === item.moon);
        const distFromCenter = Math.sqrt(x * x + y * y);

        // TRUE 3D OCCLUSION & DEPTH SORTING
        if (z < 0) {
          // MOON IS BEHIND THE PLANET
          const isBehindPlanetDisc = distFromCenter < planetR * 0.95;
          const depthNorm = Math.abs(z) / rx;
          const scale = Math.max(0.72, 1.0 - depthNorm * 0.22);
          const opacity = isBehindPlanetDisc ? '0' : Math.max(0.40, 1.0 - depthNorm * 0.45).toFixed(2);

          el.style.zIndex = isHovered ? '50' : '5';
          el.style.pointerEvents = isBehindPlanetDisc ? 'none' : 'auto';
          el.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
          el.style.opacity = opacity;
          el.classList.add('behind-planet');
          el.classList.remove('in-front');
        } else {
          // MOON IS IN FRONT OF THE PLANET
          const depthNorm = z / rx;
          const scale = 1.0 + depthNorm * 0.20;

          el.style.zIndex = isHovered ? '50' : '20';
          el.style.pointerEvents = 'auto';
          el.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
          el.style.opacity = '1.0';
          el.classList.add('in-front');
          el.classList.remove('behind-planet');
        }
      });
    }

    requestAnimationFrame(() => this.updateOrbits());
  }

  // --- MODAL CONTROLLER ---
  openModal(moon) {
    this.activeMoon = moon;
    this.isPaused = true;

    if (!this.modal) return;

    // Set Header Info
    if (this.modalTitle) this.modalTitle.textContent = moon.title;
    if (this.modalBadge) {
      this.modalBadge.textContent = moon.subtitle;
      this.modalBadge.style.borderColor = moon.accentColor;
      this.modalBadge.style.color = moon.accentColor;
    }

    // Set Action Button
    if (this.modalExternalLink) {
      this.modalExternalLink.href = moon.url;
      this.modalExternalLink.style.setProperty('--accent', moon.accentColor);
    }

    // Generate Modal Content
    if (this.modalBody) {
      this.modalBody.innerHTML = this.generateModalContent(moon);
    }

    // Show Modal with Spring Animation
    this.modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    this.isPaused = false;
    this.activeMoon = null;

    // Reset body iframe content to avoid background audio/video playback
    if (this.modalBody) {
      setTimeout(() => {
        if (!this.modal.classList.contains('active')) {
          this.modalBody.innerHTML = '';
        }
      }, 350);
    }
  }

  bindModalEvents() {
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', () => this.closeModal());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  generateModalContent(moon) {
    const isExternalUrl = moon.url.startsWith('http');

    return `
      <div class="modal-cosmic-card" style="--accent: ${moon.accentColor};">
        <div class="card-hero-header">
          <div class="card-icon-emblem" style="background: ${moon.accentColor}22; border-color: ${moon.accentColor};">
            ${moon.iconSvg}
          </div>
          <div class="card-hero-text">
            <h3>${moon.title}</h3>
            <p class="card-subtitle">${moon.subtitle}</p>
          </div>
        </div>

        <p class="card-description">${moon.description}</p>

        <!-- Live Embedded Viewer Slot -->
        <div class="embed-preview-wrapper">
          <div class="embed-hud-toolbar">
            <span class="status-indicator live"></span>
            <span class="embed-label">LIVE SYSTEM FEED // ${moon.id.toUpperCase()}</span>
            <a href="${moon.url}" target="_blank" rel="noopener noreferrer" class="embed-launch-btn">
              <span>Open in New Tab</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"/></svg>
            </a>
          </div>

          ${
            isExternalUrl
              ? `
              <div class="external-portal-card">
                <div class="portal-badge-row">
                  <span class="portal-live-tag">● VERIFIED PROFILE GATEWAY</span>
                  <span class="portal-latency">LATENCY: ~12ms // ENCRYPTED NODE</span>
                </div>
                <div class="portal-profile-preview">
                  <div class="portal-avatar" style="background: ${moon.accentColor}25; border-color: ${moon.accentColor}; color: ${moon.accentColor};">
                    ${moon.iconSvg}
                  </div>
                  <div class="portal-details">
                    <h4>${moon.title}</h4>
                    <p class="portal-handle">${moon.subtitle}</p>
                    <span class="portal-status-online">● ACTIVE BROADCAST CHANNEL</span>
                  </div>
                </div>
                <p class="portal-note">Direct high-speed uplink to ${moon.title}. Launch official profile in a new tab to explore content, code repositories, videos, and professional milestones.</p>
                <a href="${moon.url}" target="_blank" rel="noopener noreferrer" class="cosmic-glow-btn portal-launch-btn">
                  <span>Launch Official ${moon.title} Profile</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"/></svg>
                </a>
              </div>
            `
              : this.generateInternalCard(moon)
          }
        </div>
      </div>
    `;
  }

  generateInternalCard(moon) {
    if (moon.id === 'cv') {
      return `
        <div class="cv-interactive-view">
          <div class="cv-header-row">
            <div>
              <h4>Molebogeng Lehlogonolo Selahle</h4>
              <p class="cv-meta">Junior Developer // Python, Java, C, SQL // Linux Mint // WeThinkCode_</p>
            </div>
            <a href="assets/Molebogeng_Selahle_Developer_CV.pdf" download="Molebogeng_Selahle_Developer_CV.pdf" class="cv-download-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              <span>Download PDF</span>
            </a>
          </div>

          <!-- Contact Bar -->
          <div class="cv-contact-bar">
            <span class="cv-contact-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Johannesburg, South Africa
            </span>
            <a href="tel:0628584953" class="cv-contact-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"/></svg>
              062 858 4953
            </a>
            <a href="mailto:business.molebogeng@gmail.com" class="cv-contact-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              business.molebogeng@gmail.com
            </a>
          </div>

          <!-- Professional Summary -->
          <div class="cv-summary-card">
            <p><strong>Resourceful and continuous-learning Junior Developer</strong> with a strong focus on building robust applications and optimizing technical environments. Proficient in Python, Java, C, and SQL. A self-starter with a proven ability to independently troubleshoot systems and a demonstrated track record of strong communication and project management through digital content creation.</p>
          </div>

          <!-- Technical Skills Grid -->
          <div class="cv-section-title">// TECHNICAL SKILLS</div>
          <div class="cv-skills-grid">
            <div class="cv-skill-category emerald">
              <h6>PROGRAMMING LANGUAGES</h6>
              <div class="cv-skill-tags">
                <span class="cv-skill-tag">Python</span>
                <span class="cv-skill-tag">Java</span>
                <span class="cv-skill-tag">C</span>
                <span class="cv-skill-tag">SQL</span>
              </div>
            </div>
            <div class="cv-skill-category emerald">
              <h6>OPERATING SYSTEMS</h6>
              <div class="cv-skill-tags">
                <span class="cv-skill-tag">Linux Mint (XFCE)</span>
                <span class="cv-skill-tag">Windows</span>
              </div>
            </div>
            <div class="cv-skill-category emerald">
              <h6>TOOLS & METHODOLOGIES</h6>
              <div class="cv-skill-tags">
                <span class="cv-skill-tag">Git</span>
                <span class="cv-skill-tag">GitHub</span>
                <span class="cv-skill-tag">OOP</span>
              </div>
            </div>
          </div>

          <!-- Education -->
          <div class="cv-section-title">// EDUCATION</div>
          <div class="cv-entry-card">
            <div class="cv-entry-header">
              <span class="cv-entry-title">NQF Level 6 Occupational Certificate in Software Engineering</span>
              <span class="cv-entry-meta">December 2026 (Expected)</span>
            </div>
            <div class="cv-entry-subtitle">WeThinkCode_</div>
            <ul>
              <li>Comprehensive software engineering curriculum covering core algorithms, system design, testing, and modern development standards.</li>
              <li>Actively preparing for cloud certifications in AWS Certified AI Practitioner and AWS Certified Data Engineering.</li>
            </ul>
          </div>
          <div class="cv-entry-card">
            <div class="cv-entry-header">
              <span class="cv-entry-title">National Senior Certificate / NQF Level 4</span>
              <span class="cv-entry-meta">November 2016</span>
            </div>
            <div class="cv-entry-subtitle">William Hills Secondary School</div>
          </div>

          <!-- Experience -->
          <div class="cv-section-title">// EXPERIENCE & PROFESSIONAL DEVELOPMENT</div>
          <div class="cv-entry-card">
            <div class="cv-entry-header">
              <span class="cv-entry-title">Development Environment Optimization</span>
              <span class="cv-entry-meta">Independent Project</span>
            </div>
            <div class="cv-entry-subtitle">System Administration & Performance Tuning</div>
            <ul>
              <li>Transitioned primary development environment from Windows 10 to Linux Mint XFCE on a Proline machine to establish a lightweight, developer-centric workspace.</li>
              <li>Navigated OS installation, partition management, and software configuration, demonstrating adaptability and a strong curiosity for system administration.</li>
            </ul>
          </div>

          <div class="cv-entry-card">
            <div class="cv-entry-header">
              <span class="cv-entry-title">Podcast Host & Producer</span>
              <span class="cv-entry-meta">2026 – Present</span>
            </div>
            <div class="cv-entry-subtitle">Import Podcast</div>
            <ul>
              <li>Manage end-to-end production of a podcast, including structuring episodes, researching topics, and coordinating guest appearances (e.g., organizing and conducting a featured interview with Rody Preddy).</li>
              <li>Develop strong communication, interviewing, and planning skills, which directly translate to effective cross-functional collaboration and clear documentation in technical environments.</li>
            </ul>
          </div>

          <!-- Projects -->
          <div class="cv-section-title">// PROJECTS</div>
          <div class="cv-entry-card">
            <div class="cv-entry-header">
              <span class="cv-entry-title">Software Engineering Projects & Certifications</span>
              <span class="cv-entry-meta">Active Development</span>
            </div>
            <ul>
              <li><strong>iSgela (Flagship AI Platform):</strong> AI-powered African educational platform connecting teachers, students, and parents. Features Qwen2.5-VL-72B vision exam marking, facial recognition attendance, and automated WhatsApp parent notifications.</li>
              <li><strong>Portfolio Website:</strong> Interactive 3D planetary web application, orbital physics, starfield simulation, and AI model query terminal.</li>
              <li><strong>Koko Web App:</strong> Full-stack application currently in active development.</li>
              <li><strong>Certifications:</strong> Preparing for AWS AI Practitioner and AWS Data Engineering credentials.</li>
            </ul>
          </div>
        </div>
      `;
    }

    if (moon.id === 'about') {
      return `
        <div class="about-interactive-view">
          <!-- Direct Contact & Coordinates Bar -->
          <div class="cv-contact-bar">
            <span class="cv-contact-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Johannesburg, South Africa
            </span>
            <a href="tel:0628584953" class="cv-contact-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"/></svg>
              062 858 4953
            </a>
            <a href="mailto:business.molebogeng@gmail.com" class="cv-contact-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              business.molebogeng@gmail.com
            </a>
          </div>

          <!-- Professional Summary Lead -->
          <div class="cv-summary-card about-theme">
            <p><strong>Resourceful and continuous-learning Junior Developer</strong> with a strong focus on building robust applications and optimizing technical environments. Proficient in Python, Java, C, and SQL. A self-starter with a proven ability to independently troubleshoot systems and a demonstrated track record of strong communication and project management through digital content creation.</p>
          </div>

          <!-- Photo Showcase -->
          <div class="about-photo-showcase">
            <div class="about-photo-item">
              <img src="assets/images/photo5.jpg" alt="Molebogeng Selahle - Software Engineer" class="about-photo-img" />
              <span class="about-photo-label">// SOFTWARE ENGINEER @ BBD</span>
            </div>
            <div class="about-photo-item">
              <img src="assets/images/photo6.jpg" alt="BBD Engineering Team Collaboration" class="about-photo-img" />
              <span class="about-photo-label">// TEAM & COLLABORATION @ BBD</span>
            </div>
          </div>

          <!-- Technical Skills Grid -->
          <div class="cv-section-title">// TECHNICAL PROFICIENCIES</div>
          <div class="cv-skills-grid">
            <div class="cv-skill-category">
              <h6>PROGRAMMING LANGUAGES</h6>
              <div class="cv-skill-tags">
                <span class="cv-skill-tag">Python</span>
                <span class="cv-skill-tag">Java</span>
                <span class="cv-skill-tag">C</span>
                <span class="cv-skill-tag">SQL</span>
              </div>
            </div>
            <div class="cv-skill-category">
              <h6>OPERATING SYSTEMS</h6>
              <div class="cv-skill-tags">
                <span class="cv-skill-tag">Linux Mint (XFCE)</span>
                <span class="cv-skill-tag">Windows</span>
              </div>
            </div>
            <div class="cv-skill-category">
              <h6>TOOLS & METHODOLOGIES</h6>
              <div class="cv-skill-tags">
                <span class="cv-skill-tag">Git</span>
                <span class="cv-skill-tag">GitHub</span>
                <span class="cv-skill-tag">OOP</span>
              </div>
            </div>
          </div>

          <!-- Education & Academics -->
          <div class="cv-section-title">// ACADEMIC FOUNDATION & CERTIFICATIONS</div>
          <div class="cv-entry-card about-theme">
            <div class="cv-entry-header">
              <span class="cv-entry-title">NQF Level 6 Occupational Certificate in Software Engineering</span>
              <span class="cv-entry-meta">December 2026 (Expected)</span>
            </div>
            <div class="cv-entry-subtitle">WeThinkCode_</div>
            <ul>
              <li>Rigorous hands-on software engineering curriculum emphasizing peer-led problem solving, algorithmic thinking, and industry-grade application delivery.</li>
              <li>Currently studying for industry certifications including AWS Certified AI Practitioner and AWS Certified Data Engineering.</li>
            </ul>
          </div>
          <div class="cv-entry-card about-theme">
            <div class="cv-entry-header">
              <span class="cv-entry-title">National Senior Certificate / NQF Level 4</span>
              <span class="cv-entry-meta">November 2016</span>
            </div>
            <div class="cv-entry-subtitle">William Hills Secondary School</div>
          </div>

          <!-- Experience & Projects -->
          <div class="cv-section-title">// EXPERIENCE & PROFESSIONAL INITIATIVES</div>
          <div class="cv-entry-card about-theme">
            <div class="cv-entry-header">
              <span class="cv-entry-title">Development Environment Optimization</span>
              <span class="cv-entry-meta">Independent Project</span>
            </div>
            <div class="cv-entry-subtitle">System Administration & Performance Tuning</div>
            <ul>
              <li>Transitioned primary development environment from Windows 10 to Linux Mint XFCE on a Proline machine to establish a lightweight, developer-centric workspace.</li>
              <li>Navigated OS installation, partition management, and software configuration, demonstrating adaptability and a strong curiosity for system administration.</li>
            </ul>
          </div>

          <div class="cv-entry-card about-theme">
            <div class="cv-entry-header">
              <span class="cv-entry-title">Podcast Host & Producer</span>
              <span class="cv-entry-meta">2026 – Present</span>
            </div>
            <div class="cv-entry-subtitle">Import Podcast</div>
            <ul>
              <li>Manage end-to-end production of a podcast, including structuring episodes, researching topics, and coordinating guest appearances (e.g., organizing and conducting a featured interview with Rody Preddy).</li>
              <li>Develop strong communication, interviewing, and planning skills, which directly translate to effective cross-functional collaboration and clear documentation in technical environments.</li>
            </ul>
          </div>

          <div class="cv-entry-card about-theme">
            <div class="cv-entry-header">
              <span class="cv-entry-title">Active Projects</span>
              <span class="cv-entry-meta">In Progress</span>
            </div>
            <div class="cv-entry-subtitle">Software Engineering Portfolio</div>
            <ul>
              <li><strong>iSgela (Flagship Platform):</strong> AI-powered African educational platform connecting teachers, students, and parents with automated Qwen2.5-VL vision paper marking, facial recognition attendance, and WhatsApp notifications.</li>
              <li><strong>Portfolio Website & Ecosystem:</strong> Interactive 3D planetary web application with real-time starfield, orbital physics, and AI model query terminal.</li>
              <li><strong>Koko Web App:</strong> Full-stack web application in active development.</li>
            </ul>
          </div>

          <!-- Download Action Bar -->
          <div class="cv-actions-row">
            <a href="assets/Molebogeng_Selahle_Developer_CV.pdf" download="Molebogeng_Selahle_Developer_CV.pdf" class="cv-download-btn-primary">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              <span>Download Official CV (PDF)</span>
            </a>
            <a href="https://github.com/Molebogeng-Dev" target="_blank" rel="noopener noreferrer" class="cv-link-btn">
              <span>GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/molebogeng-selahle-755b30385?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" class="cv-link-btn">
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      `;
    }

    return `
      <div class="projects-interactive-view">
        <!-- FLAGSHIP MAIN PROJECT: iSgela -->
        <div class="project-flagship-card">
          <div class="project-flagship-badge-row">
            <span class="project-flagship-badge">★ MAIN FIRST PROJECT // AI EDTECH PLATFORM</span>
            <span class="project-status-live">● SPRINT-TESTED MVP // PRODUCTION ARCHITECTURE</span>
          </div>

          <div class="project-header-row">
            <div>
              <h3 class="project-title-large">iSgela</h3>
              <p class="project-subtitle-lead">An AI-powered platform connecting African teachers, students, parents, and schools &mdash; cutting the time teachers spend on marking and admin so they can spend more time teaching and guiding individual students.</p>
            </div>
            <a href="https://drive.google.com/drive/folders/1c41sGxElKAoTiBrScDdJomVik2KhYzmR" target="_blank" rel="noopener noreferrer" class="project-demo-link-btn" title="Watch iSgela Walkthrough & Demo Video">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <span>Watch Demo Video</span>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"/></svg>
            </a>
          </div>

          <!-- Problem & Solution Overview -->
          <div class="project-problem-solution-box">
            <div class="problem-col">
              <h6>THE PROBLEM</h6>
              <p>Africa's education system has a profound connection problem: parents work long hours and are disconnected from student progress; teachers are bogged down by manual marking and lack time to diagnose why a student falls behind; and quiet students who struggle slip through unnoticed.</p>
            </div>
            <div class="solution-col">
              <h6>THE SOLUTION</h6>
              <p><strong>iSgela</strong> closes these gaps by putting teachers, students, and parents into one automated connected loop. A marked paper, a missed assignment, or an absence surfaces immediately to the people who need to know &mdash; automatically and affordably.</p>
            </div>
          </div>

          <!-- Core Capability Matrix -->
          <div class="project-features-grid">
            <div class="project-feature-card">
              <div class="feature-icon-title">
                <span class="feature-icon">📸</span>
                <h6>Scan & Mark AI Engine</h6>
              </div>
              <p>Teachers or learners photograph exam papers or homework. <strong>Qwen2.5-VL-72B-Instruct</strong> marks against the memorandum, explains <em>why</em> answers are wrong, and generates remedial guidance.</p>
            </div>

            <div class="project-feature-card">
              <div class="feature-icon-title">
                <span class="feature-icon">👤</span>
                <h6>Dual-Tier Attendance</h6>
              </div>
              <p>Primary (Grades 1–7) use rapid digital roll-call; Secondary (Grades 8–12) check in per-period via single-frame <strong>face-api.js</strong> facial recognition (128-d euclidean match server-side, 0 reference photos stored).</p>
            </div>

            <div class="project-feature-card">
              <div class="feature-icon-title">
                <span class="feature-icon">🌐</span>
                <h6>Three Connected Portals</h6>
              </div>
              <p>Role-scoped dashboards for Teachers, Students, and Parents. Strictly segregated by <code>core.School</code> multi-tenant boundaries with atomic invite codes and shared student/parent join codes.</p>
            </div>

            <div class="project-feature-card">
              <div class="feature-icon-title">
                <span class="feature-icon">📲</span>
                <h6>Parent WhatsApp Notifications</h6>
              </div>
              <p>Automated plain-language notification summaries synthesized via OpenRouter text model and dispatched immediately over <strong>Twilio WhatsApp Sandbox</strong> when papers are marked, with deduplication guards.</p>
            </div>

            <div class="project-feature-card">
              <div class="feature-icon-title">
                <span class="feature-icon">📊</span>
                <h6>Transparent Progress Dashboard</h6>
              </div>
              <p>Whole-school analytics highlighting students who need attention based on strict, deterministic rule thresholds (marks &lt;50%, attendance &lt;80%, 2+ missed assignments) &mdash; 0% black-box AI bias.</p>
            </div>

            <div class="project-feature-card">
              <div class="feature-icon-title">
                <span class="feature-icon">⚡</span>
                <h6>Extreme Sub-Cent Cost Engineering</h6>
              </div>
              <p>Built on open-weight Apache 2.0 AI rather than closed APIs. Costs <strong>&lt;$0.001 per marked paper</strong> (~$10/mo for 10,000 papers), with a clear roadmap to self-host at zero marginal cost for national public schools.</p>
            </div>
          </div>

          <!-- Tech Stack Matrix -->
          <div class="project-tech-header">// TECH STACK & DEPLOYMENT ARCHITECTURE</div>
          <div class="tech-tags flagship-tags">
            <span class="tag">Django 5</span>
            <span class="tag">Django REST Framework</span>
            <span class="tag">Supabase (PostgreSQL & Storage)</span>
            <span class="tag">Qwen2.5-VL-72B-Instruct</span>
            <span class="tag">OpenRouter API</span>
            <span class="tag">face-api.js (128-d Biometrics)</span>
            <span class="tag">Twilio WhatsApp Sandbox</span>
            <span class="tag">Docker Multi-Stage</span>
            <span class="tag">Gunicorn (180s Timeout)</span>
            <span class="tag">WhiteNoise</span>
            <span class="tag">GitHub Actions CI/CD</span>
            <span class="tag">Render Deployment</span>
          </div>
        </div>

        <!-- PROJECT 2: Cosmic 3D Web Profile -->
        <div class="projects-card-preview" style="margin-top: 1.35rem;">
          <div class="project-mini-header">
            <h4>Cosmic 3D Web Profile & Ecosystem</h4>
            <span class="project-mini-tag">Active Live System</span>
          </div>
          <p>Full 3D WebGL rotating planetary profile featuring real-time starfield gravitational simulation, supernova physics, 3D satellite orbital mechanics, and integrated AI neural query terminal.</p>
          <div class="tech-tags">
            <span class="tag">Java</span>
            <span class="tag">Spring Boot 3</span>
            <span class="tag">WebGL</span>
            <span class="tag">JavaScript (ES6+)</span>
            <span class="tag">CSS3 3D</span>
          </div>
        </div>

        <!-- PROJECT 3: Koko Web App -->
        <div class="projects-card-preview" style="margin-top: 1rem;">
          <div class="project-mini-header">
            <h4>Koko Web App</h4>
            <span class="project-mini-tag">In Active Development</span>
          </div>
          <p>Full-stack web application focusing on a lightweight, developer-centric architecture and clean user experience.</p>
          <div class="tech-tags">
            <span class="tag">Python</span>
            <span class="tag">Java</span>
            <span class="tag">SQL</span>
            <span class="tag">Web Development</span>
          </div>
        </div>

        <!-- PROJECT 4: Cloud Engineering & Certifications -->
        <div class="projects-card-preview" style="margin-top: 1rem;">
          <div class="project-mini-header">
            <h4>Cloud Certifications & AI Studies</h4>
            <span class="project-mini-tag">Ongoing Preparation</span>
          </div>
          <p>Actively preparing for cloud credentials to architect resilient, AI-powered distributed cloud pipelines.</p>
          <div class="tech-tags">
            <span class="tag">AWS AI Practitioner</span>
            <span class="tag">AWS Data Engineering</span>
            <span class="tag">Distributed Cloud Systems</span>
          </div>
        </div>
      </div>
    `;
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.orbitSystem = new CosmicOrbitSystem('orbital-system', 'cosmic-modal');
});

