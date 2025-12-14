document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio');
    const playBtn = document.getElementById('playBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const progressSlider = document.getElementById('progressSlider');
    const timeDisplay = document.getElementById('timeDisplay');
    const installPrompt = document.getElementById('installPrompt');
    const closePromptBtn = document.getElementById('closePrompt');
    const noWordsToggle = document.getElementById('noWordsToggle');

    // Helper to format seconds into mm:ss
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Set default volume
    audio.volume = 0.7;

    // Update duration when metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
        progressSlider.max = audio.duration;
        // Initialize time display
        updateTimeDisplay(0, audio.duration);
    });

    // Update progress and time during playback
    audio.addEventListener('timeupdate', () => {
        progressSlider.value = audio.currentTime;
        updateTimeDisplay(audio.currentTime, audio.duration);
    });

    // Helper to update time display
    function updateTimeDisplay(current, duration) {
        const format = (sec) => {
            const mins = Math.floor(sec / 60);
            const secs = Math.floor(sec % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };
        timeDisplay.textContent = `${format(current)} / ${format(duration)}`;
    }

    // Seek when user moves the progress slider
    progressSlider.addEventListener('input', () => {
        audio.currentTime = progressSlider.value;
    });

    // Play / pause toggle
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                playBtn.classList.add('playing');
            }).catch(e => console.log('Playback failed:', e));
        } else {
            audio.pause();
            playBtn.classList.remove('playing');
        }
    });

    // Rewind to start
    rewindBtn.addEventListener('click', () => {
        audio.currentTime = 0;
        if (!audio.paused) {
            audio.play();
        }
    });

    // Switch version without lyrics
    noWordsToggle.addEventListener('change', () => {
        const currentTime = audio.currentTime;
        const wasPlaying = !audio.paused;
        audio.src = noWordsToggle.checked ? 'song2.mp3' : 'song.mp3';
        audio.currentTime = currentTime;
        if (wasPlaying) {
            audio.play();
        }
    });

    // Reset play button when track ends
    audio.addEventListener('ended', () => {
        playBtn.classList.remove('playing');
    });

    // Installation prompt handling
    function showInstallPrompt() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isIOS && !isStandalone) {
            installPrompt.style.display = 'block';
        }
    }

    closePromptBtn.addEventListener('click', () => {
        installPrompt.style.display = 'none';
    });

    // Service worker registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => console.log('SW registered'))
                .catch(err => console.log('SW registration failed:', err));
        });
    }

    // Show install prompt after a short delay
    setTimeout(showInstallPrompt, 2000);
});