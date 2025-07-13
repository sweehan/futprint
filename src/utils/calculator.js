/**
 * Carbon Calculator Engine
 * Version: 1.0.0
 * 
 * Pure functions for calculating carbon footprint
 * All calculations return kg CO2e
 */

import { CARBON_DATA } from '/src/data/carbonData.js';

/**
 * Calculate the base carbon footprint for an item
 * @param {string} itemId - ID of the item (tshirt, jeans, etc.)
 * @param {string|object} material - Material ID or blend object
 * @param {string} locationId - Manufacturing location ID
 * @returns {object} Carbon footprint details
 */
export function calculateCarbon(itemId, material, locationId) {
  // Validate inputs
  const item = CARBON_DATA.ITEMS[itemId];
  if (!item) {
    throw new Error(`Invalid item ID: ${itemId}`);
  }

  const location = CARBON_DATA.LOCATIONS[locationId];
  if (!location) {
    throw new Error(`Invalid location ID: ${locationId}`);
  }

  // Get material multiplier
  let materialMultiplier;
  let materialName;
  let materialDetails;

  if (typeof material === 'string') {
    // Single material or pre-defined blend
    const mat = CARBON_DATA.MATERIALS[material] || CARBON_DATA.BLENDS[material];
    if (!mat) {
      throw new Error(`Invalid material ID: ${material}`);
    }
    materialMultiplier = mat.multiplier;
    materialName = mat.name;
    materialDetails = mat;
  } else if (typeof material === 'object' && material.components) {
    // Custom blend
    materialMultiplier = calculateBlendMultiplier(material.components);
    materialName = 'Custom Blend';
    materialDetails = material;
  } else {
    throw new Error('Invalid material format');
  }

  // Calculate emissions
  const manufacturing = item.baseCarbon * materialMultiplier * location.multiplier;
  const lifecycle = manufacturing * CARBON_DATA.CONSTANTS.lifecycleMultiplier;

  // Calculate ranges with uncertainty
  const manufacturingRange = {
    min: manufacturing * CARBON_DATA.CONSTANTS.uncertaintyLow,
    max: manufacturing * CARBON_DATA.CONSTANTS.uncertaintyHigh
  };

  const lifecycleRange = {
    min: lifecycle * CARBON_DATA.CONSTANTS.uncertaintyLow,
    max: lifecycle * CARBON_DATA.CONSTANTS.uncertaintyHigh
  };

  // Calculate breakdown
  const breakdown = calculateBreakdown(manufacturing, item);

  return {
    // Main values
    manufacturing: roundToDecimal(manufacturing, 1),
    lifecycle: roundToDecimal(lifecycle, 1),
    
    // Ranges
    manufacturingRange: {
      min: roundToDecimal(manufacturingRange.min, 1),
      max: roundToDecimal(manufacturingRange.max, 1)
    },
    lifecycleRange: {
      min: roundToDecimal(lifecycleRange.min, 1),
      max: roundToDecimal(lifecycleRange.max, 1)
    },
    
    // Breakdown by phase
    breakdown: {
      materials: roundToDecimal(breakdown.materials, 1),
      energy: roundToDecimal(breakdown.energy, 1),
      transport: roundToDecimal(breakdown.transport, 1),
      other: roundToDecimal(breakdown.other, 1),
      usePhase: roundToDecimal(manufacturing * 0.23, 1),
      endOfLife: roundToDecimal(manufacturing * 0.07, 1)
    },
    
    // Metadata
    inputs: {
      item: item.name,
      itemId: itemId,
      material: materialName,
      materialDetails: materialDetails,
      location: location.name,
      locationId: locationId
    },
    
    // Calculation details for transparency
    calculation: {
      baseCarbon: item.baseCarbon,
      materialMultiplier: roundToDecimal(materialMultiplier, 3),
      locationMultiplier: location.multiplier,
      lifecycleMultiplier: CARBON_DATA.CONSTANTS.lifecycleMultiplier,
      formula: `${item.baseCarbon} × ${roundToDecimal(materialMultiplier, 3)} × ${location.multiplier} = ${roundToDecimal(manufacturing, 1)}`
    }
  };
}

