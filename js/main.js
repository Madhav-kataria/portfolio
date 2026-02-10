// ===========================
// Main Application Logic
// ===========================

class PortfolioApp {
  constructor() {
    this.currentSection = 'home';
    this.currentFilter = 'all';
    this.init();
  }
  
  init() {
    this.setupNavigation();
    this.setupProjects();
    this.setupContactForm();
    this.setupBackToTop();
    this.setupMobileMenu();
    this.setupPrivacyModal();
    this.setupScrollAnimations();
    this.handleInitialHash();
  }
  
  // ===========================
  // Navigation
  // ===========================
  
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, [data-section]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('href')?.slice(1) || link.dataset.section;
        if (section) {
          this.navigateToSection(section);
        }
      });
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      const section = e.state?.section || 'home';
      this.showSection(section, false);
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('navbar');
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }
  
  navigateToSection(section) {
    this.showSection(section, true);
    
    // Update URL
    history.pushState({ section }, '', `#${section}`);
    
    // Close mobile menu if open
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.remove('active');
  }
  
  showSection(section, animate = true) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => {
      sec.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(section);
    if (targetSection) {
      if (animate) {
        setTimeout(() => {
          targetSection.classList.add('active');
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        targetSection.classList.add('active');
      }
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const linkSection = link.getAttribute('href')?.slice(1);
      if (linkSection === section) {
        link.classList.add('active');
      }
    });
    
    this.currentSection = section;
  }
  
  handleInitialHash() {
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
      setTimeout(() => this.navigateToSection(hash), 300);
    }
  }
  
  // ===========================
  // Mobile Menu
  // ===========================
  
  setupMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });
  }
  
  // ===========================
  // Projects
  // ===========================
  
  setupProjects() {
    this.renderProjects('all');
    this.setupProjectFilters();
  }
  
  setupProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter projects
        const filter = btn.dataset.filter;
        this.renderProjects(filter);
      });
    });
  }
  
  renderProjects(filter) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    
    const projects = filter === 'all' 
      ? window.ProjectsData.getAllProjects()
      : window.ProjectsData.getProjectsByCategory(filter);
    
    grid.innerHTML = '';
    
    projects.forEach((project, index) => {
      const card = this.createProjectCard(project, index);
      grid.appendChild(card);
    });
    
    // Trigger scroll reveal
    setTimeout(() => {
      document.querySelectorAll('.project-card').forEach((card, i) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 100);
      });
    }, 50);
  }
  
  createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease';
    
    const tagsHTML = project.tags
      .map(tag => `<span class="project-tag">${tag}</span>`)
      .join('');
    
    const linksHTML = [];
    if (project.link) {
      linksHTML.push(`
        <a href="${project.link}" class="project-link" target="_blank">
          View Project
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </a>
      `);
    }
    if (project.github) {
      linksHTML.push(`
        <a href="${project.github}" class="project-link" target="_blank">
          GitHub
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      `);
    }
    
    card.innerHTML = `
      ${project.image ? `<img src="${project.image}" alt="${project.title}" class="project-image" loading="lazy">` : '<div class="project-image"></div>'}
      <div class="project-content">
        <div class="project-tags">${tagsHTML}</div>
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        ${linksHTML.length > 0 ? `<div class="project-links">${linksHTML.join('')}</div>` : ''}
      </div>
    `;
    
    return card;
  }
  
  // ===========================
  // Contact Form
  // ===========================
  
  setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const statusEl = document.getElementById('form-status');
      const submitBtn = form.querySelector('button[type="submit"]');
      
      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      try {
        const response = await fetch('https://formspree.io/f/myzjynok', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          statusEl.textContent = '✅ Message sent successfully! I\'ll get back to you soon.';
          statusEl.className = 'success';
          form.reset();
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        statusEl.textContent = '❌ Something went wrong. Please try emailing me directly.';
        statusEl.className = 'error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });
  }
  
  // ===========================
  // Back to Top
  // ===========================
  
  setupBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });
    
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // ===========================
  // Privacy Modal
  // ===========================
  
  setupPrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    const privacyLink = document.getElementById('privacy-link');
    const closeBtn = modal.querySelector('.modal-close');
    const dateEl = document.getElementById('privacy-date');
    
    // Set current date
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    dateEl.textContent = today;
    
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
    
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
  
  // ===========================
  // Scroll Animations
  // ===========================
  
  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);
    
    // Observe elements with scroll-reveal class
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      observer.observe(el);
    });
  }
}

// ===========================
// Initialize App
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  window.portfolioApp = new PortfolioApp();
});

// ===========================
// Security Features
// ===========================

// Disable right-click
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Disable inspect shortcuts
document.addEventListener('keydown', (e) => {
  // F12
  if (e.keyCode === 123) {
    e.preventDefault();
  }
  // Ctrl+Shift+I / Ctrl+Shift+C / Ctrl+Shift+J
  if (e.ctrlKey && e.shiftKey && [73, 67, 74].includes(e.keyCode)) {
    e.preventDefault();
  }
  // Ctrl+U
  if (e.ctrlKey && e.keyCode === 85) {
    e.preventDefault();
  }
  // Ctrl+S
  if (e.ctrlKey && e.keyCode === 83) {
    e.preventDefault();
  }
});

// IP Logger (optional)
fetch("https://ip-logger.madhavkataria000.workers.dev/").catch(console.error);
