// background.js

// Initialize storage on install and show welcome page on first install
chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.set({
    globalEnabled: true,
    totalBlocked: 0,
    whitelistedDomains: []
  });

  // If newly installed, open welcome page in a new tab
  if (details && details.reason === 'install') {
    try {
      chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
    } catch (e) {
      // ignore
    }
  }

  // Set an uninstall survey URL (must be an external, hosted URL).
  // Replace the URL below with the publicly hosted `uninstall_survey.html` location.
  try {
    chrome.runtime.setUninstallURL('https://example.com/uninstall-survey.html');
  } catch (e) {
    // ignore if API not available
  }
});

// Listener for rule matches (requires declarativeNetRequestFeedback permission)
// This is used to update the badge and stats
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  // Update total stats
  chrome.storage.local.get(['totalBlocked'], (result) => {
    const newTotal = (result.totalBlocked || 0) + 1;
    chrome.storage.local.set({ totalBlocked: newTotal });
  });

  // Update badge for the specific tab
  const tabId = info.request.tabId;
  if (tabId > -1) {
    chrome.action.getBadgeText({ tabId }, (text) => {
      const currentCount = parseInt(text || '0', 10);
      const newCount = currentCount + 1;
      chrome.action.setBadgeText({ tabId: tabId, text: newCount.toString() });
      chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: '#4F46E5' });
    });
  }
});

// Handle messages from Popup or Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateWhitelist') {
    updateDynamicRules(message.domain, message.add);
    sendResponse({ status: 'success' });
  }
  return true;
});

// Helper to manage Dynamic Rules for Whitelisting
async function updateDynamicRules(domain, add) {
  if (!domain) return;

  // We use a simple hash of the domain to generate a unique ID for the rule
  const ruleId = Math.abs(hashCode(domain)) % 10000 + 1000; // ID range 1000-11000

  if (add) {
    // Add an allow rule for this domain
    const rule = {
      id: ruleId,
      priority: 100, // Higher priority than blocking rules
      action: { type: 'allowAllRequests' },
      condition: { initiatorDomains: [domain] }
    };
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [rule],
      removeRuleIds: [ruleId] // Remove if exists to avoid duplicates
    });
  } else {
    // Remove the allow rule
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId]
    });
  }
}

// Simple string hash function for rule IDs
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}