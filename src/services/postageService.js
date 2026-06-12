import api from './api';

export const postageService = {
  /**
   * Get all active shipping carriers
   */
  getCarriers: async () => {
    try {
      const response = await api.get('/postage/carriers');
      return response.data;
    } catch (error) {
      console.error('Get carriers error:', error);
      throw error;
    }
  },

  /**
   * Get all active shipping zones
   */
  getZones: async () => {
    try {
      const response = await api.get('/postage/zones');
      return response.data;
    } catch (error) {
      console.error('Get zones error:', error);
      throw error;
    }
  },

  /**
   * Calculate shipping rate
   */
  calculateRate: async (data) => {
    try {
      const response = await api.post('/postage/calculate', data);
      return response.data;
    } catch (error) {
      console.error('Calculate postage rate error:', error);
      throw error;
    }
  },

  /**
   * Get all shipments for the current user
   */
  getShipments: async () => {
    try {
      const response = await api.get('/postage/shipments');
      return response.data;
    } catch (error) {
      console.error('Get shipments error:', error);
      throw error;
    }
  },

  /**
   * Create a new shipment
   */
  createShipment: async (data) => {
    try {
      const response = await api.post('/postage/shipments', data);
      return response.data;
    } catch (error) {
      console.error('Create shipment error:', error);
      throw error;
    }
  },

  /**
   * Get single shipment details by ID
   */
  getShipmentById: async (id) => {
    try {
      const response = await api.get(`/postage/shipments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get shipment by ID error:', error);
      throw error;
    }
  }
};

export default postageService;
