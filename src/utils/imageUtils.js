// src/utils/imageUtils.js — Safe Client-side Image Preprocessing & Validation
// Resizes and compresses images to ensure readability of diagrams and handwriting
// while keeping payloads well within Vercel's 4.5MB serverless limit.

export const MAX_RAW_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB raw file limit (resized by canvas to < 800 KB)
export const MAX_IMAGE_DIMENSION_PX = 1600; // 1600px max width/height preserving aspect ratio
export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/webp'
];

/**
 * Validates a user-selected File object.
 * Returns an error string or null if valid.
 */
export function validateImageFile(file) {
  if (!file) {
    return 'Please select a valid image file.';
  }

  // 1. Check for empty files
  if (file.size === 0) {
    return 'The selected image file is empty. Please select a valid photo or screenshot.';
  }

  // 2. Check file size limit (raw limit 10 MB)
  if (file.size > MAX_RAW_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `Image file size (${sizeMb} MB) exceeds the 10 MB limit. Please select a smaller photo or screenshot.`;
  }

  // 3. Check MIME type with extension fallback for browsers that report empty type
  const mimeType = (file.type || '').toLowerCase().trim();
  const fileName = (file.name || '').toLowerCase();
  const hasValidExtension = /\.(png|jpe?g|webp)$/i.test(fileName);
  const isAllowedMime = ALLOWED_MIME_TYPES.includes(mimeType);

  if (!isAllowedMime && !hasValidExtension) {
    return 'Unsupported image format. Please upload a PNG, JPEG/JPG, or WebP image.';
  }

  return null;
}

/**
 * Resizes and optimizes an image file using an HTML5 Canvas.
 * Preserves the exact aspect ratio (no cropping).
 * Returns:
 * {
 *   dataUrl: 'data:image/...;base64,...',
 *   mimeType: 'image/jpeg' | 'image/png' | 'image/webp',
 *   base64Data: '...', // raw base64 without prefix for Gemini API
 *   originalName: string,
 *   width: number,
 *   height: number,
 *   sizeBytes: number
 * }
 */
export function processImageForUpload(file) {
  return new Promise((resolve, reject) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      return reject(new Error(validationError));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read the image file from your device. It may be corrupted.'));
    };

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('The uploaded file is not a valid or readable image.'));
      };

      img.onload = () => {
        try {
          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;

          if (!originalWidth || !originalHeight) {
            return reject(new Error('Image has zero dimensions.'));
          }

          // Calculate scaled dimensions (preserve aspect ratio)
          let targetWidth = originalWidth;
          let targetHeight = originalHeight;

          if (originalWidth > MAX_IMAGE_DIMENSION_PX || originalHeight > MAX_IMAGE_DIMENSION_PX) {
            if (originalWidth >= originalHeight) {
              targetWidth = MAX_IMAGE_DIMENSION_PX;
              targetHeight = Math.round((originalHeight * MAX_IMAGE_DIMENSION_PX) / originalWidth);
            } else {
              targetHeight = MAX_IMAGE_DIMENSION_PX;
              targetWidth = Math.round((originalWidth * MAX_IMAGE_DIMENSION_PX) / originalHeight);
            }
          }

          // Render onto canvas
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            // Canvas context not available: fallback to raw FileReader result
            const rawDataUrl = readerEvent.target.result;
            const commaIdx = rawDataUrl.indexOf(',');
            const base64Data = commaIdx !== -1 ? rawDataUrl.slice(commaIdx + 1) : rawDataUrl;
            return resolve({
              dataUrl: rawDataUrl,
              mimeType: file.type || 'image/jpeg',
              base64Data,
              originalName: file.name,
              width: originalWidth,
              height: originalHeight,
              sizeBytes: file.size
            });
          }

          // Fill white background (useful for transparent PNGs converting to JPEG)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          // Draw image
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Choose output MIME type and compression quality
          // Use JPEG with 0.84 quality to ensure formulas, small text, and lines are sharp
          let outputMimeType = 'image/jpeg';
          let quality = 0.84;

          if (file.type === 'image/webp') {
            outputMimeType = 'image/webp';
            quality = 0.85;
          }

          const processedDataUrl = canvas.toDataURL(outputMimeType, quality);
          const commaIndex = processedDataUrl.indexOf(',');
          const base64Data = commaIndex !== -1 ? processedDataUrl.slice(commaIndex + 1) : processedDataUrl;

          // Compute size in bytes of base64 data: (base64Len * 3/4)
          const approximateBytes = Math.round((base64Data.length * 3) / 4);

          resolve({
            dataUrl: processedDataUrl,
            mimeType: outputMimeType,
            base64Data,
            originalName: file.name,
            width: targetWidth,
            height: targetHeight,
            sizeBytes: approximateBytes
          });
        } catch (err) {
          reject(new Error(`Failed to process image: ${err.message}`));
        }
      };

      img.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
  });
}
