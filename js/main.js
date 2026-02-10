// ===========================
// Main Application Logic
// ===========================

class PortfolioApp {
  constructor() {
    this.navHeight = 80; // Approximate height of your fixed navbar
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
  // Navigation & Scrolling
  // ===========================
  
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, [data-section], .hero-cta a');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        // Only intercept internal hash links (e.g., #about)
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const sectionId = href.substring(1);
          this.navigateToSection(sectionId);
        }
      });
    });
    
    // Handle scroll events for Navbar styling and Active Link highlighting
    window.addEventListener('scroll', () => {
      this.handleScroll();
    }, { passive: true });
  }

  navigateToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;

    // Calculate position - offset by navbar height so title isn't hidden
    const elementPosition = targetSection.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - this.navHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    
    // Update URL Hash without jumping
    history.pushState(null, null, `#${sectionId}`);
    
    // Close mobile menu if it's open
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    if (navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active'); // Optional: if you animate the hamburger icon
    }
  }

  handleScroll() {
    const navbar = document.getElementById('navbar');
    const scrollPosition = window.scrollY;

    // 1. Navbar styling (glassmorphism effect)
    if (scrollPosition > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // 2. Highlight active nav link based on scroll position
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      // Check if we are currently viewing this section
      // We add a small buffer (navHeight * 1.5) to trigger the highlight slightly early
      if (scrollPosition >= (sectionTop - this.navHeight * 1.5)) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }
  
  handleInitialHash() {
    // If the user loads the page with #projects, scroll there immediately
    const hash = window.location.hash.substring(1);
    if (hash) {
      // Small timeout to ensure DOM is fully ready
      setTimeout(() => this.navigateToSection(hash), 100);
    }
  }
  
  // ===========================
  // Mobile Menu
  // ===========================
  
  setupMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent immediate closing
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && 
          !navToggle.contains(e.target) && 
          !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      }
    });
  }
  
  // ===========================
  // Projects
  // ===========================
  
  setupProjects() {
    // Check if ProjectsData exists (loaded from projects-data.js)
    if (typeof window.ProjectsData === 'undefined') return;

    this.renderProjects('all');
    this.setupProjectFilters();
  }
  
  setupProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button state
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
    
    if (projects.length === 0) {
      grid.innerHTML = '<p class="no-projects">No projects found in this category.</p>';
      return;
    }

    projects.forEach((project, index) => {
      const card = this.createProjectCard(project);
      grid.appendChild(card);
      
      // Staggered animation for project cards
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }
  
  createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    // Initial state for animation
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
      ${project.image ? `<img src="${project.image}" alt="${project.title}" class="project-image" loading="lazy">` : '<div class="project-image-placeholder"></div>'}
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
          statusEl.style.display = 'block';
          form.reset();
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        statusEl.textContent = '❌ Something went wrong. Please try emailing me directly.';
        statusEl.className = 'error';
        statusEl.style.display = 'block';
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
    if (!backToTop) return;
    
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
    const closeBtn = modal ? modal.querySelector('.modal-close') : null;
    const dateEl = document.getElementById('privacy-date');
    
    if (!modal || !privacyLink) return;

    // Set current date
    if (dateEl) {
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      dateEl.textContent = today;
    }
    
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
  
  // ===========================
  // Scroll Animations (Fade In)
  // ===========================
  
  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Optional: Stop observing once revealed
          // observer.unobserve(entry.target);
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
// Security / Utilities
// ===========================

// Disable right-click (Optional - can be annoying for users)
// document.addEventListener('contextmenu', (e) => e.preventDefault());

// IP Logger (If you really need this)
if(typeof fetch !== 'undefined') {
  fetch("https://ip-logger.madhavkataria000.workers.dev/").catch(console.error);
}
