import api from './api';

const offersService = {
  // Get offers received for user's advertisements
  getReceivedOffers: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/offers/received?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching received offers:', error);
      throw error;
    }
  },

  // Accept an offer
  acceptOffer: async (offerId) => {
    try {
      const response = await api.put(`/offers/${offerId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  },

  // Decline an offer
  declineOffer: async (offerId) => {
    try {
      const response = await api.put(`/offers/${offerId}/decline`);
      return response.data;
    } catch (error) {
      console.error('Error declining offer:', error);
      throw error;
    }
  },

  // Get accepted offers
  getAcceptedOffers: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/offers/accepted?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching accepted offers:', error);
      throw error;
    }
  },

  // Get declined offers
  getDeclinedOffers: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/offers/declined?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching declined offers:', error);
      throw error;
    }
  },

  // Get offers made by user
  getMadeOffers: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/offers/made?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching made offers:', error);
      throw error;
    }
  },
};

export default offersService;