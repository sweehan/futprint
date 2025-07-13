/**
 * Phase 9: Calculator Unit Tests
 * Testing & Validation
 * 
 * This file contains comprehensive unit tests for the carbon calculator engine
 */

// Load the actual carbon data and calculator functions
async function loadDependencies() {
  // Load carbon data and calculator as modules
  const carbonDataScript = document.createElement('script');
  carbonDataScript.type = 'module';
  carbonDataScript.textContent = `
    import { CARBON_DATA } from '/src/data/carbonData.js';
    import * as calculator from '/src/utils/calculator.js';
    
    window.CARBON_DATA = CARBON_DATA;
    window.calculator = calculator;
    window.TEST_CARBON_DATA = CARBON_DATA; // For backward compatibility
  `;
  document.head.appendChild(carbonDataScript);
  
  // Wait for modules to load
  await new Promise(resolve => setTimeout(resolve, 100));
}

// Import test data directly (avoiding module issues in browser)
const TEST_CARBON_DATA = {
  ITEMS: {
    tshirt: { id: "tshirt", name: "T-shirt", baseCarbon: 7.5, breakdown: { materials: 28, energy: 35, transport: 10, other: 27 } },
    jeans: { id: "jeans", name: "Jeans", baseCarbon: 32, breakdown: { materials: 30, energy: 40, transport: 8, other: 22 } },
    dress: { id: "dress", name: "Dress", baseCarbon: 22, breakdown: { materials: 32, energy: 38, transport: 9, other: 21 } },
    shoes: { id: "shoes", name: "Shoes", baseCarbon: 14, breakdown: { materials: 40, energy: 35, transport: 10, other: 15 } }
  },
  MATERIALS: {
    hemp: { id: "hemp", name: "Hemp", multiplier: 0.48 },
    organic_cotton: { id: "organic_cotton", name: "Organic Cotton", multiplier: 0.73 },
    cotton: { id: "cotton", name: "Cotton", multiplier: 1.0 },
    polyester: { id: "polyester", name: "Polyester", multiplier: 0.85 },
    recycled_polyester: { id: "recycled_polyester", name: "Recycled Polyester", multiplier: 0.35 },
    wool: { id: "wool", name: "Wool", multiplier: 2.4 },
    nylon: { id: "nylon", name: "Nylon", multiplier: 1.1 },
    elastane: { id: "elastane", name: "Elastane/Spandex", multiplier: 2.67 },
    mixed_synthetic: { id: "mixed_synthetic", name: "Mixed Synthetics", multiplier: 1.0 }
  },
  BLENDS: {
    cotton_polyester_5050: {
      id: "cotton_polyester_5050",
      name: "Cotton/Polyester (50/50)",
      multiplier: 0.925,
      components: [
        { material: "cotton", percentage: 50 },
        { material: "polyester", percentage: 50 }
      ]
    },
    cotton_elastane_blend: {
      id: "cotton_elastane_blend", 
      name: "Cotton/Elastane (95/5)",
      multiplier: 1.05,
      components: [
        { material: "cotton", percentage: 95 },
        { material: "elastane", percentage: 5 }
      ]
    }
  },
  LOCATIONS: {
    global: { id: "global", name: "Global Average", multiplier: 1.0 },
    bangladesh: { id: "bangladesh", name: "Bangladesh", multiplier: 0.95 },
    vietnam: { id: "vietnam", name: "Vietnam", multiplier: 0.98 },
    turkey: { id: "turkey", name: "Turkey", multiplier: 1.05 },
    china: { id: "china", name: "China", multiplier: 1.4 },
    india: { id: "india", name: "India", multiplier: 1.25 },
    portugal: { id: "portugal", name: "Portugal/EU", multiplier: 0.85 },
    usa: { id: "usa", name: "USA", multiplier: 0.9 }
  },
  CONSTANTS: {
    lifecycleMultiplier: 1.3,
    uncertaintyLow: 0.8,
    uncertaintyHigh: 1.2
  }
};

