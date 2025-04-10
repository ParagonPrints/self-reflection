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

// Score Calculation
function calculateScores() {
    const q1Toggles = document.querySelectorAll('[data-main-question="1"]:checked').length;
    const q2Toggles = document.querySelectorAll('[data-main-question="2"]:checked').length;
    
    document.querySelectorAll('.main-score').forEach(container => {
        const question = container.dataset.question;
        const checked = question === "1" ? q1Toggles : q2Toggles;
        const percent = (checked / 4 * 100).toFixed(0);
        
        container.querySelector('.score-percent').textContent = `${percent}%`;
        container.querySelector('.score-bar').style.width = `${percent}%`;
    });
}

// Save Functionality
function saveDailyCheckin() {
    const q1Checked = document.querySelectorAll('[data-main-question="1"]:checked').length;
    const q2Checked = document.querySelectorAll('[data-main-question="2"]:checked').length;
    
    const newEntry = {
        date: new Date().toISOString(),
        scores: {
            q1: (q1Checked / 4 * 100).toFixed(0),
            q2: (q2Checked / 4 * 100).toFixed(0)
        },
        details: {
            q1: Array.from(document.querySelectorAll('[data-main-question="1"]')).map(input => input.checked),
            q2: Array.from(document.querySelectorAll('[data-main-question="2"]')).map(input => input.checked)
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