/**
 * Calculate multiplier for a custom blend of materials
 * @param {array} components - Array of {material: string, percentage: number}
 * @returns {number} Weighted average multiplier
 */
export function calculateBlendMultiplier(components) {
  // Validate components
  const totalPercentage = components.reduce((sum, comp) => sum + comp.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.1) {
    throw new Error(`Percentages must sum to 100% (current: ${totalPercentage}%)`);
  }

  // Calculate weighted average
  let multiplier = 0;
  components.forEach(component => {
    const material = CARBON_DATA.MATERIALS[component.material];
    if (!material) {
      throw new Error(`Invalid material in blend: ${component.material}`);
    }
    multiplier += (material.multiplier * component.percentage) / 100;
  });

  return multiplier;
}

/**
 * Calculate carbon breakdown by manufacturing phase
 * @param {number} totalCarbon - Total manufacturing carbon
 * @param {object} item - Item object with breakdown percentages
 * @returns {object} Carbon by phase
 */
function calculateBreakdown(totalCarbon, item) {
  return {
    materials: totalCarbon * (item.breakdown.materials / 100),
    energy: totalCarbon * (item.breakdown.energy / 100),
    transport: totalCarbon * (item.breakdown.transport / 100),
    other: totalCarbon * (item.breakdown.other / 100)
  };
}

/**
 * Apply location-specific adjustments
 * @param {number} baseValue - Base carbon value
 * @param {string} locationId - Location ID
 * @returns {number} Adjusted carbon value
 */
export function applyLocationMultiplier(baseValue, locationId) {
  const location = CARBON_DATA.LOCATIONS[locationId];
  if (!location) {
    throw new Error(`Invalid location ID: ${locationId}`);
  }
  return baseValue * location.multiplier;
}

/**
 * Calculate full lifecycle emissions from manufacturing
 * @param {number} manufacturingValue - Manufacturing emissions
 * @returns {number} Full lifecycle emissions
 */
export function calculateLifecycle(manufacturingValue) {
  return manufacturingValue * CARBON_DATA.CONSTANTS.lifecycleMultiplier;
}

/**
 * Get carbon equivalents for better understanding
 * @param {number} co2Value - CO2 in kg
 * @returns {object} Equivalent comparisons
 */
export function getEquivalents(co2Value) {
  return {
    driving: {
      value: roundToDecimal(co2Value * 2.5, 0), // ~0.4 kg CO2 per mile
      unit: 'miles',
      description: `Driving ${roundToDecimal(co2Value * 2.5, 0)} miles in an average car`
    },
    phoneCharging: {
      value: roundToDecimal(co2Value * 122, 0), // ~0.0082 kg CO2 per charge
      unit: 'charges',
      description: `Charging your smartphone ${roundToDecimal(co2Value * 122, 0)} times`
    },
    trees: {
      value: roundToDecimal(co2Value / 21.77, 1), // Tree absorbs ~21.77 kg CO2/year
      unit: 'tree-years',
      description: `CO2 absorbed by ${roundToDecimal(co2Value / 21.77, 1)} trees in one year`
    },
    flights: {
      value: roundToDecimal(co2Value / 90, 2), // ~90kg CO2 per hour of flight
      unit: 'flight hours',
      description: `${roundToDecimal(co2Value / 90, 2)} hours of flight time`
    },
    streaming: {
      value: roundToDecimal(co2Value / 0.055, 0), // ~55g CO2 per hour of streaming
      unit: 'hours',
      description: `Streaming video for ${roundToDecimal(co2Value / 0.055, 0)} hours`
    }
  };
}

/**
 * Compare two calculations
 * @param {object} calc1 - First calculation result
 * @param {object} calc2 - Second calculation result
 * @returns {object} Comparison details
 */
