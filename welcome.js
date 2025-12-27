document.getElementById('open-options').addEventListener('click', () => {
    try { chrome.runtime.openOptionsPage() } catch (e) { window.location.href = 'options.html' }
});
// Rate button: open Chrome Web Store reviews page (replace EXTENSION_ID)
const RATE_URL = 'https://chrome.google.com/webstore/detail/EXTENSION_ID/reviews';
const rateBtn = document.getElementById('rateBtn');
if (rateBtn) {
    rateBtn.addEventListener('click', () => {
        try { chrome.tabs.create({ url: RATE_URL }); }
        catch (e) { window.open(RATE_URL, '_blank'); }
    });
}

// Additional code can go here if needed
