// PWA installation and service worker registration
let deferredPrompt;
let installButton = null;

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
              showUpdateBanner();
            }
          });
        });
      })
      .catch(err => {
        console.log('ServiceWorker registration failed:', err);
      });
  });
}

// Handle install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show install button
  showInstallButton();
});

// Show install button when PWA can be installed
function showInstallButton() {
  installButton = document.getElementById('installButton');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', installPWA);
  }
}

// Handle PWA installation
async function installPWA() {
  if (!deferredPrompt) return;
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User response to the install prompt: ${outcome}`);
  
  // Clear the deferred prompt
  deferredPrompt = null;
  
  // Hide install button
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Handle successful installation
window.addEventListener('appinstalled', (evt) => {
  console.log('PWA was installed');
  // Hide install button
  if (installButton) {
    installButton.style.display = 'none';
  }
});

// Show update banner when new version is available
function showUpdateBanner() {
  const updateBanner = document.createElement('div');
  updateBanner.className = 'update-banner';
  updateBanner.innerHTML = `
    <p>A new version is available!</p>
    <button onclick="updateApp()">Update</button>
  `;
  document.body.appendChild(updateBanner);
}

// Update the app
function updateApp() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
  window.location.reload();
}

// Check if app is running in standalone mode
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

// Export functions for use in other modules
window.pwaFunctions = {
  installPWA,
  isStandalone,
  updateApp
};