import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Info, Share2, Save, RotateCcw } from 'lucide-react';
import { 
  generateSessionId, 
  UserPathTracker, 
  prepareSubmissionData, 
  submitToGoogleForm,
  logCalculation 
} from '../utils/googleSheets';
import { calculateCarbon, getEquivalents } from '../utils/calculator';
import { CARBON_DATA } from '../data/carbonData';

// Location flags are UI-specific and not in carbonData.js
const LOCATION_FLAGS = {
  global: "🌍",
  china: "🇨🇳",
  bangladesh: "🇧🇩",
  portugal: "🇵🇹",
  india: "🇮🇳",
  vietnam: "🇻🇳",
  turkey: "🇹🇷",
  usa: "🇺🇸"
};

// Help texts
const HELP_TEXTS = {
  item: "This represents the carbon emissions from manufacturing an average item. The actual emissions depend on the material and where it's made.",
  material: "The fabric content affects carbon footprint significantly. Natural fibers like cotton require water and land but are biodegradable. Synthetics like polyester are petroleum-based but often require less energy to produce. Check your garment's care label for exact percentages.",
  location: "Where your clothes are made matters! Countries with coal-heavy electricity grids (like China and India) have higher emissions. European manufacturing typically has lower emissions due to cleaner energy. The 'Made in' label tells you where final assembly happened.",
  lifecycle: "Manufacturing is just the beginning. Washing, drying, and eventual disposal add ~30% more emissions. You can reduce this by washing in cold water, air drying, and keeping clothes longer."
};

// Helper function to transform calculator response to match component expectations
const transformCalculatorResult = (result) => {
  // Extract the base values from the calculation details
  return {
    manufacturing: result.manufacturing,
    lifecycle: result.lifecycle,
    range: result.range || {
      min: result.manufacturing * 0.8,
      max: result.manufacturing * 1.2
    },
    calculation: {
      base: result.calculation?.baseCarbon || result.inputs?.item?.baseCarbon,
      materialMultiplier: result.calculation?.materialMultiplier,
      locationMultiplier: result.calculation?.locationMultiplier
    }
  };
};

// Helper to extract simple values from getEquivalents response
const getSimpleEquivalents = (co2) => {
  const equivs = getEquivalents(co2);
  return {
    driving: equivs.driving?.value || Math.round(co2 * 2.5),
    phoneCharging: equivs.phoneCharging?.value || Math.round(co2 * 122),
    trees: equivs.trees?.value || Math.round(co2 / 21.77 * 12)
  };
};

// Components
const HelpTooltip = ({ text, isOpen, onToggle }) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute z-10 w-64 p-3 mt-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg">
      <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
      {text}
    </div>
  );
};

