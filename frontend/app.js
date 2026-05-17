const API_URL = 'https://mother-tongue.onrender.com/api/analyze';
const LANGUAGES_URL = 'http://localhost:3000/api/languages';
const REPO_URL = 'http://localhost:3000/api/analyze-repo';

// Language mode state
let currentLanguageMode = 'twi'; // Default to Twi (primary flow)
let availableLanguages = {}; // Will be loaded from backend

// Repository state
let currentRepoPath = null;       // Absolute path set by user
let currentProjectAnalysis = null; // Analysis result from backend
let isScanningRepo = false;

// Voice recognition setup
let recognition = null;
let isListening = false;

// Request cancellation
let currentAbortController = null;

// Debounce timer for preventing rapid requests
let debounceTimer = null;
const DEBOUNCE_DELAY = 500; // 500ms

// Initialize speech recognition
function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('Speech recognition not supported in this browser');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  
  // Configure language based on current mode - get from language config
  const langConfig = availableLanguages[currentLanguageMode];
  recognition.lang = langConfig?.voiceCode || 'ak-GH'; // Default to Twi if not found
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = function() {
    isListening = true;
    updateVoiceUI('listening');
    const langConfig = availableLanguages[currentLanguageMode];
    const langName = langConfig?.name || 'Twi';
    showVoiceStatus(`🎤 Listening... Speak in ${langName}`, 'listening');
  };

  recognition.onresult = function(event) {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Update textarea with interim results
    if (interimTranscript) {
      showVoiceStatus('🎤 ' + interimTranscript, 'listening');
    }

    // When final result is received
    if (finalTranscript) {
      const currentText = document.getElementById('twiInput').value;
      const newText = currentText ? currentText + ' ' + finalTranscript : finalTranscript;
      document.getElementById('twiInput').value = newText;
      showVoiceStatus('✓ Added: ' + finalTranscript, 'processing');
      setTimeout(() => hideVoiceStatus(), 2000);
    }
  };

  recognition.onerror = function(event) {
    isListening = false;
    updateVoiceUI('idle');
    
    let errorMessage = 'Voice input error';
    switch(event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected. Please try again.';
        break;
      case 'audio-capture':
        errorMessage = 'Microphone not found or not accessible.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied. Please allow microphone access.';
        break;
      case 'network':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = `Error: ${event.error}`;
    }
    
    showVoiceStatus('❌ ' + errorMessage, 'error');
    setTimeout(() => hideVoiceStatus(), 3000);
  };

  recognition.onend = function() {
    isListening = false;
    updateVoiceUI('idle');
  };

  return recognition;
}

function toggleVoiceInput() {
  if (!recognition) {
    recognition = initSpeechRecognition();
    if (!recognition) {
      showVoiceStatus('❌ Voice input not supported in this browser', 'error');
      setTimeout(() => hideVoiceStatus(), 3000);
      return;
    }
  }

  if (isListening) {
    recognition.stop();
    isListening = false;
    updateVoiceUI('idle');
    hideVoiceStatus();
  } else {
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      showVoiceStatus('❌ Could not start voice input', 'error');
      setTimeout(() => hideVoiceStatus(), 3000);
    }
  }
}

function updateVoiceUI(state) {
  const voiceBtn = document.getElementById('voiceBtn');
  if (state === 'listening') {
    voiceBtn.classList.add('listening');
    voiceBtn.title = 'Stop listening';
  } else {
    voiceBtn.classList.remove('listening');
    voiceBtn.title = 'Voice input';
  }
}

function showVoiceStatus(message, type) {
  const statusDiv = document.getElementById('voiceStatus');
  statusDiv.textContent = message;
  statusDiv.className = `voice-status ${type}`;
  statusDiv.style.display = 'flex';
}

function hideVoiceStatus() {
  const statusDiv = document.getElementById('voiceStatus');
  statusDiv.style.display = 'none';
}

// Load available languages from backend
async function loadAvailableLanguages() {
  try {
    const response = await fetch(LANGUAGES_URL);
    const data = await response.json();
    
    if (data.success && data.languages) {
      // Convert array to object for easy lookup
      data.languages.forEach(lang => {
        availableLanguages[lang.code] = lang;
      });
      
      // Generate language dropdown options dynamically
      generateLanguageModeButtons(data.languages);
      
      // Initialize speech recognition after languages are loaded
      initSpeechRecognition();
    }
  } catch (error) {
    console.error('Failed to load languages:', error);
    // Fallback to default Twi and French if API fails
    availableLanguages = {
      twi: { code: 'twi', name: 'Twi', flag: '🇬🇭', isPrimary: true, voiceCode: 'ak-GH' },
      french: { code: 'french', name: 'French', flag: '🇫🇷', isPrimary: false, voiceCode: 'fr-FR' }
    };
    // Generate dropdown with fallback data
    generateLanguageModeButtons([availableLanguages.twi, availableLanguages.french]);
  }
}

