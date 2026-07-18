/**
 * DetectionService - Wrapper for ml5.js COCO-SSD
 * Real-time object detection from camera feed
 * Phase 1: MVP using ml5.js for CCCD card detection
 * 
 * ml5.js loaded from CDN to avoid npm installation issues
 */

class DetectionService {
  constructor() {
    this.detector = null;
    this.initialized = false;
    this.detectionCallbacks = [];
  }

  /**
   * Initialize COCO-SSD detector
   * Downloads ~5MB model on first use from CDN
   */
  async initialize() {
    if (this.initialized) return;

    try {
      console.log('[DetectionService] Initializing COCO-SSD detector...');

      // Load ml5.js from CDN if not already loaded
      if (typeof window !== 'undefined' && !window.ml5) {
        await this._loadML5FromCDN();
      }

      // Initialize COCO-SSD using ML5 v1 API
      const ml5 = window.ml5;
      this.detector = await ml5.objectDetector('cocossd');
      this.initialized = true;
      console.log('[DetectionService] Initialized successfully');
    } catch (error) {
      console.error('[DetectionService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load ml5.js library from CDN
   */
  _loadML5FromCDN() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/ml5@0.12.2/dist/ml5.min.js';
      script.async = true;
      script.onload = () => {
        console.log('[DetectionService] ml5.js loaded from CDN');
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load ml5.js from CDN'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Detect objects in image
   * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} input - Image/video element
   * @returns {Promise<Array>} Array of detected objects with class, confidence, bbox
   */
  async detect(input) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const predictions = await this.detector.detect(input);
      // Map ML5 v1 predictions {label, confidence, x, y, width, height} to internal format
      return predictions.map(p => ({
        ...p,
        class: p.label,
        bbox: [p.x, p.y, p.width, p.height]
      }));
    } catch (error) {
      if (error.message && error.message.includes('loadeddata')) {
        // Silently ignore tfjs warning when video is not ready
        return [];
      }
      console.error('[DetectionService] Detection failed:', error);
      throw error;
    }
  }

  /**
   * Real-time detection from video stream
   * Continuously analyzes video frames
   * @param {HTMLVideoElement} videoElement - Video element from camera
   * @param {Function} onDetection - Callback when objects detected
   * @param {number} confidenceThreshold - Minimum confidence (0-1)
   * @returns {Function} Stop detection function
   */
  startRealTimeDetection(videoElement, onDetection, confidenceThreshold = 0.3) {
    let animationFrameId = null;
    let isRunning = true;

    const detectFrame = async () => {
      if (!isRunning || videoElement.paused) return;

      if (videoElement.readyState !== 4 || videoElement.videoWidth === 0) {
        if (isRunning) {
          animationFrameId = requestAnimationFrame(detectFrame);
        }
        return;
      }

      try {
        const predictions = await this.detect(videoElement);

        // Filter detections by confidence
        const validDetections = predictions.filter(
          (p) => p.confidence >= confidenceThreshold
        );

        // Check for document-like objects (for CCCD detection)
        const documentDetections = this.filterDocumentLikeObjects(validDetections);

        onDetection({
          allDetections: validDetections,
          documentDetections,
          timestamp: Date.now(),
        });
      } catch (error) {
        if (error.message && error.message.includes('loadeddata')) {
          // Silently ignore
        } else {
          console.error('[DetectionService] Real-time detection error:', error);
        }
      }

      // Schedule next frame
      if (isRunning) {
        animationFrameId = requestAnimationFrame(detectFrame);
      }
    };

    // Start detection loop
    detectFrame();

    // Return stop function
    return () => {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }

  /**
   * Filter detections that might be document-like objects
   * CCCD cards are typically rectangular documents
   * @param {Array} detections - All detections
   * @returns {Array} Filtered detections
   */
  filterDocumentLikeObjects(detections) {
    const documentClasses = ['book', 'cell phone', 'tv', 'monitor', 'laptop'];

    return detections.filter((detection) => {
      const { class: className, confidence } = detection;
      const bbox = detection.bbox || [];

      // Check if bounding box is roughly rectangular (document-like)
      if (bbox.length === 4) {
        const [x, y, width, height] = bbox;
        const aspectRatio = width / height;

        // Document aspect ratio typically 0.6-1.8 (like ID cards)
        const isDocumentLike = aspectRatio >= 0.6 && aspectRatio <= 1.8;

        // High confidence detection
        const isHighConfidence = confidence > 0.4;

        // Check class name
        const isRelevantClass =
          documentClasses.includes(className.toLowerCase()) || isDocumentLike;

        return isHighConfidence && isRelevantClass;
      }

      return false;
    });
  }

  /**
   * Draw detections on canvas for debugging
   * @param {HTMLCanvasElement} canvas - Canvas to draw on
   * @param {Array} detections - Detections to draw
   * @param {Array} highlightDetections - Detections to highlight in green
   */
  drawDetections(canvas, detections, highlightDetections = []) {
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const highlightLabels = highlightDetections.map((d) => d.label);

    detections.forEach((detection) => {
      const { bbox, class: className, confidence } = detection;
      const [x, y, width, height] = bbox;

      // Color based on whether it's highlighted
      const isHighlight = highlightLabels.includes(detection.label);
      ctx.strokeStyle = isHighlight ? '#00FF00' : '#FF0000';
      ctx.fillStyle = isHighlight ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.1)';
      ctx.lineWidth = 2;

      // Draw rectangle
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);

      // Draw label
      const label = `${className} ${Math.round(confidence * 100)}%`;
      ctx.fillStyle = isHighlight ? '#00FF00' : '#FF0000';
      ctx.font = '12px Arial';
      ctx.fillText(label, x, y - 5);
    });
  }

  /**
   * Cleanup resources
   */
  async terminate() {
    this.initialized = false;
    this.detector = null;
  }
}

export default new DetectionService();
