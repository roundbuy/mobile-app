import api from './api';

export const kycService = {
  /**
   * Get required document types for a specific country
   */
  getDocumentTypes: async (countryCode) => {
    try {
      const response = await api.get(`/kyc/document-types?country_code=${countryCode}`);
      return response.data;
    } catch (error) {
      console.error('Get document types error:', error);
      throw error;
    }
  },

  /**
   * Submit KYC/KYB documents (multipart/form-data)
   */
  submitKyc: async (formData) => {
    try {
      const response = await api.post('/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Submit KYC error:', error);
      throw error;
    }
  },

  /**
   * Get current KYC status
   */
  getKycStatus: async () => {
    try {
      const response = await api.get('/kyc/status');
      return response.data;
    } catch (error) {
      console.error('Get KYC status error:', error);
      throw error;
    }
  }
};

export default kycService;
