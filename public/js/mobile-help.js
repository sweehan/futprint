// Mobile-friendly help system with collapsible sections

class MobileHelpManager {
  constructor() {
    this.isMobile = this.checkMobile();
    this.expandedSections = new Set();
    this.init();
  }

  init() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.initializeCollapsibleSections();
  }

  checkMobile() {
    return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = this.checkMobile();
    
    if (wasMobile !== this.isMobile) {
      this.updateHelpLayout();
    }
  }

  initializeCollapsibleSections() {
    const helpSections = document.querySelectorAll('.help-section');
    
    helpSections.forEach(section => {
      this.makeCollapsible(section);
    });
  }

  makeCollapsible(section) {
    const header = section.querySelector('.help-header');
    const content = section.querySelector('.help-content');
    const sectionId = section.getAttribute('data-help-id') || `help-${Date.now()}`;
    
    if (!header || !content) return;
    
    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'help-toggle';
    toggleButton.innerHTML = '<span class="help-toggle-icon">+</span>';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', sectionId);
    
    header.appendChild(toggleButton);
    content.id = sectionId;
    
    // Initially collapsed on mobile
    if (this.isMobile) {
      content.classList.add('help-collapsed');
    }
    
    // Add click handler
    toggleButton.addEventListener('click', () => {
      this.toggleSection(section, sectionId);
    });
    
    // Add keyboard support
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleSection(section, sectionId);
      }
    });
  }

  toggleSection(section, sectionId) {
    const content = section.querySelector('.help-content');
    const toggleButton = section.querySelector('.help-toggle');
    const icon = toggleButton.querySelector('.help-toggle-icon');
    
    const isExpanded = this.expandedSections.has(sectionId);
    
    if (isExpanded) {
      // Collapse
      content.classList.add('help-collapsed');
      toggleButton.setAttribute('aria-expanded', 'false');
      icon.textContent = '+';
      this.expandedSections.delete(sectionId);
    } else {
      // Expand
      content.classList.remove('help-collapsed');
      toggleButton.setAttribute('aria-expanded', 'true');
      icon.textContent = '−';
      this.expandedSections.add(sectionId);
      
      // Scroll into view on mobile
      if (this.isMobile) {
        setTimeout(() => {
          section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 300);
      }
    }
  }

  updateHelpLayout() {
    const helpSections = document.querySelectorAll('.help-section');
    
    helpSections.forEach(section => {
      const content = section.querySelector('.help-content');
      const toggleButton = section.querySelector('.help-toggle');
      
      if (this.isMobile) {
        // Mobile: keep collapsed state
        if (!this.expandedSections.has(section.id)) {
          content.classList.add('help-collapsed');
        }
        toggleButton.style.display = 'block';
      } else {
        // Desktop: show all content
        content.classList.remove('help-collapsed');
        toggleButton.style.display = 'none';
      }
    });
  }

  // Create expandable FAQ section
  createFAQSection(faqData) {
    const faqContainer = document.createElement('div');
    faqContainer.className = 'faq-container';
    
    const faqHTML = `
      <div class="faq-header">
        <h3>Frequently Asked Questions</h3>
      </div>
      <div class="faq-list">
        ${faqData.map((faq, index) => `
          <div class="faq-item help-section" data-help-id="faq-${index}">
            <div class="faq-question help-header">
              <h4>${faq.question}</h4>
            </div>
            <div class="faq-answer help-content">
              <p>${faq.answer}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    faqContainer.innerHTML = faqHTML;
    
    // Initialize collapsible behavior
    const faqItems = faqContainer.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      this.makeCollapsible(item);
    });
    
    return faqContainer;
  }

  // Create bottom sheet for mobile help
  createBottomSheet(content, options = {}) {
    const { 
      title = 'Help', 
      closeButton = true,
      swipeToClose = true 
    } = options;
    
    const bottomSheet = document.createElement('div');
    bottomSheet.className = 'bottom-sheet';
    bottomSheet.innerHTML = `
      <div class="bottom-sheet-backdrop"></div>
      <div class="bottom-sheet-content">
        <div class="bottom-sheet-header">
          <div class="bottom-sheet-handle"></div>
          <h3>${title}</h3>
          ${closeButton ? '<button class="bottom-sheet-close">&times;</button>' : ''}
        </div>
        <div class="bottom-sheet-body">
          ${content}
        </div>
      </div>
    `;
    
    document.body.appendChild(bottomSheet);
    
    // Add event listeners
    const backdrop = bottomSheet.querySelector('.bottom-sheet-backdrop');
    const closeBtn = bottomSheet.querySelector('.bottom-sheet-close');
    const sheetContent = bottomSheet.querySelector('.bottom-sheet-content');
    
    backdrop.addEventListener('click', () => this.hideBottomSheet(bottomSheet));
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideBottomSheet(bottomSheet));
    }
    
    // Swipe to close functionality
    if (swipeToClose) {
      this.addSwipeToClose(bottomSheet, sheetContent);
    }
    
    // Show with animation
    requestAnimationFrame(() => {
      bottomSheet.classList.add('bottom-sheet-visible');
    });
    
    return bottomSheet;
  }

  addSwipeToClose(bottomSheet, sheetContent) {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    const handleStart = (e) => {
      startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
      isDragging = true;
      sheetContent.style.transition = 'none';
    };
    
    const handleMove = (e) => {
      if (!isDragging) return;
      
      currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 0) {
        sheetContent.style.transform = `translateY(${deltaY}px)`;
      }
    };
    
    const handleEnd = () => {
      if (!isDragging) return;
      
      isDragging = false;
      sheetContent.style.transition = '';
      
      const deltaY = currentY - startY;
      if (deltaY > 100) {
        this.hideBottomSheet(bottomSheet);
      } else {
        sheetContent.style.transform = '';
      }
    };
    
    sheetContent.addEventListener('touchstart', handleStart);
    sheetContent.addEventListener('touchmove', handleMove);
    sheetContent.addEventListener('touchend', handleEnd);
    
    // Mouse events for desktop testing
    sheetContent.addEventListener('mousedown', handleStart);
    sheetContent.addEventListener('mousemove', handleMove);
    sheetContent.addEventListener('mouseup', handleEnd);
  }

  hideBottomSheet(bottomSheet) {
    bottomSheet.classList.remove('bottom-sheet-visible');
    
    setTimeout(() => {
      bottomSheet.remove();
    }, 300);
  }

  // Create step-by-step help guide
  createStepGuide(steps) {
    const guideContainer = document.createElement('div');
    guideContainer.className = 'step-guide';
    
    const guideHTML = `
      <div class="step-guide-header">
        <h3>Step-by-Step Guide</h3>
        <div class="step-progress">
          <div class="step-progress-bar">
            <div class="step-progress-fill" style="width: 0%"></div>
          </div>
          <span class="step-counter">1 of ${steps.length}</span>
        </div>
      </div>
      <div class="step-guide-content">
        ${steps.map((step, index) => `
          <div class="step-item ${index === 0 ? 'step-active' : ''}" data-step="${index}">
            <div class="step-number">${index + 1}</div>
            <div class="step-content">
              <h4>${step.title}</h4>
              <p>${step.description}</p>
              ${step.image ? `<img src="${step.image}" alt="${step.title}" class="step-image">` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="step-guide-controls">
        <button class="step-btn step-prev" disabled>Previous</button>
        <button class="step-btn step-next">Next</button>
      </div>
    `;
    
    guideContainer.innerHTML = guideHTML;
    
    this.initializeStepGuide(guideContainer, steps);
    
    return guideContainer;
  }

  initializeStepGuide(container, steps) {
    const prevBtn = container.querySelector('.step-prev');
    const nextBtn = container.querySelector('.step-next');
    const progressFill = container.querySelector('.step-progress-fill');
    const stepCounter = container.querySelector('.step-counter');
    
    let currentStep = 0;
    
    const updateStep = () => {
      // Update active step
      const stepItems = container.querySelectorAll('.step-item');
      stepItems.forEach((item, index) => {
        item.classList.toggle('step-active', index === currentStep);
      });
      
      // Update progress
      const progress = ((currentStep + 1) / steps.length) * 100;
      progressFill.style.width = `${progress}%`;
      stepCounter.textContent = `${currentStep + 1} of ${steps.length}`;
      
      // Update buttons
      prevBtn.disabled = currentStep === 0;
      nextBtn.disabled = currentStep === steps.length - 1;
      
      if (currentStep === steps.length - 1) {
        nextBtn.textContent = 'Finish';
      } else {
        nextBtn.textContent = 'Next';
      }
    };
    
    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        updateStep();
      }
    });
    
    nextBtn.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        updateStep();
      } else {
        // Finish guide
        container.remove();
      }
    });
  }
}

// Initialize mobile help manager
const mobileHelpManager = new MobileHelpManager();

// Export for global use
window.mobileHelpManager = mobileHelpManager;