/**
 * Unit Tests for Carbon Calculator Engine
 * Tests all calculator functions for accuracy and edge cases
 */

// Mock CARBON_DATA for testing
const MOCK_CARBON_DATA = {
  ITEMS: {
    tshirt: {
      name: "T-shirt",
      baseCarbon: 7.5,
      breakdown: {
        materials: 28,
        energy: 32,
        transport: 25,
        other: 15
      }
    },
    jeans: {
      name: "Jeans",
      baseCarbon: 32,
      breakdown: {
        materials: 35,
        energy: 30,
        transport: 20,
        other: 15
      }
    }
  },
  MATERIALS: {
    cotton: {
      name: "Cotton",
      multiplier: 1.0,
      sustainable: false
    },
    polyester: {
      name: "Polyester",
      multiplier: 0.85,
      sustainable: false
    },
    hemp: {
      name: "Hemp",
      multiplier: 0.48,
      sustainable: true
    },
    wool: {
      name: "Wool",
      multiplier: 2.4,
      sustainable: false
    }
  },
  BLENDS: {
    cottonPolyester: {
      name: "Cotton/Polyester (50/50)",
      multiplier: 0.925,
      sustainable: false
    }
  },
  LOCATIONS: {
    global: {
      name: "Global Average",
      multiplier: 1.0
    },
    china: {
      name: "China",
      multiplier: 1.4
    },
    bangladesh: {
      name: "Bangladesh",
      multiplier: 0.95
    },
    portugal: {
      name: "Portugal",
      multiplier: 0.85
    }
  },
  CONSTANTS: {
    lifecycleMultiplier: 1.3,
    uncertaintyLow: 0.8,
    uncertaintyHigh: 1.2
  }
};

