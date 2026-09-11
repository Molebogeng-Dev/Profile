/**
 * FUTURISTIC ANIMATED TITLE CONTROLLER // "WELCOME TO MY WORLD"
 * - Cybernetic decryption text-scramble effect on load and hover
 * - Holographic gradient shimmer and ambient cosmic pulse
 * - Respects prefers-reduced-motion
 */

class FuturisticTitle {
  constructor(containerId = 'cosmic-title-container') {
    this.container = document.getElementById(containerId);
    this.titleElement = this.container ? this.container.querySelector('.title-text-glow') : null;
    this.targetText = "WELCOME TO MY WORLD";
    // Elegant celestial & smooth typographic glyph palette
    this.glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·•✦✧★✶*+-~/<>:";
    this.isDecoding = false;
    this.interval = null;

    if (this.titleElement) {
      this.init();
    }
  }

  init() {
    // Initial Cyber Decryption animation after starfield & planet initialize
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      setTimeout(() => {
        this.decodeText();
      }, 500);
    } else {
      this.titleElement.innerText = this.targetText;
    }

    // Interactive hover & tap triggers cyber re-scramble
    if (this.container) {
      this.container.addEventListener('pointerenter', () => {
        if (!this.isDecoding && !prefersReducedMotion) {
          this.decodeText();
        }
      });

      this.container.addEventListener('click', () => {
        if (!this.isDecoding && !prefersReducedMotion) {
          this.decodeText();
        }
      });
    }
  }

  /**
   * Scramble Decryption Animation:
   * Progressively resolves randomized cyber glyphs into the target string from left to right.
   */
  decodeText() {
    this.isDecoding = true;
    let iteration = 0;
    const maxIterations = this.targetText.length;
    const frameRate = 32; // ms per tick (~30fps)

    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.titleElement.innerText = this.targetText
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          if (index < iteration) {
            return this.targetText[index];
          }
          return this.glyphs[Math.floor(Math.random() * this.glyphs.length)];
        })
        .join("");

      if (iteration >= maxIterations) {
        clearInterval(this.interval);
        this.titleElement.innerText = this.targetText;
        this.isDecoding = false;
      }

      iteration += 1 / 2.8;
    }, frameRate);
  }
}

// Global initialization on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.futuristicTitle = new FuturisticTitle('cosmic-title-container');
});

