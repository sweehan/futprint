// Modal system for detailed help content

class ModalManager {
  constructor() {
    this.activeModal = null;
    this.modalStack = [];
    this.isMobile = this.checkMobile();
    this.init();
  }

  init() {
    // Add event listeners
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Create modal container if it doesn't exist
    this.createModalContainer();
  }

  checkMobile() {
    return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  handleResize() {
    this.isMobile = this.checkMobile();
    
    if (this.activeModal) {
      this.updateModalLayout();
    }
  }

  createModalContainer() {
    if (!document.getElementById('modal-container')) {
      const container = document.createElement('div');
      container.id = 'modal-container';
      document.body.appendChild(container);
    }
  }

  show(helpId, options = {}) {
    const { 
      title,
      content,
      size = 'medium',
      showCloseButton = true,
      closeOnBackdrop = true,
      customClass = ''
    } = options;

    // Get help content if helpId provided
    let modalContent = content;
    let modalTitle = title;
    
    if (helpId && window.HELP_CONTENT) {
      const helpContent = window.HELP_CONTENT[helpId];
      if (helpContent) {
        modalTitle = modalTitle || helpContent.title;
        modalContent = helpContent.detailed || helpContent.summary;
      }
    }

    // Hide any existing modal
    this.hide();

    // Create modal structure
    const modalId = `modal-${Date.now()}`;
    const modalHTML = this.createModalHTML({
      id: modalId,
      title: modalTitle,
      content: modalContent,
      size,
      showCloseButton,
      closeOnBackdrop,
      customClass
    });

    // Add to DOM
    const container = document.getElementById('modal-container');
    container.innerHTML = modalHTML;

    // Get modal elements
    const modalElement = document.getElementById(modalId);
    const backdrop = modalElement.querySelector('.modal-backdrop');
    const closeButton = modalElement.querySelector('.modal-close');

    // Setup event listeners
    if (closeOnBackdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.hide();
        }
      });
    }

    if (closeButton) {
      closeButton.addEventListener('click', () => this.hide());
    }

    // Show modal with animation
    requestAnimationFrame(() => {
      modalElement.classList.add('modal-visible');
    });

    // Store active modal
    this.activeModal = {
      id: modalId,
      element: modalElement,
      helpId: helpId
    };

    // Add to stack
    this.modalStack.push(this.activeModal);

    // Prevent body scroll
    document.body.classList.add('modal-open');

    // Focus management
    this.focusModal(modalElement);

    return modalElement;
  }

  createModalHTML({ id, title, content, size, showCloseButton, closeOnBackdrop, customClass }) {
    const sizeClass = `modal-${size}`;
    const mobileClass = this.isMobile ? 'modal-mobile' : '';
    
    return `
      <div id="${id}" class="modal ${sizeClass} ${mobileClass} ${customClass}">
        <div class="modal-backdrop" ${closeOnBackdrop ? 'role="button" aria-label="Close modal"' : ''}>
          <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
            <div class="modal-content">
              <div class="modal-header">
                <h2 id="${id}-title" class="modal-title">${title || 'Help'}</h2>
                ${showCloseButton ? '<button class="modal-close" aria-label="Close modal">&times;</button>' : ''}
              </div>
              <div class="modal-body">
                ${content || 'No content available'}
              </div>
              <div class="modal-footer">
                <button class="modal-btn modal-btn-primary" onclick="helpModal.hide()">
                  Got it
                </button>
                ${this.isMobile ? '' : '<button class="modal-btn modal-btn-secondary" onclick="helpModal.hide()">Close</button>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  hide() {
    if (this.activeModal) {
      const modalElement = this.activeModal.element;
      
      // Hide with animation
      modalElement.classList.remove('modal-visible');
      
      setTimeout(() => {
        // Remove from DOM
        const container = document.getElementById('modal-container');
        if (container) {
          container.innerHTML = '';
        }
        
        // Remove from stack
        this.modalStack.pop();
        
        // Update active modal
        this.activeModal = this.modalStack.length > 0 ? 
          this.modalStack[this.modalStack.length - 1] : null;
        
        // Allow body scroll if no modals
        if (this.modalStack.length === 0) {
          document.body.classList.remove('modal-open');
        }
      }, 300);
    }
  }

  hideAll() {
    while (this.modalStack.length > 0) {
      this.hide();
    }
  }

  focusModal(modalElement) {
    // Focus first focusable element
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.activeModal) {
      this.hide();
    }
  }

  updateModalLayout() {
    if (this.activeModal) {
      const modalElement = this.activeModal.element;
      
      if (this.isMobile) {
        modalElement.classList.add('modal-mobile');
      } else {
        modalElement.classList.remove('modal-mobile');
      }
    }
  }

  // Show contextual help modal
  showContextualHelp(step) {
    if (!window.HELP_BY_STEP || !window.HELP_BY_STEP[step]) {
      return;
    }

    const stepHelp = window.HELP_BY_STEP[step];
    const primaryHelpId = stepHelp.primary;
    const secondaryHelp = stepHelp.secondary || [];

    // Show primary help
    this.show(primaryHelpId);

    // Add secondary help links if available
    if (secondaryHelp.length > 0 && this.activeModal) {
      const modalBody = this.activeModal.element.querySelector('.modal-body');
      const secondaryLinks = document.createElement('div');
      secondaryLinks.className = 'modal-secondary-links';
      secondaryLinks.innerHTML = `
        <h4>Related Topics:</h4>
        <ul>
          ${secondaryHelp.map(helpId => {
            const helpContent = window.HELP_CONTENT[helpId];
            return helpContent ? `
              <li>
                <button class="link-button" onclick="helpModal.show('${helpId}')">
                  ${helpContent.title}
                </button>
              </li>
            ` : '';
          }).join('')}
        </ul>
      `;
      modalBody.appendChild(secondaryLinks);
    }
  }

  // Show quick help popup (smaller, simpler modal)
  showQuickHelp(content, options = {}) {
    const quickHelpOptions = {
      ...options,
      size: 'small',
      showCloseButton: false,
      customClass: 'modal-quick-help'
    };

    return this.show(null, {
      ...quickHelpOptions,
      content: `
        <div class="quick-help-content">
          ${content}
        </div>
      `
    });
  }

  // Show help for specific calculation
  showCalculationHelp(calculation) {
    const content = `
      <div class="calculation-help">
        <h3>How we calculated this:</h3>
        <div class="calculation-breakdown">
          <div class="calc-row">
            <span class="calc-label">Base (${calculation.item}):</span>
            <span class="calc-value">${calculation.base} kg CO2e</span>
          </div>
          <div class="calc-row">
            <span class="calc-label">Material (${calculation.material}):</span>
            <span class="calc-value">×${calculation.materialMultiplier}</span>
          </div>
          <div class="calc-row">
            <span class="calc-label">Location (${calculation.location}):</span>
            <span class="calc-value">×${calculation.locationMultiplier}</span>
          </div>
          <div class="calc-row calc-total">
            <span class="calc-label">Total:</span>
            <span class="calc-value">${calculation.total} kg CO2e</span>
          </div>
        </div>
        <div class="calc-sources">
          <h4>Sources:</h4>
          <ul>
            <li>UK DEFRA 2024</li>
            <li>Carbonfact Research</li>
            <li>Last updated: January 2025</li>
          </ul>
        </div>
      </div>
    `;

    return this.show(null, {
      title: 'Calculation Breakdown',
      content: content,
      size: 'medium'
    });
  }
}

// Initialize modal manager
const helpModal = new ModalManager();

// Export for global use
window.helpModal = helpModal;