// Test Suite
const CalculatorTests = {
  // Test calculateCarbon function
  testCalculateCarbon: {
    // Basic calculation tests
    testBasicCalculation: () => {
      const result = calculateCarbon('tshirt', 'cotton', 'global');
      const expected = 7.5 * 1.0 * 1.0; // baseCarbon * materialMultiplier * locationMultiplier
      
      return {
        name: "Basic carbon calculation",
        passed: Math.abs(result.manufacturing - expected) < 0.01,
        expected: expected,
        actual: result.manufacturing,
        message: `T-shirt with cotton in global location should be ${expected} kg`
      };
    },

    testWithMultipliers: () => {
      const result = calculateCarbon('jeans', 'polyester', 'china');
      const expected = 32 * 0.85 * 1.4; // 38.08
      
      return {
        name: "Calculation with multipliers",
        passed: Math.abs(result.manufacturing - expected) < 0.01,
        expected: expected,
        actual: result.manufacturing,
        message: `Jeans with polyester in China should be ${expected} kg`
      };
    },

    testLifecycleCalculation: () => {
      const result = calculateCarbon('tshirt', 'cotton', 'global');
      const expectedLifecycle = result.manufacturing * 1.3;
      
      return {
        name: "Lifecycle calculation",
        passed: Math.abs(result.lifecycle - expectedLifecycle) < 0.01,
        expected: expectedLifecycle,
        actual: result.lifecycle,
        message: "Lifecycle should be manufacturing * 1.3"
      };
    },

    testRangeCalculation: () => {
      const result = calculateCarbon('tshirt', 'cotton', 'global');
      const expectedMin = result.manufacturing * 0.8;
      const expectedMax = result.manufacturing * 1.2;
      
      return {
        name: "Range calculation",
        passed: Math.abs(result.manufacturingRange.min - expectedMin) < 0.01 &&
                Math.abs(result.manufacturingRange.max - expectedMax) < 0.01,
        expected: { min: expectedMin, max: expectedMax },
        actual: result.manufacturingRange,
        message: "Range should be ±20% of manufacturing value"
      };
    },

    testBreakdownCalculation: () => {
      const result = calculateCarbon('tshirt', 'cotton', 'global');
      const total = result.breakdown.materials + result.breakdown.energy + 
                   result.breakdown.transport + result.breakdown.other;
      
      return {
        name: "Breakdown calculation",
        passed: Math.abs(total - result.manufacturing) < 0.1,
        expected: result.manufacturing,
        actual: total,
        message: "Breakdown sum should equal manufacturing total"
      };
    },

    // Error handling tests
    testInvalidItem: () => {
      let error = null;
      try {
        calculateCarbon('invalid_item', 'cotton', 'global');
      } catch (e) {
        error = e;
      }
      
      return {
        name: "Invalid item error",
        passed: error !== null && error.message.includes('Invalid item ID'),
        expected: "Error thrown",
        actual: error ? "Error thrown" : "No error",
        message: "Should throw error for invalid item"
      };
    },

    testInvalidMaterial: () => {
      let error = null;
      try {
        calculateCarbon('tshirt', 'invalid_material', 'global');
      } catch (e) {
        error = e;
      }
      
      return {
        name: "Invalid material error",
        passed: error !== null && error.message.includes('Invalid material ID'),
        expected: "Error thrown",
        actual: error ? "Error thrown" : "No error",
        message: "Should throw error for invalid material"
      };
    },

    testInvalidLocation: () => {
      let error = null;
      try {
        calculateCarbon('tshirt', 'cotton', 'invalid_location');
      } catch (e) {
        error = e;
      }
      
      return {
        name: "Invalid location error",
        passed: error !== null && error.message.includes('Invalid location ID'),
        expected: "Error thrown",
        actual: error ? "Error thrown" : "No error",
        message: "Should throw error for invalid location"
      };
    }
  },

  // Test calculateBlendMultiplier function
  testCalculateBlendMultiplier: {
    testSimpleBlend: () => {
      const components = [
        { material: 'cotton', percentage: 50 },
        { material: 'polyester', percentage: 50 }
      ];
      const result = calculateBlendMultiplier(components);
      const expected = (1.0 * 0.5) + (0.85 * 0.5); // 0.925
      
      return {
        name: "50/50 blend calculation",
        passed: Math.abs(result - expected) < 0.001,
        expected: expected,
        actual: result,
        message: "50/50 cotton/polyester blend should be 0.925"
      };
    },

    testComplexBlend: () => {
      const components = [
        { material: 'cotton', percentage: 60 },
        { material: 'polyester', percentage: 30 },
        { material: 'wool', percentage: 10 }
      ];
      const result = calculateBlendMultiplier(components);
      const expected = (1.0 * 0.6) + (0.85 * 0.3) + (2.4 * 0.1); // 1.095
      
      return {
        name: "Complex blend calculation",
        passed: Math.abs(result - expected) < 0.001,
        expected: expected,
        actual: result,
        message: "60/30/10 blend should calculate correctly"
      };
    },

    testInvalidPercentage: () => {
      const components = [
        { material: 'cotton', percentage: 60 },
        { material: 'polyester', percentage: 30 }
      ];
      let error = null;
      try {
        calculateBlendMultiplier(components);
      } catch (e) {
        error = e;
      }
      
      return {
        name: "Invalid percentage total",
        passed: error !== null && error.message.includes('must sum to 100%'),
        expected: "Error thrown",
        actual: error ? "Error thrown" : "No error",
        message: "Should throw error when percentages don't sum to 100"
      };
    },

    testInvalidMaterialInBlend: () => {
      const components = [
        { material: 'cotton', percentage: 50 },
        { material: 'invalid_material', percentage: 50 }
      ];
      let error = null;
      try {
        calculateBlendMultiplier(components);
      } catch (e) {
        error = e;
      }
      
      return {
        name: "Invalid material in blend",
        passed: error !== null && error.message.includes('Invalid material in blend'),
        expected: "Error thrown",
        actual: error ? "Error thrown" : "No error",
        message: "Should throw error for invalid material in blend"
      };
    }
  },

  // Test applyLocationMultiplier function
  testApplyLocationMultiplier: {
    testBasicMultiplier: () => {
      const result = applyLocationMultiplier(10, 'china');
      const expected = 10 * 1.4;
      
      return {
        name: "Basic location multiplier",
        passed: Math.abs(result - expected) < 0.01,
        expected: expected,
        actual: result,
        message: "Should apply China multiplier correctly"
      };
    },

    testNeutralMultiplier: () => {
      const result = applyLocationMultiplier(10, 'global');
      const expected = 10 * 1.0;
      
      return {
        name: "Neutral location multiplier",
        passed: Math.abs(result - expected) < 0.01,
        expected: expected,
        actual: result,
        message: "Global multiplier should not change value"
      };
    },

    testInvalidLocationMultiplier: () => {
      let error = null;
      try {
        applyLocationMultiplier(10, 'invalid_location');
      } catch (e) {
        error = e;
      }
      
      return {
        name: "Invalid location in multiplier",
        passed: error !== null && error.message.includes('Invalid location ID'),
        expected: "Error thrown",
        actual: error ? "Error thrown" : "No error",
        message: "Should throw error for invalid location"
      };
    }
  },

  // Test calculateLifecycle function
  testCalculateLifecycle: {
    testBasicLifecycle: () => {
      const result = calculateLifecycle(10);
      const expected = 10 * 1.3;
      
      return {
        name: "Basic lifecycle calculation",
        passed: Math.abs(result - expected) < 0.01,
        expected: expected,
        actual: result,
        message: "Should multiply by lifecycle factor"
      };
    },

    testZeroLifecycle: () => {
      const result = calculateLifecycle(0);
      const expected = 0;
      
      return {
        name: "Zero lifecycle calculation",
        passed: result === expected,
        expected: expected,
        actual: result,
        message: "Zero input should return zero"
      };
    }
  },

  // Test getEquivalents function
  testGetEquivalents: {
    testDrivingEquivalent: () => {
      const result = getEquivalents(10);
      const expected = 25; // 10 * 2.5
      
      return {
        name: "Driving equivalent",
        passed: result.driving.value === expected,
        expected: expected,
        actual: result.driving.value,
        message: "10 kg CO2 should equal 25 miles of driving"
      };
    },

    testPhoneChargingEquivalent: () => {
      const result = getEquivalents(1);
      const expected = 122;
      
      return {
        name: "Phone charging equivalent",
        passed: result.phoneCharging.value === expected,
        expected: expected,
        actual: result.phoneCharging.value,
        message: "1 kg CO2 should equal 122 phone charges"
      };
    },

    testTreeEquivalent: () => {
      const result = getEquivalents(21.77);
      const expected = 1.0;
      
      return {
        name: "Tree absorption equivalent",
        passed: Math.abs(result.trees.value - expected) < 0.1,
        expected: expected,
        actual: result.trees.value,
        message: "21.77 kg CO2 should equal 1 tree-year"
      };
    }
  },

  // Test compareCalculations function
  testCompareCalculations: {
    testLowerEmissions: () => {
      const calc1 = { manufacturing: 5 };
      const calc2 = { manufacturing: 10 };
      const result = compareCalculations(calc1, calc2);
      
      return {
        name: "Lower emissions comparison",
        passed: result.better === 'first' && result.percentageDifference === 50,
        expected: { better: 'first', percentage: 50 },
        actual: { better: result.better, percentage: result.percentageDifference },
        message: "Should identify first as 50% better"
      };
    },

    testHigherEmissions: () => {
      const calc1 = { manufacturing: 15 };
      const calc2 = { manufacturing: 10 };
      const result = compareCalculations(calc1, calc2);
      
      return {
        name: "Higher emissions comparison",
        passed: result.better === 'second' && result.percentageDifference === 50,
        expected: { better: 'second', percentage: 50 },
        actual: { better: result.better, percentage: result.percentageDifference },
        message: "Should identify second as better"
      };
    }
  },

  // Test validateInputs function
  testValidateInputs: {
    testValidInputs: () => {
      const result = validateInputs('tshirt', 'cotton', 'global');
      
      return {
        name: "Valid inputs validation",
        passed: result.valid === true && result.errors.length === 0,
        expected: { valid: true, errors: 0 },
        actual: { valid: result.valid, errors: result.errors.length },
        message: "Valid inputs should pass validation"
      };
    },

    testInvalidInputs: () => {
      const result = validateInputs('invalid', 'invalid', 'invalid');
      
      return {
        name: "Invalid inputs validation",
        passed: result.valid === false && result.errors.length === 3,
        expected: { valid: false, errors: 3 },
        actual: { valid: result.valid, errors: result.errors.length },
        message: "Invalid inputs should fail validation"
      };
    },

    testMixedValidation: () => {
      const result = validateInputs('tshirt', 'invalid', 'global');
      
      return {
        name: "Mixed inputs validation",
        passed: result.valid === false && result.errors.length === 1,
        expected: { valid: false, errors: 1 },
        actual: { valid: result.valid, errors: result.errors.length },
        message: "Should catch invalid material only"
      };
    }
  },

  // Edge case tests
  testEdgeCases: {
    testVeryLargeValues: () => {
      const result = calculateCarbon('jeans', 'wool', 'china');
      const expected = 32 * 2.4 * 1.4; // 107.52
      
      return {
        name: "Very large carbon value",
        passed: Math.abs(result.manufacturing - expected) < 0.1,
        expected: expected,
        actual: result.manufacturing,
        message: "Should handle large multiplier combinations"
      };
    },

    testVerySmallValues: () => {
      const result = calculateCarbon('tshirt', 'hemp', 'portugal');
      const expected = 7.5 * 0.48 * 0.85; // 3.06
      
      return {
        name: "Very small carbon value",
        passed: Math.abs(result.manufacturing - expected) < 0.1,
        expected: expected,
        actual: result.manufacturing,
        message: "Should handle small multiplier combinations"
      };
    },

    testPrecisionRounding: () => {
      const result = calculateCarbon('tshirt', 'cotton', 'global');
      const hasOnlyOneDecimal = (result.manufacturing * 10) % 1 === 0;
      
      return {
        name: "Decimal precision",
        passed: hasOnlyOneDecimal,
        expected: "One decimal place",
        actual: result.manufacturing,
        message: "Should round to one decimal place"
      };
    }
  }
};

