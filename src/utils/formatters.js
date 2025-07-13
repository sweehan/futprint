/**
 * Formatting Utilities for Carbon Calculator
 * Version: 1.0.0
 * 
 * Functions for formatting values for display
 */

/**
 * Format CO2 value with unit
 * @param {number} value - CO2 value in kg
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} Formatted string
 */
export function formatCO2(value, showDecimals = true) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  const formatted = showDecimals ? value.toFixed(1) : Math.round(value).toString();
  return `${formatted} kg CO₂e`;
}

/**
 * Format a range of CO2 values
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {string} Formatted range
 */
export function formatRange(min, max) {
  if (!min || !max) return '—';
  return `${min.toFixed(1)} - ${max.toFixed(1)} kg`;
}

/**
 * Format percentage
 * @param {number} value - Percentage value (0-100)
 * @param {boolean} showSign - Whether to show + or - sign
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, showSign = false) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  const formatted = value.toFixed(1);
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

/**
 * Format large numbers with commas
 * @param {number} value - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 0
  });
}

/**
 * Format equivalents for display
 * @param {object} equivalent - Equivalent object from calculator
 * @returns {string} Formatted equivalent
 */
export function formatEquivalent(equivalent) {
  if (!equivalent) return '';
  
  const { value, unit, description } = equivalent;
  
  // Special formatting for certain units
  switch (unit) {
    case 'miles':
      return `🚗 Driving ${formatNumber(value)} miles`;
    case 'charges':
      return `📱 ${formatNumber(value)} phone charges`;
    case 'tree-years':
      return `🌳 ${value.toFixed(1)} tree${value !== 1 ? 's' : ''} for a year`;
    case 'flight hours':
      return `✈️ ${value.toFixed(1)} hour${value !== 1 ? 's' : ''} of flight`;
    case 'hours':
      return `📺 ${formatNumber(value)} hours of streaming`;
    default:
      return description || `${formatNumber(value)} ${unit}`;
  }
}

/**
 * Get a human-readable comparison
 * @param {number} value1 - First value
 * @param {number} value2 - Second value
 * @returns {string} Comparison string
 */
export function formatComparison(value1, value2) {
  if (!value1 || !value2) return '';
  
  const difference = Math.abs(value1 - value2);
  const percentage = (difference / value2) * 100;
  
  if (value1 < value2) {
    return `${percentage.toFixed(0)}% lower`;
  } else if (value1 > value2) {
    return `${percentage.toFixed(0)}% higher`;
  } else {
    return 'Same impact';
  }
}

/**
 * Format material name with composition
 * @param {object} material - Material or blend object
 * @returns {string} Formatted material name
 */
export function formatMaterial(material) {
  if (!material) return '';
  
  if (material.components) {
    // It's a blend
    return material.components
      .map(comp => `${comp.percentage}% ${comp.material}`)
      .join(' / ');
  }
  
  return material.name || material;
}

/**
 * Get emoji for impact level
 * @param {number} co2Value - CO2 value in kg
 * @returns {string} Appropriate emoji
 */
export function getImpactEmoji(co2Value) {
  if (co2Value < 5) return '🟢';      // Low impact
  if (co2Value < 15) return '🟡';     // Medium impact
  if (co2Value < 30) return '🟠';     // High impact
  return '🔴';                        // Very high impact
}

/**
 * Get descriptive impact level
 * @param {number} co2Value - CO2 value in kg
 * @returns {object} Impact level details
 */
export function getImpactLevel(co2Value) {
  if (co2Value < 5) {
    return {
      level: 'low',
      label: 'Low Impact',
      color: '#10b981',
      emoji: '🟢',
      description: 'Great choice! This has a relatively low carbon footprint.'
    };
  }
  
  if (co2Value < 15) {
    return {
      level: 'medium',
      label: 'Medium Impact',
      color: '#f59e0b',
      emoji: '🟡',
      description: 'Moderate carbon footprint. Consider sustainable alternatives.'
    };
  }
  
  if (co2Value < 30) {
    return {
      level: 'high',
      label: 'High Impact',
      color: '#f97316',
      emoji: '🟠',
      description: 'High carbon footprint. Look for eco-friendly options.'
    };
  }
  
  return {
    level: 'very-high',
    label: 'Very High Impact',
    color: '#ef4444',
    emoji: '🔴',
    description: 'Very high carbon footprint. Consider alternatives or buy less frequently.'
  };
}

/**
 * Format calculation breakdown for display
 * @param {object} breakdown - Breakdown object from calculator
 * @returns {array} Array of formatted breakdown items
 */
export function formatBreakdown(breakdown) {
  if (!breakdown) return [];
  
  const items = [
    { label: '🧵 Materials', value: breakdown.materials, percentage: 28 },
    { label: '⚡ Energy', value: breakdown.energy, percentage: 35 },
    { label: '🚚 Transport', value: breakdown.transport, percentage: 10 },
    { label: '🏭 Other', value: breakdown.other, percentage: 27 }
  ];
  
  return items.map(item => ({
    ...item,
    formattedValue: formatCO2(item.value),
    formattedPercentage: formatPercentage(item.percentage)
  }));
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format location with flag
 * @param {object} location - Location object
 * @returns {string} Formatted location
 */
export function formatLocation(location) {
  if (!location) return '';
  
  return `${location.flag || ''} ${location.name}`.trim();
}

/**
 * Get progress bar segments
 * @param {number} currentStep - Current step (1-4)
 * @param {number} totalSteps - Total steps
 * @returns {array} Array of segment states
 */
export function getProgressSegments(currentStep, totalSteps = 4) {
  const segments = [];
  
  for (let i = 1; i <= totalSteps; i++) {
    segments.push({
      step: i,
      status: i < currentStep ? 'completed' : i === currentStep ? 'active' : 'pending',
      percentage: (i / totalSteps) * 100
    });
  }
  
  return segments;
}

/**
 * Format file size (for potential data exports)
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create shareable text for results
 * @param {object} calculation - Calculation result
 * @returns {string} Shareable text
 */
export function createShareText(calculation) {
  const { inputs, manufacturing, lifecycle } = calculation;
  const impact = getImpactLevel(manufacturing);
  
  return `I calculated the carbon footprint of a ${inputs.item}:
${impact.emoji} ${formatCO2(manufacturing)} (manufacturing)
📊 ${formatCO2(lifecycle)} (full lifecycle)

Material: ${inputs.material}
Made in: ${inputs.location}

Calculate your fashion footprint: [Your Website URL]
#SustainableFashion #CarbonFootprint`;
}

/**
 * Export all formatting functions
 */
export default {
  formatCO2,
  formatRange,
  formatPercentage,
  formatNumber,
  formatEquivalent,
  formatComparison,
  formatMaterial,
  getImpactEmoji,
  getImpactLevel,
  formatBreakdown,
  formatDate,
  formatLocation,
  getProgressSegments,
  formatFileSize,
  createShareText
};