import api from './api';

export const adminService = {
  getDashboardStats: () => api.get('/admin/stats'),
  getPendingVerifications: (params) => api.get('/admin/verifications', { params }),
  getVerificationDetail: (userId) => api.get(`/admin/verifications/${userId}`),
  getVerificationDocument: (userId) => api.get(`/admin/verifications/${userId}/document`, { responseType: 'blob' }),
  reviewVerification: (userId, data) => api.post(`/admin/verifications/${userId}/review`, data),
  getReports: (params) => api.get('/admin/reports', { params }),
  reviewReport: (reportId, data) => api.post(`/admin/reports/${reportId}/review`, data),
  getFlaggedUsers: (params) => api.get('/admin/flagged-users', { params }),
  updateUserStatus: (userId, data) => api.put(`/admin/users/${userId}/status`, data),
  getAdminLogs: (params) => api.get('/admin/logs', { params }),
  getNews: () => api.get('/admin/news'),
  createNews: (data) => api.post('/admin/news', data),
  updateNews: (id, data) => api.put(`/admin/news/${id}`, data),
  deleteNews: (id) => api.delete(`/admin/news/${id}`),
};
