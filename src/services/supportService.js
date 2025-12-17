import api from './api';

/**
 * Support Service
 * Handles all support-related API calls for My Support
 */
class SupportService {
  /**
   * Create a new support ticket
   */
  async createTicket(ticketData) {
    try {
      const response = await api.post('/mobile-app/support/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.error('Create ticket error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get user's support tickets
   */
  async getUserTickets(filters = {}) {
    try {
      const response = await api.get('/mobile-app/support/tickets', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get tickets error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId) {
    try {
      const response = await api.get(`/mobile-app/support/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Get ticket by ID error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get ticket by ticket number
   */
  async getTicketByNumber(ticketNumber) {
    try {
      const response = await api.get(`/mobile-app/support/tickets/number/${ticketNumber}`);
      return response.data;
    } catch (error) {
      console.error('Get ticket by number error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Add message to ticket
   */
  async addTicketMessage(ticketId, message) {
    try {
      const response = await api.post(`/mobile-app/support/tickets/${ticketId}/messages`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error('Add ticket message error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get ticket messages
   */
  async getTicketMessages(ticketId) {
    try {
      const response = await api.get(`/mobile-app/support/tickets/${ticketId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Get ticket messages error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Upload ticket attachment
   */
  async uploadAttachment(ticketId, file, messageId = null) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'attachment.jpg'
      });
      if (messageId) {
        formData.append('message_id', messageId);
      }

      const response = await api.post(
        `/mobile-app/support/tickets/${ticketId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload attachment error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get ticket attachments
   */
  async getTicketAttachments(ticketId) {
    try {
      const response = await api.get(`/mobile-app/support/tickets/${ticketId}/attachments`);
      return response.data;
    } catch (error) {
      console.error('Get ticket attachments error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId, status) {
    try {
      const response = await api.put(`/mobile-app/support/tickets/${ticketId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Update ticket status error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get ticket statistics
   */
  async getTicketStats() {
    try {
      const response = await api.get('/mobile-app/support/tickets/stats');
      return response.data;
    } catch (error) {
      console.error('Get ticket stats error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get support categories
   */
  async getSupportCategories() {
    try {
      const response = await api.get('/mobile-app/support/categories');
      return response.data;
    } catch (error) {
      console.error('Get support categories error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Check if user has open tickets
   */
  async hasOpenTickets(category = null) {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/mobile-app/support/has-open-tickets', { params });
      return response.data;
    } catch (error) {
      console.error('Check open tickets error:', error);
      throw error.response?.data || error;
    }
  }

  // ==========================================
  // DELETED ADVERTISEMENTS & APPEALS
  // ==========================================

  /**
   * Get user's deleted ads
   */
  async getDeletedAds(filters = {}) {
    try {
      const response = await api.get('/mobile-app/support/deleted-ads', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get deleted ads error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get deleted ad by ID
   */
  async getDeletedAdById(deletedAdId) {
    try {
      const response = await api.get(`/mobile-app/support/deleted-ads/${deletedAdId}`);
      return response.data;
    } catch (error) {
      console.error('Get deleted ad error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Create appeal for deleted ad
   */
  async createAppeal(deletedAdId, appealReason) {
    try {
      const response = await api.post(`/mobile-app/support/deleted-ads/${deletedAdId}/appeal`, {
        appeal_reason: appealReason
      });
      return response.data;
    } catch (error) {
      console.error('Create appeal error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get appeal statistics
   */
  async getAppealStats() {
    try {
      const response = await api.get('/mobile-app/support/appeals/stats');
      return response.data;
    } catch (error) {
      console.error('Get appeal stats error:', error);
      throw error.response?.data || error;
    }
  }

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  /**
   * Format ticket status for display
   */
  formatTicketStatus(status) {
    const statusMap = {
      open: { label: 'Open', color: '#4169E1' },
      in_progress: { label: 'In Progress', color: '#FFA500' },
      awaiting_user: { label: 'Awaiting Your Response', color: '#FFD700' },
      resolved: { label: 'Resolved', color: '#32CD32' },
      closed: { label: 'Closed', color: '#808080' }
    };
    return statusMap[status] || { label: status, color: '#000000' };
  }

  /**
   * Format ticket category for display
   */
  formatTicketCategory(category) {
    const categoryMap = {
      deleted_ads: 'Deleted Ads',
      ad_appeal: 'Ad Appeal',
      general: 'General Inquiry',
      technical: 'Technical Issue',
      billing: 'Billing & Payments',
      account: 'Account Issues',
      other: 'Other'
    };
    return categoryMap[category] || category;
  }

  /**
   * Format appeal status for display
   */
  formatAppealStatus(status) {
    const statusMap = {
      not_appealed: { label: 'Not Appealed', color: '#808080' },
      pending: { label: 'Pending Review', color: '#FFA500' },
      approved: { label: 'Approved', color: '#32CD32' },
      rejected: { label: 'Rejected', color: '#DC143C' }
    };
    return statusMap[status] || { label: status, color: '#000000' };
  }

  /**
   * Format deletion reason for display
   */
  formatDeletionReason(reason) {
    const reasonMap = {
      user_request: 'User Request',
      policy_violation: 'Policy Violation',
      expired: 'Expired',
      sold: 'Sold',
      admin_action: 'Admin Action',
      spam: 'Spam',
      inappropriate: 'Inappropriate Content'
    };
    return reasonMap[reason] || reason;
  }

  /**
   * Calculate days until appeal deadline
   */
  calculateAppealDeadline(deadline) {
    if (!deadline) return null;
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Tomorrow';
    } else {
      return `${days} days remaining`;
    }
  }

  /**
   * Check if ad can be appealed
   */
  canAppeal(deletedAd) {
    if (!deletedAd) return false;
    
    const now = new Date();
    const deadline = new Date(deletedAd.appeal_deadline);
    
    return (
      deletedAd.can_appeal &&
      deletedAd.appeal_status === 'not_appealed' &&
      now < deadline
    );
  }

  /**
   * Get category icon name
   */
  getCategoryIcon(category) {
    const iconMap = {
      deleted_ads: 'trash-2',
      ad_appeal: 'alert-circle',
      general: 'help-circle',
      technical: 'tool',
      billing: 'credit-card',
      account: 'user',
      other: 'more-horizontal'
    };
    return iconMap[category] || 'help-circle';
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority) {
    const colorMap = {
      low: '#32CD32',
      medium: '#FFA500',
      high: '#FF6347',
      urgent: '#DC143C'
    };
    return colorMap[priority] || '#808080';
  }
}

export default new SupportService();