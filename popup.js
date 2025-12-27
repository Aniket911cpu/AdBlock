// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const globalToggle = document.getElementById('globalToggle');
  const siteToggle = document.getElementById('siteToggle');
  const currentDomainEl = document.getElementById('currentDomain');
  const pageStatsEl = document.getElementById('pageStats');
  const totalStatsEl = document.getElementById('totalStats');
  const statusMessage = document.getElementById('statusMessage');
  const statusDot = document.getElementById('statusDot');
  const shieldIcon = document.getElementById('shieldIcon');
  const openOptionsBtn = document.getElementById('openOptions');

  let currentTabId = null;
  let currentHostname = '';

  // 1. Initialize UI with stored values
  chrome.storage.local.get(['globalEnabled', 'totalBlocked', 'whitelistedDomains'], (data) => {
    // Global Toggle
    globalToggle.checked = data.globalEnabled !== false; // Default true
    updateGlobalStatus(globalToggle.checked);

    // Total Stats
    totalStatsEl.textContent = formatNumber(data.totalBlocked || 0);

    // Get Current Tab Info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        currentTabId = tabs[0].id;
        const url = new URL(tabs[0].url);
        currentHostname = url.hostname;
        currentDomainEl.textContent = currentHostname;

        // Site Toggle Logic
        const isWhitelisted = data.whitelistedDomains && data.whitelistedDomains.includes(currentHostname);
        siteToggle.checked = !isWhitelisted; // Toggle ON means BLOCKING is ON

        // Get Page Badge Stats
        chrome.action.getBadgeText({ tabId: currentTabId }, (text) => {
          pageStatsEl.textContent = text || '0';
        });
      }
    });
  });

  // 2. Event Listeners

  // Global Toggle Change
  globalToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.local.set({ globalEnabled: isEnabled });
    updateGlobalStatus(isEnabled);
    // Reload to apply cosmetic changes (DNR applies immediately)
    chrome.tabs.reload(currentTabId);
  });

  // Per-Site Toggle Change
  siteToggle.addEventListener('change', async (e) => {
    const blockingEnabled = e.target.checked; // Checked = Blocking ON

    // Get latest list
    chrome.storage.local.get(['whitelistedDomains'], async (data) => {
      let list = data.whitelistedDomains || [];

      if (blockingEnabled) {
        // Remove from whitelist (Enable blocking)
        list = list.filter(domain => domain !== currentHostname);
        // Message background to update DNR rules
        await sendMessageToBackground({ action: 'updateWhitelist', domain: currentHostname, add: false });
      } else {
        // Add to whitelist (Disable blocking)
        if (!list.includes(currentHostname)) list.push(currentHostname);
        // Message background to update DNR rules
        await sendMessageToBackground({ action: 'updateWhitelist', domain: currentHostname, add: true });
      }

      chrome.storage.local.set({ whitelistedDomains: list });
      chrome.tabs.reload(currentTabId);
    });
  });

  // Open Options Page
  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Rate button in popup
  const rateBtnPopup = document.getElementById('rateBtnPopup');
  const RATE_URL = 'https://chrome.google.com/webstore/detail/EXTENSION_ID/reviews';
  if (rateBtnPopup) {
    rateBtnPopup.addEventListener('click', () => {
      try { chrome.tabs.create({ url: RATE_URL }); }
      catch (e) { window.open(RATE_URL, '_blank'); }
    });
  }

  // Helper Functions
  function updateGlobalStatus(isEnabled) {
    if (isEnabled) {
      statusMessage.textContent = 'Protection Active';
      statusMessage.style.color = '#10B981'; // Green
      statusDot.style.backgroundColor = '#10B981';
      statusDot.style.animation = 'pulse 2s infinite';
      shieldIcon.style.color = '#4F46E5';
    } else {
      statusMessage.textContent = 'Protection Paused';
      statusMessage.style.color = '#6B7280'; // Gray
      statusDot.style.backgroundColor = '#6B7280';
      statusDot.style.animation = 'none';
      shieldIcon.style.color = '#9CA3AF';
    }
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  }

  function sendMessageToBackground(msg) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(msg, (response) => {
        resolve(response);
      });
    });
  }
});