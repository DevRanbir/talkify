/**
 * Video Service for handling video loading and caching
 * Preloads videos from backend API endpoints
 */

class VideoService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://talkify-inproduction.up.railway.app' 
      : 'http://localhost:8000';
    this.cache = new Map();
    this.preloadPromises = new Map();
  }

  /**
   * Get video URL for a specific format
   * @param {string} format - 'mp4' or 'webm'
   * @returns {string} Video URL
   */
  getVideoURL(format = 'mp4') {
    const endpoint = format === 'webm' ? '/api/v1/vidwebm' : '/api/v1/vidmp4';
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Preload video to check availability and cache response
   * @param {string} format - 'mp4' or 'webm'
   * @returns {Promise<boolean>} True if video is available
   */
  async preloadVideo(format = 'mp4') {
    const url = this.getVideoURL(format);
    const cacheKey = `video_${format}`;

    // Return cached result if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Return existing promise if already preloading
    if (this.preloadPromises.has(cacheKey)) {
      return this.preloadPromises.get(cacheKey);
    }

    // Create new preload promise
    const preloadPromise = this.checkVideoAvailability(url, format);
    this.preloadPromises.set(cacheKey, preloadPromise);

    try {
      const result = await preloadPromise;
      this.cache.set(cacheKey, result);
      this.preloadPromises.delete(cacheKey);
      return result;
    } catch (error) {
      this.preloadPromises.delete(cacheKey);
      console.error(`Failed to preload ${format} video:`, error);
      return false;
    }
  }

  /**
   * Check if video is available at the given URL
   * @param {string} url - Video URL
   * @param {string} format - Video format
   * @returns {Promise<boolean>} True if video is available
   */
  async checkVideoAvailability(url, format) {
    try {
      console.log(`🎬 Checking ${format.toUpperCase()} video availability at: ${url}`);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        // Simple GET request to check if endpoint responds
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          const contentLength = response.headers.get('content-length');
          
          console.log(`✅ ${format.toUpperCase()} video available:`, {
            contentType,
            size: contentLength ? `${Math.round(contentLength / 1024 / 1024 * 100) / 100} MB` : 'Unknown',
            status: response.status
          });
          
          // Abort the request since we just wanted to check availability
          controller.abort();
          return true;
        } else {
          console.warn(`❌ ${format.toUpperCase()} video not available: ${response.status} ${response.statusText}`);
          return false;
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`✅ ${format.toUpperCase()} video check completed (aborted after confirmation)`);
        return true; // If we aborted, it means the request started successfully
      } else {
        console.error(`🚨 Error checking ${format.toUpperCase()} video availability:`, error);
        return false;
      }
    }
  }

  /**
   * Preload all available video formats
   * @returns {Promise<Object>} Object with availability status for each format
   */
  async preloadAllFormats() {
    console.log('🎬 Starting video preload check...');
    
    const results = await Promise.allSettled([
      this.preloadVideo('mp4'),
      this.preloadVideo('webm')
    ]);

    const availability = {
      mp4: results[0].status === 'fulfilled' ? results[0].value : false,
      webm: results[1].status === 'fulfilled' ? results[1].value : false
    };

    console.log('🎬 Video availability check complete:', availability);
    return availability;
  }

  /**
   * Get the best available video source URLs
   * @returns {Array} Array of video source objects
   */
  async getBestVideoSources() {
    const availability = await this.preloadAllFormats();
    const sources = [];

    // Add MP4 source if available (better compatibility)
    if (availability.mp4) {
      sources.push({
        src: this.getVideoURL('mp4'),
        type: 'video/mp4'
      });
    }

    // Add WebM source if available (better compression)
    if (availability.webm) {
      sources.push({
        src: this.getVideoURL('webm'),
        type: 'video/webm'
      });
    }

    console.log(`🎬 Available video sources: ${sources.length}`);
    return sources;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.preloadPromises.clear();
    console.log('🗑️ Video cache cleared');
  }
}

// Create singleton instance
const videoService = new VideoService();

export default videoService;
