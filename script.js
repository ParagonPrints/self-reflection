let moodChart = null;

// Initialize from localStorage
let entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
let selectedMood = null;

document.querySelectorAll('.mood-option').forEach(option => {
    option.addEventListener('click', function() {
        selectedMood = parseInt(this.dataset.mood);
        document.querySelectorAll('.mood-option').forEach(o => o.style.opacity = 0.5);
        this.style.opacity = 1;
    });
});

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
    document.querySelectorAll('.mood-option').forEach(o => o.style.opacity = 0.5);
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
}

function displayJournal() {
    const container = document.getElementById('journalEntries');
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

function getEmoji(moodValue) {
    const emojis = ['', '😞', '😐', '😊'];
    return emojis[moodValue];
}

function updateChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
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

// Spiritual Check-In Logic
let checkinEntries = JSON.parse(localStorage.getItem('spiritualCheckins') || '[]');
let spiritualChart = null;

// Score Calculation (called on toggle change now)
function calculateScores() {
    // Get toggle counts for main question 1
    const q1Toggles = document.querySelectorAll('[data-main-question="1"]');
    const q1CheckedCount = Array.from(q1Toggles).filter(toggle => toggle.checked).length;

    // Get toggle counts for main question 2
    const q2Toggles = document.querySelectorAll('[data-main-question="2"]');
    const q2CheckedCount = Array.from(q2Toggles).filter(toggle => toggle.checked).length;

    // Update progress bars
    const q1ProgressBarFill = document.querySelector('[data-question="1"] .score-fill');
    const q2ProgressBarFill = document.querySelector('[data-question="2"] .score-fill');

    if (q1ProgressBarFill) {
        q1ProgressBarFill.style.width = `${(q1CheckedCount / 4 * 100)}%`;

        console.log("Q1 Progress Bar Width:", q1ProgressBarFill.style.width);
    }

    if (q2ProgressBarFill) {
        q2ProgressBarFill.style.width = `${(q2CheckedCount / 4 * 100)}%`;

        console.log("Q2 Progress Bar Width:", q2ProgressBarFill.style.width);
    }
}

function updateSpiritualChart() {
    const ctx = document.getElementById('spiritualChart').getContext('2d');

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

    // Prevent duplicate daily entries
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

    // Calculate least-checked items
    const allSubQuestions = checkinEntries.flatMap(entry => [
        ...Object.entries(entry.details.q1),
        ...Object.entries(entry.details.q2)
    ]);

    const questionStats = allSubQuestions.reduce((acc, [q, checked]) => {
        acc[q] = (acc[q] || 0) + (checked ? 1 : 0);
        return acc;
    }, {});

    Object.entries(questionStats).forEach(([q, count]) => {
        const percentage = (count / checkinEntries.length * 100).toFixed(0);
        if (percentage < 50) {
            weaknesses.push(`Sub-question ${q}: ${percentage}% consistency`);
        }
    });

    document.getElementById('weaknessList').innerHTML = weaknesses.length
        ? weaknesses.map(w => `<div class="weakness-item">${w}</div>`).join('')
        : '<p>Great consistency across all practices! 🎉</p>';
}

// Event listeners to update progress bars on toggle change
document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('[data-main-question]');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', calculateScores);
    });

    // Initial calculation to set progress bars on page load (if needed)
    calculateScores();
    updateSpiritualChart(); // Initialize the chart on load
    showWeaknesses();     // Initialize weaknesses on load
});
    // Cookie Consent Functions
function checkCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      document.getElementById('gdpr-banner').style.display = 'block';
    }
    return consent;
  }
  
// Cookie Consent Functions
function acceptCookies() {
    try {
        localStorage.setItem('cookieConsent', 'accepted');
        document.getElementById('gdpr-banner').style.display = 'none';
        loadGoogleAnalytics();
        console.log('Cookies accepted - Analytics loaded');
    } catch (e) {
        console.error('Error saving consent:', e);
    }
}

function declineCookies() {
    try {
        localStorage.setItem('cookieConsent', 'declined');
        document.getElementById('gdpr-banner').style.display = 'none';
        console.log('Cookies declined');
    } catch (e) {
        console.error('Error saving rejection:', e);
    }
}

// Initialize on page load
// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cookie consent check
    checkCookieConsent();
    
    // Add click handlers
    document.getElementById('acceptCookies').addEventListener('click', acceptCookies);
    document.getElementById('declineCookies').addEventListener('click', declineCookies);
});
  
  
  // Google Analytics Loader
  function loadGoogleAnalytics() {
    if (localStorage.getItem('cookieConsent') === 'accepted') {
      // Google Analytics
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-16YD5TS88K'); // Replace with your GA ID
  
      // Add GA script dynamically
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-16YD5TS88K';
      document.head.appendChild(script);
    }
  }
}  


// Initial chart render
updateChart(); displayJournal();