const ProgressBar = ({ currentStep, totalSteps = 4 }) => {
  const percentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                step <= currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const ItemSelector = ({ selected, onSelect, currentCarbon }) => {
  const [helpOpen, setHelpOpen] = useState(false);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Select your item type:</h2>
        <button
          onClick={() => setHelpOpen(!helpOpen)}
          className="relative p-1 text-gray-500 hover:text-gray-700"
        >
          <Info size={20} />
          <HelpTooltip text={HELP_TEXTS.item} isOpen={helpOpen} onToggle={setHelpOpen} />
        </button>
      </div>
      
      {selected && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm">
          <span className="text-gray-600">Default shown: </span>
          <span className="font-medium">{CARBON_DATA.ITEMS[selected].name} - {currentCarbon} kg CO₂e (average)</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(CARBON_DATA.ITEMS).map(([id, item]) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`p-6 border-2 rounded-lg transition-all transform hover:scale-105 ${
              selected === id 
                ? 'border-green-500 bg-green-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">{item.emoji}</div>
            <div className="font-medium">{item.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

const MaterialSelector = ({ selected, onSelect, itemType, currentCarbon }) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [materialMode, setMaterialMode] = useState('single'); // single, blend, custom
  const [customBlend, setCustomBlend] = useState([
    { material: 'cotton', percentage: 70 },
    { material: 'polyester', percentage: 30 }
  ]);
  
  useEffect(() => {
    if (materialMode === 'single' && selected.type !== 'single') {
      onSelect({ type: 'single', material: 'cotton' });
    } else if (materialMode === 'blend' && selected.type !== 'blend') {
      onSelect({ type: 'blend', material: 'cotton_polyester_5050' });
    } else if (materialMode === 'custom' && selected.type !== 'custom') {
      onSelect({ type: 'custom', components: customBlend });
    }
  }, [materialMode]);
  
  const handleCustomBlendChange = (index, field, value) => {
    const newBlend = [...customBlend];
    newBlend[index][field] = field === 'percentage' ? parseInt(value) || 0 : value;
    
    // Adjust other percentage if only 2 components
    if (newBlend.length === 2 && field === 'percentage') {
      const otherIndex = index === 0 ? 1 : 0;
      newBlend[otherIndex].percentage = 100 - (parseInt(value) || 0);
    }
    
    setCustomBlend(newBlend);
    onSelect({ type: 'custom', components: newBlend });
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Material composition:</h2>
        <button
          onClick={() => setHelpOpen(!helpOpen)}
          className="relative p-1 text-gray-500 hover:text-gray-700"
        >
          <Info size={20} />
          <HelpTooltip text={HELP_TEXTS.material} isOpen={helpOpen} onToggle={setHelpOpen} />
        </button>
      </div>
      
      {currentCarbon && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm">
          <span className="font-medium">Current estimate: {currentCarbon} kg CO₂e</span>
        </div>
      )}
      
      <div className="space-y-3">
        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="materialMode"
            value="single"
            checked={materialMode === 'single'}
            onChange={(e) => setMaterialMode(e.target.value)}
            className="mr-3"
          />
          <div className="flex-1">
            <div className="font-medium">100% Single Material (default)</div>
            <select 
              value={selected.type === 'single' ? selected.material : 'cotton'}
              onChange={(e) => onSelect({ type: 'single', material: e.target.value })}
              className="mt-2 w-full p-2 border border-gray-300 rounded"
              disabled={materialMode !== 'single'}
            >
              {Object.entries(CARBON_DATA.MATERIALS).map(([id, material]) => (
                <option key={id} value={id}>{material.name}</option>
              ))}
            </select>
          </div>
        </label>
        
        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="materialMode"
            value="blend"
            checked={materialMode === 'blend'}
            onChange={(e) => setMaterialMode(e.target.value)}
            className="mr-3"
          />
          <div className="flex-1">
            <div className="font-medium">Mixed Materials (50/50 blend)</div>
            <select 
              value={selected.type === 'blend' ? selected.material : 'cotton_polyester_5050'}
              onChange={(e) => onSelect({ type: 'blend', material: e.target.value })}
              className="mt-2 w-full p-2 border border-gray-300 rounded"
              disabled={materialMode !== 'blend'}
            >
              {Object.entries(CARBON_DATA.BLENDS).map(([id, blend]) => (
                <option key={id} value={id}>{blend.name}</option>
              ))}
            </select>
          </div>
        </label>
        
        <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="materialMode"
            value="custom"
            checked={materialMode === 'custom'}
            onChange={(e) => setMaterialMode(e.target.value)}
            className="mr-3 mt-1"
          />
          <div className="flex-1">
            <div className="font-medium mb-2">Custom Mix</div>
            {materialMode === 'custom' && customBlend.map((component, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <select
                  value={component.material}
                  onChange={(e) => handleCustomBlendChange(index, 'material', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                >
                  {Object.entries(CARBON_DATA.MATERIALS).map(([id, material]) => (
                    <option key={id} value={id}>{material.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={component.percentage}
                  onChange={(e) => handleCustomBlendChange(index, 'percentage', e.target.value)}
                  className="w-16 p-2 border border-gray-300 rounded text-sm"
                  min="0"
                  max="100"
                />
                <span className="text-sm">%</span>
              </div>
            ))}
          </div>
        </label>
      </div>
      
      <p className="mt-4 text-sm text-gray-600 italic">
        ℹ️ Most fast fashion uses blended materials. Don't know? Use our default.
      </p>
    </div>
  );
};

const LocationSelector = ({ selected, onSelect, currentCarbon }) => {
  const [helpOpen, setHelpOpen] = useState(false);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Where was it made?</h2>
        <button
          onClick={() => setHelpOpen(!helpOpen)}
          className="relative p-1 text-gray-500 hover:text-gray-700"
        >
          <Info size={20} />
          <HelpTooltip text={HELP_TEXTS.location} isOpen={helpOpen} onToggle={setHelpOpen} />
        </button>
      </div>
      
      {currentCarbon && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm">
          <span className="font-medium">Current estimate: {currentCarbon} kg CO₂e</span>
        </div>
      )}
      
      <button
        onClick={() => onSelect('global')}
        className={`w-full p-4 mb-4 border-2 rounded-lg transition-all ${
          selected === 'global'
            ? 'border-green-500 bg-green-50 shadow-md'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="text-2xl mb-1">🌍</div>
        <div className="font-medium">Global Average (default)</div>
      </button>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(CARBON_DATA.LOCATIONS)
          .filter(([id]) => id !== 'global')
          .map(([id, location]) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`p-3 border-2 rounded-lg transition-all transform hover:scale-105 ${
              selected === id 
                ? 'border-green-500 bg-green-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">{LOCATION_FLAGS[id]}</div>
            <div className="text-sm font-medium">{location.name}</div>
          </button>
        ))}
      </div>
      
      <p className="mt-4 text-sm text-gray-600 italic">
        ℹ️ Check the label. No info? Global average accounts for typical production mix.
      </p>
    </div>
  );
};

const Results = ({ data, inputs, onSave, onReset }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const equivalents = getSimpleEquivalents(data.manufacturing);
  
  const getImpactLevel = (value) => {
    if (value < 5) return { level: 'low', label: 'Low Impact', emoji: '🟢' };
    if (value < 15) return { level: 'medium', label: 'Medium Impact', emoji: '🟡' };
    if (value < 30) return { level: 'high', label: 'High Impact', emoji: '🟠' };
    return { level: 'very-high', label: 'Very High Impact', emoji: '🔴' };
  };
  
  const impact = getImpactLevel(data.manufacturing);
  
  const handleShare = async () => {
    const shareText = `I calculated the carbon footprint of my ${inputs.item.name}:
${impact.emoji} ${data.manufacturing} kg CO₂e (manufacturing)
📊 ${data.lifecycle} kg CO₂e (full lifecycle)

Calculate your fashion footprint at [website]`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Your Carbon Footprint:</h2>
      
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600 mb-2">Manufacturing</div>
          <div className="text-4xl font-bold text-gray-900">
            {data.manufacturing} kg CO₂e
          </div>
          <div className="text-sm text-gray-500 mt-2">
            (Range: {data.range.min} - {data.range.max} kg based on industry data)
          </div>
          <div className={`inline-block px-4 py-2 rounded-full mt-3 ${
            impact.level === 'low' ? 'bg-green-100 text-green-800' :
            impact.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            impact.level === 'high' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {impact.emoji} {impact.label}
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">Full Lifecycle</div>
          <div className="text-2xl font-semibold">{data.lifecycle} kg CO₂e</div>
          <div className="text-xs text-gray-500">(+30% for washing, wearing, disposal)</div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Equivalent to:</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🚗</span>
            <span className="text-gray-600">Driving {equivalents.driving} miles</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📱</span>
            <span className="text-gray-600">Charging your phone {equivalents.phoneCharging} times</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🌳</span>
            <span className="text-gray-600">What 1 tree absorbs in {equivalents.trees} months</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full mb-4 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">ℹ️ How we calculated this</span>
          <ChevronRight className={`transform transition-transform ${showBreakdown ? 'rotate-90' : ''}`} size={20} />
        </div>
      </button>
      
      {showBreakdown && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm">
          <div className="space-y-2">
            <div>Base ({inputs.item.name}): {data.calculation.base} kg</div>
            <div>Material ({inputs.material}): ×{data.calculation.materialMultiplier}</div>
            <div>Location ({inputs.location.name}): ×{data.calculation.locationMultiplier}</div>
            <div className="pt-2 border-t border-gray-300">
              <strong>Total: {data.manufacturing} kg CO₂e</strong>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-600">
            Sources: UK DEFRA 2024, Carbonfact Research<br />
            Last updated: January 2025
          </div>
        </div>
      )}
      
      <div className="flex space-x-4">
        <button 
          onClick={onSave}
          className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Save size={20} />
          <span>Save This Item</span>
        </button>
        <button 
          onClick={onReset}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
        >
          <RotateCcw size={20} />
          <span>Calculate Another</span>
        </button>
      </div>
      
      <button
        onClick={handleShare}
        className="w-full mt-3 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
      >
        <Share2 size={20} />
        <span>Share Results</span>
      </button>
    </div>
  );
};

// Main Calculator Component
export default function Calculator() {
  const [step, setStep] = useState(1);
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState({ type: 'single', material: 'cotton' });
  const [selectedLocation, setSelectedLocation] = useState('');
  const [calculationResult, setCalculationResult] = useState(null);
  const [currentCarbon, setCurrentCarbon] = useState(null);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  
  // Data collection state
  const [sessionId] = useState(() => generateSessionId());
  const [pathTracker] = useState(() => new UserPathTracker());
  
  // Calculate carbon whenever inputs change
  useEffect(() => {
    if (selectedItem) {
      const item = CARBON_DATA.ITEMS[selectedItem];
      if (!selectedMaterial.material && !selectedMaterial.components) {
        setCurrentCarbon(item.baseCarbon);
      } else {
        try {
          // Transform material data for calculator
          let materialInput;
          if (selectedMaterial.type === 'single') {
            materialInput = selectedMaterial.material;
          } else if (selectedMaterial.type === 'blend') {
            materialInput = selectedMaterial.material;
          } else if (selectedMaterial.type === 'custom' && selectedMaterial.components) {
            materialInput = { components: selectedMaterial.components };
          }
          
          const result = calculateCarbon(
            selectedItem,
            materialInput,
            selectedLocation || 'global'
          );
          setCurrentCarbon(result.manufacturing);
        } catch (error) {
          console.error('Error calculating carbon:', error);
          setCurrentCarbon(item.baseCarbon);
        }
      }
    }
  }, [selectedItem, selectedMaterial, selectedLocation]);
  
  // Auto-advance steps
  useEffect(() => {
    if (selectedItem && step === 1) {
      pathTracker.addStep('item');
      setStep(2);
    }
  }, [selectedItem]);
  
  useEffect(() => {
    if (selectedMaterial.material || selectedMaterial.components) {
      if (step === 2) {
        pathTracker.addStep('material');
        setStep(3);
      }
    }
  }, [selectedMaterial]);
  
  useEffect(() => {
    if (selectedLocation && step === 3) {
      pathTracker.addStep('location');
      try {
        // Transform material data for calculator
        let materialInput;
        if (selectedMaterial.type === 'single') {
          materialInput = selectedMaterial.material;
        } else if (selectedMaterial.type === 'blend') {
          materialInput = selectedMaterial.material;
        } else if (selectedMaterial.type === 'custom' && selectedMaterial.components) {
          materialInput = { components: selectedMaterial.components };
        }
        
        const result = calculateCarbon(selectedItem, materialInput, selectedLocation);
        setCalculationResult(transformCalculatorResult(result));
      } catch (error) {
        console.error('Error in final calculation:', error);
      }
      setStep(4);
      pathTracker.addStep('result');
      
      // Submit data to Google Forms
      const submissionData = prepareSubmissionData(
        {
          item: selectedItem,
          material: getMaterialName(),
          materialMode: selectedMaterial.type,
          customMaterials: selectedMaterial.components,
          location: selectedLocation,
          results: result
        },
        sessionId,
        pathTracker
      );
      
      // Log for development
      logCalculation(submissionData);
      
      // Submit to Google Forms
      submitToGoogleForm(submissionData);
    }
  }, [selectedLocation]);
  
  const handleSave = async () => {
    console.log('Saving result:', calculationResult);
    pathTracker.addStep('save');
    
    // Save to localStorage
    const savedItems = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
    savedItems.push({
      id: Date.now(),
      sessionId,
      item: CARBON_DATA.ITEMS[selectedItem],
      material: getMaterialName(),
      location: CARBON_DATA.LOCATIONS[selectedLocation],
      results: calculationResult,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('savedCalculations', JSON.stringify(savedItems));
    
    // Submit save event to Google Forms
    const saveData = prepareSubmissionData(
      {
        item: selectedItem,
        material: getMaterialName(),
        materialMode: selectedMaterial.type,
        customMaterials: selectedMaterial.components,
        location: selectedLocation,
        results: calculationResult
      },
      sessionId,
      pathTracker
    );
    
    await submitToGoogleForm({ ...saveData, event: 'save' });
    alert('Result saved!');
  };
  
  const handleReset = () => {
    pathTracker.addStep('reset');
    pathTracker.reset();
    setStep(1);
    setSelectedItem('');
    setSelectedMaterial({ type: 'single', material: 'cotton' });
    setSelectedLocation('');
    setCalculationResult(null);
    setCurrentCarbon(null);
  };
  
  const getMaterialName = () => {
    if (selectedMaterial.type === 'single') {
      return CARBON_DATA.MATERIALS[selectedMaterial.material]?.name || '';
    } else if (selectedMaterial.type === 'blend') {
      return CARBON_DATA.BLENDS[selectedMaterial.material]?.name || '';
    } else if (selectedMaterial.type === 'custom') {
      return selectedMaterial.components.map(c => 
        `${c.percentage}% ${CARBON_DATA.MATERIALS[c.material]?.name}`
      ).join(' / ');
    }
    return '';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Fashion Carbon Calculator
          </h1>
          <p className="text-gray-600">
            Calculate the environmental impact of your clothing
          </p>
        </header>

        <ProgressBar currentStep={step} />

        <div className="space-y-6">
          {step >= 1 && (
            <div className={`transition-all duration-300 ${step > 1 ? 'opacity-50 scale-95' : ''}`}>
              <ItemSelector
                selected={selectedItem}
                onSelect={setSelectedItem}
                currentCarbon={currentCarbon}
              />
            </div>
          )}

          {step >= 2 && selectedItem && (
            <div className={`transition-all duration-300 ${step > 2 ? 'opacity-50 scale-95' : ''}`}>
              <MaterialSelector
                selected={selectedMaterial}
                onSelect={setSelectedMaterial}
                itemType={selectedItem}
                currentCarbon={currentCarbon}
              />
            </div>
          )}

          {step >= 3 && selectedMaterial && (
            <div className={`transition-all duration-300 ${step > 3 ? 'opacity-50 scale-95' : ''}`}>
              <LocationSelector
                selected={selectedLocation}
                onSelect={setSelectedLocation}
                currentCarbon={currentCarbon}
              />
            </div>
          )}

          {step >= 4 && calculationResult && (
            <div className="transition-all duration-300">
              <Results
                data={calculationResult}
                inputs={{
                  item: CARBON_DATA.ITEMS[selectedItem],
                  material: getMaterialName(),
                  location: CARBON_DATA.LOCATIONS[selectedLocation]
                }}
                onSave={handleSave}
                onReset={handleReset}
              />
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Data sources: UK DEFRA 2024, Carbonfact Research 2024</p>
          <p className="mt-1">
            <a href="#" className="underline hover:text-gray-700">
              Learn about our methodology
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}