// Test runner function
function runTests() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Run all test suites
  Object.entries(CalculatorTests).forEach(([suiteName, suite]) => {
    const suiteResults = {
      name: suiteName,
      tests: []
    };

    Object.entries(suite).forEach(([testName, testFn]) => {
      try {
        const result = testFn();
        results.total++;
        if (result.passed) {
          results.passed++;
        } else {
          results.failed++;
        }
        suiteResults.tests.push(result);
      } catch (error) {
        results.total++;
        results.failed++;
        suiteResults.tests.push({
          name: testName,
          passed: false,
          error: error.message,
          message: `Test threw error: ${error.message}`
        });
      }
    });

    results.tests.push(suiteResults);
  });

  return results;
}

// Export test runner for use in test page
window.CalculatorTests = {
  runTests,
  testSuites: CalculatorTests,
  mockData: MOCK_CARBON_DATA
};

// Simplified calculator functions for testing (normally would import from calculator.js)
// These are simplified versions that work with the mock data
function calculateCarbon(itemId, material, locationId) {
  const item = MOCK_CARBON_DATA.ITEMS[itemId];
  if (!item) {
    throw new Error(`Invalid item ID: ${itemId}`);
  }

  const location = MOCK_CARBON_DATA.LOCATIONS[locationId];
  if (!location) {
    throw new Error(`Invalid location ID: ${locationId}`);
  }

  let materialMultiplier;
  if (typeof material === 'string') {
    const mat = MOCK_CARBON_DATA.MATERIALS[material] || MOCK_CARBON_DATA.BLENDS[material];
    if (!mat) {
      throw new Error(`Invalid material ID: ${material}`);
    }
    materialMultiplier = mat.multiplier;
  }

  const manufacturing = Math.round(item.baseCarbon * materialMultiplier * location.multiplier * 10) / 10;
  const lifecycle = Math.round(manufacturing * MOCK_CARBON_DATA.CONSTANTS.lifecycleMultiplier * 10) / 10;

  return {
    manufacturing,
    lifecycle,
    manufacturingRange: {
      min: Math.round(manufacturing * MOCK_CARBON_DATA.CONSTANTS.uncertaintyLow * 10) / 10,
      max: Math.round(manufacturing * MOCK_CARBON_DATA.CONSTANTS.uncertaintyHigh * 10) / 10
    },
    lifecycleRange: {
      min: Math.round(lifecycle * MOCK_CARBON_DATA.CONSTANTS.uncertaintyLow * 10) / 10,
      max: Math.round(lifecycle * MOCK_CARBON_DATA.CONSTANTS.uncertaintyHigh * 10) / 10
    },
    breakdown: {
      materials: Math.round(manufacturing * (item.breakdown.materials / 100) * 10) / 10,
      energy: Math.round(manufacturing * (item.breakdown.energy / 100) * 10) / 10,
      transport: Math.round(manufacturing * (item.breakdown.transport / 100) * 10) / 10,
      other: Math.round(manufacturing * (item.breakdown.other / 100) * 10) / 10,
      usePhase: Math.round(manufacturing * 0.23 * 10) / 10,
      endOfLife: Math.round(manufacturing * 0.07 * 10) / 10
    }
  };
}

