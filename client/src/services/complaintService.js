import api from './api';

export const complaintService = {
  // Student operations
  createComplaint: async (formData) => {
    const response = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getMyComplaints: async (params = {}) => {
    const response = await api.get('/complaints/my', { params });
    return response.data;
  },

  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  closeComplaint: async (id, data = {}) => {
    const response = await api.patch(`/complaints/${id}/close`, data);
    return response.data;
  },

  reopenComplaint: async (id, reason) => {
    const response = await api.patch(`/complaints/${id}/reopen`, { reason });
    return response.data;
  },

  submitFeedback: async (id, data) => {
    const response = await api.post(`/complaints/${id}/feedback`, data);
    return response.data;
  },

  // Admin & Staff operations
  getAllComplaints: async (params = {}) => {
    const response = await api.get('/admin/complaints', { params });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  assignDepartmentAndStaff: async (id, data) => {
    const response = await api.patch(`/admin/complaints/${id}/assign`, data);
    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.patch(`/admin/complaints/${id}/status`, data);
    return response.data;
  },

  updatePriority: async (id, priority) => {
    const response = await api.patch(`/admin/complaints/${id}/priority`, { priority });
    return response.data;
  },

  resolveComplaint: async (id, formData) => {
    const response = await api.patch(`/admin/complaints/${id}/resolve`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Comments
  getComments: async (complaintId) => {
    const response = await api.get(`/complaints/${complaintId}/comments`);
    return response.data;
  },

  addComment: async (complaintId, formData) => {
    const response = await api.post(`/complaints/${complaintId}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Staff management (Admin)
  getAllStaff: async () => {
    const response = await api.get('/admin/staff');
    return response.data;
  },

  createStaff: async (data) => {
    const response = await api.post('/admin/staff', data);
    return response.data;
  },

  updateStaff: async (id, data) => {
    const response = await api.put(`/admin/staff/${id}`, data);
    return response.data;
  },
};