// Generate language dropdown options
function generateLanguageModeButtons(languages) {
  const dropdownMenu = document.getElementById('dropdownMenu');
  if (!dropdownMenu) return;
  
  // Clear existing options
  dropdownMenu.innerHTML = '';
  
  // Sort: primary first, then alphabetically
  const sortedLanguages = languages.sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.name.localeCompare(b.name);
  });
  
  // Create option for each language
  sortedLanguages.forEach(lang => {
    const option = document.createElement('button');
    option.className = 'dropdown-option';
    option.dataset.mode = lang.code;
    option.onclick = () => {
      switchLanguageMode(lang.code);
      toggleLanguageDropdown();
    };
    
    // Add active class to primary language
    if (lang.isPrimary) {
      option.classList.add('active');
      // Update selected language display
      updateSelectedLanguage(lang);
    }
    
    // Option with flag and name
    option.innerHTML = `<span class="lang-flag">${lang.flag}</span><span class="lang-name">${lang.name}</span>`;
    
    dropdownMenu.appendChild(option);
  });
}

// Toggle language dropdown
function toggleLanguageDropdown() {
  const dropdown = document.getElementById('dropdownMenu');
  const trigger = document.getElementById('dropdownTrigger');
  
  if (dropdown.style.display === 'none' || !dropdown.style.display) {
    dropdown.style.display = 'block';
    trigger.classList.add('open');
  } else {
    dropdown.style.display = 'none';
    trigger.classList.remove('open');
  }
}

// Update selected language display
function updateSelectedLanguage(lang) {
  const selectedLang = document.getElementById('selectedLanguage');
  if (selectedLang) {
    selectedLang.innerHTML = `<span class="lang-flag">${lang.flag}</span><span class="lang-name">${lang.name}</span>`;
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('languageDropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    const menu = document.getElementById('dropdownMenu');
    const trigger = document.getElementById('dropdownTrigger');
    if (menu) menu.style.display = 'none';
    if (trigger) trigger.classList.remove('open');
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
  // Load available languages
  await loadAvailableLanguages();
  
  // Check if speech recognition is supported
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
      voiceBtn.style.opacity = '0.5';
      voiceBtn.style.cursor = 'not-allowed';
      voiceBtn.title = 'Voice input not supported in this browser';
    }
  }
});

// ─── Repository Scanning ────────────────────────────────────────────────────

/**
 * Scan a repository path by calling the backend analyze-repo endpoint
 */
async function scanRepository() {
  const input = document.getElementById('repoPathInput');
  const path = input ? input.value.trim() : '';

  if (!path) {
    showRepoError('Please enter a project path first.');
    return;
  }

  if (isScanningRepo) return;
  isScanningRepo = true;

  const scanBtn = document.getElementById('scanBtn');
  const scanText = scanBtn ? scanBtn.querySelector('.scan-text') : null;
  const scanIcon = scanBtn ? scanBtn.querySelector('.scan-icon') : null;

  // Loading state
  if (scanBtn) scanBtn.disabled = true;
  if (scanText) scanText.textContent = 'Scanning...';
  if (scanIcon) scanIcon.textContent = '⏳';
  hideRepoError();
  hideRepoBadge();

  try {
    const response = await fetch(REPO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath: path })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.details || 'Failed to analyze repository');
    }

    // Store the repo path and project info
    currentRepoPath = path;
    currentProjectAnalysis = data.analysis;

    // Update badge
    const repoInfo = document.getElementById('repoInfo');
    if (repoInfo) {
      repoInfo.textContent = `${data.analysis.description} · ${data.analysis.totalFiles} files`;
    }
    showRepoBadge(true);

  } catch (error) {
    currentRepoPath = null;
    currentProjectAnalysis = null;
    showRepoError(`Scan failed: ${error.message}`);
    hideRepoBadge();
  } finally {
    isScanningRepo = false;
    if (scanBtn) scanBtn.disabled = false;
    if (scanText) scanText.textContent = 'Scan';
    if (scanIcon) scanIcon.textContent = '🔍';
  }
}

/**
 * Clear the connected repository
 */
function clearRepository() {
  currentRepoPath = null;
  currentProjectAnalysis = null;
  const input = document.getElementById('repoPathInput');
  if (input) input.value = '';
  hideRepoBadge();
  hideRepoError();
}

