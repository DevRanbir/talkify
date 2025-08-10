import textToSpeechService from './TextToSpeechService';

/**
 * Voice Chat Service
 * Handles voice interactions for chat and quiz components
 */
class VoiceChatService {
  constructor() {
    this.isVoiceEnabled = localStorage.getItem('voiceEnabled') !== 'false'; // Default to enabled
    this.autoSpeak = localStorage.getItem('autoSpeak') !== 'false'; // Default to enabled
    this.speechQueue = []; // Queue for sequential speech
    this.isSpeechQueueProcessing = false; // Flag to prevent multiple queue processing
    this.statusChangeCallbacks = []; // Callbacks for status changes
    
    // Listen to TextToSpeechService status changes
    textToSpeechService.addStatusChangeCallback(() => {
      this.notifyStatusChange();
    });
  }

  /**
   * Enable or disable voice functionality
   */
  setVoiceEnabled(enabled) {
    this.isVoiceEnabled = enabled;
    localStorage.setItem('voiceEnabled', enabled.toString());
    textToSpeechService.setEnabled(enabled);
    
    if (!enabled) {
      this.stopSpeaking();
    }
  }

  /**
   * Enable or disable auto-speaking of AI messages
   */
  setAutoSpeak(enabled) {
    this.autoSpeak = enabled;
    localStorage.setItem('autoSpeak', enabled.toString());
  }

  /**
   * Get current voice settings
   */
  getVoiceSettings() {
    const ttsSettings = textToSpeechService.getTTSSettings();
    return {
      isVoiceEnabled: this.isVoiceEnabled,
      autoSpeak: this.autoSpeak,
      isAvailable: textToSpeechService.isAvailable(),
      isTemporarilyDisabled: !textToSpeechService.isEnabled, // Check if disabled due to rate limits
      tts: ttsSettings || {
        model: 'playai-tts-arabic',
        voice: 'Amira-PlayAI',
        availableModels: textToSpeechService.getAvailableModels()
      }
    };
  }

  /**
   * Speak AI message automatically if auto-speak is enabled
   */
  async speakAIMessage(message, options = {}) {
    if (this.isVoiceEnabled && this.autoSpeak && message) {
      try {
        await this.speak(message, options);
      } catch (error) {
        console.warn('🔇 AI message speech failed, continuing silently:', error.message);
        // Fail silently to not break the user experience
      }
    }
  }

  /**
   * Manually speak any text
   */
  async speak(text, options = {}) {
    if (this.isVoiceEnabled) {
      try {
        // Check if TTS was temporarily disabled and try to re-enable
        textToSpeechService.checkAndReEnable();
        
        await textToSpeechService.speak(text, options);
      } catch (error) {
        console.warn('🔇 Voice synthesis failed, continuing silently:', error.message);
        // Notify UI about potential status change
        this.notifyStatusChange();
        // Fail silently to not break the user experience
      }
    }
  }

  /**
   * Force speak text regardless of voice settings (used for important messages like welcome)
   */
  async forceSpeak(text, options = {}) {
    try {
      // Check if TTS was temporarily disabled and try to re-enable
      textToSpeechService.checkAndReEnable();
      
      await textToSpeechService.speak(text, options);
    } catch (error) {
      console.warn('🔇 Voice synthesis failed, continuing silently:', error.message);
      // Notify UI about potential status change
      this.notifyStatusChange();
      // Fail silently to not break the user experience
    }
  }

  /**
   * Add text to speech queue for sequential speaking
   */
  async queueSpeak(text, options = {}) {
    return new Promise((resolve) => {
      this.speechQueue.push({ text, options, resolve });
      this.processSpeechQueue();
    });
  }

  /**
   * Process speech queue sequentially
   */
  async processSpeechQueue() {
    if (this.isSpeechQueueProcessing || this.speechQueue.length === 0) {
      return;
    }

    this.isSpeechQueueProcessing = true;

    while (this.speechQueue.length > 0) {
      const { text, options, resolve } = this.speechQueue.shift();
      try {
        // Wait for the current speech to completely finish before starting the next one
        await textToSpeechService.speak(text, options);
        resolve();
      } catch (error) {
        console.error('Error in speech queue:', error);
        resolve(); // Resolve anyway to continue processing
      }
    }

    this.isSpeechQueueProcessing = false;
  }

  /**
   * Stop any currently playing speech
   */
  stopSpeaking() {
    // Clear the speech queue
    this.speechQueue = [];
    this.isSpeechQueueProcessing = false;
    // Stop current audio
    textToSpeechService.stopSpeaking();
  }

  /**
   * Check if speech is currently playing
   */
  isSpeaking() {
    return textToSpeechService.isSpeaking();
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    return textToSpeechService.getAvailableVoices();
  }

  /**
   * Set TTS model
   */
  setTTSModel(model) {
    textToSpeechService.setModel(model);
  }

  /**
   * Set TTS voice
   */
  setTTSVoice(voice) {
    textToSpeechService.setVoice(voice);
  }

  /**
   * Get available TTS models and voices
   */
  getAvailableModels() {
    return textToSpeechService.getAvailableModels();
  }

  /**
   * Manually try to re-enable TTS service (for UI buttons)
   */
  retryTTS() {
    textToSpeechService.reEnableService();
    console.log('🔄 TTS retry requested by user');
    this.notifyStatusChange();
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
        console.error('Error in status change callback:', error);
      }
    });
  }
}

// Create and export singleton instance
const voiceChatService = new VoiceChatService();
export default voiceChatService;
