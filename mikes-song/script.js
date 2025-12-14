document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio');
    const playBtn = document.getElementById('playBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const progressSlider = document.getElementById('progressSlider');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const installPrompt = document.getElementById('installPrompt');
    const closePromptBtn = document.getElementById('closePrompt');

    // Helper to format seconds into mm:ss
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Initialize volume
    audio.volume = volumeSlider.value;

    // Update duration when metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
        progressSlider.max = audio.duration;
        durationSpan.textContent = formatTime(audio.duration);
    });

    // Update progress and time during playback
    audio.addEventListener('timeupdate', () => {
        progressSlider.value = audio.currentTime;
        currentTimeSpan.textContent = formatTime(audio.currentTime);
    });

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

    // Volume control
    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
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