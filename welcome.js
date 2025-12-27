document.getElementById('open-options').addEventListener('click', () => {
    try { chrome.runtime.openOptionsPage() } catch (e) { window.location.href = 'options.html' }
});
