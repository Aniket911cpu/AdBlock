// content.js

// List of common ad selectors
const AD_SELECTORS = [
  '.ad-banner',
  '.ad-container',
  '.adsbox',
  '.sponsored-post',
  '[id^="google_ads"]',
  '[id^="div-gpt-ad"]',
  '.taboola-container',
  '.outbrain-container',
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="ads"]'
];

let cosmeticBlockedCount = 0;

function runCosmeticFiltering() {
  chrome.storage.local.get(['globalEnabled', 'whitelistedDomains'], (result) => {
    // Check if globally disabled
    if (result.globalEnabled === false) return;

    // Check if current site is whitelisted
    const currentDomain = window.location.hostname;
    if (result.whitelistedDomains && result.whitelistedDomains.includes(currentDomain)) return;

    // Apply filtering
    AD_SELECTORS.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Only hide if not already hidden
        if (el.style.display !== 'none') {
          el.style.setProperty('display', 'none', 'important');
          
          // Optional: Add a placeholder or just collapse
          // el.innerHTML = '<div style="background:#f3f4f6; color:#9ca3af; padding:4px; font-size:10px; text-align:center;">Ad Blocked by ShieldPlus</div>';
          
          cosmeticBlockedCount++;
        }
      });
    });

    // Send stats update if we blocked something new
    if (cosmeticBlockedCount > 0) {
      // In a real app, we'd message the background to aggregate this with network blocks
      // For now, we rely on the network blocking for the main badge count
    }
  });
}

// Run immediately
runCosmeticFiltering();

// Run again periodically to catch lazy-loaded ads
setInterval(runCosmeticFiltering, 2000);

// Observer for dynamic content
const observer = new MutationObserver((mutations) => {
  runCosmeticFiltering();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});