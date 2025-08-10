import Groq from "groq-sdk";

/**
 * Text-to-Speech Service using Groq API
 * Handles converting AI messages to speech audio
 */
class TextToSpeechService {
  constructor() {
    this.groq = null; // Will be initialized after getting API key
    this.apiKey = null;
    this.secondaryApiKey = null; // Fallback API key
    this.isEnabled = true;
    this.currentAudio = null;
    this.initializationPromise = null;
    this.statusChangeCallbacks = []; // Callbacks for status changes
    this.usingSecondaryKey = false; // Track which key is currently being used
    
    // Voice settings
    this.selectedModel = localStorage.getItem('tts_model') || 'playai-tts-arabic';
    this.selectedVoice = localStorage.getItem('tts_voice') || 'Amira-PlayAI';
    
    // API configuration with fallback
    this.primaryURL = process.env.NODE_ENV === 'production' 
      ? 'https://talkify-inproduction.up.railway.app'  // Railway production URL
      : 'http://localhost:8000';

    this.fallbackURL = process.env.NODE_ENV === 'production' 
      ? 'http://localhost:8000'  // Fallback to localhost in production
      : 'https://talkify-inproduction.up.railway.app';  // Fallback to Railway in development

    this.baseURL = this.primaryURL;
    this.lastWorkingURL = null;
  }

  /**
   * Helper method to make requests with fallback
   */
  async makeRequestWithFallback(endpoint, options = {}) {
    const urls = this.lastWorkingURL 
      ? [this.lastWorkingURL, this.lastWorkingURL === this.primaryURL ? this.fallbackURL : this.primaryURL]
      : [this.primaryURL, this.fallbackURL];

    let lastError;

    for (const baseURL of urls) {
      try {
        console.log(`🔗 TTS: Trying request to: ${baseURL}${endpoint}`);
        const response = await fetch(`${baseURL}${endpoint}`, {
          ...options,
          timeout: 10000 // 10 second timeout
        });

        if (response.ok) {
          this.baseURL = baseURL;
          this.lastWorkingURL = baseURL;
          console.log(`✅ TTS: Successfully connected to: ${baseURL}`);
          return response;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`❌ TTS: Failed to connect to ${baseURL}: ${error.message}`);
        lastError = error;
        continue;
      }
    }

    throw new Error(`All TTS servers failed. Last error: ${lastError.message}`);
  }

