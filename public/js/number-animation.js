// Enhanced number animation for carbon footprint results - Phase 8

class NumberAnimation {
  constructor(element, options = {}) {
    this.element = element;
    this.duration = options.duration || 1000;
    this.decimals = options.decimals || 1;
    this.suffix = options.suffix || '';
    this.prefix = options.prefix || '';
    this.startValue = 0;
    this.endValue = 0;
    this.startTime = null;
  }

  animate(endValue) {
    this.endValue = endValue;
    this.startValue = parseFloat(this.element.textContent) || 0;
    this.startTime = performance.now();
    
    requestAnimationFrame(this.update.bind(this));
  }

  update(currentTime) {
    if (!this.startTime) this.startTime = currentTime;
    
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    // Easing function (ease-out-expo)
    const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    
    const currentValue = this.startValue + (this.endValue - this.startValue) * easeOutExpo;
    
    this.element.textContent = this.prefix + currentValue.toFixed(this.decimals) + this.suffix;
    
    if (progress < 1) {
      requestAnimationFrame(this.update.bind(this));
    } else {
      // Ensure final value is exact
      this.element.textContent = this.prefix + this.endValue.toFixed(this.decimals) + this.suffix;
      
      // Add completion class for additional effects
      this.element.classList.add('animation-complete');
      
      // Trigger pulse effect on completion
      this.element.classList.add('pulse-once');
      setTimeout(() => {
        this.element.classList.remove('pulse-once');
      }, 600);
      
      // Fire custom event
      this.element.dispatchEvent(new CustomEvent('animationComplete', {
        detail: { value: this.endValue }
      }));
    }
  }
}

// Counter animation for equivalents (integers)
class CounterAnimation {
  constructor(element, options = {}) {
    this.element = element;
    this.duration = options.duration || 1500;
    this.prefix = options.prefix || '';
    this.suffix = options.suffix || '';
    this.startValue = 0;
    this.endValue = 0;
    this.startTime = null;
  }

  animate(endValue) {
    this.endValue = endValue;
    this.startValue = 0;
    this.startTime = performance.now();
    
    requestAnimationFrame(this.update.bind(this));
  }

  update(currentTime) {
    if (!this.startTime) this.startTime = currentTime;
    
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    // Easing function
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    
    const currentValue = Math.floor(this.startValue + (this.endValue - this.startValue) * easeOutQuart);
    
    // Format number with commas
    const formattedValue = currentValue.toLocaleString();
    
    this.element.textContent = this.prefix + formattedValue + this.suffix;
    
    if (progress < 1) {
      requestAnimationFrame(this.update.bind(this));
    } else {
      this.element.textContent = this.prefix + this.endValue.toLocaleString() + this.suffix;
      this.element.classList.add('animation-complete');
    }
  }
}

// Progress bar animation
class ProgressAnimation {
  constructor(element, options = {}) {
    this.element = element;
    this.duration = options.duration || 800;
    this.max = options.max || 100;
  }

  animate(value) {
    const percentage = (value / this.max) * 100;
    
    // Reset and trigger reflow
    this.element.style.width = '0%';
    this.element.offsetHeight; // Trigger reflow
    
    // Animate
    setTimeout(() => {
      this.element.style.width = percentage + '%';
    }, 50);
  }
}

