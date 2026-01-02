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
      const response = await api.post('/disputes', disputeData);
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
      const response = await api.get('/disputes', { params: filters });
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
      const response = await api.get(`/disputes/${disputeId}`);
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
      const response = await api.get(`/disputes/number/${disputeNumber}`);
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
      const response = await api.post(`/disputes/${disputeId}/messages`, {
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
      const response = await api.get(`/disputes/${disputeId}/messages`);
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
        `/disputes/${disputeId}/evidence`,
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
      const response = await api.get(`/disputes/${disputeId}/evidence`);
      return response.data;
    } catch (error) {
      console.error('Get dispute evidence error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Send seller's response to dispute
   */
  async sendSellerResponse(disputeId, responseData) {
    try {
      const response = await api.post(`/disputes/${disputeId}/seller-response`, responseData);
      return response.data;
    } catch (error) {
      console.error('Send seller response error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Check dispute eligibility
   */
  async checkEligibility(disputeId, checks) {
    try {
      const response = await api.post(`/disputes/${disputeId}/check-eligibility`, {
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
      const response = await api.get(`/disputes/${disputeId}/eligibility`);
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
      const response = await api.put(`/disputes/${disputeId}/status`, {
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
      const response = await api.get('/disputes/stats');
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
      const response = await api.get('/disputes/categories');
      return response.data;
    } catch (error) {
      console.error('Get dispute categories error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get all resolution items (for "All" tab)
   */
  async getAllResolution(filters = {}) {
    try {
      const response = await api.get('/resolution/all', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get all resolution error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get exchanges
   */
  async getExchanges(filters = {}) {
    try {
      const response = await api.get('/resolution/exchanges', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get exchanges error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get issues
   */
  async getIssues(filters = {}) {
    try {
      const response = await api.get('/resolution/issues', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get issues error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get disputes (alias for getUserDisputes for consistency)
   */
  async getDisputes(filters = {}) {
    return this.getUserDisputes(filters);
  }

  /**
   * Get ended cases
   */
  async getEndedCases(filters = {}) {
    try {
      const response = await api.get('/resolution/ended', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get ended cases error:', error);
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

  // ==========================================
  // ISSUE METHODS
  // ==========================================

  /**
   * Create a new issue
   */
  async createIssue(issueData) {
    try {
      const response = await api.post('/issues', issueData);
      return response.data;
    } catch (error) {
      console.error('Create issue error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get user's issues
   */
  async getUserIssues(filters = {}) {
    try {
      const response = await api.get('/issues', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get issues error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get issue by ID
   */
  async getIssueById(issueId) {
    try {
      const response = await api.get(`/issues/${issueId}`);
      return response.data;
    } catch (error) {
      console.error('Get issue by ID error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Accept an issue
   */
  async acceptIssue(issueId) {
    try {
      const response = await api.put(`/issues/${issueId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Accept issue error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Reject an issue
   */
  async rejectIssue(issueId, rejectionReason = null) {
    try {
      const response = await api.put(`/issues/${issueId}/reject`, {
        rejection_reason: rejectionReason
      });
      return response.data;
    } catch (error) {
      console.error('Reject issue error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Add message to issue
   */
  async addIssueMessage(issueId, message) {
    try {
      const response = await api.post(`/issues/${issueId}/messages`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error('Add issue message error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get issue messages
   */
  async getIssueMessages(issueId) {
    try {
      const response = await api.get(`/issues/${issueId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Get issue messages error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Respond to issue (seller)
   */
  async respondToIssue(issueId, responseData) {
    try {
      const response = await api.post(`/issues/${issueId}/respond`, responseData);
      return response.data;
    } catch (error) {
      console.error('Respond to issue error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Close issue (buyer)
   */
  async closeIssue(issueId) {
    try {
      const response = await api.post(`/issues/${issueId}/close`);
      return response.data;
    } catch (error) {
      console.error('Close issue error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Escalate issue to dispute
   */
  async escalateIssueToDispute(issueId) {
    try {
      const response = await api.post(`/issues/${issueId}/escalate`);
      return response.data;
    } catch (error) {
      console.error('Escalate issue error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Upload evidence for issue
   */
  async uploadIssueEvidence(issueId, file, description = '') {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type || file.mimeType || 'image/jpeg',
        name: file.name || 'evidence.jpg'
      });
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post(`/issues/${issueId}/evidence`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload issue evidence error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get evidence for issue
   */
  async getIssueEvidence(issueId) {
    try {
      const response = await api.get(`/issues/${issueId}/evidence`);
      return response.data;
    } catch (error) {
      console.error('Get issue evidence error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get issue statistics
   */
  async getIssueStats() {
    try {
      const response = await api.get('/issues/stats');
      return response.data;
    } catch (error) {
      console.error('Get issue stats error:', error);
      throw error.response?.data || error;
    }
  }

  // ==================== SUPPORT TICKETS ====================

  /**
   * Get support categories
   */
  async getSupportCategories() {
    try {
      const response = await api.get('/support/categories');
      return response.data;
    } catch (error) {
      console.error('Get support categories error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Create support ticket
   */
  async createTicket(ticketData) {
    try {
      const response = await api.post('/support/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.error('Create ticket error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get user's support tickets
   */
  async getSupportTickets(filters = {}) {
    try {
      const response = await api.get('/support/tickets', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get support tickets error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicketDetail(ticketId) {
    try {
      const response = await api.get(`/support/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Get ticket detail error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Add message to ticket
   */
  async addTicketMessage(ticketId, message) {
    try {
      const response = await api.post(`/support/tickets/${ticketId}/messages`, { message });
      return response.data;
    } catch (error) {
      console.error('Add ticket message error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Close ticket
   */
  async closeTicket(ticketId) {
    try {
      const response = await api.put(`/support/tickets/${ticketId}/status`, { status: 'closed' });
      return response.data;
    } catch (error) {
      console.error('Close ticket error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get support stats
   */
  async getSupportStats() {
    try {
      const response = await api.get('/support/stats');
      return response.data;
    } catch (error) {
      console.error('Get support stats error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get deleted ads
   */
  async getDeletedAds(filters = {}) {
    try {
      const response = await api.get('/support/deleted-ads', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get deleted ads error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get deleted ad detail
   */
  async getDeletedAdDetail(adId) {
    try {
      const response = await api.get(`/support/deleted-ads/${adId}`);
      return response.data;
    } catch (error) {
      console.error('Get deleted ad detail error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Create appeal for deleted ad
   */
  async createAppeal(adId, appealData) {
    try {
      const response = await api.post(`/support/deleted-ads/${adId}/appeal`, appealData);
      return response.data;
    } catch (error) {
      console.error('Create appeal error:', error);
      throw error.response?.data || error;
    }
  }
}

export default new DisputeService();