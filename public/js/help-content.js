// Help content data for the carbon calculator
// Based on the architecture document help text examples

export const HELP_CONTENT = {
  // Material Composition Help
  materialComposition: {
    title: "Material Composition",
    summary: "The fabric content affects carbon footprint significantly.",
    detailed: `
      <h3>How Material Affects Carbon Footprint</h3>
      <p>The fabric content affects carbon footprint significantly. Different materials have vastly different environmental impacts:</p>
      
      <h4>Natural Fibers:</h4>
      <ul>
        <li><strong>Cotton:</strong> Requires significant water and land but is biodegradable</li>
        <li><strong>Hemp:</strong> Low water usage, grows quickly, lowest carbon footprint</li>
        <li><strong>Wool:</strong> High emissions due to methane from sheep, but long-lasting</li>
        <li><strong>Organic Cotton:</strong> Lower pesticide use but similar water requirements</li>
      </ul>
      
      <h4>Synthetic Fibers:</h4>
      <ul>
        <li><strong>Polyester:</strong> Petroleum-based but often requires less energy to produce</li>
        <li><strong>Recycled Polyester:</strong> Significantly lower footprint by reusing plastic bottles</li>
        <li><strong>Nylon:</strong> High energy production but very durable</li>
      </ul>
      
      <p><strong>Tip:</strong> Check your garment's care label for exact percentages. Most fast fashion uses blended materials for cost and performance.</p>
    `,
    quickTips: [
      "Check the care label for material percentages",
      "Natural doesn't always mean lower carbon",
      "Blended materials are most common in fast fashion",
      "Recycled materials typically have lower impact"
    ]
  },

  // Manufacturing Location Help
  manufacturingLocation: {
    title: "Manufacturing Location",
    summary: "Where your clothes are made matters for carbon emissions.",
    detailed: `
      <h3>Why Location Matters</h3>
      <p>Where your clothes are made matters! The carbon footprint varies significantly by country due to different energy sources:</p>
      
      <h4>High Carbon Locations:</h4>
      <ul>
        <li><strong>China:</strong> Coal-heavy electricity grid increases emissions by 40%</li>
        <li><strong>India:</strong> Mixed energy sources, 25% higher than global average</li>
        <li><strong>Bangladesh:</strong> Improving efficiency, slight below global average</li>
      </ul>
      
      <h4>Lower Carbon Locations:</h4>
      <ul>
        <li><strong>European Union:</strong> Cleaner energy sources, 15% lower emissions</li>
        <li><strong>Portugal:</strong> High renewable energy use</li>
        <li><strong>Vietnam:</strong> Transitioning to cleaner energy</li>
      </ul>
      
      <h4>How to Find This Information:</h4>
      <p>Look for the "Made in" label on your garment. This tells you where final assembly happened, which is typically where most energy-intensive processes occur.</p>
      
      <p><strong>Note:</strong> Components and materials may come from different countries, but the final assembly location is the primary factor.</p>
    `,
    quickTips: [
      "Check the 'Made in' label on your garment",
      "Coal-heavy countries have higher emissions",
      "European manufacturing typically cleaner",
      "Global average accounts for typical production mix"
    ]
  },

  // Lifecycle Emissions Help
  lifecycleEmissions: {
    title: "Lifecycle Emissions",
    summary: "Manufacturing is just the beginning of a garment's carbon footprint.",
    detailed: `
      <h3>Complete Lifecycle Impact</h3>
      <p>Manufacturing is just the beginning. Washing, drying, and eventual disposal add approximately 30% more emissions to your garment's total footprint:</p>
      
      <h4>Manufacturing (70% of total footprint):</h4>
      <ul>
        <li>Raw material production</li>
        <li>Fabric processing and dyeing</li>
        <li>Assembly and finishing</li>
        <li>Transportation to retail</li>
      </ul>
      
      <h4>Use Phase (25% of total footprint):</h4>
      <ul>
        <li>Washing frequency and temperature</li>
        <li>Drying method (machine vs. air dry)</li>
        <li>Ironing and dry cleaning</li>
        <li>Frequency of wear</li>
      </ul>
      
      <h4>End of Life (5% of total footprint):</h4>
      <ul>
        <li>Disposal method</li>
        <li>Recycling potential</li>
        <li>Biodegradability</li>
      </ul>
      
      <h3>How You Can Reduce Impact:</h3>
      <ul>
        <li><strong>Wash in cold water</strong> - reduces energy by 90%</li>
        <li><strong>Air dry when possible</strong> - eliminates dryer energy</li>
        <li><strong>Keep clothes longer</strong> - spreads manufacturing impact over more uses</li>
        <li><strong>Buy quality items</strong> - last longer, reducing replacement frequency</li>
      </ul>
    `,
    quickTips: [
      "Wash in cold water to reduce energy by 90%",
      "Air dry to eliminate dryer energy use",
      "Keep clothes longer to spread manufacturing impact",
      "Quality items last longer and reduce replacement needs"
    ]
  },

  // Item Types Help
  itemTypes: {
    title: "Item Types",
    summary: "Different clothing items have vastly different carbon footprints.",
    detailed: `
      <h3>Carbon Footprint by Item Type</h3>
      <p>Different clothing items have vastly different carbon footprints due to material usage, complexity, and manufacturing processes:</p>
      
      <h4>T-Shirts (7.5 kg CO2e average):</h4>
      <ul>
        <li>Simple construction, minimal material</li>
        <li>Usually 100% cotton or cotton blends</li>
        <li>Fast production cycle</li>
      </ul>
      
      <h4>Jeans (32 kg CO2e average):</h4>
      <ul>
        <li>Heavy fabric weight</li>
        <li>Intensive washing and finishing processes</li>
        <li>Complex construction with rivets and hardware</li>
      </ul>
      
      <h4>Dresses (22 kg CO2e average):</h4>
      <ul>
        <li>Varies widely by style and material</li>
        <li>Often synthetic materials</li>
        <li>More complex patterns and construction</li>
      </ul>
      
      <h4>Shoes (14 kg CO2e average):</h4>
      <ul>
        <li>Mixed materials (leather, rubber, synthetics)</li>
        <li>Complex manufacturing processes</li>
        <li>Transportation and packaging considerations</li>
      </ul>
      
      <p><strong>Note:</strong> These are manufacturing averages. Actual footprints vary significantly based on specific materials, construction quality, and production location.</p>
    `,
    quickTips: [
      "Jeans have the highest footprint due to heavy fabric",
      "T-shirts are the most carbon-efficient choice",
      "Shoes involve complex mixed materials",
      "Dress footprints vary widely by style"
    ]
  },

  // Calculation Methodology Help
  calculationMethodology: {
    title: "How We Calculate",
    summary: "Our calculations are based on peer-reviewed research and industry data.",
    detailed: `
      <h3>Calculation Methodology</h3>
      <p>Our carbon footprint calculations are based on the most current peer-reviewed research and industry data:</p>
      
      <h4>Data Sources:</h4>
      <ul>
        <li><strong>UK DEFRA 2024:</strong> Government carbon conversion factors</li>
        <li><strong>Carbonfact Research 2024:</strong> Industry-specific lifecycle assessments</li>
        <li><strong>Frontiers Environmental Science 2022:</strong> Academic research on textile impacts</li>
      </ul>
      
      <h4>Calculation Process:</h4>
      <ol>
        <li><strong>Base Value:</strong> Start with item-specific manufacturing footprint</li>
        <li><strong>Material Multiplier:</strong> Apply material-specific factors</li>
        <li><strong>Location Multiplier:</strong> Adjust for manufacturing location</li>
        <li><strong>Lifecycle Addition:</strong> Add 30% for use phase and disposal</li>
      </ol>
      
      <h4>Example Calculation:</h4>
      <pre>
T-shirt made in China, 100% Cotton:
Base (T-shirt): 7.5 kg CO2e
Material (Cotton): ×1.0
Location (China): ×1.4
Manufacturing Total: 10.5 kg CO2e
Lifecycle Total: 13.7 kg CO2e (+30%)
      </pre>
      
      <h4>Data Transparency:</h4>
      <p>We show ranges rather than just averages because actual footprints vary significantly based on specific manufacturing processes, supply chains, and other factors.</p>
      
      <p><strong>Last Updated:</strong> January 2025</p>
    `,
    quickTips: [
      "Based on peer-reviewed research",
      "Updated quarterly with new data",
      "Ranges shown to reflect real-world variation",
      "Transparent calculation methodology"
    ]
  },

  // Carbon Equivalents Help
  carbonEquivalents: {
    title: "Carbon Equivalents",
    summary: "Understanding CO2e through everyday comparisons.",
    detailed: `
      <h3>Understanding Carbon Equivalents</h3>
      <p>CO2e (carbon dioxide equivalent) can be hard to visualize. Here's how we calculate everyday comparisons:</p>
      
      <h4>Driving Miles:</h4>
      <ul>
        <li><strong>Calculation:</strong> Average car emits 0.25 kg CO2e per mile</li>
        <li><strong>Based on:</strong> EPA data for average passenger vehicle</li>
        <li><strong>Includes:</strong> Fuel combustion and upstream emissions</li>
      </ul>
      
      <h4>Phone Charges:</h4>
      <ul>
        <li><strong>Calculation:</strong> 0.008 kg CO2e per smartphone charge</li>
        <li><strong>Based on:</strong> Average smartphone battery (3000mAh) and US grid mix</li>
        <li><strong>Includes:</strong> Electricity generation and transmission losses</li>
      </ul>
      
      <h4>Tree Absorption:</h4>
      <ul>
        <li><strong>Calculation:</strong> Average tree absorbs 1.8 kg CO2e per month</li>
        <li><strong>Based on:</strong> Mature deciduous tree in temperate climate</li>
        <li><strong>Note:</strong> Highly variable by species, age, and climate</li>
      </ul>
      
      <h4>Why These Comparisons Matter:</h4>
      <p>These equivalents help put carbon emissions in perspective and show the relative impact of fashion choices compared to other daily activities.</p>
      
      <p><strong>Important:</strong> All calculations use global averages and may vary significantly based on location, technology, and other factors.</p>
    `,
    quickTips: [
      "Based on EPA and scientific data",
      "Helps visualize abstract CO2e numbers",
      "Global averages - local values may vary",
      "Updated with latest conversion factors"
    ]
  }
};

// Quick help snippets for tooltips
export const TOOLTIP_HELP = {
  materialComposition: "The fabric content affects carbon footprint significantly. Check your garment's care label for exact percentages.",
  manufacturingLocation: "Where your clothes are made matters! Countries with coal-heavy electricity grids have higher emissions.",
  lifecycleEmissions: "Manufacturing is just the beginning. Washing, drying, and disposal add ~30% more emissions.",
  itemSelection: "Different clothing items have vastly different carbon footprints due to material usage and manufacturing complexity.",
  calculationBreakdown: "Our calculations are based on peer-reviewed research and updated quarterly with new data.",
  carbonEquivalents: "CO2e equivalents help visualize the relative impact compared to everyday activities."
};

// Help content organization by step
export const HELP_BY_STEP = {
  itemSelection: {
    primary: 'itemTypes',
    secondary: ['calculationMethodology']
  },
  materialSelection: {
    primary: 'materialComposition',
    secondary: ['calculationMethodology']
  },
  locationSelection: {
    primary: 'manufacturingLocation',
    secondary: ['calculationMethodology']
  },
  results: {
    primary: 'lifecycleEmissions',
    secondary: ['carbonEquivalents', 'calculationMethodology']
  }
};