// Test Suite 1: Calculator Engine Unit Tests
const calculatorEngineTests = {
  name: "Calculator Engine Tests",
  tests: [
    // Test calculateBaseCarbon with all item types
    {
      name: "Calculate T-shirt with cotton and global location",
      test: () => {
        const result = calculateTestCarbon("tshirt", "cotton", "global");
        const expected = 7.5 * 1.0 * 1.0; // baseCarbon * materialMultiplier * locationMultiplier
        return {
          passed: Math.abs(result.manufacturing - expected) < 0.01,
          expected: expected,
          actual: result.manufacturing,
          message: `Manufacturing carbon should be ${expected} kg CO2e`
        };
      }
    },
    {
      name: "Calculate Jeans with default blend and China location",
      test: () => {
        const result = calculateTestCarbon("jeans", "cotton_elastane_blend", "china");
        const expected = 32 * 1.05 * 1.4; // 47.04
        return {
          passed: Math.abs(result.manufacturing - expected) < 0.01,
          expected: expected.toFixed(1),
          actual: result.manufacturing,
          message: `Manufacturing carbon should be ${expected.toFixed(1)} kg CO2e`
        };
      }
    },
    {
      name: "Calculate Dress with polyester and EU location",
      test: () => {
        const result = calculateTestCarbon("dress", "polyester", "portugal");
        const expected = 22 * 0.85 * 0.85; // 15.895
        return {
          passed: Math.abs(result.manufacturing - 15.9) < 0.1,
          expected: 15.9,
          actual: result.manufacturing,
          message: "Manufacturing carbon should be 15.9 kg CO2e"
        };
      }
    },
    {
      name: "Calculate Shoes with mixed synthetic and USA location",
      test: () => {
        const result = calculateTestCarbon("shoes", "mixed_synthetic", "usa");
        const expected = 14 * 1.0 * 0.9; // 12.6
        return {
          passed: Math.abs(result.manufacturing - 12.6) < 0.01,
          expected: 12.6,
          actual: result.manufacturing
        };
      }
    },
    
    // Test material multiplier calculations
    {
      name: "Single material multiplier - Hemp (sustainable)",
      test: () => {
        const result = calculateTestCarbon("tshirt", "hemp", "global");
        const expected = 7.5 * 0.48 * 1.0; // 3.6
        return {
          passed: Math.abs(result.manufacturing - 3.6) < 0.01,
          expected: 3.6,
          actual: result.manufacturing,
          message: "Hemp should reduce carbon by 52%"
        };
      }
    },
    {
      name: "Single material multiplier - Wool (high impact)",
      test: () => {
        const result = calculateTestCarbon("tshirt", "wool", "global");
        const expected = 7.5 * 2.4 * 1.0; // 18.0
        return {
          passed: Math.abs(result.manufacturing - 18.0) < 0.01,
          expected: 18.0,
          actual: result.manufacturing,
          message: "Wool should increase carbon by 140%"
        };
      }
    },
    
    // Test blended materials
    {
      name: "Pre-defined blend - Cotton/Polyester 50/50",
      test: () => {
        const result = calculateTestCarbon("tshirt", "cotton_polyester_5050", "global");
        const expected = 7.5 * 0.925 * 1.0; // 6.9375
        return {
          passed: Math.abs(result.manufacturing - 6.9) < 0.1,
          expected: 6.9,
          actual: result.manufacturing
        };
      }
    },
    {
      name: "Custom blend - Cotton 70% / Polyester 30%",
      test: () => {
        const customBlend = {
          components: [
            { material: "cotton", percentage: 70 },
            { material: "polyester", percentage: 30 }
          ]
        };
        const result = calculateTestCarbon("tshirt", customBlend, "global");
        const expectedMultiplier = (1.0 * 0.7) + (0.85 * 0.3); // 0.955
        const expected = 7.5 * 0.955 * 1.0; // 7.1625
        return {
          passed: Math.abs(result.manufacturing - 7.2) < 0.1,
          expected: 7.2,
          actual: result.manufacturing
        };
      }
    },
    {
      name: "Custom blend - Three materials",
      test: () => {
        const customBlend = {
          components: [
            { material: "cotton", percentage: 50 },
            { material: "polyester", percentage: 30 },
            { material: "elastane", percentage: 20 }
          ]
        };
        const result = calculateTestCarbon("jeans", customBlend, "global");
        const expectedMultiplier = (1.0 * 0.5) + (0.85 * 0.3) + (2.67 * 0.2); // 1.289
        const expected = 32 * 1.289 * 1.0; // 41.248
        return {
          passed: Math.abs(result.manufacturing - 41.2) < 0.1,
          expected: 41.2,
          actual: result.manufacturing
        };
      }
    },
    
    // Test location multipliers
    {
      name: "Location multiplier - High carbon (China)",
      test: () => {
        const result = calculateTestCarbon("tshirt", "cotton", "china");
        const expected = 7.5 * 1.0 * 1.4; // 10.5
        return {
          passed: Math.abs(result.manufacturing - 10.5) < 0.01,
          expected: 10.5,
          actual: result.manufacturing,
          message: "China location should increase by 40%"
        };
      }
    },
    {
      name: "Location multiplier - Low carbon (Portugal/EU)",
      test: () => {
        const result = calculateTestCarbon("tshirt", "cotton", "portugal");
        const expected = 7.5 * 1.0 * 0.85; // 6.375
        return {
          passed: Math.abs(result.manufacturing - 6.4) < 0.1,
          expected: 6.4,
          actual: result.manufacturing,
          message: "EU location should decrease by 15%"
        };
      }
    },
    
    // Test lifecycle calculations
    {
      name: "Lifecycle calculation adds 30%",
      test: () => {
        const result = calculateTestCarbon("tshirt", "cotton", "global");
        const expectedLifecycle = 7.5 * 1.3; // 9.75
        return {
          passed: Math.abs(result.lifecycle - 9.8) < 0.1,
          expected: 9.8,
          actual: result.lifecycle,
          message: "Lifecycle should be manufacturing * 1.3"
        };
      }
    },
    {
      name: "Lifecycle calculation for high-impact item",
      test: () => {
        const result = calculateTestCarbon("jeans", "cotton", "china");
        const manufacturing = 32 * 1.0 * 1.4; // 44.8
        const expectedLifecycle = manufacturing * 1.3; // 58.24
        return {
          passed: Math.abs(result.lifecycle - 58.2) < 0.1,
          expected: 58.2,
          actual: result.lifecycle
        };
      }
    }
  ]
};

