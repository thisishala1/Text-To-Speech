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
                this.detectedLanguageCode = 'en-US';
                
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

                // Control events with touch-friendly handling for mobile
                this.addTouchFriendlySlider(this.elements.rateSlider, this.elements.rateValue);
                this.addTouchFriendlySlider(this.elements.pitchSlider, this.elements.pitchValue);
                this.addTouchFriendlySlider(this.elements.volumeSlider, this.elements.volumeValue);

                // Button events
                this.elements.speakBtn.addEventListener('click', () => this.speak());
                this.elements.pauseBtn.addEventListener('click', () => this.pause());
                this.elements.resumeBtn.addEventListener('click', () => this.resume());
                this.elements.stopBtn.addEventListener('click', () => this.stop());
                this.elements.downloadBtn.addEventListener('click', () => this.downloadAudio());
            }

            addTouchFriendlySlider(slider, valueDisplay) {
                let isDragging = false;
                
                // Prevent page scroll when interacting with sliders on mobile
                slider.addEventListener('touchstart', (e) => {
                    isDragging = true;
                    e.preventDefault();
                }, { passive: false });

                slider.addEventListener('touchmove', (e) => {
                    if (isDragging) {
                        e.preventDefault();
                    }
                }, { passive: false });

                slider.addEventListener('touchend', () => {
                    isDragging = false;
                });

                slider.addEventListener('input', () => {
                    valueDisplay.textContent = parseFloat(slider.value).toFixed(1);
                });

                // Add visual feedback for touch
                slider.addEventListener('touchstart', () => {
                    slider.style.transform = 'scale(1.05)';
                });

                slider.addEventListener('touchend', () => {
                    slider.style.transform = 'scale(1)';
                });
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

                // Group voices by language for better organization
                const voicesByLang = {};
                this.voices.forEach((voice) => {
                    const lang = voice.lang.split('-')[0]; // Get language code without region
                    if (!voicesByLang[lang]) {
                        voicesByLang[lang] = [];
                    }
                    voicesByLang[lang].push(voice);
                });

                // Add voices grouped by language
                Object.keys(voicesByLang).sort().forEach(lang => {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = this.getLanguageName(lang);
                    
                    voicesByLang[lang].forEach((voice) => {
                        const option = document.createElement('option');
                        option.textContent = `${voice.name}`;
                        option.value = voice.name;
                        option.setAttribute('data-lang', voice.lang);
                        
                        // Prefer neural/premium voices for better quality
                        if (voice.name.toLowerCase().includes('neural') || 
                            voice.name.toLowerCase().includes('premium') ||
                            voice.name.toLowerCase().includes('enhanced')) {
                            option.textContent += ' (Premium)';
                        }
                        
                        optgroup.appendChild(option);
                    });
                    
                    this.elements.voiceSelect.appendChild(optgroup);
                });

                // Set default voice
                this.selectBestVoiceForLanguage(this.detectedLanguageCode);
            }

            getLanguageName(langCode) {
                const languageNames = {
                    'en': 'English',
                    'es': 'Spanish',
                    'fr': 'French',
                    'de': 'German',
                    'it': 'Italian',
                    'pt': 'Portuguese',
                    'ru': 'Russian',
                    'ja': 'Japanese',
                    'ko': 'Korean',
                    'zh': 'Chinese',
                    'ar': 'Arabic',
                    'hi': 'Hindi',
                    'nl': 'Dutch',
                    'sv': 'Swedish',
                    'da': 'Danish',
                    'no': 'Norwegian',
                    'fi': 'Finnish',
                    'pl': 'Polish',
                    'tr': 'Turkish'
                };
                return languageNames[langCode] || langCode.toUpperCase();
            }

            selectBestVoiceForLanguage(languageCode) {
                const targetLang = languageCode.split('-')[0];
                const matchingVoices = this.voices.filter(voice => 
                    voice.lang.toLowerCase().startsWith(targetLang.toLowerCase())
                );

                if (matchingVoices.length > 0) {
                    // Prefer neural/premium voices
                    let bestVoice = matchingVoices.find(voice => 
                        voice.name.toLowerCase().includes('neural') ||
                        voice.name.toLowerCase().includes('premium') ||
                        voice.name.toLowerCase().includes('enhanced')
                    );

                    // If no premium voice, prefer female voices as they're often clearer
                    if (!bestVoice) {
                        bestVoice = matchingVoices.find(voice => 
                            voice.name.toLowerCase().includes('female') ||
                            voice.name.toLowerCase().includes('woman') ||
                            voice.name.toLowerCase().includes('sara') ||
                            voice.name.toLowerCase().includes('emma') ||
                            voice.name.toLowerCase().includes('jenny')
                        );
                    }

                    // Fallback to first available voice for the language
                    if (!bestVoice) {
                        bestVoice = matchingVoices[0];
                    }

                    // Set the voice in the dropdown
                    for (let option of this.elements.voiceSelect.options) {
                        if (option.value === bestVoice.name) {
                            option.selected = true;
                            break;
                        }
                    }
                }
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
                    this.showNotification('File uploaded successfully!', 'success');
                };

                reader.onerror = () => {
                    this.showNotification('Error reading file. Please try again.', 'error');
                };

                if (file.type === 'text/plain') {
                    reader.readAsText(file);
                } else {
                    this.showNotification('Please upload a valid text file (.txt)', 'error');
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
                    const detectedInfo = this.advancedLanguageDetection(text);
                    this.detectedLanguageCode = detectedInfo.code;
                    this.elements.detectedLanguage.textContent = detectedInfo.name;
                    this.elements.languageInfo.style.display = 'block';
                    
                    // Automatically select the best voice for detected language
                    this.selectBestVoiceForLanguage(this.detectedLanguageCode);
                } else {
                    this.elements.languageInfo.style.display = 'none';
                }
            }

            advancedLanguageDetection(text) {
                // More comprehensive language detection
                const patterns = {
                    'fr-FR': {
                        name: 'French',
                        patterns: [/\b(le|la|les|un|une|des|et|de|du|dans|pour|avec|sur|par|ce|cette|ces|qui|que|dont|où)\b/gi,
                                 /[àâäéèêëïîôöùûüÿç]/gi]
                    },
                    'es-ES': {
                        name: 'Spanish', 
                        patterns: [/\b(el|la|los|las|un|una|y|de|en|a|por|con|para|que|es|son|está|están)\b/gi,
                                 /[áéíóúñü]/gi]
                    },
                    'de-DE': {
                        name: 'German',
                        patterns: [/\b(der|die|das|ein|eine|und|oder|mit|von|zu|in|auf|für|ist|sind|war|waren)\b/gi,
                                 /[äöüß]/gi]
                    },
                    'it-IT': {
                        name: 'Italian',
                        patterns: [/\b(il|la|lo|gli|le|un|una|e|di|a|da|in|con|su|per|che|è|sono|era|erano)\b/gi,
                                 /[àèéìíîòóù]/gi]
                    },
                    'pt-PT': {
                        name: 'Portuguese',
                        patterns: [/\b(o|a|os|as|um|uma|e|de|em|para|com|por|que|é|são|era|eram)\b/gi,
                                 /[áâãàéêíóôõú]/gi]
                    },
                    'ru-RU': {
                        name: 'Russian',
                        patterns: [/[а-яё]/gi]
                    },
                    'ja-JP': {
                        name: 'Japanese',
                        patterns: [/[ひらがなカタカナ漢字]/gi, /[一-龯]/gi]
                    },
                    'ko-KR': {
                        name: 'Korean',
                        patterns: [/[가-힣]/gi]
                    },
                    'zh-CN': {
                        name: 'Chinese',
                        patterns: [/[一-龯]/gi]
                    },
                    'ar-SA': {
                        name: 'Arabic',
                        patterns: [/[ا-ي]/gi]
                    },
                    'hi-IN': {
                        name: 'Hindi',
                        patterns: [/[अ-ह]/gi]
                    }
                };

                let bestMatch = { code: 'en-US', name: 'English', score: 0 };

                for (const [langCode, langInfo] of Object.entries(patterns)) {
                    let score = 0;
                    for (const pattern of langInfo.patterns) {
                        const matches = text.match(pattern);
                        if (matches) {
                            score += matches.length;
                        }
                    }
                    
                    if (score > bestMatch.score) {
                        bestMatch = { code: langCode, name: langInfo.name, score };
                    }
                }

                return bestMatch;
            }

            speak() {
                if (this.synth.speaking) {
                    this.showNotification('Already speaking. Please wait or stop current speech.', 'warning');
                    return;
                }

                const text = this.elements.textInput.value.trim();
                if (!text) {
                    this.showNotification('Please enter some text to speak.', 'warning');
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
                
                // Set voice based on current selection
                const selectedVoiceName = this.elements.voiceSelect.value;
                const selectedVoice = this.voices.find(voice => voice.name === selectedVoiceName);
                if (selectedVoice) {
                    this.currentUtterance.voice = selectedVoice;
                    this.currentUtterance.lang = selectedVoice.lang; // Ensure language is set
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
                    this.showNotification('Speech synthesis error occurred.', 'error');
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
                    this.showNotification('Speech paused', 'info');
                }
            }

            resume() {
                if (this.isPaused) {
                    this.synth.resume();
                    this.isPaused = false;
                    this.updateButtonStates();
                    this.elements.progressText.textContent = 'Speaking...';
                    this.showNotification('Speech resumed', 'info');
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
                this.showNotification('Speech stopped', 'info');
            }

            onSpeechEnd() {
                this.isPlaying = false;
                this.isPaused = false;
                this.updateButtonStates();
                this.elements.progressFill.style.width = '100%';
                this.elements.progressText.textContent = 'Completed';
                this.stopVisualizer();
                this.showNotification('Speech completed!', 'success');
                
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
                this.showNotification('Audio download feature coming soon! Currently, you can use your browser\'s built-in recording tools.', 'info');
            }

            // Replaced showToast with showNotification to remove Bootstrap toast dependency
            showNotification(message, type = 'info') {
                // Create a simple notification without Bootstrap alerts
                const notification = document.createElement('div');
                notification.className = `notification notification-${type}`;
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: ${type === 'success' ? '#00d1b2' : type === 'error' ? '#ff3860' : type === 'warning' ? '#ffdd57' : '#3273dc'};
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    z-index: 10000;
                    max-width: 300px;
                    font-weight: 500;
                    animation: slideIn 0.3s ease;
                `;

                notification.textContent = message;
                document.body.appendChild(notification);

                // Auto remove after 4 seconds
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.style.animation = 'slideOut 0.3s ease';
                        setTimeout(() => {
                            if (notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        }, 300);
                    }
                }, 4000);

                // Add click to close
                notification.addEventListener('click', () => {
                    if (notification.parentNode) {
                        notification.style.animation = 'slideOut 0.3s ease';
                        setTimeout(() => {
                            if (notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        }, 300);
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

