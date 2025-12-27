const fbForm = document.getElementById('feedback-form');
const fbStatus = document.getElementById('fb-status');
const mailtoBtn = document.getElementById('mailtoBtn');

fbForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value || '';
    const message = document.getElementById('message').value || '';
    const entry = { email, message, ts: Date.now() };

    // Save feedback locally (developer can later POST to server)
    try {
        chrome.storage.local.get(['feedback_submissions'], (res) => {
            const arr = res.feedback_submissions || [];
            arr.push(entry);
            chrome.storage.local.set({ feedback_submissions: arr }, () => {
                fbStatus.textContent = 'Thanks — your feedback was saved.';
                setTimeout(() => fbStatus.textContent = '', 3000);
                fbForm.reset();
            });
        });
    } catch (e) {
        // Fallback to localStorage if chrome.storage not available
        try {
            const key = 'feedback_submissions';
            const raw = localStorage.getItem(key);
            const arr = raw ? JSON.parse(raw) : [];
            arr.push(entry);
            localStorage.setItem(key, JSON.stringify(arr));
            fbStatus.textContent = 'Thanks — your feedback was saved locally.';
            setTimeout(() => fbStatus.textContent = '', 3000);
            fbForm.reset();
        } catch (e2) {
            fbStatus.textContent = 'Unable to save feedback locally.';
        }
    }
});

mailtoBtn.addEventListener('click', () => {
    const subject = encodeURIComponent('ShieldPlus Feedback');
    const body = encodeURIComponent(document.getElementById('message').value || '');
    const mailto = `mailto:support@example.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;
});