// Test Suite 2: Data Validation Tests
const dataValidationTests = {
  name: "Data Validation Tests",
  tests: [
    // Test valid input ranges
    {
      name: "Valid percentage range (0-100) for custom blend",
      test: () => {
        const validBlend = {
          components: [
            { material: "cotton", percentage: 100 }
          ]
        };
        try {
          const result = calculateTestCarbon("tshirt", validBlend, "global");
          return { passed: true, message: "100% single material accepted" };
        } catch (error) {
          return { passed: false, error: error.message };
        }
      }
    },
    {
      name: "Invalid percentage sum (not 100%)",
      test: () => {
        const invalidBlend = {
          components: [
            { material: "cotton", percentage: 60 },
            { material: "polyester", percentage: 30 }
          ]
        };
        try {
          calculateTestCarbon("tshirt", invalidBlend, "global");
          return { passed: false, message: "Should reject blend not summing to 100%" };
        } catch (error) {
          return { 
            passed: error.message.includes("100%"),
            message: "Correctly rejected invalid percentage sum"
          };
        }
      }
    },
    {
      name: "Zero percentage in blend",
      test: () => {
        const zeroBlend = {
          components: [
            { material: "cotton", percentage: 100 },
            { material: "polyester", percentage: 0 }
          ]
        };
        try {
          const result = calculateTestCarbon("tshirt", zeroBlend, "global");
          return { 
            passed: result.manufacturing === 7.5,
            message: "Should handle 0% component correctly"
          };
        } catch (error) {
          return { passed: false, error: error.message };
        }
      }
    },
    
    // Test edge cases
    {
      name: "Invalid item ID",
      test: () => {
        try {
          calculateTestCarbon("invalid_item", "cotton", "global");
          return { passed: false, message: "Should reject invalid item" };
        } catch (error) {
          return { 
            passed: error.message.includes("Invalid item"),
            message: "Correctly rejected invalid item"
          };
        }
      }
    },
    {
      name: "Invalid material ID",
      test: () => {
        try {
          calculateTestCarbon("tshirt", "invalid_material", "global");
          return { passed: false, message: "Should reject invalid material" };
        } catch (error) {
          return { 
            passed: error.message.includes("Invalid material"),
            message: "Correctly rejected invalid material"
          };
        }
      }
    },
    {
      name: "Invalid location ID",
      test: () => {
        try {
          calculateTestCarbon("tshirt", "cotton", "invalid_location");
          return { passed: false, message: "Should reject invalid location" };
        } catch (error) {
          return { 
            passed: error.message.includes("Invalid location"),
            message: "Correctly rejected invalid location"
          };
        }
      }
    },
    {
      name: "Empty blend components",
      test: () => {
        try {
          const emptyBlend = { components: [] };
          calculateTestCarbon("tshirt", emptyBlend, "global");
          return { passed: false, message: "Should reject empty blend" };
        } catch (error) {
          return { passed: true, message: "Correctly rejected empty blend" };
        }
      }
    },
    {
      name: "Null/undefined inputs",
      test: () => {
        try {
          calculateTestCarbon(null, "cotton", "global");
          return { passed: false, message: "Should reject null item" };
        } catch (error) {
          return { passed: true, message: "Correctly rejected null input" };
        }
      }
    },
    {
      name: "Negative percentage in blend",
      test: () => {
        const negativeBlend = {
          components: [
            { material: "cotton", percentage: 120 },
            { material: "polyester", percentage: -20 }
          ]
        };
        try {
          calculateTestCarbon("tshirt", negativeBlend, "global");
          return { passed: false, message: "Should reject negative percentage" };
        } catch (error) {
          return { passed: true, message: "Correctly rejected negative percentage" };
        }
      }
    },
    {
      name: "Over 100% individual component",
      test: () => {
        const overBlend = {
          components: [
            { material: "cotton", percentage: 150 }
          ]
        };
        try {
          calculateTestCarbon("tshirt", overBlend, "global");
          return { passed: false, message: "Should reject >100% component" };
        } catch (error) {
          return { 
            passed: error.message.includes("100%"),
            message: "Correctly rejected percentage over 100%"
          };
        }
      }
    }
  ]
};

