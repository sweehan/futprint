// Progressive disclosure system for help content

class ProgressiveDisclosureManager {
  constructor() {
    this.disclosureItems = new Map();
    this.userInteractions = new Set();
    this.init();
  }

  init() {
    this.initializeDisclosureItems();
    this.setupUserTracking();
  }

  initializeDisclosureItems() {
    // Find all elements with progressive disclosure
    const disclosureElements = document.querySelectorAll('[data-disclosure]');
    
    disclosureElements.forEach(element => {
      this.createDisclosureItem(element);
    });
  }

  createDisclosureItem(element) {
    const disclosureId = element.getAttribute('data-disclosure');
    const trigger = element.getAttribute('data-trigger') || 'click';
    const content = element.getAttribute('data-content') || '';
    const level = parseInt(element.getAttribute('data-level')) || 1;
    
    const disclosureItem = {
      id: disclosureId,
      element: element,
      trigger: trigger,
      content: content,
      level: level,
      isDisclosed: false,
      contentElement: null
    };
    
    this.disclosureItems.set(element, disclosureItem);
    this.setupDisclosureTrigger(disclosureItem);
  }

  setupDisclosureTrigger(item) {
    const { element, trigger } = item;
    
    switch (trigger) {
      case 'click':
        element.addEventListener('click', () => this.toggleDisclosure(item));
        element.style.cursor = 'pointer';
        break;
      case 'hover':
        element.addEventListener('mouseenter', () => this.showDisclosure(item));
        element.addEventListener('mouseleave', () => this.hideDisclosure(item));
        break;
      case 'focus':
        element.addEventListener('focus', () => this.showDisclosure(item));
        element.addEventListener('blur', () => this.hideDisclosure(item));
        break;
      case 'auto':
        // Auto-disclosure based on user behavior
        this.scheduleAutoDisclosure(item);
        break;
    }
  }

  toggleDisclosure(item) {
    if (item.isDisclosed) {
      this.hideDisclosure(item);
    } else {
      this.showDisclosure(item);
    }
  }

  showDisclosure(item) {
    if (item.isDisclosed) return;
    
    // Track user interaction
    this.trackInteraction(item.id);
    
    // Create content element
    const contentElement = this.createContentElement(item);
    item.contentElement = contentElement;
    
    // Add to DOM
    this.insertContentElement(item, contentElement);
    
    // Show with animation
    requestAnimationFrame(() => {
      contentElement.classList.add('disclosure-visible');
    });
    
    item.isDisclosed = true;
    
    // Update trigger element
    this.updateTriggerElement(item, true);
  }

  hideDisclosure(item) {
    if (!item.isDisclosed || !item.contentElement) return;
    
    const contentElement = item.contentElement;
    
    // Hide with animation
    contentElement.classList.remove('disclosure-visible');
    
    setTimeout(() => {
      if (contentElement.parentNode) {
        contentElement.parentNode.removeChild(contentElement);
      }
      item.contentElement = null;
    }, 300);
    
    item.isDisclosed = false;
    
    // Update trigger element
    this.updateTriggerElement(item, false);
  }

  createContentElement(item) {
    const contentElement = document.createElement('div');
    contentElement.className = `disclosure-content disclosure-level-${item.level}`;
    
    let content = item.content;
    
    // Get content from help system if ID provided
    if (item.id && window.HELP_CONTENT) {
      const helpContent = window.HELP_CONTENT[item.id];
      if (helpContent) {
        content = this.formatHelpContent(helpContent, item.level);
      }
    }
    
    contentElement.innerHTML = content;
    
    return contentElement;
  }

