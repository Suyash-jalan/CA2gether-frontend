import api from './api';

export const safetyService = {
  blockUser: (userId) => api.post(`/safety/block/${userId}`),
  unblockUser: (userId) => api.delete(`/safety/block/${userId}`),
  getBlockedUsers: () => api.get('/safety/blocked'),
  reportUser: (userId, data) => api.post(`/safety/report/${userId}`, data),
};