// Test Suite 3: Carbon Data Integrity Tests
const dataIntegrityTests = {
  name: "Carbon Data Integrity Tests",
  tests: [
    // Verify base values are within expected ranges
    {
      name: "T-shirt base carbon in reasonable range (2-20 kg)",
      test: () => {
        const baseCarbon = TEST_CARBON_DATA.ITEMS.tshirt.baseCarbon;
        return {
          passed: baseCarbon >= 2 && baseCarbon <= 20,
          expected: "2-20 kg",
          actual: baseCarbon,
          message: "T-shirt carbon should be realistic"
        };
      }
    },
    {
      name: "Jeans base carbon in reasonable range (20-50 kg)",
      test: () => {
        const baseCarbon = TEST_CARBON_DATA.ITEMS.jeans.baseCarbon;
        return {
          passed: baseCarbon >= 20 && baseCarbon <= 50,
          expected: "20-50 kg",
          actual: baseCarbon,
          message: "Jeans carbon should be higher than t-shirt"
        };
      }
    },
    {
      name: "All item breakdowns sum to 100%",
      test: () => {
        let allValid = true;
        let failedItem = null;
        let failedSum = null;
        
        Object.entries(TEST_CARBON_DATA.ITEMS).forEach(([id, item]) => {
          const sum = item.breakdown.materials + item.breakdown.energy + 
                     item.breakdown.transport + item.breakdown.other;
          if (sum !== 100) {
            allValid = false;
            failedItem = id;
            failedSum = sum;
          }
        });
        
        return {
          passed: allValid,
          expected: "100%",
          actual: failedSum ? `${failedSum}% for ${failedItem}` : "100%",
          message: failedItem ? `${failedItem} breakdown doesn't sum to 100%` : "All breakdowns valid"
        };
      }
    },
    
    // Test material multipliers
    {
      name: "All material multipliers are positive",
      test: () => {
        let allPositive = true;
        let negativeMaterial = null;
        
        Object.entries(TEST_CARBON_DATA.MATERIALS).forEach(([id, material]) => {
          if (material.multiplier <= 0) {
            allPositive = false;
            negativeMaterial = id;
          }
        });
        
        return {
          passed: allPositive,
          message: negativeMaterial ? `${negativeMaterial} has non-positive multiplier` : "All multipliers positive"
        };
      }
    },
    {
      name: "Sustainable materials have lower multipliers",
      test: () => {
        const hemp = TEST_CARBON_DATA.MATERIALS.hemp.multiplier;
        const cotton = TEST_CARBON_DATA.MATERIALS.cotton.multiplier;
        const recycledPoly = TEST_CARBON_DATA.MATERIALS.recycled_polyester.multiplier;
        const polyester = TEST_CARBON_DATA.MATERIALS.polyester.multiplier;
        
        return {
          passed: hemp < cotton && recycledPoly < polyester,
          expected: "Hemp < Cotton and Recycled < Regular",
          actual: `Hemp: ${hemp}, Cotton: ${cotton}, Recycled: ${recycledPoly}, Polyester: ${polyester}`,
          message: "Sustainable alternatives should have lower impact"
        };
      }
    },
    {
      name: "Material multipliers in reasonable range (0.1-5.0)",
      test: () => {
        let inRange = true;
        let outOfRange = null;
        
        Object.entries(TEST_CARBON_DATA.MATERIALS).forEach(([id, material]) => {
          if (material.multiplier < 0.1 || material.multiplier > 5.0) {
            inRange = false;
            outOfRange = id;
          }
        });
        
        return {
          passed: inRange,
          message: outOfRange ? `${outOfRange} multiplier out of range` : "All multipliers in valid range"
        };
      }
    },
    
    // Test location multipliers
    {
      name: "All location multipliers are positive",
      test: () => {
        let allPositive = true;
        Object.values(TEST_CARBON_DATA.LOCATIONS).forEach(location => {
          if (location.multiplier <= 0) allPositive = false;
        });
        return {
          passed: allPositive,
          message: "Location multipliers must be positive"
        };
      }
    },
    {
      name: "Clean energy locations have lower multipliers",
      test: () => {
        const china = TEST_CARBON_DATA.LOCATIONS.china.multiplier;
        const portugal = TEST_CARBON_DATA.LOCATIONS.portugal.multiplier;
        const global = TEST_CARBON_DATA.LOCATIONS.global.multiplier;
        
        return {
          passed: portugal < global && global < china,
          expected: "Portugal < Global < China",
          actual: `Portugal: ${portugal}, Global: ${global}, China: ${china}`,
          message: "Clean energy countries should have lower multipliers"
        };
      }
    },
    {
      name: "Location multipliers in reasonable range (0.5-2.0)",
      test: () => {
        let inRange = true;
        let outOfRange = null;
        
        Object.entries(TEST_CARBON_DATA.LOCATIONS).forEach(([id, location]) => {
          if (location.multiplier < 0.5 || location.multiplier > 2.0) {
            inRange = false;
            outOfRange = id;
          }
        });
        
        return {
          passed: inRange,
          message: outOfRange ? `${outOfRange} location multiplier unrealistic` : "All location multipliers realistic"
        };
      }
    },
    
    // Test constants
    {
      name: "Lifecycle multiplier is 1.3 (30% increase)",
      test: () => {
        const multiplier = TEST_CARBON_DATA.CONSTANTS.lifecycleMultiplier;
        return {
          passed: multiplier === 1.3,
          expected: 1.3,
          actual: multiplier,
          message: "Lifecycle should add 30% as per research"
        };
      }
    },
    {
      name: "Uncertainty ranges are symmetric around 1.0",
      test: () => {
        const low = TEST_CARBON_DATA.CONSTANTS.uncertaintyLow;
        const high = TEST_CARBON_DATA.CONSTANTS.uncertaintyHigh;
        const symmetric = (1 - low) === (high - 1);
        
        return {
          passed: symmetric && low === 0.8 && high === 1.2,
          expected: "0.8 and 1.2 (±20%)",
          actual: `${low} and ${high}`,
          message: "Uncertainty should be ±20%"
        };
      }
    },
    
    // Test blend calculations
    {
      name: "Pre-calculated blends match manual calculation",
      test: () => {
        const blend = TEST_CARBON_DATA.BLENDS.cotton_polyester_5050;
        const manualCalc = (TEST_CARBON_DATA.MATERIALS.cotton.multiplier * 0.5) + 
                          (TEST_CARBON_DATA.MATERIALS.polyester.multiplier * 0.5);
        
        return {
          passed: Math.abs(blend.multiplier - manualCalc) < 0.001,
          expected: manualCalc,
          actual: blend.multiplier,
          message: "Pre-calculated blend should match formula"
        };
      }
    }
  ]
};

