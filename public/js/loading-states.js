// Enhanced loading states management for Phase 8

class LoadingManager {
  constructor() {
    this.loadingOverlay = null;
    this.loadingElements = new Map();
  }

  // Create global loading overlay with multiple styles
  createLoadingOverlay(style = 'spinner') {
    if (!this.loadingOverlay) {
      this.loadingOverlay = document.createElement('div');
      this.loadingOverlay.className = 'loading-overlay';
      
      let content = '';
      switch (style) {
        case 'dots':
          content = `
            <div class="loading-dots">
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
            </div>
            <p class="loading-text">Calculating your carbon footprint...</p>
          `;
          break;
        case 'progress':
          content = `
            <div class="loading-circular-progress">
              <svg viewBox="0 0 36 36">
                <path class="circular-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="circular-progress" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <span class="progress-value">0%</span>
            </div>
            <p class="loading-text">Calculating your carbon footprint...</p>
          `;
          break;
        default:
          content = `
            <div class="loading-spinner">
              <div class="spinner"></div>
              <p class="loading-text">Calculating your carbon footprint...</p>
            </div>
          `;
      }
      
      this.loadingOverlay.innerHTML = content;
      document.body.appendChild(this.loadingOverlay);
    }
  }

  // Show/hide global loading
  showLoading(message = 'Loading...') {
    this.createLoadingOverlay();
    const loadingText = this.loadingOverlay.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = message;
    }
    this.loadingOverlay.classList.add('active');
  }

  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove('active');
    }
  }

  // Add loading state to specific element
  addElementLoading(element, id = null) {
    const elementId = id || element.id || Math.random().toString(36).substr(2, 9);
    
    // Store original content
    this.loadingElements.set(elementId, {
      element: element,
      originalContent: element.innerHTML,
      originalDisabled: element.disabled
    });

    // Add loading class and disable if applicable
    element.classList.add('loading');
    if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
      element.disabled = true;
    }

    return elementId;
  }

  // Remove loading state from element
  removeElementLoading(elementId) {
    const data = this.loadingElements.get(elementId);
    if (data) {
      data.element.classList.remove('loading');
      if (data.element.tagName === 'BUTTON' || data.element.tagName === 'INPUT') {
        data.element.disabled = data.originalDisabled;
      }
      this.loadingElements.delete(elementId);
    }
  }

  // Show skeleton loading for content areas
  showSkeletonLoading(container, count = 3) {
    const skeletons = [];
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-item';
      skeleton.innerHTML = `
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text skeleton-text-short"></div>
      `;
      container.appendChild(skeleton);
      skeletons.push(skeleton);
    }
    
    return skeletons;
  }

  // Button loading state with spinner
  setButtonLoading(button, isLoading, loadingText = 'Loading...') {
    if (isLoading) {
      const originalText = button.textContent;
      button.setAttribute('data-original-text', originalText);
      button.innerHTML = `
        <span class="button-spinner"></span>
        <span>${loadingText}</span>
      `;
      button.classList.add('loading');
      button.disabled = true;
    } else {
      const originalText = button.getAttribute('data-original-text');
      if (originalText) {
        button.textContent = originalText;
      }
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  // Progress indicator for multi-step loading
  createProgressIndicator(steps) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'loading-progress-container';
    progressContainer.innerHTML = `
      <div class="loading-progress-bar">
        <div class="loading-progress-fill"></div>
      </div>
      <p class="loading-progress-text">Step 1 of ${steps}</p>
    `;
    
    return {
      container: progressContainer,
      updateProgress: (currentStep) => {
        const progressFill = progressContainer.querySelector('.loading-progress-fill');
        const progressText = progressContainer.querySelector('.loading-progress-text');
        const percentage = (currentStep / steps) * 100;
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `Step ${currentStep} of ${steps}`;
      }
    };
  }

  // Success state animation
  showSuccess(element, message = 'Success!', duration = 2000) {
    const successOverlay = document.createElement('div');
    successOverlay.className = 'success-overlay';
    successOverlay.innerHTML = `
      <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
        <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
      </svg>
      <p class="success-message">${message}</p>
    `;
    
    element.appendChild(successOverlay);
    
    setTimeout(() => {
      successOverlay.remove();
    }, duration);
  }

  // Error state
  showError(element, message = 'An error occurred', duration = 3000) {
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'error-overlay';
    errorOverlay.innerHTML = `
      <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="25" fill="none" stroke="#EF4444" stroke-width="2"/>
        <line x1="18" y1="18" x2="34" y2="34" stroke="#EF4444" stroke-width="2"/>
        <line x1="34" y1="18" x2="18" y2="34" stroke="#EF4444" stroke-width="2"/>
      </svg>
      <p class="error-message">${message}</p>
    `;
    
    element.appendChild(errorOverlay);
    
    if (duration > 0) {
      setTimeout(() => {
        errorOverlay.remove();
      }, duration);
    }
    
    return errorOverlay;
  }
}