  /**
   * Initialize the Groq client by fetching API key from backend
   */
  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._fetchApiKey();
    return this.initializationPromise;
  }

  /**
   * Fetch API key from backend
   */
  async _fetchApiKey() {
    try {
      const response = await this.makeRequestWithFallback('/key');
      
      const data = await response.json();
      this.apiKey = data.api_key;
      
      // Also fetch secondary API key
      try {
        const secondaryResponse = await this.makeRequestWithFallback('/key2');
        const secondaryData = await secondaryResponse.json();
        this.secondaryApiKey = secondaryData.api_key;
        console.log('🔑 Secondary API key fetched successfully');
      } catch (error) {
        console.warn('⚠️ Failed to fetch secondary API key:', error);
      }
      
      // Initialize Groq client with the primary API key
      this.groq = new Groq({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true // Enable browser usage
      });
      
      console.log('🔑 TTS service initialized with primary API key');
      
    } catch (error) {
      console.error('Failed to fetch primary API key:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Check if TTS is available and enabled
   */
  isAvailable() {
    return this.isEnabled && this.apiKey && this.groq;
  }

  /**
   * Enable/disable TTS functionality
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled && this.currentAudio) {
      this.stopSpeaking();
    }
  }

  /**
   * Convert text to speech and play it
   * @param {string} text - The text to convert to speech
   * @param {Object} options - Optional configuration
   * @returns {Promise<void>}
   */
  async speak(text, options = {}) {
    try {
      // Initialize the service if not already done
      if (!this.groq) {
        await this.initialize();
      }

      if (!this.isReadyToSpeak() || !text?.trim()) {
        console.log('🔇 TTS not ready or no text provided');
        return Promise.resolve();
      }

      // Stop any currently playing audio
      this.stopSpeaking();

      // Clean the text for better speech synthesis
      const cleanText = this.cleanTextForSpeech(text);
      
      if (!cleanText.trim()) {
        return Promise.resolve();
      }

      console.log('🔊 Generating speech for:', cleanText.substring(0, 50) + '...');

      // Try to generate speech with rate limit handling
      const speechResponse = await this.speakWithFallback(cleanText, options);

      if (!speechResponse) {
        // If fallback also failed, disable TTS temporarily
        console.warn('🔇 TTS temporarily disabled due to rate limits');
        this.isEnabled = false;
        this.notifyStatusChange(); // Notify about status change
        return Promise.resolve();
      }

      // Convert response to audio buffer (browser-compatible)
      const arrayBuffer = await speechResponse.arrayBuffer();
      
      // Create blob and play audio
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio element
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = options.volume || 0.8;
      
      // Return a promise that resolves when audio finishes playing
      return new Promise((resolve, reject) => {
        // Clean up URL when audio ends
        this.currentAudio.addEventListener('ended', () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          console.log('🎵 Speech playback completed');
          resolve();
        });

        // Handle errors
        this.currentAudio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(e);
        });

        // Start playing the audio
        this.currentAudio.play().then(() => {
          console.log('🎵 Speech playback started');
        }).catch((error) => {
          console.error('Failed to start audio playback:', error);
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(error);
        });
      });

    } catch (error) {
      console.error('TTS Error:', error);
      // Return a resolved promise to not break the queue
      return Promise.resolve();
    }
  }

  /**
   * Try to generate speech with fallback for rate limiting
   * @param {string} cleanText - The cleaned text to speak
   * @param {Object} options - TTS options
   * @returns {Promise<Response|null>} - Speech response or null if all failed
   */
  async speakWithFallback(cleanText, options) {
    try {
      // Try with current model first
      console.log(`🎤 Trying TTS with model: ${this.selectedModel}, voice: ${this.selectedVoice}`);
      
      return await this.groq.audio.speech.create({
        model: this.selectedModel,
        voice: this.selectedVoice,
        response_format: "wav",
        input: cleanText,
        ...options
      });
      
    } catch (error) {
      console.error('TTS Error with current model:', error);
      
      // Check if it's a rate limit error
      if (error.status === 429 || error.message?.includes('Rate limit') || error.message?.includes('rate_limit_exceeded')) {
        console.warn('🚫 Rate limit reached for current model, trying fallback...');
        
        // Try fallback to English TTS if currently using Arabic
        if (this.selectedModel === 'playai-tts-arabic') {
          try {
            console.log('🔄 Switching to English TTS model due to rate limit');
            
            const fallbackResponse = await this.groq.audio.speech.create({
              model: 'playai-tts',
              voice: 'Arista-PlayAI', // Default English voice
              response_format: "wav",
              input: cleanText,
              ...options
            });
            
            // Temporarily switch to English model
            this.selectedModel = 'playai-tts';
            this.selectedVoice = 'Arista-PlayAI';
            localStorage.setItem('tts_model', 'playai-tts');
            localStorage.setItem('tts_voice', 'Arista-PlayAI');
            
            console.log('✅ Successfully switched to English TTS');
            this.notifyStatusChange(); // Notify about model change
            return fallbackResponse;
            
          } catch (fallbackError) {
            console.error('❌ Fallback to English TTS also failed:', fallbackError);
            
            // If English model also has rate limits, try switching to secondary API key
            if (fallbackError.status === 429 || fallbackError.message?.includes('Rate limit')) {
              console.warn('🚫 Both models rate limited with primary key, trying secondary key...');
              return await this.trySecondaryKey(cleanText, options);
            }
            
            throw fallbackError;
          }
        } else {
          // Already using English model and rate limited, try secondary key
          console.warn('🚫 English TTS model rate limited with primary key, trying secondary key...');
          return await this.trySecondaryKey(cleanText, options);
        }
      }
      
      // Re-throw non-rate-limit errors
      throw error;
    }
  }

  /**
   * Try using secondary API key when primary key hits rate limits
   * @param {string} cleanText - The cleaned text to speak
   * @param {Object} options - TTS options
   * @returns {Promise<Response|null>} - Speech response or null if all failed
   */
  async trySecondaryKey(cleanText, options) {
    if (!this.secondaryApiKey) {
      console.error('❌ No secondary API key available');
      return null;
    }

    try {
      // Switch to secondary API key
      const secondaryGroq = new Groq({
        apiKey: this.secondaryApiKey,
        dangerouslyAllowBrowser: true
      });

      console.log('🔄 Switching to secondary API key');

      // Try with Arabic TTS first (preferred model)
      try {
        const response = await secondaryGroq.audio.speech.create({
          model: 'playai-tts-arabic',
          voice: 'Amira-PlayAI',
          response_format: "wav",
          input: cleanText,
          ...options
        });

        // Successfully used secondary key, update our settings
        this.groq = secondaryGroq;
        this.usingSecondaryKey = true;
        this.selectedModel = 'playai-tts-arabic';
        this.selectedVoice = 'Amira-PlayAI';
        localStorage.setItem('tts_model', 'playai-tts-arabic');
        localStorage.setItem('tts_voice', 'Amira-PlayAI');

        console.log('✅ Successfully switched to secondary key with Arabic TTS');
        this.notifyStatusChange();
        return response;

      } catch (arabicError) {
        console.warn('❌ Arabic TTS failed with secondary key, trying English:', arabicError);

        // If Arabic fails, try English with secondary key
        if (arabicError.status === 429 || arabicError.message?.includes('Rate limit')) {
          try {
            const englishResponse = await secondaryGroq.audio.speech.create({
              model: 'playai-tts',
              voice: 'Arista-PlayAI',
              response_format: "wav",
              input: cleanText,
              ...options
            });

            // Successfully used secondary key with English
            this.groq = secondaryGroq;
            this.usingSecondaryKey = true;
            this.selectedModel = 'playai-tts';
            this.selectedVoice = 'Arista-PlayAI';
            localStorage.setItem('tts_model', 'playai-tts');
            localStorage.setItem('tts_voice', 'Arista-PlayAI');

            console.log('✅ Successfully switched to secondary key with English TTS');
            this.notifyStatusChange();
            return englishResponse;

          } catch (englishError) {
            console.error('❌ Both models failed with secondary key:', englishError);
            return null;
          }
        }

        throw arabicError;
      }

    } catch (error) {
      console.error('❌ Failed to use secondary API key:', error);
      return null;
    }
  }

  /**
   * Stop any currently playing speech
   */
  stopSpeaking() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Check if speech is currently playing
   */
  isSpeaking() {
    return this.currentAudio && !this.currentAudio.paused;
  }

  /**
   * Clean text for better speech synthesis
   * @param {string} text - Raw text from AI
   * @returns {string} - Cleaned text suitable for TTS
   */
  cleanTextForSpeech(text) {
    if (!text) return '';

    let cleanText = text.toString();

    // Remove markdown formatting
    cleanText = cleanText
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')     // Italic
      .replace(/`(.*?)`/g, '$1')       // Code
      .replace(/#{1,6}\s/g, '')        // Headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .replace(/>\s/g, '')             // Blockquotes

    // Remove emojis and special characters that don't read well
    cleanText = cleanText
      .replace(/[📚🎯📋✅❌🚀💡🔥⭐🎵🔊]/g, '')
      .replace(/[^\w\s.,!?;:()]/g, ' ')

    // Clean up whitespace
    cleanText = cleanText
      .replace(/\s+/g, ' ')
      .trim();

    // Limit length to prevent very long speech
    if (cleanText.length > 500) {
      cleanText = cleanText.substring(0, 500) + '...';
    }

    return cleanText;
  }

  /**
   * Get available voices (for future enhancement)
   */
  getAvailableVoices() {
    return [
      { id: 'Ruby-PlayAI', name: 'Ruby', description: 'Friendly female voice' },
      // Add more voices as they become available in Groq
    ];
  }

  /**
   * Get available models with their voices
   */
  getAvailableModels() {
    return {
      'playai-tts': {
        name: 'English TTS',
        voices: [
          'Arista-PlayAI', 'Atlas-PlayAI', 'Basil-PlayAI', 'Briggs-PlayAI',
          'Calum-PlayAI', 'Celeste-PlayAI', 'Cheyenne-PlayAI', 'Chip-PlayAI',
          'Cillian-PlayAI', 'Deedee-PlayAI', 'Fritz-PlayAI', 'Gail-PlayAI',
          'Indigo-PlayAI', 'Mamaw-PlayAI', 'Mason-PlayAI', 'Mikail-PlayAI',
          'Mitch-PlayAI', 'Quinn-PlayAI', 'Thunder-PlayAI'
        ]
      },
      'playai-tts-arabic': {
        name: 'Arabic TTS (Multi-language)',
        voices: [
          'Ahmad-PlayAI', 'Amira-PlayAI', 'Khalid-PlayAI', 'Nasser-PlayAI'
        ]
      }
    };
  }

  /**
   * Set the TTS model
   */
  setModel(model) {
    if (this.getAvailableModels()[model]) {
      this.selectedModel = model;
      localStorage.setItem('tts_model', model);
      
      // Reset voice to first available for new model
      const voices = this.getAvailableModels()[model].voices;
      this.setVoice(voices[0]);
    }
  }

  /**
   * Set the TTS voice
   */
  setVoice(voice) {
    this.selectedVoice = voice;
    localStorage.setItem('tts_voice', voice);
  }

  /**
   * Get current model and voice settings
   */
  getTTSSettings() {
    return {
      model: this.selectedModel,
      voice: this.selectedVoice,
      availableModels: this.getAvailableModels(),
      usingSecondaryKey: this.usingSecondaryKey
    };
  }

  /**
   * Check if the service is fully initialized and ready to speak
   */
  isReadyToSpeak() {
    return this.isEnabled && this.apiKey && this.groq;
  }

  /**
   * Re-enable TTS service (useful after rate limit cooldown)
   */
  reEnableService() {
    if (this.apiKey && this.groq) {
      this.isEnabled = true;
      console.log('🔊 TTS service re-enabled');
      this.notifyStatusChange(); // Notify about status change
    }
  }

  /**
   * Reset to primary API key (useful for testing or when primary key limits reset)
   */
  resetToPrimaryKey() {
    if (this.apiKey) {
      this.groq = new Groq({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true
      });
      this.usingSecondaryKey = false;
      console.log('🔄 Reset to primary API key');
      this.notifyStatusChange();
    }
  }

  /**
   * Check if TTS was disabled due to rate limits and try to re-enable
   */
  checkAndReEnable() {
    if (!this.isEnabled && this.apiKey && this.groq) {
      // Try to re-enable after some time
      console.log('🔄 Attempting to re-enable TTS service...');
      this.reEnableService();
    }
  }

  /**
   * Add a callback to be notified when TTS status changes
   */
  addStatusChangeCallback(callback) {
    this.statusChangeCallbacks.push(callback);
  }

  /**
   * Remove a status change callback
   */
  removeStatusChangeCallback(callback) {
    this.statusChangeCallbacks = this.statusChangeCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Notify all callbacks about status change
   */
  notifyStatusChange() {
    this.statusChangeCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in TTS status change callback:', error);
      }
    });
  }
}

// Create and export singleton instance
const textToSpeechService = new TextToSpeechService();
export default textToSpeechService;
