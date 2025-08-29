        // Enhanced Text-to-Speech Application
        class EnhancedTTS {
            constructor() {
                this.synth = window.speechSynthesis;
                this.voices = [];
                this.currentUtterance = null;
                this.isPlaying = false;
                this.isPaused = false;
                this.currentText = '';
                this.currentPosition = 0;
                this.audioChunks = [];
                this.mediaRecorder = null;
                this.audioContext = null;
                this.analyser = null;
                this.dataArray = null;
                
                this.initializeElements();
                this.initializeEventListeners();
                this.initializeVoices();
                this.initializeVisualizer();
                this.initializeLoader();
            }

            initializeElements() {
                // Get all DOM elements
                this.elements = {
                    fileInput: document.getElementById('file-input'),
                    fileUploadArea: document.getElementById('file-upload-area'),
                    fileContent: document.getElementById('file-content'),
                    fileContentContainer: document.getElementById('file-content-container'),
                    textInput: document.getElementById('text-input'),
                    voiceSelect: document.getElementById('voice-select'),
                    rateSlider: document.getElementById('rate'),
                    pitchSlider: document.getElementById('pitch'),
                    volumeSlider: document.getElementById('volume'),
                    rateValue: document.getElementById('rate-value'),
                    pitchValue: document.getElementById('pitch-value'),
                    volumeValue: document.getElementById('volume-value'),
                    speakBtn: document.getElementById('speak-btn'),
                    pauseBtn: document.getElementById('pause-btn'),
                    resumeBtn: document.getElementById('resume-btn'),
                    stopBtn: document.getElementById('stop-btn'),
                    downloadBtn: document.getElementById('download-btn'),
                    progressContainer: document.getElementById('progress-container'),
                    progressFill: document.getElementById('progress-fill'),
                    progressText: document.getElementById('progress-text'),
                    wordCount: document.getElementById('word-count'),
                    charCount: document.getElementById('char-count'),
                    languageInfo: document.getElementById('language-info'),
                    detectedLanguage: document.getElementById('detected-language'),
                    audioVisualizer: document.getElementById('audio-visualizer'),
                    audioFormat: document.getElementById('audio-format'),
                    chunkSize: document.getElementById('chunk-size'),
                    autoScroll: document.getElementById('auto-scroll'),
                    highlightWords: document.getElementById('highlight-words')
                };
            }

            initializeEventListeners() {
                // File upload events
                this.elements.fileUploadArea.addEventListener('click', () => {
                    this.elements.fileInput.click();
                });

                this.elements.fileUploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    this.elements.fileUploadArea.classList.add('dragover');
                });

                this.elements.fileUploadArea.addEventListener('dragleave', () => {
                    this.elements.fileUploadArea.classList.remove('dragover');
                });

                this.elements.fileUploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    this.elements.fileUploadArea.classList.remove('dragover');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        this.handleFileUpload(files[0]);
                    }
                });

                this.elements.fileInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        this.handleFileUpload(e.target.files[0]);
                    }
                });

                // Text input events
                this.elements.textInput.addEventListener('input', () => {
                    this.updateWordCount();
                    this.detectLanguage();
                });

                // Control events
                this.elements.rateSlider.addEventListener('input', () => {
                    this.elements.rateValue.textContent = parseFloat(this.elements.rateSlider.value).toFixed(1);
                });

                this.elements.pitchSlider.addEventListener('input', () => {
                    this.elements.pitchValue.textContent = parseFloat(this.elements.pitchSlider.value).toFixed(1);
                });

                this.elements.volumeSlider.addEventListener('input', () => {
                    this.elements.volumeValue.textContent = parseFloat(this.elements.volumeSlider.value).toFixed(1);
                });

                // Button events
                this.elements.speakBtn.addEventListener('click', () => this.speak());
                this.elements.pauseBtn.addEventListener('click', () => this.pause());
                this.elements.resumeBtn.addEventListener('click', () => this.resume());
                this.elements.stopBtn.addEventListener('click', () => this.stop());
                this.elements.downloadBtn.addEventListener('click', () => this.downloadAudio());
            }

            initializeVoices() {
                const loadVoices = () => {
                    this.voices = this.synth.getVoices();
                    this.populateVoiceList();
                };

                loadVoices();
                if (speechSynthesis.onvoiceschanged !== undefined) {
                    speechSynthesis.onvoiceschanged = loadVoices;
                }
            }

            populateVoiceList() {
                this.elements.voiceSelect.innerHTML = '';
                
                if (this.voices.length === 0) {
                    const option = document.createElement('option');
                    option.textContent = 'No voices available';
                    this.elements.voiceSelect.appendChild(option);
                    return;
                }

                this.voices.forEach((voice, index) => {
                    const option = document.createElement('option');
                    option.textContent = `${voice.name} (${voice.lang})`;
                    option.value = voice.name;
                    
                    if (voice.default) {
                        option.selected = true;
                    }
                    
                    this.elements.voiceSelect.appendChild(option);
                });
            }

            initializeVisualizer() {
                // Create visualizer bars
                for (let i = 0; i < 20; i++) {
                    const bar = document.createElement('div');
                    bar.className = 'visualizer-bar';
                    bar.style.height = '10px';
                    this.elements.audioVisualizer.appendChild(bar);
                }
            }

            initializeLoader() {
                document.addEventListener("DOMContentLoaded", () => {
                    const loader = document.getElementById("loader");
                    const mainContent = document.getElementById("main-content");

                    setTimeout(() => {
                        loader.classList.add("hidden");
                        mainContent.style.display = "block";
                    }, 1000);
                });
            }

            handleFileUpload(file) {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    const content = event.target.result;
                    this.elements.fileContent.textContent = content;
                    this.elements.textInput.value = content;
                    this.elements.fileContentContainer.style.display = 'block';
                    this.updateWordCount();
                    this.detectLanguage();
                    this.showToast('File uploaded successfully!', 'success');
                };

                reader.onerror = () => {
                    this.showToast('Error reading file. Please try again.', 'error');
                };

                if (file.type === 'text/plain') {
                    reader.readAsText(file);
                } else {
                    this.showToast('Please upload a valid text file (.txt)', 'error');
                }
            }

            updateWordCount() {
                const text = this.elements.textInput.value;
                const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                const chars = text.length;
                
                this.elements.wordCount.textContent = words;
                this.elements.charCount.textContent = chars;
            }

            detectLanguage() {
                const text = this.elements.textInput.value.trim();
                if (text.length > 10) {
                    const detectedLang = this.simpleLanguageDetection(text);
                    this.elements.detectedLanguage.textContent = detectedLang;
                    this.elements.languageInfo.style.display = 'block';
                } else {
                    this.elements.languageInfo.style.display = 'none';
                }
            }

            simpleLanguageDetection(text) {
                // Basic language detection
                if (/[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i.test(text)) {
                    return 'Romance Language (French/Spanish/Italian)';
                } else if (/[äöüß]/i.test(text)) {
                    return 'German';
                } else if (/[а-яё]/i.test(text)) {
                    return 'Russian';
                } else if (/[ひらがなカタカナ漢字]/i.test(text)) {
                    return 'Japanese';
                } else if (/[가-힣]/i.test(text)) {
                    return 'Korean';
                } else if (/[一-龯]/i.test(text)) {
                    return 'Chinese';
                } else if (/[ا-ي]/i.test(text)) {
                    return 'Arabic';
                } else {
                    return 'English';
                }
            }

            speak() {
                if (this.synth.speaking) {
                    this.showToast('Already speaking. Please wait or stop current speech.', 'warning');
                    return;
                }

                const text = this.elements.textInput.value.trim();
                if (!text) {
                    this.showToast('Please enter some text to speak.', 'warning');
                    return;
                }

                this.currentText = text;
                this.currentPosition = 0;
                this.isPlaying = true;
                this.isPaused = false;

                this.updateButtonStates();
                this.elements.progressContainer.style.display = 'block';
                this.startVisualizer();

                this.speakInChunks();
            }

            speakInChunks() {
                const chunkSize = parseInt(this.elements.chunkSize.value);
                const chunk = this.currentText.slice(this.currentPosition, this.currentPosition + chunkSize);

                if (!chunk || !this.isPlaying) {
                    this.onSpeechEnd();
                    return;
                }

                this.currentUtterance = new SpeechSynthesisUtterance(chunk);
                
                // Set voice
                const selectedVoiceName = this.elements.voiceSelect.value;
                const selectedVoice = this.voices.find(voice => voice.name === selectedVoiceName);
                if (selectedVoice) {
                    this.currentUtterance.voice = selectedVoice;
                }

                // Set parameters
                this.currentUtterance.rate = parseFloat(this.elements.rateSlider.value);
                this.currentUtterance.pitch = parseFloat(this.elements.pitchSlider.value);
                this.currentUtterance.volume = parseFloat(this.elements.volumeSlider.value);

                // Event handlers
                this.currentUtterance.onstart = () => {
                    this.updateProgress();
                };

                this.currentUtterance.onend = () => {
                    if (this.isPlaying) {
                        this.currentPosition += chunkSize;
                        setTimeout(() => this.speakInChunks(), 100);
                    }
                };

                this.currentUtterance.onerror = (event) => {
                    console.error('Speech synthesis error:', event);
                    this.showToast('Speech synthesis error occurred.', 'error');
                    this.onSpeechEnd();
                };

                this.synth.speak(this.currentUtterance);
            }

            pause() {
                if (this.synth.speaking && !this.isPaused) {
                    this.synth.pause();
                    this.isPaused = true;
                    this.updateButtonStates();
                    this.elements.progressText.textContent = 'Paused';
                    this.showToast('Speech paused', 'info');
                }
            }

            resume() {
                if (this.isPaused) {
                    this.synth.resume();
                    this.isPaused = false;
                    this.updateButtonStates();
                    this.elements.progressText.textContent = 'Speaking...';
                    this.showToast('Speech resumed', 'info');
                }
            }

            stop() {
                this.synth.cancel();
                this.isPlaying = false;
                this.isPaused = false;
                this.currentPosition = 0;
                this.updateButtonStates();
                this.elements.progressContainer.style.display = 'none';
                this.stopVisualizer();
                this.showToast('Speech stopped', 'info');
            }

            onSpeechEnd() {
                this.isPlaying = false;
                this.isPaused = false;
                this.updateButtonStates();
                this.elements.progressFill.style.width = '100%';
                this.elements.progressText.textContent = 'Completed';
                this.stopVisualizer();
                this.showToast('Speech completed!', 'success');
                
                setTimeout(() => {
                    this.elements.progressContainer.style.display = 'none';
                }, 2000);
            }

            updateProgress() {
                const progress = (this.currentPosition / this.currentText.length) * 100;
                this.elements.progressFill.style.width = `${progress}%`;
                this.elements.progressText.textContent = `Speaking... ${Math.round(progress)}%`;
            }

            updateButtonStates() {
                this.elements.speakBtn.disabled = this.isPlaying;
                this.elements.pauseBtn.disabled = !this.isPlaying || this.isPaused;
                this.elements.resumeBtn.disabled = !this.isPaused;
                this.elements.stopBtn.disabled = !this.isPlaying;
                this.elements.downloadBtn.disabled = false;

                // Update button classes
                if (this.isPlaying) {
                    this.elements.pauseBtn.classList.add('active');
                } else {
                    this.elements.pauseBtn.classList.remove('active');
                }
            }

            startVisualizer() {
                const bars = this.elements.audioVisualizer.querySelectorAll('.visualizer-bar');
                
                const animate = () => {
                    if (this.isPlaying && !this.isPaused) {
                        bars.forEach(bar => {
                            const height = Math.random() * 40 + 10;
                            bar.style.height = `${height}px`;
                        });
                        requestAnimationFrame(animate);
                    }
                };
                
                animate();
            }

            stopVisualizer() {
                const bars = this.elements.audioVisualizer.querySelectorAll('.visualizer-bar');
                bars.forEach(bar => {
                    bar.style.height = '10px';
                });
            }

            downloadAudio() {
                this.showToast('Audio download feature coming soon! Currently, you can use your browser\'s built-in recording tools.', 'info');
            }

            showToast(message, type = 'info') {
                const toastContainer = document.getElementById('toast-container');
                const toast = document.createElement('div');
                toast.className = `toast toast-custom show`;
                toast.setAttribute('role', 'alert');
                
                const icons = {
                    success: 'fas fa-check-circle',
                    error: 'fas fa-exclamation-circle',
                    warning: 'fas fa-exclamation-triangle',
                    info: 'fas fa-info-circle'
                };

                toast.innerHTML = `
                    <div class="toast-header">
                        <i class="${icons[type]} me-2"></i>
                        <strong class="me-auto">LitSphere</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                    </div>
                    <div class="toast-body">
                        ${message}
                    </div>
                `;

                toastContainer.appendChild(toast);

                // Auto remove after 5 seconds
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 5000);

                // Add click to close
                const closeBtn = toast.querySelector('.btn-close');
                closeBtn.addEventListener('click', () => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                });
            }
        }

        // Initialize the Enhanced TTS when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new EnhancedTTS();
        });

        // Loader functionality
        document.addEventListener("DOMContentLoaded", () => {
            const loader = document.getElementById("loader");
            const mainContent = document.getElementById("main-content");

            setTimeout(() => {
                loader.classList.add("hidden");
                mainContent.style.display = "block";
            }, 1000);
        });