 // Loader
        window.addEventListener('load', function() {
            const loader = document.getElementById('loader');
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        });

        // Navbar scroll effect
        window.addEventListener('scroll', function() {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Enhanced Text-to-Speech Functionality
        const textInput = document.getElementById('text-input');
        const languageSelect = document.getElementById('language');
        const playButton = document.getElementById('play-button');
        const tellStoryButton = document.getElementById('tell-story');
        const introducePodcastButton = document.getElementById('introduce-podcast');
        const createVoiceoverButton = document.getElementById('create-voiceover');

        let currentUtterance = null;
        let isPlaying = false;

        // Enhanced speech function with better voice selection
        function speakText(text, lang) {
            if (currentUtterance) {
                speechSynthesis.cancel();
            }
            
            if (!text.trim()) {
                alert('Please enter some text to speak.');
                return;
            }

            currentUtterance = new SpeechSynthesisUtterance(text);
            currentUtterance.lang = lang;
            
            // Try to find a better voice for the selected language
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.lang.startsWith(lang.split('-')[0]) && voice.localService
            ) || voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
            
            if (preferredVoice) {
                currentUtterance.voice = preferredVoice;
            }
            
            // Enhanced speech settings
            currentUtterance.rate = 0.9;
            currentUtterance.pitch = 1.0;
            currentUtterance.volume = 1.0;
            
            // Update button state
            isPlaying = true;
            playButton.innerHTML = '<i class="fas fa-stop"></i> Stop Speech';
            playButton.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
            
            currentUtterance.onend = () => {
                isPlaying = false;
                playButton.innerHTML = '<i class="fas fa-play"></i> Play Speech';
                playButton.style.background = 'var(--gradient-primary)';
            };
            
            currentUtterance.onerror = () => {
                isPlaying = false;
                playButton.innerHTML = '<i class="fas fa-play"></i> Play Speech';
                playButton.style.background = 'var(--gradient-primary)';
                alert('Speech synthesis failed. Please try again.');
            };
            
            speechSynthesis.speak(currentUtterance);
        }

        // Play/Stop button functionality
        playButton.addEventListener('click', () => {
            if (isPlaying) {
                speechSynthesis.cancel();
                isPlaying = false;
                playButton.innerHTML = '<i class="fas fa-play"></i> Play Speech';
                playButton.style.background = 'var(--gradient-primary)';
            } else {
                const text = textInput.value;
                const lang = languageSelect.value;
                speakText(text, lang);
            }
        });

        // Preset text buttons with enhanced content
        tellStoryButton.addEventListener('click', () => {
            const storyText = "Once upon a time, in a mystical realm where technology and magic intertwined, there lived a brilliant inventor named Aria. She discovered that words themselves held incredible power when spoken with the right intention and clarity. Through her revolutionary text-to-speech invention, she could bring stories to life, making them accessible to everyone, regardless of their ability to read traditional text.";
            textInput.value = storyText;
            speakText(storyText, languageSelect.value);
        });

        introducePodcastButton.addEventListener('click', () => {
            const podcastText = "Welcome to 'Digital Horizons', the podcast that explores the fascinating intersection of technology and human experience. I'm your host, and today we're diving deep into the world of artificial intelligence and how it's transforming the way we communicate, learn, and connect with information. Stay tuned for an enlightening conversation with industry experts who are shaping the future of digital accessibility.";
            textInput.value = podcastText;
            speakText(podcastText, languageSelect.value);
        });

        createVoiceoverButton.addEventListener('click', () => {
            const voiceoverText = "In a world where information flows at the speed of light, one breakthrough technology stands ready to transform how we experience written content. LitSphere represents more than just text-to-speech conversion—it's a gateway to accessibility, a bridge to understanding, and a catalyst for innovation. Discover the power of giving every word a voice, and every voice the power to inspire.";
            textInput.value = voiceoverText;
            speakText(voiceoverText, languageSelect.value);
        });

        // Enhanced Reading Timer Functionality
        const listeningGoalInput = document.getElementById("listening-goal-input");
        const startBtn = document.getElementById("start-btn");
        const pauseBtn = document.getElementById("pause-btn");
        const stopBtn = document.getElementById("stop-btn");
        const progressBar = document.getElementById("progress-bar");
        const timerDisplay = document.getElementById("timer-display");
        
        let timerInterval;
        let totalTimeInSeconds;
        let elapsedTime = 0;
        let isPaused = false;
        let isRunning = false;

        // Enhanced start function
        startBtn.addEventListener("click", function() {
            const goalMinutes = parseInt(listeningGoalInput.value);
            
            if (isNaN(goalMinutes) || goalMinutes <= 0) {
                alert("Please enter a valid reading goal (1-1440 minutes).");
                listeningGoalInput.focus();
                return;
            }

            if (goalMinutes > 1440) {
                alert("Please enter a goal of 1440 minutes (24 hours) or less.");
                listeningGoalInput.focus();
                return;
            }

            totalTimeInSeconds = goalMinutes * 60;
            elapsedTime = 0;
            isPaused = false;
            isRunning = true;

            // Reset progress bar and timer display
            progressBar.style.width = "0%";
            updateTimerDisplay();

            // Update button states
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
            listeningGoalInput.disabled = true;
            
            // Start timer with enhanced functionality
            timerInterval = setInterval(function() {
                if (!isPaused && isRunning) {
                    elapsedTime++;
                    const progressPercent = Math.min((elapsedTime / totalTimeInSeconds) * 100, 100);
                    progressBar.style.width = `${progressPercent}%`;
                    updateTimerDisplay();

                    if (elapsedTime >= totalTimeInSeconds) {
                        completeGoal();
                    }
                }
            }, 1000);
        });

        // Enhanced pause/resume function
        pauseBtn.addEventListener("click", function() {
            isPaused = !isPaused;
            if (isPaused) {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
                pauseBtn.style.background = 'linear-gradient(135deg, #00d1b2 0%, #667eea 100%)';
                timerDisplay.textContent = `Paused - ${formatTime(totalTimeInSeconds - elapsedTime)} remaining`;
            } else {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                pauseBtn.style.background = 'linear-gradient(135deg, #ffa726 0%, #ff7043 100%)';
                updateTimerDisplay();
            }
        });

        // Enhanced stop function
        stopBtn.addEventListener("click", function() {
            if (confirm("Are you sure you want to stop your reading session? Your progress will be lost.")) {
                resetTimer();
            }
        });

        // Helper functions
        function updateTimerDisplay() {
            const remainingTime = totalTimeInSeconds - elapsedTime;
            const progressPercent = Math.round((elapsedTime / totalTimeInSeconds) * 100);
            
            if (remainingTime > 0) {
                timerDisplay.textContent = `Keep going! ${formatTime(remainingTime)} remaining (${progressPercent}% complete)`;
            } else {
                timerDisplay.textContent = "Goal completed! 🎉";
            }
        }

        function completeGoal() {
            clearInterval(timerInterval);
            isRunning = false;
            progressBar.style.width = "100%";
            timerDisplay.textContent = "🎉 Congratulations! Goal achieved! 🎉";
            
            // Celebration effect
            progressBar.style.background = 'linear-gradient(135deg, #00d1b2 0%, #667eea 50%, #764ba2 100%)';
            
            // Show completion message
            setTimeout(() => {
                alert("🎉 Congratulations! You've reached your reading goal! Keep up the great work!");
                resetTimer();
            }, 1000);
        }

        function resetTimer() {
            clearInterval(timerInterval);
            elapsedTime = 0;
            isPaused = false;
            isRunning = false;
            
            progressBar.style.width = "0%";
            progressBar.style.background = 'var(--gradient-primary)';
            timerDisplay.textContent = "Set your goal to begin";

            // Reset button states
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            listeningGoalInput.disabled = false;
            
            // Reset pause button
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            pauseBtn.style.background = 'var(--gradient-primary)';
        }

        // Enhanced time formatting
        function formatTime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
            
            if (hours > 0) {
                return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
            } else {
                return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
            }
        }

        // Load voices when available
        speechSynthesis.addEventListener('voiceschanged', () => {
            // Voices are now loaded
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        if (!isPlaying && textInput.value.trim()) {
                            speakText(textInput.value, languageSelect.value);
                        }
                        break;
                    case ' ':
                        if (e.target === document.body) {
                            e.preventDefault();
                            if (isRunning && !startBtn.disabled) {
                                pauseBtn.click();
                            }
                        }
                        break;
                }
            }
        });