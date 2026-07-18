/**
 * OcrResultDTO - Type definitions for OCR results
 * Data transfer objects for OCR and Detection services
 */

/**
 * CCCD Front side data
 */
export class CCCDFrontDTO {
  constructor(data = {}) {
    this.citizenId = data.citizenId || '';
    this.fullName = data.fullName || '';
    this.birthDate = data.birthDate || ''; // Format: DD/MM/YYYY
    this.gender = data.gender || ''; // Nam/Nữ
    this.nationality = data.nationality || 'Việt Nam';
  }

  isValid() {
    return this.citizenId.length === 12 && this.fullName.length > 0 && this.birthDate.length > 0;
  }

  toJSON() {
    return {
      citizenId: this.citizenId,
      fullName: this.fullName,
      birthDate: this.birthDate,
      gender: this.gender,
      nationality: this.nationality,
    };
  }
}

/**
 * CCCD Back side data
 */
export class CCCDBackDTO {
  constructor(data = {}) {
    this.permanentAddress = data.permanentAddress || '';
    this.issuanceDate = data.issuanceDate || ''; // Format: DD/MM/YYYY
    this.expiryDate = data.expiryDate || ''; // Format: DD/MM/YYYY
    this.issuer = data.issuer || '';
  }

  isValid() {
    return (
      this.permanentAddress.length > 0 &&
      this.issuanceDate.length > 0 &&
      this.expiryDate.length > 0
    );
  }

  toJSON() {
    return {
      permanentAddress: this.permanentAddress,
      issuanceDate: this.issuanceDate,
      expiryDate: this.expiryDate,
      issuer: this.issuer,
    };
  }
}

/**
 * OCR Result with confidence
 */
export class OcrResultDTO {
  constructor(data = {}) {
    this.front = new CCCDFrontDTO(data.front);
    this.back = new CCCDBackDTO(data.back);
    this.confidence = data.confidence || 0;
    this.rawText = data.rawText || '';
    this.processingTime = data.processingTime || 0; // ms
    this.timestamp = data.timestamp || new Date().toISOString();
    this.imageQuality = data.imageQuality || 'unknown'; // good/fair/poor
  }

  isValid() {
    return this.front.isValid() || this.back.isValid();
  }

  toJSON() {
    return {
      front: this.front.toJSON(),
      back: this.back.toJSON(),
      confidence: this.confidence,
      processingTime: this.processingTime,
      imageQuality: this.imageQuality,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Detection result
 */
export class DetectionResultDTO {
  constructor(data = {}) {
    this.allDetections = data.allDetections || [];
    this.documentDetections = data.documentDetections || [];
    this.timestamp = data.timestamp || Date.now();
    this.hasDocument = data.documentDetections ? data.documentDetections.length > 0 : false;
    this.confidence = data.confidence || 0;
  }

  getBestDetection() {
    if (this.documentDetections.length === 0) return null;
    return this.documentDetections.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
  }

  toJSON() {
    return {
      allDetections: this.allDetections,
      documentDetections: this.documentDetections,
      hasDocument: this.hasDocument,
      confidence: this.confidence,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Camera capture result
 */
export class CameraCaptureDTO {
  constructor(data = {}) {
    this.image = data.image || null; // Blob or base64
    this.timestamp = data.timestamp || new Date().toISOString();
    this.side = data.side || 'front'; // 'front' or 'back'
    this.confidence = data.confidence || 0;
    this.width = data.width || 0;
    this.height = data.height || 0;
  }

  toJSON() {
    return {
      timestamp: this.timestamp,
      side: this.side,
      confidence: this.confidence,
      width: this.width,
      height: this.height,
    };
  }
}

/**
 * OCR Log entry
 */
export class OcrLogDTO {
  constructor(data = {}) {
    this.sessionId = data.sessionId || '';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.images = {
      front: data.imageFront || null,
      back: data.imageBack || null,
    };
    this.predicted = {
      front: data.predictedFront || {},
      back: data.predictedBack || {},
    };
    this.corrected = {
      front: data.correctedFront || null,
      back: data.correctedBack || null,
    };
    this.accuracy = data.accuracy || 0;
    this.userConfirmed = data.userConfirmed || false;
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      timestamp: this.timestamp,
      predicted: this.predicted,
      corrected: this.corrected,
      accuracy: this.accuracy,
      userConfirmed: this.userConfirmed,
    };
  }
}