function showRepoBadge(connected = true) {
  const badge = document.getElementById('repoBadge');
  const dot = document.getElementById('repoStatusDot');
  if (badge) badge.style.display = 'flex';
  if (dot) dot.style.color = connected ? '#22c55e' : '#ef4444';
}

function hideRepoBadge() {
  const badge = document.getElementById('repoBadge');
  if (badge) badge.style.display = 'none';
}

function showRepoError(message) {
  const err = document.getElementById('repoError');
  if (err) { err.textContent = message; err.style.display = 'block'; }
}

function hideRepoError() {
  const err = document.getElementById('repoError');
  if (err) err.style.display = 'none';
}

// Allow pressing Enter in the path input to trigger scan
document.addEventListener('DOMContentLoaded', function() {
  const pathInput = document.getElementById('repoPathInput');
  if (pathInput) {
    pathInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') scanRepository();
    });
  }
});

// Switch between language modes
function switchLanguageMode(mode) {
  currentLanguageMode = mode;
  
  // Get language config
  const langConfig = availableLanguages[mode];
  if (!langConfig) {
    console.error(`Language ${mode} not found`);
    return;
  }
  
  // Update dropdown options
  document.querySelectorAll('.dropdown-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.dataset.mode === mode) {
      opt.classList.add('active');
    }
  });
  
  // Update selected language display
  updateSelectedLanguage(langConfig);
  
  // Update labels and placeholders from language config
  const textarea = document.getElementById('twiInput');
  const inputLabel = document.getElementById('inputLabel');
  const intentLabel = document.getElementById('intentLabel');
  const explanationTabLabel = document.getElementById('explanationTabLabel');
  const metaInputLang = document.getElementById('metaInputLang');
  
  // Set input label and placeholder
  inputLabel.textContent = `💬 Describe what you want to build in ${langConfig.name}`;
  textarea.placeholder = `Enter your request in ${langConfig.name}...`;
  
  // Set intent label
  intentLabel.textContent = '🇬🇧 English Intent';
  
  // Set explanation tab label
  if (explanationTabLabel) {
    explanationTabLabel.textContent = `${langConfig.name} Explanation`;
  }
  
  // Update metadata
  if (metaInputLang) {
    metaInputLang.textContent = langConfig.name;
  }
  
  // Update voice recognition language if active
  if (recognition && langConfig.voiceCode) {
    recognition.lang = langConfig.voiceCode;
  }
  
  // Hide results and errors when switching modes
  hideResults();
  document.getElementById('errorBox').style.display = 'none';
  document.getElementById('intentSection').style.display = 'none';
}

/**
 * Generate code from user input with request cancellation support
 */
