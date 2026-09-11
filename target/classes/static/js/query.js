/**
 * AI MODEL QUERY TERMINAL & MODAL CONTROLLER
 * - Manages interactive model query input below the planet & satellites
 * - Pops up AI response modal with synthesized model answers
 * - Clean extensibility hook to plug in real backend API / Gemini / OpenAI endpoints later
 * - Mobile friendly & accessible
 */

class CosmicQueryTerminal {
  constructor() {
    // Form & Input elements
    this.form = document.getElementById('query-form');
    this.input = document.getElementById('query-input');
    this.suggestions = document.getElementById('query-suggestions');

    // Modal elements
    this.modal = document.getElementById('ai-response-modal');
    this.modalBackdrop = document.getElementById('ai-modal-backdrop');
    this.modalCloseBtn = document.getElementById('ai-modal-close-btn');
    this.modalUserQuery = document.getElementById('ai-modal-user-query');
    this.modalContent = document.getElementById('ai-modal-response-content');
    this.modalStatus = document.getElementById('ai-status-text');

    this.isSynthesizing = false;
    this.typingInterval = null;

    this.init();
  }

  init() {
    if (!this.form || !this.input || !this.modal) return;

    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = this.input.value.trim();
      if (query) {
        this.submitQuery(query);
      }
    });

    // Suggestion chips
    if (this.suggestions) {
      this.suggestions.addEventListener('click', (e) => {
        const chip = e.target.closest('.suggestion-chip');
        if (chip) {
          const query = chip.getAttribute('data-query') || chip.innerText.replace('✦', '').trim();
          this.input.value = query;
          this.submitQuery(query);
        }
      });
    }

    // Modal Close events
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', () => this.closeModal());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  submitQuery(query) {
    // Open modal
    this.openModal(query);

    // Trigger response synthesis (placeholder logic ready for your real backend API hook)
    this.processModelQuery(query);
  }

  openModal(query) {
    if (this.modalUserQuery) {
      this.modalUserQuery.textContent = `"${query}"`;
    }

    if (this.modalContent) {
      this.modalContent.innerHTML = '';
    }

    if (this.modalStatus) {
      this.modalStatus.textContent = 'SYNTHESIZING MODEL RESPONSE...';
    }

    this.modal.classList.add('active');
    document.body.classList.add('modal-open');

    // Pause orbital motion while modal is open for zero distractions
    if (window.orbitSystem) {
      window.orbitSystem.isPaused = true;
    }
  }

  closeModal() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }

    this.modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    this.isSynthesizing = false;

    // Resume orbital motion
    if (window.orbitSystem) {
      window.orbitSystem.isPaused = false;
    }
  }

  /**
   * BACKEND API EXTENSION HOOK:
   * You can replace this simulated response generator with your real backend call:
   * e.g.
   *   const res = await fetch('/api/query', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({ prompt: query })
   *   });
   *   const data = await res.json();
   */
  async processModelQuery(query) {
    this.isSynthesizing = true;

    // Simulate subtle neural latency
    await new Promise((r) => setTimeout(r, 450));

    const responseText = this.generateModelResponse(query);
    this.streamTextResponse(responseText);
  }

  generateModelResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('tech') || q.includes('stack') || q.includes('language') || q.includes('framework')) {
      return `Molebogeng's primary technology stack centers around high-performance full-stack and distributed cloud systems:

• Backend: Java 21, Spring Boot 3, Spring Security, Hibernate/JPA, RESTful Microservices
• Frontend & Visuals: WebGL, CSS3 3D transforms, Canvas API, JavaScript (ES6+), React
• Data & Persistence: PostgreSQL, BigQuery, Relational Database Modeling
• Cloud & DevOps: Docker, Containerization, Git, CI/CD Pipeline Automation

All architectures are developed with high standards of clean code, testability, and resilience.`;
    }

    if (q.includes('background') || q.includes('about') || q.includes('who') || q.includes('experience')) {
      return `Molebogeng Lehlogonolo Selahle is a forward-thinking software engineer and system architect passionate about marrying resilient backend microservices with cutting-edge 3D interactive web experiences.

With a strong foundation in Spring Boot, distributed cloud backends, and creative WebGL development, Molebogeng focuses on building scalable digital platforms that push technological boundaries.`;
    }

    if (q.includes('project') || q.includes('built') || q.includes('app') || q.includes('work')) {
      return `Key projects in Molebogeng's portfolio include:

1. Cosmic 3D Web Profile: A full 3D WebGL spherical planetary interface with real-time starfield gravity physics, collision-avoiding satellite orbits, and modular micro-modals.
2. Enterprise Spring Boot Services: Resilient, scalable REST microservices engineered with clean architecture, robust security, and cloud scalability.
3. Interactive Portfolio Applications: High-performance web tools and creative engineering experiments.

Click on the orbiting "Projects & Apps" satellite to inspect detailed interactive previews.`;
    }

    if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('reach') || q.includes('connect')) {
      return `You can connect with Molebogeng through several cosmic channels:

• LinkedIn: Click the orbiting blue LinkedIn dish ball to view professional endorsements.
• GitHub: Explore open-source codebases and algorithms via the GitHub satellite.
• CV Resume: View and download the software engineering resume via the CV satellite.
• Direct: Drop a message or inquiry directly to start an exciting collaboration!`;
    }

    // Default intelligent response
    return `Thank you for your query about "${query}".

Molebogeng Lehlogonolo Selahle is a Software Engineer specializing in Spring Boot 3, Java 21, WebGL 3D interactive graphics, and distributed systems.

You can explore specific domains by querying:
• "What is your tech stack?"
• "Tell me about your background"
• "What projects have you built?"
• "How can I contact you?"

(Note: This neural query terminal is ready for direct connection to your live AI/LLM backend service!)`;
  }

  streamTextResponse(fullText) {
    if (!this.modalContent) return;

    if (this.modalStatus) {
      this.modalStatus.textContent = 'NEURAL SYNTHESIS COMPLETE // SYSTEM TRANSMISSION';
    }

    // Formatted markdown-like presentation
    const formattedHtml = fullText
      .replace(/\n\n/g, '</p><p class="ai-para">')
      .replace(/\n/g, '<br/>')
      .replace(/• (.*?)(<br\/>|<\/p>|$)/g, '<li class="ai-bullet">$1</li>');

    this.modalContent.innerHTML = `<div class="ai-response-body"><p class="ai-para">${formattedHtml}</p></div>`;
    this.isSynthesizing = false;
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.cosmicQueryTerminal = new CosmicQueryTerminal();
});