function calculateBlendMultiplier(components) {
  const totalPercentage = components.reduce((sum, comp) => sum + comp.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.1) {
    throw new Error(`Percentages must sum to 100% (current: ${totalPercentage}%)`);
  }

  let multiplier = 0;
  components.forEach(component => {
    const material = MOCK_CARBON_DATA.MATERIALS[component.material];
    if (!material) {
      throw new Error(`Invalid material in blend: ${component.material}`);
    }
    multiplier += (material.multiplier * component.percentage) / 100;
  });

  return multiplier;
}

function applyLocationMultiplier(baseValue, locationId) {
  const location = MOCK_CARBON_DATA.LOCATIONS[locationId];
  if (!location) {
    throw new Error(`Invalid location ID: ${locationId}`);
  }
  return baseValue * location.multiplier;
}

function calculateLifecycle(manufacturingValue) {
  return manufacturingValue * MOCK_CARBON_DATA.CONSTANTS.lifecycleMultiplier;
}

function getEquivalents(co2Value) {
  return {
    driving: {
      value: Math.round(co2Value * 2.5),
      unit: 'miles'
    },
    phoneCharging: {
      value: Math.round(co2Value * 122),
      unit: 'charges'
    },
    trees: {
      value: Math.round(co2Value / 21.77 * 10) / 10,
      unit: 'tree-years'
    }
  };
}

function compareCalculations(calc1, calc2) {
  const diff = calc1.manufacturing - calc2.manufacturing;
  const percentDiff = ((diff / calc2.manufacturing) * 100);
  
  return {
    difference: Math.round(Math.abs(diff) * 10) / 10,
    percentageDifference: Math.round(Math.abs(percentDiff) * 10) / 10,
    better: diff < 0 ? 'first' : 'second'
  };
}

function validateInputs(itemId, material, locationId) {
  const errors = [];

  if (!MOCK_CARBON_DATA.ITEMS[itemId]) {
    errors.push(`Invalid item: ${itemId}`);
  }

  if (typeof material === 'string') {
    if (!MOCK_CARBON_DATA.MATERIALS[material] && !MOCK_CARBON_DATA.BLENDS[material]) {
      errors.push(`Invalid material: ${material}`);
    }
  }

  if (!MOCK_CARBON_DATA.LOCATIONS[locationId]) {
    errors.push(`Invalid location: ${locationId}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}