  formatHelpContent(helpContent, level) {
    switch (level) {
      case 1: // Basic info
        return `<p class="disclosure-summary">${helpContent.summary}</p>`;
      
      case 2: // Tips
        if (helpContent.quickTips) {
          return `
            <div class="disclosure-tips">
              <h4>Quick Tips:</h4>
              <ul>
                ${helpContent.quickTips.slice(0, 2).map(tip => `<li>${tip}</li>`).join('')}
              </ul>
              <button class="disclosure-more" onclick="helpModal.show('${helpContent.id || ''}')">
                Learn More
              </button>
            </div>
          `;
        }
        return `<p class="disclosure-summary">${helpContent.summary}</p>`;
      
      case 3: // Detailed
        return `
          <div class="disclosure-detailed">
            <p>${helpContent.summary}</p>
            ${helpContent.quickTips ? `
              <ul class="disclosure-tips-list">
                ${helpContent.quickTips.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            ` : ''}
            <button class="disclosure-full" onclick="helpModal.show('${helpContent.id || ''}')">
              View Full Details
            </button>
          </div>
        `;
      
      default:
        return `<p class="disclosure-summary">${helpContent.summary}</p>`;
    }
  }

  insertContentElement(item, contentElement) {
    const position = item.element.getAttribute('data-position') || 'after';
    
    switch (position) {
      case 'before':
        item.element.parentNode.insertBefore(contentElement, item.element);
        break;
      case 'after':
        item.element.parentNode.insertBefore(contentElement, item.element.nextSibling);
        break;
      case 'inside':
        item.element.appendChild(contentElement);
        break;
      case 'replace':
        item.element.style.display = 'none';
        item.element.parentNode.insertBefore(contentElement, item.element.nextSibling);
        break;
      default:
        item.element.parentNode.insertBefore(contentElement, item.element.nextSibling);
    }
  }

  updateTriggerElement(item, isDisclosed) {
    const element = item.element;
    
    if (isDisclosed) {
      element.classList.add('disclosure-active');
      element.setAttribute('aria-expanded', 'true');
    } else {
      element.classList.remove('disclosure-active');
      element.setAttribute('aria-expanded', 'false');
    }
    
    // Update text or icon if needed
    const indicator = element.querySelector('.disclosure-indicator');
    if (indicator) {
      indicator.textContent = isDisclosed ? '−' : '+';
    }
  }

  scheduleAutoDisclosure(item) {
    // Auto-disclose based on user behavior patterns
    const delay = this.calculateAutoDisclosureDelay(item);
    console.log(`Scheduling auto-disclosure for ${item.id} in ${delay}ms`);
    
    setTimeout(() => {
      console.log(`Auto-disclosure timer fired for ${item.id}`);
      if (!this.userInteractions.has(item.id) && this.shouldAutoDisclose(item)) {
        console.log(`Showing auto-disclosure for ${item.id}`);
        this.showDisclosure(item);
      } else {
        console.log(`Auto-disclosure conditions not met for ${item.id}`);
      }
    }, delay);
  }

  calculateAutoDisclosureDelay(item) {
    // Calculate delay based on element visibility and user engagement
    const baseDelay = 3000; // 3 seconds
    const levelMultiplier = item.level * 1000; // Add time per level
    
    return baseDelay + levelMultiplier;
  }

  shouldAutoDisclose(item) {
    // Check if conditions are met for auto-disclosure
    const element = item.element;
    
    // Check if element is in viewport
    const rect = element.getBoundingClientRect();
    const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
    
    // Don't auto-disclose if user is actively interacting
    const hasRecentInteraction = this.hasRecentUserInteraction();
    
    return isInViewport && !hasRecentInteraction;
  }

  hasRecentUserInteraction() {
    // Check for recent mouse or keyboard activity
    const now = Date.now();
    const recentThreshold = 2000; // 2 seconds
    
    return (now - this.lastInteractionTime) < recentThreshold;
  }

  setupUserTracking() {
    this.lastInteractionTime = Date.now();
    
    // Track user interactions
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        this.lastInteractionTime = Date.now();
      }, { passive: true });
    });
  }

  trackInteraction(itemId) {
    this.userInteractions.add(itemId);
    
    // Store in localStorage for persistence
    try {
      const interactions = JSON.parse(localStorage.getItem('helpInteractions') || '[]');
      if (!interactions.includes(itemId)) {
        interactions.push(itemId);
        localStorage.setItem('helpInteractions', JSON.stringify(interactions));
      }
    } catch (e) {
      console.warn('Could not save help interactions to localStorage');
    }
  }

  // Create disclosure trigger element
  createDisclosureTrigger(options = {}) {
    const {
      text = 'Learn more',
      disclosureId,
      content,
      level = 2,
      trigger = 'click',
      position = 'after',
      className = 'disclosure-trigger'
    } = options;
    
    const triggerElement = document.createElement('button');
    triggerElement.className = className;
    triggerElement.textContent = text;
    triggerElement.setAttribute('data-disclosure', disclosureId);
    triggerElement.setAttribute('data-content', content);
    triggerElement.setAttribute('data-level', level);
    triggerElement.setAttribute('data-trigger', trigger);
    triggerElement.setAttribute('data-position', position);
    triggerElement.setAttribute('aria-expanded', 'false');
    
    // Add disclosure indicator
    const indicator = document.createElement('span');
    indicator.className = 'disclosure-indicator';
    indicator.textContent = '+';
    triggerElement.appendChild(indicator);
    
    this.createDisclosureItem(triggerElement);
    
    return triggerElement;
  }

  // Smart help suggestions based on user context
  suggestHelp(context) {
    const suggestions = this.getContextualSuggestions(context);
    
    if (suggestions.length > 0) {
      this.showHelpSuggestions(suggestions);
    }
  }

  getContextualSuggestions(context) {
    const suggestions = [];
    
    // Suggest help based on current step
    if (context.step && window.HELP_BY_STEP) {
      const stepHelp = window.HELP_BY_STEP[context.step];
      if (stepHelp) {
        suggestions.push({
          id: stepHelp.primary,
          priority: 'high',
          reason: 'Current step help'
        });
      }
    }
    
    // Suggest help based on user hesitation
    if (context.timeOnStep > 30000) { // 30 seconds
      suggestions.push({
        id: 'calculationMethodology',
        priority: 'medium',
        reason: 'Taking time on step'
      });
    }
    
    return suggestions;
  }

  showHelpSuggestions(suggestions) {
    // Create unobtrusive help suggestion
    const suggestionElement = document.createElement('div');
    suggestionElement.className = 'help-suggestion';
    suggestionElement.innerHTML = `
      <div class="help-suggestion-content">
        <span class="help-suggestion-icon">💡</span>
        <span class="help-suggestion-text">Need help with this step?</span>
        <button class="help-suggestion-btn" onclick="helpModal.showContextualHelp('${suggestions[0].id}')">
          Get Help
        </button>
        <button class="help-suggestion-dismiss">&times;</button>
      </div>
    `;
    
    // Position and show
    document.body.appendChild(suggestionElement);
    
    // Auto-dismiss after delay
    setTimeout(() => {
      if (suggestionElement.parentNode) {
        suggestionElement.remove();
      }
    }, 10000);
    
    // Manual dismiss
    const dismissBtn = suggestionElement.querySelector('.help-suggestion-dismiss');
    dismissBtn.addEventListener('click', () => {
      suggestionElement.remove();
    });
  }

  // Method to add disclosure to existing elements
  addDisclosure(element, options = {}) {
    const { 
      disclosureId, 
      content, 
      level = 2, 
      trigger = 'click',
      position = 'after'
    } = options;
    
    element.setAttribute('data-disclosure', disclosureId);
    if (content) element.setAttribute('data-content', content);
    element.setAttribute('data-level', level);
    element.setAttribute('data-trigger', trigger);
    element.setAttribute('data-position', position);
    
    this.createDisclosureItem(element);
  }
}

// Initialize progressive disclosure manager
const progressiveDisclosure = new ProgressiveDisclosureManager();

// Export for global use
window.progressiveDisclosure = progressiveDisclosure;