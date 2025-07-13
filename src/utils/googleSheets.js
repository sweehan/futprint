// Google Sheets integration for data collection
// This module handles anonymous data submission to Google Forms

// Generate anonymous session ID
export const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// Detect device type
export const getDeviceType = () => {
  const userAgent = navigator.userAgent || '';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
  const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
  
  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
};

// Track user path through calculator
export class UserPathTracker {
  constructor() {
    this.path = [];
    this.startTime = Date.now();
  }

  addStep(step) {
    this.path.push({
      step,
      timestamp: Date.now() - this.startTime
    });
  }

  getPath() {
    return this.path.map(p => p.step).join(' → ');
  }

  getTimings() {
    return this.path.map(p => `${p.step}:${p.timestamp}ms`).join(', ');
  }

  reset() {
    this.path = [];
    this.startTime = Date.now();
  }
}

// Google Form submission configuration
const GOOGLE_FORM_CONFIG = {
  formId: 'YOUR_FORM_ID_HERE', // Replace with actual form ID
  fieldIds: {
    timestamp: 'entry.123456',    // Replace with actual field IDs
    item: 'entry.234567',
    materialType: 'entry.345678',
    materialDetails: 'entry.456789',
    location: 'entry.567890',
    manufacturingCO2: 'entry.678901',
    lifecycleCO2: 'entry.789012',
    userPath: 'entry.890123',
    deviceType: 'entry.901234',
    sessionId: 'entry.012345',
    customPercentage: 'entry.123456',
    calculationTime: 'entry.234567'
  }
};

// Format data for Google Forms submission
const formatFormData = (data) => {
  const formData = new FormData();
  
  // Map our data to Google Form field IDs
  if (data.item) {
    formData.append(GOOGLE_FORM_CONFIG.fieldIds.item, data.item);
  }
  
  if (data.materialType) {
    formData.append(GOOGLE_FORM_CONFIG.fieldIds.materialType, data.materialType);
  }
  
  if (data.materialDetails) {
    formData.append(GOOGLE_FORM_CONFIG.fieldIds.materialDetails, data.materialDetails);
  }
  
  if (data.location) {
    formData.append(GOOGLE_FORM_CONFIG.fieldIds.location, data.location);
  }
  
  if (data.manufacturingCO2 !== undefined) {
    formData.append(GOOGLE_FORM_CONFIG.fieldIds.manufacturingCO2, data.manufacturingCO2.toFixed(2));
  }
  
  if (data.lifecycleCO2 !== undefined) {
    formData.append(GOOGLE_FORM_CONFIG.fieldIds.lifecycleCO2, data.lifecycleCO2.toFixed(2));
  }
  
  if (data.userPath) {
    formData.append(GOOGLE_FORM_CONFIG.fieldIds.userPath, data.userPath);
  }
  
  if (data.deviceType) {
    formData.append(GOOGLE_FORM_CONFIG.fieldIds.deviceType, data.deviceType);
  }
  
  if (data.sessionId) {
    formData.append(GOOGLE_FORM_CONFIG.fieldIds.sessionId, data.sessionId);
  }
  
  if (data.customPercentage !== undefined) {
    formData.append(GOOGLE_FORM_CONFIG.fieldIds.customPercentage, data.customPercentage ? 'Yes' : 'No');
  }
  
  if (data.calculationTime !== undefined) {
    formData.append(GOOGLE_FORM_CONFIG.fieldIds.calculationTime, data.calculationTime);
  }
  
  return formData;
};

// Submit data to Google Forms
export const submitToGoogleForm = async (calculationData) => {
  // Skip if no form ID configured
  if (GOOGLE_FORM_CONFIG.formId === 'YOUR_FORM_ID_HERE') {
    console.log('Google Form submission skipped - no form ID configured');
    console.log('Would have submitted:', calculationData);
    return { success: true, skipped: true };
  }

  try {
    const formData = formatFormData(calculationData);
    const url = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_CONFIG.formId}/formResponse`;
    
    // Using mode: 'no-cors' because Google Forms doesn't support CORS
    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });
    
    // With no-cors, we can't read the response, but if no error was thrown, assume success
    console.log('Data submitted to Google Forms successfully');
    return { success: true };
  } catch (error) {
    console.error('Error submitting to Google Forms:', error);
    return { success: false, error: error.message };
  }
};

// Prepare calculation data for submission
export const prepareSubmissionData = (calculationState, sessionId, pathTracker) => {
  const {
    item,
    material,
    materialMode,
    customMaterials,
    location,
    results
  } = calculationState;

  // Determine material details
  let materialType = materialMode;
  let materialDetails = '';
  
  if (materialMode === 'single') {
    materialDetails = material;
  } else if (materialMode === 'blend') {
    materialDetails = '50/50 blend';
  } else if (materialMode === 'custom' && customMaterials) {
    materialDetails = customMaterials
      .map(m => `${m.material}: ${m.percentage}%`)
      .join(', ');
  }

  return {
    timestamp: new Date().toISOString(),
    item: item || 'unknown',
    materialType: materialType || 'unknown',
    materialDetails: materialDetails || 'none',
    location: location || 'global',
    manufacturingCO2: results?.manufacturing || 0,
    lifecycleCO2: results?.lifecycle || 0,
    userPath: pathTracker.getPath(),
    deviceType: getDeviceType(),
    sessionId: sessionId,
    customPercentage: materialMode === 'custom',
    calculationTime: pathTracker.getTimings()
  };
};

// Batch submission queue for reliability
class SubmissionQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  add(data) {
    this.queue.push(data);
    if (!this.processing) {
      this.process();
    }
  }

  async process() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const data = this.queue.shift();
    
    try {
      await submitToGoogleForm(data);
    } catch (error) {
      console.error('Failed to submit data, will retry:', error);
      // Re-add to queue for retry
      this.queue.unshift(data);
      // Wait before retrying
      setTimeout(() => this.process(), 5000);
      return;
    }

    // Process next item
    setTimeout(() => this.process(), 100);
  }
}

export const submissionQueue = new SubmissionQueue();

// Analytics helper for debugging
export const logCalculation = (data) => {
  if (process.env.NODE_ENV === 'development') {
    console.group('📊 Calculation Analytics');
    console.log('Session:', data.sessionId);
    console.log('Device:', data.deviceType);
    console.log('Item:', data.item);
    console.log('Material:', data.materialDetails);
    console.log('Location:', data.location);
    console.log('Manufacturing CO2:', data.manufacturingCO2, 'kg');
    console.log('Lifecycle CO2:', data.lifecycleCO2, 'kg');
    console.log('User Path:', data.userPath);
    console.log('Timings:', data.calculationTime);
    console.groupEnd();
  }
};