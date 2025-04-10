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

function calculateScores() {
    const q1Toggles = document.querySelectorAll('[data-question="1"]:checked').length;
    const q2Toggles = document.querySelectorAll('[data-question="2"]:checked').length;
    
    // Animate score bars
    document.querySelectorAll('.main-score').forEach(container => {
        const question = container.dataset.question;
        const checked = question === "1" ? q1Toggles : q2Toggles;
        const total = question === "1" ? 4 : 4; // Update if sub-question counts change
        const percent = (checked / total * 100).toFixed(0);
        
        container.querySelector('.score-percent').textContent = `${percent}%`;
        container.querySelector('.score-bar').style.width = `${percent}%`;
    });
}

function saveDailyCheckin() {
    const q1Score = document.querySelectorAll('[data-question="1"]:checked').length / 4 * 100;
    const q2Score = document.querySelectorAll('[data-question="2"]:checked').length / 4 * 100;
    
    const entry = {
        date: new Date().toISOString(),
        scores: { q1: q1Score, q2: q2Score },
        details: {
            q1: Array.from(document.querySelectorAll('[data-question="1"]')).map(input => input.checked),
            q2: Array.from(document.querySelectorAll('[data-question="2"]')).map(input => input.checked)
        }
    };
    
    checkinEntries.push(entry);
    localStorage.setItem('spiritualCheckins', JSON.stringify(checkinEntries));
    updateSpiritualChart();
}

function updateSpiritualChart() {
    const ctx = document.getElementById('spiritualChart').getContext('2d');
    const labels = checkinEntries.map(entry => 
        new Date(entry.date).toLocaleDateString()
    );
    
    if (spiritualChart) spiritualChart.destroy();
    
    spiritualChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '🏆 Love God',
                    data: checkinEntries.map(entry => entry.scores.q1),
                    borderColor: '#4CAF50',
                    tension: 0.1
                },
                {
                    label: '🙌 Love Others',
                    data: checkinEntries.map(entry => entry.scores.q2),
                    borderColor: '#FF9800',
                    tension: 0.1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: value => `${value}%`
                    }
                }
            }
        }
    });
}

// Initialize
document.querySelectorAll('.sub-question').forEach(input => {
    input.addEventListener('change', calculateScores);
});

// Load previous check-in if same day
const today = new Date().toLocaleDateString();
const lastEntry = checkinEntries[checkinEntries.length - 1];
if (lastEntry && new Date(lastEntry.date).toLocaleDateString() === today) {
    // Restore toggles
    lastEntry.details.q1.forEach((checked, i) => {
        document.querySelectorAll('[data-question="1"]')[i].checked = checked;
    });
    lastEntry.details.q2.forEach((checked, i) => {
        document.querySelectorAll('[data-question="2"]')[i].checked = checked;
    });
    calculateScores();
}

updateSpiritualChart();

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
  }
  
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
  


// Initial chart render
updateChart(); displayJournal();