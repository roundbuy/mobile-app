import api from './api';

export const submitReview = async (data) => {
    try {
        const response = await api.post('/reviews', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getReviews = async (type) => {
    try {
        const response = await api.get(`/reviews/${type}`);
        return response.data.data; // Unwrap the nested data object
    } catch (error) {
        throw error;
    }
};

export default {
    submitReview,
    getReviews
};
