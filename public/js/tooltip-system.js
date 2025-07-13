// Tooltip component system for help content

class TooltipManager {
  constructor() {
    this.activeTooltip = null;
    this.tooltips = new Map();
    this.isMobile = this.checkMobile();
    console.log('TooltipManager initialized. Mobile mode:', this.isMobile);
    this.init();
  }

  init() {
    // Add event listeners
    document.addEventListener('click', this.handleDocumentClick.bind(this));
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Initialize all tooltips on page
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeTooltips();
      });
    } else {
      this.initializeTooltips();
    }
  }

  checkMobile() {
    // Check for actual touch capability instead of just user agent
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isSmallScreen = window.innerWidth < 768;
    // Only consider it mobile if it has touch AND small screen
    return hasTouch && isSmallScreen;
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = this.checkMobile();
    
    if (wasMobile !== this.isMobile) {
      this.hideTooltip();
    }
  }

  initializeTooltips() {
    // Find all elements with data-tooltip or data-tooltip-content attribute
    const tooltipElements = document.querySelectorAll('[data-tooltip], [data-tooltip-content]');
    
    tooltipElements.forEach(element => {
      // Skip if already initialized
      if (!this.tooltips.has(element)) {
        this.createTooltip(element);
      }
    });
  }

  createTooltip(element) {
    const tooltipId = element.getAttribute('data-tooltip');
    const content = element.getAttribute('data-tooltip-content');
    const position = element.getAttribute('data-tooltip-position') || 'top';
    const forceHover = element.getAttribute('data-tooltip-hover') === 'true';
    
    if (!tooltipId && !content) return;
    
    const tooltip = {
      id: tooltipId,
      element: element,
      content: content,
      position: position,
      tooltipElement: null
    };
    
    this.tooltips.set(element, tooltip);
    
    // Add event listeners
    if (this.isMobile && !forceHover) {
      console.log('Adding mobile click handler for:', element);
      element.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showTooltip(tooltip);
      });
    } else {
      console.log('Adding desktop hover handlers for:', element);
      element.addEventListener('mouseenter', () => {
        console.log('Mouse entered tooltip element:', element);
        this.showTooltip(tooltip);
      });
      element.addEventListener('mouseleave', () => this.hideTooltip());
      element.addEventListener('focus', () => this.showTooltip(tooltip));
      element.addEventListener('blur', () => this.hideTooltip());
      // Also add click handler for debugging
      element.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Tooltip clicked in desktop mode - this should not show tooltip');
      });
    }
  }

  showTooltip(tooltip) {
    // Hide any existing tooltip
    this.hideTooltip();
    
    // Create tooltip element
    const tooltipElement = document.createElement('div');
    const isRichTooltip = tooltip.id && window.HELP_CONTENT && window.HELP_CONTENT[tooltip.id];
    tooltipElement.className = `tooltip tooltip-${tooltip.position}${isRichTooltip ? ' tooltip-rich' : ''}`;
    tooltipElement.innerHTML = this.getTooltipContent(tooltip);
    
    // Add to DOM
    document.body.appendChild(tooltipElement);
    tooltip.tooltipElement = tooltipElement;
    this.activeTooltip = tooltip;
    
    // Position tooltip
    this.positionTooltip(tooltip);
    
    // Show with animation
    requestAnimationFrame(() => {
      tooltipElement.classList.add('tooltip-visible');
    });
    
    // Auto-hide on mobile after delay
    if (this.isMobile) {
      setTimeout(() => {
        if (this.activeTooltip === tooltip) {
          this.hideTooltip();
        }
      }, 4000);
    }
  }

  getTooltipContent(tooltip) {
    if (tooltip.content) {
      return tooltip.content;
    }
    
    if (tooltip.id && window.HELP_CONTENT) {
      const helpContent = window.HELP_CONTENT[tooltip.id];
      if (helpContent) {
        return `
          <div class="tooltip-header">
            <h4>${helpContent.title}</h4>
            <button class="tooltip-close" onclick="tooltipManager.hideTooltip()">&times;</button>
          </div>
          <div class="tooltip-content">
            <p>${helpContent.summary}</p>
            ${helpContent.quickTips ? `
              <ul class="tooltip-tips">
                ${helpContent.quickTips.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            ` : ''}
            <button class="tooltip-more" onclick="helpModal.show('${tooltip.id}')">
              Learn More
            </button>
          </div>
        `;
      }
    }
    
    return 'Help information not available';
  }

  positionTooltip(tooltip) {
    const tooltipElement = tooltip.tooltipElement;
    const targetElement = tooltip.element;
    
    if (!tooltipElement || !targetElement) return;
    
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let top, left;
    
    if (this.isMobile) {
      // Center on mobile
      top = (windowHeight - tooltipRect.height) / 2;
      left = (windowWidth - tooltipRect.width) / 2;
      tooltipElement.classList.add('tooltip-mobile');
    } else {
      // Desktop positioning
      switch (tooltip.position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 8;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + 8;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + 8;
          break;
        default:
          top = targetRect.top - tooltipRect.height - 8;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      }
      
      // Keep tooltip within viewport
      if (left < 8) left = 8;
      if (left + tooltipRect.width > windowWidth - 8) {
        left = windowWidth - tooltipRect.width - 8;
      }
      if (top < 8) {
        top = targetRect.bottom + 8;
        tooltipElement.classList.add('tooltip-flipped');
      }
      if (top + tooltipRect.height > windowHeight - 8) {
        top = targetRect.top - tooltipRect.height - 8;
        tooltipElement.classList.add('tooltip-flipped');
      }
    }
    
    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
  }

  hideTooltip() {
    if (this.activeTooltip && this.activeTooltip.tooltipElement) {
      this.activeTooltip.tooltipElement.classList.remove('tooltip-visible');
      
      setTimeout(() => {
        if (this.activeTooltip && this.activeTooltip.tooltipElement) {
          this.activeTooltip.tooltipElement.remove();
          this.activeTooltip.tooltipElement = null;
        }
      }, 200);
    }
    
    this.activeTooltip = null;
  }

  handleDocumentClick(e) {
    if (this.activeTooltip) {
      const tooltipElement = this.activeTooltip.tooltipElement;
      const targetElement = this.activeTooltip.element;
      
      if (tooltipElement && !tooltipElement.contains(e.target) && 
          targetElement && !targetElement.contains(e.target)) {
        this.hideTooltip();
      }
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.activeTooltip) {
      this.hideTooltip();
    }
  }

  // Method to create tooltip triggers dynamically
  addTooltip(element, options = {}) {
    const { content, position = 'top', id } = options;
    
    if (content) {
      element.setAttribute('data-tooltip-content', content);
    }
    if (id) {
      element.setAttribute('data-tooltip', id);
    }
    element.setAttribute('data-tooltip-position', position);
    
    this.createTooltip(element);
  }

  // Method to create help icon with tooltip
  createHelpIcon(options = {}) {
    const { 
      content, 
      id, 
      position = 'top', 
      className = 'help-icon',
      ariaLabel = 'Help'
    } = options;
    
    const helpIcon = document.createElement('button');
    helpIcon.className = className;
    helpIcon.innerHTML = '?';
    helpIcon.setAttribute('aria-label', ariaLabel);
    helpIcon.setAttribute('type', 'button');
    
    if (content) {
      helpIcon.setAttribute('data-tooltip-content', content);
    }
    if (id) {
      helpIcon.setAttribute('data-tooltip', id);
    }
    helpIcon.setAttribute('data-tooltip-position', position);
    
    this.createTooltip(helpIcon);
    
    return helpIcon;
  }
}

// Quick tooltip creation helper
function createQuickTooltip(text, position = 'top') {
  return `data-tooltip-content="${text}" data-tooltip-position="${position}"`;
}

// Initialize tooltip manager
const tooltipManager = new TooltipManager();

// Export for global use
window.tooltipManager = tooltipManager;
window.createQuickTooltip = createQuickTooltip;