export function compareCalculations(calc1, calc2) {
  const diff = calc1.manufacturing - calc2.manufacturing;
  const percentDiff = ((diff / calc2.manufacturing) * 100);
  
  return {
    difference: roundToDecimal(Math.abs(diff), 1),
    percentageDifference: roundToDecimal(Math.abs(percentDiff), 1),
    better: diff < 0 ? 'first' : 'second',
    comparison: diff < 0 
      ? `${Math.abs(percentDiff).toFixed(1)}% lower emissions`
      : `${Math.abs(percentDiff).toFixed(1)}% higher emissions`
  };
}

/**
 * Get recommendations based on current selection
 * @param {object} calculation - Calculation result
 * @returns {array} Array of recommendations
 */
export function getRecommendations(calculation) {
  const recommendations = [];
  const currentMaterial = calculation.inputs.materialDetails;
  const currentLocation = CARBON_DATA.LOCATIONS[calculation.inputs.locationId];

  // Material recommendations
  if (currentMaterial && !currentMaterial.sustainable) {
    // Find sustainable alternatives
    const sustainableAlternatives = Object.values(CARBON_DATA.MATERIALS)
      .filter(mat => mat.sustainable && mat.multiplier < (currentMaterial.multiplier || 1))
      .sort((a, b) => a.multiplier - b.multiplier)
      .slice(0, 3);

    if (sustainableAlternatives.length > 0) {
      recommendations.push({
        type: 'material',
        title: 'Consider Sustainable Materials',
        description: `Switching to ${sustainableAlternatives[0].name} could reduce emissions by ${Math.round((1 - sustainableAlternatives[0].multiplier) * 100)}%`,
        alternatives: sustainableAlternatives
      });
    }
  }

  // Location recommendations
  if (currentLocation.multiplier > 1.1) {
    const cleanerLocations = Object.values(CARBON_DATA.LOCATIONS)
      .filter(loc => loc.multiplier < currentLocation.multiplier)
      .sort((a, b) => a.multiplier - b.multiplier)
      .slice(0, 3);

    recommendations.push({
      type: 'location',
      title: 'Cleaner Manufacturing Locations',
      description: `Manufacturing in ${cleanerLocations[0].name} could reduce emissions by ${Math.round((1 - cleanerLocations[0].multiplier/currentLocation.multiplier) * 100)}%`,
      alternatives: cleanerLocations
    });
  }

  // General recommendations
  if (calculation.manufacturing > 20) {
    recommendations.push({
      type: 'general',
      title: 'High Impact Item',
      description: 'Consider buying second-hand or choosing items designed for longevity',
      tips: [
        'Buy quality items that last longer',
        'Look for second-hand options',
        'Choose timeless designs over fast fashion'
      ]
    });
  }

  return recommendations;
}

/**
 * Validate calculation inputs
 * @param {string} itemId - Item ID
 * @param {string|object} material - Material ID or blend
 * @param {string} locationId - Location ID
 * @returns {object} Validation result
 */
export function validateInputs(itemId, material, locationId) {
  const errors = [];
  const warnings = [];

  // Check item
  if (!CARBON_DATA.ITEMS[itemId]) {
    errors.push(`Invalid item: ${itemId}`);
  }

  // Check material
  if (typeof material === 'string') {
    if (!CARBON_DATA.MATERIALS[material] && !CARBON_DATA.BLENDS[material]) {
      errors.push(`Invalid material: ${material}`);
    }
  } else if (typeof material === 'object') {
    if (!material.components || !Array.isArray(material.components)) {
      errors.push('Custom blend must have components array');
    }
  } else {
    errors.push('Material must be string ID or blend object');
  }

  // Check location
  if (!CARBON_DATA.LOCATIONS[locationId]) {
    errors.push(`Invalid location: ${locationId}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Utility function to round to specific decimal places
 * @param {number} value - Number to round
 * @param {number} decimals - Decimal places
 * @returns {number} Rounded number
 */
function roundToDecimal(value, decimals) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Export all calculator functions
 */
export default {
  calculateCarbon,
  calculateBlendMultiplier,
  applyLocationMultiplier,
  calculateLifecycle,
  getEquivalents,
  compareCalculations,
  getRecommendations,
  validateInputs
};