async function generateCode() {
  const twiInput = document.getElementById('twiInput').value.trim();
  
  // Input validation
  if (!twiInput) {
    showError('Please enter your request first');
    return;
  }

  if (twiInput.length < 3) {
    showError('Please enter at least 3 characters');
    return;
  }

  // Cancel any pending request
  if (currentAbortController) {
    currentAbortController.abort();
    console.log('Previous request cancelled');
  }

  // Create new abort controller for this request
  currentAbortController = new AbortController();
  const startTime = Date.now();

  // Show pipeline status
  showPipelineStatus();
  hideEmptyState();
  hideResults();
  document.getElementById('errorBox').style.display = 'none';
  const generateBtn = document.getElementById('generateBtn');
  generateBtn.disabled = true;

  try {
    // Step 1: Translating
    updatePipelineStep(1, 'active');
    await sleep(500);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        twiInput,
        // Send repo path if user connected a project, otherwise no context
        ...(currentRepoPath ? { repoPath: currentRepoPath } : {}),
        languageMode: currentLanguageMode
      }),
      signal: currentAbortController.signal
    });

    // Step 2: Understanding intent
    updatePipelineStep(1, 'completed');
    updatePipelineStep(2, 'active');
    await sleep(300);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || data.error || 'Request failed');
    }

    // Validate response structure
    if (!data.englishIntent || !data.generatedCode) {
      throw new Error('Invalid response from server');
    }

    // Step 3: Generating code
    updatePipelineStep(2, 'completed');
    updatePipelineStep(3, 'active');
    await sleep(500);

    // Step 4: Translating response
    updatePipelineStep(3, 'completed');
    updatePipelineStep(4, 'active');
    await sleep(300);

    // Display English intent in left panel
    document.getElementById('englishIntent').textContent = data.englishIntent;
    document.getElementById('intentSection').style.display = 'block';
    
    // Clean and display generated code (remove markdown backticks)
    let cleanCode = data.generatedCode;
    cleanCode = cleanCode.replace(/^```javascript\n?/i, '').replace(/^```\n?/i, '').replace(/\n?```$/i, '');
    document.getElementById('generatedCode').textContent = cleanCode;
    
    // Display explanation based on language mode
    const explanation = data.twiExplanation || data.frenchExplanation;
    document.getElementById('twiExplanation').textContent = explanation || 'No explanation available';

    // Calculate generation time
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    document.getElementById('metaTime').textContent = `${duration}s`;

    // Complete pipeline
    updatePipelineStep(4, 'completed');
    await sleep(500);

    // Show results with code tab active
    hidePipelineStatus();
    showResults();
    switchTab('code');

    // Clear abort controller after successful completion
    currentAbortController = null;

  } catch (error) {
    hidePipelineStatus();
    
    // Handle different error types
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
      return; // Don't show error for cancelled requests
    }
    
    let errorMessage = 'Error: ' + error.message;
    
    // Provide user-friendly error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Network error: Unable to connect to server. Please check your connection.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timeout: The server took too long to respond. Please try again.';
    } else if (error.message.includes('429')) {
      errorMessage = 'Too many requests: Please wait a moment before trying again.';
    }
    
    showError(errorMessage);
    
  } finally {
    generateBtn.disabled = false;
  }
}

// Helper function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Pipeline status management
function showPipelineStatus() {
  document.getElementById('pipelineStatus').style.display = 'flex';
  // Reset all steps
  for (let i = 1; i <= 4; i++) {
    const step = document.getElementById(`step${i}`);
    step.classList.remove('active', 'completed');
  }
}

function hidePipelineStatus() {
  document.getElementById('pipelineStatus').style.display = 'none';
}

function updatePipelineStep(stepNum, status) {
  const step = document.getElementById(`step${stepNum}`);
  if (!step) return;
  
  step.classList.remove('active', 'completed');
  if (status) {
    step.classList.add(status);
  }
}

function copyCode() {
  const code = document.getElementById('generatedCode').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.querySelector('.copy-btn');
    const copyText = btn.querySelector('.copy-text');
    const copyIcon = btn.querySelector('.copy-icon');
    
    // Visual feedback
    btn.classList.add('copied');
    copyIcon.textContent = '✓';
    copyText.textContent = 'Copied!';
    
    setTimeout(() => {
      btn.classList.remove('copied');
      copyIcon.textContent = '📋';
      copyText.textContent = 'Copy';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    const btn = document.querySelector('.copy-btn');
    const copyText = btn.querySelector('.copy-text');
    copyText.textContent = 'Failed';
    setTimeout(() => copyText.textContent = 'Copy', 2000);
  });
}

function fillExample(num) {
  const textarea = document.getElementById('twiInput');
  
  if (currentLanguageMode === 'french') {
    // French examples
    if (num === 1) {
      textarea.value = 'Je veux créer une fonction qui prend le CGPA d\'un étudiant et une classification cible et montre la note nécessaire pour le prochain semestre';
    } else if (num === 2) {
      textarea.value = 'Créer une fonction Calculator RemainingCourses qui calcule le nombre de cours restants qu\'un étudiant doit compléter pour obtenir son diplôme à l\'Université du Ghana';
    }
  } else {
    // Twi examples (default)
    if (num === 1) {
      textarea.value = 'Me pɛ sɛ wɔyɛ function bi a ɛde student CGPA ne target classification to mu na ɛkyerɛ grade a ohia wɔ semester a edi hɔ';
    } else if (num === 2) {
      textarea.value = 'Me pɛ sɛ wɔyɛ Calculator RemainingCourses dwumadie no a ɛgyina hɔ ma adesua ahodoɔ dodoɔ a ɛsɛ sɛ sukuuni bi yɛ de wie ne mfitiaseɛ wɔ Ghana Sukuupɔn mu, denam adesua ahodoɔ a wɔawie no a wɔde toto adesua ahodoɔ a ɛho hia a wɔawie no ho';
    }
  }
}

function showError(message) {
  const errorBox = document.getElementById('errorBox');
  errorBox.textContent = message;
  errorBox.style.display = 'block';
}

// Allow Enter+Ctrl to submit
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'Enter') {
    generateCode();
  }
});

// Tab switching functionality
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    }
  });

  // Update tab panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  if (tabName === 'code') {
    document.getElementById('codeTab').classList.add('active');
  } else if (tabName === 'explanation') {
    document.getElementById('explanationTab').classList.add('active');
  }
}

// UI state management helpers
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function showResults() {
  document.getElementById('results').style.display = 'flex';
  document.getElementById('emptyState').style.display = 'none';
}

function hideResults() {
  document.getElementById('results').style.display = 'none';
}

function showEmptyState() {
  document.getElementById('emptyState').style.display = 'flex';
}

function hideEmptyState() {
  document.getElementById('emptyState').style.display = 'none';
}