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

    if (q.includes('tech') || q.includes('stack') || q.includes('language') || q.includes('skill') || q.includes('tool')) {
      return `Molebogeng's technical skills and proficiencies:

• Programming Languages: Python, Java, C, SQL
• Operating Systems: Linux Mint (XFCE), Windows
• Tools & Methodologies: Git, GitHub, Object-Oriented Programming (OOP)
• Web & Graphics: Full-Stack Web Development, Spring Boot, WebGL 3D, CSS3 Transforms
• Cloud Certifications in Progress: AWS Certified AI Practitioner, AWS Certified Data Engineering

All projects emphasize clean architecture, robust system configuration, and continuous learning.`;
    }

    if (q.includes('background') || q.includes('about') || q.includes('who') || q.includes('education') || q.includes('school') || q.includes('wethinkcode')) {
      return `Molebogeng Lehlogonolo Selahle is a resourceful and continuous-learning Junior Developer based in Johannesburg, South Africa.

• Education: NQF Level 6 Occupational Certificate in Software Engineering at WeThinkCode_ (Expected December 2026); National Senior Certificate from William Hills Secondary School (2016).
• Technical Mindset: A self-starter with proven capability to independently troubleshoot systems, optimize lightweight developer workspaces (Linux Mint on Proline hardware), and build robust software.
• Digital Content & Communication: Host & Producer of 'Import Podcast' (2026 – Present), conducting guest appearances including an interview with Rody Preddy.`;
    }

    if (q.includes('isgela') || q.includes('sgela') || q.includes('marking') || q.includes('attendance') || q.includes('vision') || q.includes('qwen')) {
      return `iSgela is Molebogeng's flagship AI educational platform connecting African teachers, students, parents, and schools:

• Scan & Mark AI Engine: Open-weight Qwen2.5-VL-72B-Instruct vision model marks papers against memorandums, explains why answers were wrong, and suggests remedial exercises (<$0.001 per paper economics).
• Dual-Tier Attendance: Digital roll-call for primary learners (Grades 1–7) and single-frame facial recognition (face-api.js server-side 128-d matching, 0 stored photos) for secondary learners (Grades 8–12).
• Three Connected Portals: Multi-tenant dashboards for Teachers, Students, and Parents scoped strictly by school boundaries (core.School).
• Parent WhatsApp Notifications: Automated plain-language exam summaries synthesized by OpenRouter and sent via Twilio WhatsApp sandbox.
• Transparent Progress Dashboard: Whole-school analytics flagging learners who need attention based on rule thresholds (<50% marks, <80% attendance, 2+ missed assignments) with 0% AI bias.
• Tech Stack: Django 5, DRF, Supabase (Postgres & Storage), OpenRouter, Docker, Render, and GitHub Actions CI/CD.

Click the orbiting 'Projects & Apps' satellite to explore the full breakdown and watch the walkthrough demo video!`;
    }

    if (q.includes('project') || q.includes('built') || q.includes('app') || q.includes('koko') || q.includes('work')) {
      return `Key software engineering initiatives in Molebogeng's portfolio:

1. iSgela (Main Flagship Project): AI-powered African educational platform uniting teachers, students, and parents with automated Qwen2.5-VL paper marking, facial recognition attendance, and WhatsApp alerts.
2. Cosmic 3D Portfolio Website: Interactive 3D planetary web application featuring real-time starfield gravity physics, collision-avoiding satellite orbits, and an AI model query interface.
3. Koko Web App: Full-stack web application currently in active development.
4. Development Environment Optimization: Transitioned primary development environment to Linux Mint XFCE on Proline hardware with partition and OS tuning.
5. Cloud Credentials: In active preparation for AWS AI Practitioner and AWS Data Engineering certifications.`;
    }

    if (q.includes('podcast') || q.includes('import') || q.includes('rody')) {
      return `Molebogeng is the Host & Producer of 'Import Podcast' (2026 – Present):

• Manages end-to-end production including episode planning, topic research, and guest coordination.
• Featured interview conducted with industry guest Rody Preddy.
• Develops strong communication, interviewing, and planning skills that translate to effective engineering collaboration and technical documentation.`;
    }

    if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('phone') || q.includes('reach') || q.includes('connect')) {
    if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('phone') || q.includes('reach') || q.includes('connect') || q.includes('gmail')) {
      return `You can connect directly with Molebogeng Lehlogonolo Selahle:

• Email: business.molebogeng@gmail.com
• Phone: 062 858 4953
• Location: Johannesburg, South Africa
• Phone: 062 858 4953
• Email: business.molebogeng@gmail.com
• LinkedIn: linkedin.com/in/molebogeng-selahle-755b30385
• GitHub: github.com/Molebogeng-Dev
• TikTok: @import_podcast
• YouTube: @import_podcast

You can also download the official CV PDF directly from the Developer CV or About Me satellite modal!`;
★ Direct Email Satellite: Tap the red orbiting Gmail satellite around the Earth planet to compose an email directly in Gmail Web, launch your default email client, or send a transmission through the in-browser terminal!`;
    }

    // Default intelligent response
    return `Thank you for your query about "${query}".

Molebogeng Lehlogonolo Selahle is a Junior Developer and Software Engineering candidate at WeThinkCode_ proficient in Python, Java, C, SQL, and Linux Mint XFCE.

You can ask anything about:
• "What is your tech stack?"
• "Tell me about your background and education"
• "What projects are you working on?"
• "Tell me about the Import Podcast"
• "How can I contact or hire you?"`;
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

