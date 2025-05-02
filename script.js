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
    displayJournal(); // Call displayJournal here
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
        console.log('Entries in displayJournal:', entries); // Debugging line
        const journalHTML = entries
            .map(entry => `
                <div class="journal-entry">
                    <strong>${new Date(entry.timestamp).toLocaleString()}</strong>
                    (${entry.timeOfDay}):
                    <span class="mood-emoji">${getEmoji(entry.mood)}</span>
                    <p>${entry.note || 'No notes'}</p>
                </div>
            `)
            .join('');
        console.log('Generated Journal HTML:', journalHTML); // Debugging line
        container.innerHTML = journalHTML;
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
        console.log('checkinEntries in updateSpiritualChart:', checkinEntries); // Debugging
        if (spiritualChart) spiritualChart.destroy();

        spiritualChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: checkinEntries.map(entry => new Date(entry.date).toLocaleDateString()), // Added labels
                datasets: [
                    {
                        label: 'Love God',
                        data: checkinEntries.map(entry => entry.scores.q1),
                        borderColor: '#4CAF50',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 3
                    },
                    {
                        label: 'Love Neighbor',
                        data: checkinEntries.map(entry => entry.scores.q2),
                        borderColor: '#FF9800',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        display: false, // Hide y-axis
                        min: 0,
                        max: 100,
                        // title: { // Remove y-axis title
                        //     display: true,
                        //     text: 'Percentage'
                        // }
                        ticks: {
                            display: false // Hide y-axis ticks
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: { legend: { display: true } } // Show legend
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
        showWeaknesses();
        alert('Check-in saved successfully!');
    } else {
        alert('You already completed today\'s check-in!');
    }
}

function showWeaknesses() {
    const weaknessListDiv = document.getElementById('weaknessList');
    if (!weaknessListDiv) {
        return;
    }

    const practices = {
        'practice1-1': 'Reflecting on God\'s Word',
        'practice1-2': 'Praying and Seeking God',
        'practice1-3': 'Fellowshipping with Believers',
        'practice1-4': 'Sharing Your Faith',
        'practice2-1': 'Showing Kindness',
        'practice2-2': 'Practicing Forgiveness',
        'practice2-3': 'Serving Others',
        'practice2-4': 'Speaking Truth in Love',
    };

    const missedConsecutively = {};

    // Sort entries by date
    const sortedEntries = [...checkinEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

    for (let i = 0; i < sortedEntries.length - 1; i++) {
        const currentDate = new Date(sortedEntries[i].date).toLocaleDateString();
        const nextDate = new Date(sortedEntries[i + 1].date).toLocaleDateString();

        // Check if the entries are consecutive days
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (new Date(sortedEntries[i + 1].date) - new Date(sortedEntries[i].date) === oneDayMs) {
            const currentDetailsQ1 = sortedEntries[i].details.q1;
            const nextDetailsQ1 = sortedEntries[i + 1].details.q1;
            const currentDetailsQ2 = sortedEntries[i].details.q2;
            const nextDetailsQ2 = sortedEntries[i + 1].details.q2;

            for (const practiceId in practices) {
                const questionGroup = practiceId.startsWith('practice1') ? 'q1' : 'q2';
                const currentDetails = questionGroup === 'q1' ? currentDetailsQ1 : currentDetailsQ2;
                const nextDetails = questionGroup === 'q1' ? nextDetailsQ1 : nextDetailsQ2;

                if (currentDetails[practiceId] === false && nextDetails[practiceId] === false) {
                    missedConsecutively[practiceId] = practices[practiceId];
                }
            }
        }
    }

    const weaknesses = Object.values(missedConsecutively);

    if (weaknesses.length > 0) {
        weaknessListDiv.innerHTML = weaknesses
            .map(weakness => `<div class="weakness-item">Growth Opportunity: Focus on consistent engagement in <strong>${weakness}</strong>.</div>`)
            .join('');
    } else {
        weaknessListDiv.innerHTML = '<p>Great consistency across all practices! 🎉</p>';
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
    displayJournal(); // Call on load

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
    updateSpiritualChart(); // Call on load
    showWeaknesses(); // Call on load

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