// Initialize animations when results are shown
function initializeResultAnimations(carbonValue, equivalents) {
  // Animate main carbon value
  const carbonElement = document.querySelector('.carbon-value');
  if (carbonElement) {
    const carbonAnimation = new NumberAnimation(carbonElement, {
      duration: 1200,
      decimals: 1,
      suffix: ' kg CO2e'
    });
    carbonAnimation.animate(carbonValue);
  }

  // Animate equivalents
  if (equivalents) {
    // Driving miles
    const drivingElement = document.querySelector('.equivalent-driving');
    if (drivingElement && equivalents.driving) {
      const drivingAnimation = new CounterAnimation(drivingElement, {
        duration: 1500,
        suffix: ' miles'
      });
      drivingAnimation.animate(equivalents.driving);
    }

    // Phone charges
    const phoneElement = document.querySelector('.equivalent-phone');
    if (phoneElement && equivalents.phoneCharges) {
      const phoneAnimation = new CounterAnimation(phoneElement, {
        duration: 1500,
        suffix: ' charges'
      });
      phoneAnimation.animate(equivalents.phoneCharges);
    }

    // Tree months
    const treeElement = document.querySelector('.equivalent-tree');
    if (treeElement && equivalents.treeMonths) {
      const treeAnimation = new NumberAnimation(treeElement, {
        duration: 1500,
        decimals: 0,
        suffix: ' months'
      });
      treeAnimation.animate(equivalents.treeMonths);
    }
  }

  // Animate progress bar if exists
  const progressBar = document.querySelector('.carbon-progress-fill');
  if (progressBar) {
    const progressAnimation = new ProgressAnimation(progressBar, {
      max: 50 // Max expected CO2 value for visualization
    });
    progressAnimation.animate(carbonValue);
  }
}

// Confetti effect for low carbon values
function createConfetti(count = 30) {
  const container = document.body;
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    container.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => confetti.remove(), 3500);
  }
}

// Comparison animation for showing relative impact
class ComparisonAnimation {
  constructor(element, options = {}) {
    this.element = element;
    this.items = options.items || [];
    this.duration = options.duration || 2000;
  }
  
  animate() {
    const maxValue = Math.max(...this.items.map(item => item.value));
    
    this.items.forEach((item, index) => {
      const bar = this.element.querySelector(`[data-item="${item.name}"]`);
      if (!bar) return;
      
      const percentage = (item.value / maxValue) * 100;
      
      // Stagger the animations
      setTimeout(() => {
        bar.style.width = '0%';
        bar.offsetHeight; // Force reflow
        
        setTimeout(() => {
          bar.style.width = percentage + '%';
          bar.style.transition = `width ${this.duration}ms cubic-bezier(0.19, 1, 0.22, 1)`;
          
          // Add value label
          const label = bar.querySelector('.value-label');
          if (label) {
            const labelAnimation = new NumberAnimation(label, {
              duration: this.duration,
              decimals: 1,
              suffix: ' kg'
            });
            labelAnimation.animate(item.value);
          }
        }, 50);
      }, index * 200);
    });
  }
}

// Odometer-style number animation
class OdometerAnimation {
  constructor(element, options = {}) {
    this.element = element;
    this.duration = options.duration || 2000;
    this.digits = [];
    this.setup();
  }
  
  setup() {
    this.element.classList.add('odometer');
    this.element.innerHTML = '';
  }
  
  animate(value) {
    const strValue = value.toFixed(1).replace('.', '');
    const digits = strValue.split('');
    
    // Create digit elements
    digits.forEach((digit, index) => {
      const digitEl = document.createElement('span');
      digitEl.className = 'odometer-digit';
      
      const innerEl = document.createElement('span');
      innerEl.className = 'odometer-digit-inner';
      innerEl.textContent = digit;
      
      digitEl.appendChild(innerEl);
      this.element.appendChild(digitEl);
      
      // Add decimal point
      if (index === digits.length - 2) {
        const decimal = document.createElement('span');
        decimal.className = 'odometer-decimal';
        decimal.textContent = '.';
        this.element.appendChild(decimal);
      }
      
      // Animate digit
      setTimeout(() => {
        innerEl.style.transform = `translateY(-${digit * 10}%)`;
      }, index * 100);
    });
    
    // Add unit
    const unit = document.createElement('span');
    unit.className = 'odometer-unit';
    unit.textContent = ' kg CO2e';
    this.element.appendChild(unit);
  }
}

