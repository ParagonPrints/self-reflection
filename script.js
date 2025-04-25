// Mood Tracker Logic
let moodChart = null;
let entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
let selectedMood = null;

function handleMoodSelect(event) {
    const clickedOption = event.target;
    selectedMood = parseInt(clickedOption.dataset.mood);
    document.querySelectorAll('.mood-option').forEach(option => {
        option.classList.remove('opacity-100');
        option.classList.add('opacity-50');
    });
    clickedOption.classList.remove('opacity-50');
    clickedOption.classList.add('opacity-100');
}

function saveEntry() {
    if (!selectedMood) {
        alert('Please select a mood first!');
        return;
    }

    const entry = {
        mood: selectedMood,
        note: document.getElementById('notes').value,
        timestamp: new Date().toISOString(),
        timeOfDay: getTimeOfDay()
    };

    entries.push(entry);
    localStorage.setItem('moodEntries', JSON.stringify(entries));

    updateChart();
    document.getElementById('notes').value = '';
    selectedMood = null;
    document.querySelectorAll('.mood-option').forEach(o => {
        o.classList.remove('opacity-100');
        o.classList.add('opacity-50');
    });
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
}

function displayJournal() {
    const container = document.getElementById('journalEntries');
    if (container) {
        container.innerHTML = entries
            .map(entry => `
                <div class="journal-entry">
                    <strong>${new Date(entry.timestamp).toLocaleString()}</strong>
                    (${entry.timeOfDay}):
                    <span class="mood-emoji">${getEmoji(entry.mood)}</span>
                    <p>${entry.note || 'No notes'}</p>
                </div>
            `)
            .join('');
    }
}

function getEmoji(moodValue) {
    const emojis = ['', '😞', '😐', '😊'];
    return emojis[moodValue];
}

function updateChart() {
    const ctx = document.getElementById('moodChart');
    if (ctx) {
        const labels = entries.map(entry =>
            new Date(entry.timestamp).toLocaleDateString() + ' ' + entry.timeOfDay
        );

        if (moodChart) moodChart.destroy();

        moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Level',
                    data: entries.map(entry => entry.mood),
                    borderColor: '#4CAF50',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        min: 1,
                        max: 3,
                        ticks: {
                            callback: function(value) {
                                const moods = ['', 'Sad', 'Neutral', 'Happy'];
                                return moods[value];
                            }
                        }
                    }
                }
            }
        });
    }
}

// Spiritual Check-In Logic
let checkinEntries = JSON.parse(localStorage.getItem('spiritualCheckins') || '[]');
let spiritualChart = null;

function calculateScores() {
    const q1Toggles = document.querySelectorAll('[data-main-question="1"]:checked').length;
    const q2Toggles = document.querySelectorAll('[data-main-question="2"]:checked').length;

    document.querySelectorAll('[data-question="1"] .score-fill').forEach(el => {
        el.style.width = `${(q1Toggles / 4 * 100)}%`;
    });

    document.querySelectorAll('[data-question="2"] .score-fill').forEach(el => {
        el.style.width = `${(q2Toggles / 4 * 100)}%`;
    });

    document.querySelectorAll('.main-score').forEach(container => {
        const question = container.dataset.question;
        const checkedCount = question === "1" ? q1Toggles : q2Toggles;
        const percent = (checkedCount / 4 * 100).toFixed(0);
        const percentSpan = container.querySelector('.score-percent');
        if (percentSpan) percentSpan.textContent = `${percent}%`;
    });
}