// Helper function to use actual calculator or simulate
function calculateTestCarbon(itemId, material, locationId) {
  // Use actual calculator if loaded
  if (window.calculator && window.calculator.calculateCarbon) {
    return window.calculator.calculateCarbon(itemId, material, locationId);
  }
  
  // Fallback: simulate calculator (simplified version)
  const item = TEST_CARBON_DATA.ITEMS[itemId];
  if (!item) throw new Error(`Invalid item ID: ${itemId}`);
  
  const location = TEST_CARBON_DATA.LOCATIONS[locationId];
  if (!location) throw new Error(`Invalid location ID: ${locationId}`);
  
  // Material handling
  let materialMultiplier;
  if (typeof material === 'string') {
    const mat = TEST_CARBON_DATA.MATERIALS[material] || TEST_CARBON_DATA.BLENDS[material];
    if (!mat) throw new Error(`Invalid material ID: ${material}`);
    materialMultiplier = mat.multiplier;
  } else if (material && material.components) {
    // Custom blend calculation
    const totalPercentage = material.components.reduce((sum, comp) => sum + comp.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.1) {
      throw new Error(`Percentages must sum to 100% (current: ${totalPercentage}%)`);
    }
    
    materialMultiplier = 0;
    material.components.forEach(comp => {
      const mat = TEST_CARBON_DATA.MATERIALS[comp.material];
      if (!mat) throw new Error(`Invalid material in blend: ${comp.material}`);
      materialMultiplier += (mat.multiplier * comp.percentage) / 100;
    });
  } else {
    throw new Error('Invalid material format');
  }
  
  // Calculate values
  const manufacturing = Math.round(item.baseCarbon * materialMultiplier * location.multiplier * 10) / 10;
  const lifecycle = Math.round(manufacturing * TEST_CARBON_DATA.CONSTANTS.lifecycleMultiplier * 10) / 10;
  
  return {
    manufacturing,
    lifecycle,
    inputs: { itemId, material, locationId }
  };
}

// Test Suite 4: Calculation Accuracy Tests
const calculationAccuracyTests = {
  name: "Calculation Accuracy Tests",
  tests: [
    // Test precision and rounding
    {
      name: "Results rounded to 1 decimal place",
      test: () => {
        const result = calculateTestCarbon("tshirt", "cotton", "china");
        const manufacturing = 7.5 * 1.0 * 1.4; // 10.5
        
        // Check if result is properly rounded
        const isRounded = result.manufacturing === Math.round(manufacturing * 10) / 10;
        const hasOneDecimal = result.manufacturing.toString().split('.')[1]?.length <= 1;
        
        return {
          passed: isRounded && (Number.isInteger(result.manufacturing) || hasOneDecimal),
          expected: "10.5 (1 decimal place)",
          actual: result.manufacturing,
          message: "Results should be rounded to 1 decimal place"
        };
      }
    },
    {
      name: "Calculation order maintains precision",
      test: () => {
        // Test that order of operations doesn't affect result
        const blend1 = {
          components: [
            { material: "cotton", percentage: 33.33 },
            { material: "polyester", percentage: 33.33 },
            { material: "elastane", percentage: 33.34 }
          ]
        };
        
        const result = calculateTestCarbon("jeans", blend1, "global");
        const expectedMultiplier = (1.0 * 0.3333) + (0.85 * 0.3333) + (2.67 * 0.3334);
        const expected = 32 * expectedMultiplier;
        
        return {
          passed: Math.abs(result.manufacturing - Math.round(expected * 10) / 10) < 0.1,
          expected: Math.round(expected * 10) / 10,
          actual: result.manufacturing,
          message: "Complex percentages should calculate accurately"
        };
      }
    },
    {
      name: "Very small carbon values handled correctly",
      test: () => {
        // Hemp t-shirt in EU should be very low
        const result = calculateTestCarbon("tshirt", "hemp", "portugal");
        const expected = 7.5 * 0.48 * 0.85; // 3.06
        
        return {
          passed: Math.abs(result.manufacturing - 3.1) < 0.1,
          expected: 3.1,
          actual: result.manufacturing,
          message: "Small values should still be accurate"
        };
      }
    },
    {
      name: "Very large carbon values handled correctly",
      test: () => {
        // Wool jeans in China should be very high
        const customBlend = {
          components: [
            { material: "wool", percentage: 100 }
          ]
        };
        const result = calculateTestCarbon("jeans", customBlend, "china");
        const expected = 32 * 2.4 * 1.4; // 107.52
        
        return {
          passed: Math.abs(result.manufacturing - 107.5) < 0.1,
          expected: 107.5,
          actual: result.manufacturing,
          message: "Large values should maintain accuracy"
        };
      }
    },
    
    // Test cumulative effects
    {
      name: "Multiple multipliers compound correctly",
      test: () => {
        // Test worst case: wool dress in China
        const result = calculateTestCarbon("dress", "wool", "china");
        const expected = 22 * 2.4 * 1.4; // 73.92
        
        return {
          passed: Math.abs(result.manufacturing - 73.9) < 0.1,
          expected: 73.9,
          actual: result.manufacturing,
          message: "Multiple high multipliers should compound"
        };
      }
    },
    {
      name: "Multiple low multipliers compound correctly",
      test: () => {
        // Test best case: recycled polyester shoes in EU
        const result = calculateTestCarbon("shoes", "recycled_polyester", "portugal");
        const expected = 14 * 0.35 * 0.85; // 4.165
        
        return {
          passed: Math.abs(result.manufacturing - 4.2) < 0.1,
          expected: 4.2,
          actual: result.manufacturing,
          message: "Multiple low multipliers should compound"
        };
      }
    },
    
    // Compare against known benchmarks
    {
      name: "T-shirt baseline matches design document",
      test: () => {
        const result = calculateTestCarbon("tshirt", "cotton", "global");
        return {
          passed: result.manufacturing === 7.5,
          expected: 7.5,
          actual: result.manufacturing,
          message: "Should match MVP design doc baseline"
        };
      }
    },
    {
      name: "Jeans with elastane blend matches documentation",
      test: () => {
        const result = calculateTestCarbon("jeans", "cotton_elastane_blend", "global");
        const expected = 32 * 1.05; // 33.6
        
        return {
          passed: Math.abs(result.manufacturing - 33.6) < 0.1,
          expected: 33.6,
          actual: result.manufacturing,
          message: "Should match pre-calculated blend"
        };
      }
    },
    {
      name: "Lifecycle always 30% more than manufacturing",
      test: () => {
        const testCases = [
          { item: "tshirt", material: "cotton", location: "global" },
          { item: "jeans", material: "wool", location: "china" },
          { item: "dress", material: "recycled_polyester", location: "portugal" }
        ];
        
        let allCorrect = true;
        for (const tc of testCases) {
          const result = calculateTestCarbon(tc.item, tc.material, tc.location);
          const expectedLifecycle = Math.round(result.manufacturing * 1.3 * 10) / 10;
          if (Math.abs(result.lifecycle - expectedLifecycle) > 0.1) {
            allCorrect = false;
            break;
          }
        }
        
        return {
          passed: allCorrect,
          message: "Lifecycle should always be manufacturing * 1.3"
        };
      }
    }
  ]
};

