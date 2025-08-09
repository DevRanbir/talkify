import Groq from "groq-sdk";

/**
 * Text-to-Speech Service using Groq API
 * Handles converting AI messages to speech audio
 */
class TextToSpeechService {
  constructor() {
    this.groq = null; // Will be initialized after getting API key
    this.apiKey = null;
    this.isEnabled = true;
    this.currentAudio = null;
    this.initializationPromise = null;
    
    // API configuration similar to TalkifyAPI
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-backend.railway.app'  // Replace with your Railway URL
      : 'http://localhost:8000';
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
      const response = await fetch(`${this.baseURL}/key`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.apiKey = data.api_key;
      
      // Initialize Groq client with the fetched API key
      this.groq = new Groq({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true // Enable browser usage
      });
      
      console.log('🔑 TTS service initialized with API key');
      
    } catch (error) {
      console.error('Failed to fetch API key:', error);
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

      if (!this.isAvailable() || !text?.trim()) {
        return;
      }

      // Stop any currently playing audio
      this.stopSpeaking();

      // Clean the text for better speech synthesis
      const cleanText = this.cleanTextForSpeech(text);
      
      if (!cleanText.trim()) {
        return;
      }

      console.log('🔊 Generating speech for:', cleanText.substring(0, 50) + '...');

      // Generate speech using Groq API
      const speechResponse = await this.groq.audio.speech.create({
        model: "playai-tts-arabic",
        voice: options.voice || "Amira-PlayAI", // Default voice
        response_format: "wav",
        input: cleanText,
        ...options
      });

      // Convert response to audio buffer (browser-compatible)
      const arrayBuffer = await speechResponse.arrayBuffer();
      
      // Create blob and play audio
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio element
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = options.volume || 0.8;
      
      // Clean up URL when audio ends
      this.currentAudio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
      });

      // Handle errors
      this.currentAudio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
      });

      // Play the audio
      await this.currentAudio.play();
      console.log('🎵 Speech playback started');

    } catch (error) {
      console.error('TTS Error:', error);
      // Fail silently - don't interrupt user experience
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
}

// Create and export singleton instance
const textToSpeechService = new TextToSpeechService();
export default textToSpeechService;