// Loading CSS styles to be added
const loadingStyles = `
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
  z-index: 9999;
}

.loading-overlay.active {
  opacity: 1;
  visibility: visible;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 3px solid #E5E7EB;
  border-top: 3px solid #10B981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.button-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

.skeleton-item {
  margin-bottom: 20px;
}

.skeleton-title {
  height: 24px;
  width: 60%;
  margin-bottom: 12px;
}

.skeleton-text {
  height: 16px;
  width: 100%;
  margin-bottom: 8px;
}

.skeleton-text-short {
  width: 40%;
}

.loading-progress-container {
  width: 100%;
  padding: 20px;
}

.loading-progress-bar {
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
}

.loading-progress-fill {
  height: 100%;
  background: #10B981;
  transition: width 0.3s ease;
}

.success-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.checkmark,
.error-icon {
  width: 52px;
  height: 52px;
  margin-bottom: 16px;
}

.checkmark-circle,
.checkmark-check {
  stroke: #10B981;
  stroke-width: 2;
}

.success-message,
.error-message {
  font-size: 18px;
  font-weight: 500;
}

.success-message {
  color: #10B981;
}

.error-message {
  color: #EF4444;
}
`;

// Lazy loading for images
class LazyImageLoader {
  constructor() {
    this.imageObserver = null;
    this.init();
  }
  
  init() {
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });
    }
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;
    
    // Show loading placeholder
    img.classList.add('loading-image');
    
    // Create new image to preload
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.classList.remove('loading-image');
      img.classList.add('loaded-image');
    };
    tempImg.onerror = () => {
      img.classList.remove('loading-image');
      img.classList.add('error-image');
    };
    tempImg.src = src;
  }
  
  observe(images) {
    if (this.imageObserver) {
      images.forEach(img => this.imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => this.loadImage(img));
    }
  }
}

// Network status indicator
class NetworkStatus {
  constructor() {
    this.isOnline = navigator.onLine;
    this.indicator = null;
    this.init();
  }
  
  init() {
    this.createIndicator();
    
    window.addEventListener('online', () => this.updateStatus(true));
    window.addEventListener('offline', () => this.updateStatus(false));
    
    // Check connection quality
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.updateConnectionQuality();
      });
    }
  }
  
  createIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'network-indicator';
    this.indicator.style.display = 'none';
    document.body.appendChild(this.indicator);
  }
  
  updateStatus(online) {
    this.isOnline = online;
    
    if (!online) {
      this.indicator.innerHTML = `
        <span class="offline-icon">📵</span>
        <span>You're offline - calculations will sync when reconnected</span>
      `;
      this.indicator.className = 'network-indicator offline';
      this.indicator.style.display = 'flex';
    } else {
      this.indicator.innerHTML = `
        <span class="online-icon">✅</span>
        <span>Back online!</span>
      `;
      this.indicator.className = 'network-indicator online';
      this.indicator.style.display = 'flex';
      
      // Hide after 3 seconds
      setTimeout(() => {
        this.indicator.style.display = 'none';
      }, 3000);
    }
  }
  
  updateConnectionQuality() {
    if (!navigator.connection) return;
    
    const connection = navigator.connection;
    const effectiveType = connection.effectiveType;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      this.indicator.innerHTML = `
        <span class="slow-icon">🐌</span>
        <span>Slow connection detected</span>
      `;
      this.indicator.className = 'network-indicator slow';
      this.indicator.style.display = 'flex';
      
      setTimeout(() => {
        this.indicator.style.display = 'none';
      }, 5000);
    }
  }
}

// Enhanced loading CSS styles
const enhancedLoadingStyles = loadingStyles + `
/* Loading dots animation */
.loading-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.loading-dot {
  width: 12px;
  height: 12px;
  background: #10B981;
  border-radius: 50%;
  animation: dot-bounce 1.4s ease-in-out infinite;
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Circular progress */
.loading-circular-progress {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
}

.loading-circular-progress svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circular-bg {
  fill: none;
  stroke: #E5E7EB;
  stroke-width: 3;
}

.circular-progress {
  fill: none;
  stroke: #10B981;
  stroke-width: 3;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: circular-progress 2s ease-in-out infinite;
}

@keyframes circular-progress {
  0% { stroke-dashoffset: 100; }
  50% { stroke-dashoffset: 20; }
  100% { stroke-dashoffset: 100; }
}

.progress-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 600;
  color: #10B981;
}

/* Image loading */
.loading-image {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

.loaded-image {
  animation: fadeIn 0.5s ease;
}

.error-image {
  background: #FEE2E2;
  position: relative;
}

.error-image::after {
  content: '⚠️ Failed to load';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #DC2626;
  font-size: 14px;
}

/* Network indicator */
.network-indicator {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease;
  z-index: 10000;
}

@keyframes slideDown {
  from {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.network-indicator.offline {
  background: #FEE2E2;
  color: #DC2626;
}

.network-indicator.online {
  background: #D1FAE5;
  color: #065F46;
}

.network-indicator.slow {
  background: #FEF3C7;
  color: #92400E;
}

/* Pulse effect for live data */
@keyframes pulse-live {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.live-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #10B981;
  border-radius: 50%;
  animation: pulse-live 2s infinite;
}
`;

// Initialize managers
const loadingManager = new LoadingManager();
const lazyImageLoader = new LazyImageLoader();
const networkStatus = new NetworkStatus();

// Export for use
window.loadingManager = loadingManager;
window.lazyImageLoader = lazyImageLoader;
window.networkStatus = networkStatus;
window.loadingStyles = enhancedLoadingStyles;