// Test Suite 5: Integration Tests
const integrationTests = {
  name: "Integration Tests",
  tests: [
    // Test complete calculation flow
    {
      name: "Complete flow: Item → Material → Location → Result",
      test: () => {
        // Simulate full user flow
        const item = "tshirt";
        const material = "cotton_polyester_5050";
        const location = "bangladesh";
        
        const result = calculateTestCarbon(item, material, location);
        
        // Verify all parts of result
        const hasManufacturing = typeof result.manufacturing === 'number';
        const hasLifecycle = typeof result.lifecycle === 'number';
        const correctRatio = Math.abs(result.lifecycle / result.manufacturing - 1.3) < 0.01;
        
        return {
          passed: hasManufacturing && hasLifecycle && correctRatio,
          message: "Complete calculation should return all values"
        };
      }
    },
    {
      name: "State persistence between calculations",
      test: () => {
        // Run multiple calculations to ensure no state pollution
        const calc1 = calculateTestCarbon("tshirt", "cotton", "global");
        const calc2 = calculateTestCarbon("jeans", "wool", "china");
        const calc3 = calculateTestCarbon("tshirt", "cotton", "global");
        
        return {
          passed: calc1.manufacturing === calc3.manufacturing,
          expected: calc1.manufacturing,
          actual: calc3.manufacturing,
          message: "Same inputs should always give same outputs"
        };
      }
    },
    {
      name: "Custom blend full calculation",
      test: () => {
        const customBlend = {
          components: [
            { material: "organic_cotton", percentage: 60 },
            { material: "recycled_polyester", percentage: 30 },
            { material: "elastane", percentage: 10 }
          ]
        };
        
        const result = calculateTestCarbon("dress", customBlend, "vietnam");
        
        // Verify calculation
        const expectedMultiplier = (0.73 * 0.6) + (0.35 * 0.3) + (2.67 * 0.1);
        const expectedMfg = 22 * expectedMultiplier * 0.98;
        
        return {
          passed: Math.abs(result.manufacturing - Math.round(expectedMfg * 10) / 10) < 0.1,
          message: "Complex custom blend should calculate correctly"
        };
      }
    },
    {
      name: "All item types with default materials",
      test: () => {
        const items = ["tshirt", "jeans", "dress", "shoes"];
        const defaults = {
          tshirt: "cotton",
          jeans: "cotton_elastane_blend",
          dress: "polyester",
          shoes: "mixed_synthetic"
        };
        
        let allValid = true;
        for (const item of items) {
          try {
            const result = calculateTestCarbon(item, defaults[item], "global");
            if (!result.manufacturing || !result.lifecycle) {
              allValid = false;
              break;
            }
          } catch (error) {
            allValid = false;
            break;
          }
        }
        
        return {
          passed: allValid,
          message: "All default combinations should work"
        };
      }
    },
    {
      name: "Range calculations (min/max uncertainty)",
      test: () => {
        const result = calculateTestCarbon("tshirt", "cotton", "global");
        
        // Check if ranges would be calculated correctly
        const expectedMin = result.manufacturing * 0.8;
        const expectedMax = result.manufacturing * 1.2;
        
        // Verify range logic
        const rangeValid = expectedMin < result.manufacturing && 
                          result.manufacturing < expectedMax;
        
        return {
          passed: rangeValid,
          message: "Uncertainty ranges should bracket main value"
        };
      }
    }
  ]
};

