// options.js

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.nav-item');
  const contents = document.querySelectorAll('.tab-content');
  const whitelistInput = document.getElementById('whitelistInput');
  const saveWhitelistBtn = document.getElementById('saveWhitelist');
  const saveStatus = document.getElementById('saveStatus');

  // Tab Navigation
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();

      // Update Tab Styles
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show Content
      const targetId = tab.getAttribute('data-tab');
      contents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetId) content.classList.add('active');
      });
    });
  });

  // Support button: open feedback in new tab
  const openFeedbackBtn = document.getElementById('openFeedbackBtn');
  if (openFeedbackBtn) {
    openFeedbackBtn.addEventListener('click', () => {
      try {
        chrome.tabs.create({ url: chrome.runtime.getURL('feedback.html') });
      } catch (e) {
        window.open('feedback.html', '_blank');
      }
    });
  }

  // Open rate page from options
  const openRateBtn = document.getElementById('openRateBtn');
  const RATE_URL = 'https://chrome.google.com/webstore/detail/EXTENSION_ID/reviews';
  if (openRateBtn) {
    openRateBtn.addEventListener('click', () => {
      try { chrome.tabs.create({ url: RATE_URL }); }
      catch (e) { window.open(RATE_URL, '_blank'); }
    });
  }

  // Load Whitelist
  chrome.storage.local.get(['whitelistedDomains'], (data) => {
    if (data.whitelistedDomains) {
      whitelistInput.value = data.whitelistedDomains.join('\n');
    }
  });

  // Save Whitelist
  saveWhitelistBtn.addEventListener('click', () => {
    const rawInput = whitelistInput.value;
    // Process input: split by line, trim, remove empty
    const domains = rawInput.split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0)
      // Basic validation to ensure clean domain names
      .map(d => d.replace(/^https?:\/\//, '').replace(/\/$/, ''));

    // Remove duplicates
    const uniqueDomains = [...new Set(domains)];

    chrome.storage.local.set({ whitelistedDomains: uniqueDomains }, () => {
      // Notify background to update rules
      uniqueDomains.forEach(domain => {
        chrome.runtime.sendMessage({ action: 'updateWhitelist', domain: domain, add: true });
      });

      // Show feedback
      saveStatus.textContent = 'Saved successfully!';
      setTimeout(() => {
        saveStatus.textContent = '';
      }, 2000);
    });
  });
});