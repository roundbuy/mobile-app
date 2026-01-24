import api from './api';

/**
 * Check single text for moderation violations
 * @param {string} text - Text to check
 * @returns {Promise<{isClean: boolean, foundWords: Array, severity: string}>}
 */
export const checkText = async (text) => {
    try {
        const response = await api.post('/moderation/check', { text });
        return response.data.data;
    } catch (error) {
        console.error('Check text moderation error:', error);
        throw error;
    }
};

/**
 * Check multiple fields for moderation violations
 * @param {Object} fields - Object with field names as keys and text as values
 * @returns {Promise<{isClean: boolean, violations: Object}>}
 */
export const checkMultipleFields = async (fields) => {
    try {
        const response = await api.post('/moderation/check', { fields });
        return response.data.data;
    } catch (error) {
        console.error('Check multiple fields moderation error:', error);
        throw error;
    }
};

/**
 * Format moderation error message
 * @param {Object} violations - Violations object from checkMultipleFields
 * @returns {string} - Formatted error message
 */
export const formatModerationError = (violations) => {
    const messages = [];

    for (const [fieldName, violation] of Object.entries(violations)) {
        const fieldLabel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        const words = violation.foundWords.map(w => `"${w.word}"`).join(', ');
        messages.push(`${fieldLabel} contains inappropriate content: ${words}`);
    }

    return messages.join('\n');
};

export default {
    checkText,
    checkMultipleFields,
    formatModerationError
};
