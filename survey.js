const form = document.getElementById('survey-form');
let rating = 5;
document.querySelectorAll('.ratings button').forEach(btn => {
    btn.addEventListener('click', () => {
        rating = btn.getAttribute('data-val');
        document.querySelectorAll('.ratings button').forEach(b => b.style.outline = 'none');
        btn.style.outline = '2px solid rgba(79,70,229,0.25)';
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        rating,
        reason: document.getElementById('reason').value,
        comments: document.getElementById('comments').value || ''
    };

    // NOTE: To collect responses, host this page and replace the code below
    // with a POST to your analytics/endpoint (e.g., Formspree, Google Forms webhook, your server).
    // For this repository we simply redirect to a thank-you page.
    try { localStorage.setItem('uninstall_survey', JSON.stringify(data)); } catch (e) { }
    window.location.href = 'thank_you.html';
});
