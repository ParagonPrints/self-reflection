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
}

// Initial chart render
updateChart(); displayJournal();