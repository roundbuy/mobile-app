/**
 * Image Utility Functions
 * Helper functions for handling image URLs throughout the app
 */

/**
 * Converts a relative image URL to a full URL by prepending the base API URL
 * @param {string} url - The image URL (can be relative or absolute)
 * @param {string} baseURL - Optional base URL (defaults to production API)
 * @returns {string|null} Full image URL or null if input is invalid
 * 
 * @example
 * getFullImageUrl('/uploads/image.jpg')
 * // Returns: 'https://api.roundbuy.com/uploads/image.jpg'
 * 
 * @example
 * getFullImageUrl('https://cdn.example.com/image.jpg')
 * // Returns: 'https://cdn.example.com/image.jpg' (unchanged)
 */
export const getFullImageUrl = (url, baseURL = 'https://api.roundbuy.com') => {
    // Return null for invalid inputs
    if (!url || typeof url !== 'string') {
        return null;
    }

    // If already a full URL (starts with http:// or https://), return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Add base URL for relative paths
    // Handle both "/uploads/..." and "uploads/..." formats
    return `${baseURL}${url.startsWith('/') ? url : '/' + url}`;
};

/**
 * Gets the first image URL from an images array
 * @param {Array|string} images - Array of image URLs or single image URL
 * @param {string} baseURL - Optional base URL
 * @returns {string|null} Full URL of first image or null
 * 
 * @example
 * getFirstImageUrl(['/uploads/img1.jpg', '/uploads/img2.jpg'])
 * // Returns: 'https://api.roundbuy.com/uploads/img1.jpg'
 */
export const getFirstImageUrl = (images, baseURL = 'https://api.roundbuy.com') => {
    if (!images) return null;

    // If images is an array, get first item
    if (Array.isArray(images) && images.length > 0) {
        return getFullImageUrl(images[0], baseURL);
    }

    // If images is a string, use it directly
    if (typeof images === 'string') {
        return getFullImageUrl(images, baseURL);
    }

    return null;
};

/**
 * Converts all image URLs in an array to full URLs
 * @param {Array} images - Array of image URLs
 * @param {string} baseURL - Optional base URL
 * @returns {Array} Array of full image URLs
 * 
 * @example
 * getAllImageUrls(['/uploads/img1.jpg', '/uploads/img2.jpg'])
 * // Returns: ['https://api.roundbuy.com/uploads/img1.jpg', 'https://api.roundbuy.com/uploads/img2.jpg']
 */
export const getAllImageUrls = (images, baseURL = 'https://api.roundbuy.com') => {
    if (!Array.isArray(images)) return [];

    return images
        .map(url => getFullImageUrl(url, baseURL))
        .filter(url => url !== null); // Remove any null values
};

/**
 * Gets a thumbnail URL (if available) or falls back to first image
 * @param {Object} item - Item object with images/thumbnail properties
 * @param {string} baseURL - Optional base URL
 * @returns {string|null} Full URL of thumbnail or first image
 * 
 * @example
 * getThumbnailUrl({ thumbnail: '/thumb.jpg', images: ['/img1.jpg'] })
 * // Returns: 'https://api.roundbuy.com/thumb.jpg'
 */
export const getThumbnailUrl = (item, baseURL = 'https://api.roundbuy.com') => {
    // Try thumbnail first
    if (item?.thumbnail) {
        return getFullImageUrl(item.thumbnail, baseURL);
    }

    // Fall back to first image
    if (item?.images) {
        return getFirstImageUrl(item.images, baseURL);
    }

    return null;
};

export default {
    getFullImageUrl,
    getFirstImageUrl,
    getAllImageUrls,
    getThumbnailUrl,
};