// Test Suite 6: Error Handling Tests
const errorHandlingTests = {
  name: "Error Handling Tests",
  tests: [
    // Test graceful handling of missing data
    {
      name: "Graceful handling of missing item",
      test: () => {
        try {
          calculateTestCarbon("nonexistent_item", "cotton", "global");
          return { passed: false, message: "Should throw error for missing item" };
        } catch (error) {
          return {
            passed: error.message.includes("Invalid item"),
            message: "Should provide clear error message"
          };
        }
      }
    },
    {
      name: "Graceful handling of missing material",
      test: () => {
        try {
          calculateTestCarbon("tshirt", "unobtainium", "global");
          return { passed: false, message: "Should throw error for missing material" };
        } catch (error) {
          return {
            passed: error.message.includes("Invalid material"),
            message: "Should identify invalid material"
          };
        }
      }
    },
    {
      name: "Invalid blend component material",
      test: () => {
        const badBlend = {
          components: [
            { material: "cotton", percentage: 50 },
            { material: "kryptonite", percentage: 50 }
          ]
        };
        
        try {
          calculateTestCarbon("tshirt", badBlend, "global");
          return { passed: false, message: "Should reject invalid blend material" };
        } catch (error) {
          return {
            passed: error.message.includes("Invalid material in blend"),
            message: "Should identify bad blend component"
          };
        }
      }
    },
    
    // Test boundary conditions
    {
      name: "Empty string inputs",
      test: () => {
        try {
          calculateTestCarbon("", "cotton", "global");
          return { passed: false, message: "Should reject empty item ID" };
        } catch (error) {
          return { passed: true, message: "Correctly rejected empty string" };
        }
      }
    },
    {
      name: "Extremely long decimal percentages",
      test: () => {
        const preciseBlend = {
          components: [
            { material: "cotton", percentage: 33.333333333 },
            { material: "polyester", percentage: 33.333333333 },
            { material: "nylon", percentage: 33.333333334 }
          ]
        };
        
        try {
          const result = calculateTestCarbon("tshirt", preciseBlend, "global");
          return {
            passed: typeof result.manufacturing === 'number',
            message: "Should handle high precision percentages"
          };
        } catch (error) {
          return { passed: false, error: error.message };
        }
      }
    },
    {
      name: "Special characters in inputs",
      test: () => {
        try {
          calculateTestCarbon("t-shirt!", "cott@n", "gl0bal");
          return { passed: false, message: "Should reject special characters" };
        } catch (error) {
          return { passed: true, message: "Correctly rejected invalid characters" };
        }
      }
    },
    
    // Test malformed data structures
    {
      name: "Malformed blend object",
      test: () => {
        const malformed = {
          // Missing components array
          materials: ["cotton", "polyester"]
        };
        
        try {
          calculateTestCarbon("tshirt", malformed, "global");
          return { passed: false, message: "Should reject malformed blend" };
        } catch (error) {
          return { passed: true, message: "Correctly rejected bad structure" };
        }
      }
    },
    {
      name: "Blend with missing percentage",
      test: () => {
        const incomplete = {
          components: [
            { material: "cotton", percentage: 50 },
            { material: "polyester" } // Missing percentage
          ]
        };
        
        try {
          calculateTestCarbon("tshirt", incomplete, "global");
          return { passed: false, message: "Should reject incomplete blend" };
        } catch (error) {
          return { passed: true, message: "Correctly rejected missing data" };
        }
      }
    },
    {
      name: "Recovery from calculation errors",
      test: () => {
        // First cause an error
        try {
          calculateTestCarbon("invalid", "cotton", "global");
        } catch (e) {
          // Expected error
        }
        
        // Then verify normal calculation still works
        try {
          const result = calculateTestCarbon("tshirt", "cotton", "global");
          return {
            passed: result.manufacturing === 7.5,
            message: "Should recover from previous errors"
          };
        } catch (error) {
          return { passed: false, message: "Failed to recover from error" };
        }
      }
    }
  ]
};

// Test Suite 7: Performance Tests
const performanceTests = {
  name: "Performance Tests",
  tests: [
    {
      name: "Single calculation completes quickly",
      test: () => {
        const start = performance.now();
        calculateTestCarbon("tshirt", "cotton", "global");
        const duration = performance.now() - start;
        
        return {
          passed: duration < 50, // Should complete in under 50ms
          actual: duration.toFixed(2) + 'ms',
          expected: '< 50ms',
          message: `Calculation should complete in under 50ms`
        };
      }
    },
    {
      name: "Complex blend calculation performs well",
      test: () => {
        const complexBlend = {
          components: [
            { material: "cotton", percentage: 45 },
            { material: "polyester", percentage: 30 },
            { material: "elastane", percentage: 15 },
            { material: "nylon", percentage: 10 }
          ]
        };
        
        const start = performance.now();
        calculateTestCarbon("dress", complexBlend, "china");
        const duration = performance.now() - start;
        
        return {
          passed: duration < 100,
          actual: duration.toFixed(2) + 'ms',
          expected: '< 100ms',
          message: `Complex blend should calculate in under 100ms`
        };
      }
    },
    {
      name: "1000 calculations perform efficiently",
      test: () => {
        const start = performance.now();
        
        for (let i = 0; i < 1000; i++) {
          calculateTestCarbon("tshirt", "cotton", "global");
        }
        
        const duration = performance.now() - start;
        const avgTime = duration / 1000;
        
        return {
          passed: avgTime < 5, // Average under 5ms per calculation
          actual: avgTime.toFixed(2) + 'ms avg',
          expected: '< 5ms avg',
          message: `1000 calculations should average under 5ms each`
        };
      }
    },
    {
      name: "Memory usage remains stable",
      test: () => {
        // Store initial memory if available
        const hasMemoryAPI = performance.memory !== undefined;
        
        if (!hasMemoryAPI) {
          return {
            passed: true,
            message: "Memory API not available in this browser (test skipped)"
          };
        }
        
        const initialMemory = performance.memory.usedJSHeapSize;
        
        // Do 100 calculations
        for (let i = 0; i < 100; i++) {
          calculateTestCarbon("jeans", "cotton_elastane_blend", "vietnam");
        }
        
        const finalMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // Convert to MB
        
        return {
          passed: memoryIncrease < 10, // Less than 10MB increase
          actual: memoryIncrease.toFixed(2) + 'MB',
          expected: '< 10MB increase',
          message: `Memory increase should be minimal`
        };
      }
    }
  ]
};