function updateSpiritualChart() {
    const ctx = document.getElementById('spiritualChart');
    if (ctx) {
        if (spiritualChart) spiritualChart.destroy();

        spiritualChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: checkinEntries.map(() => ''),
                datasets: [
                    {
                        data: checkinEntries.map(entry => entry.scores.q1),
                        borderColor: '#4CAF50',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        data: checkinEntries.map(entry => entry.scores.q2),
                        borderColor: '#FF9800',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: {
                        display: false,
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }
}

function saveCheckin() {
    const q1Details = {};
    document.querySelectorAll('[data-main-question="1"]').forEach(toggle => {
        q1Details[toggle.id] = toggle.checked;
    });

    const q2Details = {};
    document.querySelectorAll('[data-main-question="2"]').forEach(toggle => {
        q2Details[toggle.id] = toggle.checked;
    });

    const q1Checked = Object.values(q1Details).filter(Boolean).length;
    const q2Checked = Object.values(q2Details).filter(Boolean).length;

    const newEntry = {
        date: new Date().toISOString(),
        scores: {
            q1: (q1Checked / 4) * 100,
            q2: (q2Checked / 4) * 100
        },
        details: {
            q1: q1Details,
            q2: q2Details
        }
    };

    const today = new Date().toLocaleDateString();
    const existingEntry = checkinEntries.find(entry =>
        new Date(entry.date).toLocaleDateString() === today
    );

    if (!existingEntry) {
        checkinEntries.push(newEntry);
        localStorage.setItem('spiritualCheckins', JSON.stringify(checkinEntries));
        updateSpiritualChart();
        alert('Check-in saved successfully!');
    } else {
        alert('You already completed today\'s check-in!');
    }
}

function showWeaknesses() {
    const weaknesses = [];

    const allSubQuestions = checkinEntries.flatMap(entry => [
        ...Object.entries(entry.details.q1),
        ...Object.entries(entry.details.q2)
    ]);

    const questionStats = allSubQuestions.reduce((acc, [q, checked]) => {
        acc[q] = (acc[q] || 0) + (checked ? 1 : 0);
        return acc;
    }, {});

    const weaknessListDiv = document.getElementById('weaknessList');
    if (weaknessListDiv) {
        weaknessListDiv.innerHTML = weaknesses.length
            ? weaknesses.map(w => `<div class="weakness-item">${w}</div>`).join('')
            : '<p>Great consistency across all practices! 🎉</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Mood Tracker
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(option => {
        option.addEventListener('click', handleMoodSelect);
    });

    const saveMoodButton = document.getElementById('saveMoodEntry');
    if (saveMoodButton) {
        saveMoodButton.addEventListener('click', saveEntry);
    }
    updateChart();
    displayJournal();

    // Spiritual Check-In
    const toggles = document.querySelectorAll('[data-main-question]');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', calculateScores);
    });

    const saveCheckinButton = document.querySelector('.spiritual-checkin .save-button');
    if (saveCheckinButton) {
        saveCheckinButton.addEventListener('click', saveCheckin);
    }
    calculateScores();
    updateSpiritualChart();
    showWeaknesses();

    // Cookie Consent
    function checkCookieConsent() {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            const banner = document.getElementById('gdpr-banner');
            if (banner) banner.style.display = 'block';
        }
        return consent;
    }

    function acceptCookies() {
        try {
            localStorage.setItem('cookieConsent', 'accepted');
            const banner = document.getElementById('gdpr-banner');
            if (banner) banner.style.display = 'none';
            loadGoogleAnalytics();
            console.log('Cookies accepted - Analytics loaded');
        } catch (e) {
            console.error('Error saving consent:', e);
        }
    }

    function declineCookies() {
        try {
            localStorage.setItem('cookieConsent', 'declined');
            const banner = document.getElementById('gdpr-banner');
            if (banner) banner.style.display = 'none';
            console.log('Cookies declined');
        } catch (e) {
            console.error('Error saving rejection:', e);
        }
    }

    const acceptButton = document.getElementById('acceptCookies');
    if (acceptButton) {
        acceptButton.addEventListener('click', acceptCookies);
    }

    const declineButton = document.getElementById('declineCookies');
    if (declineButton) {
        declineButton.addEventListener('click', declineCookies);
    }

    checkCookieConsent();
    loadGoogleAnalytics();
});

function loadGoogleAnalytics() {
    if (localStorage.getItem('cookieConsent') === 'accepted') {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-16YD5TS88K');

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-16YD5TS88K';
        document.head.appendChild(script);
    }
}