// Enhanced initialization with celebration effects
function initializeResultAnimations(carbonValue, equivalents, previousValue = null) {
  // Check if this is a good result (lower than average)
  const isGoodResult = carbonValue < 10; // Threshold for celebration
  
  // Animate main carbon value with odometer style for special cases
  const carbonElement = document.querySelector('.carbon-value');
  if (carbonElement) {
    if (isGoodResult && carbonElement.classList.contains('use-odometer')) {
      const odometerAnimation = new OdometerAnimation(carbonElement);
      odometerAnimation.animate(carbonValue);
    } else {
      const carbonAnimation = new NumberAnimation(carbonElement, {
        duration: 1200,
        decimals: 1,
        suffix: ' kg CO2e'
      });
      carbonAnimation.animate(carbonValue);
    }
    
    // Trigger confetti for good results
    if (isGoodResult) {
      setTimeout(() => createConfetti(), 800);
    }
  }
  
  // Show comparison with previous calculation
  if (previousValue !== null) {
    const difference = carbonValue - previousValue;
    const changeElement = document.querySelector('.carbon-change');
    if (changeElement) {
      const changeAnimation = new NumberAnimation(changeElement, {
        duration: 1000,
        decimals: 1,
        prefix: difference > 0 ? '+' : '',
        suffix: ' kg'
      });
      changeAnimation.animate(difference);
      
      // Color code the change
      changeElement.classList.add(difference > 0 ? 'increase' : 'decrease');
    }
  }
  
  // Animate equivalents with staggered timing
  if (equivalents) {
    const animationDelay = 300;
    
    // Driving miles
    const drivingElement = document.querySelector('.equivalent-driving');
    if (drivingElement && equivalents.driving) {
      setTimeout(() => {
        const drivingAnimation = new CounterAnimation(drivingElement, {
          duration: 1500,
          suffix: ' miles'
        });
        drivingAnimation.animate(equivalents.driving);
      }, animationDelay);
    }
    
    // Phone charges
    const phoneElement = document.querySelector('.equivalent-phone');
    if (phoneElement && equivalents.phoneCharges) {
      setTimeout(() => {
        const phoneAnimation = new CounterAnimation(phoneElement, {
          duration: 1500,
          suffix: ' charges'
        });
        phoneAnimation.animate(equivalents.phoneCharges);
      }, animationDelay * 2);
    }
    
    // Tree months
    const treeElement = document.querySelector('.equivalent-tree');
    if (treeElement && equivalents.treeMonths) {
      setTimeout(() => {
        const treeAnimation = new NumberAnimation(treeElement, {
          duration: 1500,
          decimals: 0,
          suffix: ' months'
        });
        treeAnimation.animate(equivalents.treeMonths);
      }, animationDelay * 3);
    }
  }
  
  // Animate progress bar with color transition
  const progressBar = document.querySelector('.carbon-progress-fill');
  if (progressBar) {
    const progressAnimation = new ProgressAnimation(progressBar, {
      max: 50 // Max expected CO2 value for visualization
    });
    progressAnimation.animate(carbonValue);
    
    // Color based on value
    if (carbonValue < 10) {
      progressBar.style.backgroundColor = '#10B981'; // Green
    } else if (carbonValue < 25) {
      progressBar.style.backgroundColor = '#F59E0B'; // Yellow
    } else {
      progressBar.style.backgroundColor = '#EF4444'; // Red
    }
  }
  
  // Animate comparison bars if present
  const comparisonContainer = document.querySelector('.comparison-container');
  if (comparisonContainer) {
    const items = [
      { name: 'your-item', value: carbonValue },
      { name: 'average', value: 15 }, // Average value
      { name: 'sustainable', value: 5 } // Sustainable target
    ];
    
    const comparisonAnimation = new ComparisonAnimation(comparisonContainer, {
      items: items,
      duration: 1500
    });
    
    setTimeout(() => comparisonAnimation.animate(), 500);
  }
}

// Export for use in calculator
window.numberAnimations = {
  NumberAnimation,
  CounterAnimation,
  ProgressAnimation,
  ComparisonAnimation,
  OdometerAnimation,
  initializeResultAnimations,
  createConfetti
};