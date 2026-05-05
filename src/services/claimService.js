import api from './api';

class ClaimService {
    /**
     * Create new claim from dispute
     */
    async createClaim(disputeId, claimData) {
        try {
            console.log('🚀 API Request: POST /claims');
            const response = await api.post('/claims', {
                dispute_id: disputeId,
                claim_reason: claimData.claim_reason,
                additional_evidence: claimData.additional_evidence,
                priority: claimData.priority || 'medium'
            });
            console.log('✅ API Response: /claims', response.status);
            return response.data;
        } catch (error) {
            console.error('❌ Create claim error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get user's claims
     */
    async getClaims(filters = {}) {
        try {
            console.log('🚀 API Request: GET /claims');
            const params = new URLSearchParams();

            if (filters.status) params.append('status', filters.status);
            if (filters.limit) params.append('limit', filters.limit);

            const queryString = params.toString();
            const url = queryString ? `/claims?${queryString}` : '/claims';

            const response = await api.get(url);
            console.log('✅ API Response: /claims', response.status);
            console.log('📊 Total claims received:', response.data.data?.length || 0);
            return response.data;
        } catch (error) {
            console.error('❌ Get claims error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get claim by ID
     */
    async getClaimById(claimId) {
        try {
            console.log(`🚀 API Request: GET /claims/${claimId}`);
            const response = await api.get(`/claims/${claimId}`);
            console.log('✅ API Response:', `/claims/${claimId}`, response.status);
            return response.data;
        } catch (error) {
            console.error('❌ Get claim error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Add message to claim
     */
    async addClaimMessage(claimId, message) {
        try {
            console.log(`🚀 API Request: POST /claims/${claimId}/messages`);
            const response = await api.post(`/claims/${claimId}/messages`, {
                message
            });
            console.log('✅ API Response:', response.status);
            return response.data;
        } catch (error) {
            console.error('❌ Add message error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get claim messages
     */
    async getClaimMessages(claimId) {
        try {
            console.log(`🚀 API Request: GET /claims/${claimId}/messages`);
            const response = await api.get(`/claims/${claimId}/messages`);
            console.log('✅ API Response:', response.status);
            return response.data;
        } catch (error) {
            console.error('❌ Get messages error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Upload claim evidence
     */
    async uploadEvidence(claimId, fileData) {
        try {
            console.log(`🚀 API Request: POST /claims/${claimId}/evidence`);

            const formData = new FormData();
            formData.append('file', {
                uri: fileData.uri,
                type: fileData.type || 'application/pdf',
                name: fileData.name || 'evidence.pdf'
            });

            if (fileData.description) {
                formData.append('description', fileData.description);
            }

            if (fileData.file_type) {
                formData.append('file_type', fileData.file_type);
            }

            const response = await api.post(`/claims/${claimId}/evidence`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('✅ API Response:', response.status);
            return response.data;
        } catch (error) {
            console.error('❌ Upload evidence error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get claim evidence
     */
    async getClaimEvidence(claimId) {
        try {
            console.log(`🚀 API Request: GET /claims/${claimId}/evidence`);
            const response = await api.get(`/claims/${claimId}/evidence`);
            console.log('✅ API Response:', response.status);
            return response.data;
        } catch (error) {
            console.error('❌ Get evidence error:', error.response?.data || error.message);
            throw error;
        }
    }

    async closeClaim(claimId) {
        try {
            console.log(`🚀 API Request: PUT /claims/${claimId}/close`);
            const response = await api.put(`/claims/${claimId}/close`);
            console.log('✅ API Response:', response.status);
            return response.data;
        } catch (error) {
            console.error('❌ Close claim error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Update claim with seller's response (accept/decline/negotiate)
     */
    async updateClaimSellerResponse(claimId, response, decision) {
        try {
            console.log(`🚀 API Request: POST /claims/${claimId}/seller-response`);
            const res = await api.post(`/claims/${claimId}/seller-response`, {
                response,
                decision
            });
            console.log('✅ API Response:', res.status);
            return res.data;
        } catch (error) {
            console.error('❌ Seller response error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Submit per-user negotiation decision
     */
    async submitNegotiationDecision(claimId, decision) {
        try {
            console.log(`🚀 API Request: POST /claims/${claimId}/submit-negotiation-decision`);
            const res = await api.post(`/claims/${claimId}/submit-negotiation-decision`, {
                decision
            });
            console.log('✅ API Response:', res.status);
            return res.data;
        } catch (error) {
            console.error('❌ Submit decision error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Submit negotiation suggestion
     */
    async submitNegotiationSuggestion(claimId, suggestion) {
        try {
            console.log(`🚀 API Request: POST /claims/${claimId}/submit-negotiation-suggestion`);
            const res = await api.post(`/claims/${claimId}/submit-negotiation-suggestion`, {
                suggestion
            });
            console.log('✅ API Response:', res.status);
            return res.data;
        } catch (error) {
            console.error('❌ Submit suggestion error:', error.response?.data || error.message);
            throw error;
        }
    }
}

export default new ClaimService();
