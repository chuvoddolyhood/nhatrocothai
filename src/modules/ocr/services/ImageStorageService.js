/**
 * Image Storage Service
 * Handles uploading meter images to Supabase Storage
 */

import { supabase } from '../../../supabase/config';

const STORAGE_BUCKET = 'meter-images';
const CACHE_CONTROL = '3600';
const MAX_DIMENSION = 1920;

/**
 * Upload meter image to Supabase Storage
 * @param {File} file - Image file
 * @param {Object} metadata - Metadata for file organization
 * @param {string} metadata.roomId - Room ID
 * @param {string} metadata.contractId - Contract ID
 * @param {string} metadata.month - Month in YYYY-MM format
 * @param {string} metadata.type - Meter type (electric or water)
 * @param {string} metadata.userId - User ID
 * @returns {Promise<string>} - Public URL of uploaded image
 */
export async function uploadMeterImage(file, metadata) {
  const {
    roomId,
    month,
    type,
  } = metadata;

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${roomId}_${month}_${type}_${timestamp}.jpg`;
    const filePath = `meter-readings/${roomId}/${month}/${fileName}`;

    
    console.log('[ImageStorage] Uploading image:', filePath);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: CACHE_CONTROL,
        upsert: false, // Don't overwrite existing files
        contentType: file.type,
      });

    if (error) {
      
      console.error('[ImageStorage] Upload error:', error);
      throw error;
    }

    
    console.log('[ImageStorage] Upload successful:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    
    console.log('[ImageStorage] Public URL:', publicUrl);
    return publicUrl;

  } catch (error) {
    
    console.error('[ImageStorage] Error:', error);
    
    if (error.message?.includes('Bucket not found')) {
      throw new Error('Storage bucket chưa được tạo. Vui lòng liên hệ admin.');
    }
    
    throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
  }
}

/**
 * Upload multiple meter images
 * @param {Array<{file: File, type: string}>} images - Array of images with types
 * @param {Object} metadata - Common metadata
 * @returns {Promise<Object>} - Object with URLs for each type
 */
export async function uploadMultipleMeterImages(images, metadata) {
  const results = {};

  
  for (const { file, type } of images) {
    try {
      
      const url = await uploadMeterImage(file, { ...metadata, type });
      results[type] = url;
    } catch (error) {
      
      console.error(`[ImageStorage] Failed to upload ${type} image:`, error);
      results[type] = null;
    }
  }

  return results;
}

/**
 * Delete meter image from storage
 * @param {string} imageUrl - Public URL of the image
 * @returns {Promise<void>}
 */
export async function deleteMeterImage(imageUrl) {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`/${STORAGE_BUCKET}/`);
    
    if (pathParts.length < 2) {
      throw new Error('Invalid image URL');
    }
    
    const filePath = pathParts[1];

    
    console.log('[ImageStorage] Deleting image:', filePath);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      
      console.error('[ImageStorage] Delete error:', error);
      throw error;
    }

    
    console.log('[ImageStorage] Image deleted successfully');
  } catch (error) {
    
    console.error('[ImageStorage] Error deleting image:', error);
    throw new Error('Không thể xóa ảnh. Vui lòng thử lại.');
  }
}

/**
 * Get signed URL for private image (if needed)
 * @param {string} filePath - File path in storage
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} - Signed URL
 */
export async function getSignedImageUrl(filePath, expiresIn = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    
    console.error('[ImageStorage] Error creating signed URL:', error);
    throw new Error('Không thể tạo URL ảnh. Vui lòng thử lại.');
  }
}

/**
 * Check if storage bucket exists and is accessible
 * @returns {Promise<boolean>}
 */
export async function checkStorageBucket() {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', { limit: 1 });

    if (error) {
      
      console.error('[ImageStorage] Bucket check error:', error);
      return false;
    }

    return data !== null;
  } catch (error) {
    
    console.error('[ImageStorage] Error checking bucket:', error);
    return false;
  }
}

/**
 * Get file size from File object
 * @param {File} file - File object
 * @returns {string} - Human-readable file size
 */
export function getFileSize(file) {
  const bytes = file.size;
  
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

/**
 * Compress image before upload (if needed)
 * @param {File} file - Original image file
 * @param {number} maxSizeMB - Maximum size in MB
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<File>} - Compressed file
 */
export async function compressImage(file, maxSizeMB = 2, quality = 0.8) {
  // If file is already small enough, return as-is
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = (height / width) * MAX_DIMENSION;
            width = MAX_DIMENSION;
          } else {
            width = (width / height) * MAX_DIMENSION;
            height = MAX_DIMENSION;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              
              console.log(`[ImageStorage] Compressed from ${getFileSize(file)} to ${getFileSize(compressedFile)}`);
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default {
  uploadMeterImage,
  uploadMultipleMeterImages,
  deleteMeterImage,
  getSignedImageUrl,
  checkStorageBucket,
  getFileSize,
  compressImage,
};
