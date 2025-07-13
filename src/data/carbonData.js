/**
 * Carbon Calculator Data Layer
 * Version: 1.0.0
 * Last Updated: 2025-01-12
 * 
 * All carbon footprint values in kg CO2e
 * Sources: UK DEFRA 2024, Carbonfact Research 2024, 
 *          Frontiers Environmental Science 2022
 */

export const CARBON_DATA = {
  // Metadata
  META: {
    version: "1.0.0",
    lastUpdated: "2025-01-12",
    sources: [
      "UK DEFRA Carbon Conversion Factors 2024",
      "Carbonfact Industry Research 2024",
      "Frontiers in Environmental Science (2022)",
      "MDPI Sustainability Studies (2023)",
      "International Labour Organization Textile Report"
    ],
    notes: {
      manufacturing: "Cradle-to-gate emissions including raw materials through factory gate",
      lifecycle: "Full lifecycle includes use phase (washing, drying) and end-of-life disposal",
      multiplier: "Lifecycle typically adds 30% to manufacturing emissions"
    }
  },

  // Base carbon values by item type
  ITEMS: {
    tshirt: {
      id: "tshirt",
      name: "T-shirt",
      emoji: "👕",
      baseCarbon: 7.5,
      range: { min: 2.1, max: 19.08 },
      defaultMaterial: "cotton",
      averageWeight: 0.2, // kg
      description: "Short-sleeved casual shirt",
      breakdown: {
        materials: 28,      // % of total
        energy: 35,        // % of total
        transport: 10,     // % of total
        other: 27          // % of total
      }
    },
    jeans: {
      id: "jeans",
      name: "Jeans",
      emoji: "👖",
      baseCarbon: 32,
      range: { min: 20, max: 44 },
      defaultMaterial: "cotton_elastane_blend",
      averageWeight: 0.7,
      description: "Denim pants",
      breakdown: {
        materials: 30,
        energy: 40,
        transport: 8,
        other: 22
      }
    },
    dress: {
      id: "dress",
      name: "Dress",
      emoji: "👗",
      baseCarbon: 22,
      range: { min: 11, max: 41 },
      defaultMaterial: "polyester",
      averageWeight: 0.35,
      description: "One-piece garment",
      breakdown: {
        materials: 32,
        energy: 38,
        transport: 9,
        other: 21
      }
    },
    shoes: {
      id: "shoes",
      name: "Shoes",
      emoji: "👟",
      baseCarbon: 14,
      range: { min: 13.6, max: 14 },
      defaultMaterial: "mixed_synthetic",
      averageWeight: 0.8,
      description: "Footwear (sneakers/casual shoes)",
      breakdown: {
        materials: 40,
        energy: 35,
        transport: 10,
        other: 15
      }
    }
  },

  // Material carbon multipliers
  MATERIALS: {
    // Natural fibers
    hemp: {
      id: "hemp",
      name: "Hemp",
      category: "natural",
      multiplier: 0.48,
      carbonPerKg: 1.8,
      sustainable: true,
      description: "Low-impact natural fiber"
    },
    linen: {
      id: "linen",
      name: "Linen",
      category: "natural",
      multiplier: 0.6,
      carbonPerKg: 4.5,
      sustainable: true,
      description: "Made from flax plants"
    },
    organic_cotton: {
      id: "organic_cotton",
      name: "Organic Cotton",
      category: "natural",
      multiplier: 0.73,
      carbonPerKg: 5.5,
      sustainable: true,
      description: "Grown without synthetic pesticides"
    },
    cotton: {
      id: "cotton",
      name: "Cotton",
      category: "natural",
      multiplier: 1.0, // baseline
      carbonPerKg: 7.5,
      sustainable: false,
      description: "Conventional cotton"
    },
    wool: {
      id: "wool",
      name: "Wool",
      category: "natural",
      multiplier: 2.4,
      carbonPerKg: 18,
      sustainable: false,
      description: "Sheep wool (high methane impact)"
    },
    silk: {
      id: "silk",
      name: "Silk",
      category: "natural",
      multiplier: 1.65,
      carbonPerKg: 12.4,
      sustainable: false,
      description: "Luxury natural fiber"
    },
    
    // Synthetic fibers
    recycled_polyester: {
      id: "recycled_polyester",
      name: "Recycled Polyester",
      category: "synthetic",
      multiplier: 0.35,
      carbonPerKg: 2.6,
      sustainable: true,
      description: "Made from recycled plastic"
    },
    polyester: {
      id: "polyester",
      name: "Polyester",
      category: "synthetic",
      multiplier: 0.85,
      carbonPerKg: 6.4,
      sustainable: false,
      description: "Common synthetic fiber"
    },
    nylon: {
      id: "nylon",
      name: "Nylon",
      category: "synthetic",
      multiplier: 1.1,
      carbonPerKg: 8.2,
      sustainable: false,
      description: "Durable synthetic fiber"
    },
    acrylic: {
      id: "acrylic",
      name: "Acrylic",
      category: "synthetic",
      multiplier: 2.1,
      carbonPerKg: 15.8,
      sustainable: false,
      description: "Wool-like synthetic"
    },
    elastane: {
      id: "elastane",
      name: "Elastane/Spandex",
      category: "synthetic",
      multiplier: 2.67,
      carbonPerKg: 20,
      sustainable: false,
      description: "Stretchy synthetic fiber"
    },
    
    // Special materials for shoes
    leather: {
      id: "leather",
      name: "Leather",
      category: "animal",
      multiplier: 2.2,
      carbonPerKg: 16.5,
      sustainable: false,
      description: "Animal hide material"
    },
    rubber: {
      id: "rubber",
      name: "Rubber",
      category: "other",
      multiplier: 1.2,
      carbonPerKg: 9,
      sustainable: false,
      description: "Natural or synthetic rubber"
    },
    mixed_synthetic: {
      id: "mixed_synthetic",
      name: "Mixed Synthetics",
      category: "synthetic",
      multiplier: 1.0,
      carbonPerKg: 7.5,
      sustainable: false,
      description: "Combination of synthetic materials"
    }
  },

  // Pre-calculated common blends
  BLENDS: {
    cotton_polyester_5050: {
      id: "cotton_polyester_5050",
      name: "Cotton/Polyester (50/50)",
      components: [
        { material: "cotton", percentage: 50 },
        { material: "polyester", percentage: 50 }
      ],
      multiplier: 0.925,
      description: "Common t-shirt blend"
    },
    cotton_elastane_blend: {
      id: "cotton_elastane_blend",
      name: "Cotton/Elastane (95/5)",
      components: [
        { material: "cotton", percentage: 95 },
        { material: "elastane", percentage: 5 }
      ],
      multiplier: 1.08,
      description: "Stretch denim blend"
    },
    wool_polyester_5050: {
      id: "wool_polyester_5050",
      name: "Wool/Polyester (50/50)",
      components: [
        { material: "wool", percentage: 50 },
        { material: "polyester", percentage: 50 }
      ],
      multiplier: 1.625,
      description: "Warm blend fabric"
    },
    tri_blend: {
      id: "tri_blend",
      name: "Tri-blend (50/25/25)",
      components: [
        { material: "polyester", percentage: 50 },
        { material: "cotton", percentage: 25 },
        { material: "rayon", percentage: 25 }
      ],
      multiplier: 0.9,
      description: "Soft athletic blend"
    }
  },

  // Manufacturing location multipliers
  LOCATIONS: {
    global: {
      id: "global",
      name: "Global Average",
      flag: "🌍",
      multiplier: 1.0,
      gridIntensity: 475, // gCO2/kWh
      description: "Weighted average of major producers"
    },
    bangladesh: {
      id: "bangladesh",
      name: "Bangladesh",
      flag: "🇧🇩",
      multiplier: 0.95,
      gridIntensity: 450,
      description: "Major textile producer"
    },
    vietnam: {
      id: "vietnam",
      name: "Vietnam",
      flag: "🇻🇳",
      multiplier: 0.98,
      gridIntensity: 465,
      description: "Growing manufacturing hub"
    },
    turkey: {
      id: "turkey",
      name: "Turkey",
      flag: "🇹🇷",
      multiplier: 1.05,
      gridIntensity: 500,
      description: "European gateway producer"
    },
    china: {
      id: "china",
      name: "China",
      flag: "🇨🇳",
      multiplier: 1.4,
      gridIntensity: 555,
      description: "Largest producer, coal-heavy grid"
    },
    india: {
      id: "india",
      name: "India",
      flag: "🇮🇳",
      multiplier: 1.25,
      gridIntensity: 713,
      description: "Major producer, coal-dependent"
    },
    portugal: {
      id: "portugal",
      name: "Portugal/EU",
      flag: "🇵🇹",
      multiplier: 0.85,
      gridIntensity: 255,
      description: "Cleaner European production"
    },
    usa: {
      id: "usa",
      name: "USA",
      flag: "🇺🇸",
      multiplier: 0.9,
      gridIntensity: 420,
      description: "Mixed energy grid"
    },
    pakistan: {
      id: "pakistan",
      name: "Pakistan",
      flag: "🇵🇰",
      multiplier: 1.15,
      gridIntensity: 540,
      description: "Major cotton producer"
    }
  },

  // Constants for calculations
  CONSTANTS: {
    lifecycleMultiplier: 1.3,  // Manufacturing to full lifecycle
    transportPercentage: 0.1,  // Transport is typically 10% of total
    usePhasePercentage: 0.23,  // Washing/drying is ~23% of lifecycle
    endOfLifePercentage: 0.07, // Disposal is ~7% of lifecycle
    
    // Uncertainty ranges
    uncertaintyLow: 0.85,      // -15%
    uncertaintyHigh: 1.15      // +15%
  },

  // Material categories for UI grouping
  MATERIAL_CATEGORIES: {
    natural: {
      name: "Natural Fibers",
      materials: ["hemp", "linen", "organic_cotton", "cotton", "wool", "silk"]
    },
    synthetic: {
      name: "Synthetic Fibers",
      materials: ["recycled_polyester", "polyester", "nylon", "acrylic", "elastane"]
    },
    blends: {
      name: "Common Blends",
      materials: ["cotton_polyester_5050", "cotton_elastane_blend", "wool_polyester_5050", "tri_blend"]
    }
  }
};

// Helper function to get all materials for a specific item type
export function getMaterialsForItem(itemType) {
  // Shoes have special materials
  if (itemType === 'shoes') {
    return {
      ...CARBON_DATA.MATERIALS,
      // Add shoe-specific materials
      leather: CARBON_DATA.MATERIALS.leather,
      rubber: CARBON_DATA.MATERIALS.rubber,
      mixed_synthetic: CARBON_DATA.MATERIALS.mixed_synthetic
    };
  }
  
  // Other items use textile materials
  return Object.fromEntries(
    Object.entries(CARBON_DATA.MATERIALS).filter(([key, material]) => 
      material.category !== 'animal' && material.category !== 'other'
    )
  );
}

// Export version for tracking
export const DATA_VERSION = CARBON_DATA.META.version;