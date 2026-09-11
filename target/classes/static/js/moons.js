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
        subtitle: 'Professional Profile & Network',
        accentColor: '#0A66C2',
        url: 'https://www.linkedin.com',
        description: 'Connect with me professionally, view endorsements, career history, and industry network.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V9.92H5.06v8.58h2.8z"/></svg>`,
        size: 46
      },
      {
        id: 'github',
        title: 'GitHub',
        subtitle: 'Open Source Code & Repositories',
        accentColor: '#8957E5',
        url: 'https://github.com',
        description: 'Browse open-source contributions, repositories, algorithms, system architectures, and commits.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>`,
        size: 46
      },
      {
        id: 'tiktok',
        title: 'TikTok',
        subtitle: 'Short-Form Code & Tech Clips',
        accentColor: '#FE2C55',
        url: 'https://www.tiktok.com',
        description: 'Watch quick programming tips, developer humor, technology breakdowns, and coding shorts.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
        size: 44
      },
      {
        id: 'youtube',
        title: 'YouTube',
        subtitle: 'Video Content & Tutorials',
        accentColor: '#FF0000',
        url: 'https://youtube.com',
        description: 'Watch video presentations, coding tutorials, live architecture walkthroughs, and developer tech talks.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/></svg>`,
        size: 44
      },
      {
        id: 'cv',
        title: 'Developer CV',
        subtitle: 'Curriculum Vitae & Qualifications',
        accentColor: '#10B981',
        url: '#cv-preview',
        description: 'Comprehensive software engineering resume, certifications, tech stack proficiencies, and work history.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 12h8v2H8v-2zm0 4h5v2H8v-2z"/></svg>`,
        size: 46
      },
      {
        id: 'about',
        title: 'About Me',
        subtitle: 'Biography & Engineering Philosophy',
        accentColor: '#FFD700',
        url: '#about-preview',
        description: 'Discover my background, engineering philosophy, passion for distributed systems, and cosmic web design.',
        iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z"/></svg>`,
        size: 44
      },
      {
        id: 'projects',
        title: 'Projects & Apps',
        subtitle: 'Interactive Software Portfolio',
        accentColor: '#00E5FF',
        url: '#projects-preview',
        description: 'Explore live web applications, enterprise Spring Boot APIs, 3D WebGL interfaces, and microservices.',
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
      // Wrapper button element
      const el = document.createElement('button');
      el.className = 'satellite-moon';
      el.id = `moon-${moon.id}`;
      el.setAttribute('aria-label', `${moon.title}: ${moon.subtitle}`);
      el.title = `${moon.title} (Click to open)`;

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
        this.openModal(moon);
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
              <div class="iframe-container">
                <iframe 
                  src="${moon.url}" 
                  title="${moon.title} Embedded Feed" 
                  loading="lazy" 
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                ></iframe>
                <div class="iframe-fallback-overlay" style="display: none;">
                  <div class="fallback-icon">${moon.iconSvg}</div>
                  <h4>External Security Gateway Active</h4>
                  <p>${moon.title} limits cross-origin embedding within third-party frames. Click below to launch your profile directly.</p>
                  <a href="${moon.url}" target="_blank" rel="noopener noreferrer" class="cosmic-glow-btn">
                    Launch ${moon.title} Directly
                  </a>
                </div>
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
              <h4>Software Engineer & Cloud Architect</h4>
              <p class="cv-meta">Full-Stack // Spring Boot 3 // WebGL 3D // Distributed Cloud Systems</p>
            </div>
            <a href="assets/cv.pdf" download class="cv-download-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              <span>Download PDF</span>
            </a>
          </div>
          <div class="cv-sections-grid">
            <div class="cv-block">
              <h5>Core Competencies</h5>
              <ul>
                <li>Java 21, Spring Boot 3, REST APIs, Microservices</li>
                <li>WebGL, 3D Graphics, High-Performance Canvas Engines</li>
                <li>Cloud Native Architecture, Containerization, Docker</li>
                <li>PostgreSQL, BigQuery, Relational Database Modeling</li>
              </ul>
            </div>
            <div class="cv-block">
              <h5>Engineering Philosophy</h5>
              <p>Designing elegant, performant, and resilient full-stack systems with meticulous attention to clean architecture and user experience.</p>
            </div>
          </div>
        </div>
      `;
    }

    if (moon.id === 'about') {
      return `
        <div class="about-interactive-view">
          <div class="about-bio-lead">
            <p>Welcome to my cosmic profile. I specialize in crafting cutting-edge web applications that bridge high-performance backend systems with breathtaking visual engineering.</p>
          </div>
          <div class="stats-counter-grid">
            <div class="stat-box">
              <span class="stat-number">5+</span>
              <span class="stat-label">Years Experience</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">40+</span>
              <span class="stat-label">Projects Deployed</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">100%</span>
              <span class="stat-label">Clean Code Commitment</span>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="projects-interactive-view">
        <div class="projects-card-preview">
          <h4>Cosmic 3D Web Profile & Ecosystem</h4>
          <p>Full 3D WebGL rotating planetary profile featuring real-time starfield gravitational simulation, supernova physics, and 3D satellite orbital mechanics.</p>
          <div class="tech-tags">
            <span class="tag">Java 21</span>
            <span class="tag">Spring Boot 3</span>
            <span class="tag">WebGL</span>
            <span class="tag">CSS3 3D</span>
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

