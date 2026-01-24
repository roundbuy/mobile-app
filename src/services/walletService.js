import api from './api';

/**
 * Wallet Service
 * Handles all wallet-related API calls
 */

const walletService = {
    /**
     * Get user's wallet balance and details
     */
    getWallet: async () => {
        try {
            const response = await api.get('/wallet');
            return response.data;
        } catch (error) {
            console.error('Get wallet error:', error);
            throw error;
        }
    },

    /**
     * Get wallet transactions with pagination and filters
     */
    getTransactions: async (params = {}) => {
        try {
            const response = await api.get('/wallet/transactions', { params });
            return response.data;
        } catch (error) {
            console.error('Get transactions error:', error);
            throw error;
        }
    },

    /**
     * Initiate wallet top-up
     */
    initiateTopup: async (amount, paymentMethod = 'card') => {
        try {
            const response = await api.post('/wallet/topup', {
                amount,
                payment_method: paymentMethod
            });
            return response.data;
        } catch (error) {
            console.error('Initiate topup error:', error);
            throw error;
        }
    },

    /**
     * Complete wallet top-up (simulate payment success)
     */
    completeTopup: async (topupRequestId) => {
        try {
            const response = await api.post('/wallet/topup/complete', {
                topup_request_id: topupRequestId
            });
            return response.data;
        } catch (error) {
            console.error('Complete topup error:', error);
            throw error;
        }
    },

    /**
     * Pay for service using wallet
     */
    payWithWallet: async (amount, referenceType, referenceId, description) => {
        try {
            const response = await api.post('/wallet/pay', {
                amount,
                reference_type: referenceType,
                reference_id: referenceId,
                description
            });
            return response.data;
        } catch (error) {
            console.error('Pay with wallet error:', error);
            throw error;
        }
    },

    /**
     * Request withdrawal from wallet
     */
    requestWithdrawal: async (amount, withdrawalMethod, bankAccountDetails) => {
        try {
            const response = await api.post('/wallet/withdraw', {
                amount,
                withdrawal_method: withdrawalMethod,
                bank_account_details: bankAccountDetails
            });
            return response.data;
        } catch (error) {
            console.error('Request withdrawal error:', error);
            throw error;
        }
    }
};

export default walletService;