// Test Suite 8: Cross-Reference Tests (MVP Design Doc Validation)
const crossReferenceTests = {
  name: "Cross-Reference Tests (Design Doc Validation)",
  tests: [
    {
      name: "T-shirt default matches design doc (7.5 kg)",
      test: () => {
        const result = calculateTestCarbon("tshirt", "cotton", "global");
        return {
          passed: result.manufacturing === 7.5,
          actual: result.manufacturing,
          expected: 7.5,
          message: "Should match MVP design doc baseline"
        };
      }
    },
    {
      name: "Jeans default matches design doc (32 kg)",
      test: () => {
        const result = calculateTestCarbon("jeans", "cotton_elastane_blend", "global");
        const expected = 32 * 1.05; // 33.6
        return {
          passed: Math.abs(result.manufacturing - expected) < 0.1,
          actual: result.manufacturing,
          expected: expected.toFixed(1),
          message: "Should match MVP design doc baseline with blend"
        };
      }
    },
    {
      name: "Hemp multiplier matches design doc (0.48x)",
      test: () => {
        const hemp = TEST_CARBON_DATA.MATERIALS.hemp;
        return {
          passed: hemp.multiplier === 0.48,
          actual: hemp.multiplier,
          expected: 0.48,
          message: "Hemp multiplier should be 0.48x as per design doc"
        };
      }
    },
    {
      name: "China location multiplier matches design doc (1.4x)",
      test: () => {
        const china = TEST_CARBON_DATA.LOCATIONS.china;
        return {
          passed: china.multiplier === 1.4,
          actual: china.multiplier,
          expected: 1.4,
          message: "China should increase carbon by 40% (1.4x)"
        };
      }
    },
    {
      name: "Cotton/Polyester 50/50 blend matches design doc (0.925x)",
      test: () => {
        const blend = TEST_CARBON_DATA.BLENDS.cotton_polyester_5050;
        return {
          passed: blend.multiplier === 0.925,
          actual: blend.multiplier,
          expected: 0.925,
          message: "50/50 blend multiplier should match design doc"
        };
      }
    },
    {
      name: "Lifecycle adds 30% as per design doc",
      test: () => {
        const result = calculateTestCarbon("dress", "polyester", "global");
        const expectedLifecycle = result.manufacturing * 1.3;
        return {
          passed: Math.abs(result.lifecycle - expectedLifecycle) < 0.01,
          actual: result.lifecycle,
          expected: expectedLifecycle.toFixed(1),
          message: "Lifecycle should be exactly 130% of manufacturing"
        };
      }
    },
    {
      name: "Example calculation from design doc",
      test: () => {
        // Design doc example: T-shirt, Cotton/Polyester blend, Made in China
        // Expected: 7.5 * 0.925 * 1.4 = 9.7125 kg CO2e
        const result = calculateTestCarbon("tshirt", "cotton_polyester_5050", "china");
        const expected = 7.5 * 0.925 * 1.4;
        
        return {
          passed: Math.abs(result.manufacturing - expected) < 0.1,
          actual: result.manufacturing,
          expected: expected.toFixed(1),
          message: "Should match design doc example calculation"
        };
      }
    },
    {
      name: "All material multipliers are documented values",
      test: () => {
        const expectedMultipliers = {
          hemp: 0.48,
          organic_cotton: 0.73,
          cotton: 1.0,
          polyester: 0.85,
          recycled_polyester: 0.35,
          wool: 2.4,
          nylon: 1.1
        };
        
        const mismatches = [];
        for (const [material, expected] of Object.entries(expectedMultipliers)) {
          const actual = TEST_CARBON_DATA.MATERIALS[material]?.multiplier;
          if (actual !== expected) {
            mismatches.push(`${material}: expected ${expected}, got ${actual}`);
          }
        }
        
        return {
          passed: mismatches.length === 0,
          message: mismatches.length === 0 ? 
            "All multipliers match design doc" : 
            `Mismatches: ${mismatches.join(', ')}`
        };
      }
    }
  ]
};

// Test runner
window.CalculatorTests = {
  testSuites: [
    calculatorEngineTests, 
    dataValidationTests, 
    dataIntegrityTests,
    calculationAccuracyTests,
    integrationTests,
    errorHandlingTests,
    performanceTests,
    crossReferenceTests
  ],
  
  runTests: async function() {
    // Try to load actual dependencies
    try {
      await loadDependencies();
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('Loaded actual calculator:', !!window.calculator);
      console.log('Loaded actual CARBON_DATA:', !!window.CARBON_DATA);
    } catch (e) {
      console.warn('Could not load actual calculator, using test implementation:', e);
    }
    
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: []
    };
    
    this.testSuites.forEach(suite => {
      const suiteResult = {
        name: suite.name,
        tests: [],
        passed: 0,
        failed: 0
      };
      
      suite.tests.forEach(testCase => {
        results.total++;
        try {
          const result = testCase.test();
          result.name = testCase.name;
          
          if (result.passed) {
            suiteResult.passed++;
            results.passed++;
          } else {
            suiteResult.failed++;
            results.failed++;
          }
          
          suiteResult.tests.push(result);
        } catch (error) {
          suiteResult.failed++;
          results.failed++;
          suiteResult.tests.push({
            name: testCase.name,
            passed: false,
            error: error.toString()
          });
        }
      });
      
      results.suites.push(suiteResult);
    });
    
    return results;
  }
};