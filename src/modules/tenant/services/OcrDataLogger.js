/**
 * OcrDataLogger - Logs OCR predictions for training Phase 2
 * Stores prediction data in IndexedDB for later export
 * Phase 1: Collect training data from user corrections
 */

import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'NhaTroCoThaiDB';
const STORE_NAME = 'ocrLogs';
const DB_VERSION = 1;

class OcrDataLogger {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize IndexedDB
   */
  async initialize() {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[OcrDataLogger] Failed to open database');
        reject(request.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.initialized = true;
        console.log('[OcrDataLogger] Database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create store if not exists
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('sessionId', 'sessionId', { unique: false });
          console.log('[OcrDataLogger] Object store created');
        }
      };
    });
  }

  /**
   * Log OCR prediction
   * @param {Object} data - OCR data to log
   * @returns {Promise<string>} Log entry ID
   */
  async logOcrPrediction(data) {
    if (!this.initialized) {
      await this.initialize();
    }

    const logEntry = {
      id: uuidv4(),
      sessionId: this.getOrCreateSessionId(),
      timestamp: new Date().toISOString(),
      images: {
        front: data.front || null, // Base64 or blob
        back: data.back || null,
      },
      predicted: {
        front: data.predictedFront || {},
        back: data.predictedBack || {},
      },
      corrected: {
        front: data.correctedFront || null,
        back: data.correctedBack || null,
      },
      accuracy: this.calculateAccuracy(data.predictedFront, data.correctedFront),
      userConfirmed: data.userConfirmed || false,
      metadata: {
        deviceType: this.getDeviceType(),
        lightingCondition: data.lightingCondition || 'unknown',
        imageQuality: data.imageQuality || 'unknown',
      },
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(logEntry);

      request.onerror = () => {
        console.error('[OcrDataLogger] Failed to log prediction');
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('[OcrDataLogger] Logged prediction:', logEntry.id);
        resolve(logEntry.id);
      };
    });
  }

  /**
   * Calculate accuracy between predicted and corrected data
   */
  calculateAccuracy(predicted, corrected) {
    if (!predicted || !corrected) return 0;

    const fields = ['citizenId', 'fullName', 'birthDate'];
    let matches = 0;

    fields.forEach((field) => {
      const predictedValue = (predicted[field] || '').toLowerCase().trim();
      const correctedValue = (corrected[field] || '').toLowerCase().trim();
      if (predictedValue === correctedValue) {
        matches++;
      }
    });

    return matches / fields.length;
  }

  /**
   * Get all logs for export (training data)
   */
  async getAllLogs() {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  /**
   * Get logs by date range
   */
  async getLogsByDateRange(startDate, endDate) {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const range = IDBKeyRange.bound(startDate.toISOString(), endDate.toISOString());
      const request = index.getAll(range);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  /**
   * Export logs as JSON for training
   */
  async exportLogsAsJSON() {
    const logs = await this.getAllLogs();
    const data = logs.map((log) => ({
      sessionId: log.sessionId,
      timestamp: log.timestamp,
      predicted: log.predicted,
      corrected: log.corrected,
      accuracy: log.accuracy,
      userConfirmed: log.userConfirmed,
      metadata: log.metadata,
    }));

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export logs as CSV
   */
  async exportLogsAsCSV() {
    const logs = await this.getAllLogs();
    const headers = [
      'sessionId',
      'timestamp',
      'predictedName',
      'correctedName',
      'predictedId',
      'correctedId',
      'predictedBirthDate',
      'correctedBirthDate',
      'accuracy',
      'userConfirmed',
    ];

    const rows = logs.map((log) => [
      log.sessionId,
      log.timestamp,
      log.predicted.front?.fullName || '',
      log.corrected?.front?.fullName || '',
      log.predicted.front?.citizenId || '',
      log.corrected?.front?.citizenId || '',
      log.predicted.front?.birthDate || '',
      log.corrected?.front?.birthDate || '',
      log.accuracy.toFixed(2),
      log.userConfirmed ? 'yes' : 'no',
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return csv;
  }

  /**
   * Clear all logs
   */
  async clearLogs() {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('[OcrDataLogger] All logs cleared');
        resolve();
      };
    });
  }

  /**
   * Get session ID (create if not exists)
   */
  getOrCreateSessionId() {
    const sessionKey = 'ocrSessionId';
    let sessionId = sessionStorage.getItem(sessionKey);

    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem(sessionKey, sessionId);
    }

    return sessionId;
  }

  /**
   * Detect device type
   */
  getDeviceType() {
    const ua = navigator.userAgent;
    if (/iPad|Android|Touch/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get database statistics
   */
  async getStats() {
    const logs = await this.getAllLogs();
    const userConfirmedCount = logs.filter((l) => l.userConfirmed).length;
    const avgAccuracy =
      logs.length > 0
        ? logs.reduce((sum, l) => sum + l.accuracy, 0) / logs.length
        : 0;

    return {
      totalLogs: logs.length,
      userConfirmedCount,
      avgAccuracy: avgAccuracy.toFixed(2),
      dateRange: {
        first: logs.length > 0 ? logs[0].timestamp : null,
        last: logs.length > 0 ? logs[logs.length - 1].timestamp : null,
      },
    };
  }
}

export default new OcrDataLogger();
