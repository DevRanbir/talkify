import textToSpeechService from './TextToSpeechService';

/**
 * Voice Chat Service
 * Handles voice interactions for chat and quiz components
 */
class VoiceChatService {
  constructor() {
    this.isVoiceEnabled = localStorage.getItem('voiceEnabled') !== 'false'; // Default to enabled
    this.autoSpeak = localStorage.getItem('autoSpeak') !== 'false'; // Default to enabled
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
    return {
      isVoiceEnabled: this.isVoiceEnabled,
      autoSpeak: this.autoSpeak,
      isAvailable: textToSpeechService.isAvailable()
    };
  }

  /**
   * Speak AI message automatically if auto-speak is enabled
   */
  async speakAIMessage(message, options = {}) {
    if (this.isVoiceEnabled && this.autoSpeak && message) {
      await this.speak(message, options);
    }
  }

  /**
   * Manually speak any text
   */
  async speak(text, options = {}) {
    if (this.isVoiceEnabled) {
      await textToSpeechService.speak(text, options);
    }
  }

  /**
   * Stop any currently playing speech
   */
  stopSpeaking() {
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
}

// Create and export singleton instance
const voiceChatService = new VoiceChatService();
export default voiceChatService;
