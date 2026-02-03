import api from './api';

export const rewardsService = {
    // Get all reward categories with user progress
    getRewards: async () => {
        try {
            const response = await api.get('/rewards');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get referral info
    getReferrals: async () => {
        try {
            const response = await api.get('/rewards/referrals');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Generate referral code
    generateReferralCode: async () => {
        try {
            const response = await api.post('/rewards/referral/generate');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Validate referral code
    validateReferralCode: async (code) => {
        try {
            const response = await api.post('/rewards/validate-referral', { code });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get lottery info
    getLotteryInfo: async () => {
        try {
            const response = await api.get('/rewards/lottery');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get popular searches
    getPopularSearches: async () => {
        try {
            const response = await api.get('/rewards/popular-searches');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Redeem reward
    redeemReward: async (rewardCategoryId, selectedOption) => {
        try {
            const response = await api.post('/rewards/redeem', {
                rewardCategoryId,
                selectedOption
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
