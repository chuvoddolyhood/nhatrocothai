/**
 * OcrService - Wrapper for Tesseract.js
 * Handles OCR (Optical Character Recognition) for CCCD card images
 * Phase 1: MVP using Tesseract.js for Vietnamese text recognition
 */

import Tesseract from 'tesseract.js';

class OcrService {
  constructor() {
    this.worker = null;
    this.initialized = false;
  }

  /**
   * Initialize Tesseract worker for Vietnamese language
   */
  async initialize() {
    if (this.initialized) return;

    try {
      this.worker = await Tesseract.createWorker('vie', 1, {
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        logger: (m) => {
          console.log('[Tesseract]', m.status, `${Math.round(m.progress * 100)}%`);
        },
      });

      this.initialized = true;
      console.log('[OcrService] Initialized successfully');
    } catch (error) {
      console.error('[OcrService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Perform OCR on image
   * @param {string|Blob|HTMLImageElement} image - Image to process
   * @returns {Promise<{text: string, confidence: number, blocks: Array}>}
   */
  async extractText(image) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const {
        data: { text, confidence, blocks },
      } = await this.worker.recognize(image);

      return {
        text,
        confidence: confidence / 100, // Convert to 0-1 range
        blocks,
      };
    } catch (error) {
      console.error('[OcrService] OCR failed:', error);
      throw error;
    }
  }

  /**
   * Extract CCCD information from front side
   * @param {string|Blob} image - Front side image
   * @returns {Promise<{citizenId: string, fullName: string, birthDate: string}>}
   */
  async extractCCCDFront(image) {
    const result = await this.extractText(image);
    return this.parseCCCDFront(result.text);
  }

  /**
   * Extract CCCD information from back side
   * @param {string|Blob} image - Back side image
   * @returns {Promise<{permanentAddress: string, issuanceDate: string, expiryDate: string}>}
   */
  async extractCCCDBack(image) {
    const result = await this.extractText(image);
    return this.parseCCCDBack(result.text);
  }

  /**
   * Parse front side CCCD text
   * Format: Số CCCD (12 digits), Tên (Vietnamese), Ngày sinh (DD/MM/YYYY)
   */
  parseCCCDFront(text) {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let citizenId = '';
    let fullName = '';
    let birthDate = '';

    // Extract Citizen ID (12 digits)
    const idMatch = text.match(/\d{12}/);
    if (idMatch) {
      citizenId = idMatch[0];
    }

    // Extract name (usually all caps, Vietnamese characters)
    const nameMatch = text.match(/[A-Z\u00C0-\u00FF\s]{5,}/);
    if (nameMatch) {
      fullName = nameMatch[0]
        .trim()
        .replace(/\d/g, '')
        .trim();
    }

    // Extract birth date (DD/MM/YYYY or DD-MM-YYYY)
    const dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/);
    if (dateMatch) {
      birthDate = dateMatch[0];
    }

    return {
      citizenId,
      fullName,
      birthDate,
    };
  }

  /**
   * Parse back side CCCD text
   */
  parseCCCDBack(text) {
    let permanentAddress = '';
    let issuanceDate = '';
    let expiryDate = '';

    // Extract address (usually after "Nơi cư trú" or similar)
    const addressMatch = text.match(
      /(?:Nơi cư trú|Address)?:?\s*([A-Za-z0-9\u00C0-\u00FF\s,/.-]{10,})/i
    );
    if (addressMatch) {
      permanentAddress = addressMatch[1].trim();
    }

    // Extract dates
    const dateMatches = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/g);
    if (dateMatches && dateMatches.length >= 2) {
      issuanceDate = dateMatches[0];
      expiryDate = dateMatches[1];
    }

    return {
      permanentAddress,
      issuanceDate,
      expiryDate,
    };
  }

  /**
   * Terminate worker and cleanup
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initialized = false;
    }
  }
}

export default new OcrService();
