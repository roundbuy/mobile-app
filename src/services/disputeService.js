import api from './api';

/**
 * Dispute Service
 * Handles all dispute-related API calls for the Resolution Center
 */
class DisputeService {
  /**
   * Create a new dispute
   */
  async createDispute(disputeData) {
    try {
      const response = await api.post('/mobile-app/disputes', disputeData);
      return response.data;
    } catch (error) {
      console.error('Create dispute error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get user's disputes
   */
  async getUserDisputes(filters = {}) {
    try {
      const response = await api.get('/mobile-app/disputes', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get disputes error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get dispute by ID
   */
  async getDisputeById(disputeId) {
    try {
      const response = await api.get(`/mobile-app/disputes/${disputeId}`);
      return response.data;
    } catch (error) {
      console.error('Get dispute by ID error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get dispute by dispute number
   */
  async getDisputeByNumber(disputeNumber) {
    try {
      const response = await api.get(`/mobile-app/disputes/number/${disputeNumber}`);
      return response.data;
    } catch (error) {
      console.error('Get dispute by number error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Add message to dispute
   */
  async addDisputeMessage(disputeId, message, messageType = 'text') {
    try {
      const response = await api.post(`/mobile-app/disputes/${disputeId}/messages`, {
        message,
        message_type: messageType
      });
      return response.data;
    } catch (error) {
      console.error('Add dispute message error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get dispute messages
   */
  async getDisputeMessages(disputeId) {
    try {
      const response = await api.get(`/mobile-app/disputes/${disputeId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Get dispute messages error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Upload dispute evidence
   */
  async uploadEvidence(disputeId, file, description = '') {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'evidence.jpg'
      });
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post(
        `/mobile-app/disputes/${disputeId}/evidence`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload evidence error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get dispute evidence
   */
  async getDisputeEvidence(disputeId) {
    try {
      const response = await api.get(`/mobile-app/disputes/${disputeId}/evidence`);
      return response.data;
    } catch (error) {
      console.error('Get dispute evidence error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Check dispute eligibility
   */
  async checkEligibility(disputeId, checks) {
    try {
      const response = await api.post(`/mobile-app/disputes/${disputeId}/check-eligibility`, {
        checks
      });
      return response.data;
    } catch (error) {
      console.error('Check eligibility error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get eligibility checks
   */
  async getEligibilityChecks(disputeId) {
    try {
      const response = await api.get(`/mobile-app/disputes/${disputeId}/eligibility`);
      return response.data;
    } catch (error) {
      console.error('Get eligibility checks error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Update dispute status
   */
  async updateDisputeStatus(disputeId, status, resolutionStatus = null) {
    try {
      const response = await api.put(`/mobile-app/disputes/${disputeId}/status`, {
        status,
        resolution_status: resolutionStatus
      });
      return response.data;
    } catch (error) {
      console.error('Update dispute status error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get dispute statistics
   */
  async getDisputeStats() {
    try {
      const response = await api.get('/mobile-app/disputes/stats');
      return response.data;
    } catch (error) {
      console.error('Get dispute stats error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get dispute categories
   */
  async getDisputeCategories() {
    try {
      const response = await api.get('/mobile-app/disputes/categories');
      return response.data;
    } catch (error) {
      console.error('Get dispute categories error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Format dispute status for display
   */
  formatDisputeStatus(status) {
    const statusMap = {
      pending: { label: 'Pending Review', color: '#FFA500' },
      under_review: { label: 'Under Review', color: '#4169E1' },
      awaiting_response: { label: 'Awaiting Response', color: '#FFD700' },
      negotiation: { label: 'In Negotiation', color: '#9370DB' },
      resolved: { label: 'Resolved', color: '#32CD32' },
      closed: { label: 'Closed', color: '#808080' },
      escalated: { label: 'Escalated', color: '#DC143C' }
    };
    return statusMap[status] || { label: status, color: '#000000' };
  }

  /**
   * Format dispute type for display
   */
  formatDisputeType(type) {
    const typeMap = {
      buyer_initiated: 'Buyer Dispute',
      seller_initiated: 'Seller Dispute',
      transaction_dispute: 'Transaction Dispute',
      exchange: 'Exchange Issue',
      issue_negotiation: 'Issue Negotiation'
    };
    return typeMap[type] || type;
  }

  /**
   * Calculate time remaining for negotiation
   */
  calculateTimeRemaining(deadline) {
    if (!deadline) return null;
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    }
  }
}

export default new DisputeService();