import api from './api';

export const eventService = {
  getAllEvents: async (status = 'all') => {
    try {
      const response = await api.get(`/events?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Get all events error:', error);
      throw error;
    }
  },

  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get event error:', error);
      throw error;
    }
  },

  followEvent: async (id) => {
    try {
      const response = await api.post(`/events/${id}/follow`);
      return response.data;
    } catch (error) {
      console.error('Follow event error:', error);
      throw error;
    }
  },

  unfollowEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}/follow`);
      return response.data;
    } catch (error) {
      console.error('Unfollow event error:', error);
      throw error;
    }
  },

  subscribeEvent: async (id) => {
    try {
      const response = await api.post(`/events/${id}/subscribe`);
      return response.data;
    } catch (error) {
      console.error('Subscribe event error:', error);
      throw error;
    }
  },

  unsubscribeEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}/subscribe`);
      return response.data;
    } catch (error) {
      console.error('Unsubscribe event error:', error);
      throw error;
    }
  },

  joinLiveRoom: async (id) => {
    try {
      const response = await api.post(`/events/${id}/join`);
      return response.data;
    } catch (error) {
      console.error('Join live room error:', error);
      throw error;
    }
  },

  getRoomState: async (id) => {
    try {
      const response = await api.get(`/events/${id}/room`);
      return response.data;
    } catch (error) {
      console.error('Get room state error:', error);
      throw error;
    }
  },

  uploadItem: async (id, formData) => {
    try {
      const response = await api.post(`/events/${id}/room/items`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Upload item error:', error);
      throw error;
    }
  },

  getItems: async (id) => {
    try {
      const response = await api.get(`/events/${id}/room/items`);
      return response.data;
    } catch (error) {
      console.error('Get room items error:', error);
      throw error;
    }
  },

  placeBid: async (id, itemId, bidAmount) => {
    try {
      const response = await api.post(`/events/${id}/room/bids`, {
        item_id: itemId,
        bid_amount: bidAmount
      });
      return response.data;
    } catch (error) {
      console.error('Place bid error:', error);
      throw error;
    }
  },

  getChat: async (id, beforeId = null) => {
    try {
      const url = beforeId ? `/events/${id}/room/chat?before_id=${beforeId}` : `/events/${id}/room/chat`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Get room chat error:', error);
      throw error;
    }
  },

  sendChat: async (id, message, imageUrl = null) => {
    try {
      const response = await api.post(`/events/${id}/room/chat`, {
        message,
        image_url: imageUrl
      });
      return response.data;
    } catch (error) {
      console.error('Send chat error:', error);
      throw error;
    }
  },

  linkProduct: async (eventId, advertisementId) => {
    try {
      const response = await api.post(`/events/${eventId}/room/link-product`, {
        advertisement_id: advertisementId
      });
      return response.data;
    } catch (error) {
      console.error('Link product error:', error);
      throw error;
    }
  },

  getRoomBids: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/room/bids`);
      return response.data;
    } catch (error) {
      console.error('Get room bids error:', error);
      throw error;
    }
  },

  acceptBid: async (eventId, bidId) => {
    try {
      const response = await api.post(`/events/${eventId}/room/bids/${bidId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Accept bid error:', error);
      throw error;
    }
  },

  declineBid: async (eventId, bidId) => {
    try {
      const response = await api.post(`/events/${eventId}/room/bids/${bidId}/decline`);
      return response.data;
    } catch (error) {
      console.error('Decline bid error:', error);
      throw error;
    }
  }
};

export default eventService;
