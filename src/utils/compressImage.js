/**
 * Compresses an image file through Canvas, which:
 * 1. Strips ALL EXIF metadata (GPS, camera info, original dimensions)
 * 2. Reduces file size to a target maximum
 * 3. Converts to JPEG for consistent, smaller output
 *
 * SECURITY: Canvas.toDataURL() produces a CLEAN image with zero metadata.
 * The original file's size, EXIF, GPS location, etc. are completely erased.
 *
 * @param {File} file - The image file to compress
 * @param {number} maxSizeBytes - Maximum output size in bytes (default: 800KB)
 * @returns {Promise<string>} - Base64 data URL of the compressed, metadata-stripped image
 */
export async function compressImage(file, maxSizeBytes = 800 * 1024) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            try {
                URL.revokeObjectURL(img.src); // Free memory
                const result = iterativeCompress(img, maxSizeBytes);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to load image'));
        };

        // Use createObjectURL instead of FileReader — faster and less memory
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Iteratively compress via Canvas until output fits under maxSizeBytes.
 * Canvas.toDataURL ALWAYS strips EXIF — the output is a clean bitmap render.
 */
function iterativeCompress(img, maxSizeBytes) {
    let width = img.naturalWidth;
    let height = img.naturalHeight;

    // Step 1: Cap resolution — phone cameras shoot 4000x3000+ which is way too much
    const MAX_DIM = 1600;
    if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Step 2: Try quality levels at current resolution
    const qualities = [0.7, 0.55, 0.4, 0.3, 0.2, 0.12];
    const scales = [1.0, 0.7, 0.5, 0.35];

    for (const scale of scales) {
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        for (const quality of qualities) {
            const dataUrl = canvas.toDataURL('image/jpeg', quality);

            // Calculate actual binary size from base64
            const commaIdx = dataUrl.indexOf(',');
            if (commaIdx === -1) continue;
            const base64Str = dataUrl.substring(commaIdx + 1);
            const byteSize = Math.round(base64Str.length * 0.75);

            if (byteSize <= maxSizeBytes) {
                // Clean up
                canvas.width = 0;
                canvas.height = 0;
                return dataUrl;
            }
        }
    }

    // Last resort: tiny image at lowest quality
    canvas.width = Math.round(width * 0.25);
    canvas.height = Math.round(height * 0.25);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/jpeg', 0.1);
    canvas.width = 0;
    canvas.height = 0;
    return result;
}
